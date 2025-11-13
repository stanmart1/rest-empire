# Production Deployment Guide

## Critical Environment Variables for Production

### CORS Configuration
The following environment variable MUST be set in your production environment (Coolify/Docker):

```bash
CORS_ORIGINS=https://restempire.com,https://www.restempire.com,https://api.restempire.com
```

**Important Notes:**
- The CORS_ORIGINS variable accepts comma-separated values
- No spaces between URLs
- Must include all domains that will access the API
- The backend code now automatically includes these production origins as fallback

### Other Required Environment Variables

```bash
# Environment
ENVIRONMENT=production

# Database
DATABASE_URL=postgresql://user:password@host:port/database

# Security
SECRET_KEY=your-secret-key-here
ALGORITHM=HS256

# URLs
FRONTEND_URL=https://restempire.com
API_BASE_URL=https://api.restempire.com

# Redis
REDIS_URL=redis://redis:6379/0
CELERY_BROKER_URL=redis://redis:6379/0
CELERY_RESULT_BACKEND=redis://redis:6379/0
```

## Middleware Order (Critical)

The middleware is applied in this order (first added = executed first for requests):

1. **CORSMiddleware** - Handles CORS preflight and headers
2. **CSRFMiddleware** - CSRF token validation
3. **GZipMiddleware** - Response compression

## Troubleshooting CORS Issues

If you encounter CORS errors:

1. **Check Environment Variable**: Verify CORS_ORIGINS is set correctly in Coolify
2. **Check Logs**: Look for "Allowed CORS Origins" in application logs
3. **Verify Domain**: Ensure the frontend domain matches exactly (https vs http, www vs non-www)
4. **Clear Cache**: Clear browser cache and try again
5. **Check Preflight**: Use browser DevTools Network tab to inspect OPTIONS requests

## Testing CORS Configuration

```bash
# Test preflight request
curl -X OPTIONS https://api.restempire.com/api/v1/events/ \
  -H "Origin: https://restempire.com" \
  -H "Access-Control-Request-Method: POST" \
  -H "Access-Control-Request-Headers: Content-Type,Authorization" \
  -v

# Should return:
# Access-Control-Allow-Origin: https://restempire.com
# Access-Control-Allow-Credentials: true
# Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS, PATCH
```

## Deployment Checklist

- [ ] Set CORS_ORIGINS environment variable
- [ ] Set ENVIRONMENT=production
- [ ] Verify DATABASE_URL is correct
- [ ] Set SECRET_KEY to a secure random value
- [ ] Configure REDIS_URL
- [ ] Set FRONTEND_URL and API_BASE_URL
- [ ] Restart application after environment changes
- [ ] Test CORS with curl or browser
- [ ] Monitor application logs for CORS-related messages

## Recent Changes

### CORS Fix (Current)
- Added automatic inclusion of production origins (restempire.com, www.restempire.com, api.restempire.com)
- Reordered middleware to ensure CORS is processed first
- Added expose_headers and max_age to CORS configuration
- Added logging for allowed origins on startup
- Added GZip compression middleware

### Security Enhancements
- Rate limiting on auth endpoints
- CSRF protection middleware
- HttpOnly cookie authentication
- Input sanitization for user content
