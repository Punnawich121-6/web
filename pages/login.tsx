import { useState, ChangeEvent, KeyboardEvent } from 'react';

type FormData = {
  email: string;
  password: string;
  confirmPassword: string;
  name: string;
};

function AuthForm() {
  const [isLogin, setIsLogin] = useState<boolean>(true); // Toggle between login/register
  const [formData, setFormData] = useState<FormData>({
    email: '',
    password: '',
    confirmPassword: '',
    name: ''
  });
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    setError('');

    if (!isLogin && formData.password !== formData.confirmPassword) {
      setError('รหัสผ่านไม่ตรงกัน');
      setIsLoading(false);
      return;
    }

    try {
      const endpoint = isLogin ? '/api/login' : '/api/register';
      const payload = isLogin
        ? { email: formData.email, password: formData.password }
        : { name: formData.name, email: formData.email, password: formData.password };

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        const data = await response.json();
        localStorage.setItem('token', data.token);
        window.location.href = '/dashboard';
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'เกิดข้อผิดพลาด');
      }
    } catch (err) {
      setError('เกิดข้อผิดพลาด กรุณาลองใหม่');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    setError('');
    try {
      window.location.href = '/auth/google'; // Trigger Google OAuth flow
    } catch (err) {
      setError('Google login failed');
      setIsLoading(false);
    }
  };

  const switchMode = () => {
    setIsLogin(!isLogin);
    setError('');
    setFormData({
      email: '',
      password: '',
      confirmPassword: '',
      name: ''
    });
  };

  const handleKeyPress = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSubmit();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-800 mb-2">
            {isLogin ? 'เข้าสู่ระบบ' : 'สมัครสมาชิก'}
          </h2>
          <p className="text-gray-600">{isLogin ? 'ยินดีต้อนรับกลับมา!' : 'เริ่มต้นใช้งานกับเรา'}</p>
        </div>

        <div className="space-y-4">
          {!isLogin && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">ชื่อ-นามสกุล</label>
              <input
                type="text"
                name="name"
                placeholder="กรอกชื่อ-นามสกุล"
                value={formData.name}
                onChange={handleInputChange}
                onKeyPress={handleKeyPress}
                className="text-black w-full px-4 py-3 border border-gray-300 rounded-lg"
                required={!isLogin}
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">อีเมล</label>
            <input
              type="email"
              name="email"
              placeholder="กรอกอีเมล"
              value={formData.email}
              onChange={handleInputChange}
              onKeyPress={handleKeyPress}
              className="text-black w-full px-4 py-3 border border-gray-300 rounded-lg"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">รหัสผ่าน</label>
            <input
              type="password"
              name="password"
              placeholder="กรอกรหัสผ่าน"
              value={formData.password}
              onChange={handleInputChange}
              onKeyPress={handleKeyPress}
              className="text-black w-full px-4 py-3 border border-gray-300 rounded-lg"
              required
            />
          </div>

          {!isLogin && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">ยืนยันรหัสผ่าน</label>
              <input
                type="password"
                name="confirmPassword"
                placeholder="ยืนยันรหัสผ่าน"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                onKeyPress={handleKeyPress}
                className="text-black w-full px-4 py-3 border border-gray-300 rounded-lg"
                required={!isLogin}
              />
            </div>
          )}

          {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">{error}</div>}

          <button
            onClick={handleSubmit}
            disabled={isLoading}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium py-3 rounded-lg"
          >
            {isLoading ? 'กำลังดำเนินการ...' : isLogin ? 'เข้าสู่ระบบ' : 'สมัครสมาชิก'}
          </button>
        </div>

        <div className="my-6 flex items-center">
          <div className="flex-1 border-t border-gray-300"></div>
          <span className="px-4 text-gray-500 text-sm">หรือ</span>
          <div className="flex-1 border-t border-gray-300"></div>
        </div>

        <button
          onClick={handleGoogleLogin}
          disabled={isLoading}
          className="w-full bg-white hover:bg-gray-50 border border-gray-300 text-gray-700 font-medium py-3 px-4 rounded-lg flex items-center justify-center space-x-2 disabled:opacity-50"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path fill="#4285f4" d="M22.56 12.25..." />
            <path fill="#34a853" d="M12 23..." />
            <path fill="#fbbc05" d="M5.84 14.09..." />
            <path fill="#ea4335" d="M12 5.38..." />
          </svg>
          <span>เข้าสู่ระบบด้วย Google</span>
        </button>

        <div className="mt-6 text-center">
          <p className="text-gray-600">
            {isLogin ? 'ยังไม่มีบัญชี?' : 'มีบัญชีแล้ว?'}
            <button onClick={switchMode} className="ml-2 text-blue-600 hover:text-blue-700 font-medium underline">
              {isLogin ? 'สมัครสมาชิก' : 'เข้าสู่ระบบ'}
            </button>
          </p>
        </div>

        {isLogin && (
          <div className="mt-4 text-center">
            <a href="/forgot-password" className="text-blue-600 hover:text-blue-700 text-sm underline">
              ลืมรหัสผ่าน?
            </a>
          </div>
        )}
      </div>
    </div>
  );
}

export default AuthForm;