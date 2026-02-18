-- Script para agregar nuevos usuarios al sistema
-- Contraseña para todos: Ameco@2025

-- TURNO B - Operadores
INSERT INTO users (username, password, name, role, shift) VALUES
('8926751-K', 'Ameco@2025', 'Aranda Ledezma Marcos Andres', 'worker', 'B'),
('18501941-1', 'Ameco@2025', 'Cepeda Michea Omar Patricio', 'worker', 'B'),
('13329070-2', 'Ameco@2025', 'Fernandez Arancibia Cristian Martin', 'worker', 'B'),
('22867274-2', 'Ameco@2025', 'Lizarraga Martin Ricardo Roberto', 'worker', 'B'),
('19240429-0', 'Ameco@2025', 'Ojeda Burgos Ferdinand Miguel', 'worker', 'B'),
('10414898-0', 'Ameco@2025', 'Parraguez Cuadra Jorge Rene', 'worker', 'B');

-- TURNO A - Operadores
INSERT INTO users (username, password, name, role, shift) VALUES
('20203059-9', 'Ameco@2025', 'Flores Salamanca Brandon Felipe', 'worker', 'A'),
('13875971-7', 'Ameco@2025', 'Honores Guerrero Jose Luis', 'worker', 'A'),
('15909800-1', 'Ameco@2025', 'Rojas Gonzalez David Hacher', 'worker', 'A'),
('19948897-K', 'Ameco@2025', 'Perez Jimenez Victor Ignacio', 'worker', 'A'),
('17212700-2', 'Ameco@2025', 'Altamirano Alfaro Ricardo Alberto', 'worker', 'A'),
('18985919-8', 'Ameco@2025', 'Ossandon Cofre Alberto Nicolas', 'worker', 'A');

-- PREVENCIONISTA
INSERT INTO users (username, password, name, role, shift) VALUES
('10152982-7', 'Ameco@2025', 'Zepeda Escobar Patricio Hernan', 'ohsem', NULL);

-- Verificar que se agregaron correctamente
SELECT 
  COUNT(*) FILTER (WHERE role = 'worker' AND shift = 'B') as operadores_turno_B,
  COUNT(*) FILTER (WHERE role = 'worker' AND shift = 'A') as operadores_turno_A,
  COUNT(*) FILTER (WHERE role = 'ohsem') as prevencionistas,
  COUNT(*) as total_usuarios
FROM users;

-- Mostrar los nuevos usuarios agregados
SELECT id, username, name, role, shift 
FROM users 
WHERE username IN (
  '8926751-K', '18501941-1', '13329070-2', '22867274-2', '19240429-0', '10414898-0',
  '20203059-9', '13875971-7', '15909800-1', '19948897-K', '17212700-2', '18985919-8',
  '10152982-7'
)
ORDER BY shift DESC, name;
