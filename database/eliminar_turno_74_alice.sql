-- Eliminar DIRECTAMENTE el turno incorrecto de Alice (shift_id 74)

DELETE FROM shifts WHERE id = 74;

-- Verificar que quedó solo el turno correcto
SELECT 
    u.username,
    u.name,
    s.id as shift_id,
    s.start_date,
    s.status
FROM users u
LEFT JOIN shifts s ON u.id = s.user_id
WHERE u.username = '16733796-1'
ORDER BY s.created_at DESC;
