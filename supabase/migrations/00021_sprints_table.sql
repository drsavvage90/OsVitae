-- Sprints table + FK from tasks.sprint_id → sprints.id

-- ─── SPRINTS TABLE ─────────────────────────────
CREATE TABLE sprints (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  workspace_id uuid REFERENCES workspaces(id) ON DELETE CASCADE,
  name         text NOT NULL,
  goal         text,
  start_date   date NOT NULL,
  end_date     date NOT NULL,
  status       text DEFAULT 'planning' CHECK (status IN ('planning', 'active', 'review', 'closed')),
  capacity     integer,
  velocity     integer,
  created_at   timestamptz DEFAULT now(),
  updated_at   timestamptz DEFAULT now()
);

CREATE TRIGGER sprints_updated_at
  BEFORE UPDATE ON sprints
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ─── INDEXES ───────────────────────────────────
CREATE INDEX idx_sprints_user      ON sprints(user_id);
CREATE INDEX idx_sprints_workspace ON sprints(workspace_id);
CREATE INDEX idx_sprints_status    ON sprints(status);

-- ─── RLS ───────────────────────────────────────
ALTER TABLE sprints ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own sprints"  ON sprints FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own sprints" ON sprints FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own sprints" ON sprints FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own sprints" ON sprints FOR DELETE USING (auth.uid() = user_id);

-- ─── FK FROM TASKS ─────────────────────────────
ALTER TABLE tasks
  ADD CONSTRAINT fk_tasks_sprint FOREIGN KEY (sprint_id) REFERENCES sprints(id) ON DELETE SET NULL;
