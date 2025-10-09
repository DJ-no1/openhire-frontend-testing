# 🚀 Production Deployment Guide for openhire.anands.dev

## Quick Reference

- **Production Domain:** `https://openhire.anands.dev`
- **Supabase Project:** `lbvqiedeajeteiasxnjw`
- **Backend API:** `https://openhire-2764a0388beb.herokuapp.com`

---

## 📋 Pre-Deployment Checklist

### 1. ✅ Code Changes (Already Complete)

- [x] Auth callback route created
- [x] Site URL utility implemented
- [x] EmailRedirectTo configured
- [x] Production environment file created

### 2. 🔧 Supabase Dashboard Configuration (REQUIRED)

#### A. Configure Site URL

1. Go to: https://supabase.com/dashboard/project/lbvqiedeajeteiasxnjw/auth/url-configuration
2. Set **Site URL** to:
   ```
   https://openhire.anands.dev
   ```
3. Click **Save**

#### B. Add Redirect URLs

On the same page, add these URLs to the **Redirect URLs** list:

```
http://localhost:3000/**
https://openhire.anands.dev/**
```

**Important:** The `**` wildcard is crucial - it allows redirects to any path on your domain.

#### C. Verify Email Settings

1. Navigate to: https://supabase.com/dashboard/project/lbvqiedeajeteiasxnjw/auth/templates
2. Select **Confirm signup** template
3. Verify it uses `{{ .ConfirmationURL }}` or customize it (see custom template below)

---

## 🎨 Custom Email Template (Recommended)

Replace the default Supabase email template with this branded version:

### Subject:

```
Welcome to OpenHire - Confirm Your Email 🎉
```

### HTML Body:

```html
<!DOCTYPE html>
<html>
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Confirm Your Email - OpenHire</title>
  </head>
  <body
    style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;"
  >
    <table role="presentation" style="width: 100%; border-collapse: collapse;">
      <tr>
        <td align="center" style="padding: 40px 0;">
          <table
            role="presentation"
            style="width: 600px; border-collapse: collapse; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);"
          >
            <!-- Header -->
            <tr>
              <td
                style="padding: 40px 40px 20px 40px; text-align: center; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 8px 8px 0 0;"
              >
                <h1
                  style="margin: 0; color: #ffffff; font-size: 28px; font-weight: bold;"
                >
                  OpenHire
                </h1>
                <p style="margin: 10px 0 0 0; color: #ffffff; font-size: 16px;">
                  Your AI-Powered Hiring Platform
                </p>
              </td>
            </tr>

            <!-- Main Content -->
            <tr>
              <td style="padding: 40px;">
                <h2
                  style="margin: 0 0 20px 0; color: #333333; font-size: 24px;"
                >
                  Welcome to OpenHire! 🎉
                </h2>

                <p
                  style="margin: 0 0 20px 0; color: #666666; font-size: 16px; line-height: 1.6;"
                >
                  Thank you for joining OpenHire! We're excited to have you on
                  board.
                </p>

                <p
                  style="margin: 0 0 20px 0; color: #666666; font-size: 16px; line-height: 1.6;"
                >
                  To get started with AI-powered interviews and smart hiring,
                  please confirm your email address:
                </p>

                <!-- CTA Button -->
                <table
                  role="presentation"
                  style="margin: 30px 0; border-collapse: collapse;"
                >
                  <tr>
                    <td align="center">
                      <a
                        href="{{ .ConfirmationURL }}"
                        style="display: inline-block; padding: 16px 40px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #ffffff; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 16px;"
                      >
                        Confirm Your Email
                      </a>
                    </td>
                  </tr>
                </table>

                <p
                  style="margin: 30px 0 20px 0; color: #666666; font-size: 14px; line-height: 1.6;"
                >
                  Or copy and paste this link into your browser:
                </p>

                <p
                  style="margin: 0 0 30px 0; padding: 15px; background-color: #f8f9fa; border-radius: 4px; word-break: break-all;"
                >
                  <a
                    href="{{ .ConfirmationURL }}"
                    style="color: #667eea; text-decoration: none; font-size: 14px;"
                    >{{ .ConfirmationURL }}</a
                  >
                </p>

                <hr
                  style="border: none; border-top: 1px solid #eeeeee; margin: 30px 0;"
                />

                <p
                  style="margin: 0 0 10px 0; color: #666666; font-size: 14px; line-height: 1.6;"
                >
                  <strong>What's Next?</strong>
                </p>

                <ul
                  style="margin: 0 0 20px 0; padding-left: 20px; color: #666666; font-size: 14px; line-height: 1.6;"
                >
                  <li style="margin-bottom: 8px;">Complete your profile</li>
                  <li style="margin-bottom: 8px;">
                    Explore job opportunities or post your first job
                  </li>
                  <li style="margin-bottom: 8px;">
                    Experience AI-powered interviews
                  </li>
                </ul>

                <p
                  style="margin: 20px 0 0 0; color: #999999; font-size: 13px; line-height: 1.6;"
                >
                  <em
                    >This link will expire in 24 hours. If you didn't create an
                    account with OpenHire, you can safely ignore this email.</em
                  >
                </p>
              </td>
            </tr>

            <!-- Footer -->
            <tr>
              <td
                style="padding: 30px 40px; background-color: #f8f9fa; border-radius: 0 0 8px 8px; text-align: center;"
              >
                <p style="margin: 0 0 10px 0; color: #666666; font-size: 14px;">
                  Visit us at
                  <a
                    href="https://openhire.anands.dev"
                    style="color: #667eea; text-decoration: none;"
                    >openhire.anands.dev</a
                  >
                </p>
                <p style="margin: 0; color: #999999; font-size: 12px;">
                  © 2025 OpenHire. All rights reserved.
                </p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>
```

