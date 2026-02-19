-- ============================================
-- SCRIPT DE PRUEBA: Crear formularios y firmas para Turno B
-- ============================================
-- Este script crea datos de prueba para probar:
-- 1. Firma masiva de supervisor
-- 2. Botón "Marcar Todos NO requiere derivación"
-- 3. Generación de PDFs
-- ============================================

-- PASO 0: LIMPIAR DATOS EXISTENTES DEL TURNO B
-- ============================================

-- Eliminar formularios existentes del Turno B
DELETE FROM daily_forms
WHERE shift_id IN (
    SELECT s.id 
    FROM shifts s
    INNER JOIN users u ON s.user_id = u.id
    WHERE u.shift = 'B'
);

-- Eliminar firmas existentes del Turno B
DELETE FROM digital_signatures
WHERE user_id IN (
    SELECT id FROM users WHERE shift = 'B'
);

-- Verificar limpieza
SELECT 
    'Formularios eliminados del Turno B' as accion,
    COUNT(*) as total
FROM daily_forms df
INNER JOIN shifts s ON df.shift_id = s.id
INNER JOIN users u ON s.user_id = u.id
WHERE u.shift = 'B';

SELECT 
    'Firmas eliminadas del Turno B' as accion,
    COUNT(*) as total
FROM digital_signatures ds
INNER JOIN users u ON ds.user_id = u.id
WHERE u.shift = 'B';

-- PASO 1: Crear firmas genéricas para todos los usuarios del Turno B
-- ============================================

-- Firma genérica (imagen base64 de una firma simple)
-- Esta es una firma de prueba pequeña
DO $$
DECLARE
    generic_signature TEXT := 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
    user_record RECORD;
BEGIN
    -- Insertar firmas para todos los usuarios del Turno B
    FOR user_record IN 
        SELECT id, name FROM users WHERE shift = 'B'
    LOOP
        -- Insertar nueva firma genérica
        INSERT INTO digital_signatures (user_id, signature_data, created_at)
        VALUES (user_record.id, generic_signature, NOW());
        
        RAISE NOTICE 'Firma creada para: %', user_record.name;
    END LOOP;
END $$;

-- PASO 2: Crear formularios completos para el día 6 (día actual del Turno B)
-- ============================================

DO $$
DECLARE
    user_record RECORD;
    shift_record RECORD;
    form_data JSONB;
BEGIN
    -- Para cada trabajador (worker) del Turno B
    FOR user_record IN 
        SELECT id, name FROM users WHERE shift = 'B' AND role = 'worker'
    LOOP
        -- Obtener el turno activo del usuario
        SELECT * INTO shift_record 
        FROM shifts 
        WHERE user_id = user_record.id 
        ORDER BY created_at DESC 
        LIMIT 1;
        
        IF shift_record.id IS NOT NULL THEN
            -- Crear datos del formulario (todos "no" para simular trabajador saludable)
            form_data := jsonb_build_object(
                'conditions', jsonb_build_object(
                    'day1', 'no', 'day2', 'no', 'day3', 'no', 'day4', 'no', 'day5', 'no',
                    'day6', 'no', 'day7', 'no', 'day8', 'no', 'day9', 'no', 'day10', 'no'
                ),
                'fatigue', jsonb_build_object(
                    'day1', 'no', 'day2', 'no', 'day3', 'no', 'day4', 'no', 'day5', 'no',
                    'day6', 'no', 'day7', 'no', 'day8', 'no', 'day9', 'no', 'day10', 'no'
                )
            );
            
            -- Insertar formulario del día 6 marcado como firmado por el trabajador
            INSERT INTO daily_forms (
                shift_id, 
                day_number, 
                form_data, 
                worker_signed,
                created_at,
                updated_at
            ) VALUES (
                shift_record.id,
                6,
                form_data,
                true,
                NOW(),
                NOW()
            );
            
            RAISE NOTICE 'Formulario creado para: % (shift_id: %)', user_record.name, shift_record.id;
        ELSE
            RAISE NOTICE 'No se encontró turno para: %', user_record.name;
        END IF;
    END LOOP;
END $$;

-- PASO 3: Verificar resultados
-- ============================================

-- Contar firmas creadas
SELECT 
    'Firmas creadas' as tipo,
    COUNT(*) as total
FROM digital_signatures ds
INNER JOIN users u ON ds.user_id = u.id
WHERE u.shift = 'B';

-- Contar formularios creados
SELECT 
    'Formularios creados' as tipo,
    COUNT(*) as total
FROM daily_forms df
INNER JOIN shifts s ON df.shift_id = s.id
INNER JOIN users u ON s.user_id = u.id
WHERE u.shift = 'B' 
AND u.role = 'worker'
AND df.day_number = 6
AND df.worker_signed = true;

-- Listar todos los formularios pendientes de firma de supervisor
SELECT 
    u.name as trabajador,
    u.shift as turno,
    df.day_number as dia,
    df.worker_signed as firmado_trabajador,
    df.supervisor_signed as firmado_supervisor,
    df.created_at as fecha_creacion
FROM daily_forms df
INNER JOIN shifts s ON df.shift_id = s.id
INNER JOIN users u ON s.user_id = u.id
WHERE u.shift = 'B' 
AND u.role = 'worker'
AND df.day_number = 6
ORDER BY u.name;

RAISE NOTICE '============================================';
RAISE NOTICE 'DATOS DE PRUEBA CREADOS EXITOSAMENTE';
RAISE NOTICE '============================================';
RAISE NOTICE 'Ahora puedes:';
RAISE NOTICE '1. Iniciar sesión como supervisor del Turno B';
RAISE NOTICE '2. Probar el botón "Marcar Todos NO requiere derivación"';
RAISE NOTICE '3. Probar el botón "Firmar Todos los Pendientes"';
RAISE NOTICE '4. Generar PDFs de los formularios';
RAISE NOTICE '============================================';
