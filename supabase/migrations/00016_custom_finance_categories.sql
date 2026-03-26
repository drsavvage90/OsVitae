-- ─── CUSTOM FINANCE CATEGORIES ─────────────
-- Allows users to customize their budget/expense/income category labels

CREATE TABLE finance_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  category_id text NOT NULL,
  type text NOT NULL CHECK (type IN ('income', 'expense')),
  label text NOT NULL,
  color text NOT NULL DEFAULT '#94A3B8',
  icon text NOT NULL DEFAULT 'DollarSign',
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  UNIQUE (user_id, category_id)
);

CREATE INDEX idx_finance_categories_user ON finance_categories(user_id);

ALTER TABLE finance_categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own finance categories" ON finance_categories FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own finance categories" ON finance_categories FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own finance categories" ON finance_categories FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own finance categories" ON finance_categories FOR DELETE USING (auth.uid() = user_id);
