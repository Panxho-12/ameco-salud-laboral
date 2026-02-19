-- Script SIMPLIFICADO para corregir turnos de nuevos supervisores
-- Primero verificamos las fechas actuales de cada turno

-- Ver fechas de inicio actuales
SELECT DISTINCT 
    u.shift as turno,
    s.start_date as fecha_inicio,
    s.status,
    COUNT(*) as usuarios_con_esta_fecha
FROM users u
JOIN shifts s ON u.id = s.user_id
WHERE u.shift IN ('A', 'B')
GROUP BY u.shift, s.start_date, s.status
ORDER BY u.shift, s.start_date;

-- Eliminar turnos existentes de los nuevos supervisores
DELETE FROM shifts 
WHERE user_id IN (
    SELECT id FROM users WHERE username IN ('18970956-0', '16733796-1')
);

-- TURNO B - Campusano
-- Fecha de inicio: 2026-02-13 (misma que los demás del Turno B)
INSERT INTO shifts (user_id, shift_number, start_date, status)
SELECT 
    id,
    1,
    '2026-02-13'::date,
    'active'
FROM users
WHERE username = '18970956-0';

-- TURNO A - Alice  
-- Fecha de inicio: 2026-02-09 (misma que los demás del Turno A en descanso)
INSERT INTO shifts (user_id, shift_number, start_date, status)
SELECT 
    id,
    1,
    '2026-02-09'::date,
    'completed'
FROM users
WHERE username = '16733796-1';

-- Verificar que quedaron correctos
SELECT 
    u.username,
    u.name,
    u.shift as turno,
    s.shift_number,
    s.start_date,
    s.status,
    CASE 
        WHEN s.status = 'completed' THEN 'DESCANSO'
        WHEN CURRENT_DATE < s.start_date THEN 'Aún no inicia'
        ELSE (CURRENT_DATE - s.start_date + 1)::text
    END as dia_actual,
    CURRENT_DATE as fecha_hoy
FROM users u
LEFT JOIN shifts s ON u.id = s.user_id
WHERE u.username IN ('18970956-0', '16733796-1')
ORDER BY u.shift, u.name;
