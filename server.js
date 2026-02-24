require('dotenv').config();
const express = require('express');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const htmlPdf = require('html-pdf-node');
const SSE = require('express-sse');
const supabase = require('./supabaseClient');
const { generateFormPDF } = require('./pdfTemplate');

const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'ameco_jwt_secret_local';

// SSE instances for real-time updates
const workerSSE = new SSE();
const supervisorSSE = new SSE();
const operationsManagerSSE = new SSE();
const ohsemSSE = new SSE();

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' })); // Increased limit for base64 signatures
app.use(express.static('public'));

// JWT middleware
const authenticateToken = (req, res, next) => {
  // Try to get token from Authorization header first
  const authHeader = req.headers['authorization'];
  let token = authHeader && authHeader.split(' ')[1];
  
  // If no token in header, try query parameter (for SSE connections)
  if (!token) {
    token = req.query.token;
  }

  if (!token) {
    return res.sendStatus(401);
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
};

// ============================================
// AUTHENTICATION ROUTES
// ============================================

app.post('/api/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    console.log('Intento de login:', { username, password: '***' });
    
    // Query user from Supabase
    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('username', username)
      .single();

    console.log('Usuario encontrado:', user ? { id: user.id, username: user.username, role: user.role } : 'No encontrado');
    console.log('Error de Supabase:', error);

    if (error || !user || user.password !== password) {
      console.log('Login fallido - Credenciales inválidas');
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    const token = jwt.sign(
      { id: user.id, username: user.username, role: user.role, name: user.name },
      JWT_SECRET,
      { expiresIn: '8h' }
    );

    console.log('Login exitoso para:', user.username);

    // Check if user is critical role and needs password change
    const isCriticalRole = ['supervisor', 'operations_manager', 'ohsem'].includes(user.role);
    const requiresPasswordChange = isCriticalRole && !user.first_login_completed;

    res.json({ 
      token, 
      user: { 
        id: user.id, 
        username: user.username, 
        role: user.role, 
        name: user.name,
        shift: user.shift,
        requiresPasswordChange: requiresPasswordChange
      } 
    });
  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).json({ error: 'Error del servidor' });
  }
});

// Helper function to validate password strength
function validatePassword(password) {
  const minLength = 8;
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

  const errors = [];
  if (password.length < minLength) {
    errors.push(`Mínimo ${minLength} caracteres`);
  }
  if (!hasUpperCase) {
    errors.push('Al menos una mayúscula');
  }
  if (!hasLowerCase) {
    errors.push('Al menos una minúscula');
  }
  if (!hasNumber) {
    errors.push('Al menos un número');
  }
  if (!hasSpecialChar) {
    errors.push('Al menos un carácter especial (!@#$%^&*...)');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

// Change password endpoint (only for critical roles)
app.post('/api/change-password', authenticateToken, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: 'Se requiere contraseña actual y nueva contraseña' });
    }

    // Verify user is critical role
    const isCriticalRole = ['supervisor', 'operations_manager', 'ohsem'].includes(req.user.role);
    if (!isCriticalRole) {
      return res.status(403).json({ error: 'Solo roles críticos pueden cambiar contraseña' });
    }

    // Get user from database
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('id', req.user.id)
      .single();

    if (userError || !user) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    // Verify current password
    if (user.password !== currentPassword) {
      return res.status(401).json({ error: 'Contraseña actual incorrecta' });
    }

    // Validate new password
    const validation = validatePassword(newPassword);
    if (!validation.isValid) {
      return res.status(400).json({ 
        error: 'La nueva contraseña no cumple los requisitos',
        requirements: validation.errors
      });
    }

    // Check that new password is different from default
    const defaultPassword = 'Ameco@2025';
    if (newPassword === defaultPassword) {
      return res.status(400).json({ 
        error: 'La nueva contraseña no puede ser la contraseña por defecto'
      });
    }

    // Check that new password is different from current
    if (newPassword === currentPassword) {
      return res.status(400).json({ 
        error: 'La nueva contraseña debe ser diferente de la actual'
      });
    }

    // Update password
    const { error: updateError } = await supabase
      .from('users')
      .update({
        password: newPassword,
        first_login_completed: true,
        password_changed_at: new Date().toISOString()
      })
      .eq('id', req.user.id);

    if (updateError) throw updateError;

    res.json({ 
      message: 'Contraseña cambiada exitosamente',
      success: true
    });
  } catch (error) {
    console.error('Error changing password:', error);
    res.status(500).json({ error: 'Error del servidor' });
  }
});

// ============================================
// SHIFT ROUTES
// ============================================

// Get current shift for user
app.get('/api/shift/current', authenticateToken, async (req, res) => {
  try {
    // Prevent caching
    res.set('Cache-Control', 'no-store, no-cache, must-revalidate, private');
    res.set('Pragma', 'no-cache');
    res.set('Expires', '0');
    
    // OHSEM and Operations Manager users don't have shifts (they can see both)
    if (req.user.role === 'ohsem' || req.user.role === 'operations_manager') {
      return res.json({ message: 'User can access both shifts' });
    }

    // Query most recent shift (active OR completed)
    const { data: shifts, error } = await supabase
      .from('shifts')
      .select('*')
      .eq('user_id', req.user.id)
      .order('created_at', { ascending: false })
      .limit(1);

    if (error) throw error;

    let currentShift = shifts && shifts.length > 0 ? shifts[0] : null;

    // If no shift exists at all, create first one
    if (!currentShift) {
      const { data: newShift, error: insertError } = await supabase
        .from('shifts')
        .insert([{
          user_id: req.user.id,
          shift_number: 1,
          status: 'active',
          start_date: new Date().toISOString().split('T')[0] // YYYY-MM-DD
        }])
        .select()
        .single();

      if (insertError) throw insertError;
      currentShift = newShift;
    }

    // Calculate current day based on start_date
    // Parse dates correctly without timezone conversion
    const startDateStr = currentShift.start_date.split('T')[0]; // Get YYYY-MM-DD
    const todayStr = new Date().toISOString().split('T')[0]; // Get YYYY-MM-DD
    
    const startDate = new Date(startDateStr + 'T12:00:00'); // Noon to avoid timezone issues
    const today = new Date(todayStr + 'T12:00:00');
    
    const daysDiff = Math.floor((today - startDate) / (1000 * 60 * 60 * 24));
    const currentDay = daysDiff + 1; // Day 1 is the start_date
    
    console.log('=== CÁLCULO DE DÍA ACTUAL ===');
    console.log('User:', req.user.username);
    console.log('start_date:', currentShift.start_date);
    console.log('startDateStr:', startDateStr);
    console.log('todayStr:', todayStr);
    console.log('daysDiff:', daysDiff);
    console.log('currentDay:', currentDay);
    console.log('=============================');
    
    // Check if user is in rest period (days 11-20)
    if (currentDay > 10 && currentDay <= 20) {
      // User is in rest period
      console.log('Usuario en período de descanso (día 11-20)');
      currentShift.current_day = 0; // 0 means "in rest"
      currentShift.in_rest = true;
      currentShift.rest_days_remaining = 20 - daysDiff; // Days until next shift
      // Next shift starts on day 21 (20 days after start_date)
      currentShift.next_shift_start = new Date(startDate.getTime() + (20 * 24 * 60 * 60 * 1000)).toISOString().split('T')[0];
      
      // Mark shift as completed if still active
      if (currentShift.status === 'active') {
        await supabase
          .from('shifts')
          .update({ status: 'completed', completed_at: new Date().toISOString() })
          .eq('id', currentShift.id);
        currentShift.status = 'completed';
      }
    } else if (currentDay > 20) {
      // User completed full cycle (20 days), create new shift
      console.log('Usuario completó ciclo (día > 20), creando nuevo turno...');
      
      // Complete old shift if still active
      if (currentShift.status === 'active') {
        await supabase
          .from('shifts')
          .update({ status: 'completed', completed_at: new Date().toISOString() })
          .eq('id', currentShift.id);
      }
      
      // Get next shift number
      const { data: allShifts } = await supabase
        .from('shifts')
        .select('shift_number')
        .eq('user_id', req.user.id)
        .order('shift_number', { ascending: false })
        .limit(1);

      const nextShiftNumber = allShifts && allShifts.length > 0 ? allShifts[0].shift_number + 1 : 1;

      // Create new shift starting today
      const { data: newShift, error: insertError } = await supabase
        .from('shifts')
        .insert([{
          user_id: req.user.id,
          shift_number: nextShiftNumber,
          status: 'active',
          start_date: todayStr
        }])
        .select()
        .single();

      if (insertError) throw insertError;
      currentShift = newShift;
      
      // Recalculate for new shift (will be day 1)
      currentShift.current_day = 1;
      currentShift.in_rest = false;
      
      console.log('Nuevo turno creado:', currentShift.shift_number);
    } else {
      // User is in active work period (days 1-10)
      console.log('Usuario en período de trabajo (día 1-10)');
      currentShift.current_day = Math.min(Math.max(currentDay, 1), 10); // Clamp between 1-10
      currentShift.in_rest = false;
      
      // Ensure shift is marked as active
      if (currentShift.status !== 'active') {
        await supabase
          .from('shifts')
          .update({ status: 'active' })
          .eq('id', currentShift.id);
        currentShift.status = 'active';
      }
    }

    res.json(currentShift);
  } catch (error) {
    console.error('Error getting current shift:', error);
    res.status(500).json({ error: 'Error del servidor' });
  }
});

