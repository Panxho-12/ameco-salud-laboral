-- Verificar el turno de Alice y compararlo con otros del Turno A en descanso

-- Ver el turno de Alice
SELECT 
    u.username,
    u.name,
    u.shift,
    s.shift_number,
    s.start_date,
    s.status,
    s.created_at
FROM users u
LEFT JOIN shifts s ON u.id = s.user_id
WHERE u.username = '16733796-1';

-- Ver otros usuarios del Turno A en descanso
SELECT 
    u.username,
    u.name,
    u.shift,
    s.shift_number,
    s.start_date,
    s.status,
    s.created_at
FROM users u
LEFT JOIN shifts s ON u.id = s.user_id
WHERE u.shift = 'A' AND s.status = 'completed'
ORDER BY u.name
LIMIT 5;

-- Verificar si Alice tiene múltiples turnos
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
