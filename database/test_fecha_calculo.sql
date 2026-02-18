-- Test de cálculo de fecha para verificar que el día actual sea 4
-- Fecha actual: 17/02/2026 (martes)
-- Fecha inicio Turno B: 14/02/2026 (sábado)
-- Día esperado: 4

SELECT 
    '2026-02-14'::date as start_date,
    CURRENT_DATE as today,
    (CURRENT_DATE - '2026-02-14'::date) as days_diff,
    (CURRENT_DATE - '2026-02-14'::date + 1) as current_day,
    CASE 
        WHEN (CURRENT_DATE - '2026-02-14'::date + 1) > 10 
            AND (CURRENT_DATE - '2026-02-14'::date + 1) <= 20 
        THEN 'EN DESCANSO (días 11-20)'
        WHEN (CURRENT_DATE - '2026-02-14'::date + 1) > 20 
        THEN 'CICLO COMPLETADO (día > 20)'
        ELSE 'EN TRABAJO (días 1-10)'
    END as estado;

-- Verificar todos los usuarios del Turno B con su cálculo
SELECT 
    u.id,
    u.name,
    s.start_date,
    CURRENT_DATE as hoy,
    (CURRENT_DATE - s.start_date::date) as days_diff,
    (CURRENT_DATE - s.start_date::date + 1) as dia_calculado,
    CASE 
        WHEN (CURRENT_DATE - s.start_date::date + 1) > 10 
            AND (CURRENT_DATE - s.start_date::date + 1) <= 20 
        THEN 'DESCANSO'
        WHEN (CURRENT_DATE - s.start_date::date + 1) > 20 
        THEN 'COMPLETADO'
        ELSE 'TRABAJO'
    END as estado_esperado
FROM users u
JOIN shifts s ON s.user_id = u.id AND s.status = 'active'
WHERE u.shift = 'B' AND u.role = 'worker'
ORDER BY u.id;
