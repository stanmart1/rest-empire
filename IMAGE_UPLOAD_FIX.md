# Image Upload Fix for Production

## Issue
Team member images uploaded in production were returning broken URLs because the storage path was relative (`/uploads/team/...`) instead of absolute URLs.

## Root Cause
- Storage is mounted at `/app/storage` in production (Coolify)
- Backend serves files at `/uploads` endpoint
- URLs returned were relative paths, not full URLs with domain

## Solution
Updated `backend/app/core/storage.py` to return full URLs in production:

```python
def get_file_url(file_path: str) -> str:
    """Convert file path to URL"""
    relative_path = str(Path(file_path).relative_to(UPLOAD_DIR))
    
    # In production, return full URL with API base
    if ENVIRONMENT == "production":
        api_base = settings.API_BASE_URL or "https://api.restempire.com"
        return f"{api_base}/uploads/{relative_path.replace(os.sep, '/')}"
    
    return f"/uploads/{relative_path.replace(os.sep, '/')}"
```

## Configuration Required
Add to production environment variables in Coolify:

```
API_BASE_URL=https://api.restempire.com
```

## How It Works
1. File uploaded to `/app/storage/team/` in production
2. Backend returns full URL: `https://api.restempire.com/uploads/team/filename.jpg`
3. Frontend displays image using full URL
4. Backend serves file from mounted storage at `/uploads` endpoint

## Testing
1. Upload a team member image in admin panel
2. Verify image displays correctly on About page
3. Check browser network tab - image URL should be full path with domain

## Applies To
- Team member images
- Logo uploads
- Book covers
- Any file uploaded via `/upload/` endpoint
