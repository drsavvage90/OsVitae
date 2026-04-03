-- Add agile/sprint fields to tasks: type enum, blocked flag, acceptance
-- criteria, story points, and nullable FK stubs for sprint_id / epic_id.

-- ─── TASK TYPE ENUM ────────────────────────────
CREATE TYPE task_type AS ENUM ('feature', 'bug', 'security', 'debt', 'incident');

-- ─── NEW COLUMNS ───────────────────────────────
ALTER TABLE tasks
  ADD COLUMN type             task_type  DEFAULT 'feature',
  ADD COLUMN blocked          boolean    DEFAULT false,
  ADD COLUMN acceptance_criteria text,
  ADD COLUMN story_points     smallint   CHECK (story_points BETWEEN 1 AND 21),
  ADD COLUMN sprint_id        uuid,
  ADD COLUMN epic_id          uuid;

-- NOTE: sprint_id and epic_id are plain uuid columns for now.
-- FK constraints will be added when the sprints and epics tables are created.

-- ─── INDEXES ───────────────────────────────────
CREATE INDEX idx_tasks_sprint ON tasks(sprint_id);
CREATE INDEX idx_tasks_epic   ON tasks(epic_id);
CREATE INDEX idx_tasks_type   ON tasks(type);

-- ─── RLS ───────────────────────────────────────
-- Existing row-level policies on tasks already enforce
-- auth.uid() = user_id for SELECT / INSERT / UPDATE / DELETE,
-- so the new columns are automatically covered — no new policies needed.
