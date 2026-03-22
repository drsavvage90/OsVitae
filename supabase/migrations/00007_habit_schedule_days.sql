-- Add schedule_days column to habits for custom day-of-week scheduling
-- Values are day numbers: 0=Sun, 1=Mon, 2=Tue, 3=Wed, 4=Thu, 5=Fri, 6=Sat
-- e.g. [1,3,5] = Mon/Wed/Fri

ALTER TABLE habits ADD COLUMN schedule_days jsonb DEFAULT NULL;

-- Backfill: daily habits get all days, weekly habits get Monday
UPDATE habits SET schedule_days = '[0,1,2,3,4,5,6]' WHERE frequency = 'daily';
UPDATE habits SET schedule_days = '[1]' WHERE frequency = 'weekly';
