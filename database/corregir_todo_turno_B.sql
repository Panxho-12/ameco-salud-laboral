-- CORRECCIÓN COMPLETA TURNO B
-- Fecha actual: 17/02/2026 (martes)
-- Turno B empezó: sábado 14/02/2026
-- Día actual: 4 de 10

-- PASO 1: Verificar estado actual
SELECT 
    'ANTES DE CORRECCIÓN' as momento,
    COUNT(*) as total_usuarios_turno_B,
    COUNT(s.id) as con_turno_activo,
    COUNT(CASE WHEN s.start_date = '2026-02-14' THEN 1 END) as con_fecha_correcta
FROM users u
LEFT JOIN shifts s ON s.user_id = u.id AND s.status = 'active'
WHERE u.shift = 'B' AND u.role = 'worker';

-- PASO 2: Actualizar start_date de turnos activos existentes del Turno B
UPDATE shifts
SET start_date = '2026-02-14'
WHERE user_id IN (
    SELECT id FROM users WHERE shift = 'B' AND role = 'worker'
)
AND status = 'active'
AND start_date != '2026-02-14';

-- PASO 3: Crear turnos para usuarios del Turno B que NO tienen turno activo
INSERT INTO shifts (user_id, shift_number, status, start_date)
SELECT 
    u.id,
    COALESCE(
        (SELECT MAX(shift_number) FROM shifts WHERE user_id = u.id), 
        0
    ) + 1 as shift_number,
    'active' as status,
    '2026-02-14' as start_date
FROM users u
WHERE u.shift = 'B' 
    AND u.role = 'worker'
    AND NOT EXISTS (
        SELECT 1 FROM shifts s 
        WHERE s.user_id = u.id AND s.status = 'active'
    );

-- PASO 4: Verificar resultado final
SELECT 
    'DESPUÉS DE CORRECCIÓN' as momento,
    COUNT(*) as total_usuarios_turno_B,
    COUNT(s.id) as con_turno_activo,
    COUNT(CASE WHEN s.start_date = '2026-02-14' THEN 1 END) as con_fecha_correcta,
    -- Calcular día actual (debería ser 4)
    MAX(CURRENT_DATE - s.start_date::date + 1) as dia_maximo,
    MIN(CURRENT_DATE - s.start_date::date + 1) as dia_minimo
FROM users u
LEFT JOIN shifts s ON s.user_id = u.id AND s.status = 'active'
WHERE u.shift = 'B' AND u.role = 'worker';

-- PASO 5: Listar todos los usuarios del Turno B con su estado final
SELECT 
    u.id,
    u.username,
    u.name,
    s.id as shift_id,
    s.start_date,
    s.shift_number,
    (CURRENT_DATE - s.start_date::date + 1) as dia_actual
FROM users u
LEFT JOIN shifts s ON s.user_id = u.id AND s.status = 'active'
WHERE u.shift = 'B' AND u.role = 'worker'
ORDER BY u.name;
