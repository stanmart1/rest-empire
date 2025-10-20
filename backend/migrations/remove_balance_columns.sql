-- Remove balance_eur and balance_dbsp columns and indexes
DROP INDEX IF EXISTS idx_users_balance_eur;
DROP INDEX IF EXISTS idx_users_balance_dbsp;

ALTER TABLE users DROP COLUMN IF EXISTS balance_eur;
ALTER TABLE users DROP COLUMN IF EXISTS balance_dbsp;
