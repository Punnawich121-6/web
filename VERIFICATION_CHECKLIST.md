# ✅ Verification Checklist - Supabase Migration

## 🔍 ตรวจสอบก่อนใช้งาน

### 1. Database Setup
- [ ] เข้า Supabase Dashboard: https://supabase.com/dashboard
- [ ] เปิด SQL Editor
- [ ] Run SQL จาก `SUPABASE_SETUP.md` ทีละส่วน:
  - [ ] CREATE TABLE users
  - [ ] CREATE TABLE equipment
  - [ ] CREATE TABLE borrow_requests
  - [ ] CREATE INDEXES
  - [ ] CREATE RLS POLICIES
  - [ ] CREATE TRIGGERS

### 2. Environment Variables
- [x] NEXT_PUBLIC_SUPABASE_URL - มีแล้ว ✓
- [x] NEXT_PUBLIC_SUPABASE_ANON_KEY - มีแล้ว ✓
- [x] SUPABASE_SERVICE_ROLE_KEY - มีแล้ว ✓
- [x] ADMIN_EMAILS - มีแล้ว ✓

### 3. Build & Run
- [x] `npm run build` - สำเร็จ ✓
- [ ] `npm run dev` - ทดสอบ Local
- [ ] ไปที่ http://localhost:3000

### 4. ทดสอบ Authentication
- [ ] ไปที่ `/auth`
- [ ] สมัครสมาชิกใหม่ (Register)
- [ ] ตรวจสอบว่าสร้าง User ใน Supabase Auth
- [ ] ตรวจสอบว่าสร้าง User ใน `users` table
- [ ] Login ด้วย Account ที่สร้าง
- [ ] Logout และ Login อีกครั้ง

### 5. ทดสอบ User Functions
- [ ] Dashboard: แสดงสถิติการยืม
- [ ] Profile: แก้ไขข้อมูลส่วนตัว
- [ ] Equipment Catalog: ดูรายการอุปกรณ์
- [ ] Borrowing History: ดูประวัติการยืม

### 6. ทดสอบ Admin Functions (Login ด้วย admin@gmail.com)
- [ ] Admin Equipment Management: เพิ่ม/แก้ไข/ลบอุปกรณ์
- [ ] Admin Borrow Requests: อนุมัติ/ปฏิเสธคำขอยืม
- [ ] User Role Management: เปลี่ยนบทบาทผู้ใช้

### 7. ตรวจสอบ Database ใน Supabase Dashboard
- [ ] ไปที่ Table Editor
- [ ] ตรวจสอบ `users` table - มี Users ที่สร้างหรือไม่
- [ ] ตรวจสอบ `equipment` table - มี Equipment หรือไม่
- [ ] ตรวจสอบ `borrow_requests` table - มี Requests หรือไม่

### 8. ทดสอบ API Routes
ใช้ Browser DevTools (F12) → Network Tab:
- [ ] POST `/api/user` - สร้าง/ดึงข้อมูล User
- [ ] GET `/api/borrow` - ดึงรายการคำขอยืม
- [ ] POST `/api/borrow` - สร้างคำขอยืมใหม่
- [ ] GET `/api/equipment` - ดึงรายการอุปกรณ์
- [ ] POST `/api/equipment` - เพิ่มอุปกรณ์ใหม่ (Admin only)

---

## 🐛 Troubleshooting

### ถ้า Build Error:
```bash
# ลบ .next folder และ build ใหม่
rm -rf .next
npm run build
```

### ถ้า Auth Error:
1. ตรวจสอบ Supabase URL และ Keys ใน `.env`
2. ตรวจสอบว่า RLS Policies ถูก enable
3. ตรวจสอบ Browser Console สำหรับ Error Messages

### ถ้า Database Error:
1. ตรวจสอบว่า Tables ถูกสร้างใน Supabase
2. ตรวจสอบ Column Names (ต้องเป็น snake_case)
3. ตรวจสอบ Foreign Keys และ Constraints

### ถ้า API Error:
1. ตรวจสอบ Network Tab ใน Browser DevTools
2. ตรวจสอบ Server Logs (Terminal ที่รัน npm run dev)
3. ตรวจสอบว่า Token ถูกส่งไปใน Authorization Header

---

## 📊 การตรวจสอบ Migration สำเร็จ

✅ **สำเร็จแล้ว:**
- ✓ Build ผ่าน (npm run build)
- ✓ ไม่มี Firebase imports เหลืออยู่ (0 ไฟล์)
- ✓ มี Supabase imports (29 ไฟล์)
- ✓ Environment Variables ครบ
- ✓ มี Documentation ครบถ้วน

⏳ **รอดำเนินการ:**
- ⏳ Setup Database Schema ใน Supabase
- ⏳ ทดสอบระบบทั้งหมด
- ⏳ Verify Production Deployment

---

## 📝 หมายเหตุสำคัญ

1. **SUPABASE_SERVICE_ROLE_KEY**:
   - Key นี้มีสิทธิ์เต็ม bypass RLS policies
   - **อย่า** commit ลง Git
   - **อย่า** เปิดเผยต่อสาธารณะ

2. **ADMIN_EMAILS**:
   - Email ที่ระบุจะได้รับ Role ADMIN อัตโนมัติเมื่อสมัครสมาชิก
   - เปลี่ยนเป็น Email จริงของคุณ

3. **RLS Policies**:
   - ต้อง enable RLS ทุก Table
   - Policies ควบคุมการเข้าถึงข้อมูล
   - ตรวจสอบใน Supabase Dashboard → Authentication → Policies

4. **Database Triggers**:
   - Auto-create user profile เมื่อมี user ใหม่ใน Supabase Auth
   - Update timestamps อัตโนมัติ

---

## 🚀 Next Steps

หลังจากผ่านทุก Checklist แล้ว:

1. **Production Deployment:**
   - Deploy to Vercel/Netlify/your hosting
   - Set Environment Variables ใน Production
   - Test Production URL

2. **Data Migration (ถ้ามีข้อมูลเก่า):**
   - Export data จาก Firebase/PostgreSQL เก่า
   - Transform เป็น format ใหม่
   - Import เข้า Supabase

3. **Monitoring:**
   - ตั้งค่า Error Tracking (Sentry, etc.)
   - Monitor Database Usage ใน Supabase Dashboard
   - Set up Alerts สำหรับ Errors

---

ถ้ามีปัญหาหรือข้อสงสัย ดูได้ที่:
- `SUPABASE_SETUP.md` - Setup Database
- `MIGRATION_GUIDE.md` - Migration Patterns
- Supabase Docs: https://supabase.com/docs
