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
        return { text: "ปานกลาง", color: "bg-yellow-500", textColor: "text-yellow-600" };
      case 3:
        return { text: "ดี", color: "bg-blue-500", textColor: "text-blue-600" };
      case 4:
        return { text: "แข็งแกร่ง", color: "bg-green-500", textColor: "text-green-600" };
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
        newFieldErrors.name = "ชื่อมีอักขระที่ไม่ถูกต้อง (ใช้ได้เฉพาะตัวอักษรไทย-อังกฤษ และ . ' -)";
      } else {
        delete newFieldErrors.name;
      }
    }

    setFieldErrors(newFieldErrors);
    setFormData({ ...formData, [name]: sanitizedValue });
    setError(""); // Clear general error when user types
  };

  // Function to get Thai error messages
  const getErrorMessage = (error: AuthError | Error): string => {
    const message = error.message.toLowerCase();

    // Login errors
    if (message.includes('invalid login credentials') ||
        message.includes('invalid email or password') ||
        message.includes('invalid credentials')) {
      return "❌ อีเมลหรือรหัสผ่านไม่ถูกต้อง กรุณาตรวจสอบและลองใหม่อีกครั้ง";
    }

    // Email errors
    if (message.includes('user already registered') ||
        message.includes('already registered') ||
        message.includes('user with this email already exists')) {
      return "⚠️ อีเมลนี้ถูกใช้งานแล้ว กรุณาใช้อีเมลอื่นหรือเข้าสู่ระบบ";
    }

    if (message.includes('invalid email') || message.includes('email')) {
      return "❌ รูปแบบอีเมลไม่ถูกต้อง กรุณากรอกอีเมลที่ถูกต้อง เช่น example@email.com";
    }

    // Password errors
    if (message.includes('password') && message.includes('least')) {
      return "❌ รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร";
    }

    if (message.includes('password') && message.includes('strong')) {
      return "⚠️ รหัสผ่านควรมีความแข็งแกร่งมากกว่านี้ แนะนำให้ใช้ตัวพิมพ์ใหญ่-เล็ก ตัวเลข และสัญลักษณ์";
    }

    if (message.includes('password') && message.includes('length')) {
      return "❌ รหัสผ่านมีความยาวไม่ถูกต้อง (ต้องมี 6-128 ตัวอักษร)";
    }

    // Rate limiting
    if (message.includes('too many requests') || message.includes('rate limit')) {
      return "⏰ มีการพยายามเข้าสู่ระบบมากเกินไป กรุณารอสักครู่แล้วลองใหม่อีกครั้ง (ประมาณ 1-5 นาที)";
    }

    // Network errors
    if (message.includes('network') || message.includes('fetch') || message.includes('timeout')) {
      return "🌐 เกิดปัญหาการเชื่อมต่อ กรุณาตรวจสอบอินเทอร์เน็ตและลองใหม่";
    }

    // Server errors
    if (message.includes('500') || message.includes('internal server') || message.includes('server error')) {
      return "🔧 เซิร์ฟเวอร์มีปัญหา กรุณาลองใหม่ในอีกสักครู่ หากปัญหายังคงอยู่กรุณาติดต่อผู้ดูแลระบบ";
    }

    if (message.includes('503') || message.includes('service unavailable')) {
      return "⏳ บริการไม่พร้อมใช้งานในขณะนี้ กรุณาลองใหม่ภายหลัง";
    }

    // User not found
    if (message.includes('user not found') || message.includes('no user')) {
      return "❌ ไม่พบผู้ใช้งานนี้ในระบบ กรุณาตรวจสอบอีเมลหรือสมัครสมาชิกใหม่";
    }

    // Email not confirmed
    if (message.includes('email not confirmed') || message.includes('confirm')) {
      return "📧 กรุณายืนยันอีเมลของคุณก่อนเข้าสู่ระบบ ตรวจสอบกล่องจดหมายของคุณ";
    }

    // Account locked/disabled
    if (message.includes('account') && (message.includes('locked') || message.includes('disabled'))) {
      return "🔒 บัญชีของคุณถูกระงับ กรุณาติดต่อผู้ดูแลระบบ";
    }

    // Session/Token errors
    if (message.includes('session') || message.includes('token') || message.includes('unauthorized')) {
      return "🔑 เซสชันหมดอายุ กรุณาเข้าสู่ระบบใหม่อีกครั้ง";
    }

    // Validation errors
    if (message.includes('validation') || message.includes('invalid input')) {
      return "⚠️ ข้อมูลที่กรอกไม่ถูกต้อง กรุณาตรวจสอบและลองใหม่";
    }

    // Unknown/Generic errors
    return `⚠️ เกิดข้อผิดพลาด: ${error.message}\nกรุณาลองใหม่อีกครั้งหรือติดต่อผู้ดูแลระบบ`;
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
        errors.name = "กรุณากรอกชื่อ-นามสกุล (อย่างน้อย 2 ตัวอักษร)";
      } else if (formData.name.length > 100) {
        errors.name = "ชื่อยาวเกินไป (สูงสุด 100 ตัวอักษร)";
      } else if (!/^[\u0E00-\u0E7Fa-zA-Z\s.'-]+$/.test(formData.name)) {
        errors.name = "ชื่อมีอักขระที่ไม่ถูกต้อง";
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
        setError("⚠️ รหัสผ่านของคุณค่อนข้างอ่อนแอ แนะนำให้ใช้รหัสผ่านที่แข็งแกร่งกว่านี้");
      }
    }

    // If there are validation errors, stop submission
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      setError("❌ กรุณาตรวจสอบข้อมูลที่กรอกให้ถูกต้อง");
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
        alert("สมัครสมาชิกสำเร็จ! กรุณาเข้าสู่ระบบ");
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
        errorMessage = "⚠️ เกิดข้อผิดพลาดที่ไม่คาดคิด กรุณาลองใหม่อีกครั้ง";
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
                onKeyDown={handleKeyDown}
                className={`text-black w-full px-4 py-3 border rounded-lg focus:ring-2 focus:border-transparent transition-colors ${
                  fieldErrors.name
                    ? "border-red-300 focus:ring-red-500 bg-red-50"
                    : "border-gray-300 focus:ring-red-500"
                }`}
                required={!isLogin}
              />
              {fieldErrors.name && (
                <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                  <span>⚠️</span> {fieldErrors.name}
                </p>
              )}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              อีเมล
            </label>
            <input
              type="email"
              name="email"
              placeholder="กรอกอีเมล เช่น example@email.com"
              value={formData.email}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              className={`text-black w-full px-4 py-3 border rounded-lg focus:ring-2 focus:border-transparent transition-colors ${
                fieldErrors.email
                  ? "border-red-300 focus:ring-red-500 bg-red-50"
                  : formData.email && !fieldErrors.email
                  ? "border-green-300 focus:ring-green-500 bg-green-50"
                  : "border-gray-300 focus:ring-red-500"
              }`}
              required
            />
            {fieldErrors.email && (
              <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                <span>⚠️</span> {fieldErrors.email}
              </p>
            )}
            {formData.email && !fieldErrors.email && (
              <p className="mt-1 text-sm text-green-600 flex items-center gap-1">
                <span>✓</span> อีเมลถูกต้อง
              </p>
            )}
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
              onKeyDown={handleKeyDown}
              className={`text-black w-full px-4 py-3 border rounded-lg focus:ring-2 focus:border-transparent transition-colors ${
                fieldErrors.password
                  ? "border-red-300 focus:ring-red-500 bg-red-50"
                  : "border-gray-300 focus:ring-red-500"
              }`}
              required
            />
            {fieldErrors.password && (
              <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                <span>⚠️</span> {fieldErrors.password}
              </p>
            )}

            {/* Password Strength Indicator (only show during registration) */}
            {!isLogin && formData.password && !fieldErrors.password && (
              <div className="mt-2">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-gray-600">ความแข็งแกร่งของรหัสผ่าน:</span>
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
                  💡 แนะนำ: ใช้ตัวพิมพ์ใหญ่-เล็ก ตัวเลข และสัญลักษณ์เพื่อความปลอดภัย
                </p>
              </div>
            )}
          </div>

          {!isLogin && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                ยืนยันรหัสผ่าน
              </label>
              <input
                type="password"
                name="confirmPassword"
                placeholder="ยืนยันรหัสผ่านอีกครั้ง"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                className={`text-black w-full px-4 py-3 border rounded-lg focus:ring-2 focus:border-transparent transition-colors ${
                  fieldErrors.confirmPassword
                    ? "border-red-300 focus:ring-red-500 bg-red-50"
                    : formData.confirmPassword && formData.password === formData.confirmPassword
                    ? "border-green-300 focus:ring-green-500 bg-green-50"
                    : "border-gray-300 focus:ring-red-500"
                }`}
                required={!isLogin}
              />
              {fieldErrors.confirmPassword && (
                <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                  <span>⚠️</span> {fieldErrors.confirmPassword}
                </p>
              )}
              {formData.confirmPassword && formData.password === formData.confirmPassword && !fieldErrors.confirmPassword && (
                <p className="mt-1 text-sm text-green-600 flex items-center gap-1">
                  <span>✓</span> รหัสผ่านตรงกัน
                </p>
              )}
            </div>
          )}

          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 text-red-700 px-4 py-3 rounded-lg shadow-sm">
              <div className="flex items-start gap-2">
                <span className="text-lg">⚠️</span>
                <p className="text-sm font-medium flex-1">{error}</p>
              </div>
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
