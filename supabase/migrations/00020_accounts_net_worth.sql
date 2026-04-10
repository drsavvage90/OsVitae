-- Accounts for net worth tracking
CREATE TABLE IF NOT EXISTS accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'checking',
  balance NUMERIC(12,2) NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE accounts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own accounts"
  ON accounts FOR ALL USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Net worth history snapshots
CREATE TABLE IF NOT EXISTS net_worth_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  snapshot_date DATE NOT NULL,
  net_worth NUMERIC(14,2) NOT NULL DEFAULT 0,
  total_assets NUMERIC(14,2) NOT NULL DEFAULT 0,
  total_liabilities NUMERIC(14,2) NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, snapshot_date)
);

ALTER TABLE net_worth_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own net worth history"
  ON net_worth_history FOR ALL USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
