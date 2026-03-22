-- Add CHECK constraints on user-writable text columns for defense-in-depth

-- profiles
ALTER TABLE profiles
  ADD CONSTRAINT chk_profiles_display_name CHECK (char_length(display_name) <= 255),
  ADD CONSTRAINT chk_profiles_intention_text CHECK (char_length(intention_text) <= 500),
  ADD CONSTRAINT chk_profiles_theme CHECK (char_length(theme) <= 50),
  ADD CONSTRAINT chk_profiles_reward_text CHECK (char_length(reward_text) <= 500);
-- PII fields are encrypted (variable-length base64), so no length check needed

-- workspaces
ALTER TABLE workspaces
  ADD CONSTRAINT chk_workspaces_name CHECK (char_length(name) <= 100);

-- tasks
ALTER TABLE tasks
  ADD CONSTRAINT chk_tasks_title CHECK (char_length(title) <= 500),
  ADD CONSTRAINT chk_tasks_description CHECK (char_length(description) <= 5000),
  ADD CONSTRAINT chk_tasks_reward CHECK (char_length(reward) <= 500);

-- subtasks
ALTER TABLE subtasks
  ADD CONSTRAINT chk_subtasks_text CHECK (char_length(text) <= 500);

-- task_notes
ALTER TABLE task_notes
  ADD CONSTRAINT chk_task_notes_text CHECK (char_length(text) <= 5000);

-- habits
ALTER TABLE habits
  ADD CONSTRAINT chk_habits_name CHECK (char_length(name) <= 200);

-- goals
ALTER TABLE goals
  ADD CONSTRAINT chk_goals_title CHECK (char_length(title) <= 500);

-- key_results
ALTER TABLE key_results
  ADD CONSTRAINT chk_key_results_title CHECK (char_length(title) <= 500);

-- journal_entries
ALTER TABLE journal_entries
  ADD CONSTRAINT chk_journal_entries_content CHECK (char_length(content) <= 50000);

-- time_blocks
ALTER TABLE time_blocks
  ADD CONSTRAINT chk_time_blocks_title CHECK (char_length(title) <= 500);

-- bookmarks
ALTER TABLE bookmarks
  ADD CONSTRAINT chk_bookmarks_title CHECK (char_length(title) <= 500),
  ADD CONSTRAINT chk_bookmarks_description CHECK (char_length(description) <= 2000);

-- inbox_items
ALTER TABLE inbox_items
  ADD CONSTRAINT chk_inbox_items_text CHECK (char_length(text) <= 5000);

-- wiki_articles
ALTER TABLE wiki_articles
  ADD CONSTRAINT chk_wiki_articles_title CHECK (char_length(title) <= 500),
  ADD CONSTRAINT chk_wiki_articles_category CHECK (char_length(category) <= 100),
  ADD CONSTRAINT chk_wiki_articles_content CHECK (char_length(content) <= 50000);

-- workspace_notes
ALTER TABLE workspace_notes
  ADD CONSTRAINT chk_workspace_notes_title CHECK (char_length(title) <= 200),
  ADD CONSTRAINT chk_workspace_notes_text CHECK (char_length(text) <= 50000);

-- contacts
ALTER TABLE contacts
  ADD CONSTRAINT chk_contacts_name CHECK (char_length(name) <= 255),
  ADD CONSTRAINT chk_contacts_notes CHECK (char_length(notes) <= 5000);

-- contact_interactions
ALTER TABLE contact_interactions
  ADD CONSTRAINT chk_contact_interactions_text CHECK (char_length(text) <= 5000);

-- transactions
ALTER TABLE transactions
  ADD CONSTRAINT chk_transactions_category CHECK (char_length(category) <= 100),
  ADD CONSTRAINT chk_transactions_description CHECK (char_length(description) <= 500);

-- bills
ALTER TABLE bills
  ADD CONSTRAINT chk_bills_name CHECK (char_length(name) <= 200),
  ADD CONSTRAINT chk_bills_category CHECK (char_length(category) <= 100);

-- projects
ALTER TABLE projects
  ADD CONSTRAINT chk_projects_name CHECK (char_length(name) <= 200);
