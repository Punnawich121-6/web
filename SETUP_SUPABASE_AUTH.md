# 🔐 ตั้งค่า Supabase Authentication (แก้ปัญหา "Email address is invalid")

## ปัญหา
ลอง Register ด้วย email ใดๆ ก็ได้ Error:
```
Runtime AuthApiError: Email address "xxx@example.com" is invalid
```

**สาเหตุ:** Supabase Auth ยังไม่ได้เปิดให้ใช้ Email/Password Authentication

---

## ✅ วิธีแก้ไข - ตั้งค่า Supabase Auth

### **Step 1: เปิดใช้งาน Email Provider (สำคัญที่สุด!)**

1. **เปิด Supabase Dashboard:**
   ```
   https://supabase.com/dashboard/project/puvcfdnfshnwloyujrwy
   ```

2. **ไปที่ Authentication → Providers:**
   ```
   คลิก "Authentication" ในเมนูซ้าย
   → คลิก "Providers" tab ด้านบน
   ```

3. **เปิดใช้งาน Email Provider:**
   - หา **"Email"** ใน providers list
   - ✅ **เปิด (Enable)** Email provider
   - ตรวจสอบให้แน่ใจว่ามี toggle switch เป็นสีเขียว (ON)

4. **Configure Email Provider:**

   #### **Option 1: ใช้ Supabase Email Service (แนะนำสำหรับ Development)**
   - เลือก **"Use Supabase's email service"**
   - ไม่ต้องตั้งค่า SMTP
   - กด **Save**

   #### **Option 2: ใช้ Custom SMTP (สำหรับ Production)**
   - เลือก **"Use custom SMTP"**
   - กรอก SMTP settings:
     - Host: smtp.gmail.com (ถ้าใช้ Gmail)
     - Port: 587
     - Username: your-email@gmail.com
     - Password: your-app-password
   - กด **Save**

5. **กด "Save" หรือ "Update"**

---

### **Step 2: ตั้งค่า Email Confirmation**

1. **อยู่ที่ Authentication → Providers → Email (ต่อจาก Step 1)**

2. **Scroll ลงมาหา Email Settings:**

   #### **Confirm email (สำหรับ Development - แนะนำให้ปิด)**
   - ❌ **ปิด "Confirm email"** checkbox
   - หรือ ✅ **เลือก "Enable email confirmations"** แล้วตั้งค่า Email templates

3. **Secure email change:**
   - ✅ **เปิด** (ค่า default)

4. **กด Save**

---

### **Step 3: ตั้งค่า Site URL และ Redirect URLs**

1. **ไปที่ Authentication → URL Configuration:**
   ```
   คลิก "Authentication" → คลิก "URL Configuration" tab
   ```

2. **ตั้งค่า Site URL:**
   ```
   Development: http://localhost:3000
   Production: https://yourdomain.com
   ```

3. **ตั้งค่า Redirect URLs (Additional):**
   ```
   http://localhost:3000/**
   http://localhost:3000/auth
   http://localhost:3000/auth/callback
   ```

4. **กด Save**

---

### **Step 4: ตรวจสอบการตั้งค่า Auth**

1. **ไปที่ Authentication → Settings:**

2. **ตรวจสอบ General settings:**
   - **Minimum password length:** 6 (หรือมากกว่า)
   - ✅ **Enable phone signup:** ปิดไว้ (ถ้าไม่ใช้)
   - ✅ **Enable manual linking:** ปิดไว้ (ถ้าไม่ใช้)

3. **ตรวจสอบ Rate limits:**
   - **Email signups per hour:** 100 (หรือตามที่ต้องการ)
   - **Email signins per hour:** 100

4. **กด Save**

---

### **Step 5: ทดสอบ Authentication**

หลังจากตั้งค่าเสร็จแล้ว:

1. **Restart Development Server:**
   ```bash
   # กด Ctrl+C เพื่อหยุด server
   npm run dev
   ```

2. **เปิด Browser:**
   ```
   http://localhost:3000/auth
   ```

3. **ลอง Register:**
   ```
   ชื่อ: Test User
   Email: test@example.com
   Password: Test@12345
   Confirm Password: Test@12345
   ```

4. **คลิก "สมัครสมาชิก"**

5. **ตรวจสอบผลลัพธ์:**
   - ✅ ถ้าสำเร็จ: จะขึ้น "สมัครสมาชิกสำเร็จ!"
   - ❌ ถ้ายังไม่ได้: ดู error message และไปที่ Step 6

---

### **Step 6: ตรวจสอบ Logs (ถ้ายังมีปัญหา)**

1. **ไปที่ Logs:**
   ```
   Dashboard → Logs → Auth Logs
   ```

2. **ดู Error messages:**
   - มี error อะไรบ้าง?
   - มี request ไปถึง Supabase หรือไม่?

3. **ดู Browser Console:**
   - กด F12 → Console tab
   - ดู error messages

---

## 📋 Quick Checklist

ตรวจสอบให้แน่ใจว่าทำครบทุกข้อ:

- [ ] ✅ Email Provider **เปิดใช้งาน** (Authentication → Providers → Email)
- [ ] ✅ เลือก "Use Supabase's email service"
- [ ] ❌ **ปิด** "Confirm email" (สำหรับ Development)
- [ ] ✅ Site URL = `http://localhost:3000`
- [ ] ✅ Redirect URLs มี `http://localhost:3000/**`
- [ ] ✅ กด **Save** ทุก settings
- [ ] ✅ Restart development server (`npm run dev`)
- [ ] ✅ ลอง Register อีกครั้ง

