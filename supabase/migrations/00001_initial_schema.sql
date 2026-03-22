-- ============================================
-- OSVitae — Initial Database Schema
-- ============================================

-- ─── ENUMS ───────────────────────────────────

CREATE TYPE task_priority AS ENUM ('high', 'medium', 'low');
CREATE TYPE task_section AS ENUM ('morning', 'afternoon', 'evening');
CREATE TYPE contact_context AS ENUM ('Academic', 'Client', 'Community', 'Student', 'Personal');
CREATE TYPE contact_health AS ENUM ('strong', 'needs-attention', 'fading');
CREATE TYPE interaction_type AS ENUM ('meeting', 'email', 'message', 'call');
CREATE TYPE habit_frequency AS ENUM ('daily', 'weekly');
CREATE TYPE goal_status AS ENUM ('in-progress', 'on-track', 'at-risk', 'completed');
CREATE TYPE time_block_type AS ENUM ('work', 'break', 'personal');
CREATE TYPE doc_type AS ENUM ('doc', 'pdf', 'code', 'image', 'other');


-- ─── HELPER FUNCTION ─────────────────────────

CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;


-- ─── PROFILES ────────────────────────────────

CREATE TABLE profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name text,
  xp integer DEFAULT 0,
  level integer DEFAULT 1,
  streak integer DEFAULT 0,
  total_pomos_ever integer DEFAULT 0,
  total_tasks_done integer DEFAULT 0,
  intention_text text,
  theme text DEFAULT 'default',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name, theme)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    'default'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();


-- ─── WORKSPACES ──────────────────────────────

CREATE TABLE workspaces (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  icon text,
  color text,
  position integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TRIGGER workspaces_updated_at
  BEFORE UPDATE ON workspaces
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();


-- ─── TASKS ───────────────────────────────────

CREATE TABLE tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  workspace_id uuid REFERENCES workspaces(id) ON DELETE SET NULL,
  title text NOT NULL,
  description text,
  priority task_priority DEFAULT 'medium',
  section task_section DEFAULT 'afternoon',
  due_date date,
  due_time time,
  done boolean DEFAULT false,
  total_pomos integer DEFAULT 0,
  done_pomos integer DEFAULT 0,
  reward text,
  position integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TRIGGER tasks_updated_at
  BEFORE UPDATE ON tasks
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();


-- ─── SUBTASKS ────────────────────────────────

CREATE TABLE subtasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  task_id uuid NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  text text NOT NULL,
  done boolean DEFAULT false,
  xp integer DEFAULT 10,
  position integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);


-- ─── TASK NOTES ──────────────────────────────

CREATE TABLE task_notes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  task_id uuid NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  text text NOT NULL,
  created_at timestamptz DEFAULT now()
);


-- ─── TASK ATTACHMENTS ────────────────────────

CREATE TABLE task_attachments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  task_id uuid NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  name text NOT NULL,
  size text,
  type doc_type,
  storage_path text,
  created_at timestamptz DEFAULT now()
);


-- ─── CONTACTS ────────────────────────────────

CREATE TABLE contacts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  email text,
  phone text,
  context contact_context,
  tags text[] DEFAULT '{}',
  last_contact_at timestamptz,
  next_follow_up date,
  health contact_health DEFAULT 'strong',
  notes text,
  external_id text, -- CardDAV / Apple Contacts UID
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TRIGGER contacts_updated_at
  BEFORE UPDATE ON contacts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();


-- ─── CONTACT INTERACTIONS ────────────────────

CREATE TABLE contact_interactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  contact_id uuid NOT NULL REFERENCES contacts(id) ON DELETE CASCADE,
  type interaction_type,
  text text NOT NULL,
  interaction_date date,
  created_at timestamptz DEFAULT now()
);


-- ─── HABITS ──────────────────────────────────

CREATE TABLE habits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  icon text,
  color text,
  frequency habit_frequency DEFAULT 'daily',
  streak integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TRIGGER habits_updated_at
  BEFORE UPDATE ON habits
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();


-- ─── HABIT COMPLETIONS ───────────────────────

CREATE TABLE habit_completions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  habit_id uuid NOT NULL REFERENCES habits(id) ON DELETE CASCADE,
  completed_date date NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE (habit_id, completed_date)
);


