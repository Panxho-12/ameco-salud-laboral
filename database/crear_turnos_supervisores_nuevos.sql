-- Script para crear turnos para los 2 nuevos supervisores
-- Fecha: 19/02/2026
-- Hoy es miércoles 18/02/2026 - Turno B día 5

-- Primero, obtener los IDs de los nuevos supervisores
-- Supervisor Turno B: Campusano Alarcon Diego Enrique (18970956-0)
-- Supervisor Turno A: Pizarro Lopez Alice Estefania Elizabeth (16733796-1)

-- TURNO B - Campusano (debe estar en día 6 mañana jueves 19/02/2026)
-- Fecha de inicio: Viernes 14/02/2026 (hace 5 días)
INSERT INTO shifts (user_id, shift_number, start_date, status)
SELECT 
    id,
    1,
    '2026-02-14'::date,
    'active'
FROM users
WHERE username = '18970956-0';

-- TURNO A - Alice (debe estar en DESCANSO)
-- Fecha de inicio: Lunes 10/02/2026 (hace 9 días, terminó su turno)
INSERT INTO shifts (user_id, shift_number, start_date, status)
SELECT 
    id,
    1,
    '2026-02-10'::date,
    'completed'
FROM users
WHERE username = '16733796-1';

-- Verificar que se crearon correctamente
SELECT 
    u.username,
    u.name,
    u.shift as turno,
    s.shift_number,
    s.start_date,
    s.status,
    -- Calcular día actual
    CASE 
        WHEN s.status = 'completed' THEN 'DESCANSO'
        WHEN CURRENT_DATE < s.start_date THEN 'Aún no inicia'
        ELSE (CURRENT_DATE - s.start_date + 1)::text
    END as dia_actual
FROM users u
LEFT JOIN shifts s ON u.id = s.user_id
WHERE u.username IN ('18970956-0', '16733796-1')
ORDER BY u.shift, u.name;

-- Mostrar todos los supervisores con sus turnos
SELECT 
    u.username,
    u.name,
    u.shift as turno,
    s.shift_number,
    s.start_date,
    s.status,
    CASE 
        WHEN s.status = 'completed' THEN 'DESCANSO'
        WHEN s.status IS NULL THEN 'SIN TURNO'
        WHEN CURRENT_DATE < s.start_date THEN 'Aún no inicia'
        ELSE (CURRENT_DATE - s.start_date + 1)::text
    END as dia_actual
FROM users u
LEFT JOIN shifts s ON u.id = s.user_id
WHERE u.role = 'supervisor'
ORDER BY u.shift, u.name;
