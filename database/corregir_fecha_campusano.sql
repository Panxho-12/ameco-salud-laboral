-- Corregir fecha de inicio de Campusano para que esté en día 6
-- Turno B empezó el sábado 14/02/2026

-- Actualizar la fecha de inicio de Campusano
UPDATE shifts
SET start_date = '2026-02-14'::date
WHERE user_id = (SELECT id FROM users WHERE username = '18970956-0');

-- Verificar que quedó correcto
SELECT 
    u.username,
    u.name,
    u.shift as turno,
    s.shift_number,
    s.start_date,
    s.status,
    (CURRENT_DATE - s.start_date + 1)::text as dia_actual,
    CURRENT_DATE as fecha_hoy
FROM users u
JOIN shifts s ON u.id = s.user_id
WHERE u.username = '18970956-0';

-- Verificar que todos los del Turno B tienen la misma fecha
SELECT 
    u.username,
    u.name,
    s.start_date,
    (CURRENT_DATE - s.start_date + 1)::text as dia_actual
FROM users u
JOIN shifts s ON u.id = s.user_id
WHERE u.shift = 'B' AND s.status = 'active'
ORDER BY u.name;
