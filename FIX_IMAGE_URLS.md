# Fix Image URLs in Production

## Problem
Team member images uploaded before setting production environment variables still have `localhost:8000` URLs in the database.

## Solution

### Option 1: Run Migration Script (Recommended)
Run this command in production to update all existing URLs in the database:

```bash
cd /app
python migrations/fix_team_image_urls.py
```

This will:
- Find all team member images with localhost URLs
- Replace `http://localhost:8000` with `https://api.restempire.com`
- Update the database

### Option 2: Automatic Fix (Already Implemented)
The code now automatically normalizes URLs when retrieving team members, so even old URLs will work correctly.

### Option 3: Re-upload Images
Simply edit each team member in the admin panel and re-upload their images. New uploads will use the correct production URL.

## Verification

After applying the fix:

1. Visit: https://restempire.com/about
2. Open browser DevTools → Network tab
3. Check team member images load from: `https://api.restempire.com/uploads/team/...`
4. No more `localhost:8000` URLs should appear

## Prevention

This issue won't happen again because:
1. Environment variables are now set correctly in production
2. URL normalization happens automatically on retrieval
3. New uploads will use the correct domain from the start
