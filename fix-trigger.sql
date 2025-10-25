-- ============================================
-- Fix: Database error saving new user
-- ปัญหา: Trigger ไม่ทำงานหรือ Permission ไม่ถูกต้อง
-- ============================================

-- Step 1: ลบ Trigger และ Function เดิม (ถ้ามี)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- Step 2: สร้าง Function ใหม่ (พร้อม Error Handling)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  -- Insert new user into public.users table
  INSERT INTO public.users (
    auth_id,
    email,
    display_name,
    role
  )
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'display_name', NEW.email),
    'USER'
  )
  ON CONFLICT (auth_id) DO NOTHING;

  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log error but don't fail the auth
    RAISE WARNING 'Error creating user profile: %', SQLERRM;
    RETURN NEW;
END;
$$;

-- Step 3: สร้าง Trigger ใหม่
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Step 4: Grant permissions
GRANT USAGE ON SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO postgres, anon, authenticated, service_role;

-- ============================================
-- ทดสอบว่า Trigger ทำงานหรือไม่
-- ============================================
-- หลังจาก run SQL นี้แล้ว ลอง Register อีกครั้ง
-- ถ้ายังไม่ได้ ดูที่ด้านล่าง

-- ============================================
-- Alternative: ปิด Trigger และสร้าง User manually
-- ============================================
-- ถ้า Trigger ยังไม่ทำงาน ใช้วิธีนี้แทน:
-- 1. ปิด Email Confirmation ใน Supabase Settings
-- 2. Register ผ่าน Supabase Dashboard → Authentication → Users
-- 3. เพิ่ม User record ใน users table manually
