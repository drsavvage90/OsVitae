-- Audit log table for tracking user actions

-- ─── AUDIT LOG TABLE ──────────────────────────
CREATE TABLE audit_log (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  action        text NOT NULL,
  resource_type text,
  resource_id   text,
  old_value     jsonb,
  new_value     jsonb,
  created_at    timestamptz DEFAULT now()
);

-- ─── INDEXES ───────────────────────────────────
CREATE INDEX idx_audit_log_user       ON audit_log(user_id);
CREATE INDEX idx_audit_log_created_at ON audit_log(created_at DESC);
CREATE INDEX idx_audit_log_action     ON audit_log(action);
CREATE INDEX idx_audit_log_resource   ON audit_log(resource_type);

-- ─── RLS ───────────────────────────────────────
ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own audit log"  ON audit_log FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own audit log" ON audit_log FOR INSERT WITH CHECK (auth.uid() = user_id);
