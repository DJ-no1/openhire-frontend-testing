# Email Verification Setup Guide

## Issue

When users sign up, they receive a verification email with localhost URLs, which won't work in production.

## Solution Implemented

### 1. Environment Configuration

Added `NEXT_PUBLIC_SITE_URL` to `.env.local`:

```env
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

**IMPORTANT:** When deploying to production, update this to your production URL:

```env
NEXT_PUBLIC_SITE_URL=https://yourdomain.com
```

### 2. Updated Signup Function

Modified `src/contexts/AuthContext.tsx` to include `emailRedirectTo` option:

```typescript
emailRedirectTo: `${siteUrl}/auth/callback`;
```

### 3. Created Auth Callback Route

Created `src/app/auth/callback/route.ts` to handle email verification callbacks.

## Supabase Dashboard Configuration

### Step 1: Set Site URL

1. Go to your Supabase Dashboard: https://supabase.com/dashboard
2. Select your project
3. Navigate to **Authentication** → **URL Configuration**
4. Set **Site URL** to your production domain (e.g., `https://yourdomain.com`)
5. Add redirect URLs to the allow list:
   - For development: `http://localhost:3000/**`
   - For production: `https://yourdomain.com/**`

### Step 2: Customize Email Template

1. Navigate to **Authentication** → **Email Templates**
2. Select **Confirm signup** template
3. Replace the default template with the custom one below:

#### Custom Email Template for Signup Confirmation

**Subject:**

```
Welcome to {{ .SiteURL }} - Confirm Your Email
```

**HTML Body:**

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
                  Hi there,
                </p>

                <p
                  style="margin: 0 0 20px 0; color: #666666; font-size: 16px; line-height: 1.6;"
                >
                  Thank you for signing up with OpenHire! We're excited to have
                  you on board. To get started, please confirm your email
                  address by clicking the button below:
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
                    >This confirmation link will expire in 24 hours. If you
                    didn't create an account with OpenHire, you can safely
                    ignore this email.</em
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
                  Need help?
                  <a
                    href="mailto:support@openhire.com"
                    style="color: #667eea; text-decoration: none;"
                    >Contact Support</a
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

### Alternative: Simple Text Version

If you prefer a simpler email, use this template:

**HTML Body:**

```html
<h2>Welcome to OpenHire!</h2>

<p>Hi {{ .Email }},</p>

<p>
  Thank you for signing up! Please confirm your email address to get started.
</p>

<p>
  <a
    href="{{ .ConfirmationURL }}"
    style="display: inline-block; padding: 12px 24px; background-color: #667eea; color: white; text-decoration: none; border-radius: 4px;"
    >Confirm Email Address</a
  >
</p>

<p>Or copy and paste this URL into your browser:</p>
<p>{{ .ConfirmationURL }}</p>

<p>This link will expire in 24 hours.</p>

<p>If you didn't sign up for OpenHire, you can safely ignore this email.</p>

<p>Best regards,<br />The OpenHire Team</p>
```

## Testing

### Local Testing

1. Set `NEXT_PUBLIC_SITE_URL=http://localhost:3000` in `.env.local`
2. Start the development server: `pnpm dev`
3. Create a test account
4. Check your email for the verification link
5. The link should redirect to `http://localhost:3000/auth/callback`

### Production Testing

1. Update `NEXT_PUBLIC_SITE_URL=https://yourdomain.com` in your production environment variables
2. Update Site URL in Supabase Dashboard
3. Add production URL to redirect allow list
4. Deploy and test signup flow

## Environment Variables Checklist

### Development (.env.local)

- [x] `NEXT_PUBLIC_SITE_URL=http://localhost:3000`

### Production (Deployment Platform)

- [ ] `NEXT_PUBLIC_SITE_URL=https://yourdomain.com`

### Supabase Dashboard

- [ ] Site URL set to production domain
- [ ] Redirect URLs configured:
  - [ ] `http://localhost:3000/**` (for development)
  - [ ] `https://yourdomain.com/**` (for production)
- [ ] Email template customized

## Troubleshooting

### Users still getting localhost URLs

1. Verify `NEXT_PUBLIC_SITE_URL` is set correctly
2. Restart your development server after changing .env.local
3. Clear Supabase auth cache: `await supabase.auth.signOut()`

### Email verification not working

1. Check Supabase logs in Dashboard → Logs → Auth
2. Verify redirect URL is in the allow list
3. Check if the callback route exists at `/auth/callback`

### Invalid redirect URL error

1. Go to Supabase Dashboard → Authentication → URL Configuration
2. Add the exact URL to the allow list
3. Use wildcards for flexibility: `https://yourdomain.com/**`

## Additional Resources

- [Supabase Email Templates Documentation](https://supabase.com/docs/guides/auth/auth-email-templates)
- [Supabase Redirect URLs Documentation](https://supabase.com/docs/guides/auth/redirect-urls)
- [Next.js Environment Variables](https://nextjs.org/docs/basic-features/environment-variables)
