-- Add due_days array column for bills with multiple due dates
ALTER TABLE bills ADD COLUMN due_days integer[] DEFAULT NULL;

-- Migrate existing due_day values into due_days array
UPDATE bills SET due_days = ARRAY[due_day] WHERE due_day IS NOT NULL AND due_days IS NULL;
