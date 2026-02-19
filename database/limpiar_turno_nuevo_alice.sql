-- Verificar todos los turnos de Alice
SELECT 
    u.username,
    u.name,
    s.id as shift_id,
    s.shift_number,
    s.start_date,
    s.status,
    s.created_at
FROM users u
LEFT JOIN shifts s ON u.id = s.user_id
WHERE u.username = '16733796-1'
ORDER BY s.created_at DESC;

-- Si hay un turno nuevo creado hoy (2026-02-19), eliminarlo
-- SOLO ejecutar este DELETE si el SELECT anterior muestra un turno con start_date = 2026-02-19
DELETE FROM shifts 
WHERE user_id = (SELECT id FROM users WHERE username = '16733796-1')
AND start_date = '2026-02-19'
AND status = 'active';

-- Verificar que quedó solo el turno correcto (shift_id 72)
SELECT 
    u.username,
    u.name,
    s.id as shift_id,
    s.shift_number,
    s.start_date,
    s.status
FROM users u
LEFT JOIN shifts s ON u.id = s.user_id
WHERE u.username = '16733796-1'
ORDER BY s.created_at DESC;
