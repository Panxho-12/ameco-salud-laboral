-- Script para limpiar todos los formularios del sistema
-- Mantiene: usuarios, turnos
-- Elimina: todos los formularios (daily_forms)

-- IMPORTANTE: Este script eliminará TODOS los formularios del sistema
-- Los usuarios y turnos se mantendrán intactos

-- Eliminar todos los formularios
DELETE FROM daily_forms;

-- Verificar que se eliminaron todos los formularios
SELECT COUNT(*) as formularios_restantes FROM daily_forms;

-- Verificar que los usuarios siguen existiendo
SELECT COUNT(*) as usuarios_activos FROM users;

-- Verificar que los turnos siguen existiendo
SELECT COUNT(*) as turnos_activos FROM shifts;

-- Mensaje de confirmación
SELECT 
  'Limpieza completada exitosamente' as mensaje,
  (SELECT COUNT(*) FROM daily_forms) as formularios,
  (SELECT COUNT(*) FROM users) as usuarios,
  (SELECT COUNT(*) FROM shifts) as turnos;
