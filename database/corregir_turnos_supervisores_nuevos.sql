-- Script para CORREGIR los turnos de los nuevos supervisores
-- Usar las mismas fechas de inicio que los demás usuarios de cada turno

-- Primero, ver las fechas de inicio actuales de cada turno
-- SELECT DISTINCT u.shift, s.start_date, s.status
-- FROM users u
-- JOIN shifts s ON u.id = s.user_id
-- WHERE u.shift IN ('A', 'B')
-- ORDER BY u.shift, s.start_date;

-- Eliminar turnos existentes de los nuevos supervisores
DELETE FROM shifts 
WHERE user_id IN (
    SELECT id FROM users WHERE username IN ('18970956-0', '16733796-1')
);

-- TURNO B - Campusano
-- Usar la misma fecha de inicio que los demás del Turno B
INSERT INTO shifts (user_id, shift_number, start_date, status)
SELECT 
    u.id,
    1,
    (SELECT s.start_date 
     FROM shifts s 
     JOIN users u2 ON s.user_id = u2.id 
     WHERE u2.shift = 'B' AND s.status = 'active' 
     LIMIT 1),
    'active'
FROM users u
WHERE u.username = '18970956-0';

-- TURNO A - Alice
-- Usar la misma fecha de inicio que los demás del Turno A (que están en descanso)
INSERT INTO shifts (user_id, shift_number, start_date, status)
SELECT 
    u.id,
    1,
    (SELECT s.start_date 
     FROM shifts s 
     JOIN users u2 ON s.user_id = u2.id 
     WHERE u2.shift = 'A' AND s.status = 'completed' 
     LIMIT 1),
    'completed'
FROM users u
WHERE u.username = '16733796-1';

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

-- Verificar que tienen la misma fecha que sus compañeros de turno
SELECT 
    u.shift as turno,
    u.name,
    s.start_date,
    s.status
FROM users u
JOIN shifts s ON u.id = s.user_id
WHERE u.shift IN ('A', 'B')
ORDER BY u.shift, s.start_date, u.name;
