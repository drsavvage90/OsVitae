-- ============================================
-- OSVitae — Projects (filing system within workspaces)
-- ============================================

-- ─── PROJECTS TABLE ────────────────────────
CREATE TABLE projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  workspace_id uuid NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  name text NOT NULL,
  icon text,
  color text,
  position integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TRIGGER projects_updated_at
  BEFORE UPDATE ON projects
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ─── ADD project_id TO TASKS ───────────────
ALTER TABLE tasks ADD COLUMN project_id uuid REFERENCES projects(id) ON DELETE SET NULL;

-- ─── INDEXES ───────────────────────────────
CREATE INDEX idx_projects_user ON projects(user_id);
CREATE INDEX idx_projects_workspace ON projects(workspace_id);
CREATE INDEX idx_tasks_project ON tasks(project_id);

-- ─── ROW LEVEL SECURITY ────────────────────
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own projects" ON projects FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own projects" ON projects FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own projects" ON projects FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own projects" ON projects FOR DELETE USING (auth.uid() = user_id);
