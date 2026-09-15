import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { NeuroForgeLogo } from '../../components/common/NeuroForgeLogo';
import {
  Lock,
  Mail,
  Eye,
  EyeOff,
  AlertCircle,
  Activity,
  ArrowRight,
  CheckCircle2,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [serverError, setServerError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const [showForgotPasswordModal, setShowForgotPasswordModal] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotSuccess, setForgotSuccess] = useState(false);

  const validate = (): boolean => {
    let valid = true;
    setEmailError('');
    setPasswordError('');
    setServerError('');

    if (!email.trim()) {
      setEmailError('Email is required');
      valid = false;
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email.trim())) {
        setEmailError('Invalid email format');
        valid = false;
      }
    }

    if (!password) {
      setPasswordError('Password is required');
      valid = false;
    }

    return valid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    try {
      const authUser = await login(email.trim(), password);
      
      // Auto redirect based on authenticated user's role
      const role = authUser.role ? authUser.role.toUpperCase() : '';
      if (role === 'ADMIN') {
        navigate('/admin/dashboard');
      } else if (role === 'PROJECT_MANAGER' || role === 'PROJECT MANAGER') {
        navigate('/pm/dashboard');
      } else if (role === 'DEVELOPER') {
        navigate('/developer/dashboard');
      } else if (role === 'TESTER') {
        navigate('/tester/dashboard');
      } else if (role === 'DEVOPS_ENGINEER' || role === 'DEVOPS') {
        navigate('/devops/dashboard');
      } else if (role === 'CLIENT') {
        navigate('/client/dashboard');
      } else {
        navigate('/dashboard');
      }
    } catch (err: any) {
      if (err.message?.includes('Network Error') || err.message?.includes('Failed to fetch')) {
        setServerError('Unable to connect to server. Please check backend connection.');
      } else {
        setServerError(err.message || 'Invalid email or password');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleForgotPasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotEmail.trim()) return;
    setForgotSuccess(true);
    setTimeout(() => {
      setShowForgotPasswordModal(false);
      setForgotSuccess(false);
      setForgotEmail('');
    }, 2000);
  };

  return (
    <div className="relative z-10 min-h-screen text-slate-800 flex flex-col justify-center py-12 sm:px-6 lg:px-8 selection:bg-indigo-500 selection:text-white">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <Link
          to="/"
          className="inline-block cursor-pointer text-center focus:outline-none hover:opacity-90 transition-opacity"
          title="Return to Home Landing Page"
        >
          <NeuroForgeLogo size="lg" subtitle="ENTERPRISE SDLC PLATFORM" />
        </Link>

        <h2 className="mt-6 text-3xl font-extrabold text-slate-900 tracking-tight">Welcome Back</h2>
        <p className="mt-2 text-sm text-slate-500 font-medium">
          Sign in to access your role-based SDLC & DevOps workspace
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4">
        <div className="bg-white py-8 px-6 sm:px-10 rounded-3xl border border-slate-200 shadow-xl shadow-slate-200/50">
          {serverError && (
            <div className="mb-6 p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center space-x-3">
              <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
              <span>{serverError}</span>
            </div>
          )}

          <form className="space-y-6" onSubmit={handleSubmit}>
            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Email Address
              </label>
              <div className="relative rounded-xl shadow-xs">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="text"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (emailError) setEmailError('');
                  }}
                  placeholder="Enter email address"
                  className={`w-full pl-10 pr-4 py-3 rounded-xl border text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none transition-colors ${
                    emailError ? 'border-rose-300 bg-rose-50/50 focus:border-rose-500' : 'border-slate-300 focus:border-indigo-600 bg-white'
                  }`}
                />
              </div>
              {emailError && <p className="mt-1.5 text-xs text-rose-600 font-medium flex items-center"><AlertCircle className="w-3.5 h-3.5 mr-1" />{emailError}</p>}
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Password
              </label>
              <div className="relative rounded-xl shadow-xs">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (passwordError) setPasswordError('');
                  }}
                  placeholder="••••••••"
                  className={`w-full pl-10 pr-10 py-3 rounded-xl border text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none transition-colors ${
                    passwordError ? 'border-rose-300 bg-rose-50/50 focus:border-rose-500' : 'border-slate-300 focus:border-indigo-600 bg-white'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {passwordError && <p className="mt-1.5 text-xs text-rose-600 font-medium flex items-center"><AlertCircle className="w-3.5 h-3.5 mr-1" />{passwordError}</p>}
            </div>

            {/* Options */}
            <div className="flex items-center justify-between text-xs">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 border-slate-300"
                />
                <span className="font-semibold text-slate-600">Remember me</span>
              </label>

              <button
                type="button"
                onClick={() => setShowForgotPasswordModal(true)}
                className="font-bold text-indigo-600 hover:text-indigo-700"
              >
                Forgot Password?
              </button>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-md shadow-indigo-600/25 transition-all flex items-center justify-center space-x-2 disabled:opacity-50"
            >
              {submitting ? (
                <>
                  <Activity className="w-4 h-4 animate-spin" />
                  <span>Authenticating...</span>
                </>
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Credentials Info */}
          <div className="mt-8 pt-5 border-t border-slate-200/80 text-xs">
            <div className="flex items-center justify-between mb-2">
              <span className="font-extrabold text-slate-500 uppercase tracking-wider text-[10px]">
                DEMO USER CREDENTIALS (SAMPLE TESTING)
              </span>
              <span className="text-[10px] text-indigo-600 font-bold">Click to Auto-fill</span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-[11px]">
              <button
                type="button"
                onClick={() => { setEmail('admin@example.com'); setPassword('test_password'); }}
                className="p-2.5 rounded-xl bg-slate-50 hover:bg-indigo-50 border border-slate-200 hover:border-indigo-300 text-left transition-all group"
              >
                <div className="font-extrabold text-slate-900 group-hover:text-indigo-600">ADMIN</div>
                <div className="text-[10px] text-slate-500 truncate">admin@example.com</div>
              </button>
              <button
                type="button"
                onClick={() => { setEmail('manager@example.com'); setPassword('test_password'); }}
                className="p-2.5 rounded-xl bg-slate-50 hover:bg-indigo-50 border border-slate-200 hover:border-indigo-300 text-left transition-all group"
              >
                <div className="font-extrabold text-slate-900 group-hover:text-indigo-600">PROJECT MANAGER</div>
                <div className="text-[10px] text-slate-500 truncate">manager@example.com</div>
              </button>
              <button
                type="button"
                onClick={() => { setEmail('developer@example.com'); setPassword('test_password'); }}
                className="p-2.5 rounded-xl bg-slate-50 hover:bg-indigo-50 border border-slate-200 hover:border-indigo-300 text-left transition-all group"
              >
                <div className="font-extrabold text-slate-900 group-hover:text-indigo-600">DEVELOPER</div>
                <div className="text-[10px] text-slate-500 truncate">developer@example.com</div>
              </button>
              <button
                type="button"
                onClick={() => { setEmail('tester@example.com'); setPassword('test_password'); }}
                className="p-2.5 rounded-xl bg-slate-50 hover:bg-indigo-50 border border-slate-200 hover:border-indigo-300 text-left transition-all group"
              >
                <div className="font-extrabold text-slate-900 group-hover:text-indigo-600">TESTER</div>
                <div className="text-[10px] text-slate-500 truncate">tester@example.com</div>
              </button>
              <button
                type="button"
                onClick={() => { setEmail('devops@example.com'); setPassword('test_password'); }}
                className="p-2.5 rounded-xl bg-slate-50 hover:bg-indigo-50 border border-slate-200 hover:border-indigo-300 text-left transition-all group"
              >
                <div className="font-extrabold text-slate-900 group-hover:text-indigo-600">DEVOPS ENGINEER</div>
                <div className="text-[10px] text-slate-500 truncate">devops@example.com</div>
              </button>
              <button
                type="button"
                onClick={() => { setEmail('client@example.com'); setPassword('test_password'); }}
                className="p-2.5 rounded-xl bg-slate-50 hover:bg-indigo-50 border border-slate-200 hover:border-indigo-300 text-left transition-all group"
              >
                <div className="font-extrabold text-slate-900 group-hover:text-indigo-600">CLIENT</div>
                <div className="text-[10px] text-slate-500 truncate">client@example.com</div>
              </button>
            </div>
            <p className="mt-2.5 text-[10px] text-slate-400 font-mono text-center">Password for all demo accounts: <code className="font-bold text-slate-700 bg-slate-100 px-1.5 py-0.5 rounded">test_password</code></p>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100 text-center text-xs text-slate-600">
            Don't have an account?{' '}
            <Link
              to="/register"
              className="font-bold text-indigo-600 hover:text-indigo-700"
            >
              Create an Account
            </Link>
          </div>
        </div>
      </div>

      {/* Forgot Password Modal */}
      {showForgotPasswordModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full border border-slate-200 shadow-2xl">
            <h3 className="text-lg font-extrabold text-slate-900">Reset Password</h3>
            <p className="text-xs text-slate-500 mt-1">Enter your registered email address to receive password reset instructions.</p>

            {forgotSuccess ? (
              <div className="mt-4 p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold flex items-center space-x-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                <span>Password reset instructions sent to your email!</span>
              </div>
            ) : (
              <form onSubmit={handleForgotPasswordSubmit} className="mt-4 space-y-4">
                <div>
                  <input
                    type="email"
                    required
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    placeholder="Enter email address"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs focus:outline-none focus:border-indigo-600"
                  />
                </div>
                <div className="flex items-center justify-end space-x-2">
                  <button
                    type="button"
                    onClick={() => setShowForgotPasswordModal(false)}
                    className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-600/20"
                  >
                    Send Instructions
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