---

## 🌐 Deployment Instructions

### For Vercel:

1. **Set Environment Variables:**

   ```bash
   vercel env add NEXT_PUBLIC_SITE_URL production
   # Enter: https://openhire.anands.dev

   # Copy other variables from .env.production
   ```

2. **Or use Vercel Dashboard:**

   - Go to: https://vercel.com/your-username/openhire/settings/environment-variables
   - Add all variables from `.env.production`

3. **Deploy:**
   ```bash
   vercel --prod
   ```

### For Other Platforms (Netlify, Railway, etc.):

Add these environment variables in your platform's settings:

```
NEXT_PUBLIC_SITE_URL=https://openhire.anands.dev
NEXT_PUBLIC_API_URL=https://openhire-2764a0388beb.herokuapp.com
NEXT_PUBLIC_WS_URL=wss://openhire-2764a0388beb.herokuapp.com
NEXT_PUBLIC_SUPABASE_URL=https://lbvqiedeajeteiasxnjw.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxidnFpZWRlYWpldGVpYXN4bmp3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMyODk4NzAsImV4cCI6MjA2ODg2NTg3MH0.HX6xagdGz1KqM5fS7PDNK4yDZ22K91jCmpzUaVDdlLU
```

---

## 🧪 Testing the Email Flow

### 1. Test Signup:

```bash
# Navigate to your production site
https://openhire.anands.dev/auth/signup

# Create a test account with a real email address
# Check your inbox for verification email
```

### 2. Verify Email Link:

The email should contain a link like:

```
https://openhire.anands.dev/auth/callback?code=xxxxx...
```

**✅ Correct:** Link points to `openhire.anands.dev`
**❌ Wrong:** Link points to `localhost:3000`

### 3. Complete Verification:

- Click the link in the email
- You should be redirected to: `https://openhire.anands.dev/`
- You should be logged in automatically

---

## 🔍 Troubleshooting

### Issue 1: Email Still Shows Localhost

**Cause:** Environment variable not set or Supabase not configured

**Fix:**

1. Verify `NEXT_PUBLIC_SITE_URL` is set in production
2. Check Supabase Site URL is set to `https://openhire.anands.dev`
3. Redeploy your application
4. Try signing up again

### Issue 2: "Invalid Redirect URL" Error

**Cause:** URL not in Supabase allow list

**Fix:**

1. Go to: https://supabase.com/dashboard/project/lbvqiedeajeteiasxnjw/auth/url-configuration
2. Ensure `https://openhire.anands.dev/**` is in the redirect URLs list
3. Save and wait 1-2 minutes
4. Try again

### Issue 3: 404 on Callback

**Cause:** Callback route not deployed

**Fix:**

1. Verify `src/app/auth/callback/route.ts` exists
2. Check deployment logs for errors
3. Redeploy if necessary

---

## 📊 Verification Checklist

### Before Going Live:

- [ ] Supabase Site URL set to `https://openhire.anands.dev`
- [ ] Redirect URLs include `https://openhire.anands.dev/**`
- [ ] Email template customized (optional but recommended)
- [ ] `NEXT_PUBLIC_SITE_URL` set in production environment
- [ ] Application deployed successfully
- [ ] Test signup creates account
- [ ] Verification email received
- [ ] Email link points to production domain
- [ ] Clicking link authenticates user
- [ ] User redirected to dashboard

---

## 🎯 Quick Links

### Your Supabase Project:

- **Dashboard:** https://supabase.com/dashboard/project/lbvqiedeajeteiasxnjw
- **URL Config:** https://supabase.com/dashboard/project/lbvqiedeajeteiasxnjw/auth/url-configuration
- **Email Templates:** https://supabase.com/dashboard/project/lbvqiedeajeteiasxnjw/auth/templates
- **Auth Logs:** https://supabase.com/dashboard/project/lbvqiedeajeteiasxnjw/logs/auth-logs

### Your Application:

- **Production:** https://openhire.anands.dev
- **Signup:** https://openhire.anands.dev/auth/signup
- **Backend API:** https://openhire-2764a0388beb.herokuapp.com

---

## 📝 Post-Deployment

After successful deployment:

1. **Test the complete flow:**

   - Sign up with a test email
   - Receive and verify email
   - Confirm authentication works

2. **Monitor Supabase logs:**

   - Check for any auth errors
   - Verify email delivery

3. **Update documentation:**
   - Note any issues encountered
   - Document any additional configuration

---

## 🎉 Success Criteria

Your email verification is working correctly when:

✅ Users receive emails with `https://openhire.anands.dev` links
✅ Clicking the link redirects to your domain
✅ Users are automatically authenticated
✅ No "Invalid Redirect URL" errors
✅ Email template is professional and branded

---

**Last Updated:** October 8, 2025
**Domain:** openhire.anands.dev
**Status:** Ready for Deployment

Need help? Check the other documentation files or review Supabase logs for detailed error information.
