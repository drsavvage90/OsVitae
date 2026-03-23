-- Rename full_name to preferred_name and drop email, phone, date_of_birth
ALTER TABLE profiles RENAME COLUMN full_name TO preferred_name;
ALTER TABLE profiles DROP COLUMN IF EXISTS date_of_birth;
ALTER TABLE profiles DROP COLUMN IF EXISTS phone;
ALTER TABLE profiles DROP COLUMN IF EXISTS email;
