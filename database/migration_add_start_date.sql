-- Migration: Add start_date to shifts table
-- Date: 2026-02-16
-- Purpose: Enable automatic day progression based on calendar dates for 10x10 shifts

-- Add start_date column (defaults to today for existing shifts)
ALTER TABLE shifts 
  ADD COLUMN IF NOT EXISTS start_date DATE NOT NULL DEFAULT CURRENT_DATE;

-- For existing active shifts, set start_date to created_at date
UPDATE shifts 
SET start_date = DATE(created_at)
WHERE start_date IS NULL OR start_date = CURRENT_DATE;

-- Add index for better query performance
CREATE INDEX IF NOT EXISTS idx_shifts_start_date ON shifts(start_date);

-- Verify the column was added
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'shifts' 
  AND column_name = 'start_date';
