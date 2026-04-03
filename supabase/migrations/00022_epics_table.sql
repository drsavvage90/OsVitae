-- Epics table + FK from tasks.epic_id → epics.id

-- ─── EPICS TABLE ───────────────────────────────
CREATE TABLE epics (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  workspace_id uuid REFERENCES workspaces(id) ON DELETE SET NULL,
  title        text NOT NULL,
  description  text,
  status       text DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'done', 'cancelled')),
  color        text,
  position     integer DEFAULT 0,
  created_at   timestamptz DEFAULT now(),
  updated_at   timestamptz DEFAULT now()
);

CREATE TRIGGER epics_updated_at
  BEFORE UPDATE ON epics
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ─── INDEXES ───────────────────────────────────
CREATE INDEX idx_epics_user      ON epics(user_id);
CREATE INDEX idx_epics_workspace ON epics(workspace_id);

-- ─── RLS ───────────────────────────────────────
ALTER TABLE epics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own epics"  ON epics FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own epics" ON epics FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own epics" ON epics FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own epics" ON epics FOR DELETE USING (auth.uid() = user_id);

-- ─── FK FROM TASKS ─────────────────────────────
ALTER TABLE tasks
  ADD CONSTRAINT fk_tasks_epic FOREIGN KEY (epic_id) REFERENCES epics(id) ON DELETE SET NULL;
