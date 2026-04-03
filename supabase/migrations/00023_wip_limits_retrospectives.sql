-- WIP limits on projects + retrospectives table

-- ─── WIP LIMITS ON PROJECTS ────────────────────
ALTER TABLE projects ADD COLUMN wip_limit_todo        integer;
ALTER TABLE projects ADD COLUMN wip_limit_in_progress integer;
ALTER TABLE projects ADD COLUMN wip_limit_in_review   integer;

-- ─── RETROSPECTIVES TABLE ──────────────────────
CREATE TABLE retrospectives (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  sprint_id    uuid NOT NULL REFERENCES sprints(id) ON DELETE CASCADE,
  went_well    text,
  improvements text,
  action_items text[] DEFAULT '{}',
  mood         smallint CHECK (mood BETWEEN 1 AND 5),
  created_at   timestamptz DEFAULT now(),
  updated_at   timestamptz DEFAULT now()
);

CREATE TRIGGER retrospectives_updated_at
  BEFORE UPDATE ON retrospectives
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ─── INDEXES ───────────────────────────────────
CREATE INDEX idx_retrospectives_sprint ON retrospectives(sprint_id);

-- ─── RLS ───────────────────────────────────────
ALTER TABLE retrospectives ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own retrospectives"  ON retrospectives FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own retrospectives" ON retrospectives FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own retrospectives" ON retrospectives FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own retrospectives" ON retrospectives FOR DELETE USING (auth.uid() = user_id);
