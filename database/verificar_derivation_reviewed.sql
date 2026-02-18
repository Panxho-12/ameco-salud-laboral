-- Verificar que los campos de revisión existen y tienen datos

-- Ver estructura de la tabla
SELECT column_name, data_type 
FROM information_schema.columns
WHERE table_name = 'daily_forms' 
AND column_name LIKE '%derivation%'
ORDER BY column_name;

-- Ver registros con derivación marcada como "si"
SELECT 
    id,
    shift_id,
    day_number,
    supervisor_requires_derivation,
    supervisor_derivation_note,
    derivation_reviewed,
    derivation_reviewed_by,
    derivation_reviewed_at,
    derivation_review_notes
FROM daily_forms
WHERE supervisor_requires_derivation = 'si'
ORDER BY created_at DESC
LIMIT 10;