// Get shift data (all days)
app.get('/api/shift/:shiftId/data', authenticateToken, async (req, res) => {
  try {
    // Prevent caching
    res.set('Cache-Control', 'no-store, no-cache, must-revalidate, private');
    res.set('Pragma', 'no-cache');
    res.set('Expires', '0');
    
    const { shiftId } = req.params;
    
    const { data: shiftData, error } = await supabase
      .from('daily_forms')
      .select('*')
      .eq('shift_id', shiftId)
      .order('day_number', { ascending: true });

    if (error) throw error;

    res.json(shiftData || []);
  } catch (error) {
    console.error('Error getting shift data:', error);
    res.status(500).json({ error: 'Error del servidor' });
  }
});

// Get specific day details
app.get('/api/shift/:shiftId/day/:dayNumber', authenticateToken, async (req, res) => {
  try {
    const { shiftId, dayNumber } = req.params;
    
    const { data: dayForm, error } = await supabase
      .from('daily_forms')
      .select('*')
      .eq('shift_id', shiftId)
      .eq('day_number', dayNumber)
      .single();

    if (error && error.code !== 'PGRST116') throw error; // PGRST116 = not found
    
    if (!dayForm) {
      return res.status(404).json({ error: 'Formulario no encontrado' });
    }

    // Get shift info with user data
    const { data: shift } = await supabase
      .from('shifts')
      .select(`
        shift_number,
        user_id,
        users!inner(
          id,
          name,
          role
        )
      `)
      .eq('id', shiftId)
      .single();
    
    // Get digital signatures for all involved parties
    const signatures = {};
    
    // Get worker signature (from shift user)
    if (shift?.user_id) {
      const { data: workerSig } = await supabase
        .from('digital_signatures')
        .select('signature_data')
        .eq('user_id', shift.user_id)
        .single();
      
      if (workerSig) {
        signatures.worker_signature = workerSig.signature_data;
      }
    }
    
    // Get supervisor signature (if signed)
    if (dayForm.supervisor_signed && dayForm.supervisor_signature_id) {
      const { data: supervisorSig } = await supabase
        .from('digital_signatures')
        .select('signature_data')
        .eq('user_id', dayForm.supervisor_signature_id)
        .single();
      
      if (supervisorSig) {
        signatures.supervisor_signature = supervisorSig.signature_data;
      }
    }
    
    // Get operations manager signature (if signed)
    if (dayForm.operations_manager_signed && dayForm.operations_manager_signature_id) {
      const { data: omSig } = await supabase
        .from('digital_signatures')
        .select('signature_data')
        .eq('user_id', dayForm.operations_manager_signature_id)
        .single();
      
      if (omSig) {
        signatures.operations_manager_signature = omSig.signature_data;
      }
    }
    
    // Get OHSEM signature (if signed)
    if (dayForm.ohsem_signed && dayForm.ohsem_signature_id) {
      const { data: ohsemSig } = await supabase
        .from('digital_signatures')
        .select('signature_data')
        .eq('user_id', dayForm.ohsem_signature_id)
        .single();
      
      if (ohsemSig) {
        signatures.ohsem_signature = ohsemSig.signature_data;
      }
    }
    
    res.json({
      ...dayForm,
      shift_number: shift?.shift_number || 1,
      user_role: shift?.users?.role,
      signatures
    });
  } catch (error) {
    console.error('Error getting day details:', error);
    res.status(500).json({ error: 'Error del servidor' });
  }
});

