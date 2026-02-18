-- CORRECCIÓN FINAL: Actualizar TODOS los turnos A y B
-- Fecha: 2026-02-17
-- 
-- PROBLEMA: Algunos usuarios tienen start_date = 2026-02-17 (hoy)
-- porque el sistema creó nuevos turnos cuando hicieron login
--
-- SOLUCIÓN: Actualizar TODOS los turnos activos a las fechas correctas

-- ============================================
-- PASO 1: Ver el estado actual
-- ============================================
SELECT 
    u.shift as turno,
    u.username,
    u.name as usuario,
    s.id as shift_id,
    s.start_date as fecha_inicio,
    CURRENT_DATE as hoy,
    (CURRENT_DATE - s.start_date) + 1 as dia_actual,
    CASE 
        WHEN (CURRENT_DATE - s.start_date) + 1 BETWEEN 1 AND 10 THEN 'EN FAENA'
        WHEN (CURRENT_DATE - s.start_date) + 1 BETWEEN 11 AND 20 THEN 'EN DESCANSO'
        ELSE 'OTRO'
    END as estado
FROM shifts s
JOIN users u ON s.user_id = u.id
WHERE s.status = 'active'
AND u.role IN ('worker', 'supervisor')
ORDER BY u.shift, u.name
LIMIT 10;

-- ============================================
-- PASO 2: CORREGIR TURNO B (En faena, día 4)
-- ============================================
UPDATE shifts 
SET start_date = '2026-02-14'
WHERE status = 'active'
AND user_id IN (
    SELECT id FROM users 
    WHERE shift = 'B' 
    AND role IN ('worker', 'supervisor')
);

-- ============================================
-- PASO 3: CORREGIR TURNO A (En descanso, día 14)
-- ============================================
UPDATE shifts 
SET start_date = '2026-02-04'
WHERE status = 'active'
AND user_id IN (
    SELECT id FROM users 
    WHERE shift = 'A' 
    AND role IN ('worker', 'supervisor')
);

-- ============================================
-- PASO 4: VERIFICAR CORRECCIÓN
-- ============================================
SELECT 
    u.shift as turno,
    COUNT(*) as cantidad_usuarios,
    MIN(s.start_date) as fecha_inicio_min,
    MAX(s.start_date) as fecha_inicio_max,
    CASE 
        WHEN u.shift = 'A' THEN 
            CASE 
                WHEN MIN(s.start_date) = '2026-02-04' AND MAX(s.start_date) = '2026-02-04' THEN '✓ CORRECTO'
                ELSE '✗ INCORRECTO'
            END
        WHEN u.shift = 'B' THEN 
            CASE 
                WHEN MIN(s.start_date) = '2026-02-14' AND MAX(s.start_date) = '2026-02-14' THEN '✓ CORRECTO'
                ELSE '✗ INCORRECTO'
            END
        ELSE 'N/A'
    END as verificacion
FROM shifts s
JOIN users u ON s.user_id = u.id
WHERE s.status = 'active'
AND u.role IN ('worker', 'supervisor')
GROUP BY u.shift
ORDER BY u.shift;

-- ============================================
-- PASO 5: VERIFICAR DÍAS ACTUALES
-- ============================================
SELECT 
    u.shift as turno,
    u.username,
    u.name as usuario,
    s.start_date as fecha_inicio,
    CURRENT_DATE as hoy,
    (CURRENT_DATE - s.start_date) + 1 as dia_actual,
    CASE 
        WHEN (CURRENT_DATE - s.start_date) + 1 BETWEEN 1 AND 10 THEN 'EN FAENA'
        WHEN (CURRENT_DATE - s.start_date) + 1 BETWEEN 11 AND 20 THEN 'EN DESCANSO'
        ELSE 'OTRO'
    END as estado_esperado
FROM shifts s
JOIN users u ON s.user_id = u.id
WHERE s.status = 'active'
AND u.role IN ('worker', 'supervisor')
ORDER BY u.shift, u.name
LIMIT 10;

-- ============================================
-- RESULTADO ESPERADO:
-- ============================================
-- Turno A: start_date = 2026-02-04, dia_actual = 14, estado = EN DESCANSO
-- Turno B: start_date = 2026-02-14, dia_actual = 4, estado = EN FAENA
