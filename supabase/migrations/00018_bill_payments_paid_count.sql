-- Add paid_count to track partial payments for bills with multiple due dates
ALTER TABLE bill_payments ADD COLUMN paid_count integer NOT NULL DEFAULT 1;
