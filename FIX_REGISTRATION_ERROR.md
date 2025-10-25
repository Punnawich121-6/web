# 🔧 แก้ไข Error: "Email address is invalid"

## ปัญหา
เมื่อพยายาม Register ด้วย `admin@gmail.com` ได้ Error:
```
Runtime AuthApiError: Email address 'admin@gmail.com' is invalid
```

---

## ✅ วิธีแก้ไข - แบบ Step by Step

### **วิธีที่ 1: ลบ User เดิมที่มีอยู่ใน Supabase (แนะนำ)**

Error นี้มักเกิดจากการที่มี User ค้างอยู่ใน Supabase Auth จากการลงทะเบียนที่ล้มเหลวก่อนหน้า

#### **ขั้นตอนที่ 1: ตรวจสอบและลบผ่าน Supabase Dashboard (ง่ายที่สุด)**

1. **เปิด Supabase Dashboard:**
   ```
   https://supabase.com/dashboard/project/puvcfdnfshnwloyujrwy/auth/users
   ```

2. **ตรวจสอบ Users list:**
   - ดูว่ามี User ที่มี email `admin@gmail.com` หรือไม่
   - ถ้ามี ให้คลิกที่ User นั้น
   - คลิกปุ่ม **"Delete User"** (มักอยู่มุมขวาบน)
   - ยืนยันการลบ

3. **ลอง Register อีกครั้ง:**
   - กลับไปที่ http://localhost:3000/auth
   - ลองสมัครสมาชิกด้วย `admin@gmail.com` อีกครั้ง

#### **ขั้นตอนที่ 2: ลบผ่าน SQL (ถ้าวิธีที่ 1 ไม่ได้)**

1. **เปิด Supabase SQL Editor:**
   ```
   https://supabase.com/dashboard/project/puvcfdnfshnwloyujrwy/sql
   ```

2. **Run SQL นี้:**
   ```sql
   -- ตรวจสอบว่ามี User นี้หรือไม่
   SELECT id, email, email_confirmed_at, created_at
   FROM auth.users
   WHERE email = 'admin@gmail.com';
   ```

3. **ถ้าพบ User ให้ลบออก:**
   ```sql
   -- ลบ User ที่มี email นี้
   DELETE FROM auth.users WHERE email = 'admin@gmail.com';

   -- ตรวจสอบว่าลบสำเร็จ (ควรได้ 0 rows)
   SELECT * FROM auth.users WHERE email = 'admin@gmail.com';
   ```

4. **ลอง Register อีกครั้ง**

---

### **วิธีที่ 2: ใช้ Email อื่นแทน**

ถ้าวิธีที่ 1 ไม่ได้ผล ลองใช้ email อื่นก่อน เพื่อทดสอบว่าระบบใช้งานได้:

**Test Accounts:**
```
Email: test@example.com
Password: Test@12345
Name: Test User
```

หรือ
```
Email: user@test.com
Password: User@12345
Name: Your Name
```

**หลังจากสร้าง Test Account สำเร็จแล้ว** ค่อยกลับมาแก้ปัญหา admin@gmail.com

---

### **วิธีที่ 3: ตรวจสอบ Supabase Email Settings**

1. **ไปที่ Supabase Dashboard → Authentication → Settings:**
   ```
   https://supabase.com/dashboard/project/puvcfdnfshnwloyujrwy/auth/settings
   ```

2. **ตรวจสอบการตั้งค่าเหล่านี้:**

   #### **Email Confirmation:**
   - ✅ **ปิด "Enable email confirmations"** (สำหรับการทดสอบ)
   - หรือ **เปิด** และตั้งค่า Email templates ให้ถูกต้อง

   #### **Email Rate Limits:**
   - ตรวจสอบว่าไม่ได้ lock email จากการพยายามสมัครหลายครั้ง
   - ถ้ามีการ lock ให้รอ 1-2 ชั่วโมง หรือลบ User และลองใหม่

   #### **Email Provider Settings:**
   - ตรวจสอบว่า Email provider (SMTP) ตั้งค่าถูกต้อง
   - ถ้าใช้ Supabase default email service ควรใช้งานได้ทันที

