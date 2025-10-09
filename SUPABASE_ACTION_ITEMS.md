# 🎯 Supabase Configuration - Action Items

## ⏱️ Time Required: 5 minutes

---

## 📍 Step 1: Configure Site URL (2 minutes)

### Action:

1. Open this link: https://supabase.com/dashboard/project/lbvqiedeajeteiasxnjw/auth/url-configuration

2. Find the **"Site URL"** field

3. Replace the current value with:

   ```
   https://openhire.anands.dev
   ```

4. Click **"Save"** at the bottom

### ✅ Success Check:

Site URL should show: `https://openhire.anands.dev`

---

## 📍 Step 2: Add Redirect URLs (2 minutes)

### Action:

1. On the same page, scroll to **"Redirect URLs"** section

2. You'll see a text area with a list of URLs

3. Add these two lines (if not already present):

   ```
   http://localhost:3000/**
   https://openhire.anands.dev/**
   ```

4. Click **"Save"** at the bottom

### ✅ Success Check:

Redirect URLs should include both:

- `http://localhost:3000/**` ← For local development
- `https://openhire.anands.dev/**` ← For production

### 💡 Why the `**`?

The double asterisk (`**`) is a wildcard that matches any path on your domain. This allows:

- `https://openhire.anands.dev/auth/callback`
- `https://openhire.anands.dev/dashboard`
- `https://openhire.anands.dev/any/other/path`

---

## 📍 Step 3: Customize Email Template (Optional - 1 minute)

### Action:

1. Open this link: https://supabase.com/dashboard/project/lbvqiedeajeteiasxnjw/auth/templates

2. Click on **"Confirm signup"** in the list

3. You'll see the current email template

4. **Option A - Keep It Simple:**
   Just verify it contains `{{ .ConfirmationURL }}` and click Save

5. **Option B - Use Custom Template:**
   - Copy the beautiful template from `PRODUCTION_DEPLOYMENT_GUIDE.md`
   - Paste it into the editor
   - Click **"Save"**

### ✅ Success Check:

- Subject line updated (if using custom template)
- Template saved successfully
- No syntax errors shown

---

## 🧪 Step 4: Test the Configuration (Optional but Recommended)

### Quick Test:

1. Go to your production site: https://openhire.anands.dev/auth/signup

2. Sign up with a real email address (you need to receive the email)

3. Check your inbox for the verification email

4. The email link should look like:

   ```
   https://openhire.anands.dev/auth/callback?code=abc123...
   ```

   **✅ Correct:** Starts with `https://openhire.anands.dev`
   **❌ Wrong:** Starts with `http://localhost:3000`

5. Click the link - you should:
   - Be redirected to openhire.anands.dev
   - See a loading/redirect screen
   - End up authenticated on your site

---

## 📋 Configuration Checklist

Copy and check off as you complete:

```
Site URL Configuration:
[ ] Opened Supabase URL Configuration page
[ ] Changed Site URL to https://openhire.anands.dev
[ ] Clicked Save
[ ] Verified Site URL is saved correctly

Redirect URLs Configuration:
[ ] Found Redirect URLs section
[ ] Added http://localhost:3000/**
[ ] Added https://openhire.anands.dev/**
[ ] Clicked Save
[ ] Verified both URLs appear in the list

Email Template (Optional):
[ ] Opened Email Templates page
[ ] Selected "Confirm signup"
[ ] Updated template (or verified default is OK)
[ ] Clicked Save
[ ] No errors shown

Testing:
[ ] Signed up with test account
[ ] Received verification email
[ ] Email link points to openhire.anands.dev
[ ] Clicked link and authenticated successfully
```

---

## 🔍 Visual Guide

### What You Should See:

#### URL Configuration Page:

```
┌─────────────────────────────────────────────────────┐
│ Authentication > URL Configuration                  │
├─────────────────────────────────────────────────────┤
│                                                     │
│ Site URL                                            │
│ ┌─────────────────────────────────────────────┐   │
│ │ https://openhire.anands.dev                 │ ← │
│ └─────────────────────────────────────────────┘   │
│                                                     │
│ Redirect URLs                                       │
│ ┌─────────────────────────────────────────────┐   │
│ │ http://localhost:3000/**                    │ ← │
│ │ https://openhire.anands.dev/**              │ ← │
│ └─────────────────────────────────────────────┘   │
│                                                     │
│                        [ Save ]                     │
└─────────────────────────────────────────────────────┘
```

---

## ⚠️ Common Issues

### Issue: Can't find URL Configuration

**Solution:**

- Click "Authentication" in left sidebar
- Then click "URL Configuration" in the sub-menu

### Issue: Save button is disabled

**Solution:**

- Make sure you've made changes to the form
- If using custom domain, ensure it starts with `https://`

### Issue: Getting validation errors

**Solution:**

- Ensure Site URL starts with `http://` or `https://`
- Ensure Redirect URLs include the `**` wildcard
- Don't add extra spaces or line breaks

---

## 🎉 Done!

Once you've completed these steps, your email verification will work perfectly with `https://openhire.anands.dev`!

### Next Steps:

1. ✅ Supabase configured
2. 🚀 Deploy your application (if not already deployed)
3. 🧪 Test the signup flow end-to-end
4. 🎊 Celebrate - you're done!

---

## 📞 Need Help?

### Supabase Not Loading?

- Check your internet connection
- Try a different browser
- Clear browser cache

### Configuration Not Saving?

- Check Supabase status: https://status.supabase.com/
- Wait 30 seconds and try again
- Contact Supabase support if issue persists

### Email Still Shows Localhost?

- Wait 1-2 minutes after saving (changes need to propagate)
- Clear Supabase auth cache
- Try signing up with a new email address

---

**Direct Links:**

- URL Configuration: https://supabase.com/dashboard/project/lbvqiedeajeteiasxnjw/auth/url-configuration
- Email Templates: https://supabase.com/dashboard/project/lbvqiedeajeteiasxnjw/auth/templates
- Project Dashboard: https://supabase.com/dashboard/project/lbvqiedeajeteiasxnjw

**Last Updated:** October 8, 2025
