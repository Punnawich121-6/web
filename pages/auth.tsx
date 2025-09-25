import { useState, ChangeEvent, KeyboardEvent, useEffect } from "react";
import { useRouter } from "next/router";
import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
  AuthError,
  onAuthStateChanged,
} from "firebase/auth";
import app from "./firebase"; // Import Firebase app


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

  // Initialize Firebase Auth
  const auth = getAuth(app);

  // Check if user is already logged in
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        // User is already logged in, redirect to home
        router.push("/dashboard");
      }
    });

    return () => unsubscribe();
  }, [auth, router]);

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Function to get Thai error messages
  const getErrorMessage = (error: AuthError): string => {
    switch (error.code) {
      case "auth/user-not-found":
        return "ไม่พบผู้ใช้นี้ในระบบ";
      case "auth/wrong-password":
        return "รหัสผ่านไม่ถูกต้อง";
      case "auth/email-already-in-use":
        return "อีเมลนี้มีผู้ใช้แล้ว";
      case "auth/weak-password":
        return "รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร";
      case "auth/invalid-email":
        return "รูปแบบอีเมลไม่ถูกต้อง";
      case "auth/too-many-requests":
        return "มีการพยายามเข้าสู่ระบบมากเกินไป กรุณาลองใหม่ภายหลัง";
      case "auth/invalid-credential":
        return "ข้อมูลการเข้าสู่ระบบไม่ถูกต้อง";
      default:
        return "เกิดข้อผิดพลาด กรุณาลองใหม่";
    }
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
        // Login with Firebase
        const userCredential = await signInWithEmailAndPassword(
          auth,
          formData.email,
          formData.password
        );

        // Get the user token
        const token = await userCredential.user.getIdToken();

        // Store token (optional, Firebase handles auth state automatically)
        localStorage.setItem("token", token);

        // Show success message
        console.log("Login successful:", userCredential.user);

        // Redirect to home page after login
        router.push("/");
      } else {
        // Register with Firebase
        const userCredential = await createUserWithEmailAndPassword(
          auth,
          formData.email,
          formData.password
        );

        // Update user profile with name
        await updateProfile(userCredential.user, {
          displayName: formData.name,
        });

        // Get the user token
        const token = await userCredential.user.getIdToken();
        localStorage.setItem("token", token);

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
      const firebaseError = err as AuthError;
      console.error("Auth error:", firebaseError);
      setError(getErrorMessage(firebaseError));
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
            {isLogin ? "ยินดีต้อนรับกลับมา!" : "เริ่มต้นใช้งานกับเรา"}
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
