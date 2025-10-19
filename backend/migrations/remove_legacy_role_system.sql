-- Migration: Remove Legacy Role System
-- This migration removes the old enum-based role column
-- Note: Skipping user migration as there's only one superadmin user already configured

-- Drop the old role column
ALTER TABLE users DROP COLUMN IF EXISTS role;

-- Step 4: Drop the old enum type
DROP TYPE IF EXISTS userrole;