3. **กด Save Changes**

4. **ลอง Register อีกครั้ง**

---

### **วิธีที่ 4: ตรวจสอบ Trigger และ Permissions (ขั้นสูง)**

ถ้ายังไม่ได้ อาจเป็นปัญหาจาก Trigger หรือ Permissions:

1. **เปิด Supabase SQL Editor**

2. **Run SQL นี้เพื่อตรวจสอบ Trigger:**
   ```sql
   -- ตรวจสอบว่า Trigger ทำงานหรือไม่
   SELECT
     trigger_name,
     event_manipulation,
     event_object_table,
     action_statement
   FROM information_schema.triggers
   WHERE trigger_name = 'on_auth_user_created';
   ```

3. **ถ้าไม่เจอ Trigger ให้สร้างใหม่:**
   - Run SQL จากไฟล์ `fix-trigger.sql` อีกครั้ง

4. **Grant Permissions อีกครั้ง:**
   ```sql
   -- Grant all permissions
   GRANT USAGE ON SCHEMA public TO postgres, anon, authenticated, service_role;
   GRANT ALL ON ALL TABLES IN SCHEMA public TO postgres, anon, authenticated, service_role;
   GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO postgres, anon, authenticated, service_role;
   GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO postgres, anon, authenticated, service_role;
   ```

---

### **วิธีที่ 5: สร้าง User ผ่าน Supabase Dashboard โดยตรง**

ถ้าวิธีอื่นไม่ได้ ให้สร้าง User ผ่าน Dashboard แทน:

1. **ไปที่ Supabase Dashboard → Authentication → Users:**
   ```
   https://supabase.com/dashboard/project/puvcfdnfshnwloyujrwy/auth/users
   ```

2. **คลิก "Add User" หรือ "Invite"**

3. **กรอกข้อมูล:**
   - Email: `admin@gmail.com`
   - Password: `Admin@12345` (หรือรหัสผ่านที่ต้องการ)
   - ✅ เลือก **"Auto Confirm User"**

4. **คลิก "Create User"**

5. **ตรวจสอบว่าสร้าง User profile ใน `users` table:**
   ```sql
   SELECT * FROM users WHERE email = 'admin@gmail.com';
   ```

6. **ถ้ายังไม่มี ให้สร้างด้วยตัวเอง:**
   ```sql
   -- หา auth_id ของ User ที่สร้าง
   SELECT id, email FROM auth.users WHERE email = 'admin@gmail.com';

   -- สร้าง User profile (เปลี่ยน 'AUTH_ID_HERE' เป็น id ที่ได้)
   INSERT INTO users (auth_id, email, display_name, role)
   VALUES (
     'AUTH_ID_HERE',
     'admin@gmail.com',
     'Admin User',
     'ADMIN'
   );
   ```

7. **ลอง Login:**
   - ไปที่ http://localhost:3000/auth
   - คลิก "เข้าสู่ระบบ"
   - กรอก Email: `admin@gmail.com`
   - กรอก Password: `Admin@12345`
   - คลิก "เข้าสู่ระบบ"

---

## 🔍 วิธีตรวจสอบว่าแก้ไขสำเร็จ

### **ขั้นตอนที่ 1: ตรวจสอบ Browser Console**
1. เปิด DevTools (กด F12)
2. ไปที่ tab **Console**
3. ลอง Register อีกครั้ง
4. ดู Error message โดยละเอียด

### **ขั้นตอนที่ 2: ตรวจสอบ Network Tab**
1. เปิด DevTools (กด F12)
2. ไปที่ tab **Network**
3. ลอง Register อีกครั้ง
4. หา request ที่ไปยัง `/auth/v1/signup`
5. คลิกดู Response → มี error message อะไร?

### **ขั้นตอนที่ 3: ตรวจสอบ Supabase Logs**
1. ไปที่ Supabase Dashboard → Logs
2. เลือก **Auth Logs**
3. ดู logs ล่าสุด
4. มี error message หรือคำเตือนอะไรบ้าง?

---

