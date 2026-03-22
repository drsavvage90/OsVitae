-- ============================================
-- Security Hardening
-- ============================================


-- ─── STORAGE BUCKET & POLICIES ─────────────
-- File path convention: {user_id}/...
-- This ensures RLS can verify ownership via the first folder segment.

INSERT INTO storage.buckets (id, name, public)
VALUES ('user-files', 'user-files', false)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Users can upload own files"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'user-files' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can view own files"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'user-files' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can update own files"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'user-files' AND
    auth.uid()::text = (storage.foldername(name))[1]
  )
  WITH CHECK (
    bucket_id = 'user-files' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can delete own files"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'user-files' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );


-- ─── FIX goal_tasks RLS ────────────────────
-- Previously only checked goal ownership; now also verifies task ownership.

DROP POLICY IF EXISTS "Users can view own goal tasks" ON goal_tasks;
DROP POLICY IF EXISTS "Users can insert own goal tasks" ON goal_tasks;
DROP POLICY IF EXISTS "Users can delete own goal tasks" ON goal_tasks;

CREATE POLICY "Users can view own goal tasks" ON goal_tasks FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM goals WHERE goals.id = goal_tasks.goal_id AND goals.user_id = auth.uid())
    AND EXISTS (SELECT 1 FROM tasks WHERE tasks.id = goal_tasks.task_id AND tasks.user_id = auth.uid())
  );

CREATE POLICY "Users can insert own goal tasks" ON goal_tasks FOR INSERT
  WITH CHECK (
    EXISTS (SELECT 1 FROM goals WHERE goals.id = goal_tasks.goal_id AND goals.user_id = auth.uid())
    AND EXISTS (SELECT 1 FROM tasks WHERE tasks.id = goal_tasks.task_id AND tasks.user_id = auth.uid())
  );

CREATE POLICY "Users can delete own goal tasks" ON goal_tasks FOR DELETE
  USING (
    EXISTS (SELECT 1 FROM goals WHERE goals.id = goal_tasks.goal_id AND goals.user_id = auth.uid())
  );
