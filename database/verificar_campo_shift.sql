-- Verificar que todos los usuarios del Turno B tengan el campo 'shift' = 'B'
-- Este campo es crítico porque el frontend lo usa para determinar el turno

SELECT 
    u.id,
    u.username,
    u.name,
    u.shift as campo_shift,
    u.role,
    s.id as shift_id,
    s.start_date,
    (CURRENT_DATE - s.start_date::date + 1) as dia_actual
FROM users u
LEFT JOIN shifts s ON s.user_id = u.id AND s.status = 'active'
WHERE u.id IN (29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48)
ORDER BY u.id;

-- Verificar si hay usuarios con shift NULL o incorrecto
SELECT 
    id,
    username,
    name,
    shift,
    role
FROM users
WHERE role = 'worker'
    AND (shift IS NULL OR shift NOT IN ('A', 'B'))
ORDER BY id;

-- Contar usuarios por turno
SELECT 
    shift,
    COUNT(*) as cantidad
FROM users
WHERE role = 'worker'
GROUP BY shift
ORDER BY shift;
