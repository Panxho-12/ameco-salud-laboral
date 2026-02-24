-- ============================================
-- SCRIPT DE LIMPIEZA COMPLETA PARA PRODUCCIÓN
-- ============================================
-- Este script elimina:
-- 1. TODOS los formularios (Turno A y Turno B)
-- 2. TODAS las firmas digitales (todos los usuarios)
-- ============================================
-- IMPORTANTE: Ejecutar este script SOLO cuando estés listo
-- para poner el sistema en producción limpio
-- ============================================

-- PASO 1: Eliminar TODOS los formularios
-- ============================================

DELETE FROM daily_forms;

-- Verificar eliminación de formularios
SELECT 
    'Formularios eliminados' as accion,
    COUNT(*) as total
FROM daily_forms;

-- PASO 2: Eliminar TODAS las firmas digitales
-- ============================================

DELETE FROM digital_signatures;

-- Verificar eliminación de firmas
SELECT 
    'Firmas eliminadas' as accion,
    COUNT(*) as total
FROM digital_signatures;

-- PASO 3: Verificación final
-- ============================================

-- Contar usuarios por turno (NO se eliminan)
SELECT 
    'Usuarios Turno A' as descripcion,
    COUNT(*) as total
FROM users 
WHERE shift = 'A';

SELECT 
    'Usuarios Turno B' as descripcion,
    COUNT(*) as total
FROM users 
WHERE shift = 'B';

SELECT 
    'Supervisores' as descripcion,
    COUNT(*) as total
FROM users 
WHERE role = 'supervisor';

SELECT 
    'Prevencionistas' as descripcion,
    COUNT(*) as total
FROM users 
WHERE role = 'ohsem';

SELECT 
    'Jefes de Operaciones' as descripcion,
    COUNT(*) as total
FROM users 
WHERE role = 'operations_manager';

-- Verificar que no queden formularios
SELECT 
    'Formularios restantes' as descripcion,
    COUNT(*) as total
FROM daily_forms;

-- Verificar que no queden firmas
SELECT 
    'Firmas restantes' as descripcion,
    COUNT(*) as total
FROM digital_signatures;

-- Verificar turnos activos (NO se eliminan)
SELECT 
    'Turnos activos' as descripcion,
    COUNT(*) as total
FROM shifts
WHERE status = 'active';

-- Mensaje final
DO $$
BEGIN
    RAISE NOTICE '============================================';
    RAISE NOTICE 'LIMPIEZA COMPLETA EXITOSA';
    RAISE NOTICE '============================================';
    RAISE NOTICE 'Se eliminaron:';
    RAISE NOTICE '- TODOS los formularios (Turno A y B)';
    RAISE NOTICE '- TODAS las firmas digitales';
    RAISE NOTICE '';
    RAISE NOTICE 'Se mantuvieron:';
    RAISE NOTICE '- Todos los usuarios (63 usuarios)';
    RAISE NOTICE '- Todos los turnos activos';
    RAISE NOTICE '- Estructura de la base de datos';
    RAISE NOTICE '============================================';
    RAISE NOTICE 'El sistema está listo para producción';
    RAISE NOTICE 'Los usuarios pueden crear sus firmas y formularios';
    RAISE NOTICE '============================================';
END $$;
