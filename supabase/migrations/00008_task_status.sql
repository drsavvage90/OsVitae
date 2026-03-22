-- Add status column to tasks for kanban board workflow tracking
-- Values: 'todo', 'in_progress', 'in_review', 'done'
-- Backfill from existing done boolean

CREATE TYPE task_status AS ENUM ('todo', 'in_progress', 'in_review', 'done');

ALTER TABLE tasks ADD COLUMN status task_status DEFAULT 'todo';

-- Backfill: existing done tasks → 'done', others → 'todo'
UPDATE tasks SET status = CASE WHEN done = true THEN 'done'::task_status ELSE 'todo'::task_status END;

-- Make non-nullable after backfill
ALTER TABLE tasks ALTER COLUMN status SET NOT NULL;
