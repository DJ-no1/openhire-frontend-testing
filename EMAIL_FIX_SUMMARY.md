# Email Verification Fix - Quick Reference

## Problem

Users signing up were receiving verification emails with localhost URLs, which don't work in production.

## What Was Fixed

### 1. Files Modified

#### `.env.local`

- **Added:** `NEXT_PUBLIC_SITE_URL=http://localhost:3000`
- **Purpose:** Defines the base URL for email redirects

#### `src/contexts/AuthContext.tsx`

- **Added:** Import for `getAuthCallbackURL` utility
- **Modified:** `signUp` function now includes `emailRedirectTo` option
- **Purpose:** Ensures verification emails redirect to the correct URL

#### Created Files

1. **`src/app/auth/callback/route.ts`**

   - Handles email verification callbacks
   - Exchanges auth code for session
   - Redirects users after verification

2. **`src/lib/utils/site-url.ts`**

   - Utility functions for getting site URL
   - Works in both development and production
   - Auto-detects Vercel deployments

3. **`EMAIL_VERIFICATION_SETUP.md`**
   - Complete setup guide
   - Custom email templates
   - Troubleshooting tips

## Quick Setup for Production

### 1. Update Environment Variable

```bash
NEXT_PUBLIC_SITE_URL=https://yourdomain.com
```

### 2. Configure Supabase Dashboard

1. Go to: https://supabase.com/dashboard/project/YOUR_PROJECT/auth/url-configuration
2. Set **Site URL** to: `https://yourdomain.com`
3. Add to **Redirect URLs**:
   - `http://localhost:3000/**` (for development)
   - `https://yourdomain.com/**` (for production)

### 3. Customize Email Template (Optional but Recommended)

1. Go to: https://supabase.com/dashboard/project/YOUR_PROJECT/auth/templates
2. Select **Confirm signup**
3. Use the custom template from `EMAIL_VERIFICATION_SETUP.md`

## Testing

### Local Test

```bash
# 1. Ensure .env.local has:
NEXT_PUBLIC_SITE_URL=http://localhost:3000

# 2. Start server
pnpm dev

# 3. Sign up with a test email
# 4. Check email - link should point to http://localhost:3000/auth/callback
```

### Production Test

```bash
# 1. Deploy with NEXT_PUBLIC_SITE_URL set to your domain
# 2. Sign up with a test email
# 3. Verify link points to your production domain
```

## How It Works

### Before Fix

```
User signs up
  ↓
Supabase sends email with default template
  ↓
Email contains: http://localhost:3000/... (hardcoded)
  ↓
❌ Doesn't work in production
```

### After Fix

```
User signs up
  ↓
App sends emailRedirectTo parameter
  ↓
Supabase uses this URL in the email
  ↓
Email contains: https://yourdomain.com/auth/callback
  ↓
User clicks link
  ↓
/auth/callback exchanges code for session
  ↓
✅ User is authenticated and redirected
```

## Key Points

1. **Always set `NEXT_PUBLIC_SITE_URL`** in your environment
2. **Update Supabase URL Configuration** for each environment
3. **Customize email templates** for better user experience
4. **Test the full flow** in both development and production

## Support

For detailed information, see: `EMAIL_VERIFICATION_SETUP.md`

For issues:

1. Check Supabase logs: Dashboard → Logs → Auth
2. Verify environment variables are set
3. Ensure redirect URLs are in the allow list
