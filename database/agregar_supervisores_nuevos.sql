-- Script para agregar 2 nuevos supervisores
-- Fecha: 19/02/2026
-- Contraseña para todos: Ameco@2025

-- Supervisor Turno A
INSERT INTO users (username, password, name, role, shift) VALUES
('16733796-1', 'Ameco@2025', 'Pizarro Lopez Alice Estefania Elizabeth', 'supervisor', 'A');

-- Supervisor Turno B
INSERT INTO users (username, password, name, role, shift) VALUES
('18970956-0', 'Ameco@2025', 'Campusano Alarcon Diego Enrique', 'supervisor', 'B');

-- Verificar que se agregaron correctamente
SELECT 
  COUNT(*) FILTER (WHERE role = 'supervisor' AND shift = 'A') as supervisores_turno_A,
  COUNT(*) FILTER (WHERE role = 'supervisor' AND shift = 'B') as supervisores_turno_B,
  COUNT(*) FILTER (WHERE role = 'supervisor') as total_supervisores
FROM users;

-- Mostrar los nuevos supervisores agregados
SELECT id, username, name, role, shift, created_at
FROM users 
WHERE username IN ('16733796-1', '18970956-0')
ORDER BY shift, name;

-- Mostrar todos los supervisores por turno
SELECT shift, username, name
FROM users
WHERE role = 'supervisor'
ORDER BY shift, name;
