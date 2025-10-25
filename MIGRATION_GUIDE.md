# คู่มือแก้ไขไฟล์ที่ยังใช้ Firebase อยู่

## ⚠️ ไฟล์ที่ต้องแก้ไข

พบไฟล์ทั้งหมด **17 ไฟล์** ที่ยังใช้ Firebase อยู่ ต้องแก้ไขเป็น Supabase:

### ไฟล์ที่แก้ไขแล้ว ✅
1. `components/LibraryNavbar.tsx` ✅
2. `pages/auth.tsx` ✅
3. `components/ProtectedRoute.tsx` ✅
4. `pages/api/user.ts` ✅
5. `pages/api/get-user.ts` ✅
6. `pages/api/admin/update-role.ts` ✅

### ไฟล์ที่ต้องแก้ไข ⏳

#### Components
- `components/UserRoleBadge.tsx`

#### Pages
- `pages/dashboard.tsx`
- `pages/Borrowing_History.tsx`
- `pages/Book_Detail.tsx`
- `pages/Admin_Borrow_Requests.tsx`
- `pages/admin/equipment.tsx`
- `pages/profile.tsx`
- `pages/auth/login.tsx`
- `pages/admin/borrow-requests.tsx`
- `pages/equipment/details.tsx`
- `pages/user/borrowing-history.tsx`
- `pages/user/profile.tsx`

#### API Routes
- `pages/api/borrow/manage.ts`
- `pages/api/borrow/index.ts`
- `pages/api/borrow/[id]/approve.ts`
- `pages/api/equipment/[id].ts`
- `pages/api/equipment/index.ts`

---

## 📝 วิธีแก้ไขแบบ Step-by-Step

### สำหรับ Pages และ Components

**เปลี่ยนจาก:**
```typescript
import { onAuthStateChanged, signOut, User, getAuth } from "firebase/auth";
import app from "../pages/firebase";

const auth = getAuth(app);

// ใช้ onAuthStateChanged
useEffect(() => {
  const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
    setUser(currentUser);
    // ...
  });
  return () => unsubscribe();
}, []);

// Get ID Token
const token = await currentUser.getIdToken();

// Sign out
await signOut(auth);
```

**เป็น:**
```typescript
import { supabase } from "../lib/supabase";
import type { User } from "@supabase/supabase-js";

// ใช้ onAuthStateChange
useEffect(() => {
  const checkSession = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    setUser(session?.user || null);
  };

  checkSession();

  const { data: { subscription } } = supabase.auth.onAuthStateChange(
    async (_event, session) => {
      setUser(session?.user || null);
    }
  );

  return () => subscription.unsubscribe();
}, []);

// Get Access Token
const { data: { session } } = await supabase.auth.getSession();
const token = session?.access_token;

// Sign out
await supabase.auth.signOut();
```

**สิ่งที่เปลี่ยน:**
1. `user.displayName` → `user.user_metadata?.display_name`
2. `user.getIdToken()` → `session.access_token`
3. `getAuth()` → `supabase.auth`
4. `onAuthStateChanged()` → `onAuthStateChange()`

---

### สำหรับ API Routes

**เปลี่ยนจาก:**
```typescript
import { PrismaClient } from '../../generated/prisma';
import { getAuth } from 'firebase-admin/auth';
import admin from 'firebase-admin';

if (!admin.apps.length) {
  admin.initializeApp({
    projectId: process.env.FIREBASE_PROJECT_ID,
  });
}

const prisma = new PrismaClient();

// Verify token
const decodedToken = await getAuth().verifyIdToken(token);
const { uid } = decodedToken;

// Query database
const user = await prisma.user.findUnique({
  where: { firebaseUid: uid }
});
```

**เป็น:**
```typescript
import { supabaseAdmin } from '../../lib/supabase-server';

// Verify token and get user
const { data: { user: authUser }, error } = await supabaseAdmin.auth.getUser(token);

if (error || !authUser) {
  return res.status(401).json({ error: 'Invalid token' });
}

// Query database
const { data: user, error: queryError } = await supabaseAdmin
  .from('users')
  .select('*')
  .eq('auth_id', authUser.id)
  .single();
```

**การ Query Database:**

