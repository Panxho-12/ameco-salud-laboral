-- Diagnóstico: Ver el estado actual de todos los turnos
-- Ejecutar ANTES de aplicar fix_turnos_A_B.sql

SELECT 
    u.shift as turno,
    u.name as usuario,
    u.role as rol,
    s.shift_number as num_turno,
    s.start_date as fecha_inicio,
    s.status as estado,
    CURRENT_DATE as hoy,
    CURRENT_DATE - s.start_date as dias_transcurridos,
    (CURRENT_DATE - s.start_date) + 1 as dia_actual,
    CASE 
        WHEN (CURRENT_DATE - s.start_date) + 1 BETWEEN 1 AND 10 THEN 'EN FAENA'
        WHEN (CURRENT_DATE - s.start_date) + 1 BETWEEN 11 AND 20 THEN 'EN DESCANSO'
        WHEN (CURRENT_DATE - s.start_date) + 1 > 20 THEN 'CICLO COMPLETO'
        ELSE 'FUTURO'
    END as estado_turno
FROM shifts s
JOIN users u ON s.user_id = u.id
WHERE s.status = 'active'
AND u.role IN ('worker', 'supervisor')
ORDER BY u.shift, u.name
LIMIT 10;

-- ============================================
-- PROBLEMA ACTUAL:
-- ============================================
-- Si ves usuarios del Turno A con día 10 o similar,
-- significa que tienen start_date incorrecto.
--
-- SOLUCIÓN:
-- Ejecutar el script: database/fix_turnos_A_B.sql
