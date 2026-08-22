import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { HiShieldCheck, HiOutlineEnvelope, HiOutlineLockClosed, HiArrowRight } from 'react-icons/hi2';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
  const navigate = useNavigate();
  const { login, isAuthenticated, user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [mounted, setMounted] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
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
      const userData = await login(data.email, data.password);
      const roleRedirects = {
        admin: '/admin/dashboard',
        employee: '/employee/dashboard',
        student: '/student/register',
      };
      navigate(roleRedirects[userData.role] || '/admin/dashboard', { replace: true });
    } catch (error) {
      // Error toast is handled by AuthContext
    } finally {
      setIsLoading(false);
    }
  };

  const fillDemoAccount = (email, password) => {
    setValue('email', email, { shouldValidate: true });
    setValue('password', password, { shouldValidate: true });
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-white">
      {/* Decorative blurred circles */}
      <div className="absolute top-[-10%] left-[-5%] w-[500px] h-[500px] rounded-full bg-primary-100/50 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-15%] right-[-10%] w-[600px] h-[600px] rounded-full bg-primary-100/40 blur-[140px] pointer-events-none" />
      <div className="absolute top-[40%] right-[20%] w-[300px] h-[300px] rounded-full bg-primary-50/60 blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[30%] left-[10%] w-[250px] h-[250px] rounded-full bg-primary-100/30 blur-[80px] pointer-events-none" />

      {/* Subtle grid pattern overlay */}
      <div
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: `linear-gradient(rgba(67,140,169,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(67,140,169,0.06) 1px, transparent 1px)`,
          backgroundSize: '60px 60px',
        }}
      />

      {/* Login Card */}
      <div
        className={`relative z-10 w-full max-w-md mx-4 transition-all duration-700 ease-out ${
          mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
        }`}
      >
        {/* Branding */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary-700 shadow-md shadow-primary-900/15 mb-4">
            <HiShieldCheck className="w-9 h-9 text-white" />
          </div>
          <h1 className="text-3xl font-semibold text-primary-950 tracking-tight">JENOVATE</h1>
          <p className="text-primary-700 text-sm font-medium mt-1 tracking-widest uppercase">
            Verification System
          </p>
        </div>

        {/* Glass Card */}
        <div className="bg-white/95 backdrop-blur-2xl border border-slate-200 rounded-2xl p-8 shadow-elevated">
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-primary-950">Welcome back</h2>
            <p className="text-sm text-gray-400 mt-1">Sign in to your account to continue</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" id="login-form">
            {/* Email Field */}
            <div>
              <label htmlFor="login-email" className="block text-sm font-medium text-gray-300 mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <HiOutlineEnvelope className="w-5 h-5 text-gray-500" />
                </div>
                <input
                  id="login-email"
                  type="email"
                  autoComplete="email"
                  placeholder="you@jenovate.com"
                  className={`w-full pl-11 pr-4 py-3 bg-white border rounded-xl text-sm text-slate-800 placeholder-gray-400 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary-200 focus:border-primary-500 ${
                    errors.email
                      ? 'border-red-400/60 focus:ring-red-500/40 focus:border-red-400/60'
                      : 'border-slate-200 hover:border-primary-300'
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
                <p className="text-xs text-red-600 mt-1.5 flex items-center gap-1">
                  <span className="inline-block w-1 h-1 rounded-full bg-red-400" />
                  {errors.email.message}
                </p>
              )}
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="login-password" className="block text-sm font-medium text-gray-300 mb-1.5">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <HiOutlineLockClosed className="w-5 h-5 text-gray-500" />
                </div>
                <input
                  id="login-password"
                  type="password"
                  autoComplete="current-password"
                  placeholder="Enter your password"
                  className={`w-full pl-11 pr-4 py-3 bg-white border rounded-xl text-sm text-slate-800 placeholder-gray-400 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary-200 focus:border-primary-500 ${
                    errors.password
                      ? 'border-red-400/60 focus:ring-red-500/40 focus:border-red-400/60'
                      : 'border-slate-200 hover:border-primary-300'
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
                <p className="text-xs text-red-600 mt-1.5 flex items-center gap-1">
                  <span className="inline-block w-1 h-1 rounded-full bg-red-400" />
                  {errors.password.message}
                </p>
              )}
            </div>

            {/* Quick Demo Login Credentials */}
            <div className="pt-2">
              <p className="text-xs font-medium text-gray-400 mb-2">Quick Demo Fill:</p>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => fillDemoAccount('admin@jenovate.com', 'Admin@123')}
                  className="py-1.5 px-3 bg-sky-50 hover:bg-sky-100 border border-sky-200 rounded-lg text-xs text-primary-700 font-medium transition text-center"
                >
                  Admin Demo
                </button>
                <button
                  type="button"
                  onClick={() => fillDemoAccount('employee@jenovate.com', 'Employee@123')}
                  className="py-1.5 px-3 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg text-xs text-emerald-700 font-medium transition text-center"
                >
                  Employee Demo
                </button>
              </div>
            </div>

            {/* Login Button */}
            <button
              id="login-submit-btn"
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-primary-700 hover:bg-primary-600 text-white font-semibold text-sm rounded-xl transition-all duration-200 shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-none focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:ring-offset-2 focus:ring-offset-transparent"
            >
              {isLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Signing in...</span>
                </>
              ) : (
                <>
                  <span>Sign In</span>
                  <HiArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="mt-6 pt-6 border-t border-slate-200 text-center">
            <p className="text-xs text-gray-500">
              Authorized personnel only. All access is logged and monitored.
            </p>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-slate-400 mt-6">
          © {new Date().getFullYear()} Jenovate Technologies. All rights reserved.
        </p>
      </div>
    </div>
  );
}
