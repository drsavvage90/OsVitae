-- Add reward_text column to profiles for editable daily reward
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS reward_text text;
