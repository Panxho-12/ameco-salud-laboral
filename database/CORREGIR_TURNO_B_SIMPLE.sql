-- CORRECCIÓN SIMPLE Y DIRECTA - TURNO B
-- Actualizar TODOS los shifts activos del Turno B a 2026-02-14

-- Paso 1: Ver cuántos turnos del Turno B hay
SELECT COUNT(*) as total_turno_B
FROM shifts s
INNER JOIN users u ON s.user_id = u.id
WHERE s.status = 'active'
AND u.shift = 'B'
AND u.role IN ('worker', 'supervisor');

-- Paso 2: Ver cuántos tienen fecha incorrecta
SELECT COUNT(*) as con_fecha_incorrecta
FROM shifts s
INNER JOIN users u ON s.user_id = u.id
WHERE s.status = 'active'
AND u.shift = 'B'
AND u.role IN ('worker', 'supervisor')
AND s.start_date != '2026-02-14';

-- Paso 3: CORREGIR TODOS los turnos del Turno B
UPDATE shifts
SET start_date = '2026-02-14'
FROM users
WHERE shifts.user_id = users.id
AND shifts.status = 'active'
AND users.shift = 'B'
AND users.role IN ('worker', 'supervisor');

-- Paso 4: VERIFICAR que se corrigieron
SELECT 
    u.username,
    u.name,
    s.start_date,
    (CURRENT_DATE - s.start_date) + 1 as dia_actual
FROM shifts s
INNER JOIN users u ON s.user_id = u.id
WHERE s.status = 'active'
AND u.shift = 'B'
AND u.role IN ('worker', 'supervisor')
ORDER BY u.name
LIMIT 10;

-- RESULTADO ESPERADO:
-- Todos deberían tener start_date = 2026-02-14
-- Todos deberían tener dia_actual = 4
