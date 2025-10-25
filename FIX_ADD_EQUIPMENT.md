# 🔧 แก้ไขปัญหา: กดเพิ่มอุปกรณ์ไม่ทำงาน

## ปัญหา
Login ด้วย Admin account แล้วกดเพิ่มอุปกรณ์ แต่ไม่ขึ้นอะไรเลย

---

## สาเหตุที่เป็นไปได้:

1. **User ไม่มี Role ADMIN** - ใน database role ไม่ใช่ 'ADMIN'
2. **API ขาดฟิลด์ location** - Database ต้องการ location (NOT NULL) แต่ API ไม่ได้ส่ง ✅ แก้แล้ว
3. **RLS Policies ไม่อนุญาต** - Row Level Security ไม่อนุญาตให้ insert

---

## ✅ วิธีแก้ไข

### **Step 1: ตรวจสอบว่า User เป็น ADMIN หรือไม่**

1. **เปิด Supabase SQL Editor:**
   ```
   https://supabase.com/dashboard/project/puvcfdnfshnwloyujrwy/sql
   ```

2. **Run SQL นี้เพื่อดู Users ทั้งหมด:**
   ```sql
   SELECT
     id,
     auth_id,
     email,
     display_name,
     role,
     created_at
   FROM users
   ORDER BY created_at DESC;
   ```

3. **ตรวจสอบว่า email ของคุณมี `role = 'ADMIN'` หรือไม่**
   - ✅ ถ้าเป็น 'ADMIN' → ไป Step 2
   - ❌ ถ้าไม่ใช่ → ต้องเปลี่ยน role ก่อน (ดูด้านล่าง)

---

### **Step 2: เปลี่ยน User ให้เป็น ADMIN (ถ้าจำเป็น)**

1. **Run SQL นี้ (เปลี่ยน email เป็นของคุณ):**
   ```sql
   UPDATE users
   SET role = 'ADMIN'
   WHERE email = 'admin@gmail.com';  -- เปลี่ยนเป็น email ของคุณ

   -- ตรวจสอบว่าเปลี่ยนสำเร็จ
   SELECT email, role FROM users WHERE email = 'admin@gmail.com';
   ```

2. **ควรเห็น:**
   ```
   email: admin@gmail.com
   role: ADMIN
   ```

---

### **Step 3: แก้ไข RLS Policies (สำคัญมาก!)**

1. **ยังอยู่ใน SQL Editor ให้ run SQL นี้:**
   ```sql
   -- ลบ Policies เดิม
   DROP POLICY IF EXISTS "Anyone can read equipment" ON equipment;
   DROP POLICY IF EXISTS "Admins can manage equipment" ON equipment;

   -- สร้าง Policies ใหม่
   CREATE POLICY "Anyone can read equipment"
     ON equipment FOR SELECT
     USING (true);

   CREATE POLICY "Admins can insert equipment"
     ON equipment FOR INSERT
     WITH CHECK (
       EXISTS (
         SELECT 1 FROM users
         WHERE users.auth_id = auth.uid()
         AND users.role IN ('ADMIN', 'MODERATOR')
       )
     );

   CREATE POLICY "Admins can update equipment"
     ON equipment FOR UPDATE
     USING (
       EXISTS (
         SELECT 1 FROM users
         WHERE users.auth_id = auth.uid()
         AND users.role IN ('ADMIN', 'MODERATOR')
       )
     );

   CREATE POLICY "Admins can delete equipment"
     ON equipment FOR DELETE
     USING (
       EXISTS (
         SELECT 1 FROM users
         WHERE users.auth_id = auth.uid()
         AND users.role IN ('ADMIN', 'MODERATOR')
       )
     );
   ```

2. **Grant Permissions:**
   ```sql
   GRANT USAGE ON SCHEMA public TO postgres, anon, authenticated, service_role;
   GRANT ALL ON ALL TABLES IN SCHEMA public TO postgres, anon, authenticated, service_role;
   GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO postgres, anon, authenticated, service_role;
   GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO postgres, anon, authenticated, service_role;
   ```

---

### **Step 4: Restart Server และทดสอบ**

1. **Restart Development Server:**
   ```bash
   # กด Ctrl+C
   npm run dev
   ```

2. **Logout และ Login อีกครั้ง:**
   - ไปที่ http://localhost:3000
   - Logout (ถ้ามี)
   - Login ด้วย admin account

3. **ลองเพิ่มอุปกรณ์:**
   - ไปที่หน้า Admin Equipment
   - คลิก "เพิ่มอุปกรณ์"
   - กรอกข้อมูล (ต้องกรอกให้ครบทุกฟิลด์)

---

## 🔍 ถ้ายังไม่ได้ - ตรวจสอบ Browser Console

