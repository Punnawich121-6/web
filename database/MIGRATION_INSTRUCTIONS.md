# Database Migration Instructions

## Adding Return Request Features

⚠️ **IMPORTANT**: Migration ต้องรัน 2 ส่วนแยกกัน เนื่องจาก PostgreSQL ต้อง commit enum value ก่อนใช้งาน

### วิธีรัน Migration (ต้องทำครั้งเดียว)

### วิธีที่ 1: ผ่าน Supabase Dashboard (แนะนำ - ง่ายที่สุด)

**ขั้นตอนที่ 1: เพิ่ม Enum Value**
1. เข้า Supabase Dashboard: https://app.supabase.com
2. เลือก Project ของคุณ
3. ไปที่ **SQL Editor** (เมนูด้านซ้าย)
4. กด **New Query**
5. Copy โค้ดจากไฟล์ `migrations/add_return_features.sql` ทั้งหมด
6. Paste ลงใน SQL Editor
7. กด **Run** (หรือ Ctrl/Cmd + Enter)
8. ✅ รอให้สำเร็จ (ถ้าแสดง "Success. No rows returned" แสดงว่าสำเร็จ)

**ขั้นตอนที่ 2: เพิ่ม Columns และ Indexes**
1. กด **New Query** อีกครั้ง
2. Copy โค้ดจากไฟล์ `migrations/add_return_features_part2.sql` ทั้งหมด
3. Paste ลงใน SQL Editor
4. กด **Run**
5. ✅ เสร็จสิ้น!

### วิธีที่ 2: ผ่าน Command Line (ต้องมี psql)

```bash
# Part 1: Add enum value
psql $DATABASE_URL -f database/migrations/add_return_features.sql

# Part 2: Add columns and indexes (รันหลังจาก part 1 เสร็จ)
psql $DATABASE_URL -f database/migrations/add_return_features_part2.sql
```

### ตรวจสอบว่า Migration สำเร็จ

รัน SQL นี้เพื่อตรวจสอบ:

```sql
-- ตรวจสอบว่ามี columns ใหม่
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'borrow_requests'
  AND column_name IN ('return_requested_at', 'return_confirmed_by', 'return_confirmed_at');

-- ตรวจสอบ enum values
SELECT unnest(enum_range(NULL::borrow_status))::text AS status_values;
```

### สิ่งที่ Migration นี้เพิ่มเข้าไป:

1. **Enum Value ใหม่:**
   - `PENDING_RETURN` - สถานะรอตรวจสอบการคืน

2. **Columns ใหม่ในตาราง `borrow_requests`:**
   - `return_requested_at` - เวลาที่ user ขอคืนของ
   - `return_confirmed_by` - admin ที่ยืนยันการคืน (FK to users.id)
   - `return_confirmed_at` - เวลาที่ admin ยืนยันการคืน

3. **Indexes สำหรับ Performance:**
   - Index บน `return_requested_at`
   - Index บน `status` สำหรับ PENDING_RETURN

### หมายเหตุ:

- Migration นี้ใช้ `IF NOT EXISTS` ดังนั้นสามารถรันซ้ำได้โดยไม่เกิด error
- ถ้า enum value `PENDING_RETURN` มีอยู่แล้ว PostgreSQL จะข้าม statement นั้น
- Columns ที่เพิ่มเข้าไปเป็น nullable (ไม่บังคับ) เพื่อไม่กระทบข้อมูลเก่า
