-- Agregar campo para nota de derivación del supervisor
-- Este campo almacena el contexto/razón cuando el supervisor marca "SÍ" en derivación

ALTER TABLE daily_forms 
ADD COLUMN IF NOT EXISTS supervisor_derivation_note TEXT;

-- Verificar que el campo se agregó correctamente
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'daily_forms' 
AND column_name = 'supervisor_derivation_note';
