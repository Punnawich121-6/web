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
      alert('An error occurred while saving data');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg sm:text-xl">กำลังโหลด...</p>
        </div>
      </div>
    );
  }

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'ADMIN':
        return 'ADMIN';
      case 'MODERATOR':
        return 'MODERATOR';
      default:
        return 'USER';
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

      <div className="pt-20 sm:pt-24 pb-8 sm:pb-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 sm:mb-8"
          >
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-2">
              My Profile
            </h1>
            <p className="text-base sm:text-lg md:text-xl text-gray-600">
              Manage Profile
            </p>
          </motion.div>

          {/* Profile Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-lg sm:rounded-xl shadow-sm border border-gray-100 overflow-hidden mb-6"
          >
            {/* Profile Header */}
            <div className="bg-gradient-to-r from-red-600 to-red-700 px-4 sm:px-6 md:px-8 py-8 sm:py-10 md:py-12">
              <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6">
                <div className="w-20 h-20 sm:w-24 sm:h-24 bg-white rounded-full flex items-center justify-center shadow-lg flex-shrink-0">
                  <span className="text-red-600 font-bold text-3xl sm:text-4xl">
                    {user?.email?.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="text-white text-center sm:text-left">
                  <h2 className="text-xl sm:text-2xl md:text-3xl font-bold mb-2 break-words">
                    {formData.displayName || user?.email?.split("@")[0]}
                  </h2>
                  <p className="text-red-100 text-sm sm:text-base md:text-lg flex items-center justify-center sm:justify-start gap-2 break-all">
                    <Mail className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
                    <span className="break-all">{user?.email}</span>
                  </p>
                  {userProfile && (
                    <div className="mt-3">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs sm:text-sm font-medium ${getRoleColor(userProfile.role)}`}>
                        <Shield className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                        {getRoleBadge(userProfile.role)}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Profile Form */}
            <form onSubmit={handleSubmit} className="p-4 sm:p-6 md:p-8">
              {success && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-4 sm:mb-6 bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg text-sm sm:text-base"
                >
                  Data saved successfully!
                </motion.div>
              )}

              <div className="space-y-5 sm:space-y-6">
                {/* Display Name */}
                <div>
                  <label className="block text-sm sm:text-base font-medium text-gray-700 mb-2">
                    <div className="flex items-center gap-2">
                      <UserIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                      Display Name
                    </div>
                  </label>
                  <input
                    type="text"
                    value={formData.displayName}
                    onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
                    className="text-black w-full px-4 py-3 sm:py-3.5 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent transition-colors touch-manipulation"
                    placeholder="Enter the name you want to display"
                  />
                </div>

                {/* Email (Read-only) */}
                <div>
                  <label className="block text-sm sm:text-base font-medium text-gray-700 mb-2">
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4 sm:w-5 sm:h-5" />
                      Email
                    </div>
                  </label>
                  <input
                    type="email"
                    value={user?.email || ''}
                    disabled
                    className="w-full px-4 py-3 sm:py-3.5 text-sm sm:text-base border border-gray-300 rounded-lg bg-gray-50 text-gray-500 cursor-not-allowed"
                  />
                  <p className="mt-1.5 sm:mt-2 text-xs sm:text-sm text-gray-500">
                    Email cannot be changed
                  </p>
                </div>

                {/* Account Info */}
                {userProfile && (
                  <div className="pt-5 sm:pt-6 border-t border-gray-200">
                    <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">
                      Account Information
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                      <div className="bg-gray-50 rounded-lg p-4 sm:p-5">
                        <p className="text-xs sm:text-sm text-gray-600 mb-1 sm:mb-1.5">Role</p>
                        <p className="text-sm sm:text-base font-medium text-gray-900">
                          {getRoleBadge(userProfile.role)}
                        </p>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-4 sm:p-5">
                        <p className="text-xs sm:text-sm text-gray-600 mb-1 sm:mb-1.5">Member since</p>
                        <p className="text-sm sm:text-base font-medium text-gray-900">
                          {new Date(userProfile.created_at).toLocaleDateString('en-US', {
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
                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-5 sm:pt-6">
                  <button
                    type="submit"
                    disabled={saving}
                    className="w-full sm:flex-1 bg-red-600 hover:bg-red-700 active:bg-red-800 disabled:bg-red-400 text-white font-medium py-3.5 sm:py-3 text-sm sm:text-base rounded-lg transition-colors duration-200 flex items-center justify-center gap-2 touch-manipulation"
                  >
                    <Save className="w-4 h-4 sm:w-5 sm:h-5" />
                    {saving ? 'Saving...' : 'Save Data'}
                  </button>
                  <button
                    type="button"
                    onClick={() => router.push('/dashboard')}
                    className="w-full sm:w-auto px-6 bg-gray-100 hover:bg-gray-200 active:bg-gray-300 text-gray-700 font-medium py-3.5 sm:py-3 text-sm sm:text-base rounded-lg transition-colors duration-200 flex items-center justify-center gap-2 touch-manipulation"
                  >
                    Back
                    <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
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
