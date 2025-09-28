"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/router";
import { onAuthStateChanged, User, getAuth } from "firebase/auth";
import { doc, setDoc, getDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../../lib/firebase";
import app from "../../lib/firebase";
import LibraryNavbar from "../../components/LibraryNavbar";
import {
  User as UserIcon,
  Mail,
  Phone,
  BookOpen,
  Building,
  Calendar,
  GraduationCap,
  Save,
  ArrowRight,
} from "lucide-react";

interface UserProfile {
  studentId: string;
  faculty: string;
  major: string;
  phoneNumber: string;
  displayName: string;
  email: string;
  createdAt: any;
  profileCompleted: boolean;
}

const Profile = () => {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isNewUser, setIsNewUser] = useState(false);
  const [formData, setFormData] = useState({
    studentId: "",
    faculty: "",
    major: "",
    phoneNumber: "",
  });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const auth = getAuth(app);

  const faculties = [
    "คณะวิศวกรรมศาสตร์",
    "คณะวิทยาศาสตร์",
    "คณะเทคโนโลยีสารสนเทศ",
    "คณะบริหารธุรกิจ",
    "คณะศิลปศาสตร์",
    "คณะสถาปัตยกรรมศาสตร์",
    "คณะแพทยศาสตร์",
    "คณะพยาบาลศาสตร์",
  ];

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        await checkUserProfile(currentUser);
      } else {
        router.push("/auth");
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [auth, router]);

  const checkUserProfile = async (currentUser: User) => {
    try {
      const userDocRef = doc(db, "users", currentUser.uid);
      const userDoc = await getDoc(userDocRef);

      if (userDoc.exists()) {
        const profileData = userDoc.data() as UserProfile;
        setUserProfile(profileData);
        setIsNewUser(!profileData.profileCompleted);

        if (profileData.profileCompleted) {
          setFormData({
            studentId: profileData.studentId || "",
            faculty: profileData.faculty || "",
            major: profileData.major || "",
            phoneNumber: profileData.phoneNumber || "",
          });
        }
      } else {
        setIsNewUser(true);
      }
    } catch (error) {
      console.error("Error checking user profile:", error);
    }
  };

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.studentId.trim()) {
      newErrors.studentId = "กรุณากรอกรหัสนักศึกษา";
    } else if (!/^\d{8,10}$/.test(formData.studentId)) {
      newErrors.studentId = "รหัสนักศึกษาต้องเป็นตัวเลข 8-10 หลัก";
    }

    if (!formData.faculty) {
      newErrors.faculty = "กรุณาเลือกคณะ";
    }

    if (!formData.major.trim()) {
      newErrors.major = "กรุณากรอกสาขา";
    }

    if (!formData.phoneNumber.trim()) {
      newErrors.phoneNumber = "กรุณากรอกเบอร์โทรศัพท์";
    } else if (!/^0\d{9}$/.test(formData.phoneNumber)) {
      newErrors.phoneNumber = "เบอร์โทรศัพท์ต้องขึ้นต้นด้วย 0 และมี 10 หลัก";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm() || !user) return;

    setSaving(true);
    try {
      const userDocRef = doc(db, "users", user.uid);
      const profileData: UserProfile = {
        studentId: formData.studentId,
        faculty: formData.faculty,
        major: formData.major,
        phoneNumber: formData.phoneNumber,
        displayName: user.displayName || "",
        email: user.email || "",
        createdAt: serverTimestamp(),
        profileCompleted: true,
      };

      await setDoc(userDocRef, profileData, { merge: true });
      setUserProfile(profileData);
      setIsNewUser(false);

      // Redirect to dashboard if this is first time setup
      if (isNewUser) {
        router.push("/dashboard");
      }
    } catch (error) {
      console.error("Error saving profile:", error);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">กำลังโหลด...</p>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <LibraryNavbar />

      <div className="pt-24 pb-12">
        <div className="max-w-4xl mx-auto px-6">
          {isNewUser ? (
            // Profile Setup Form for New Users
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-2xl shadow-lg overflow-hidden"
            >
              <div className="bg-gradient-to-r from-red-600 to-red-700 p-8 text-white text-center">
                <GraduationCap className="w-16 h-16 mx-auto mb-4" />
                <h1 className="text-3xl font-bold mb-2">ยินดีต้อนรับ!</h1>
                <p className="text-red-100">
                  กรุณากรอกข้อมูลเพิ่มเติมเพื่อใช้งานระบบ
                </p>
              </div>

              <form onSubmit={handleSubmit} className="p-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Student ID */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      รหัสนักศึกษา *
                    </label>
                    <div className="relative">
                      <UserIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="text"
                        name="studentId"
                        value={formData.studentId}
                        onChange={handleInputChange}
                        placeholder="เช่น 12345678"
                        className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent ${
                          errors.studentId ? "border-red-500" : "border-gray-300"
                        }`}
                      />
                    </div>
                    {errors.studentId && (
                      <p className="mt-1 text-sm text-red-600">{errors.studentId}</p>
                    )}
                  </div>

                  {/* Faculty */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      คณะ *
                    </label>
                    <div className="relative">
                      <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <select
                        name="faculty"
                        value={formData.faculty}
                        onChange={handleInputChange}
                        className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent appearance-none ${
                          errors.faculty ? "border-red-500" : "border-gray-300"
                        }`}
                      >
                        <option value="">เลือกคณะ</option>
                        {faculties.map((faculty) => (
                          <option key={faculty} value={faculty}>
                            {faculty}
                          </option>
                        ))}
                      </select>
                    </div>
                    {errors.faculty && (
                      <p className="mt-1 text-sm text-red-600">{errors.faculty}</p>
                    )}
                  </div>

                  {/* Major */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      สาขา *
                    </label>
                    <div className="relative">
                      <BookOpen className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="text"
                        name="major"
                        value={formData.major}
                        onChange={handleInputChange}
                        placeholder="เช่น วิศวกรรมคอมพิวเตอร์"
                        className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent ${
                          errors.major ? "border-red-500" : "border-gray-300"
                        }`}
                      />
                    </div>
                    {errors.major && (
                      <p className="mt-1 text-sm text-red-600">{errors.major}</p>
                    )}
                  </div>

                  {/* Phone Number */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      เบอร์โทรศัพท์ *
                    </label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="tel"
                        name="phoneNumber"
                        value={formData.phoneNumber}
                        onChange={handleInputChange}
                        placeholder="เช่น 0812345678"
                        className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent ${
                          errors.phoneNumber ? "border-red-500" : "border-gray-300"
                        }`}
                      />
                    </div>
                    {errors.phoneNumber && (
                      <p className="mt-1 text-sm text-red-600">{errors.phoneNumber}</p>
                    )}
                  </div>
                </div>

                <div className="mt-8 flex justify-end">
                  <button
                    type="submit"
                    disabled={saving}
                    className="flex items-center gap-2 px-8 py-3 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 transition-colors duration-200 disabled:opacity-50"
                  >
                    {saving ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                        บันทึก...
                      </>
                    ) : (
                      <>
                        <Save className="w-5 h-5" />
                        เสร็จสิ้น
                        <ArrowRight className="w-5 h-5" />
                      </>
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          ) : (
            // Profile Display for Existing Users
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              {/* Header */}
              <div className="text-center">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">ข้อมูลส่วนตัว</h1>
                <p className="text-gray-600">จัดการและดูข้อมูลส่วนตัวของคุณ</p>
              </div>

              {/* Profile Cards */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Personal Information */}
                <div className="bg-white rounded-2xl shadow-lg p-8">
                  <h2 className="text-xl font-bold text-gray-900 mb-6">ข้อมูลส่วนตัว</h2>
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <UserIcon className="w-5 h-5 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-500">ชื่อ</p>
                        <p className="font-medium">{user?.displayName || "ไม่ระบุ"}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <GraduationCap className="w-5 h-5 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-500">รหัสนักศึกษา</p>
                        <p className="font-medium">{userProfile?.studentId || "ไม่ระบุ"}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <Mail className="w-5 h-5 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-500">อีเมล</p>
                        <p className="font-medium">{user?.email}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <Phone className="w-5 h-5 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-500">เบอร์โทรศัพท์</p>
                        <p className="font-medium">{userProfile?.phoneNumber || "ไม่ระบุ"}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Academic Information */}
                <div className="bg-white rounded-2xl shadow-lg p-8">
                  <h2 className="text-xl font-bold text-gray-900 mb-6">ข้อมูลการศึกษา</h2>
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <Building className="w-5 h-5 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-500">คณะ</p>
                        <p className="font-medium">{userProfile?.faculty || "ไม่ระบุ"}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <BookOpen className="w-5 h-5 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-500">สาขา</p>
                        <p className="font-medium">{userProfile?.major || "ไม่ระบุ"}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <Calendar className="w-5 h-5 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-500">วันที่เข้าร่วม</p>
                        <p className="font-medium">
                          {userProfile?.createdAt
                            ? new Date(userProfile.createdAt.toDate()).toLocaleDateString('th-TH')
                            : "ไม่ระบุ"}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Edit Button */}
              <div className="text-center">
                <button
                  onClick={() => setIsNewUser(true)}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 transition-colors duration-200"
                >
                  แก้ไขข้อมูล
                </button>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </main>
  );
};

export default Profile;