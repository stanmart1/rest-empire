-- Migration: Add balance_eur and balance_dbsp fields
-- Date: 2024
-- Description: Add new balance fields while keeping legacy fields for backward compatibility

-- Add new balance fields
ALTER TABLE users ADD COLUMN IF NOT EXISTS balance_eur NUMERIC(10, 2) DEFAULT 0;
ALTER TABLE users ADD COLUMN IF NOT EXISTS balance_dbsp NUMERIC(10, 2) DEFAULT 0;

-- Copy data from legacy fields to new fields (if needed)
UPDATE users SET balance_eur = COALESCE(balance_ngn, 0) WHERE balance_eur IS NULL OR balance_eur = 0;
UPDATE users SET balance_dbsp = COALESCE(balance_usdt, 0) WHERE balance_dbsp IS NULL OR balance_dbsp = 0;

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_users_balance_eur ON users(balance_eur);
CREATE INDEX IF NOT EXISTS idx_users_balance_dbsp ON users(balance_dbsp);
