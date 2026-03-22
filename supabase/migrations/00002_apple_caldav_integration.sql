-- ============================================
-- Apple CalDAV Integration
-- ============================================

-- ─── APPLE CREDENTIALS ──────────────────────

CREATE TABLE apple_credentials (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  apple_id text NOT NULL,
  app_password_encrypted text NOT NULL,
  caldav_principal text,
  calendar_home_set text,
  selected_calendar_id text,
  selected_reminders_id text,
  last_sync_at timestamptz,
  sync_enabled boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TRIGGER apple_credentials_updated_at
  BEFORE UPDATE ON apple_credentials
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

ALTER TABLE apple_credentials ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own apple creds" ON apple_credentials FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own apple creds" ON apple_credentials FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own apple creds" ON apple_credentials FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own apple creds" ON apple_credentials FOR DELETE USING (auth.uid() = user_id);

CREATE INDEX idx_apple_credentials_user ON apple_credentials(user_id);


-- ─── SYNC TRACKING COLUMNS ──────────────────

-- time_blocks already has external_id; add etag and href
ALTER TABLE time_blocks ADD COLUMN IF NOT EXISTS caldav_etag text;
ALTER TABLE time_blocks ADD COLUMN IF NOT EXISTS caldav_href text;

-- tasks needs external_id, etag, and href
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS external_id text;
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS caldav_etag text;
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS caldav_href text;


-- ─── SYNC LOG ────────────────────────────────

CREATE TABLE sync_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  sync_type text NOT NULL,
  direction text NOT NULL,
  status text NOT NULL,
  items_synced integer DEFAULT 0,
  error_message text,
  started_at timestamptz DEFAULT now(),
  completed_at timestamptz
);

ALTER TABLE sync_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own sync logs" ON sync_log FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own sync logs" ON sync_log FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE INDEX idx_sync_log_user ON sync_log(user_id);
