-- Fix: Actualizar start_date al inicio real del turno (Sábado 14/02/2026)
-- Fecha: 2026-02-17
-- Propósito: El turno empezó el sábado 14/02, hoy martes 17/02 es día 4

-- Actualizar TODOS los turnos activos para que start_date sea 14/02/2026 (sábado)
UPDATE shifts 
SET start_date = '2026-02-14'
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

-- Resultado esperado:
-- start_date: 2026-02-14 (sábado)
-- today: 2026-02-17 (martes)
-- days_diff: 3
-- current_day: 4 ✓