-- ─── GOALS ───────────────────────────────────

CREATE TABLE goals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL,
  quarter text,
  status goal_status DEFAULT 'in-progress',
  progress integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TRIGGER goals_updated_at
  BEFORE UPDATE ON goals
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();


-- ─── KEY RESULTS ─────────────────────────────

CREATE TABLE key_results (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  goal_id uuid NOT NULL REFERENCES goals(id) ON DELETE CASCADE,
  title text NOT NULL,
  progress integer DEFAULT 0,
  target numeric,
  current numeric,
  position integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);


-- ─── GOAL ↔ TASK LINKS ──────────────────────

CREATE TABLE goal_tasks (
  goal_id uuid NOT NULL REFERENCES goals(id) ON DELETE CASCADE,
  task_id uuid NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  PRIMARY KEY (goal_id, task_id)
);


-- ─── JOURNAL ENTRIES ─────────────────────────

CREATE TABLE journal_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  entry_date date NOT NULL,
  content text,
  mood smallint CHECK (mood BETWEEN 1 AND 5),
  energy smallint CHECK (energy BETWEEN 1 AND 5),
  wins text[] DEFAULT '{}',
  blockers text[] DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TRIGGER journal_entries_updated_at
  BEFORE UPDATE ON journal_entries
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();


-- ─── TIME BLOCKS (CALENDAR) ─────────────────

CREATE TABLE time_blocks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL,
  block_date date DEFAULT CURRENT_DATE,
  start_hour numeric NOT NULL,
  end_hour numeric NOT NULL,
  task_id uuid REFERENCES tasks(id) ON DELETE SET NULL,
  color text,
  type time_block_type DEFAULT 'work',
  external_id text, -- CalDAV event UID
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TRIGGER time_blocks_updated_at
  BEFORE UPDATE ON time_blocks
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();


-- ─── BOOKMARKS ───────────────────────────────

CREATE TABLE bookmarks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL,
  url text,
  description text,
  tags text[] DEFAULT '{}',
  workspace_id uuid REFERENCES workspaces(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now()
);


-- ─── WORKOUTS ────────────────────────────────

CREATE TABLE workouts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  workout_date date NOT NULL,
  type text,
  duration integer, -- minutes
  distance text,
  notes text,
  calories integer,
  created_at timestamptz DEFAULT now()
);


-- ─── HEALTH METRICS ─────────────────────────

CREATE TABLE health_metrics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  metric_date date NOT NULL,
  weight numeric,
  sleep numeric, -- hours
  steps integer,
  water integer, -- glasses
  created_at timestamptz DEFAULT now(),
  UNIQUE (user_id, metric_date)
);


-- ─── INBOX ───────────────────────────────────

CREATE TABLE inbox_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  text text NOT NULL,
  triaged boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);


-- ─── TEMPLATES ───────────────────────────────

CREATE TABLE templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  category text,
  description text,
  items text[] DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TRIGGER templates_updated_at
  BEFORE UPDATE ON templates
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();


-- ─── WIKI ARTICLES ───────────────────────────

CREATE TABLE wiki_articles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL,
  category text,
  tags text[] DEFAULT '{}',
  content text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TRIGGER wiki_articles_updated_at
  BEFORE UPDATE ON wiki_articles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();


-- ─── WORKSPACE NOTES ─────────────────────────

CREATE TABLE workspace_notes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  workspace_id uuid NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  title text,
  text text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TRIGGER workspace_notes_updated_at
  BEFORE UPDATE ON workspace_notes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();


-- ─── WORKSPACE DOCS ──────────────────────────

CREATE TABLE workspace_docs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  workspace_id uuid NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  name text NOT NULL,
  type doc_type,
  size text,
  storage_path text,
  created_at timestamptz DEFAULT now()
);


-- ─── ACHIEVEMENTS ────────────────────────────

CREATE TABLE achievements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  achievement_key text NOT NULL,
  earned_at timestamptz,
  created_at timestamptz DEFAULT now(),
  UNIQUE (user_id, achievement_key)
);


-- ─── FOCUS SESSIONS ──────────────────────────

