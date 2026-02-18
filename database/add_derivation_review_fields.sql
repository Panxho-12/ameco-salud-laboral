-- Agregar campos para tracking de revisión por prevencionista
-- Estos campos registran cuando el prevencionista revisa un caso de derivación

ALTER TABLE daily_forms 
ADD COLUMN IF NOT EXISTS derivation_reviewed BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS derivation_reviewed_by VARCHAR(255),
ADD COLUMN IF NOT EXISTS derivation_reviewed_at TIMESTAMP,
ADD COLUMN IF NOT EXISTS derivation_review_notes TEXT;

-- Verificar que los campos se agregaron correctamente
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'daily_forms' 
AND column_name IN ('derivation_reviewed', 'derivation_reviewed_by', 'derivation_reviewed_at', 'derivation_review_notes')
ORDER BY column_name;
