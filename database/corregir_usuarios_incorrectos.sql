-- Corrección de usuarios con start_date incorrecto
-- Fecha: 2026-02-17

-- ============================================
-- CORREGIR usuarios del Turno A con fecha incorrecta
-- ============================================
UPDATE shifts 
SET start_date = '2026-02-04'
WHERE status = 'active'
AND user_id IN (
    SELECT u.id 
    FROM users u
    JOIN shifts s ON s.user_id = u.id
    WHERE u.shift = 'A' 
    AND u.role IN ('worker', 'supervisor')
    AND s.status = 'active'
    AND s.start_date != '2026-02-04'
);

-- ============================================
-- CORREGIR usuarios del Turno B con fecha incorrecta
-- ============================================
UPDATE shifts 
SET start_date = '2026-02-14'
WHERE status = 'active'
AND user_id IN (
    SELECT u.id 
    FROM users u
    JOIN shifts s ON s.user_id = u.id
    WHERE u.shift = 'B' 
    AND u.role IN ('worker', 'supervisor')
    AND s.status = 'active'
    AND s.start_date != '2026-02-14'
);

-- ============================================
-- VERIFICAR que se corrigieron
-- ============================================
SELECT 
    u.shift as turno,
    u.username,
    u.name as usuario,
    s.start_date,
    CURRENT_DATE as hoy,
    (CURRENT_DATE - s.start_date) + 1 as dia_actual,
    CASE 
        WHEN u.shift = 'A' AND s.start_date = '2026-02-04' THEN '✅ CORRECTO (día 14, descanso)'
        WHEN u.shift = 'B' AND s.start_date = '2026-02-14' THEN '✅ CORRECTO (día 4, faena)'
        ELSE '❌ INCORRECTO'
    END as verificacion
FROM shifts s
JOIN users u ON s.user_id = u.id
WHERE s.status = 'active'
AND u.role IN ('worker', 'supervisor')
AND u.username IN ('11937708-5', '17715271-4', '16505089-4', '9155555-7')
ORDER BY u.shift, u.name;
