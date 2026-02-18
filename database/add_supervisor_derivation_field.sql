-- Agregar campo para la respuesta del supervisor sobre derivación
-- Este campo se llena cuando el supervisor firma el formulario

ALTER TABLE daily_forms 
ADD COLUMN IF NOT EXISTS supervisor_requires_derivation TEXT;

-- Comentario: 
-- supervisor_requires_derivation puede ser: 'si', 'no', o NULL (si aún no ha sido marcado)
-- Solo el supervisor puede marcar este campo al revisar el formulario del operador
