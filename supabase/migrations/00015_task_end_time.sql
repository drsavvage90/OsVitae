-- Add end_time column to tasks for time block duration
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS end_time time;
