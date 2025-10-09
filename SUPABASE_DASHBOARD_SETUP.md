# Supabase Dashboard Configuration Guide

## Step-by-Step Instructions with Screenshots Reference

### Part 1: URL Configuration

#### Navigate to URL Configuration

1. Open your Supabase Dashboard
2. Select your project: `lbvqiedeajeteiasxnjw`
3. Click on **Authentication** in the left sidebar
4. Click on **URL Configuration**

#### Configure Site URL

```
┌─────────────────────────────────────────────────────────┐
│ Authentication > URL Configuration                      │
├─────────────────────────────────────────────────────────┤
│                                                         │
│ Site URL                                                │
│ ┌─────────────────────────────────────────────────┐   │
│ │ https://yourdomain.com                          │   │
│ └─────────────────────────────────────────────────┘   │
│                                                         │
│ This is the main URL of your application              │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

**What to set:**

- Development: `http://localhost:3000`
- Production: `https://yourdomain.com`

#### Configure Redirect URLs

```
┌─────────────────────────────────────────────────────────┐
│ Redirect URLs                                           │
├─────────────────────────────────────────────────────────┤
│                                                         │
│ Add URLs that users can be redirected to after         │
│ authentication.                                         │
│                                                         │
│ ┌─────────────────────────────────────────────────┐   │
│ │ http://localhost:3000/**                        │   │
│ │ https://yourdomain.com/**                       │   │
│ │ [+ Add URL]                                     │   │
│ └─────────────────────────────────────────────────┘   │
│                                                         │
│ ⚠️ Use wildcards carefully in production               │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

**Add these URLs:**

1. `http://localhost:3000/**` - For local development
2. `https://yourdomain.com/**` - For production

**Important:** The `**` wildcard matches any path, allowing redirects to any page on your domain.

---

### Part 2: Email Templates

#### Navigate to Email Templates

1. Click on **Authentication** in the left sidebar
2. Click on **Email Templates**
3. Select **Confirm signup** from the list

#### Current Default Template

```html
<h2>Confirm your signup</h2>
<p>Follow this link to confirm your user:</p>
<p><a href="{{ .ConfirmationURL }}">Confirm your mail</a></p>
```

**Problem:** Uses generic styling and doesn't match your brand.

#### Updated Custom Template

See `EMAIL_VERIFICATION_SETUP.md` for the full custom template.

**Key Changes:**

- ✅ Professional branding with OpenHire colors
- ✅ Clear call-to-action button
- ✅ Backup plain text URL
- ✅ Expiration notice
- ✅ Help and support links

---

### Part 3: Template Variables Reference

Available variables you can use in email templates:

| Variable                 | Description           | Example                                         |
| ------------------------ | --------------------- | ----------------------------------------------- |
| `{{ .ConfirmationURL }}` | Full verification URL | `https://yourdomain.com/auth/callback?code=xxx` |
| `{{ .Token }}`           | 6-digit OTP code      | `123456`                                        |
| `{{ .TokenHash }}`       | Hashed token          | `abc123...`                                     |
| `{{ .SiteURL }}`         | Your Site URL         | `https://yourdomain.com`                        |
| `{{ .RedirectTo }}`      | Redirect parameter    | `https://yourdomain.com/dashboard`              |
| `{{ .Email }}`           | User's email          | `user@example.com`                              |
| `{{ .Data.name }}`       | User metadata (name)  | `John Doe`                                      |

---

### Part 4: Testing Your Configuration

#### Test Email Flow

```
1. Go to Authentication > Users
2. Click "Invite User" or use your signup form
3. Enter a test email address
4. Check the email you receive
5. Verify the link format:
   ✅ Should be: https://yourdomain.com/auth/callback?code=...
   ❌ NOT: http://localhost:3000/auth/callback?code=...
```

#### Checklist

- [ ] Site URL is set to production domain
- [ ] Redirect URLs include production domain with `/**`
- [ ] Email template is customized (optional)
- [ ] Test signup sends email with correct domain
- [ ] Clicking link redirects to production site
- [ ] User is successfully authenticated after redirect

---

### Part 5: Common Issues and Solutions

#### Issue 1: "Invalid Redirect URL"

```
Error: redirect_to URL is not in the allow list
```

**Solution:**

1. Go to URL Configuration
2. Add the exact URL or use wildcards: `https://yourdomain.com/**`
3. Save changes
4. Wait 1-2 minutes for changes to propagate

#### Issue 2: Email Still Shows Localhost

```
Email link: http://localhost:3000/auth/callback
Expected: https://yourdomain.com/auth/callback
```

**Solution:**

1. Verify `NEXT_PUBLIC_SITE_URL` is set in production environment
2. Restart your application
3. Clear Supabase auth cache
4. Try signing up again

#### Issue 3: Email Template Not Updating

```
Old template still appears in emails
```

**Solution:**

1. Go to Email Templates
2. Click "Save" on the template
3. Send a test email
4. Check spam folder
5. Wait a few minutes and try again

---

### Part 6: Production Deployment Checklist

Before deploying to production:

#### Environment Variables

```bash
# Vercel / Netlify / Other platforms
NEXT_PUBLIC_SITE_URL=https://yourdomain.com
NEXT_PUBLIC_SUPABASE_URL=https://lbvqiedeajeteiasxnjw.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

#### Supabase Dashboard

- [ ] Site URL: `https://yourdomain.com`
- [ ] Redirect URLs: `https://yourdomain.com/**`
- [ ] Email template customized
- [ ] Test user created and verified

#### Application

- [ ] `/auth/callback` route exists
- [ ] AuthContext uses `emailRedirectTo`
- [ ] Site URL utility function imported
- [ ] Test signup flow end-to-end

---

### Part 7: Quick Links

**Your Supabase Project:**

- Dashboard: https://supabase.com/dashboard/project/lbvqiedeajeteiasxnjw
- URL Config: https://supabase.com/dashboard/project/lbvqiedeajeteiasxnjw/auth/url-configuration
- Email Templates: https://supabase.com/dashboard/project/lbvqiedeajeteiasxnjw/auth/templates
- Users: https://supabase.com/dashboard/project/lbvqiedeajeteiasxnjw/auth/users

**Supabase Documentation:**

- [Email Templates](https://supabase.com/docs/guides/auth/auth-email-templates)
- [Redirect URLs](https://supabase.com/docs/guides/auth/redirect-urls)
- [Server-Side Auth](https://supabase.com/docs/guides/auth/server-side-rendering)

---

## Summary

The fix requires two main steps:

1. **Code Changes** (✅ Already Done)

   - Added `NEXT_PUBLIC_SITE_URL` environment variable
   - Updated `signUp` function with `emailRedirectTo`
   - Created `/auth/callback` route

2. **Supabase Dashboard** (🔧 You Need to Do)
   - Set Site URL to your production domain
   - Add redirect URLs to allow list
   - Customize email template (recommended)

Once both are complete, users will receive verification emails with the correct production URLs!
