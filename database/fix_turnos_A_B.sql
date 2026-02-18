-- Fix: Configurar correctamente los turnos A y B
-- Fecha: 2026-02-17 (Martes)
-- 
-- SITUACIÓN ACTUAL:
-- - Turno B: En faena desde el sábado 14/02/2026 (día 4 hoy)
-- - Turno A: En descanso, entra el martes 24/02/2026
--
-- LÓGICA:
-- - Turno B: start_date = 2026-02-14 (empezó el sábado, termina el lunes 23/02)
-- - Turno A: start_date = 2026-02-04 (empezó el miércoles 04/02, terminó el viernes 13/02)
--            Ahora están en descanso hasta el 23/02, vuelven el 24/02

-- ============================================
-- TURNO B - Actualmente en faena (día 4)
-- ============================================
UPDATE shifts 
SET start_date = '2026-02-14'
WHERE status = 'active'
AND user_id IN (
    SELECT id FROM users 
    WHERE shift = 'B' 
    AND role IN ('worker', 'supervisor')
);

-- ============================================
-- TURNO A - Actualmente en descanso
-- ============================================
-- Su último turno empezó el 04/02 y terminó el 13/02
-- Están en descanso hasta el 23/02
-- El 24/02 el sistema creará automáticamente un nuevo turno
UPDATE shifts 
SET start_date = '2026-02-04'
WHERE status = 'active'
AND user_id IN (
    SELECT id FROM users 
    WHERE shift = 'A' 
    AND role IN ('worker', 'supervisor')
);

-- NOTA: El 24/02/2026, cuando los usuarios del Turno A hagan login,
-- el sistema detectará que están en día 21+ y automáticamente:
-- 1. Completará el turno actual (status = 'completed')
-- 2. Creará un nuevo turno con start_date = '2026-02-24'
-- 3. Los usuarios verán "Día 1 de 10" y podrán completar formularios

-- ============================================
-- VERIFICACIÓN
-- ============================================
SELECT 
    u.shift as turno,
    u.name as usuario,
    u.role as rol,
    s.shift_number as num_turno,
    s.start_date as fecha_inicio,
    s.status as estado,
    CURRENT_DATE as hoy,
    CURRENT_DATE - s.start_date as dias_transcurridos,
    (CURRENT_DATE - s.start_date) + 1 as dia_actual,
    CASE 
        WHEN (CURRENT_DATE - s.start_date) + 1 BETWEEN 1 AND 10 THEN 'EN FAENA'
        WHEN (CURRENT_DATE - s.start_date) + 1 > 10 THEN 'EN DESCANSO'
        ELSE 'FUTURO'
    END as estado_turno
FROM shifts s
JOIN users u ON s.user_id = u.id
WHERE s.status = 'active'
AND u.role IN ('worker', 'supervisor')
ORDER BY u.shift, u.name;

-- ============================================
-- RESULTADO ESPERADO:
-- ============================================
-- Turno B:
--   - start_date: 2026-02-14 (sábado)
--   - hoy: 2026-02-17 (martes)
--   - dias_transcurridos: 3
--   - dia_actual: 4 ✓
--   - estado_turno: EN FAENA ✓
--
-- Turno A:
--   - start_date: 2026-02-04 (miércoles)
--   - hoy: 2026-02-17 (martes)
--   - dias_transcurridos: 13
--   - dia_actual: 14
--   - estado_turno: EN DESCANSO ✓
--   - Próximo turno: 2026-02-24 (martes)
