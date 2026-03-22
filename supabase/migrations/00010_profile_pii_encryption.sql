-- ============================================
-- PII Encryption Support
-- ============================================
-- Change date_of_birth from date to text so it can store encrypted base64 strings.
-- All other PII columns (full_name, phone, email, address_*) are already text type.

ALTER TABLE profiles ALTER COLUMN date_of_birth TYPE text USING date_of_birth::text;
