-- Migration: Add signature_id columns to daily_forms table
-- Date: 2026-02-16
-- Purpose: Fix signature image display by tracking which user signed each form

-- Add the missing signature_id columns
ALTER TABLE daily_forms 
  ADD COLUMN IF NOT EXISTS supervisor_signature_id BIGINT REFERENCES users(id),
  ADD COLUMN IF NOT EXISTS operations_manager_signature_id BIGINT REFERENCES users(id),
  ADD COLUMN IF NOT EXISTS ohsem_signature_id BIGINT REFERENCES users(id);

-- Add indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_daily_forms_supervisor_signature_id ON daily_forms(supervisor_signature_id);
CREATE INDEX IF NOT EXISTS idx_daily_forms_operations_manager_signature_id ON daily_forms(operations_manager_signature_id);
CREATE INDEX IF NOT EXISTS idx_daily_forms_ohsem_signature_id ON daily_forms(ohsem_signature_id);

-- Verify the columns were added
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'daily_forms' 
  AND column_name IN ('supervisor_signature_id', 'operations_manager_signature_id', 'ohsem_signature_id');
