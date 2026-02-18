-- Verificar y corregir usuarios del Turno A
-- Problema: Algunos usuarios tienen start_date incorrecto

-- 1. Ver el estado actual de TODOS los turnos activos
SELECT 
    u.shift as turno,
    u.username,
    u.name as usuario,
    u.role as rol,
    s.id as shift_id,
    s.shift_number as num_turno,
    s.start_date as fecha_inicio,
    s.status as estado,
    s.created_at as creado_en,
    CURRENT_DATE as hoy,
    CURRENT_DATE - s.start_date as dias_transcurridos,
    (CURRENT_DATE - s.start_date) + 1 as dia_actual
FROM shifts s
JOIN users u ON s.user_id = u.id
WHERE s.status = 'active'
AND u.role IN ('worker', 'supervisor')
ORDER BY u.shift, s.created_at DESC;

-- 2. Identificar turnos problemáticos del Turno A
-- (Deberían tener start_date = 2026-02-04, pero tienen otra fecha)
SELECT 
    u.username,
    u.name,
    s.id as shift_id,
    s.start_date,
    'INCORRECTO - Debería ser 2026-02-04' as problema
FROM shifts s
JOIN users u ON s.user_id = u.id
WHERE s.status = 'active'
AND u.shift = 'A'
AND u.role IN ('worker', 'supervisor')
AND s.start_date != '2026-02-04';

-- 3. CORREGIR: Actualizar TODOS los turnos activos del Turno A
UPDATE shifts 
SET start_date = '2026-02-04'
WHERE status = 'active'
AND user_id IN (
    SELECT id FROM users 
    WHERE shift = 'A' 
    AND role IN ('worker', 'supervisor')
);

-- 4. VERIFICAR: Confirmar que se corrigieron
SELECT 
    u.shift as turno,
    u.username,
    u.name as usuario,
    s.start_date as fecha_inicio,
    CURRENT_DATE as hoy,
    (CURRENT_DATE - s.start_date) + 1 as dia_actual,
    CASE 
        WHEN (CURRENT_DATE - s.start_date) + 1 BETWEEN 1 AND 10 THEN 'EN FAENA'
        WHEN (CURRENT_DATE - s.start_date) + 1 BETWEEN 11 AND 20 THEN 'EN DESCANSO'
        WHEN (CURRENT_DATE - s.start_date) + 1 > 20 THEN 'CICLO COMPLETO'
        ELSE 'FUTURO'
    END as estado_turno
FROM shifts s
JOIN users u ON s.user_id = u.id
WHERE s.status = 'active'
AND u.shift = 'A'
AND u.role IN ('worker', 'supervisor')
ORDER BY u.name
LIMIT 5;

-- RESULTADO ESPERADO:
-- Turno A: start_date = 2026-02-04, dia_actual = 14, estado_turno = EN DESCANSO
