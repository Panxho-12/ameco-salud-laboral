-- Crear turnos para usuarios del Turno A que no tienen turno activo
-- Fecha: 2026-02-17

-- Paso 1: Ver usuarios del Turno A SIN turno activo
SELECT 
    u.id,
    u.username,
    u.name,
    u.shift,
    u.role,
    'SIN TURNO ACTIVO' as estado
FROM users u
LEFT JOIN shifts s ON s.user_id = u.id AND s.status = 'active'
WHERE u.shift = 'A'
AND u.role IN ('worker', 'supervisor')
AND s.id IS NULL
ORDER BY u.name;

-- Paso 2: CREAR turnos para usuarios del Turno A sin turno activo
INSERT INTO shifts (user_id, shift_number, status, start_date, created_at, updated_at)
SELECT 
    u.id as user_id,
    1 as shift_number,
    'active' as status,
    '2026-02-04' as start_date,
    NOW() as created_at,
    NOW() as updated_at
FROM users u
LEFT JOIN shifts s ON s.user_id = u.id AND s.status = 'active'
WHERE u.shift = 'A'
AND u.role IN ('worker', 'supervisor')
AND s.id IS NULL;

-- Paso 3: VERIFICAR que se crearon
SELECT 
    u.username,
    u.name,
    s.start_date,
    (CURRENT_DATE - s.start_date) + 1 as dia_actual,
    CASE 
        WHEN (CURRENT_DATE - s.start_date) + 1 BETWEEN 11 AND 20 THEN 'EN DESCANSO ✓'
        ELSE 'VERIFICAR'
    END as estado,
    s.created_at
FROM shifts s
INNER JOIN users u ON s.user_id = u.id
WHERE s.status = 'active'
AND u.shift = 'A'
AND u.role IN ('worker', 'supervisor')
ORDER BY s.created_at DESC;

-- RESULTADO ESPERADO:
-- Todos los usuarios del Turno A deberían tener:
-- - start_date = 2026-02-04
-- - dia_actual = 14
-- - estado = EN DESCANSO