```typescript
// INSERT
const { data, error } = await supabaseAdmin
  .from('users')
  .insert({
    auth_id: authUser.id,
    email: authUser.email,
    display_name: 'John Doe',
    role: 'USER',
  })
  .select()
  .single();

// SELECT
const { data, error } = await supabaseAdmin
  .from('users')
  .select('*')
  .eq('id', userId)
  .single();

// UPDATE
const { data, error } = await supabaseAdmin
  .from('users')
  .update({ role: 'ADMIN' })
  .eq('id', userId)
  .select()
  .single();

// DELETE
const { data, error } = await supabaseAdmin
  .from('users')
  .delete()
  .eq('id', userId);

// SELECT with JOIN
const { data, error } = await supabaseAdmin
  .from('borrow_requests')
  .select(`
    *,
    user:users(*),
    equipment:equipment(*)
  `)
  .eq('status', 'PENDING');

// WHERE conditions
const { data, error } = await supabaseAdmin
  .from('equipment')
  .select('*')
  .eq('status', 'AVAILABLE')
  .gte('available_quantity', 1)
  .order('created_at', { ascending: false });
```

---

## 🔍 ตัวอย่างการแก้ไขไฟล์เฉพาะ

### ตัวอย่าง: `components/UserRoleBadge.tsx`

**ก่อนแก้ไข:**
```typescript
import { getAuth, onAuthStateChanged } from "firebase/auth";
import app from "../pages/firebase";

const auth = getAuth(app);

useEffect(() => {
  const unsubscribe = onAuthStateChanged(auth, async (user) => {
    if (user) {
      const token = await user.getIdToken();
      // fetch user data...
    }
  });
  return () => unsubscribe();
}, []);
```

**หลังแก้ไข:**
```typescript
import { supabase } from "../lib/supabase";

useEffect(() => {
  const checkSession = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
      const token = session.access_token;
      // fetch user data...
    }
  };

  checkSession();

  const { data: { subscription } } = supabase.auth.onAuthStateChange(
    async (_event, session) => {
      if (session) {
        const token = session.access_token;
        // fetch user data...
      }
    }
  );

  return () => subscription.unsubscribe();
}, []);
```

---

## 🚀 Quick Fix Script

คัดลอกและรันคำสั่งนี้เพื่อดูไฟล์ที่ต้องแก้ไข:

```bash
# ค้นหาไฟล์ทั้งหมดที่ใช้ Firebase
grep -r "from.*firebase" --include="*.ts" --include="*.tsx" pages/ components/ | grep -v node_modules

# ดูเฉพาะชื่อไฟล์
grep -l "from.*firebase" --include="*.ts" --include="*.tsx" pages/**/* components/**/*
```

---

## ✅ Checklist การแก้ไข

เมื่อแก้ไขไฟล์แต่ละไฟล์ ตรวจสอบว่า:

- [ ] ลบ `import` จาก Firebase ทั้งหมด
- [ ] เพิ่ม `import { supabase } from "../lib/supabase"`
- [ ] เปลี่ยน `getAuth()` เป็น `supabase.auth`
- [ ] เปลี่ยน `onAuthStateChanged` เป็น `onAuthStateChange`
- [ ] เปลี่ยน `user.getIdToken()` เป็น `session.access_token`
- [ ] เปลี่ยน `user.displayName` เป็น `user.user_metadata?.display_name`
- [ ] เปลี่ยน Prisma queries เป็น Supabase queries
- [ ] เปลี่ยน `firebaseUid` เป็น `auth_id`
- [ ] ทดสอบว่าไฟล์ทำงานได้ถูกต้อง

---

## 📞 หากมีปัญหา

1. **Build Error:** ตรวจสอบว่าไม่มี import จาก Firebase เหลืออยู่
2. **Auth Error:** ตรวจสอบว่าใช้ `session.access_token` แทน `getIdToken()`
3. **Database Error:** ตรวจสอบว่าใช้ชื่อ column ที่ถูกต้อง (`auth_id` แทน `firebaseUid`)

---

## 🎯 หลังจากแก้ไขเสร็จ

รันคำสั่งนี้เพื่อทดสอบ:

```bash
npm run dev
```

ตรวจสอบว่า:
1. ✅ Build สำเร็จ (ไม่มี error)
2. ✅ Login/Register ทำงานได้
3. ✅ Protected Routes ทำงานได้
4. ✅ API Routes ทำงานได้

---

**หมายเหตุ:** ถ้าคุณต้องการความช่วยเหลือในการแก้ไขไฟล์ใดไฟล์หนึ่ง บอกผมได้เลยครับ!
