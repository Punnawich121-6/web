"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "../lib/supabase";
import type { User } from "@supabase/supabase-js";
import UserRoleBadge from "./UserRoleBadge";
import { usePathname } from "next/navigation";

interface UserData {
  role: "USER" | "ADMIN" | "MODERATOR" | null;
  displayName?: string;
  email?: string;
}

const LibraryNavbar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);

  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    // Check current session
    const checkSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      setUser(session?.user || null);
      if (session?.user) {
        await fetchUserData(session.user);
      }
      setLoading(false);
    };

    checkSession();

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setUser(session?.user || null);
      if (session?.user) {
        await fetchUserData(session.user);
      } else {
        setUserData(null);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchUserData = async (currentUser: User) => {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) return;

      const response = await fetch("/api/user", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ token: session.access_token }),
      });

      if (response.ok) {
        const result = await response.json();
        setUserData(result.data);
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
    }
  };

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      setIsProfileMenuOpen(false);
      localStorage.removeItem("token");
      window.location.href = "/";
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  useEffect(() => {
    const handleClickOutside = () => {
      if (isProfileMenuOpen) {
        setIsProfileMenuOpen(false);
      }
    };

    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, [isProfileMenuOpen]);

  const navItems = [
    { href: "/schedule", label: "Schedule" },
    { href: "/activity", label: "Activity" },
    { href: "/equipment/catalog", label: "Catalog" },
    { href: "/contact", label: "Contact" },
  ];

  const userNavItems = [
    { href: "/dashboard", label: "Dashboard" },
    { href: "/history", label: "My History" },
  ];

  const adminNavItems = [
    { href: "/admin/equipment", label: "Admin Panel" },
    { href: "/Admin_Borrow_Requests", label: "Manage Requests" },
  ];

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled
          ? "bg-white/98 backdrop-blur-xl shadow-xl border-b border-gray-200/80"
          : "bg-white/95 backdrop-blur-lg shadow-lg border-b border-gray-100/50"
      }`}
    >
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo Section */}
          <motion.a
            href="/"
            className="flex items-center gap-3 group"
            whileHover={{ scale: 1.02 }}
            transition={{ duration: 0.2 }}
          >
            <div className="relative">
              <div className="absolute -inset-1 bg-gradient-to-r from-red-600 to-red-700 rounded-xl opacity-0 group-hover:opacity-20 blur transition-all duration-300"></div>
              <div className="relative w-10 h-10 bg-gradient-to-br from-red-600 via-red-600 to-red-700 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-2xl group-hover:from-red-700 group-hover:to-red-800 transition-all duration-300">
                <span className="text-white font-bold text-base tracking-wider">T2U</span>
              </div>
            </div>
            <div className="flex flex-col">
              <span className="text-2xl font-bold text-gray-900 uppercase tracking-wide group-hover:text-red-600 transition-colors duration-300">
                Time2Use
              </span>
              <span className="text-xs text-gray-500 uppercase tracking-wider font-medium">
                Equipment System
              </span>
            </div>
          </motion.a>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6">
            {/* Main Navigation */}
            {navItems.map((item) => (
              <motion.a
                key={item.href}
                href={item.href}
                className={`relative group px-3 py-2 font-semibold uppercase tracking-wide text-sm transition-all duration-300 rounded-lg ${
                  pathname.startsWith(item.href)
                    ? "text-red-600 bg-red-50/80"
                    : "text-gray-700 hover:text-red-600 hover:bg-red-50/50"
                }`}
                whileHover={{ y: -2 }}
                transition={{ duration: 0.2 }}
              >
                <span>{item.label}</span>
                <div
                  className={`absolute bottom-0 left-1/2 -translate-x-1/2 h-1 bg-gradient-to-r from-red-600 to-red-700 rounded-full transition-all duration-300 ${
                    pathname.startsWith(item.href)
                      ? "w-3/4"
                      : "w-0 group-hover:w-3/4"
                  }`}
                ></div>
              </motion.a>
            ))}

            {/* User Navigation (Dashboard/History) */}
            <AnimatePresence>
              {user &&
                userNavItems.map((item, index) => (
                  <motion.a
                    key={item.href}
                    href={item.href}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                    className={`relative group px-3 py-2 font-semibold uppercase tracking-wide text-sm transition-all duration-300 rounded-lg ${
                      pathname.startsWith(item.href)
                        ? "text-red-600 bg-red-50/80"
                        : "text-gray-700 hover:text-red-600 hover:bg-red-50/50"
                    }`}
                    whileHover={{ y: -2 }}
                  >
                    <span>{item.label}</span>
                    <div
                      className={`absolute bottom-0 left-1/2 -translate-x-1/2 h-1 bg-gradient-to-r from-red-600 to-red-700 rounded-full transition-all duration-300 ${
                        pathname.startsWith(item.href)
                          ? "w-3/4"
                          : "w-0 group-hover:w-3/4"
                      }`}
                    ></div>
                  </motion.a>
                ))}
            </AnimatePresence>

            {/* Admin-specific Navigation */}
            <AnimatePresence>
              {user &&
                userData?.role === "ADMIN" &&
                adminNavItems.map((item, index) => (
                  <motion.a
                    key={item.href}
                    href={item.href}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                    className={`relative group px-3 py-2 font-semibold uppercase tracking-wide text-sm transition-all duration-300 rounded-lg ${
                      pathname.startsWith(item.href)
                        ? "text-red-600 bg-red-50/80"
                        : "text-gray-700 hover:text-red-600 hover:bg-red-50/50"
                    }`}
                    whileHover={{ y: -2 }}
                  >
                    <span>{item.label}</span>
                    <div
                      className={`absolute bottom-0 left-1/2 -translate-x-1/2 h-1 bg-gradient-to-r from-red-600 to-red-700 rounded-full transition-all duration-300 ${
                        pathname.startsWith(item.href)
                          ? "w-3/4"
                          : "w-0 group-hover:w-3/4"
                      }`}
                    ></div>
                  </motion.a>
                ))}
            </AnimatePresence>

            {/* Authentication Section */}
            <div className="ml-4 pl-4 border-l border-gray-200/60">
              {loading ? (
                <div className="flex items-center gap-2 px-4 py-2 bg-gray-50 rounded-xl border border-gray-200">
                  <div className="w-4 h-4 bg-gradient-to-r from-gray-300 to-gray-400 rounded-full animate-pulse"></div>
                  <span className="text-gray-500 text-sm font-medium">Loading...</span>
                </div>
              ) : user ? (
                <div className="relative">
                  <motion.button
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsProfileMenuOpen(!isProfileMenuOpen);
                    }}
                    className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-red-50/50 transition-all duration-200 border border-transparent hover:border-red-100"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className="relative">
                      <div className="absolute -inset-0.5 bg-gradient-to-r from-red-600 to-red-700 rounded-xl opacity-0 group-hover:opacity-30 blur transition-all"></div>
                      <div className="relative w-10 h-10 bg-gradient-to-br from-red-600 via-red-600 to-red-700 rounded-xl flex items-center justify-center shadow-lg">
                        <span className="text-white font-bold text-sm">
                          {user.email?.charAt(0).toUpperCase()}
                        </span>
                      </div>
                    </div>
                    <div className="hidden lg:block text-left">
                      <p className="text-sm font-semibold text-gray-900">
                        {user.user_metadata?.display_name ||
                          user.email?.split("@")[0]}
                      </p>
                      <div className="flex items-center gap-1.5">
                        <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
                        <p className="text-xs text-gray-500 font-medium">Online</p>
                      </div>
                    </div>
                    <motion.svg
                      className="w-4 h-4 text-gray-500"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      animate={{ rotate: isProfileMenuOpen ? 180 : 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                      />
                    </motion.svg>
                  </motion.button>

                  {/* Profile Dropdown */}
                  <AnimatePresence>
                    {isProfileMenuOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: -10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -10, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                        className="absolute right-0 mt-3 w-72 bg-white/98 backdrop-blur-xl border border-gray-200/80 rounded-2xl shadow-2xl py-2 overflow-hidden"
                      >
                        <div className="px-5 py-4 border-b border-gray-100">
                          <p className="text-sm font-semibold text-gray-900 mb-1">
                            {user.user_metadata?.display_name ||
                              user.email?.split("@")[0]}
                          </p>
                          <p className="text-xs text-gray-500 truncate mb-3">
                            {user.email}
                          </p>
                          <div className="mt-2">
                            <UserRoleBadge />
                          </div>
                        </div>

                        <div className="py-2">
                          <a
                            href="/profile"
                            className="flex items-center gap-3 px-5 py-2.5 text-sm font-medium text-gray-700 hover:bg-red-50/80 hover:text-red-600 transition-all duration-200 group"
                          >
                            <svg className="w-4 h-4 text-gray-400 group-hover:text-red-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                            Profile Settings
                          </a>
                        </div>

                        <div className="border-t border-gray-100 mt-1">
                          <button
                            onClick={handleSignOut}
                            className="w-full flex items-center gap-3 text-left px-5 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 transition-all duration-200 group"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                            </svg>
                            Sign Out
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <div className="relative group">
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-red-600 to-red-700 rounded-xl opacity-0 group-hover:opacity-30 blur transition-all duration-300"></div>
                  <motion.a
                    href="/auth"
                    className="relative inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-red-600 to-red-700 text-white font-semibold uppercase tracking-wide rounded-xl hover:from-red-700 hover:to-red-800 transition-all duration-300 shadow-lg hover:shadow-xl text-sm"
                    whileHover={{ scale: 1.05, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                    </svg>
                    Login / Register
                  </motion.a>
                </div>
              )}
            </div>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <motion.button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2.5 text-gray-700 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200"
              whileTap={{ scale: 0.95 }}
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                {isMobileMenuOpen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2.5}
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2.5}
                    d="M4 6h16M4 12h16m-7 6h7"
                  />
                )}
              </svg>
            </motion.button>
          </div>
        </div>

        {/* Mobile Menu Panel */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden border-t border-gray-200/80"
            >
              <div className="py-4 space-y-1">
                {navItems.map((item) => (
                  <a
                    key={item.href}
                    href={item.href}
                    className={`block px-4 py-2.5 text-sm font-medium rounded-lg mx-2 transition-all duration-200 ${
                      pathname.startsWith(item.href)
                        ? "text-red-600 bg-red-50 font-semibold"
                        : "text-gray-700 hover:bg-gray-50 hover:text-red-600"
                    }`}
                  >
                    {item.label}
                  </a>
                ))}

                {/* Mobile User Navigation */}
                {user &&
                  userNavItems.map((item) => (
                    <a
                      key={item.href}
                      href={item.href}
                      className={`block px-4 py-2.5 text-sm font-medium rounded-lg mx-2 transition-all duration-200 ${
                        pathname.startsWith(item.href)
                          ? "text-red-600 bg-red-50 font-semibold"
                          : "text-gray-700 hover:bg-gray-50 hover:text-red-600"
                      }`}
                    >
                      {item.label}
                    </a>
                  ))}

                {/* Mobile Admin Navigation */}
                {user &&
                  userData?.role === "ADMIN" &&
                  adminNavItems.map((item) => (
                    <a
                      key={item.href}
                      href={item.href}
                      className={`block px-4 py-2.5 text-sm font-medium rounded-lg mx-2 transition-all duration-200 ${
                        pathname.startsWith(item.href)
                          ? "text-red-600 bg-red-50 font-semibold"
                          : "text-gray-700 hover:bg-gray-50 hover:text-red-600"
                      }`}
                    >
                      {item.label}
                    </a>
                  ))}

                {/* Mobile Authentication Section */}
                <div className="border-t border-gray-200/80 mt-4 pt-4">
                  {loading ? (
                    <div className="flex items-center gap-2 px-4 py-2 mx-2 bg-gray-50 rounded-xl border border-gray-200">
                      <div className="w-4 h-4 bg-gradient-to-r from-gray-300 to-gray-400 rounded-full animate-pulse"></div>
                      <span className="text-gray-500 text-sm font-medium">Loading...</span>
                    </div>
                  ) : user ? (
                    <div className="space-y-2 px-2">
                      <div className="px-4 py-3 bg-gradient-to-r from-gray-50 to-gray-50/50 rounded-xl border border-gray-200/50">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-red-600 via-red-600 to-red-700 rounded-xl flex items-center justify-center shadow-lg">
                            <span className="text-white font-bold text-sm">
                              {user.email?.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-gray-900">
                              {user.user_metadata?.display_name ||
                                user.email?.split("@")[0]}
                            </p>
                            <div className="flex items-center gap-1.5">
                              <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
                              <p className="text-xs text-gray-500 font-medium">Online</p>
                            </div>
                          </div>
                        </div>
                      </div>
                      <a
                        href="/profile"
                        className="flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-red-50/80 hover:text-red-600 rounded-lg transition-all duration-200"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        Profile Settings
                      </a>
                      <button
                        onClick={handleSignOut}
                        className="flex items-center gap-3 w-full text-left px-4 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                        Sign Out
                      </button>
                    </div>
                  ) : (
                    <div className="px-4">
                      <a
                        href="/auth"
                        className="flex items-center justify-center gap-2 w-full px-5 py-3 bg-gradient-to-r from-red-600 to-red-700 text-white font-semibold uppercase tracking-wide rounded-xl hover:from-red-700 hover:to-red-800 transition-all duration-300 shadow-lg text-sm"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                        </svg>
                        Login / Register
                      </a>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.nav>
  );
};

export default LibraryNavbar;