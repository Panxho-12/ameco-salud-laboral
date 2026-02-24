-- ============================================
-- SCRIPT DE LIMPIEZA: Eliminar datos de prueba
-- ============================================
-- Este script elimina todos los datos de prueba creados:
-- 1. Formularios del día 6 del Turno B
-- 2. Firmas digitales de todos los usuarios del Turno B
-- ============================================

-- PASO 1: Eliminar formularios del día 6 del Turno B
-- ============================================

DELETE FROM daily_forms
WHERE shift_id IN (
    SELECT s.id 
    FROM shifts s
    INNER JOIN users u ON s.user_id = u.id
    WHERE u.shift = 'B' AND u.role = 'worker'
)
AND day_number = 6;

-- Verificar eliminación de formularios
SELECT 
    'Formularios eliminados' as tipo,
    COUNT(*) as total
FROM daily_forms df
INNER JOIN shifts s ON df.shift_id = s.id
INNER JOIN users u ON s.user_id = u.id
WHERE u.shift = 'B' 
AND u.role = 'worker'
AND df.day_number = 6;

-- PASO 2: Eliminar firmas digitales del Turno B
-- ============================================

DELETE FROM digital_signatures
WHERE user_id IN (
    SELECT id FROM users WHERE shift = 'B'
);

-- Verificar eliminación de firmas
SELECT 
    'Firmas eliminadas' as tipo,
    COUNT(*) as total
FROM digital_signatures ds
INNER JOIN users u ON ds.user_id = u.id
WHERE u.shift = 'B';

-- PASO 3: Resumen de limpieza
-- ============================================

SELECT 
    'Usuarios del Turno B' as descripcion,
    COUNT(*) as total
FROM users 
WHERE shift = 'B';

SELECT 
    'Formularios restantes del Turno B' as descripcion,
    COUNT(*) as total
FROM daily_forms df
INNER JOIN shifts s ON df.shift_id = s.id
INNER JOIN users u ON s.user_id = u.id
WHERE u.shift = 'B';

SELECT 
    'Firmas restantes del Turno B' as descripcion,
    COUNT(*) as total
FROM digital_signatures ds
INNER JOIN users u ON ds.user_id = u.id
WHERE u.shift = 'B';

-- Mensaje final
DO $$
BEGIN
    RAISE NOTICE '============================================';
    RAISE NOTICE 'DATOS DE PRUEBA ELIMINADOS EXITOSAMENTE';
    RAISE NOTICE '============================================';
    RAISE NOTICE 'Se eliminaron:';
    RAISE NOTICE '- Formularios del día 6 del Turno B';
    RAISE NOTICE '- Firmas digitales del Turno B';
    RAISE NOTICE '============================================';
    RAISE NOTICE 'Los usuarios ahora pueden crear sus propias firmas';
    RAISE NOTICE 'y completar sus formularios reales.';
    RAISE NOTICE '============================================';
END $$;
