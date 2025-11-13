# Production Environment Variables Checklist

## Required Environment Variables for Coolify

Add these to your Coolify deployment environment variables:

### Critical for Image Uploads and CORS
```bash
ENVIRONMENT=production
API_BASE_URL=https://api.restempire.com
FRONTEND_URL=https://restempire.com
```

### Database
```bash
DATABASE_URL=postgresql://user:password@host:5432/dbname
```

### Security
```bash
SECRET_KEY=your-secret-key-here
ALGORITHM=HS256
```

### Frontend
```bash
FRONTEND_URL=https://restempire.com
```

### Redis
```bash
REDIS_URL=redis://redis:6379/0
CELERY_BROKER_URL=redis://redis:6379/0
CELERY_RESULT_BACKEND=redis://redis:6379/0
```

### CORS
```bash
CORS_ORIGINS=https://restempire.com,https://www.restempire.com
```

## Verification Steps

After setting environment variables:

1. **Restart the application** in Coolify
2. **Check logs** for correct values:
   - Look for "ENVIRONMENT: production"
   - Look for "STORAGE_PATH: /app/storage"
3. **Test image upload**:
   - Upload a team member image
   - Check the returned URL starts with `https://api.restempire.com/uploads/`
4. **Verify image displays** on the About page

## Common Issues

### Issue: Images still show localhost URLs
**Solution**: Ensure `ENVIRONMENT=production` is set and app is restarted

### Issue: Mixed content errors (HTTP/HTTPS)
**Solution**: Ensure `API_BASE_URL` uses `https://` not `http://`

### Issue: CORS errors
**Solution**: Add your frontend domain to `CORS_ORIGINS`
