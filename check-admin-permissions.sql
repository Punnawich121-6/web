-- ============================================
-- ตรวจสอบ Admin Permissions
-- ============================================

-- Step 1: ตรวจสอบ User ทั้งหมดและ Role
SELECT
  id,
  auth_id,
  email,
  display_name,
  role,
  created_at
FROM users
ORDER BY created_at DESC;

-- ============================================
-- Step 2: เปลี่ยน User ให้เป็น ADMIN
-- ============================================
-- เปลี่ยน 'YOUR_EMAIL_HERE' เป็น email ที่ต้องการให้เป็น admin

UPDATE users
SET role = 'ADMIN'
WHERE email = 'admin@gmail.com';  -- เปลี่ยนเป็น email ของคุณ

-- ตรวจสอบว่าเปลี่ยนสำเร็จ
SELECT email, role FROM users WHERE email = 'admin@gmail.com';

-- ============================================
-- Step 3: ตรวจสอบ RLS Policies ที่มีอยู่
-- ============================================
SELECT
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- ============================================
-- Step 4: ลบ Policies เดิม (ถ้ามี)
-- ============================================
DROP POLICY IF EXISTS "Anyone can read equipment" ON equipment;
DROP POLICY IF EXISTS "Admins can manage equipment" ON equipment;

-- ============================================
-- Step 5: สร้าง Policies ใหม่สำหรับ Equipment
-- ============================================

-- Policy 1: ทุกคนอ่านได้
CREATE POLICY "Anyone can read equipment"
  ON equipment FOR SELECT
  USING (true);

-- Policy 2: Admin สามารถสร้าง equipment ได้
CREATE POLICY "Admins can insert equipment"
  ON equipment FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.auth_id = auth.uid()
      AND users.role IN ('ADMIN', 'MODERATOR')
    )
  );

-- Policy 3: Admin สามารถแก้ไข equipment ได้
CREATE POLICY "Admins can update equipment"
  ON equipment FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.auth_id = auth.uid()
      AND users.role IN ('ADMIN', 'MODERATOR')
    )
  );

-- Policy 4: Admin สามารถลบ equipment ได้
CREATE POLICY "Admins can delete equipment"
  ON equipment FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.auth_id = auth.uid()
      AND users.role IN ('ADMIN', 'MODERATOR')
    )
  );

-- ============================================
-- Step 6: Grant Permissions ให้ครบถ้วน
-- ============================================
GRANT USAGE ON SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO postgres, anon, authenticated, service_role;

-- ============================================
-- Step 7: ทดสอบว่า Admin สามารถเพิ่มข้อมูลได้หรือไม่
-- ============================================
-- ลอง INSERT ข้อมูลทดสอบ (ใช้ auth_id ของ admin user)

-- หา auth_id ของ admin
SELECT auth_id FROM users WHERE role = 'ADMIN' LIMIT 1;

-- ลอง INSERT (เปลี่ยน 'AUTH_ID_HERE' เป็น auth_id ที่ได้)
/*
INSERT INTO equipment (
  name,
  category,
  description,
  serial_number,
  location,
  status,
  total_quantity,
  available_quantity,
  created_by
)
SELECT
  'Test Equipment',
  'Test Category',
  'Test Description',
  'TEST-001',
  'Test Location',
  'AVAILABLE',
  1,
  1,
  users.id
FROM users
WHERE users.auth_id = 'AUTH_ID_HERE'
RETURNING *;
*/

-- ============================================
-- สรุป: ขั้นตอนที่ต้องทำ
-- ============================================
-- 1. Run Step 1 เพื่อดู users ทั้งหมด
-- 2. Run Step 2 เพื่อเปลี่ยน user ให้เป็น ADMIN (แก้ email ก่อน)
-- 3. Run Step 4-5 เพื่อสร้าง RLS policies ใหม่
-- 4. Run Step 6 เพื่อ grant permissions
-- 5. ลอง refresh หน้าเว็บและเพิ่มอุปกรณ์อีกครั้ง