// Save daily form
app.post('/api/shift/:shiftId/day/:dayNumber', authenticateToken, async (req, res) => {
  try {
    const { shiftId, dayNumber } = req.params;
    const { formData } = req.body;

    // Verify shift belongs to user
    const { data: currentShift, error: shiftError } = await supabase
      .from('shifts')
      .select('*')
      .eq('id', shiftId)
      .eq('user_id', req.user.id)
      .single();

    if (shiftError || !currentShift) {
      return res.status(404).json({ error: 'Turno no encontrado' });
    }

    // Calculate current day based on start_date
    // Parse dates correctly without timezone conversion
    const startDateStr = currentShift.start_date.split('T')[0]; // Get YYYY-MM-DD
    const currentDateStr = new Date().toISOString().split('T')[0]; // Get YYYY-MM-DD
    
    const startDate = new Date(startDateStr + 'T12:00:00'); // Noon to avoid timezone issues
    const today = new Date(currentDateStr + 'T12:00:00');
    
    const daysDiff = Math.floor((today - startDate) / (1000 * 60 * 60 * 24));
    const currentDay = daysDiff + 1; // Day 1 is the start_date
    const validDay = Math.min(Math.max(currentDay, 1), 10); // Clamp between 1-10

    // Validate day number matches current day
    if (parseInt(dayNumber) !== validDay) {
      return res.status(403).json({ 
        error: `Solo puede completar el formulario del Día ${validDay}. Hoy es el día ${validDay} de su turno.`,
        currentDay: validDay
      });
    }

    // Verify shift is active
    if (currentShift.status !== 'active') {
      return res.status(403).json({ error: 'Este turno ya ha sido completado' });
    }

    // Check if user already has a completed checklist for today
    const todayStr = new Date().toISOString().split('T')[0];
    const { data: existingForms } = await supabase
      .from('daily_forms')
      .select('*')
      .eq('shift_id', shiftId)
      .eq('worker_signed', true)
      .gte('created_at', `${todayStr}T00:00:00`)
      .lte('created_at', `${todayStr}T23:59:59`);

    if (existingForms && existingForms.length > 0) {
      return res.status(403).json({ 
        error: 'USTED YA HA REALIZADO SU CHECKLIST HOY. Solo se permite un checklist por día.',
        alreadyCompleted: true
      });
    }

    // Check if form exists
    const { data: existingForm } = await supabase
      .from('daily_forms')
      .select('*')
      .eq('shift_id', shiftId)
      .eq('day_number', dayNumber)
      .single();

    if (existingForm) {
      // Update existing
      const { data: updatedForm, error: updateError } = await supabase
        .from('daily_forms')
        .update({
          form_data: formData,
          worker_signed: true,
          updated_at: new Date().toISOString()
        })
        .eq('id', existingForm.id)
        .select()
        .single();

      if (updateError) throw updateError;
      
      // Check for health issues (any "si" except first mandatory question)
      const healthIssuesResult = checkForHealthIssues(formData);
      
      // Notify supervisors in real-time
      notifyNewOrder('worker');
      
      // If health issues detected, send special alert
      if (healthIssuesResult.hasIssues) {
        notifyHealthAlert(shiftId, dayNumber, req.user.name);
      }
      
      res.json(updatedForm);
    } else {
      // Create new
      const { data: newForm, error: insertError } = await supabase
        .from('daily_forms')
        .insert([{
          shift_id: parseInt(shiftId),
          day_number: parseInt(dayNumber),
          form_data: formData,
          worker_signed: true
        }])
        .select()
        .single();

      if (insertError) throw insertError;
      
      // Check for health issues (any "si" except first mandatory question)
      const healthIssuesResult = checkForHealthIssues(formData);
      
      // Notify supervisors in real-time
      notifyNewOrder('worker');
      
      // If health issues detected, send special alert
      if (healthIssuesResult.hasIssues) {
        notifyHealthAlert(shiftId, dayNumber, req.user.name);
      }
      
      res.json(newForm);
    }
  } catch (error) {
    console.error('Error saving daily form:', error);
    res.status(500).json({ error: 'Error del servidor' });
  }
});

// Complete shift
app.post('/api/shift/:shiftId/complete', authenticateToken, async (req, res) => {
  try {
    const { shiftId } = req.params;
    const { supervisorSignature } = req.body;

    const { error } = await supabase
      .from('shifts')
      .update({
        status: 'completed',
        supervisor_signature: supervisorSignature,
        completed_at: new Date().toISOString()
      })
      .eq('id', shiftId);

    if (error) throw error;

    res.json({ message: 'Turno completado exitosamente' });
  } catch (error) {
    console.error('Error completing shift:', error);
    res.status(500).json({ error: 'Error del servidor' });
  }
});

// Get supervisors
app.get('/api/supervisors', authenticateToken, async (req, res) => {
  try {
    const { data: supervisors, error } = await supabase
      .from('users')
      .select('id, name, username')
      .eq('role', 'supervisor');

    if (error) throw error;

    res.json(supervisors || []);
  } catch (error) {
    console.error('Error getting supervisors:', error);
    res.status(500).json({ error: 'Error del servidor' });
  }
});

console.log('Servidor corriendo en puerto ' + PORT);
app.listen(PORT);

// ============================================
// SUPERVISOR ROUTES
// ============================================

