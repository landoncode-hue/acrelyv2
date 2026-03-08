# CORS Configuration Guide

## Overview
The CORS (Cross-Origin Resource Sharing) configuration has been updated to enhance security by restricting API access to specific domains instead of allowing all origins.

## Configuration

### Default Behavior

**Development Environment**:
- Allows: `http://localhost:3000`, `http://127.0.0.1:3000`

**Production Environment**:
- Allows: `https://acrely.pinnaclegroups.ng`, `https://www.acrely.pinnaclegroups.ng`

### Custom Configuration

You can override the default allowed origins by setting the `ALLOWED_ORIGINS` environment variable:

```bash
# .env or .env.production
ALLOWED_ORIGINS=https://acrely.pinnaclegroups.ng,https://app.acrely.com,https://staging.acrely.com
```

**Format**: Comma-separated list of allowed origins (no spaces)

## Implementation Details

### Location
`next.config.ts` - Lines 54-78

### Headers Applied
- `Access-Control-Allow-Credentials: true`
- `Access-Control-Allow-Origin: <primary-origin>`
- `Access-Control-Allow-Methods: GET,DELETE,PATCH,POST,PUT,OPTIONS`
- `Access-Control-Allow-Headers: X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization`

### Routes Affected
All API routes matching `/api/:path*`

## Security Considerations

### ✅ What Changed
- **Before**: `Access-Control-Allow-Origin: *` (wildcard - allows any origin)
- **After**: Specific domain whitelist based on environment

### 🔒 Security Benefits
1. **Prevents unauthorized cross-origin requests** from malicious sites
2. **Protects against CSRF attacks** when combined with credentials
3. **Reduces attack surface** by limiting API access points
4. **Compliance** with security best practices

### ⚠️ Important Notes

#### Multiple Origins
The current implementation uses the **first origin** from the allowed list. For dynamic origin checking (supporting multiple origins), you would need to implement middleware-based CORS:

```typescript
// Example: Dynamic origin checking in middleware
const origin = request.headers.get('origin');
if (allowedOrigins.includes(origin)) {
  response.headers.set('Access-Control-Allow-Origin', origin);
}
```

#### Preflight Requests
The configuration includes `OPTIONS` in allowed methods to support CORS preflight requests.

## Deployment Checklist

### For Production Deployment

1. **Verify Production Domain**
   ```bash
   # Ensure your production domain is in the allowed list
   # Default: https://acrely.pinnaclegroups.ng
   ```

2. **Set Custom Origins (if needed)**
   ```bash
   # In Vercel/deployment platform
   ALLOWED_ORIGINS=https://acrely.pinnaclegroups.ng,https://www.acrely.pinnaclegroups.ng
   ```

3. **Test CORS Headers**
   ```bash
   curl -I -X OPTIONS https://acrely.pinnaclegroups.ng/api/estates \
     -H "Origin: https://acrely.pinnaclegroups.ng" \
     -H "Access-Control-Request-Method: GET"
   ```

4. **Verify Response Headers**
   - Should include `Access-Control-Allow-Origin: https://acrely.pinnaclegroups.ng`
   - Should NOT include `Access-Control-Allow-Origin: *`

### For Staging/Development

1. **Local Development**
   - No configuration needed
   - Automatically allows localhost:3000

2. **Staging Environment**
   ```bash
   # .env.staging
   ALLOWED_ORIGINS=https://staging.acrely.pinnaclegroups.ng
   ```

## Troubleshooting

### CORS Error in Browser Console
```
Access to fetch at 'https://api.example.com' from origin 'https://example.com' 
has been blocked by CORS policy
```

**Solutions**:
1. Verify the origin is in the `ALLOWED_ORIGINS` list
2. Check that the domain matches exactly (including protocol and subdomain)
3. Ensure environment variables are loaded correctly
4. Restart the Next.js server after changing `.env`

### API Works in Postman but Not in Browser
This is expected CORS behavior. Postman doesn't enforce CORS policies. Ensure:
1. Your frontend domain is in the allowed origins
2. Credentials are being sent correctly
3. Preflight requests are handled (OPTIONS method)

### Multiple Subdomains
If you need to support multiple subdomains dynamically:

```bash
# Option 1: List all subdomains
ALLOWED_ORIGINS=https://app.acrely.com,https://admin.acrely.com,https://portal.acrely.com

# Option 2: Implement wildcard subdomain matching in middleware
# (Requires custom middleware implementation)
```

## Testing

### Manual Testing

1. **Test from Allowed Origin**
   ```javascript
   // From https://acrely.pinnaclegroups.ng
   fetch('https://acrely.pinnaclegroups.ng/api/estates')
     .then(res => res.json())
     .then(console.log);
   // Should succeed
   ```

2. **Test from Disallowed Origin**
   ```javascript
   // From https://malicious-site.com
   fetch('https://acrely.pinnaclegroups.ng/api/estates')
     .then(res => res.json())
     .then(console.log);
   // Should fail with CORS error
   ```

### Automated Testing

Add to your E2E tests:

```typescript
// tests/e2e/cors.spec.ts
test('should allow requests from allowed origin', async ({ request }) => {
  const response = await request.get('/api/estates', {
    headers: {
      'Origin': 'https://acrely.pinnaclegroups.ng'
    }
  });
  expect(response.headers()['access-control-allow-origin'])
    .toBe('https://acrely.pinnaclegroups.ng');
});
```

## Migration Notes

### Previous Configuration (Removed)
```typescript
{ key: "Access-Control-Allow-Origin", value: "*" }
```

### Current Configuration
```typescript
{
  key: "Access-Control-Allow-Origin",
  value: allowedOrigins[0] // Environment-specific
}
```

### Breaking Changes
⚠️ **If you have external integrations or mobile apps**, ensure their origins are added to `ALLOWED_ORIGINS`.

## Related Files
- `next.config.ts` - CORS configuration
- `src/middleware.ts` - Request middleware (could be extended for dynamic CORS)
- `.env` - Environment variables

## References
- [MDN: CORS](https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS)
- [Next.js: Headers](https://nextjs.org/docs/app/api-reference/next-config-js/headers)
- [OWASP: CORS Security](https://cheatsheetseries.owasp.org/cheatsheets/Cross-Site_Request_Forgery_Prevention_Cheat_Sheet.html)

---

**Last Updated**: January 30, 2026  
**Security Level**: High Priority  
**Impact**: All API routes
