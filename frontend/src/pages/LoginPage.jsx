import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import {
  HiShieldCheck,
  HiOutlineEnvelope,
  HiOutlineLockClosed,
  HiArrowRight,
  HiBriefcase,
  HiUser,
  HiKey,
  HiCheckCircle,
  HiXMark,
  HiSparkles
} from 'react-icons/hi2';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import toast from 'react-hot-toast';

export default function LoginPage() {
  const navigate = useNavigate();
  const { login, isAuthenticated, user } = useAuth();
  const [activeRole, setActiveRole] = useState('admin'); // 'admin' | 'employee'
  const [isLoading, setIsLoading] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Forgot password modal states
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotStep, setForgotStep] = useState(1); // 1: Send Code, 2: Verify Code & Reset Pass
  const [resetEmail, setResetEmail] = useState('');
  const [resetCode, setResetCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSendingCode, setIsSendingCode] = useState(false);
  const [isResettingPass, setIsResettingPass] = useState(false);
  const [devOtpPreview, setDevOtpPreview] = useState('');

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: {
      email: '',
      password: '',
    },
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated && user) {
      const roleRedirects = {
        admin: '/admin/dashboard',
        employee: '/employee/dashboard',
        student: '/student/register',
      };
      navigate(roleRedirects[user.role] || '/admin/dashboard', { replace: true });
    }
  }, [isAuthenticated, user, navigate]);

  const onSubmit = async (data) => {
    setIsLoading(true);
    try {
      const userData = await login(data.email, data.password, activeRole);
      const roleRedirects = {
        admin: '/admin/dashboard',
        employee: '/employee/dashboard',
        student: '/student/register',
      };
      navigate(roleRedirects[userData.role] || '/admin/dashboard', { replace: true });
    } catch (error) {
      // Error toast handled by AuthContext
    } finally {
      setIsLoading(false);
    }
  };

  // Open Forgot Password Modal (Admin only)
  const openForgotPassword = () => {
    const currentEmail = watch('email') || '';
    setResetEmail(currentEmail);
    setForgotStep(1);
    setResetCode('');
    setNewPassword('');
    setConfirmPassword('');
    setDevOtpPreview('');
    setShowForgotModal(true);
  };

  // Step 1: Send OTP verification code to Admin email
  const handleSendCode = async (e) => {
    e.preventDefault();
    if (!resetEmail || !resetEmail.includes('@')) {
      toast.error('Please enter a valid Admin email address');
      return;
    }

    setIsSendingCode(true);
    try {
      const response = await api.post('/auth/forgot-password', { email: resetEmail });
      toast.success(response.data.message || 'Verification code sent to your email!');
      if (response.data.code) {
        setDevOtpPreview(response.data.code);
      }
      setForgotStep(2);
    } catch (error) {
      const msg = error.response?.data?.message || 'Failed to send verification code.';
      toast.error(msg);
    } finally {
      setIsSendingCode(false);
    }
  };

  // Step 2: Confirm code and change password
  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (!resetCode || resetCode.trim().length !== 6) {
      toast.error('Please enter the 6-digit verification code sent to your email');
      return;
    }
    if (!newPassword || newPassword.length < 6) {
      toast.error('New password must be at least 6 characters');
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }

    setIsResettingPass(true);
    try {
      const response = await api.post('/auth/reset-password', {
        email: resetEmail,
        code: resetCode,
        newPassword
      });

      toast.success(response.data.message || 'Password reset successfully!');
      
      // Update login form credentials
      setValue('email', resetEmail, { shouldValidate: true });
      setValue('password', newPassword, { shouldValidate: true });

      setShowForgotModal(false);
    } catch (error) {
      const msg = error.response?.data?.message || 'Password reset failed. Please check your verification code.';
      toast.error(msg);
    } finally {
      setIsResettingPass(false);
    }
  };
  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-gradient-to-br from-ocean-950 via-ocean-900 to-ocean-950">
      {/* Decorative blurred background circles */}
      <div className="absolute top-[-10%] left-[-5%] w-[500px] h-[500px] rounded-full bg-ocean-500/15 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-15%] right-[-10%] w-[600px] h-[600px] rounded-full bg-ocean-600/15 blur-[140px] pointer-events-none" />
      <div className="absolute top-[40%] right-[20%] w-[300px] h-[300px] rounded-full bg-ocean-400/10 blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[30%] left-[10%] w-[250px] h-[250px] rounded-full bg-sky-400/10 blur-[80px] pointer-events-none" />

      {/* Grid pattern overlay */}
      <div
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
          backgroundSize: '60px 60px',
        }}
      />

      {/* Login Card */}
      <div
        className={`relative z-10 w-full max-w-md mx-4 transition-all duration-500 ease-out ${
          mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
        }`}
      >
        {/* Branding Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-ocean-500 to-ocean-700 shadow-lg shadow-ocean-600/30 mb-3">
            <HiShieldCheck className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-heading font-extrabold text-white tracking-wide">JENOVATE</h1>
          <p className="text-ocean-200/80 text-xs font-semibold mt-0.5 tracking-widest uppercase">
            Verification System
          </p>
        </div>

        {/* Main Card */}
        <div className="bg-white/[0.07] backdrop-blur-2xl border border-white/[0.12] rounded-3xl p-6 md:p-8 shadow-2xl shadow-black/40">
          
          {/* Role Filter Tabs (Login as Admin / Login as Employee) */}
          <div className="mb-6">
            <label className="block text-[11px] font-bold uppercase tracking-wider text-ocean-200/90 mb-2">
              Select Login Role
            </label>
            <div className="grid grid-cols-2 gap-2 p-1.5 bg-black/30 border border-white/10 rounded-2xl">
              <button
                type="button"
                id="tab-login-admin"
                onClick={() => setActiveRole('admin')}
                className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-bold transition-all duration-200 ${
                  activeRole === 'admin'
                    ? 'bg-gradient-to-r from-ocean-500 to-ocean-600 text-white shadow-md shadow-ocean-600/40 border border-ocean-400/30'
                    : 'text-gray-300 hover:text-white hover:bg-white/5'
                }`}
              >
                <HiUser className="w-4 h-4" />
                <span>Login as Admin</span>
              </button>

              <button
                type="button"
                id="tab-login-employee"
                onClick={() => setActiveRole('employee')}
                className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-bold transition-all duration-200 ${
                  activeRole === 'employee'
                    ? 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-white shadow-md shadow-emerald-600/40 border border-emerald-400/30'
                    : 'text-gray-300 hover:text-white hover:bg-white/5'
                }`}
              >
                <HiBriefcase className="w-4 h-4" />
                <span>Login as Employee</span>
              </button>
            </div>
          </div>

          <div className="mb-5 pb-3 border-b border-white/10 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-heading font-bold text-white flex items-center gap-2">
                <span>{activeRole === 'admin' ? 'Admin Authentication' : 'Employee Access Portal'}</span>
              </h2>
              <p className="text-xs text-gray-300 mt-0.5">
                {activeRole === 'admin'
                  ? 'Sign in with administrator privileges'
                  : 'Sign in with staff/employee credentials'}
              </p>
            </div>
            <span
              className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                activeRole === 'admin'
                  ? 'bg-ocean-500/20 text-ocean-300 border border-ocean-400/30'
                  : 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/30'
              }`}
            >
              {activeRole}
            </span>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" id="login-form">
            {/* Email Field */}
            <div>
              <label htmlFor="login-email" className="block text-xs font-semibold text-gray-300 mb-1.5 uppercase tracking-wider">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <HiOutlineEnvelope className="w-5 h-5 text-gray-400" />
                </div>
                <input
                  id="login-email"
                  type="email"
                  autoComplete="email"
                  className={`w-full pl-11 pr-4 py-3 bg-white/[0.06] border rounded-xl text-sm text-white placeholder-gray-400 transition-all duration-200 focus:outline-none focus:ring-2 ${
                    activeRole === 'admin' ? 'focus:ring-ocean-400/40 focus:border-ocean-300' : 'focus:ring-emerald-400/40 focus:border-emerald-300'
                  } ${
                    errors.email
                      ? 'border-red-400/60 focus:ring-red-500/40 focus:border-red-400/60'
                      : 'border-white/[0.12] hover:border-white/[0.25]'
                  }`}
                  {...register('email', {
                    required: 'Email is required',
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: 'Please enter a valid email address',
                    },
                  })}
                />
              </div>
              {errors.email && (
                <p className="text-xs text-red-400 mt-1.5 flex items-center gap-1">
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-red-400" />
                  {errors.email.message}
                </p>
              )}
            </div>

            {/* Password Field */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label htmlFor="login-password" className="block text-xs font-semibold text-gray-300 uppercase tracking-wider">
                  Password
                </label>
                
                {/* FORGOT PASSWORD BUTTON - ADMIN ONLY */}
                {activeRole === 'admin' && (
                  <button
                    type="button"
                    id="btn-forgot-password-admin"
                    onClick={openForgotPassword}
                    className="text-xs font-semibold text-ocean-300 hover:text-white flex items-center gap-1 transition-colors hover:underline"
                  >
                    <HiKey className="w-3.5 h-3.5" /> Forgot Password?
                  </button>
                )}
              </div>

              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <HiOutlineLockClosed className="w-5 h-5 text-gray-400" />
                </div>
                <input
                  id="login-password"
                  type="password"
                  autoComplete="current-password"
                  className={`w-full pl-11 pr-4 py-3 bg-white/[0.06] border rounded-xl text-sm text-white placeholder-gray-400 transition-all duration-200 focus:outline-none focus:ring-2 ${
                    activeRole === 'admin' ? 'focus:ring-ocean-400/40 focus:border-ocean-300' : 'focus:ring-emerald-400/40 focus:border-emerald-300'
                  } ${
                    errors.password
                      ? 'border-red-400/60 focus:ring-red-500/40 focus:border-red-400/60'
                      : 'border-white/[0.12] hover:border-white/[0.25]'
                  }`}
                  {...register('password', {
                    required: 'Password is required',
                    minLength: {
                      value: 6,
                      message: 'Password must be at least 6 characters',
                    },
                  })}
                />
              </div>
              {errors.password && (
                <p className="text-xs text-red-400 mt-1.5 flex items-center gap-1">
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-red-400" />
                  {errors.password.message}
                </p>
              )}
            </div>

            {/* Login Submit Button */}
            <button
              id="login-submit-btn"
              type="submit"
              disabled={isLoading}
              className={`w-full flex items-center justify-center gap-2 py-3 px-4 text-white font-semibold text-sm rounded-xl transition-all duration-200 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 ${
                activeRole === 'admin'
                  ? 'bg-ocean-600 hover:bg-ocean-500 shadow-ocean-600/30 focus:ring-ocean-400/50'
                  : 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-600/30 focus:ring-emerald-400/50'
              }`}
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Authenticating ({activeRole})...</span>
                </>
              ) : (
                <>
                  <span>Sign In as {activeRole === 'admin' ? 'Admin' : 'Employee'}</span>
                  <HiArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Footer Notice */}
          <div className="mt-5 pt-4 border-t border-white/[0.08] text-center">
            <p className="text-xs text-gray-400">
              Authorized personnel only. All access attempts logged.
            </p>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-gray-400/80 mt-6">
          © {new Date().getFullYear()} Jenovate Technologies. All rights reserved.
        </p>
      </div>

      {/* FORGOT PASSWORD MODAL (ADMIN ONLY) */}
      {showForgotModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-fade-in">
          <div className="bg-ocean-950 border border-white/20 rounded-3xl p-6 md:p-8 max-w-md w-full shadow-2xl text-white relative">
            <button
              type="button"
              onClick={() => setShowForgotModal(false)}
              className="absolute top-4 right-4 p-2 rounded-xl text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
            >
              <HiXMark className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-2xl bg-ocean-500/20 border border-ocean-400/30 flex items-center justify-center text-ocean-300">
                <HiKey className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold font-heading text-white">Reset Admin Password</h3>
                <p className="text-xs text-ocean-200/80">Step {forgotStep} of 2: {forgotStep === 1 ? 'Request Code' : 'Confirm & Set Password'}</p>
              </div>
            </div>

            {/* STEP 1: REQUEST VERIFICATION CODE */}
            {forgotStep === 1 && (
              <form onSubmit={handleSendCode} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-gray-300 mb-1.5">
                    Registered Admin Email
                  </label>
                  <input
                    type="email"
                    required
                    value={resetEmail}
                    onChange={(e) => setResetEmail(e.target.value)}
                    className="w-full px-4 py-3 bg-white/5 border border-white/15 rounded-xl text-sm text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-ocean-400/40 focus:border-ocean-300"
                  />
                  <p className="text-[11px] text-gray-400 mt-1.5">
                    A 6-digit verification code will be sent to this admin email address.
                  </p>
                </div>

                <div className="flex items-center justify-end gap-3 pt-3">
                  <button
                    type="button"
                    onClick={() => setShowForgotModal(false)}
                    className="px-4 py-2.5 rounded-xl text-xs font-semibold text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSendingCode}
                    className="flex items-center gap-2 px-5 py-2.5 bg-ocean-600 hover:bg-ocean-500 text-white rounded-xl text-xs font-bold transition-all shadow-lg shadow-ocean-600/30 disabled:opacity-50"
                  >
                    {isSendingCode ? 'Sending Code...' : 'Send Verification Code'}
                  </button>
                </div>
              </form>
            )}

            {/* STEP 2: VERIFY CODE & SET NEW PASSWORD */}
            {forgotStep === 2 && (
              <form onSubmit={handleResetPassword} className="space-y-4">
                {devOtpPreview && (
                  <div className="p-3 bg-ocean-500/20 border border-ocean-400/40 rounded-xl text-xs text-ocean-200 flex items-center justify-between">
                    <span className="flex items-center gap-1.5 font-semibold">
                      <HiSparkles className="w-4 h-4 text-amber-400" /> Dev Verification Code:
                    </span>
                    <span className="font-mono font-bold tracking-widest text-white bg-black/40 px-2 py-0.5 rounded border border-white/20">
                      {devOtpPreview}
                    </span>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-gray-300 mb-1.5">
                    6-Digit Verification Code *
                  </label>
                  <input
                    type="text"
                    maxLength={6}
                    required
                    value={resetCode}
                    onChange={(e) => setResetCode(e.target.value)}
                    className="w-full px-4 py-3 bg-white/5 border border-white/15 rounded-xl text-center text-lg font-mono tracking-widest text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-ocean-400/40 focus:border-ocean-300"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-gray-300 mb-1.5">
                    New Password *
                  </label>
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full px-4 py-3 bg-white/5 border border-white/15 rounded-xl text-sm text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-ocean-400/40 focus:border-ocean-300"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-gray-300 mb-1.5">
                    Confirm New Password *
                  </label>
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full px-4 py-3 bg-white/5 border border-white/15 rounded-xl text-sm text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-ocean-400/40 focus:border-ocean-300"
                  />
                </div>

                <div className="flex items-center justify-between pt-3">
                  <button
                    type="button"
                    onClick={() => setForgotStep(1)}
                    className="text-xs font-semibold text-ocean-300 hover:text-white transition-colors"
                  >
                    ← Back / Resend Code
                  </button>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setShowForgotModal(false)}
                      className="px-3 py-2 rounded-xl text-xs font-semibold text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isResettingPass}
                      className="flex items-center gap-1.5 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-all shadow-lg shadow-emerald-600/30 disabled:opacity-50"
                    >
                      <HiCheckCircle className="w-4 h-4" />
                      {isResettingPass ? 'Updating...' : 'Confirm & Change Password'}
                    </button>
                  </div>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
