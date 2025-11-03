-- Add missing indexes for performance optimization
-- Run this migration to improve query performance on large datasets

-- Index for team hierarchy path queries
CREATE INDEX IF NOT EXISTS idx_team_members_path ON team_members(path);

-- Index for bonus date filtering
CREATE INDEX IF NOT EXISTS idx_bonuses_calculation_date ON bonuses(calculation_date);

-- Index for transaction date range queries
CREATE INDEX IF NOT EXISTS idx_transactions_completed_at ON transactions(completed_at);

-- Composite index for team member queries (ancestor + depth)
CREATE INDEX IF NOT EXISTS idx_team_members_ancestor_depth ON team_members(ancestor_id, depth);

-- Composite index for user queries (sponsor + active status)
CREATE INDEX IF NOT EXISTS idx_users_sponsor_active ON users(sponsor_id, is_active);

-- Index for bonus status filtering
CREATE INDEX IF NOT EXISTS idx_bonuses_status ON bonuses(status);

-- Index for transaction status filtering
CREATE INDEX IF NOT EXISTS idx_transactions_status ON transactions(status);

-- Composite index for bonus user and type queries
CREATE INDEX IF NOT EXISTS idx_bonuses_user_type ON bonuses(user_id, bonus_type);

-- Composite index for transaction user and type queries
CREATE INDEX IF NOT EXISTS idx_transactions_user_type ON transactions(user_id, transaction_type);

-- Index for user rank queries
CREATE INDEX IF NOT EXISTS idx_users_rank ON users(current_rank);

-- Index for user activity status
CREATE INDEX IF NOT EXISTS idx_users_activity_status ON users(activity_status);
