-- ============================================
-- Fix: Email address 'admin@gmail.com' is invalid
-- ============================================

-- Step 1: ตรวจสอบว่ามี Email นี้อยู่ใน auth.users หรือไม่
SELECT id, email, email_confirmed_at, created_at, deleted_at
FROM auth.users
WHERE email = 'admin@gmail.com';

-- ============================================
-- ถ้าพบ User ที่มี email นี้ ให้ลบออก
-- ============================================
-- IMPORTANT: เปลี่ยน 'USER_ID_HERE' เป็น ID ที่เจอจาก Query ด้านบน
-- DELETE FROM auth.users WHERE id = 'USER_ID_HERE';

-- หรือลบทั้งหมดที่มี email นี้ (ถ้ามี)
DELETE FROM auth.users WHERE email = 'admin@gmail.com';

-- ============================================
-- ตรวจสอบว่าลบสำเร็จหรือไม่
-- ============================================
SELECT id, email FROM auth.users WHERE email = 'admin@gmail.com';
-- ควรได้ผลลัพธ์ว่าง (0 rows)

-- ============================================
-- หลังจากลบแล้ว ลอง Register อีกครั้ง
-- ============================================
