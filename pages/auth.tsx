import { useState, ChangeEvent, KeyboardEvent, useEffect } from "react";
import { useRouter } from "next/router";
import { supabase } from "../lib/supabase";
import type { AuthError } from "@supabase/supabase-js";

type FormData = {
  email: string;
  password: string;
  confirmPassword: string;
  name: string;
};

function AuthForm() {
  const router = useRouter();
  const [isLogin, setIsLogin] = useState<boolean>(true);
  const [formData, setFormData] = useState<FormData>({
    email: "",
    password: "",
    confirmPassword: "",
    name: "",
  });
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  // Email validation helper function
  const isValidEmail = (email: string): boolean => {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    const trimmedEmail = email.trim();
    return emailRegex.test(trimmedEmail) && trimmedEmail.length > 0;
  };

  // Check if user is already logged in
  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        router.push("/dashboard");
      }
    };

    checkUser();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        router.push("/dashboard");
      }
    });

    return () => subscription.unsubscribe();
  }, [router]);

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    let sanitizedValue = value;

    // Sanitize email input by trimming whitespace
    if (name === 'email') {
      sanitizedValue = value.trim().toLowerCase();
    }

    setFormData({ ...formData, [name]: sanitizedValue });
  };

  // Function to get Thai error messages
  const getErrorMessage = (error: AuthError | Error): string => {
    const message = error.message.toLowerCase();

    if (message.includes('invalid login credentials') || message.includes('invalid email or password')) {
      return "อีเมลหรือรหัสผ่านไม่ถูกต้อง";
    }
    if (message.includes('user already registered') || message.includes('already registered')) {
      return "อีเมลนี้มีผู้ใช้แล้ว";
    }
    if (message.includes('password') && message.includes('least')) {
      return "รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร";
    }
    if (message.includes('invalid email')) {
      return "รูปแบบอีเมลไม่ถูกต้อง";
    }
    if (message.includes('too many requests')) {
      return "มีการพยายามเข้าสู่ระบบมากเกินไป กรุณาลองใหม่ภายหลัง";
    }

    return "เกิดข้อผิดพลาด กรุณาลองใหม่";
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    setError("");

    // Validation
    if (!formData.email || !formData.password) {
      setError("กรุณากรอกอีเมลและรหัสผ่าน");
      setIsLoading(false);
      return;
    }

    // Validate email format
    if (!isValidEmail(formData.email)) {
      setError("รูปแบบอีเมลไม่ถูกต้อง กรุณาตรวจสอบและลองใหม่");
      setIsLoading(false);
      return;
    }

    if (!isLogin) {
      if (!formData.name) {
        setError("กรุณากรอกชื่อ-นามสกุล");
        setIsLoading(false);
        return;
      }

      if (formData.password !== formData.confirmPassword) {
        setError("รหัสผ่านไม่ตรงกัน");
        setIsLoading(false);
        return;
      }
    }

    try {
      if (isLogin) {
        // Login with Supabase
        const { data, error } = await supabase.auth.signInWithPassword({
          email: formData.email,
          password: formData.password,
        });

        if (error) throw error;

        console.log("Login successful:", data.user);

        // Redirect to home page after login
        router.push("/");
      } else {
        // Register with Supabase
        const { data, error } = await supabase.auth.signUp({
          email: formData.email,
          password: formData.password,
          options: {
            data: {
              display_name: formData.name,
            }
          }
        });

        if (error) throw error;

        // Show success message and switch to login
        alert("สมัครสมาชิกสำเร็จ! กรุณาเข้าสู่ระบบ");
        setIsLogin(true);
        setFormData({
          email: formData.email, // Keep email for convenience
          password: "",
          confirmPassword: "",
          name: "",
        });
      }
    } catch (err) {
      const authError = err as AuthError;
      console.error("Auth error:", authError);

      // Set user-friendly error message
      const errorMessage = getErrorMessage(authError);
      setError(errorMessage);

      // Also log the exact error for debugging
      console.log("Displaying error:", errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const switchMode = () => {
    setIsLogin(!isLogin);
    setError("");
    setFormData({
      email: "",
      password: "",
      confirmPassword: "",
      name: "",
    });
  };

  const handleKeyPress = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSubmit();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-red-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
        {/* Logo Section */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-red-600 rounded-lg flex items-center justify-center shadow-sm">
              <span className="text-white font-bold text-2xl">T2U</span>
            </div>
          </div>
          <h2 className="text-3xl font-bold text-gray-800 mb-2">
            {isLogin ? "เข้าสู่ระบบ" : "สมัครสมาชิก"}
          </h2>
          <p className="text-gray-600">
            {isLogin ? "ยินดีต้อนรับกลับมา!" : "เริ่มต้นใช้งานกับเรา!"}
          </p>
        </div>

        <div className="space-y-4">
          {!isLogin && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                ชื่อ-นามสกุล
              </label>
              <input
                type="text"
                name="name"
                placeholder="กรอกชื่อ-นามสกุล"
                value={formData.name}
                onChange={handleInputChange}
                onKeyPress={handleKeyPress}
                className="text-black w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent transition-colors"
                required={!isLogin}
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              อีเมล
            </label>
            <input
              type="email"
              name="email"
              placeholder="กรอกอีเมล"
              value={formData.email}
              onChange={handleInputChange}
              onKeyPress={handleKeyPress}
              className="text-black w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent transition-colors"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              รหัสผ่าน
            </label>
            <input
              type="password"
              name="password"
              placeholder="กรอกรหัสผ่าน (อย่างน้อย 6 ตัวอักษร)"
              value={formData.password}
              onChange={handleInputChange}
              onKeyPress={handleKeyPress}
              className="text-black w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent transition-colors"
              required
            />
          </div>

          {!isLogin && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                ยืนยันรหัสผ่าน
              </label>
              <input
                type="password"
                name="confirmPassword"
                placeholder="ยืนยันรหัสผ่าน"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                onKeyPress={handleKeyPress}
                className="text-black w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent transition-colors"
                required={!isLogin}
              />
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <button
            onClick={handleSubmit}
            disabled={isLoading}
            className="w-full bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white font-medium py-3 rounded-lg transition-colors duration-200"
            type = "submit"
          >
            {isLoading
              ? "กำลังดำเนินการ..."
              : isLogin
              ? "เข้าสู่ระบบ"
              : "สมัครสมาชิก"}
          </button>
        </div>

        <div className="mt-6 text-center">
          <p className="text-gray-600">
            {isLogin ? "ยังไม่มีบัญชี?" : "มีบัญชีแล้ว?"}
            <button
              onClick={switchMode}
              className="ml-2 text-red-600 hover:text-red-700 font-medium underline"
            >
              {isLogin ? "สมัครสมาชิก" : "เข้าสู่ระบบ"}
            </button>
          </p>
        </div>

        {isLogin && (
          <div className="mt-4 text-center">
            <a
              href="/forgot-password"
              className="text-red-600 hover:text-red-700 text-sm underline"
            >
              ลืมรหัสผ่าน?
            </a>
          </div>
        )}

        {/* Back to Home Link */}
        <div className="mt-6 text-center">
          <a
            href="/"
            className="text-gray-500 hover:text-gray-700 text-sm underline"
          >
            ← กลับสู่หน้าหลัก
          </a>
        </div>
      </div>
    </div>
  );
}

export default AuthForm;
