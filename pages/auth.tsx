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
  const [passwordStrength, setPasswordStrength] = useState<number>(0);
  const [fieldErrors, setFieldErrors] = useState<{
    email?: string;
    password?: string;
    confirmPassword?: string;
    name?: string;
  }>({});

  // Email validation helper function
  const isValidEmail = (email: string): boolean => {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    const trimmedEmail = email.trim();
    return emailRegex.test(trimmedEmail) && trimmedEmail.length > 0;
  };

  // Password strength calculator
  const calculatePasswordStrength = (password: string): number => {
    let strength = 0;
    if (password.length >= 6) strength += 1;
    if (password.length >= 8) strength += 1;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength += 1;
    if (/\d/.test(password)) strength += 1;
    if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) strength += 1;
    return Math.min(strength, 4);
  };

  // Get password strength text and color
  const getPasswordStrengthInfo = (strength: number) => {
    switch (strength) {
      case 0:
      case 1:
        return { text: "อ่อนแอ", color: "bg-red-500", textColor: "text-red-600" };
      case 2:
        return { text: "พอใช้", color: "bg-yellow-500", textColor: "text-yellow-600" };
      case 3:
        return { text: "ดี", color: "bg-blue-500", textColor: "text-blue-600" };
      case 4:
        return { text: "แข็งแรง", color: "bg-green-500", textColor: "text-green-600" };
      default:
        return { text: "", color: "", textColor: "" };
    }
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
    const newFieldErrors = { ...fieldErrors };

    // Sanitize email input by trimming whitespace
    if (name === 'email') {
      sanitizedValue = value.trim().toLowerCase();

      // Check max length (RFC 5321 standard)
      if (sanitizedValue.length > 254) {
        newFieldErrors.email = "อีเมลยาวเกินไป (สูงสุด 254 ตัวอักษร)";
      }
      // Real-time email validation
      else if (sanitizedValue && !isValidEmail(sanitizedValue)) {
        newFieldErrors.email = "รูปแบบอีเมลไม่ถูกต้อง";
      } else {
        delete newFieldErrors.email;
      }
    }

    // Password validation and strength check
    if (name === 'password') {
      // Check max length for security
      if (value.length > 128) {
        newFieldErrors.password = "รหัสผ่านยาวเกินไป (สูงสุด 128 ตัวอักษร)";
      } else if (value && value.length < 6) {
        newFieldErrors.password = "รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร";
      } else {
        delete newFieldErrors.password;
      }

      const strength = calculatePasswordStrength(value);
      setPasswordStrength(strength);

      // Check confirm password match
      if (formData.confirmPassword && value !== formData.confirmPassword) {
        newFieldErrors.confirmPassword = "รหัสผ่านไม่ตรงกัน";
      } else {
        delete newFieldErrors.confirmPassword;
      }
    }

    // Confirm password validation
    if (name === 'confirmPassword') {
      if (value.length > 128) {
        newFieldErrors.confirmPassword = "รหัสผ่านยาวเกินไป";
      } else if (value && value !== formData.password) {
        newFieldErrors.confirmPassword = "รหัสผ่านไม่ตรงกัน";
      } else {
        delete newFieldErrors.confirmPassword;
      }
    }

    // Name validation
    if (name === 'name') {
      // Remove leading/trailing whitespace and multiple spaces
      sanitizedValue = value.replace(/\s+/g, ' ');

      if (sanitizedValue.length > 100) {
        newFieldErrors.name = "ชื่อยาวเกินไป (สูงสุด 100 ตัวอักษร)";
      } else if (!isLogin && sanitizedValue && sanitizedValue.trim().length < 2) {
        newFieldErrors.name = "ชื่อต้องมีอย่างน้อย 2 ตัวอักษร";
      }
      // Check for invalid characters (allow Thai, English, space, and basic punctuation)
      else if (sanitizedValue && !/^[\u0E00-\u0E7Fa-zA-Z\s.'-]+$/.test(sanitizedValue)) {
        newFieldErrors.name = "ชื่อมีตัวอักษรที่ไม่ถูกต้อง (ใช้เฉพาะตัวอักษรและ . ' - เท่านั้น)";
      } else {
        delete newFieldErrors.name;
      }
    }

    setFieldErrors(newFieldErrors);
    setFormData({ ...formData, [name]: sanitizedValue });
    setError(""); // Clear general error when user types
  };

  // Function to get error messages in English
  const getErrorMessage = (error: AuthError | Error): string => {
    const message = error.message.toLowerCase();

    console.log('Original error:', error.message); // For debugging

    // 1. Rate limiting (check first as it's important)
    if (message.includes('too many requests') ||
        message.includes('rate limit') ||
        message.includes('email rate limit exceeded')) {
      return "⏰ Too many login attempts. Please wait a few minutes and try again (1-5 minutes)";
    }

    // 2. Email confirmation (Specific login failure)
    if (message.includes('confirm your email') || message.includes('email not confirmed')) {
        return "📧 Please confirm your email before logging in. Check your inbox (including Junk/Spam folder)";
    }

    // 3. Login errors
    if (message.includes('invalid login credentials') ||
        message.includes('invalid email or password') ||
        message.includes('invalid credentials')) {
      return "🔐 Incorrect email or password\n\nPlease check:\n• Your email is correct\n• Your password is correct (case-sensitive)\n• If you forgot your password, click \"Forgot password?\" below";
    }

    // 4. User already registered (Registration failure)
    if (message.includes('user already registered') ||
        message.includes('already registered') ||
        message.includes('user with this email already exists') ||
        message.includes('duplicate')) {
      return "⚠️ This email is already registered. Please use a different email or log in instead";
    }

    // 5. Invalid email format
    if (message.includes('invalid email')) {
      return "❌ Invalid email format. Please enter a valid email (e.g., example@email.com)";
    }

    // 6. Specific password errors
    if (message.includes('password') && message.includes('least')) {
      return "❌ Password must be at least 6 characters";
    }

    if (message.includes('password') && message.includes('strong')) {
      return "⚠️ Password should be stronger. We recommend using uppercase, lowercase, numbers, and symbols";
    }

    if (message.includes('password') && message.includes('length')) {
      return "❌ Password length is invalid (must be 6-128 characters)";
    }

    // 7. Network errors
    if (message.includes('network') ||
        message.includes('fetch') ||
        message.includes('timeout') ||
        message.includes('failed to fetch')) {
      return "🌐 Connection problem. Please check your internet and try again";
    }

    // 8. Server errors
    if (message.includes('500') ||
        message.includes('internal server') ||
        message.includes('server error')) {
      return "🔧 Server is having issues. Please try again in a moment";
    }

    if (message.includes('503') || message.includes('service unavailable')) {
      return "⏳ Service is currently unavailable. Please try again later";
    }

    // 9. User not found (More common in password reset, but good to have)
    if (message.includes('user not found') || message.includes('no user')) {
      return "❌ User not found. Please check your email or create a new account";
    }

    // 10. Account locked/disabled
    if (message.includes('account') && (message.includes('locked') || message.includes('disabled'))) {
      return "🔒 Your account has been suspended. Please contact the administrator";
    }

    // 11. Session/Token errors
    if (message.includes('session') ||
        message.includes('token') ||
        message.includes('unauthorized') ||
        message.includes('jwt')) {
      return "🔑 Session expired. Please log in again";
    }

    // 12. Validation errors
    if (message.includes('validation') || message.includes('invalid input')) {
      return "⚠️ Invalid input. Please check your information and try again";
    }

    // 13. Generic "invalid" errors (catch-all for login failures)
    if (message.includes('invalid')) {
      return "❌ Invalid information. Please check your email and password and try again";
    }

    // 14. Unknown/Generic errors
    console.error('Unhandled error:', error.message);
    return "⚠️ An error occurred during login. Please check your information and try again. If the problem persists, please contact support";
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    setError("");
    setFieldErrors({});

    // Comprehensive validation
    const errors: typeof fieldErrors = {};

    // Email validation
    if (!formData.email) {
      errors.email = "กรุณากรอกอีเมล";
    } else if (formData.email.length > 254) {
      errors.email = "อีเมลยาวเกินไป (สูงสุด 254 ตัวอักษร)";
    } else if (!isValidEmail(formData.email)) {
      errors.email = "รูปแบบอีเมลไม่ถูกต้อง";
    }

    // Password validation
    if (!formData.password) {
      errors.password = "กรุณากรอกรหัสผ่าน";
    } else if (formData.password.length < 6) {
      errors.password = "รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร";
    } else if (formData.password.length > 128) {
      errors.password = "รหัสผ่านยาวเกินไป (สูงสุด 128 ตัวอักษร)";
    }

    // Register-specific validation
    if (!isLogin) {
      if (!formData.name || formData.name.trim().length < 2) {
        errors.name = "กรุณากรอกชื่อเต็ม (อย่างน้อย 2 ตัวอักษร)";
      } else if (formData.name.length > 100) {
        errors.name = "ชื่อยาวเกินไป (สูงสุด 100 ตัวอักษร)";
      } else if (!/^[\u0E00-\u0E7Fa-zA-Z\s.'-]+$/.test(formData.name)) {
        errors.name = "ชื่อมีตัวอักษรที่ไม่ถูกต้อง";
      }

      if (!formData.confirmPassword) {
        errors.confirmPassword = "กรุณายืนยันรหัสผ่าน";
      } else if (formData.password !== formData.confirmPassword) {
        errors.confirmPassword = "รหัสผ่านไม่ตรงกัน";
      } else if (formData.confirmPassword.length > 128) {
        errors.confirmPassword = "รหัสผ่านยาวเกินไป";
      }

      // Warn about weak password
      if (passwordStrength < 2 && formData.password.length >= 6) {
        setError("⚠️ รหัสผ่านของคุณค่อนข้างอ่อนแอ แนะนำให้ใช้รหัสผ่านที่แข็งแรงกว่านี้");
      }
    }

    // If there are validation errors, stop submission
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      setError("❌ กรุณาตรวจสอบข้อมูลและลองอีกครั้ง");
      setIsLoading(false);
      return;
    }

    try {
      if (isLogin) {
        // Login with Supabase
        const { error } = await supabase.auth.signInWithPassword({
          email: formData.email,
          password: formData.password,
        });

        if (error) throw error;

        console.log("Login successful");

        // Redirect to home page after login
        router.push("/");
      } else {
        // Register with Supabase
        const { error } = await supabase.auth.signUp({
          email: formData.email,
          password: formData.password,
          options: {
            data: {
              display_name: formData.name.trim(),
            }
          }
        });

        if (error) throw error;

        // Show success message and switch to login
        alert("ลงทะเบียนสำเร็จ! กรุณาตรวจสอบอีเมลเพื่อยืนยันบัญชีก่อนเข้าสู่ระบบ");
        setIsLogin(true);
        setFormData({
          email: formData.email, // Keep email for convenience
          password: "",
          confirmPassword: "",
          name: "",
        });
        setPasswordStrength(0);
      }
    } catch (err) {
      console.error("Auth error:", err);

      // Handle different types of errors
      let errorMessage: string;

      if (err instanceof Error) {
        errorMessage = getErrorMessage(err as AuthError);
      } else if (typeof err === 'string') {
        errorMessage = `⚠️ ${err}`;
      } else {
        errorMessage = "⚠️ An unexpected error occurred. Please try again.";
      }

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

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-red-50 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Decorative Background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 right-20 w-96 h-96 bg-red-100/60 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 left-20 w-96 h-96 bg-red-100/40 rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10 bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl p-10 w-full max-w-md border border-gray-200/50">
        {/* Logo Section */}
        <div className="text-center mb-10">
          <div className="flex justify-center mb-6">
            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-red-600 to-red-700 rounded-2xl opacity-30 blur group-hover:opacity-50 transition-all"></div>
              <div className="relative w-20 h-20 bg-gradient-to-br from-red-600 via-red-600 to-red-700 rounded-2xl flex items-center justify-center shadow-2xl">
                <span className="text-white font-bold text-3xl">T2U</span>
              </div>
            </div>
          </div>
          <h2 className="text-4xl font-bold mb-3">
            <span className="bg-gradient-to-r from-red-600 to-red-700 bg-clip-text text-transparent">
              {isLogin ? "เข้าสู่ระบบ" : "สมัครสมาชิก"}
            </span>
          </h2>
          <p className="text-lg text-gray-600">
            {isLogin ? "ยินดีต้อนรับกลับมา!" : "เริ่มต้นกับเรา!"}
          </p>
        </div>

        <div className="space-y-5">
          {!isLogin && (
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                ชื่อเต็ม
              </label>
              <input
                type="text"
                name="name"
                placeholder="กรอกชื่อเต็มของคุณ"
                value={formData.name}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                className={`text-black w-full px-5 py-3.5 border-2 rounded-xl focus:ring-2 focus:border-transparent transition-all duration-200 ${
                  fieldErrors.name
                    ? "border-red-300 focus:ring-red-500 bg-red-50"
                    : "border-gray-200 focus:ring-red-500 hover:border-gray-300 bg-gray-50/50"
                }`}
                required={!isLogin}
              />
              {fieldErrors.name && (
                <p className="mt-2 text-sm text-red-600 flex items-center gap-1.5 font-medium">
                  <span>⚠️</span> {fieldErrors.name}
                </p>
              )}
            </div>
          )}

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              อีเมล
            </label>
            <input
              type="email"
              name="email"
              placeholder="กรอกอีเมลของคุณ (เช่น example@email.com)"
              value={formData.email}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              className={`text-black w-full px-5 py-3.5 border-2 rounded-xl focus:ring-2 focus:border-transparent transition-all duration-200 ${
                fieldErrors.email
                  ? "border-red-300 focus:ring-red-500 bg-red-50"
                  : formData.email && !fieldErrors.email
                  ? "border-green-300 focus:ring-green-500 bg-green-50"
                  : "border-gray-200 focus:ring-red-500 hover:border-gray-300 bg-gray-50/50"
              }`}
              required
            />
            {fieldErrors.email && (
              <p className="mt-2 text-sm text-red-600 flex items-center gap-1.5 font-medium">
                <span>⚠️</span> {fieldErrors.email}
              </p>
            )}
            {formData.email && !fieldErrors.email && (
              <p className="mt-2 text-sm text-green-600 flex items-center gap-1.5 font-medium">
                <span>✓</span> อีเมลถูกต้อง
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              รหัสผ่าน
            </label>
            <input
              type="password"
              name="password"
              placeholder="กรอกรหัสผ่าน (อย่างน้อย 6 ตัวอักษร)"
              value={formData.password}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              className={`text-black w-full px-5 py-3.5 border-2 rounded-xl focus:ring-2 focus:border-transparent transition-all duration-200 ${
                fieldErrors.password
                  ? "border-red-300 focus:ring-red-500 bg-red-50"
                  : "border-gray-200 focus:ring-red-500 hover:border-gray-300 bg-gray-50/50"
              }`}
              required
            />
            {fieldErrors.password && (
              <p className="mt-2 text-sm text-red-600 flex items-center gap-1.5 font-medium">
                <span>⚠️</span> {fieldErrors.password}
              </p>
            )}

            {/* Password Strength Indicator (only show during registration) */}
            {!isLogin && formData.password && !fieldErrors.password && (
              <div className="mt-2">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-gray-600">ความแข็งแรงของรหัสผ่าน:</span>
                  <span className={`text-xs font-medium ${getPasswordStrengthInfo(passwordStrength).textColor}`}>
                    {getPasswordStrengthInfo(passwordStrength).text}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                  <div
                    className={`h-full transition-all duration-300 ${getPasswordStrengthInfo(passwordStrength).color}`}
                    style={{ width: `${(passwordStrength / 4) * 100}%` }}
                  />
                </div>
                <p className="mt-1 text-xs text-gray-500">
                  💡 เคล็ดลับ: ใช้ตัวพิมพ์ใหญ่ พิมพ์เล็ก ตัวเลข และสัญลักษณ์เพื่อความปลอดภัยที่ดีขึ้น
                </p>
              </div>
            )}
          </div>

          {!isLogin && (
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                ยืนยันรหัสผ่าน
              </label>
              <input
                type="password"
                name="confirmPassword"
                placeholder="ยืนยันรหัสผ่านของคุณ"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                className={`text-black w-full px-5 py-3.5 border-2 rounded-xl focus:ring-2 focus:border-transparent transition-all duration-200 ${
                  fieldErrors.confirmPassword
                    ? "border-red-300 focus:ring-red-500 bg-red-50"
                    : formData.confirmPassword && formData.password === formData.confirmPassword
                    ? "border-green-300 focus:ring-green-500 bg-green-50"
                    : "border-gray-200 focus:ring-red-500 hover:border-gray-300 bg-gray-50/50"
                }`}
                required={!isLogin}
              />
              {fieldErrors.confirmPassword && (
                <p className="mt-2 text-sm text-red-600 flex items-center gap-1.5 font-medium">
                  <span>⚠️</span> {fieldErrors.confirmPassword}
                </p>
              )}
              {formData.confirmPassword && formData.password === formData.confirmPassword && !fieldErrors.confirmPassword && (
                <p className="mt-2 text-sm text-green-600 flex items-center gap-1.5 font-medium">
                  <span>✓</span> รหัสผ่านตรงกัน
                </p>
              )}
            </div>
          )}

          {error && (
            <div className="bg-red-50/80 border-l-4 border-red-500 text-red-700 px-5 py-4 rounded-xl shadow-sm backdrop-blur-sm">
              <div className="flex items-start gap-2">
                <span className="text-lg"></span>
                <p className="text-sm font-medium flex-1">{error}</p>
              </div>
            </div>
          )}

          <div className="relative group pt-2">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-red-600 to-red-700 rounded-xl opacity-0 group-hover:opacity-30 blur transition-all duration-300"></div>
            <button
              onClick={handleSubmit}
              disabled={isLoading}
              className="relative w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 disabled:from-gray-400 disabled:to-gray-500 text-white font-semibold py-4 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl disabled:cursor-not-allowed"
              type = "submit"
            >
              {isLoading
                ? "กำลังดำเนินการ..."
                : isLogin
                ? "เข้าสู่ระบบ"
                : "สมัครสมาชิก"}
            </button>
          </div>
        </div>

        <div className="mt-8 text-center">
          <p className="text-gray-600 text-base">
            {isLogin ? "ยังไม่มีบัญชี?" : "มีบัญชีอยู่แล้ว?"}
            <button
              onClick={switchMode}
              className="ml-2 text-red-600 hover:text-red-700 font-semibold hover:underline transition-all"
            >
              {isLogin ? "สมัครสมาชิก" : "เข้าสู่ระบบ"}
            </button>
          </p>
        </div>

        {/* Back to Home Link */}
        <div className="mt-8 text-center border-t border-gray-200 pt-6">
          <a
            href="/"
            className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-700 text-sm font-medium hover:gap-3 transition-all"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            กลับสู่หน้าหลัก
          </a>
        </div>
      </div>
    </div>
  );
}

export default AuthForm;