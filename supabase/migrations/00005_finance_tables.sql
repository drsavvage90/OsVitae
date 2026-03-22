-- ─── TRANSACTIONS ───────────────────────────

CREATE TABLE transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type text NOT NULL CHECK (type IN ('income', 'expense')),
  category text,
  amount numeric NOT NULL,
  description text,
  transaction_date date NOT NULL,
  recurring boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX idx_transactions_user ON transactions(user_id);

ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own transactions" ON transactions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own transactions" ON transactions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own transactions" ON transactions FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own transactions" ON transactions FOR DELETE USING (auth.uid() = user_id);


-- ─── BILLS ──────────────────────────────────

CREATE TABLE bills (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  amount numeric NOT NULL,
  due_day integer,
  category text,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX idx_bills_user ON bills(user_id);

ALTER TABLE bills ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own bills" ON bills FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own bills" ON bills FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own bills" ON bills FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own bills" ON bills FOR DELETE USING (auth.uid() = user_id);


-- ─── BILL PAYMENTS ──────────────────────────

CREATE TABLE bill_payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  bill_id uuid NOT NULL REFERENCES bills(id) ON DELETE CASCADE,
  month_key text NOT NULL,
  paid boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  UNIQUE (bill_id, month_key)
);

CREATE INDEX idx_bill_payments_user ON bill_payments(user_id);

ALTER TABLE bill_payments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own bill payments" ON bill_payments FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own bill payments" ON bill_payments FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own bill payments" ON bill_payments FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own bill payments" ON bill_payments FOR DELETE USING (auth.uid() = user_id);


-- ─── BUDGETS ────────────────────────────────

CREATE TABLE budgets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  category_id text NOT NULL,
  budget_limit numeric NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE (user_id, category_id)
);

CREATE INDEX idx_budgets_user ON budgets(user_id);

ALTER TABLE budgets ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own budgets" ON budgets FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own budgets" ON budgets FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own budgets" ON budgets FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own budgets" ON budgets FOR DELETE USING (auth.uid() = user_id);
