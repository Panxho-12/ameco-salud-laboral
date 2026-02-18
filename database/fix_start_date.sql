-- Fix: Actualizar start_date de turnos activos
-- Fecha: 2026-02-17
-- Propósito: Ajustar la fecha de inicio para que hoy sea día 2

-- Actualizar todos los turnos activos para que start_date sea ayer (16/02/2026)
UPDATE shifts 
SET start_date = '2026-02-16'
WHERE status = 'active';

-- Verificar los cambios
SELECT 
    id,
    user_id,
    shift_number,
    start_date,
    status,
    CURRENT_DATE as today,
    CURRENT_DATE - start_date as days_diff,
    (CURRENT_DATE - start_date) + 1 as current_day
FROM shifts 
WHERE status = 'active';