CREATE TABLE focus_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  task_id uuid REFERENCES tasks(id) ON DELETE SET NULL,
  duration_seconds integer NOT NULL,
  is_break boolean DEFAULT false,
  completed_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);


-- ============================================
-- INDEXES
-- ============================================

CREATE INDEX idx_workspaces_user ON workspaces(user_id);
CREATE INDEX idx_tasks_user_done ON tasks(user_id, done);
CREATE INDEX idx_tasks_user_workspace ON tasks(user_id, workspace_id);
CREATE INDEX idx_tasks_user_due ON tasks(user_id, due_date);
CREATE INDEX idx_subtasks_task ON subtasks(task_id);
CREATE INDEX idx_task_notes_task ON task_notes(task_id);
CREATE INDEX idx_task_attachments_task ON task_attachments(task_id);
CREATE INDEX idx_contacts_user ON contacts(user_id);
CREATE INDEX idx_contacts_user_health ON contacts(user_id, health);
CREATE INDEX idx_contact_interactions_contact ON contact_interactions(contact_id);
CREATE INDEX idx_habits_user ON habits(user_id);
CREATE INDEX idx_habit_completions_habit_date ON habit_completions(habit_id, completed_date);
CREATE INDEX idx_goals_user ON goals(user_id);
CREATE INDEX idx_key_results_goal ON key_results(goal_id);
CREATE INDEX idx_journal_user_date ON journal_entries(user_id, entry_date);
CREATE INDEX idx_time_blocks_user_date ON time_blocks(user_id, block_date);
CREATE INDEX idx_bookmarks_user ON bookmarks(user_id);
CREATE INDEX idx_workouts_user_date ON workouts(user_id, workout_date);
CREATE INDEX idx_health_metrics_user_date ON health_metrics(user_id, metric_date);
CREATE INDEX idx_inbox_user_triaged ON inbox_items(user_id, triaged);
CREATE INDEX idx_templates_user ON templates(user_id);
CREATE INDEX idx_wiki_user ON wiki_articles(user_id);
CREATE INDEX idx_workspace_notes_ws ON workspace_notes(workspace_id);
CREATE INDEX idx_workspace_docs_ws ON workspace_docs(workspace_id);
CREATE INDEX idx_achievements_user ON achievements(user_id);
CREATE INDEX idx_focus_sessions_user ON focus_sessions(user_id);
CREATE INDEX idx_focus_sessions_task ON focus_sessions(task_id);


-- ============================================
-- ROW LEVEL SECURITY
-- ============================================

-- Helper: generate RLS policies for a table with user_id column
-- Applied manually to each table below.

-- profiles (uses id, not user_id)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

-- workspaces
ALTER TABLE workspaces ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own workspaces" ON workspaces FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own workspaces" ON workspaces FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own workspaces" ON workspaces FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own workspaces" ON workspaces FOR DELETE USING (auth.uid() = user_id);

-- tasks
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own tasks" ON tasks FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own tasks" ON tasks FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own tasks" ON tasks FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own tasks" ON tasks FOR DELETE USING (auth.uid() = user_id);

-- subtasks
ALTER TABLE subtasks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own subtasks" ON subtasks FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own subtasks" ON subtasks FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own subtasks" ON subtasks FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own subtasks" ON subtasks FOR DELETE USING (auth.uid() = user_id);

-- task_notes
ALTER TABLE task_notes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own task notes" ON task_notes FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own task notes" ON task_notes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own task notes" ON task_notes FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own task notes" ON task_notes FOR DELETE USING (auth.uid() = user_id);

-- task_attachments
ALTER TABLE task_attachments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own task attachments" ON task_attachments FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own task attachments" ON task_attachments FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own task attachments" ON task_attachments FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own task attachments" ON task_attachments FOR DELETE USING (auth.uid() = user_id);

-- contacts
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own contacts" ON contacts FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own contacts" ON contacts FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own contacts" ON contacts FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own contacts" ON contacts FOR DELETE USING (auth.uid() = user_id);

-- contact_interactions
ALTER TABLE contact_interactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own interactions" ON contact_interactions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own interactions" ON contact_interactions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own interactions" ON contact_interactions FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own interactions" ON contact_interactions FOR DELETE USING (auth.uid() = user_id);

