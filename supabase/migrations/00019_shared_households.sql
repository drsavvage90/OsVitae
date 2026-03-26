-- ─── HOUSEHOLDS ─────────────────────────────
CREATE TABLE households (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL DEFAULT 'My Household',
  created_at timestamptz DEFAULT now()
);

CREATE TABLE household_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  household_id uuid NOT NULL REFERENCES households(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role text NOT NULL DEFAULT 'member' CHECK (role IN ('owner', 'member')),
  created_at timestamptz DEFAULT now(),
  UNIQUE (household_id, user_id)
);

CREATE INDEX idx_household_members_user ON household_members(user_id);
CREATE INDEX idx_household_members_household ON household_members(household_id);

CREATE TABLE household_invites (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  household_id uuid NOT NULL REFERENCES households(id) ON DELETE CASCADE,
  email text NOT NULL,
  invited_by uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined')),
  created_at timestamptz DEFAULT now()
);

CREATE INDEX idx_household_invites_email ON household_invites(email);

-- RLS for household tables
ALTER TABLE households ENABLE ROW LEVEL SECURITY;
ALTER TABLE household_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE household_invites ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Members can view own household" ON households FOR SELECT
  USING (id IN (SELECT household_id FROM household_members WHERE user_id = auth.uid()));
CREATE POLICY "Users can create households" ON households FOR INSERT WITH CHECK (true);

CREATE POLICY "Members can view household members" ON household_members FOR SELECT
  USING (household_id IN (SELECT household_id FROM household_members hm WHERE hm.user_id = auth.uid()));
CREATE POLICY "Users can join households" ON household_members FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Owners can manage members" ON household_members FOR DELETE
  USING (household_id IN (SELECT household_id FROM household_members hm WHERE hm.user_id = auth.uid() AND hm.role = 'owner'));

CREATE POLICY "Members can view invites" ON household_invites FOR SELECT
  USING (household_id IN (SELECT household_id FROM household_members WHERE user_id = auth.uid())
    OR email = (SELECT email FROM auth.users WHERE id = auth.uid()));
CREATE POLICY "Members can create invites" ON household_invites FOR INSERT
  WITH CHECK (household_id IN (SELECT household_id FROM household_members WHERE user_id = auth.uid()));
CREATE POLICY "Invitees can update invites" ON household_invites FOR UPDATE
  USING (email = (SELECT email FROM auth.users WHERE id = auth.uid()));

-- ─── HELPER FUNCTION ───────────────────────
-- Returns true if check_user_id is in the same household as the current user
CREATE OR REPLACE FUNCTION is_household_member(check_user_id uuid)
RETURNS boolean AS $$
  SELECT EXISTS (
    SELECT 1 FROM household_members hm1
    JOIN household_members hm2 ON hm1.household_id = hm2.household_id
    WHERE hm1.user_id = auth.uid() AND hm2.user_id = check_user_id
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE SET search_path = public;

-- ─── UPDATE FINANCE TABLE RLS ──────────────
-- Transactions
CREATE POLICY "Household members can view transactions" ON transactions FOR SELECT
  USING (is_household_member(user_id));
CREATE POLICY "Household members can insert transactions" ON transactions FOR INSERT
  WITH CHECK (is_household_member(user_id));
CREATE POLICY "Household members can update transactions" ON transactions FOR UPDATE
  USING (is_household_member(user_id)) WITH CHECK (is_household_member(user_id));
CREATE POLICY "Household members can delete transactions" ON transactions FOR DELETE
  USING (is_household_member(user_id));

-- Bills
CREATE POLICY "Household members can view bills" ON bills FOR SELECT
  USING (is_household_member(user_id));
CREATE POLICY "Household members can insert bills" ON bills FOR INSERT
  WITH CHECK (is_household_member(user_id));
CREATE POLICY "Household members can update bills" ON bills FOR UPDATE
  USING (is_household_member(user_id)) WITH CHECK (is_household_member(user_id));
CREATE POLICY "Household members can delete bills" ON bills FOR DELETE
  USING (is_household_member(user_id));

-- Bill payments
CREATE POLICY "Household members can view bill payments" ON bill_payments FOR SELECT
  USING (is_household_member(user_id));
CREATE POLICY "Household members can insert bill payments" ON bill_payments FOR INSERT
  WITH CHECK (is_household_member(user_id));
CREATE POLICY "Household members can update bill payments" ON bill_payments FOR UPDATE
  USING (is_household_member(user_id)) WITH CHECK (is_household_member(user_id));
CREATE POLICY "Household members can delete bill payments" ON bill_payments FOR DELETE
  USING (is_household_member(user_id));

-- Budgets
CREATE POLICY "Household members can view budgets" ON budgets FOR SELECT
  USING (is_household_member(user_id));
CREATE POLICY "Household members can insert budgets" ON budgets FOR INSERT
  WITH CHECK (is_household_member(user_id));
CREATE POLICY "Household members can update budgets" ON budgets FOR UPDATE
  USING (is_household_member(user_id)) WITH CHECK (is_household_member(user_id));
CREATE POLICY "Household members can delete budgets" ON budgets FOR DELETE
  USING (is_household_member(user_id));

-- Finance categories
CREATE POLICY "Household members can view finance categories" ON finance_categories FOR SELECT
  USING (is_household_member(user_id));
CREATE POLICY "Household members can insert finance categories" ON finance_categories FOR INSERT
  WITH CHECK (is_household_member(user_id));
CREATE POLICY "Household members can update finance categories" ON finance_categories FOR UPDATE
  USING (is_household_member(user_id)) WITH CHECK (is_household_member(user_id));
CREATE POLICY "Household members can delete finance categories" ON finance_categories FOR DELETE
  USING (is_household_member(user_id));