1. **เปิด DevTools (F12)**
2. **ไปที่ Console tab**
3. **ลองกดเพิ่มอุปกรณ์**
4. **ดู error message:**
   - มี error อะไร?
   - Status code เท่าไร? (403 = ไม่มีสิทธิ์, 400 = ข้อมูลผิด, 500 = server error)

5. **ไปที่ Network tab:**
   - หา request ไปที่ `/api/equipment`
   - คลิกดู Request → Payload
   - คลิกดู Response → มี error message อะไร?

---

## 📋 Checklist - ตรวจสอบทีละขั้น

- [ ] ✅ User มี role = 'ADMIN' ใน database
- [ ] ✅ RLS Policies สร้างใหม่แล้ว (4 policies)
- [ ] ✅ Grant permissions ครบถ้วน
- [ ] ✅ Restart server แล้ว
- [ ] ✅ Logout และ Login ใหม่แล้ว
- [ ] ✅ ลองกดเพิ่มอุปกรณ์อีกครั้ง

---

## 🎯 ตัวอย่างการเพิ่มอุปกรณ์

ฟิลด์ที่ **ต้อง** กรอก:
- **ชื่ออุปกรณ์:** เครื่องพิมพ์ 3D
- **หมวดหมู่:** อิเล็กทรอนิกส์
- **รายละเอียด:** เครื่องพิมพ์ 3D สำหรับงาน Prototype
- **Serial Number:** 3DP-001
- **สถานที่:** ห้อง Lab 101
- **จำนวนทั้งหมด:** 1
- **จำนวนที่ว่าง:** 1

ฟิลด์ที่ **ไม่บังคับ:**
- รูปภาพ (URL)
- คุณสมบัติ
- สภาพ
- วันที่ซื้อ

---

## 🚨 Common Errors

### **Error: "Unauthorized: Admin access required"**
**สาเหตุ:** User ไม่ใช่ ADMIN
**แก้ไข:** ทำ Step 2 - เปลี่ยน role เป็น ADMIN

### **Error: "new row violates row-level security policy"**
**สาเหตุ:** RLS Policies ไม่อนุญาต
**แก้ไข:** ทำ Step 3 - สร้าง RLS Policies ใหม่

### **Error: "null value in column 'location'"**
**สาเหตุ:** ไม่ได้กรอกฟิลด์ location
**แก้ไข:** ✅ แก้ไขแล้ว - API จะใส่ค่า default "ไม่ระบุ"

### **Error: "Invalid token" หรือ "Token is required"**
**สาเหตุ:** Session หมดอายุหรือไม่ถูกต้อง
**แก้ไข:** Logout และ Login ใหม่

---

## 📞 ยังแก้ไม่ได้?

ลอง run SQL ทีละส่วนตามไฟล์ **`check-admin-permissions.sql`:**

```bash
# ไฟล์นี้มี SQL ทั้งหมดที่ต้อง run
check-admin-permissions.sql
```

**ขั้นตอน:**
1. Run Step 1 - ดู users
2. Run Step 2 - เปลี่ยน role
3. Run Step 4-5 - สร้าง policies
4. Run Step 6 - grant permissions
5. Restart server และทดสอบ

---

## ✅ สิ่งที่ควรเห็นหลังจากแก้ไขสำเร็จ

### **1. เมื่อกดเพิ่มอุปกรณ์:**
```
✅ Modal เปิดขึ้นมา
✅ กรอกข้อมูลได้
✅ กด Submit แล้วปิด Modal
✅ อุปกรณ์ใหม่แสดงในรายการ
```

### **2. ใน Console (F12):**
```
✅ ไม่มี error
✅ หรือมี log "Equipment added successfully" (ถ้ามี)
```

### **3. ใน Database (Supabase):**
```sql
SELECT * FROM equipment ORDER BY created_at DESC LIMIT 1;
```
ควรเห็นอุปกรณ์ที่เพิ่งเพิ่มเข้าไป

---

## 📝 สรุปการแก้ไข

**สิ่งที่แก้แล้ว:**
- ✅ เพิ่ม `location` field ใน API (พร้อม default value)
- ✅ เพิ่ม `specifications`, `condition`, `purchase_date` fields

**สิ่งที่ต้องทำใน Supabase:**
- ⏳ เปลี่ยน User role เป็น ADMIN
- ⏳ สร้าง RLS Policies ใหม่
- ⏳ Grant Permissions

---

ลองทำตาม Step 1-4 ให้ครบนะครับ โดยเฉพาะ **Step 2 และ 3** ซึ่งเป็นขั้นตอนสำคัญที่สุด! 🚀

ถ้ายังไม่ได้ ส่ง Screenshot ของ:
1. Browser Console (F12 → Console tab)
2. Network tab (request/response ของ /api/equipment)
3. User role ใน database (ผลลัพธ์จาก Step 1)
