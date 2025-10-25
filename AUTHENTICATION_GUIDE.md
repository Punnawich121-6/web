# 🔐 คู่มือการ Authentication ด้วย Supabase

## ❌ Error: "Invalid login credentials"

Error นี้เกิดจาก:
1. ยังไม่มี User ในระบบ (ต้อง Register ก่อน)
2. Email/Password ไม่ถูกต้อง
3. Email ยังไม่ได้ verify (ถ้า Supabase ตั้งค่าให้ต้อง verify)

---

## ✅ วิธีแก้ไข - Step by Step

### Step 1: ตั้งค่า Supabase Authentication (สำคัญมาก!)

1. **ไปที่ Supabase Dashboard:**
   ```
   https://supabase.com/dashboard/project/puvcfdnfshnwloyujrwy
   ```

2. **ไปที่ Authentication → Settings:**
   - คลิก "Authentication" ในเมนูซ้าย
   - คลิก "Settings" ด้านบน

3. **ปิด Email Confirmation (เพื่อง่ายต่อการทดสอบ):**
   - หา **"Email Confirmation"** section
   - **ปิด** "Confirm email" option
   - กด **Save**

   หรือถ้าต้องการเปิดไว้ (Production):
   - เปิด "Confirm email"
   - ตั้งค่า Email templates
   - User ต้องไปกด link ยืนยันใน Email ก่อน login

4. **ตั้งค่า Site URL (สำคัญ!):**
   - หา **"Site URL"** setting
   - ใส่: `http://localhost:3000` (สำหรับ Development)
   - หรือ: `https://yourdomain.com` (สำหรับ Production)
   - กด **Save**

5. **ตั้งค่า Redirect URLs (ถ้าจำเป็น):**
   - หา **"Redirect URLs"** section
   - เพิ่ม:
     - `http://localhost:3000/*`
     - `http://localhost:3000/auth`
   - กด **Save**

---

### Step 2: สร้าง User Account ใหม่

#### **Option A: ผ่านหน้า Register (แนะนำ)**

1. **รัน Development Server:**
   ```bash
   npm run dev
   ```

2. **เปิด Browser:**
   ```
   http://localhost:3000/auth
   ```

3. **คลิกปุ่ม "สมัครสมาชิก" หรือ "Register"**

4. **กรอกข้อมูล:**
   - ชื่อ: Test User
   - Email: test@example.com
   - Password: Test@12345 (ต้องมีอย่างน้อย 8 ตัว)
   - Confirm Password: Test@12345

5. **กด "สมัครสมาชิก"**

6. **ถ้าสำเร็จ:**
   - จะขึ้น Alert "สมัครสมาชิกสำเร็จ!"
   - ระบบจะสลับไปหน้า Login อัตโนมัติ
   - Email จะยังคงอยู่ในฟอร์ม

7. **กรอก Password อีกครั้งแล้วกด "เข้าสู่ระบบ"**

#### **Option B: ผ่าน Supabase Dashboard (สำหรับ Admin)**

1. **ไปที่ Supabase Dashboard:**
   ```
   https://supabase.com/dashboard/project/puvcfdnfshnwloyujrwy
   ```

2. **ไปที่ Authentication → Users:**
   - คลิก "Authentication" ในเมนูซ้าย
   - คลิก "Users" tab

3. **คลิก "Add user" หรือ "Invite":**
   - Email: admin@example.com
   - Password: Admin@12345
   - **ถ้าปิด Email Confirmation:** เลือก "Auto Confirm User"
   - กด "Create User"

4. **ลอง Login ใน Web App:**
   ```
   http://localhost:3000/auth
   ```
   - Email: admin@example.com
   - Password: Admin@12345

---

### Step 3: สร้าง Admin User (สำหรับ Admin Panel)

ถ้าต้องการใช้ Admin functions:

1. **แก้ไข `.env`:**
   ```env
   ADMIN_EMAILS=admin@example.com,youremail@gmail.com
   ```

2. **สร้าง User ผ่านหน้า Register:**
   - ไปที่ http://localhost:3000/auth
   - Register ด้วย email ที่ระบุใน `ADMIN_EMAILS`
   - ระบบจะให้ Role ADMIN อัตโนมัติ

3. **ตรวจสอบใน Supabase:**
   - ไปที่ Table Editor → users table
   - ดู column "role" ควรเป็น "ADMIN"

---

## 🔍 การตรวจสอบ Debug

### ตรวจสอบ User ใน Supabase:

1. **ไปที่ Supabase Dashboard:**
   ```
   https://supabase.com/dashboard/project/puvcfdnfshnwloyujrwy/auth/users
   ```

2. **ดู Users list:**
   - มี User อยู่หรือไม่?
   - Status เป็น "Confirmed" หรือไม่?
   - Email ตรงกับที่ลอง login หรือไม่?

