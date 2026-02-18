-- Fix: Actualizar start_date de TODOS los turnos activos
-- Fecha: 2026-02-17
-- Propósito: Sincronizar todos los turnos para que estén en día 2

-- Actualizar TODOS los turnos activos para que start_date sea 16/02/2026
UPDATE shifts 
SET start_date = '2026-02-16'
WHERE status = 'active';

-- Verificar los cambios
SELECT 
    s.id,
    s.user_id,
    u.name as user_name,
    u.role,
    s.shift_number,
    s.start_date,
    s.status,
    CURRENT_DATE as today,
    CURRENT_DATE - s.start_date as days_diff,
    (CURRENT_DATE - s.start_date) + 1 as current_day
FROM shifts s
JOIN users u ON s.user_id = u.id
WHERE s.status = 'active'
ORDER BY u.name;
