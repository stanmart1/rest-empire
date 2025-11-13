# Security Fixes Testing Guide

## Quick Testing Checklist

### ✅ 1. Rate Limiting Test

**Test Login Rate Limit (5 requests/minute)**:
```bash
# Run this command 6 times quickly
curl -X POST http://localhost:8000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"wrong"}'

# Expected: First 5 requests return 401 (invalid credentials)
# 6th request returns 429 (rate limit exceeded)
```

**Check Rate Limit Headers**:
```bash
curl -i -X POST http://localhost:8000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@rest.com","password":"Rest123$"}'

# Look for headers:
# X-RateLimit-Limit: 5
# X-RateLimit-Remaining: 4
# X-RateLimit-Reset: <timestamp>
```

---

### ✅ 2. CORS Headers Test

**Verify Allowed Headers**:
```bash
curl -i -X OPTIONS http://localhost:8000/api/v1/auth/login \
  -H "Origin: http://localhost:8080" \
  -H "Access-Control-Request-Method: POST" \
  -H "Access-Control-Request-Headers: Content-Type,Authorization"

# Expected: 
# Access-Control-Allow-Headers: Content-Type, Authorization, Accept, Origin, X-Requested-With
# (NOT: Access-Control-Allow-Headers: *)
```

**Test Disallowed Header**:
```bash
curl -i -X OPTIONS http://localhost:8000/api/v1/auth/login \
  -H "Origin: http://localhost:8080" \
  -H "Access-Control-Request-Method: POST" \
  -H "Access-Control-Request-Headers: X-Custom-Forbidden-Header"

# Expected: Header should not be in allowed list
```

---

### ✅ 3. httpOnly Cookies Test

**Test Login Sets Cookies**:
```bash
curl -i -X POST http://localhost:8000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@rest.com","password":"Rest123$"}' \
  -c cookies.txt

# Expected in response headers:
# Set-Cookie: access_token=<token>; HttpOnly; Path=/; SameSite=lax
# Set-Cookie: refresh_token=<token>; HttpOnly; Path=/; SameSite=lax

# Check cookies.txt file:
cat cookies.txt
```

**Test API Request with Cookie**:
```bash
# First login and save cookies
curl -X POST http://localhost:8000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@rest.com","password":"Rest123$"}' \
  -c cookies.txt

# Then make authenticated request using cookies
curl -X GET http://localhost:8000/api/v1/users/me \
  -b cookies.txt

# Expected: Returns user data (authenticated via cookie)
```

**Test Logout Clears Cookies**:
```bash
# Login first
curl -X POST http://localhost:8000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@rest.com","password":"Rest123$"}' \
  -c cookies.txt

# Logout
curl -i -X POST http://localhost:8000/api/v1/auth/logout \
  -b cookies.txt

# Expected in response:
# Set-Cookie: access_token=; expires=Thu, 01 Jan 1970 00:00:00 GMT
# Set-Cookie: refresh_token=; expires=Thu, 01 Jan 1970 00:00:00 GMT
```

---

## Browser Testing (Frontend)

### Test 1: Login Flow
1. Open browser DevTools (F12)
2. Go to Application/Storage → Cookies
3. Login at `http://localhost:8080/login`
4. **Verify**: `access_token` and `refresh_token` cookies appear
5. **Verify**: Cookies have `HttpOnly` flag ✓
6. **Verify**: Cookies have `SameSite=Lax` ✓

### Test 2: Cookie Usage
1. Stay logged in
2. Navigate to Dashboard
3. Open Network tab in DevTools
4. **Verify**: API requests include cookies automatically
5. **Verify**: No Authorization header needed (cookies used)

### Test 3: Logout
1. Click Logout
2. Check Application/Storage → Cookies
3. **Verify**: `access_token` and `refresh_token` cookies are deleted
4. **Verify**: Redirected to login page

### Test 4: Rate Limiting
1. Go to login page
2. Enter wrong password
3. Click login 6 times quickly
4. **Verify**: After 5 attempts, see "Rate limit exceeded" error
5. Wait 1 minute
6. **Verify**: Can attempt login again

### Test 5: XSS Protection
1. Open browser console
2. Try to access token:
```javascript
document.cookie
// Should NOT show access_token or refresh_token (httpOnly protection)
```

---

## Backward Compatibility Test

**Test Authorization Header Still Works**:
```bash
# Get token from login
TOKEN=$(curl -X POST http://localhost:8000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@rest.com","password":"Rest123$"}' \
  | jq -r '.access_token')

# Use token in Authorization header (old method)
curl -X GET http://localhost:8000/api/v1/users/me \
  -H "Authorization: Bearer $TOKEN"

# Expected: Still works! (backward compatibility maintained)
```

---

## Production Checklist

Before deploying to production:

- [ ] Set `ENVIRONMENT=production` in `.env`
- [ ] Verify HTTPS is enabled (required for secure cookies)
- [ ] Test cookies work across subdomains (if applicable)
- [ ] Monitor rate limit hits in logs
- [ ] Set up Redis for rate limiting (multi-server deployments)
- [ ] Configure proper CORS origins for production domains
- [ ] Test token refresh flow with cookies
- [ ] Verify logout clears cookies properly
- [ ] Check cookie expiration times are correct
- [ ] Test from different browsers (Chrome, Firefox, Safari)

---

## Common Issues & Solutions

### Issue: Cookies not being set
**Solution**: 
- Check HTTPS is enabled in production
- Verify `ENVIRONMENT` variable is set correctly
- Check browser allows cookies from localhost (development)

### Issue: Rate limit too strict
**Solution**: Adjust limits in `auth.py`:
```python
@limiter.limit("10/minute")  # Increase from 5 to 10
```

### Issue: CORS errors
**Solution**: 
- Verify frontend URL in `CORS_ORIGINS`
- Check request includes allowed headers only
- Ensure `withCredentials: true` in frontend

### Issue: 401 Unauthorized after login
**Solution**:
- Check cookies are being sent with requests
- Verify `withCredentials: true` in axios config
- Check cookie domain matches request domain

---

## Security Verification

Run these checks to verify security improvements:

```bash
# 1. Verify rate limiting is active
echo "Testing rate limiting..."
for i in {1..6}; do
  echo "Request $i:"
  curl -s -o /dev/null -w "%{http_code}\n" \
    -X POST http://localhost:8000/api/v1/auth/login \
    -H "Content-Type: application/json" \
    -d '{"email":"test@test.com","password":"wrong"}'
done

# 2. Verify httpOnly cookies
echo -e "\nTesting httpOnly cookies..."
curl -i -X POST http://localhost:8000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@rest.com","password":"Rest123$"}' \
  | grep -i "set-cookie"

# 3. Verify CORS headers
echo -e "\nTesting CORS configuration..."
curl -i -X OPTIONS http://localhost:8000/api/v1/auth/login \
  -H "Origin: http://localhost:8080" \
  | grep -i "access-control-allow-headers"
```

---

## Success Criteria

All tests pass when:
- ✅ Rate limiting blocks excessive requests (429 error)
- ✅ CORS only allows whitelisted headers
- ✅ Cookies are set with HttpOnly flag
- ✅ Cookies are used for authentication
- ✅ Logout clears cookies
- ✅ Authorization header still works (backward compatibility)
- ✅ No JavaScript can access tokens via document.cookie

---

**Status**: Ready for testing
**Next Step**: Run through all tests above to verify fixes
