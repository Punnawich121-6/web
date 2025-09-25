// components/ProtectedRoute.tsx
"use client";

import React, { useEffect, useState } from "react";
import { onAuthStateChanged, User, getAuth } from "firebase/auth";
import app from "../pages/firebase"; // ใช้ Firebase config ของคุณ
import { useRouter } from "next/navigation";

interface ProtectedRouteProps {
  children: React.ReactNode;
  redirectTo?: string;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  redirectTo = "/auth",
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const auth = getAuth(app); // Initialize auth

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);

      // Redirect to login if not authenticated
      if (!currentUser) {
        router.push(redirectTo);
      }
    });

    return () => unsubscribe();
  }, [router, redirectTo]);

  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">กำลังตรวจสอบสิทธิ์...</p>
        </div>
      </div>
    );
  }

  // Show content only if user is authenticated
  return user ? <>{children}</> : null;
};

export default ProtectedRoute;
