# 🔍 Debug Guide: Admin Equipment Page

## Problem: Page shows blank/white screen with nothing

---

## ✅ How to Debug (Step by Step):

### 1. Open Browser Console
1. เปิดหน้า `https://your-domain.vercel.app/admin/equipment`
2. กด **F12** หรือ **Right Click → Inspect**
3. ไปที่ tab **Console**

### 2. Check Console Logs

คุณควรเห็น logs แบบนี้:

#### ✅ Normal Flow (Success):
```
🔍 Admin Equipment: Component mounted
🔍 Checking session...
🔍 Session: Found
🔍 User found, fetching user data...
🔍 User data: {role: "ADMIN", ...}
✅ User is ADMIN, fetching equipment...
Loaded equipment: 15 items
🔍 Render state: {loading: false, user: true, userRole: "ADMIN", equipmentCount: 15, error: null}
✅ Rendering main admin equipment page
```

#### ❌ Problem Scenarios:

**Scenario 1: Not Logged In**
```
🔍 Admin Equipment: Component mounted
🔍 Checking session...
🔍 Session: Not found
❌ No user session found
🔍 Render state: {loading: false, user: false, ...}
❌ No user - redirecting to login...
```
**Solution:** Log in first at `/auth`

---

**Scenario 2: Not Admin**
```
🔍 User data: {role: "USER", ...}
❌ User is NOT admin. Role: USER
🔍 Render state: {loading: false, user: true, userRole: "USER", ...}
❌ User is not admin - showing access denied
```
**Solution:** Account needs ADMIN role in database

---

**Scenario 3: API Timeout**
```
✅ User is ADMIN, fetching equipment...
Error fetching equipment: AbortError
⏱️ Request timeout. The server is taking too long to respond.
```
**Solution:**
1. Run database indexes (see `QUICK-FIX-INDEXES.sql`)
2. Check Supabase is responding
3. Click "🔄 Retry" button

---

**Scenario 4: Stuck at Loading**
```
🔍 Admin Equipment: Component mounted
🔍 Checking session...
[Nothing more appears after 15 seconds]
Loading timeout. Please refresh the page.
```
**Solution:**
1. Refresh page
2. Check internet connection
3. Check Supabase status

---

## 🧪 Quick Tests

### Test 1: Check if you're logged in
Open console and run:
```javascript
// Check Supabase session
await window.supabase?.auth.getSession()
```

Should show `session: {...}` with user data

### Test 2: Check your role
```javascript
// Fetch your user data
const { data: { session } } = await window.supabase.auth.getSession();
const response = await fetch('/api/user', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ token: session.access_token })
});
const result = await response.json();
console.log('Your role:', result.data.role);
```

Should show `Your role: ADMIN`

### Test 3: Check API is working
```javascript
// Test equipment API
const response = await fetch('/api/equipment?limit=5');
const result = await response.json();
console.log('Equipment API:', result);
```

Should show `{success: true, data: [...]}`

---

## 🔧 Common Fixes

### Fix 1: Clear Browser Cache
1. Press **Ctrl + Shift + Delete**
2. Select "Cached images and files"
3. Click "Clear data"
4. Refresh page

### Fix 2: Hard Refresh
- Windows: **Ctrl + Shift + R**
- Mac: **Cmd + Shift + R**

### Fix 3: Incognito Mode
Open in incognito/private window to test without cache

### Fix 4: Check Supabase
1. Go to Supabase Dashboard
2. Check **Authentication** → **Users** → Your account exists
3. Check database → `users` table → Your role is `ADMIN`

---

## 📊 Expected Behavior

### Loading State (2-5 seconds):
- Shows "Loading Admin Panel..."
- Spinner animation
- "Please wait while we verify your access"

### Success State:
- Shows "Equipment Management" header
- Shows "Add Equipment" button
- Shows search bar
- Shows equipment list (or "No equipment found")

### Error State:
- Shows error message with icon
- Shows "🔄 Retry" button
- Can click retry to try again

---

## ⚠️ If Still Blank

### Check Network Tab
1. F12 → **Network** tab
2. Refresh page
3. Look for failed requests (red)
4. Check:
   - `/api/user` → Should be 200 OK
   - `/api/equipment` → Should be 200 OK
   - Any red (failed) requests?

### Check JavaScript Errors
1. F12 → **Console** tab
2. Look for red error messages
3. Common errors:
   - `TypeError: Cannot read property...` → Component error
   - `Failed to fetch` → Network error
   - `Timeout` → Server too slow

---

## 💡 Quick Solutions Summary

| Problem | Solution |
|---------|----------|
| "Please Login" message | Go to `/auth` and login |
| "Access Denied" message | Contact admin to change your role to ADMIN |
| Blank white page | Check console for errors (F12) |
| Loading forever | Wait 15s, should show timeout error |
| API timeout error | Run database indexes, click Retry |
| Equipment list empty | Either no equipment in DB, or query filters |

---

## 🚀 Deploy Checklist

Before deploying:
- [ ] Logged in as ADMIN user
- [ ] Database has equipment data
- [ ] Database indexes created (QUICK-FIX-INDEXES.sql)
- [ ] Supabase is responding (check status)
- [ ] Local dev works (test with `npm run dev`)

---

## 📞 Need More Help?

**Check these logs in console:**
1. Any red errors?
2. What's the last log message?
3. What's the "Render state" values?
4. Did it timeout?

**Share these details for better support!**