### ตรวจสอบ Browser Console:

1. **เปิด DevTools (F12)**

2. **ดู Console tab:**
   - มี error message อะไรบ้าง?
   - "Login successful" ถ้า login สำเร็จ
   - Error detail ถ้าล้มเหลว

3. **ดู Network tab:**
   - มี request ไป `/auth/v1/token?grant_type=password`?
   - Status code เป็นเท่าไร? (200 = สำเร็จ, 400 = ล้มเหลว)
   - Response body มีข้อความอะไร?

---

## 🚨 Common Issues & Solutions

### Issue 1: "Invalid login credentials"
**สาเหตุ:** ยังไม่มี User หรือ Password ผิด
**แก้ไข:**
- ลอง Register ก่อน
- ตรวจสอบ email/password ให้ถูกต้อง
- ตรวจสอบว่า User status เป็น "Confirmed" ใน Supabase

### Issue 2: "Email not confirmed"
**สาเหตุ:** Supabase ตั้งค่าให้ต้อง verify email
**แก้ไข:**
- ไปปิด "Email Confirmation" ใน Supabase Settings
- หรือ ไปกด link ใน email ที่ Supabase ส่งมา
- หรือ ใน Supabase Dashboard → Users → คลิกที่ User → "Confirm email"

### Issue 3: "User already registered"
**สาเหตุ:** Email นี้มีใน Database แล้ว
**แก้ไข:**
- ใช้ email อื่น
- หรือ ลอง Login ด้วย email นั้น
- หรือ ลบ User ใน Supabase Dashboard → Users

### Issue 4: "Password too short"
**สาเหตุ:** Password น้อยกว่า 6 ตัว (Supabase default)
**แก้ไข:**
- ใช้ password อย่างน้อย 8 ตัว
- ควรมีตัวพิมพ์ใหญ่, ตัวพิมพ์เล็ก, ตัวเลข, สัญลักษณ์

### Issue 5: "Invalid API key"
**สาเหตุ:** SUPABASE_ANON_KEY ไม่ถูกต้อง
**แก้ไข:**
- ตรวจสอบ `.env` file
- Copy key จาก Supabase Dashboard → Settings → API

---

## ✅ Test Account (สำหรับทดสอบ)

หลังจาก Setup แล้ว สร้าง Test Accounts เหล่านี้:

### **Regular User:**
```
Email: user@test.com
Password: User@12345
Role: USER
```

### **Admin User:**
```
Email: admin@test.com
Password: Admin@12345
Role: ADMIN
```

**วิธีสร้าง:**
1. เพิ่ม `admin@test.com` ใน `.env` → `ADMIN_EMAILS`
2. Restart server (`npm run dev`)
3. Register ด้วย email `admin@test.com`
4. ระบบจะให้ Role ADMIN อัตโนมัติ

---

## 📊 Checklist

ก่อน Login ให้ตรวจสอบ:

- [ ] Supabase Project สร้างแล้ว
- [ ] Database Tables สร้างแล้ว (users, equipment, borrow_requests)
- [ ] `.env` มี SUPABASE_URL และ SUPABASE_ANON_KEY
- [ ] Email Confirmation ปิดหรือตั้งค่าแล้ว
- [ ] User สร้างใน Supabase Auth แล้ว
- [ ] User status เป็น "Confirmed"
- [ ] Server รันอยู่ (npm run dev)

---

## 🎯 Quick Start (5 นาที)

```bash
# 1. Start server
npm run dev

# 2. เปิด browser
http://localhost:3000/auth

# 3. กด "สมัครสมาชิก"
Email: test@example.com
Password: Test@12345
Name: Test User

# 4. กด "สมัครสมาชิก" button

# 5. หลังจากสำเร็จ ให้ Login
Email: test@example.com
Password: Test@12345

# 6. กด "เข้าสู่ระบบ"

# 7. เสร็จ! ควรเข้าสู่ระบบได้
```

---

## 📞 ยังมีปัญหา?

ถ้ายังแก้ไม่ได้:

1. **ส่ง Screenshot:**
   - Error message ใน Browser
   - Console log (F12 → Console tab)
   - Network request (F12 → Network tab)

2. **ส่งข้อมูล:**
   - Email ที่พยายาม login
   - มี User ใน Supabase หรือไม่? (screenshot)
   - Email Confirmation setting เป็นอย่างไร?

3. **ลอง Clear Cache:**
   ```
   - ลบ Cookies
   - Clear Browser Cache
   - Restart Browser
   ```

4. **ลอง Create User ใหม่:**
   - ใช้ email ใหม่
   - Password แข็งแรง (8+ ตัวอักษร)
   - ตรวจสอบว่าสร้างสำเร็จใน Supabase Dashboard
