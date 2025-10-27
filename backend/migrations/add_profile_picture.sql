-- Add profile_picture column to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS profile_picture VARCHAR;

-- Add comment
COMMENT ON COLUMN users.profile_picture IS 'URL to user profile picture stored in uploads folder';
