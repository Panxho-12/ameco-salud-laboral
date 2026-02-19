-- Script para eliminar los 2 nuevos supervisores
-- Usar solo si necesitas revertir los cambios

-- Eliminar los supervisores nuevos
DELETE FROM users 
WHERE username IN ('16733796-1', '18970956-0');

-- Verificar que se eliminaron
SELECT 
  COUNT(*) FILTER (WHERE role = 'supervisor' AND shift = 'A') as supervisores_turno_A,
  COUNT(*) FILTER (WHERE role = 'supervisor' AND shift = 'B') as supervisores_turno_B,
  COUNT(*) FILTER (WHERE role = 'supervisor') as total_supervisores
FROM users;

-- Mostrar todos los supervisores restantes
SELECT shift, username, name
FROM users
WHERE role = 'supervisor'
ORDER BY shift, name;