// Get all orders for supervisor review
app.get('/api/supervisor/orders', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'supervisor') {
      return res.status(403).json({ error: 'Acceso denegado. Solo supervisores.' });
    }

    // Get all daily forms with shift and user info
    const { data: forms, error } = await supabase
      .from('daily_forms')
      .select(`
        *,
        shifts!inner(
          user_id,
          shift_number,
          users!inner(
            id,
            name,
            role
          )
        )
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;

    // Filter worker forms and add user info
    const workerForms = (forms || [])
      .filter(form => form.shifts?.users?.role === 'worker')
      .map(form => ({
        ...form,
        shift_number: form.shifts?.shift_number || 1,
        worker_id: form.shifts?.users?.id,
        worker_name: form.shifts?.users?.name || 'Usuario desconocido',
        supervisor_signed: form.supervisor_signed || false
      }))
      .filter(order => order.worker_id);

    res.json(workerForms);
  } catch (error) {
    console.error('Error getting supervisor orders:', error);
    res.status(500).json({ error: 'Error del servidor' });
  }
});

// Get workers list for supervisor
app.get('/api/supervisor/workers', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'supervisor') {
      return res.status(403).json({ error: 'Acceso denegado. Solo supervisores.' });
    }

    const { data: workers, error } = await supabase
      .from('users')
      .select('id, name, username')
      .eq('role', 'worker');

    if (error) throw error;

    res.json(workers || []);
  } catch (error) {
    console.error('Error getting workers:', error);
    res.status(500).json({ error: 'Error del servidor' });
  }
});

// Sign an order as supervisor
app.post('/api/supervisor/sign/:shiftId/:dayNumber', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'supervisor') {
      return res.status(403).json({ error: 'Acceso denegado. Solo supervisores.' });
    }

    const { shiftId, dayNumber } = req.params;
    const { requiresDerivation } = req.body; // Recibir la respuesta del supervisor
    
    // Verificar que el trabajador ya firmó
    const { data: existingForm } = await supabase
      .from('daily_forms')
      .select('worker_signed')
      .eq('shift_id', shiftId)
      .eq('day_number', dayNumber)
      .single();
    
    if (!existingForm?.worker_signed) {
      return res.status(400).json({ error: 'El trabajador debe firmar primero' });
    }
    
    // Validar que el supervisor haya marcado la derivación
    if (!requiresDerivation || (requiresDerivation !== 'si' && requiresDerivation !== 'no')) {
      return res.status(400).json({ error: 'Debe marcar si requiere derivación (Sí o No)' });
    }
    
    const { data: updatedForm, error } = await supabase
      .from('daily_forms')
      .update({
        supervisor_signed: true,
        supervisor_signature: req.user.name,
        supervisor_signature_id: req.user.id,
        supervisor_requires_derivation: requiresDerivation, // Guardar respuesta del supervisor
        signed_at: new Date().toISOString()
      })
      .eq('shift_id', shiftId)
      .eq('day_number', dayNumber)
      .select()
      .single();

    if (error) throw error;

    if (!updatedForm) {
      return res.status(404).json({ error: 'Formulario no encontrado' });
    }

    // Notify OHSEM in real-time
    notifyOrderSigned('worker');

    res.json({ 
      message: 'Orden firmada exitosamente',
      signedBy: req.user.name,
      signedAt: updatedForm.signed_at,
      requiresDerivation: requiresDerivation
    });
  } catch (error) {
    console.error('Error signing order:', error);
    res.status(500).json({ error: 'Error del servidor' });
  }
});

// Mass sign orders as supervisor
app.post('/api/supervisor/sign-all', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'supervisor') {
      return res.status(403).json({ error: 'Acceso denegado. Solo supervisores.' });
    }

    // Get all pending worker forms
    const { data: pendingForms, error: fetchError } = await supabase
      .from('daily_forms')
      .select(`
        *,
        shifts!inner(
          user_id,
          users!inner(role)
        )
      `)
      .eq('worker_signed', true)
      .eq('supervisor_signed', false);

    if (fetchError) throw fetchError;

    const workerForms = (pendingForms || []).filter(form => 
      form.shifts?.users?.role === 'worker'
    );

    if (workerForms.length === 0) {
      return res.status(404).json({ error: 'No hay órdenes pendientes para firmar' });
    }

    const formIds = workerForms.map(f => f.id);
    const { error: updateError } = await supabase
      .from('daily_forms')
      .update({
        supervisor_signed: true,
        supervisor_signature_id: req.user.id,
        signed_at: new Date().toISOString()
      })
      .in('id', formIds);

    if (updateError) throw updateError;

    // Notify OHSEM and Operations Manager in real-time
    notifyOrderSigned('worker');

    res.json({ 
      message: `${formIds.length} órdenes firmadas exitosamente`,
      signedCount: formIds.length,
      signedBy: req.user.name
    });
  } catch (error) {
    console.error('Error mass signing orders:', error);
    res.status(500).json({ error: 'Error del servidor' });
  }
});

// Mark all pending forms as "NO requiere derivación"
app.post('/api/supervisor/mark-all-derivation-no', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'supervisor') {
      return res.status(403).json({ error: 'Acceso denegado. Solo supervisores.' });
    }

    // Get all pending worker forms (not signed by supervisor yet)
    const { data: pendingForms, error: fetchError } = await supabase
      .from('daily_forms')
      .select(`
        *,
        shifts!inner(
          user_id,
          users!inner(role, name)
        )
      `)
      .eq('worker_signed', true)
      .eq('supervisor_signed', false);

    if (fetchError) throw fetchError;

    const workerForms = (pendingForms || []).filter(form => 
      form.shifts?.users?.role === 'worker'
    );

    if (workerForms.length === 0) {
      return res.status(404).json({ error: 'No hay formularios pendientes' });
    }

    // Filtrar solo formularios que están en "pending" o "no" (excluir los que ya tienen "si")
    const formsToUpdate = workerForms.filter(form => 
      form.supervisor_requires_derivation !== 'si'
    );

    if (formsToUpdate.length === 0) {
      return res.status(404).json({ error: 'No hay formularios pendientes para marcar. Los formularios con derivación "SÍ" no se pueden modificar.' });
    }

    // Verificar si algún formulario tiene problemas de salud Y aún NO ha sido derivado
    const formsWithHealthIssues = [];
    for (const form of formsToUpdate) {
      // Solo verificar si está en estado "pending" (no ha sido derivado)
      if (form.supervisor_requires_derivation === 'pending' || !form.supervisor_requires_derivation) {
        if (form.form_data) {
          const formData = typeof form.form_data === 'string' 
            ? JSON.parse(form.form_data) 
            : form.form_data;
          
          const healthIssuesResult = checkForHealthIssues(formData);
          if (healthIssuesResult.hasIssues) {
            formsWithHealthIssues.push({
              worker_name: form.shifts?.users?.name || 'Desconocido',
              day_number: form.day_number,
              issues: healthIssuesResult.details
            });
          }
        }
      }
    }

    // Si hay formularios con problemas de salud que AÚN NO han sido derivados, rechazar
    if (formsWithHealthIssues.length > 0) {
      return res.status(400).json({ 
        error: `No se puede marcar todos como "NO" porque ${formsWithHealthIssues.length} formulario(s) tienen problemas de salud que aún no han sido derivados`,
        formsWithIssues: formsWithHealthIssues
      });
    }

    // Mark only filtered forms as "NO requiere derivación"
    const formIds = formsToUpdate.map(f => f.id);
    const { error: updateError } = await supabase
      .from('daily_forms')
      .update({
        supervisor_requires_derivation: 'no',
        supervisor_derivation_note: null
      })
      .in('id', formIds);

    if (updateError) throw updateError;

    const skippedCount = workerForms.length - formsToUpdate.length;
    let message = `${formIds.length} formularios marcados como "NO requiere derivación"`;
    if (skippedCount > 0) {
      message += `. ${skippedCount} formulario(s) con derivación "SÍ" no fueron modificados.`;
    }

    res.json({ 
      message,
      updatedCount: formIds.length,
      skippedCount
    });
  } catch (error) {
    console.error('Error marking all derivation no:', error);
    res.status(500).json({ error: 'Error del servidor' });
  }
});

// Set derivation status for a specific form
app.post('/api/supervisor/set-derivation/:shiftId/:dayNumber', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'supervisor') {
      return res.status(403).json({ error: 'Acceso denegado. Solo supervisores.' });
    }

    const { shiftId, dayNumber } = req.params;
    const { requires_derivation, derivation_note } = req.body;

    // Validar que si es "si", debe tener nota
    if (requires_derivation === 'si' && (!derivation_note || derivation_note.trim() === '')) {
      return res.status(400).json({ error: 'Debe proporcionar una nota cuando marca "SÍ requiere derivación"' });
    }

    // Obtener el formulario para verificar estado actual
    const { data: existingForm, error: fetchError } = await supabase
      .from('daily_forms')
      .select('form_data, supervisor_requires_derivation, derivation_reviewed')
      .eq('shift_id', shiftId)
      .eq('day_number', dayNumber)
      .single();

    if (fetchError) throw fetchError;

    const currentStatus = existingForm?.supervisor_requires_derivation || 'pending';
    
    // Si ya fue derivado (status = 'si'), NO permitir cambios hasta que Prevención revise
    if (currentStatus === 'si' && !existingForm?.derivation_reviewed) {
      return res.status(403).json({ 
        error: 'Este formulario ya fue derivado a Prevención. No puede modificar el estado hasta que sea revisado por el equipo de Prevención de Riesgos.'
      });
    }

    // Solo validar problemas de salud si está en estado "pending" (primera vez)
    if (currentStatus === 'pending' && existingForm?.form_data) {
      const formData = typeof existingForm.form_data === 'string' 
        ? JSON.parse(existingForm.form_data) 
        : existingForm.form_data;
      
      const healthIssuesResult = checkForHealthIssues(formData);
      
      // Si hay problemas de salud y el supervisor intenta marcar "NO" por primera vez, rechazar
      if (healthIssuesResult.hasIssues && requires_derivation === 'no') {
        return res.status(400).json({ 
          error: 'No puede marcar "NO requiere derivación" porque el trabajador marcó "SÍ" en preguntas de salud',
          healthIssues: healthIssuesResult.details
        });
      }
    }

    // Update the form
    const { data: updatedForm, error: updateError } = await supabase
      .from('daily_forms')
      .update({
        supervisor_requires_derivation: requires_derivation,
        supervisor_derivation_note: requires_derivation === 'si' ? derivation_note : null
      })
      .eq('shift_id', shiftId)
      .eq('day_number', dayNumber)
      .select()
      .single();

    if (updateError) throw updateError;

    // Si marcó "SÍ", notificar a prevencionistas
    if (requires_derivation === 'si') {
      notifyDerivationRequired(shiftId, dayNumber);
    }

    res.json({ 
      message: 'Estado de derivación actualizado correctamente',
      form: updatedForm
    });
  } catch (error) {
    console.error('Error setting derivation status:', error);
    res.status(500).json({ error: 'Error del servidor' });
  }
});

// ============================================
// OPERATIONS MANAGER ROUTES
// ============================================

// Get all orders for operations manager review (supervisor forms)
app.get('/api/operations-manager/orders', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'operations_manager') {
      return res.status(403).json({ error: 'Acceso denegado. Solo jefe de operaciones.' });
    }

    // Get all daily forms from supervisors with shift and user info
    const { data: forms, error } = await supabase
      .from('daily_forms')
      .select(`
        *,
        shifts!inner(
          user_id,
          shift_number,
          users!inner(
            id,
            name,
            role
          )
        )
      `);

    if (error) throw error;

    // Filter supervisor forms
    const supervisorForms = (forms || [])
      .filter(form => form.shifts?.users?.role === 'supervisor')
      .map(form => ({
        ...form,
        shift_number: form.shifts?.shift_number || 1,
        supervisor_id: form.shifts?.users?.id,
        supervisor_name: form.shifts?.users?.name || 'Supervisor desconocido',
        operations_manager_signed: form.operations_manager_signed || false
      }));

    res.json(supervisorForms);
  } catch (error) {
    console.error('Error getting operations manager orders:', error);
    res.status(500).json({ error: 'Error del servidor' });
  }
});

// Get supervisors list for operations manager
app.get('/api/operations-manager/supervisors', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'operations_manager') {
      return res.status(403).json({ error: 'Acceso denegado. Solo jefe de operaciones.' });
    }

    const { data: supervisors, error } = await supabase
      .from('users')
      .select('id, name, username')
      .eq('role', 'supervisor');

    if (error) throw error;

    res.json(supervisors || []);
  } catch (error) {
    console.error('Error getting supervisors:', error);
    res.status(500).json({ error: 'Error del servidor' });
  }
});

// Sign a supervisor order as operations manager
app.post('/api/operations-manager/sign/:shiftId/:dayNumber', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'operations_manager') {
      return res.status(403).json({ error: 'Acceso denegado. Solo jefe de operaciones.' });
    }

    const { shiftId, dayNumber } = req.params;
    
    // Verify it's a supervisor's form
    const { data: shift } = await supabase
      .from('shifts')
      .select('users!inner(role)')
      .eq('id', shiftId)
      .single();

    if (!shift || shift.users?.role !== 'supervisor') {
      return res.status(403).json({ error: 'Solo se pueden firmar formularios de supervisores' });
    }

    // Verificar que el supervisor ya firmó
    const { data: existingForm } = await supabase
      .from('daily_forms')
      .select('supervisor_signed')
      .eq('shift_id', shiftId)
      .eq('day_number', dayNumber)
      .single();
    
    if (!existingForm?.supervisor_signed) {
      return res.status(400).json({ error: 'El supervisor debe firmar primero' });
    }

    const { data: updatedForm, error } = await supabase
      .from('daily_forms')
      .update({
        operations_manager_signed: true,
        operations_manager_signature: req.user.name,
        operations_manager_signature_id: req.user.id,
        operations_manager_signed_at: new Date().toISOString()
      })
      .eq('shift_id', shiftId)
      .eq('day_number', dayNumber)
      .select()
      .single();

    if (error) throw error;

    if (!updatedForm) {
      return res.status(404).json({ error: 'Formulario no encontrado' });
    }

    // Notify OHSEM in real-time
    notifyOrderSigned('supervisor');

    res.json({ 
      message: 'Orden firmada exitosamente por Jefe de Operaciones',
      signedBy: req.user.name,
      signedAt: updatedForm.operations_manager_signed_at
    });
  } catch (error) {
    console.error('Error signing order as operations manager:', error);
    res.status(500).json({ error: 'Error del servidor' });
  }
});

// ============================================
// OHSEM ROUTES
// ============================================

// Get all orders for OHSEM review (workers + supervisors from BOTH shifts)
app.get('/api/ohsem/orders', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'ohsem') {
      return res.status(403).json({ error: 'Acceso denegado. Solo profesionales OHSEM.' });
    }

    // Get all daily forms with shift and user info
    // SOLO mostrar formularios de trabajadores que requieren derivación
    const { data: forms, error } = await supabase
      .from('daily_forms')
      .select(`
        *,
        shifts!inner(
          user_id,
          shift_number,
          users!inner(
            id,
            name,
            role,
            shift
          )
        )
      `)
      .eq('supervisor_requires_derivation', 'si'); // SOLO los que requieren derivación

    if (error) throw error;

    // Filter worker forms that are signed by supervisor and require derivation
    const validForms = (forms || [])
      .filter(form => {
        const userRole = form.shifts?.users?.role;
        // Solo formularios de trabajadores que están firmados por supervisor
        return userRole === 'worker' && form.worker_signed && form.supervisor_signed;
      })
      .map(form => ({
        ...form,
        shift_number: form.shifts?.shift_number || 1,
        user_id: form.shifts?.users?.id,
        user_name: form.shifts?.users?.name || 'Usuario desconocido',
        user_role: form.shifts?.users?.role,
        user_shift: form.shifts?.users?.shift,
        ohsem_signed: form.ohsem_signed || false
      }))
      .filter(order => order.user_id);

    res.json(validForms);
  } catch (error) {
    console.error('Error getting OHSEM orders:', error);
    res.status(500).json({ error: 'Error del servidor' });
  }
});

// Get users list for OHSEM (workers + supervisors from BOTH shifts)
app.get('/api/ohsem/users', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'ohsem') {
      return res.status(403).json({ error: 'Acceso denegado. Solo profesionales OHSEM.' });
    }

    const { data: users, error } = await supabase
      .from('users')
      .select('id, name, username, role, shift')
      .in('role', ['worker', 'supervisor']);

    if (error) throw error;

    res.json(users || []);
  } catch (error) {
    console.error('Error getting users:', error);
    res.status(500).json({ error: 'Error del servidor' });
  }
});

// Sign an order as OHSEM
app.post('/api/ohsem/sign/:shiftId/:dayNumber', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'ohsem') {
      return res.status(403).json({ error: 'Acceso denegado. Solo profesionales OHSEM.' });
    }

    const { shiftId, dayNumber } = req.params;
    
    // Verificar que todas las firmas previas estén completas
    const { data: existingForm } = await supabase
      .from('daily_forms')
      .select(`
        *,
        shifts!inner(
          users!inner(role)
        )
      `)
      .eq('shift_id', shiftId)
      .eq('day_number', dayNumber)
      .single();
    
    if (!existingForm) {
      return res.status(404).json({ error: 'Formulario no encontrado' });
    }
    
    const userRole = existingForm.shifts?.users?.role;
    
    // Validar flujo de firmas según el rol
    if (userRole === 'worker') {
      // Trabajador: debe tener firma de trabajador Y supervisor
      if (!existingForm.worker_signed || !existingForm.supervisor_signed) {
        return res.status(400).json({ 
          error: 'El trabajador y el supervisor deben firmar primero' 
        });
      }
    } else if (userRole === 'supervisor') {
      // Supervisor: debe tener firma de supervisor Y jefe de operaciones
      if (!existingForm.supervisor_signed || !existingForm.operations_manager_signed) {
        return res.status(400).json({ 
          error: 'El supervisor y el jefe de operaciones deben firmar primero' 
        });
      }
    }
    
    const { data: updatedForm, error } = await supabase
      .from('daily_forms')
      .update({
        ohsem_signed: true,
        ohsem_signature: req.user.name,
        ohsem_signature_id: req.user.id,
        ohsem_signed_at: new Date().toISOString()
      })
      .eq('shift_id', shiftId)
      .eq('day_number', dayNumber)
      .select()
      .single();

    if (error) throw error;

    if (!updatedForm) {
      return res.status(404).json({ error: 'Formulario no encontrado' });
    }

    res.json({ 
      message: 'Orden firmada exitosamente por OHSEM',
      signedBy: req.user.name,
      signedAt: updatedForm.ohsem_signed_at
    });
  } catch (error) {
    console.error('Error signing order as OHSEM:', error);
    res.status(500).json({ error: 'Error del servidor' });
  }
});

// Mark derivation case as reviewed by OHSEM
app.post('/api/ohsem/mark-reviewed/:shiftId/:dayNumber', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'ohsem') {
      return res.status(403).json({ error: 'Acceso denegado. Solo profesionales OHSEM.' });
    }

    const { shiftId, dayNumber } = req.params;
    const { review_notes } = req.body;
    
    // Get user name (from token or database)
    let userName = req.user.name;
    
    if (!userName) {
      // Fallback: get name from database if not in token
      const { data: userData } = await supabase
        .from('users')
        .select('name')
        .eq('id', req.user.id)
        .single();
      
      userName = userData?.name || req.user.username;
    }
    
    console.log('Marking as reviewed:', {
      shiftId,
      dayNumber,
      userName,
      reviewNotes: review_notes
    });
    
    // Update the form
    const { data: updatedForm, error } = await supabase
      .from('daily_forms')
      .update({
        derivation_reviewed: true,
        derivation_reviewed_by: userName,
        derivation_reviewed_at: new Date().toISOString(),
        derivation_review_notes: review_notes || null
      })
      .eq('shift_id', shiftId)
      .eq('day_number', dayNumber)
      .select()
      .single();

    if (error) {
      console.error('Error updating form:', error);
      throw error;
    }

    if (!updatedForm) {
      return res.status(404).json({ error: 'Formulario no encontrado' });
    }

    console.log('Form updated successfully:', {
      id: updatedForm.id,
      derivation_reviewed: updatedForm.derivation_reviewed,
      derivation_reviewed_by: updatedForm.derivation_reviewed_by
    });

    res.json({ 
      message: 'Caso marcado como revisado exitosamente',
      reviewedBy: userName,
      reviewedAt: updatedForm.derivation_reviewed_at
    });
  } catch (error) {
    console.error('Error marking as reviewed:', error);
    res.status(500).json({ error: 'Error del servidor' });
  }
});

// Mass sign orders as OHSEM
app.post('/api/ohsem/sign-all', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'ohsem') {
      return res.status(403).json({ error: 'Acceso denegado. Solo profesionales OHSEM.' });
    }

    // Get all pending forms with required signatures
    const { data: forms, error: fetchError } = await supabase
      .from('daily_forms')
      .select(`
        *,
        shifts!inner(user_id),
        shifts.users!inner(role)
      `)
      .eq('ohsem_signed', false);

    if (fetchError) throw fetchError;

    const validForms = (forms || []).filter(form => {
      const userRole = form.shifts?.users?.role;
      if (userRole === 'worker') {
        return form.worker_signed && form.supervisor_signed;
      } else if (userRole === 'supervisor') {
        return form.supervisor_signed && form.operations_manager_signed;
      }
      return false;
    });

    if (validForms.length === 0) {
      return res.status(404).json({ error: 'No hay órdenes pendientes para firmar' });
    }

    const formIds = validForms.map(f => f.id);
    const { error: updateError } = await supabase
      .from('daily_forms')
      .update({
        ohsem_signed: true,
        ohsem_signature: req.user.name,
        ohsem_signed_at: new Date().toISOString()
      })
      .in('id', formIds);

    if (updateError) throw updateError;

    res.json({ 
      message: `${formIds.length} órdenes firmadas exitosamente`,
      signedCount: formIds.length,
      signedBy: req.user.name
    });
  } catch (error) {
    console.error('Error mass signing orders as OHSEM:', error);
    res.status(500).json({ error: 'Error del servidor' });
  }
});

// ============================================
// REAL-TIME UPDATES (SSE)
// ============================================

// SSE endpoint for workers
app.get('/api/sse/worker', authenticateToken, (req, res) => {
  if (req.user.role !== 'worker') {
    return res.status(403).json({ error: 'Acceso denegado' });
  }
  workerSSE.init(req, res);
});

// SSE endpoint for supervisors
app.get('/api/sse/supervisor', authenticateToken, (req, res) => {
  if (req.user.role !== 'supervisor') {
    return res.status(403).json({ error: 'Acceso denegado' });
  }
  supervisorSSE.init(req, res);
});

// SSE endpoint for operations managers
app.get('/api/sse/operations-manager', authenticateToken, (req, res) => {
  if (req.user.role !== 'operations_manager') {
    return res.status(403).json({ error: 'Acceso denegado' });
  }
  operationsManagerSSE.init(req, res);
});

// SSE endpoint for OHSEM
app.get('/api/sse/ohsem', authenticateToken, (req, res) => {
  if (req.user.role !== 'ohsem') {
    return res.status(403).json({ error: 'Acceso denegado' });
  }
  ohsemSSE.init(req, res);
});

// Helper function to notify real-time updates
function notifyNewOrder(userRole) {
  const message = { type: 'new_order', timestamp: new Date().toISOString() };
  
  if (userRole === 'worker') {
    // Notify supervisors when a worker signs
    supervisorSSE.send(message);
  } else if (userRole === 'supervisor') {
    // Notify operations managers and OHSEM when a supervisor signs
    operationsManagerSSE.send(message);
    ohsemSSE.send(message);
  }
}

function notifyOrderSigned(formType) {
  const message = { type: 'order_signed', formType, timestamp: new Date().toISOString() };
  
  if (formType === 'worker') {
    // Notify workers and OHSEM when supervisor signs a worker form
    workerSSE.send(message);
    ohsemSSE.send(message);
  } else if (formType === 'supervisor') {
    // Notify OHSEM when operations manager signs a supervisor form
    ohsemSSE.send(message);
  }
}

function notifyDerivationRequired(shiftId, dayNumber) {
  const message = { 
    type: 'derivation_required', 
    shiftId, 
    dayNumber,
    timestamp: new Date().toISOString() 
  };
  
  console.log('Notifying OHSEM about derivation required:', message);
  ohsemSSE.send(message);
}

// Helper function to check if form has health issues
function checkForHealthIssues(formData) {
  const details = [];
  
  // Mapeo de preguntas para mostrar texto legible
  const conditionsQuestions = {
    q12: "¿Padece de alguna enfermedad o molestia física?",
    q13: "¿Presenta factores externos que le impidan estar concentrado?",
    q14: "¿Ha sufrido algún accidente con lesión?"
  };
  
  const fatigueQuestions = {
    f1: "¿Ha tenido dificultades en lograr un descanso reparador?",
    f2: "¿Presenta algún síntoma que dificulte su buen dormir?",
    f3: "¿Sufre de insomnio últimamente?",
    f4: "¿Durmió menos tiempo del necesario durante su último período de sueño?",
    f5: "¿Está consumiendo algún medicamento que provoque somnolencia?",
    f6: "¿Padece alguna enfermedad que produzca cansancio o somnolencia?",
    f7: "¿Existen factores externos que afecten la calidad de su sueño?",
    f8: "¿Ha presentado eventos importantes de somnolencia?"
  };
  
  // Check conditions (skip q1 which is the mandatory first question)
  // q12, q13, q14 are the health condition questions
  ['q12', 'q13', 'q14'].forEach(key => {
    if (formData.conditions && formData.conditions[key] === 'si') {
      details.push(conditionsQuestions[key] || `Condición ${key}`);
    }
  });
  
  // Check fatigue questions (f1 to f8)
  for (let i = 1; i <= 8; i++) {
    const key = `f${i}`;
    if (formData.fatigue && formData.fatigue[key] === 'si') {
      details.push(fatigueQuestions[key] || `Fatiga ${key}`);
    }
  }
  
  const hasIssues = details.length > 0;
  
  if (hasIssues) {
    console.log('⚠️ ALERTA: Trabajador marcó SÍ en preguntas de salud');
    console.log('Detalles:', details);
  }
  
  return {
    hasIssues,
    details
  };
}

// Helper function to notify health alert
function notifyHealthAlert(shiftId, dayNumber, workerName) {
  const message = { 
    type: 'health_alert', 
    shiftId, 
    dayNumber,
    workerName,
    timestamp: new Date().toISOString() 
  };
  
  console.log('🚨 ALERTA DE SALUD: Trabajador marcó SÍ en preguntas de salud:', message);
  
  // Notify supervisors and OHSEM
  supervisorSSE.send(message);
  ohsemSSE.send(message);
}

// ============================================
// DIGITAL SIGNATURE ROUTES
// ============================================

// Get user's digital signature
app.get('/api/signature', authenticateToken, async (req, res) => {
  try {
    const { data: signature, error } = await supabase
      .from('digital_signatures')
      .select('*')
      .eq('user_id', req.user.id)
      .single();

    if (error && error.code !== 'PGRST116') throw error;

    if (!signature) {
      return res.status(404).json({ error: 'Firma no encontrada' });
    }

    res.json(signature);
  } catch (error) {
    console.error('Error getting signature:', error);
    res.status(500).json({ error: 'Error del servidor' });
  }
});

// Create or update digital signature
app.post('/api/signature', authenticateToken, async (req, res) => {
  try {
    const { signatureData } = req.body;

    if (!signatureData) {
      return res.status(400).json({ error: 'Datos de firma requeridos' });
    }

    // Check if signature exists
    const { data: existingSignature } = await supabase
      .from('digital_signatures')
      .select('*')
      .eq('user_id', req.user.id)
      .single();

    if (existingSignature) {
      // Update existing
      const { data: updatedSignature, error } = await supabase
        .from('digital_signatures')
        .update({
          signature_data: signatureData,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', req.user.id)
        .select()
        .single();

      if (error) throw error;
      res.json(updatedSignature);
    } else {
      // Create new
      const { data: newSignature, error } = await supabase
        .from('digital_signatures')
        .insert([{
          user_id: req.user.id,
          signature_data: signatureData
        }])
        .select()
        .single();

      if (error) throw error;
      res.json(newSignature);
    }
  } catch (error) {
    console.error('Error saving signature:', error);
    res.status(500).json({ error: 'Error del servidor' });
  }
});

// Delete digital signature
app.delete('/api/signature', authenticateToken, async (req, res) => {
  try {
    const { error } = await supabase
      .from('digital_signatures')
      .delete()
      .eq('user_id', req.user.id);

    if (error) throw error;

    res.json({ message: 'Firma eliminada exitosamente' });
  } catch (error) {
    console.error('Error deleting signature:', error);
    res.status(500).json({ error: 'Error del servidor' });
  }
});

// ============================================
// HISTORY ROUTES
// ============================================

// Get historical forms based on user role
app.get('/api/history/forms', authenticateToken, async (req, res) => {
  try {
    const { startDate, endDate, userId, role } = req.query;
    
    let query = supabase
      .from('daily_forms')
      .select(`
        *,
        shifts!inner(
          user_id,
          shift_number,
          start_date,
          users!inner(
            id,
            name,
            role,
            shift
          )
        )
      `)
      .order('created_at', { ascending: false });

    // Filter based on user role
    if (req.user.role === 'worker') {
      // Workers only see their own forms
      query = query.eq('shifts.user_id', req.user.id);
    } else if (req.user.role === 'supervisor') {
      // Supervisors see their own forms + worker forms
      // This requires a more complex query - we'll filter in JavaScript
    } else if (req.user.role === 'operations_manager') {
      // Operations managers see all forms
      // No additional filter needed
    } else if (req.user.role === 'ohsem') {
      // OHSEM sees all forms
      // No additional filter needed
    }

    // Apply date filters if provided
    if (startDate) {
      query = query.gte('created_at', `${startDate}T00:00:00`);
    }
    if (endDate) {
      query = query.lte('created_at', `${endDate}T23:59:59`);
    }

    const { data: forms, error } = await query;

    if (error) throw error;

    // Additional filtering for supervisors
    let filteredForms = forms || [];
    if (req.user.role === 'supervisor') {
      filteredForms = filteredForms.filter(form => {
        const formUserId = form.shifts?.user_id;
        // Supervisors only see their own forms in history
        // Worker forms appear in "Órdenes de Salud Laboral" section
        return formUserId === req.user.id;
      });
    }

    // Apply user filter if provided
    if (userId) {
      filteredForms = filteredForms.filter(form => 
        form.shifts?.user_id === parseInt(userId)
      );
    }

    // Apply role filter if provided
    if (role) {
      filteredForms = filteredForms.filter(form => 
        form.shifts?.users?.role === role
      );
    }

    // Format response
    const historyForms = filteredForms.map(form => {
      // Determine if form is complete based on user role
      let isComplete = false;
      
      if (form.shifts?.users?.role === 'worker') {
        // Worker form is complete when worker AND supervisor have signed
        isComplete = form.supervisor_signed === true;
      } else if (form.shifts?.users?.role === 'supervisor') {
        // Supervisor form is complete when supervisor AND operations manager have signed
        isComplete = form.operations_manager_signed === true;
      }
      
      return {
        ...form,
        shift_number: form.shifts?.shift_number || 1,
        start_date: form.shifts?.start_date,
        user_id: form.shifts?.users?.id,
        user_name: form.shifts?.users?.name || 'Usuario desconocido',
        user_role: form.shifts?.users?.role,
        user_shift: form.shifts?.users?.shift,
        is_complete: isComplete
      };
    });

    res.json(historyForms);
  } catch (error) {
    console.error('Error getting history forms:', error);
    res.status(500).json({ error: 'Error del servidor' });
  }
});

// Get single form detail for PDF export
app.get('/api/history/form/:formId', authenticateToken, async (req, res) => {
  try {
    const { formId } = req.params;

    const { data: form, error } = await supabase
      .from('daily_forms')
      .select(`
        *,
        shifts!inner(
          user_id,
          shift_number,
          start_date,
          users!inner(
            id,
            name,
            role,
            shift
          )
        )
      `)
      .eq('id', formId)
      .single();

    if (error) throw error;

    if (!form) {
      return res.status(404).json({ error: 'Formulario no encontrado' });
    }

    // Check permissions
    const formUserId = form.shifts?.user_id;
    const formUserRole = form.shifts?.users?.role;

    if (req.user.role === 'worker' && formUserId !== req.user.id) {
      return res.status(403).json({ error: 'No tiene permiso para ver este formulario' });
    }

    if (req.user.role === 'supervisor') {
      const canView = formUserId === req.user.id || formUserRole === 'worker';
      if (!canView) {
        return res.status(403).json({ error: 'No tiene permiso para ver este formulario' });
      }
    }

    // Get digital signatures
    const signatures = {};
    
    // Worker signature
    if (formUserId) {
      const { data: workerSig } = await supabase
        .from('digital_signatures')
        .select('signature_data')
        .eq('user_id', formUserId)
        .single();
      
      if (workerSig) {
        signatures.worker_signature = workerSig.signature_data;
      }
    }
    
    // Supervisor signature
    if (form.supervisor_signed && form.supervisor_signature_id) {
      const { data: supervisorSig } = await supabase
        .from('digital_signatures')
        .select('signature_data, users!inner(name)')
        .eq('user_id', form.supervisor_signature_id)
        .single();
      
      if (supervisorSig) {
        signatures.supervisor_signature = supervisorSig.signature_data;
        signatures.supervisor_name = supervisorSig.users?.name;
      }
    }
    
    // Operations manager signature
    if (form.operations_manager_signed && form.operations_manager_signature_id) {
      const { data: omSig } = await supabase
        .from('digital_signatures')
        .select('signature_data, users!inner(name)')
        .eq('user_id', form.operations_manager_signature_id)
        .single();
      
      if (omSig) {
        signatures.operations_manager_signature = omSig.signature_data;
        signatures.operations_manager_name = omSig.users?.name;
      }
    }
    
    // OHSEM signature
    if (form.ohsem_signed && form.ohsem_signature_id) {
      const { data: ohsemSig } = await supabase
        .from('digital_signatures')
        .select('signature_data, users!inner(name)')
        .eq('user_id', form.ohsem_signature_id)
        .single();
      
      if (ohsemSig) {
        signatures.ohsem_signature = ohsemSig.signature_data;
        signatures.ohsem_name = ohsemSig.users?.name;
      }
    }

    res.json({
      ...form,
      shift_number: form.shifts?.shift_number || 1,
      start_date: form.shifts?.start_date,
      user_id: form.shifts?.users?.id,
      user_name: form.shifts?.users?.name || 'Usuario desconocido',
      user_role: form.shifts?.users?.role,
      user_shift: form.shifts?.users?.shift,
      signatures
    });
  } catch (error) {
    console.error('Error getting form detail:', error);
    res.status(500).json({ error: 'Error del servidor' });
  }
});

// Generate PDF for a single form
app.get('/api/history/form/:formId/pdf', authenticateToken, async (req, res) => {
  try {
    const { formId } = req.params;

    // Get form data (reuse the logic from the previous endpoint)
    const { data: form, error } = await supabase
      .from('daily_forms')
      .select(`
        *,
        shifts!inner(
          user_id,
          shift_number,
          start_date,
          users!inner(
            id,
            name,
            role,
            shift
          )
        )
      `)
      .eq('id', formId)
      .single();

    if (error) throw error;

    if (!form) {
      return res.status(404).json({ error: 'Formulario no encontrado' });
    }

    // Check permissions
    const formUserId = form.shifts?.user_id;
    const formUserRole = form.shifts?.users?.role;

    if (req.user.role === 'worker' && formUserId !== req.user.id) {
      return res.status(403).json({ error: 'No tiene permiso para ver este formulario' });
    }

    if (req.user.role === 'supervisor') {
      const canView = formUserId === req.user.id || formUserRole === 'worker';
      if (!canView) {
        return res.status(403).json({ error: 'No tiene permiso para ver este formulario' });
      }
    }

    // Get digital signatures
    const signatures = {};
    
    if (formUserId) {
      const { data: workerSig } = await supabase
        .from('digital_signatures')
        .select('signature_data')
        .eq('user_id', formUserId)
        .single();
      
      if (workerSig) {
        signatures.worker_signature = workerSig.signature_data;
      }
    }
    
    if (form.supervisor_signed && form.supervisor_signature_id) {
      const { data: supervisorSig } = await supabase
        .from('digital_signatures')
        .select('signature_data, users!inner(name)')
        .eq('user_id', form.supervisor_signature_id)
        .single();
      
      if (supervisorSig) {
        signatures.supervisor_signature = supervisorSig.signature_data;
        signatures.supervisor_name = supervisorSig.users?.name;
      }
    }
    
    if (form.operations_manager_signed && form.operations_manager_signature_id) {
      const { data: omSig } = await supabase
        .from('digital_signatures')
        .select('signature_data, users!inner(name)')
        .eq('user_id', form.operations_manager_signature_id)
        .single();
      
      if (omSig) {
        signatures.operations_manager_signature = omSig.signature_data;
        signatures.operations_manager_name = omSig.users?.name;
      }
    }
    
    if (form.ohsem_signed && form.ohsem_signature_id) {
      const { data: ohsemSig } = await supabase
        .from('digital_signatures')
        .select('signature_data, users!inner(name)')
        .eq('user_id', form.ohsem_signature_id)
        .single();
      
      if (ohsemSig) {
        signatures.ohsem_signature = ohsemSig.signature_data;
        signatures.ohsem_name = ohsemSig.users?.name;
      }
    }

    const formData = {
      ...form,
      shift_number: form.shifts?.shift_number || 1,
      start_date: form.shifts?.start_date,
      user_id: form.shifts?.users?.id,
      user_name: form.shifts?.users?.name || 'Usuario desconocido',
      user_role: form.shifts?.users?.role,
      user_shift: form.shifts?.users?.shift,
      signatures
    };

    // Generate HTML from template
    console.log('=== GENERANDO PDF ===');
    console.log('Form ID:', formId);
    console.log('User:', formData.user_name);
    console.log('Day:', formData.day_number);
    console.log('=====================');
    
    const html = generateFormPDF(formData);
    
    console.log('HTML generado, longitud:', html.length);

    // Generate PDF using html-pdf-node
    const options = {
      format: 'A4',
      printBackground: true,
      margin: {
        top: '20px',
        right: '20px',
        bottom: '20px',
        left: '20px'
      }
    };

    const file = { content: html };
    
    console.log('Generando PDF con html-pdf-node...');
    const pdfBuffer = await htmlPdf.generatePdf(file, options);
    
    console.log('PDF generado, tamaño:', pdfBuffer.length, 'bytes');

    // Send PDF with proper headers
    const fileName = `AMECO_Formulario_${formData.user_name.replace(/\s+/g, '_')}_Turno${formData.shift_number}_Dia${formData.day_number}.pdf`;
    
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
    res.setHeader('Content-Length', pdfBuffer.length);
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    res.send(pdfBuffer);

  } catch (error) {
    console.error('Error generating PDF:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({ error: 'Error al generar el PDF', details: error.message });
  }
});

// ============================================
// AUDIT ROUTES
// ============================================

// ============================================
// AUDIT ROUTES
// ============================================

// Get audit records (operations manager only)
app.get('/api/audit/records', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'operations_manager') {
      return res.status(403).json({ error: 'Acceso denegado. Solo jefe de operaciones.' });
    }

    const { data: records, error } = await supabase
      .from('daily_forms')
      .select(`
        *,
        shifts!inner(user_id, shift_number),
        shifts.users!inner(id, name, role, shift)
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;

    const auditRecords = (records || []).map(record => ({
      ...record,
      shift_number: record.shifts?.shift_number || 1,
      user_id: record.shifts?.users?.id,
      user_name: record.shifts?.users?.name || 'Usuario desconocido',
      user_role: record.shifts?.users?.role,
      user_shift: record.shifts?.users?.shift
    }));

    res.json(auditRecords);
  } catch (error) {
    console.error('Error getting audit records:', error);
    res.status(500).json({ error: 'Error del servidor' });
  }
});
