# 📧 Supabase Email Configuration Guide

## ❌ Problem: Registration Email Not Sending

When users register, they don't receive the confirmation email.

---

## 🔍 Root Causes

1. **Email confirmation is required** but Supabase email service is not configured
2. **Default SMTP has limits** (only works in development, rate limited)
3. **Email confirmation might be disabled** but code expects it

---

## ✅ Solution Options

### Option 1: Configure Custom SMTP (Recommended for Production)

#### Step 1: Get SMTP Credentials

Use one of these providers:
- **Gmail** (free, 500 emails/day)
- **SendGrid** (free, 100 emails/day)
- **Mailgun** (free, 5,000 emails/month)
- **Resend** (free, 3,000 emails/month)

#### Step 2: Configure in Supabase

1. Go to **Supabase Dashboard**
2. Navigate to **Authentication** → **Email Templates** → **Settings**
3. Scroll to **SMTP Settings**
4. Fill in:

```
SMTP Host: smtp.gmail.com (for Gmail)
SMTP Port: 587
SMTP User: your-email@gmail.com
SMTP Password: [App Password - NOT your regular password]
Sender Name: Time2Use
Sender Email: noreply@your-domain.com
```

#### For Gmail:
1. Enable 2-Factor Authentication
2. Generate App Password: https://myaccount.google.com/apppasswords
3. Use App Password (not your regular password)

---

### Option 2: Disable Email Confirmation (Quick Fix - Not Recommended)

⚠️ **Warning:** Users can register without verifying their email

#### In Supabase Dashboard:

1. Go to **Authentication** → **Providers** → **Email**
2. Uncheck **"Confirm email"**
3. Save

#### Update Code (auth.tsx):

```typescript
// Remove line 355 (alert about checking email)
// Change to:
alert("ลงทะเบียนสำเร็จ! คุณสามารถเข้าสู่ระบบได้เลย");
router.push("/"); // Auto login
```

---

### Option 3: Use Auto-Confirm + Manual Verification Later

Keep email confirmation but auto-confirm on signup:

```typescript
const { error } = await supabase.auth.signUp({
  email: formData.email,
  password: formData.password,
  options: {
    data: {
      display_name: formData.name.trim(),
    },
    emailRedirectTo: `${window.location.origin}/auth/callback`, // Redirect after confirm
  }
});
```

Then in Supabase Dashboard:
1. **Authentication** → **URL Configuration**
2. Add to **Redirect URLs**: `https://your-domain.com/auth/callback`

---

## 🧪 Testing Email Configuration

### Test 1: Check Email Service Status

```bash
# In browser console after registering:
console.log('Registration completed, check email');
```

Check:
- Supabase Dashboard → **Authentication** → **Users** → User should exist with `email_confirmed: false`
- Check spam/junk folder
- Check email provider logs (if using custom SMTP)

### Test 2: Resend Confirmation Email

Add this function to your code:

```typescript
const resendConfirmationEmail = async (email: string) => {
  const { error } = await supabase.auth.resend({
    type: 'signup',
    email: email,
  });

  if (error) {
    console.error('Resend error:', error);
    alert('Failed to resend email. Please try again.');
  } else {
    alert('Confirmation email sent! Please check your inbox.');
  }
};
```

---

## 🎯 Recommended Solution for Production

**Use Custom SMTP (Option 1)**

### Quick Setup with Gmail:

1. **Create Gmail account** (e.g., `noreply.time2use@gmail.com`)
2. **Enable 2FA** on that account
3. **Generate App Password**
4. **Configure in Supabase:**

```
Host: smtp.gmail.com
Port: 587
User: noreply.time2use@gmail.com
Password: [16-character app password]
Sender Name: Time2Use System
Sender Email: noreply.time2use@gmail.com
```

5. **Test by registering a new user**

---

## 📊 Email Templates Customization

Once SMTP is working, customize email templates:

1. **Supabase Dashboard** → **Authentication** → **Email Templates**
2. Edit **Confirm your signup** template:

```html
<h2>Welcome to Time2Use! 🎉</h2>

<p>Hi {{ .Name }},</p>

<p>Thank you for registering with Time2Use - Equipment Management System.</p>

<p>Please click the button below to confirm your email address:</p>

<p><a href="{{ .ConfirmationURL }}" style="background: #DC2626; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; display: inline-block;">Confirm Email</a></p>

<p>Or copy and paste this link: {{ .ConfirmationURL }}</p>

<p>If you didn't create an account, you can safely ignore this email.</p>

<p>Best regards,<br>Time2Use Team</p>
```

---

## 🚨 Troubleshooting

### Email not arriving?

1. **Check Supabase logs:**
   - Dashboard → **Settings** → **API** → **Logs**
   - Look for email-related errors

2. **Check spam/junk folder**

3. **Verify SMTP credentials:**
   - Send test email from SMTP provider dashboard
   - Check username/password are correct

4. **Check rate limits:**
   - Supabase default: 4 emails per hour per recipient
   - Custom SMTP: depends on provider

### "Email rate limit exceeded" error?

Wait 1 hour or use custom SMTP (no limits)

### Confirmation link doesn't work?

1. Check **Redirect URLs** in Supabase Dashboard
2. Add your domain: `https://web-szxs.vercel.app/*`
3. Add callback route if needed

---

## ✅ Verification Checklist

- [ ] SMTP configured in Supabase (or email confirmation disabled)
- [ ] Test registration - user created in database
- [ ] Email received (check inbox + spam)
- [ ] Confirmation link works
- [ ] User can login after confirmation
- [ ] Custom email template configured (optional)

---

## 🔗 Useful Links

- [Supabase Email Config Docs](https://supabase.com/docs/guides/auth/auth-smtp)
- [Gmail App Passwords](https://myaccount.google.com/apppasswords)
- [SendGrid Free Tier](https://sendgrid.com/pricing/)
- [Resend](https://resend.com/)

---

## 💡 Quick Fix for Testing (Development Only)

If you just want to test without email:

```typescript
// In auth.tsx, after signup success (line 352):
if (error) throw error;

// Auto sign-in after signup (skip email verification)
const { error: signInError } = await supabase.auth.signInWithPassword({
  email: formData.email,
  password: formData.password,
});

if (!signInError) {
  router.push("/");
} else {
  alert("ลงทะเบียนสำเร็จ! กรุณาเข้าสู่ระบบ");
  setIsLogin(true);
}
```

**Then disable email confirmation in Supabase Dashboard.**

---

**Need help? Check Supabase logs or contact support!**