-- habits
ALTER TABLE habits ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own habits" ON habits FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own habits" ON habits FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own habits" ON habits FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own habits" ON habits FOR DELETE USING (auth.uid() = user_id);

-- habit_completions
ALTER TABLE habit_completions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own completions" ON habit_completions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own completions" ON habit_completions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own completions" ON habit_completions FOR DELETE USING (auth.uid() = user_id);

-- goals
ALTER TABLE goals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own goals" ON goals FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own goals" ON goals FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own goals" ON goals FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own goals" ON goals FOR DELETE USING (auth.uid() = user_id);

-- key_results
ALTER TABLE key_results ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own key results" ON key_results FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own key results" ON key_results FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own key results" ON key_results FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own key results" ON key_results FOR DELETE USING (auth.uid() = user_id);

-- goal_tasks (RLS via user ownership of the goal)
ALTER TABLE goal_tasks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own goal tasks" ON goal_tasks FOR SELECT
  USING (EXISTS (SELECT 1 FROM goals WHERE goals.id = goal_tasks.goal_id AND goals.user_id = auth.uid()));
CREATE POLICY "Users can insert own goal tasks" ON goal_tasks FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM goals WHERE goals.id = goal_tasks.goal_id AND goals.user_id = auth.uid()));
CREATE POLICY "Users can delete own goal tasks" ON goal_tasks FOR DELETE
  USING (EXISTS (SELECT 1 FROM goals WHERE goals.id = goal_tasks.goal_id AND goals.user_id = auth.uid()));

-- journal_entries
ALTER TABLE journal_entries ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own journal" ON journal_entries FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own journal" ON journal_entries FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own journal" ON journal_entries FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own journal" ON journal_entries FOR DELETE USING (auth.uid() = user_id);

-- time_blocks
ALTER TABLE time_blocks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own time blocks" ON time_blocks FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own time blocks" ON time_blocks FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own time blocks" ON time_blocks FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own time blocks" ON time_blocks FOR DELETE USING (auth.uid() = user_id);

-- bookmarks
ALTER TABLE bookmarks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own bookmarks" ON bookmarks FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own bookmarks" ON bookmarks FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own bookmarks" ON bookmarks FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own bookmarks" ON bookmarks FOR DELETE USING (auth.uid() = user_id);

-- workouts
ALTER TABLE workouts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own workouts" ON workouts FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own workouts" ON workouts FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own workouts" ON workouts FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own workouts" ON workouts FOR DELETE USING (auth.uid() = user_id);

-- health_metrics
ALTER TABLE health_metrics ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own metrics" ON health_metrics FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own metrics" ON health_metrics FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own metrics" ON health_metrics FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own metrics" ON health_metrics FOR DELETE USING (auth.uid() = user_id);

-- inbox_items
ALTER TABLE inbox_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own inbox" ON inbox_items FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own inbox" ON inbox_items FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own inbox" ON inbox_items FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own inbox" ON inbox_items FOR DELETE USING (auth.uid() = user_id);

-- templates
ALTER TABLE templates ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own templates" ON templates FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own templates" ON templates FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own templates" ON templates FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own templates" ON templates FOR DELETE USING (auth.uid() = user_id);

-- wiki_articles
ALTER TABLE wiki_articles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own wiki" ON wiki_articles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own wiki" ON wiki_articles FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own wiki" ON wiki_articles FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own wiki" ON wiki_articles FOR DELETE USING (auth.uid() = user_id);

-- workspace_notes
ALTER TABLE workspace_notes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own ws notes" ON workspace_notes FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own ws notes" ON workspace_notes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own ws notes" ON workspace_notes FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own ws notes" ON workspace_notes FOR DELETE USING (auth.uid() = user_id);

-- workspace_docs
ALTER TABLE workspace_docs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own ws docs" ON workspace_docs FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own ws docs" ON workspace_docs FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own ws docs" ON workspace_docs FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own ws docs" ON workspace_docs FOR DELETE USING (auth.uid() = user_id);

-- achievements
ALTER TABLE achievements ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own achievements" ON achievements FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own achievements" ON achievements FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own achievements" ON achievements FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- focus_sessions
ALTER TABLE focus_sessions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own sessions" ON focus_sessions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own sessions" ON focus_sessions FOR INSERT WITH CHECK (auth.uid() = user_id);
