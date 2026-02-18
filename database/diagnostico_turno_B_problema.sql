-- Diagnóstico completo para usuarios del Turno B que muestran mensaje de descanso
-- Fecha actual: 17/02/2026 (martes)
-- Turno B debería estar en día 4 (empezó sábado 14/02/2026)

-- 1. Ver todos los usuarios del Turno B con sus turnos activos
SELECT 
    u.id,
    u.username,
    u.name,
    u.shift as turno_asignado,
    u.role,
    s.id as shift_id,
    s.start_date,
    s.status,
    s.shift_number,
    -- Calcular día actual
    CASE 
        WHEN s.start_date IS NULL THEN 'SIN TURNO ACTIVO'
        ELSE (CURRENT_DATE - s.start_date::date + 1)::text
    END as dia_calculado
FROM users u
LEFT JOIN shifts s ON s.user_id = u.id AND s.status = 'active'
WHERE u.shift = 'B' AND u.role = 'worker'
ORDER BY u.name;

-- 2. Verificar usuarios específicos mencionados
SELECT 
    u.id,
    u.username,
    u.name,
    u.shift,
    s.id as shift_id,
    s.start_date,
    s.status,
    (CURRENT_DATE - s.start_date::date + 1) as dia_actual
FROM users u
LEFT JOIN shifts s ON s.user_id = u.id AND s.status = 'active'
WHERE u.name IN (
    'Castillo Cortes Patricio Antonio',
    'Marin Mondaca Gian Carlo',
    'Flores Navarro Ruben Francisco'
)
ORDER BY u.name;

-- 3. Contar usuarios del Turno B por estado
SELECT 
    CASE 
        WHEN s.id IS NULL THEN 'Sin turno activo'
        WHEN s.start_date = '2026-02-14' THEN 'Turno correcto (14/02)'
        ELSE 'Turno con fecha incorrecta'
    END as estado,
    COUNT(*) as cantidad
FROM users u
LEFT JOIN shifts s ON s.user_id = u.id AND s.status = 'active'
WHERE u.shift = 'B' AND u.role = 'worker'
GROUP BY estado;

-- 4. Ver usuarios del Turno B que NO tienen start_date = '2026-02-14'
SELECT 
    u.id,
    u.username,
    u.name,
    s.id as shift_id,
    s.start_date,
    s.status
FROM users u
LEFT JOIN shifts s ON s.user_id = u.id AND s.status = 'active'
WHERE u.shift = 'B' 
    AND u.role = 'worker'
    AND (s.start_date IS NULL OR s.start_date != '2026-02-14')
ORDER BY u.name;