---

## 🎯 คำสั่งที่ต้องทำ (Step by Step)

### **1. เปิด Supabase Dashboard**
```
https://supabase.com/dashboard/project/puvcfdnfshnwloyujrwy
```

### **2. ไปที่ Authentication → Providers**
- คลิก "Authentication" (เมนูซ้าย)
- คลิก "Providers" tab

### **3. เปิด Email Provider**
- หา "Email" ใน list
- คลิก "Email" เพื่อเข้าไปตั้งค่า
- ✅ **เปิด toggle switch ให้เป็นสีเขียว (Enable)**
- เลือก "Use Supabase's email service"
- กด "Save"

### **4. ปิด Email Confirmation (ถ้าอยู่ในหน้าเดียวกัน)**
- Scroll ลงมา
- ❌ **ยกเลิก** checkbox "Confirm email"
- กด "Save"

### **5. ไปที่ Authentication → URL Configuration**
- คลิก "URL Configuration" tab
- Site URL: `http://localhost:3000`
- Redirect URLs: `http://localhost:3000/**`
- กด "Save"

### **6. Restart Server และทดสอบ**
```bash
# ใน Terminal
Ctrl+C   # หยุด server

npm run dev   # เริ่ม server ใหม่

# เปิด Browser
http://localhost:3000/auth

# ลอง Register
```

---

## 🔍 Screenshot ที่ควรเห็น

### **Authentication → Providers → Email**
```
✅ Email (toggle ON - สีเขียว)
   ├─ Use Supabase's email service (selected)
   └─ Save button
```

### **Email Settings**
```
❌ Confirm email (unchecked)
✅ Secure email change (checked)
Save button
```

### **URL Configuration**
```
Site URL: http://localhost:3000
Redirect URLs:
  - http://localhost:3000/**
Save button
```

---

## 🚨 ถ้ายังไม่ได้

### **ปัญหา: ไม่เจอ "Email" ใน Providers**
**แก้ไข:**
- ตรวจสอบว่าอยู่ใน tab **"Providers"** ไม่ใช่ "Users"
- Email Provider ควรอยู่ใน list แรกๆ

### **ปัญหา: กด Save แล้วไม่มีอะไรเกิดขึ้น**
**แก้ไข:**
- Refresh หน้า Dashboard
- ตรวจสอบว่า toggle switch ยังเป็นสีเขียวอยู่หรือไม่
- ลองปิด/เปิด tab แล้วเข้ามาใหม่

### **ปัญหา: ยังได้ "Email address is invalid"**
**แก้ไข:**
1. Clear browser cache และ cookies
2. Restart browser
3. Restart development server
4. ตรวจสอบ Network tab (F12) → ดู request/response
5. ดู Auth Logs ใน Supabase Dashboard

---

## 📞 Alternative: สร้าง User ผ่าน Dashboard

ถ้าตั้งค่าแล้วยังไม่ได้ ให้สร้าง User ผ่าน Dashboard ก่อน:

### **1. ไปที่ Authentication → Users**
```
https://supabase.com/dashboard/project/puvcfdnfshnwloyujrwy/auth/users
```

### **2. คลิก "Add User" หรือ "Invite"**

### **3. กรอกข้อมูล:**
```
Email: test@example.com
Password: Test@12345
✅ Auto Confirm User (checked)
```

### **4. คลิก "Create User"**

### **5. ลอง Login:**
```
http://localhost:3000/auth
→ เข้าสู่ระบบ
→ Email: test@example.com
→ Password: Test@12345
```

---

## ✅ สิ่งที่ควรเห็นหลังจากแก้ไขสำเร็จ

### **1. Register สำเร็จ:**
```
✅ "สมัครสมาชิกสำเร็จ! กรุณาเข้าสู่ระบบ"
✅ หน้าจอสลับไปหน้า Login
✅ Email ยังคงอยู่ในฟอร์ม
```

### **2. ใน Supabase Dashboard → Authentication → Users:**
```
✅ มี User ใหม่แสดงขึ้นมา
✅ Email ตรงกับที่สมัคร
✅ Status: Confirmed (ถ้าปิด email confirmation)
```

### **3. ใน Database → users table:**
```sql
SELECT * FROM users WHERE email = 'test@example.com';
```
ควรเห็น:
```
✅ id, auth_id, email, display_name, role
✅ role = 'USER' (หรือ 'ADMIN' ถ้าอยู่ใน ADMIN_EMAILS)
```

---

## 🎉 หลังจากสำเร็จแล้ว

1. **ทดสอบ Login:**
   - ไปที่ http://localhost:3000/auth
   - กรอก email และ password
   - คลิก "เข้าสู่ระบบ"

2. **ทดสอบ Features:**
   - Dashboard
   - Profile
   - Equipment Catalog
   - Borrowing History

3. **สร้าง Admin User:**
   - Register ด้วย email ที่อยู่ใน `.env` → `ADMIN_EMAILS`
   - ตรวจสอบว่าได้ Role ADMIN

---

ลองทำตาม Step 1-6 ให้ครบนะครับ โดยเฉพาะ **Step 3: เปิด Email Provider** ซึ่งเป็นขั้นตอนที่สำคัญที่สุด! 🚀