## 📋 Checklist - ลำดับการแก้ไข

ลองทำตามลำดับนี้:

- [ ] **Step 1:** ลบ User เดิมผ่าน Dashboard (วิธีที่ 1)
- [ ] **Step 2:** ลอง Register ด้วย admin@gmail.com อีกครั้ง
- [ ] **Step 3:** ถ้ายังไม่ได้ → ลองใช้ email อื่น (test@example.com)
- [ ] **Step 4:** ถ้า email อื่นได้ → แสดงว่าระบบใช้งานได้ ปัญหาอยู่ที่ admin@gmail.com
- [ ] **Step 5:** ตรวจสอบ Email Settings ใน Supabase (วิธีที่ 3)
- [ ] **Step 6:** ถ้ายังไม่ได้ → สร้าง User ผ่าน Dashboard (วิธีที่ 5)
- [ ] **Step 7:** ทดสอบ Login

---

## 💡 คำแนะนำเพิ่มเติม

### **ถ้าต้องการใช้ admin@gmail.com เป็น Admin:**

1. **อัพเดท `.env`:**
   ```env
   ADMIN_EMAILS=admin@gmail.com,your-backup-email@example.com
   ```

2. **Restart Development Server:**
   ```bash
   # กด Ctrl+C เพื่อหยุด server
   npm run dev
   ```

3. **สร้าง User:**
   - ถ้าใช้วิธี Register: ระบบจะให้ Role ADMIN อัตโนมัติ
   - ถ้าสร้างผ่าน Dashboard: ต้อง update role ด้วยตัวเอง

4. **ตรวจสอบ Role:**
   ```sql
   SELECT auth_id, email, role FROM users WHERE email = 'admin@gmail.com';
   ```

5. **ถ้า Role ไม่ใช่ ADMIN ให้ update:**
   ```sql
   UPDATE users SET role = 'ADMIN' WHERE email = 'admin@gmail.com';
   ```

---

## 🚨 สิ่งที่ต้องระวัง

1. **อย่าลืม Auto Confirm User:**
   - เมื่อสร้าง User ผ่าน Dashboard ต้องเลือก "Auto Confirm User"
   - ไม่งั้น User จะไม่สามารถ Login ได้

2. **Password Requirements:**
   - อย่างน้อย 6 ตัวอักษร (Supabase default)
   - แนะนำให้ใช้ 8+ ตัวอักษร พร้อมตัวพิมพ์ใหญ่/เล็ก/ตัวเลข/สัญลักษณ์

3. **Email Format:**
   - ต้องเป็น email ที่ถูกต้อง (มี @ และ domain)
   - ห้ามมีช่องว่าง หรือตัวอักษรพิเศษที่ไม่ได้รับอนุญาต

---

## 📞 ยังแก้ไม่ได้?

ถ้าลองทุกวิธีแล้วยังไม่ได้:

1. **ส่ง Screenshot:**
   - Error message ใน Browser Console
   - Network tab → Request/Response
   - Supabase Auth Logs

2. **ส่งข้อมูล:**
   - Email ที่พยายาม Register
   - มี User ใน Supabase Dashboard หรือไม่
   - Email Confirmation setting เป็นอย่างไร

3. **ลอง Clear Everything:**
   ```bash
   # Clear browser cache & cookies
   # ลบ User ทั้งหมดใน Supabase
   # Run SQL setup ใหม่ทั้งหมด
   ```

---

## ✅ Quick Solution (แนะนำ)

**วิธีที่เร็วที่สุด:**

```bash
# 1. เปิด Supabase Dashboard
https://supabase.com/dashboard/project/puvcfdnfshnwloyujrwy/auth/users

# 2. ลบ User ที่มี email admin@gmail.com (ถ้ามี)

# 3. ลอง Register ด้วย email อื่นก่อน
Email: test@example.com
Password: Test@12345
Name: Test User

# 4. ถ้าสำเร็จ แสดงว่าระบบใช้งานได้

# 5. แล้วค่อยลองสร้าง admin@gmail.com อีกครั้ง
```

---

**Good Luck! 🎉**
