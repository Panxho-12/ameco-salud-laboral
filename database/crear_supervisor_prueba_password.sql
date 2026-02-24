-- ============================================
-- Crear Supervisor de Prueba para Cambio de Contraseña
-- ============================================

-- Eliminar supervisor de prueba si existe
DELETE FROM users WHERE username = 'test-supervisor';

-- Crear supervisor de prueba que DEBE cambiar contraseña
INSERT INTO users (username, password, name, role, shift, first_login_completed)
VALUES ('test-supervisor', 'Ameco@2025', 'Supervisor Prueba', 'supervisor', 'A', FALSE);

-- Verificar
SELECT 
    id,
    username,
    name,
    role,
    shift,
    first_login_completed,
    password_changed_at
FROM users 
WHERE username = 'test-supervisor';

-- ============================================
-- INSTRUCCIONES DE PRUEBA
-- ============================================
-- 
-- 1. Ejecuta este script en Supabase SQL Editor
-- 2. Abre tu aplicación (local o producción)
-- 3. Intenta hacer login con:
--    Usuario: test-supervisor
--    Contraseña: Ameco@2025
-- 4. Deberías ver el modal de cambio de contraseña obligatorio
-- 5. Cambia la contraseña a algo como: MiNueva@Pass123
-- 6. La página se refrescará automáticamente
-- 7. Luego deberías ver el modal de firma digital
-- 8. Crea tu firma digital
-- 9. Ahora puedes acceder al sistema normalmente
--
-- NOTA: Los trabajadores (role='worker') NO verán el modal de cambio de contraseña
