-- Verificar fecha actual de todos los usuarios del Turno A
SELECT 
    u.username,
    u.name,
    u.shift as turno,
    s.id as shift_id,
    s.start_date,
    s.status,
    s.created_at
FROM users u
LEFT JOIN shifts s ON u.id = s.user_id
WHERE u.shift = 'A'
ORDER BY u.name, s.created_at DESC;

-- CORREGIR: Actualizar start_date de Alice al correcto (04/02/2026)
-- El Turno A empezó el 04/02/2026
-- Hoy (19/02) es día 16 del ciclo (6to día de descanso)
-- Próximo turno: 24/02/2026 (día 21 = nuevo ciclo)
UPDATE shifts
SET start_date = '2026-02-04'
WHERE user_id = (SELECT id FROM users WHERE username = '16733796-1')
AND id = 72;

-- Verificar corrección
SELECT 
    u.username,
    u.name,
    s.id as shift_id,
    s.start_date,
    s.status,
    -- Calcular día actual
    CASE 
        WHEN s.start_date IS NOT NULL THEN 
            EXTRACT(DAY FROM (CURRENT_DATE - s.start_date::date)) + 1
        ELSE NULL
    END as dia_actual
FROM users u
LEFT JOIN shifts s ON u.id = s.user_id
WHERE u.username = '16733796-1'
ORDER BY s.created_at DESC;

-- RESULTADO ESPERADO:
-- Alice debería tener:
-- - start_date: 2026-02-04
-- - Hoy (19/02): día 16 del ciclo (6to día de descanso)
-- - Estado: en descanso (días 11-20)
-- - Días de descanso restantes: 5
-- - Próximo turno: 24/02/2026 (martes)
