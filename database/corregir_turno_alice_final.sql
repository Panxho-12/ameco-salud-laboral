-- Eliminar el turno INCORRECTO de Alice (el activo con fecha 2026-02-19)
-- Mantener solo el turno CORRECTO (completed con fecha 2026-02-09)

-- Eliminar el turno activo incorrecto (shift_id 73)
DELETE FROM shifts 
WHERE id = 73 
AND user_id = (SELECT id FROM users WHERE username = '16733796-1');

-- Verificar que quedó solo el turno correcto
SELECT 
    u.username,
    u.name,
    u.shift,
    s.id as shift_id,
    s.shift_number,
    s.start_date,
    s.status,
    s.created_at
FROM users u
LEFT JOIN shifts s ON u.id = s.user_id
WHERE u.username = '16733796-1'
ORDER BY s.created_at DESC;

-- Verificar que ahora muestra "En Descanso"
SELECT 
    u.username,
    u.name,
    u.shift as turno,
    s.start_date,
    s.status,
    CASE 
        WHEN s.status = 'completed' THEN 'EN DESCANSO'
        WHEN s.status = 'active' THEN (CURRENT_DATE - s.start_date + 1)::text
        ELSE 'SIN TURNO'
    END as estado_actual
FROM users u
LEFT JOIN shifts s ON u.id = s.user_id
WHERE u.username = '16733796-1';
