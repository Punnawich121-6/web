"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/router";
import { supabase } from "../lib/supabase";
import type { User } from "@supabase/supabase-js";
import LibraryNavbar from "../components/LibraryNavbar";
import {
  User as UserIcon,
  Mail,
  Save,
  ArrowRight,
  Shield,
} from "lucide-react";

interface UserProfile {
  id: string;
  email: string;
  display_name: string | null;
  role: 'USER' | 'ADMIN' | 'MODERATOR';
  created_at: string;
}

const Profile = () => {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [formData, setFormData] = useState({
    displayName: "",
  });
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        router.push("/auth");
        return;
      }

      setUser(session.user);
      await loadUserProfile(session.user.id);
      setLoading(false);
    };

    checkSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        if (!session) {
          router.push("/auth");
          return;
        }

        setUser(session.user);
        await loadUserProfile(session.user.id);
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, [router]);

  const loadUserProfile = async (authId: string) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const response = await fetch('/api/user', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ token: session.access_token }),
      });

      if (response.ok) {
        const result = await response.json();
        setUserProfile(result.data);
        setFormData({
          displayName: result.data.display_name || '',
        });
      }
    } catch (error) {
      console.error('Error loading profile:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSuccess(false);

    try {
      // Update Supabase auth metadata
      const { error: authError } = await supabase.auth.updateUser({
        data: {
          display_name: formData.displayName,
        }
      });

      if (authError) throw authError;

      // Reload profile
      if (user) {
        await loadUserProfile(user.id);
      }

      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (error) {
      console.error('Error saving profile:', error);
      alert('เกิดข้อผิดพลาดในการบันทึกข้อมูล');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-xl">กำลังโหลด...</p>
        </div>
      </div>
    );
  }

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'ADMIN':
        return 'ผู้ดูแลระบบ';
      case 'MODERATOR':
        return 'ผู้ช่วยดูแลระบบ';
      default:
        return 'ผู้ใช้งานทั่วไป';
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'ADMIN':
        return 'bg-red-100 text-red-800';
      case 'MODERATOR':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-green-100 text-green-800';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <LibraryNavbar />

      <div className="pt-24 pb-12">
        <div className="max-w-4xl mx-auto px-6">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              โปรไฟล์ของฉัน
            </h1>
            <p className="text-xl text-gray-600">
              จัดการข้อมูลส่วนตัวของคุณ
            </p>
          </motion.div>

          {/* Profile Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mb-6"
          >
            {/* Profile Header */}
            <div className="bg-gradient-to-r from-red-600 to-red-700 px-8 py-12">
              <div className="flex items-center gap-6">
                <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center shadow-lg">
                  <span className="text-red-600 font-bold text-4xl">
                    {user?.email?.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="text-white">
                  <h2 className="text-3xl font-bold mb-2">
                    {formData.displayName || user?.email?.split("@")[0]}
                  </h2>
                  <p className="text-red-100 text-lg flex items-center gap-2">
                    <Mail className="w-5 h-5" />
                    {user?.email}
                  </p>
                  {userProfile && (
                    <div className="mt-3">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getRoleColor(userProfile.role)}`}>
                        <Shield className="w-4 h-4 mr-1" />
                        {getRoleBadge(userProfile.role)}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Profile Form */}
            <form onSubmit={handleSubmit} className="p-8">
              {success && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-6 bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg"
                >
                  บันทึกข้อมูลสำเร็จ!
                </motion.div>
              )}

              <div className="space-y-6">
                {/* Display Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <div className="flex items-center gap-2">
                      <UserIcon className="w-4 h-4" />
                      ชื่อที่แสดง
                    </div>
                  </label>
                  <input
                    type="text"
                    value={formData.displayName}
                    onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
                    className="text-black w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent transition-colors"
                    placeholder="กรอกชื่อที่ต้องการแสดง"
                  />
                </div>

                {/* Email (Read-only) */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4" />
                      อีเมล
                    </div>
                  </label>
                  <input
                    type="email"
                    value={user?.email || ''}
                    disabled
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-500 cursor-not-allowed"
                  />
                  <p className="mt-1 text-sm text-gray-500">
                    อีเมลไม่สามารถเปลี่ยนแปลงได้
                  </p>
                </div>

                {/* Account Info */}
                {userProfile && (
                  <div className="pt-6 border-t border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                      ข้อมูลบัญชี
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="bg-gray-50 rounded-lg p-4">
                        <p className="text-sm text-gray-600 mb-1">บทบาท</p>
                        <p className="text-base font-medium text-gray-900">
                          {getRoleBadge(userProfile.role)}
                        </p>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-4">
                        <p className="text-sm text-gray-600 mb-1">สมัครสมาชิกเมื่อ</p>
                        <p className="text-base font-medium text-gray-900">
                          {new Date(userProfile.created_at).toLocaleDateString('th-TH', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Submit Button */}
                <div className="flex gap-4 pt-6">
                  <button
                    type="submit"
                    disabled={saving}
                    className="flex-1 bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white font-medium py-3 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2"
                  >
                    <Save className="w-5 h-5" />
                    {saving ? 'กำลังบันทึก...' : 'บันทึกข้อมูล'}
                  </button>
                  <button
                    type="button"
                    onClick={() => router.push('/dashboard')}
                    className="px-6 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-3 rounded-lg transition-colors duration-200 flex items-center gap-2"
                  >
                    กลับ
                    <ArrowRight className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </form>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
