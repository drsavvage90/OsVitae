-- Drop unused address fields from profiles, keeping only preferred_name and country.
ALTER TABLE profiles DROP COLUMN IF EXISTS address_line1;
ALTER TABLE profiles DROP COLUMN IF EXISTS address_line2;
ALTER TABLE profiles DROP COLUMN IF EXISTS city;
ALTER TABLE profiles DROP COLUMN IF EXISTS state;
ALTER TABLE profiles DROP COLUMN IF EXISTS zip;
