# คู่มือการตั้งค่า Supabase Database

## ขั้นตอนที่ 1: สร้าง Database Schema ใน Supabase

1. เข้าไปที่ [Supabase Dashboard](https://supabase.com/dashboard)
2. เลือก Project ของคุณ
3. ไปที่ **SQL Editor** (เมนูด้านซ้าย)
4. คัดลอกและรัน SQL นี้:

```sql
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create custom types
CREATE TYPE user_role AS ENUM ('USER', 'ADMIN', 'MODERATOR');
CREATE TYPE equipment_status AS ENUM ('AVAILABLE', 'BORROWED', 'MAINTENANCE', 'RETIRED');
CREATE TYPE borrow_status AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'ACTIVE', 'RETURNED', 'OVERDUE');

-- Users table (เชื่อมกับ Supabase Auth)
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  auth_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  display_name TEXT,
  role user_role DEFAULT 'USER',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Equipment table
CREATE TABLE equipment (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  description TEXT NOT NULL,
  image TEXT,
  serial_number TEXT UNIQUE NOT NULL,
  location TEXT NOT NULL,
  status equipment_status DEFAULT 'AVAILABLE',
  total_quantity INTEGER DEFAULT 1,
  available_quantity INTEGER DEFAULT 1,
  specifications TEXT,
  condition TEXT,
  purchase_date TIMESTAMPTZ,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Borrow requests table
CREATE TABLE borrow_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) NOT NULL,
  equipment_id UUID REFERENCES equipment(id) NOT NULL,
  quantity INTEGER DEFAULT 1,
  purpose TEXT NOT NULL,
  start_date TIMESTAMPTZ NOT NULL,
  end_date TIMESTAMPTZ NOT NULL,
  actual_return_date TIMESTAMPTZ,
  status borrow_status DEFAULT 'PENDING',
  notes TEXT,
  approved_by UUID REFERENCES users(id),
  approved_at TIMESTAMPTZ,
  rejection_reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_auth_id ON users(auth_id);
CREATE INDEX idx_equipment_status ON equipment(status);
CREATE INDEX idx_borrow_requests_user_id ON borrow_requests(user_id);
CREATE INDEX idx_borrow_requests_status ON borrow_requests(status);

-- Auto-update updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_equipment_updated_at BEFORE UPDATE ON equipment
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_borrow_requests_updated_at BEFORE UPDATE ON borrow_requests
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

## ขั้นตอนที่ 2: ตั้งค่า Row Level Security (RLS)

รัน SQL นี้ใน SQL Editor:

```sql
-- Enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE equipment ENABLE ROW LEVEL SECURITY;
ALTER TABLE borrow_requests ENABLE ROW LEVEL SECURITY;

-- Users policies
CREATE POLICY "Users can view all users"
  ON users FOR SELECT
  USING (true);

CREATE POLICY "Users can update own profile"
  ON users FOR UPDATE
  USING (auth.uid() = auth_id);

CREATE POLICY "Admins can update any user"
  ON users FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE auth_id = auth.uid() AND role = 'ADMIN'
    )
  );

-- Equipment policies
CREATE POLICY "Anyone can view available equipment"
  ON equipment FOR SELECT
  USING (true);

CREATE POLICY "Admins can insert equipment"
  ON equipment FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE auth_id = auth.uid() AND role IN ('ADMIN', 'MODERATOR')
    )
  );

CREATE POLICY "Admins can update equipment"
  ON equipment FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE auth_id = auth.uid() AND role IN ('ADMIN', 'MODERATOR')
    )
  );

CREATE POLICY "Admins can delete equipment"
  ON equipment FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE auth_id = auth.uid() AND role = 'ADMIN'
    )
  );

-- Borrow requests policies
CREATE POLICY "Users can view own borrow requests"
  ON borrow_requests FOR SELECT
  USING (
    user_id IN (
      SELECT id FROM users WHERE auth_id = auth.uid()
    )
    OR
    EXISTS (
      SELECT 1 FROM users
      WHERE auth_id = auth.uid() AND role IN ('ADMIN', 'MODERATOR')
    )
  );

CREATE POLICY "Users can create borrow requests"
  ON borrow_requests FOR INSERT
  WITH CHECK (
    user_id IN (
      SELECT id FROM users WHERE auth_id = auth.uid()
    )
  );

CREATE POLICY "Admins can update borrow requests"
  ON borrow_requests FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE auth_id = auth.uid() AND role IN ('ADMIN', 'MODERATOR')
    )
  );
```

## ขั้นตอนที่ 3: สร้าง Trigger สำหรับ Auto-create User Profile

รัน SQL นี้เพื่อสร้าง user profile อัตโนมัติเมื่อมีการสมัครสมาชิก:

```sql
-- Function to automatically create user profile when signing up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  admin_emails TEXT[] := ARRAY['admin@gmail.com']; -- เปลี่ยนเป็น email admin ของคุณ
  user_role user_role := 'USER';
BEGIN
  -- Check if email is in admin list
  IF NEW.email = ANY(admin_emails) THEN
    user_role := 'ADMIN';
  END IF;

  INSERT INTO public.users (auth_id, email, display_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'display_name', NEW.email),
    user_role
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to call function on new user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```

## ขั้นตอนที่ 4: ตรวจสอบการตั้งค่า

1. ไปที่ **Table Editor** ใน Supabase Dashboard
2. ควรเห็น tables: `users`, `equipment`, `borrow_requests`
3. ตรวจสอบว่า RLS ถูกเปิดใช้งาน (มีไอคอนล็อคสีเขียว)

## ขั้นตอนที่ 5: เพิ่ม Service Role Key ใน .env

1. ไปที่ **Settings > API** ใน Supabase Dashboard
2. คัดลอก `service_role` key (อันที่มีสีแดงเตือน)
3. เพิ่มใน `.env`:

```env
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
```

## เสร็จสิ้น!

ตอนนี้ระบบ Supabase Database ของคุณพร้อมใช้งานแล้ว คุณสามารถ:

- ✅ Login/Register ผ่าน Supabase Auth
- ✅ สร้าง user profile อัตโนมัติ
- ✅ จัดการสิทธิ์ด้วย RLS
- ✅ กำหนด Admin role อัตโนมัติ
- ✅ เก็บข้อมูล Equipment และ Borrow Requests

## หากมีปัญหา

1. ตรวจสอบว่า SQL ทั้งหมดรันสำเร็จ (ไม่มี error)
2. ตรวจสอบว่า RLS policies ถูกสร้างแล้ว (ดูใน **Authentication > Policies**)
3. ตรวจสอบว่า Trigger ถูกสร้างแล้ว (ดูใน **Database > Triggers**)
4. ลองสมัครสมาชิกใหม่และดูว่า user profile ถูกสร้างใน `users` table หรือไม่
