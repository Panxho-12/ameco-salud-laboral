-- Verificación final de TODOS los usuarios del Turno B
-- Debe mostrar 20 usuarios con start_date = 2026-02-14 y dia_actual = 4

SELECT 
    u.id,
    u.username,
    u.name,
    u.shift,
    u.role,
    s.id as shift_id,
    s.start_date,
    s.status,
    s.shift_number,
    (CURRENT_DATE - s.start_date::date + 1) as dia_actual,
    CASE 
        WHEN (CURRENT_DATE - s.start_date::date + 1) BETWEEN 1 AND 10 THEN 'TRABAJO ✓'
        WHEN (CURRENT_DATE - s.start_date::date + 1) BETWEEN 11 AND 20 THEN 'DESCANSO ✗'
        ELSE 'COMPLETADO ✗'
    END as estado
FROM users u
LEFT JOIN shifts s ON s.user_id = u.id AND s.status = 'active'
WHERE u.shift = 'B' AND u.role = 'worker'
ORDER BY u.id;

-- Resumen
SELECT 
    COUNT(*) as total_usuarios,
    COUNT(CASE WHEN s.start_date = '2026-02-14' THEN 1 END) as con_fecha_correcta,
    COUNT(CASE WHEN (CURRENT_DATE - s.start_date::date + 1) = 4 THEN 1 END) as en_dia_4
FROM users u
LEFT JOIN shifts s ON s.user_id = u.id AND s.status = 'active'
WHERE u.shift = 'B' AND u.role = 'worker';
