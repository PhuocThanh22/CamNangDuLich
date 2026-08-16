'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Utensils, Mail, Lock, User, Loader2, Eye, EyeOff, ArrowLeft, Check, Send } from 'lucide-react';
import { authService, setToken, setUser } from '@/services/authService';

type AuthMode = 'login' | 'register';
type RegisterStep = 'form' | 'verify' | 'password';

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<AuthMode>('login');
  const [registerStep, setRegisterStep] = useState<RegisterStep>('form');
  const [showPassword, setShowPassword] = useState(false);

  const [email, setEmail] = useState('');
  const [matkhau, setMatkhau] = useState('');
  const [ten, setTen] = useState('');
  const [code, setCode] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [countdown, setCountdown] = useState(0);

  const API_ORIGIN = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000').replace(/\/+$/, '');

  const handleSocialMessage = useCallback((event: MessageEvent) => {
    if (event.origin !== API_ORIGIN) return;
    if (event.data?.type !== 'social-auth') return;
    setToken(event.data.access_token);
    setUser(event.data.user);
    router.push('/');
  }, [router, API_ORIGIN]);

  useEffect(() => {
    window.addEventListener('message', handleSocialMessage);
    return () => window.removeEventListener('message', handleSocialMessage);
  }, [handleSocialMessage]);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const data = await authService.login({ email, matkhau });
      setToken(data.data.access_token);
      setUser(data.data.user);
      router.push('/');
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { detail?: string } } };
      setError(axiosErr.response?.data?.detail || 'Sai email hoặc mật khẩu');
    } finally {
      setLoading(false);
    }
  }

  async function handleSendCode() {
    if (!email) { setError('Vui lòng nhập email'); return; }
    setLoading(true);
    setError('');
    try {
      await authService.sendVerificationCode(email);
      setSuccess('Mã xác thực đã được gửi đến email của bạn');
      setRegisterStep('verify');
      let sec = 60;
      setCountdown(sec);
      const timer = setInterval(() => {
        sec--;
        setCountdown(sec);
        if (sec <= 0) clearInterval(timer);
      }, 1000);
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { detail?: string } } };
      setError(axiosErr.response?.data?.detail || 'Gửi mã thất bại');
    } finally {
      setLoading(false);
    }
  }

  async function handleVerifyCode() {
    if (!code) { setError('Vui lòng nhập mã xác thực'); return; }
    setLoading(true);
    setError('');
    try {
      await authService.verifyCode(email, code);
      setSuccess('Xác thực email thành công');
      setRegisterStep('password');
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { detail?: string } } };
      setError(axiosErr.response?.data?.detail || 'Mã xác thực không đúng');
    } finally {
      setLoading(false);
    }
  }

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    if (!ten || !matkhau) { setError('Vui lòng nhập đầy đủ thông tin'); return; }
    if (matkhau.length < 6) { setError('Mật khẩu phải có ít nhất 6 ký tự'); return; }
    setLoading(true);
    setError('');
    try {
      const data = await authService.registerWithEmail({ ten, email, matkhau });
      setToken(data.data.access_token);
      setUser(data.data.user);
      router.push('/');
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { detail?: string } } };
      setError(axiosErr.response?.data?.detail || 'Đăng ký thất bại');
    } finally {
      setLoading(false);
    }
  }

  function handleSocialLogin(provider: 'google' | 'facebook') {
    window.open(
      `${API_ORIGIN}/api/auth/${provider}/redirect`,
      '_blank',
      'width=600,height=700'
    );
  }

  function resetRegister() {
    setRegisterStep('form');
    setCode('');
    setTen('');
    setMatkhau('');
    setSuccess('');
    setError('');
  }

  const inputClass = 'w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-[14px] text-slate-900 outline-none placeholder:text-slate-400 transition focus:border-[#3b82f6] focus:bg-white focus:ring-2 focus:ring-[#3b82f6]/20 dark:border-slate-700 dark:bg-[#0f172a] dark:text-slate-200 dark:placeholder:text-slate-500 dark:focus:bg-[#0f172a]';

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-slate-100 px-5 py-8 dark:from-[#0b1120] dark:to-[#0f172a]">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="rounded-3xl bg-white p-6 shadow-[0_8px_40px_rgba(0,0,0,0.08)] sm:p-8 dark:bg-[#111a2e]">
          {/* Logo + Title */}
          <div className="mb-8 text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-600 shadow-[0_4px_16px_rgba(59,130,246,0.4)]">
              <Utensils className="h-7 w-7 text-white" />
            </div>
            <h1 className="text-[24px] font-black text-slate-900 dark:text-white">
              {mode === 'login' ? 'Đăng nhập' : 'Tạo tài khoản'}
            </h1>
            <p className="mt-1 text-[14px] text-slate-500 dark:text-slate-400">
              {mode === 'login' ? 'Chào mừng trở lại!' : 'Khám phá ẩm thực Việt Nam'}
            </p>
          </div>

          {error && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-4 rounded-xl bg-red-50 p-3 text-[13px] font-medium text-red-600 dark:bg-red-900/40 dark:text-red-400"
            >
              {error}
            </motion.div>
          )}
          {success && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-4 rounded-xl bg-green-50 p-3 text-[13px] font-medium text-green-600 dark:bg-green-900/40 dark:text-green-400"
            >
              {success}
            </motion.div>
          )}

          {/* Social Login */}
          {mode === 'login' && (
            <div className="mb-6 space-y-3">
              <button
                type="button"
                onClick={() => handleSocialLogin('google')}
                className="flex w-full items-center justify-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 text-[14px] font-semibold text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:bg-[#111a2e] dark:text-slate-300 dark:hover:bg-[#0f172a]"
              >
                <svg className="h-5 w-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Tiếp tục với Google
              </button>
              <button
                type="button"
                onClick={() => handleSocialLogin('facebook')}
                className="flex w-full items-center justify-center gap-3 rounded-xl bg-[#1877F2] px-4 py-3 text-[14px] font-semibold text-white transition hover:bg-[#166fe5]"
              >
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
                Tiếp tục với Facebook
              </button>
            </div>
          )}

          {/* Divider */}
          {mode === 'login' && (
            <div className="mb-6 flex items-center gap-3">
              <div className="flex-1 border-t border-slate-200 dark:border-slate-700" />
              <span className="text-[12px] font-medium text-slate-400 dark:text-slate-500">hoặc</span>
              <div className="flex-1 border-t border-slate-200 dark:border-slate-700" />
            </div>
          )}

          {/* Login Form */}
          {mode === 'login' ? (
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="mb-1.5 block text-[13px] font-semibold text-slate-700 dark:text-slate-300">Email</label>
                <div className="flex items-center gap-2.5 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 focus-within:border-blue-400 focus-within:bg-white dark:border-slate-700 dark:bg-[#0f172a] dark:focus-within:bg-[#0f172a]">
                  <Mail className="h-4 w-4 text-slate-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-transparent text-[14px] text-slate-900 outline-none placeholder:text-slate-400 dark:text-slate-200 dark:placeholder:text-slate-500"
                    placeholder="email@example.com"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="mb-1.5 block text-[13px] font-semibold text-slate-700 dark:text-slate-300">Mật khẩu</label>
                <div className="flex items-center gap-2.5 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 focus-within:border-blue-400 focus-within:bg-white dark:border-slate-700 dark:bg-[#0f172a] dark:focus-within:bg-[#0f172a]">
                  <Lock className="h-4 w-4 text-slate-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={matkhau}
                    onChange={(e) => setMatkhau(e.target.value)}
                    className="w-full bg-transparent text-[14px] text-slate-900 outline-none placeholder:text-slate-400 dark:text-slate-200 dark:placeholder:text-slate-500"
                    placeholder="••••••••"
                    required
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300">
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-xl bg-blue-600 py-3 text-[14px] font-bold text-white shadow-[0_4px_14px_rgba(59,130,246,0.4)] transition hover:bg-blue-700 disabled:opacity-60"
              >
                {loading ? <Loader2 className="mx-auto h-5 w-5 animate-spin" /> : 'Đăng nhập'}
              </button>
            </form>
          ) : (
            <>
              {/* Back button (not on first step) */}
              {registerStep !== 'form' && (
                <button
                  type="button"
                  onClick={resetRegister}
                  className="mb-4 flex items-center gap-1.5 text-[13px] font-medium text-slate-500 transition hover:text-slate-800 dark:text-slate-400 dark:hover:text-white"
                >
                  <ArrowLeft className="h-4 w-4" /> Quay lại
                </button>
              )}

              <AnimatePresence mode="wait">
                {/* Step 1: Enter email */}
                {registerStep === 'form' && (
                  <motion.div
                    key="step-form"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-4"
                  >
                    <div>
<label className="mb-1.5 block text-[13px] font-semibold text-slate-700 dark:text-slate-300">Email</label>
                      <div className="flex items-center gap-2.5 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 focus-within:border-blue-400 focus-within:bg-white dark:border-slate-700 dark:bg-[#0f172a] dark:focus-within:bg-[#0f172a]">
                        <Mail className="h-4 w-4 text-slate-400" />
                        <input
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="w-full bg-transparent text-[14px] text-slate-900 outline-none placeholder:text-slate-400 dark:text-slate-200 dark:placeholder:text-slate-500"
                          placeholder="email@example.com"
                          required
                        />
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={handleSendCode}
                      disabled={loading || !email}
                      className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 py-3 text-[14px] font-bold text-white shadow-[0_4px_14px_rgba(59,130,246,0.4)] transition hover:bg-blue-700 disabled:opacity-60"
                    >
                      {loading ? (
                        <Loader2 className="h-5 w-5 animate-spin" />
                      ) : (
                        <Send className="h-4 w-4" />
                      )}
                      Gửi mã xác thực
                    </button>
                    <p className="text-center text-[12px] text-slate-400 dark:text-slate-500">
                      Mã xác thực sẽ được gửi đến email của bạn
                    </p>
                  </motion.div>
                )}

                {/* Step 2: Verify code */}
                {registerStep === 'verify' && (
                  <motion.div
                    key="step-verify"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-4"
                  >
                    <div className="text-center">
                      <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-green-100 dark:bg-green-900/40">
                        <Mail className="h-7 w-7 text-green-600" />
                      </div>
                      <p className="text-[14px] font-medium text-slate-700 dark:text-slate-300">Nhập mã xác thực</p>
                      <p className="text-[12px] text-slate-400 dark:text-slate-500">Mã đã được gửi đến {email}</p>
                    </div>
                    <div>
                      <input
                        value={code}
                        onChange={(e) => setCode(e.target.value)}
                        className={`${inputClass} text-center text-[20px] tracking-[8px] font-bold`}
                        placeholder="000000"
                        maxLength={6}
                        autoFocus
                      />
                    </div>
                    <button
                      type="button"
                      onClick={handleVerifyCode}
                      disabled={loading || code.length < 6}
                      className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 py-3 text-[14px] font-bold text-white shadow-[0_4px_14px_rgba(59,130,246,0.4)] transition hover:bg-blue-700 disabled:opacity-60"
                    >
                      {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Check className="h-4 w-4" />}
                      Xác thực
                    </button>
                    <div className="text-center">
                      {countdown > 0 ? (
                        <span className="text-[12px] text-slate-400 dark:text-slate-500">Gửi lại mã sau {countdown}s</span>
                      ) : (
                        <button
                          type="button"
                          onClick={handleSendCode}
                          className="text-[13px] font-medium text-blue-600 hover:underline"
                        >
                          Gửi lại mã
                        </button>
                      )}
                    </div>
                  </motion.div>
                )}

                {/* Step 3: Set password */}
                {registerStep === 'password' && (
                  <motion.form
                    key="step-password"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    onSubmit={handleRegister}
                    className="space-y-4"
                  >
                    <div>
                      <label className="mb-1.5 block text-[13px] font-semibold text-slate-700 dark:text-slate-300">Tên của bạn</label>
                      <div className="flex items-center gap-2.5 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 focus-within:border-blue-400 focus-within:bg-white dark:border-slate-700 dark:bg-[#0f172a] dark:focus-within:bg-[#0f172a]">
                        <User className="h-4 w-4 text-slate-400" />
                        <input
                          value={ten}
                          onChange={(e) => setTen(e.target.value)}
                          className="w-full bg-transparent text-[14px] text-slate-900 outline-none placeholder:text-slate-400 dark:text-slate-200 dark:placeholder:text-slate-500"
                          placeholder="Nguyen Van A"
                          required
                        />
                      </div>
                    </div>
                    <div>
                      <label className="mb-1.5 block text-[13px] font-semibold text-slate-700 dark:text-slate-300">Mật khẩu</label>
                      <div className="flex items-center gap-2.5 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 focus-within:border-blue-400 focus-within:bg-white dark:border-slate-700 dark:bg-[#0f172a] dark:focus-within:bg-[#0f172a]">
                        <Lock className="h-4 w-4 text-slate-400" />
                        <input
                          type={showPassword ? 'text' : 'password'}
                          value={matkhau}
                          onChange={(e) => setMatkhau(e.target.value)}
                          className="w-full bg-transparent text-[14px] text-slate-900 outline-none placeholder:text-slate-400 dark:text-slate-200 dark:placeholder:text-slate-500"
                          placeholder="Ít nhất 6 ký tự"
                          required
                          minLength={6}
                        />
                        <button type="button" onClick={() => setShowPassword(!showPassword)} className="text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300">
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>
                    <button
                      type="submit"
                      disabled={loading}
                      className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 py-3 text-[14px] font-bold text-white shadow-[0_4px_14px_rgba(59,130,246,0.4)] transition hover:bg-blue-700 disabled:opacity-60"
                    >
                      {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : null}
                      Hoàn tất đăng ký
                    </button>
                  </motion.form>
                )}
              </AnimatePresence>
            </>
          )}

          {/* Toggle mode */}
          <div className="mt-6 text-center text-[13px] text-slate-500 dark:text-slate-400">
            {mode === 'login' ? (
              <>
                Chưa có tài khoản?{' '}
                <button onClick={() => { setMode('register'); resetRegister(); }} className="font-semibold text-blue-600 hover:underline">
                  Đăng ký ngay
                </button>
              </>
            ) : (
              <>
                Đã có tài khoản?{' '}
                <button onClick={() => setMode('login')} className="font-semibold text-blue-600 hover:underline">
                  Đăng nhập
                </button>
              </>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
