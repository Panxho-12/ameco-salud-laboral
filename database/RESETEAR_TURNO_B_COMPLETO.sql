-- RESETEAR COMPLETAMENTE EL TURNO B
-- Este script elimina TODOS los turnos del Turno B y los crea de nuevo
-- Fecha inicio: 2026-02-14 (sábado)
-- Día actual: 4 (hoy es 17/02/2026)

-- PASO 1: Eliminar TODOS los turnos de usuarios del Turno B
DELETE FROM shifts
WHERE user_id IN (
    SELECT id FROM users WHERE shift = 'B' AND role = 'worker'
);

-- PASO 2: Crear turnos nuevos para TODOS los usuarios del Turno B
-- IDs del Turno B: 29-48 (20 usuarios)
INSERT INTO shifts (user_id, shift_number, status, start_date, created_at)
VALUES
-- Turno B - 20 operadores
(29, 1, 'active', '2026-02-14', NOW()), -- Araya Olivares Josue Daniel
(30, 1, 'active', '2026-02-14', NOW()), -- Berrios Torres Darwin Daniel
(31, 1, 'active', '2026-02-14', NOW()), -- Castillo Cortes Patricio Antonio
(32, 1, 'active', '2026-02-14', NOW()), -- Figueroa Soto Juan Enrique
(33, 1, 'active', '2026-02-14', NOW()), -- Flores Navarro Ruben Francisco
(34, 1, 'active', '2026-02-14', NOW()), -- Fuenzalida Hernandez Roberto Alexis
(35, 1, 'active', '2026-02-14', NOW()), -- Gomez Araya Glen Eliseo
(36, 1, 'active', '2026-02-14', NOW()), -- Guerra Figueroa Jorge Enrique
(37, 1, 'active', '2026-02-14', NOW()), -- León Muñoz Pablo Alejandro
(38, 1, 'active', '2026-02-14', NOW()), -- Maino Sepulveda Leonardo Cristobal
(39, 1, 'active', '2026-02-14', NOW()), -- Mendoza Miranda Richard Cristian
(40, 1, 'active', '2026-02-14', NOW()), -- Michea Michea Hector Alejandro
(41, 1, 'active', '2026-02-14', NOW()), -- Murillo Serey Hugo Adolfo
(42, 1, 'active', '2026-02-14', NOW()), -- Muñoz Ahumada Fernando Andres
(43, 1, 'active', '2026-02-14', NOW()), -- Pizarro Olguin Joaquin Ignacio
(44, 1, 'active', '2026-02-14', NOW()), -- Pizarro Olguin Sebastian Patricio
(45, 1, 'active', '2026-02-14', NOW()), -- Plaza Rubina Patricio Rogers
(46, 1, 'active', '2026-02-14', NOW()), -- Rojas Pizarro Angelo Antonio
(47, 1, 'active', '2026-02-14', NOW()), -- Rossel Guerra Jonnathan Alexander
(48, 1, 'active', '2026-02-14', NOW()); -- Marin Mondaca Gian Carlo

-- PASO 3: Verificar que todos quedaron correctos
SELECT 
    u.id,
    u.username,
    u.name,
    s.id as shift_id,
    s.start_date,
    s.shift_number,
    s.status,
    (CURRENT_DATE - s.start_date::date + 1) as dia_actual,
    CASE 
        WHEN (CURRENT_DATE - s.start_date::date + 1) BETWEEN 1 AND 10 THEN '✓ TRABAJO'
        WHEN (CURRENT_DATE - s.start_date::date + 1) BETWEEN 11 AND 20 THEN '✗ DESCANSO'
        ELSE '✗ COMPLETADO'
    END as estado
FROM users u
JOIN shifts s ON s.user_id = u.id AND s.status = 'active'
WHERE u.shift = 'B' AND u.role = 'worker'
ORDER BY u.id;

-- PASO 4: Contar resultados
SELECT 
    COUNT(*) as total_usuarios,
    COUNT(CASE WHEN s.start_date = '2026-02-14' THEN 1 END) as con_fecha_correcta,
    COUNT(CASE WHEN (CURRENT_DATE - s.start_date::date + 1) = 4 THEN 1 END) as en_dia_4
FROM users u
JOIN shifts s ON s.user_id = u.id AND s.status = 'active'
WHERE u.shift = 'B' AND u.role = 'worker';
