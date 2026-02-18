-- Diagnóstico completo de turnos
-- Ver TODOS los turnos activos y sus usuarios

SELECT 
    s.id as shift_id,
    u.id as user_id,
    u.username,
    u.name as usuario,
    u.shift as turno_asignado,
    u.role as rol,
    s.shift_number,
    s.start_date,
    s.status,
    CURRENT_DATE as hoy,
    (CURRENT_DATE - s.start_date) + 1 as dia_calculado,
    CASE 
        WHEN u.shift = 'A' THEN 'Debería ser 2026-02-04 (día 14)'
        WHEN u.shift = 'B' THEN 'Debería ser 2026-02-14 (día 4)'
        ELSE 'N/A'
    END as fecha_correcta
FROM shifts s
JOIN users u ON s.user_id = u.id
WHERE s.status = 'active'
AND u.role IN ('worker', 'supervisor')
ORDER BY u.shift, u.name;
