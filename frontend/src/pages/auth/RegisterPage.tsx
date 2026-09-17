import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { NeuroForgeLogo } from '../../components/common/NeuroForgeLogo';
import {
  Lock,
  Mail,
  User,
  Eye,
  EyeOff,
  AlertCircle,
  Activity,
  ArrowRight,
  CheckCircle2,
  Briefcase,
} from 'lucide-react';
import { apiClient } from '../../services/api';

export const RegisterPage: React.FC = () => {
  const navigate = useNavigate();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState('');

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [fullNameError, setFullNameError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [confirmPasswordError, setConfirmPasswordError] = useState('');
  const [roleError, setRoleError] = useState('');
  const [serverError, setServerError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const [submitting, setSubmitting] = useState(false);

  const validate = (): boolean => {
    let valid = true;
    setFullNameError('');
    setEmailError('');
    setPasswordError('');
    setConfirmPasswordError('');
    setRoleError('');
    setServerError('');

    if (!fullName.trim()) {
      setFullNameError('Full Name is required');
      valid = false;
    }

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
    } else if (password.length < 6) {
      setPasswordError('Password must be at least 6 characters');
      valid = false;
    }

    if (!confirmPassword) {
      setConfirmPasswordError('Please confirm your password');
      valid = false;
    } else if (password !== confirmPassword) {
      setConfirmPasswordError('Passwords do not match');
      valid = false;
    }

    if (!role) {
      setRoleError('Role is required');
      valid = false;
    }

    return valid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    try {
      const response = await apiClient.post('/auth/register', {
        fullName: fullName.trim(),
        email: email.trim(),
        password,
        role,
      });

      setSuccessMessage(response.data.message || 'Account created successfully. Redirecting to login...');
      setTimeout(() => {
        navigate('/login');
      }, 1800);
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || 'Registration failed. Please try again.';
      setServerError(msg);
    } finally {
      setSubmitting(false);
    }
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

        <h2 className="mt-6 text-3xl font-extrabold text-slate-900 tracking-tight">Create an Account</h2>
        <p className="mt-2 text-sm text-slate-500 font-medium">
          Join Enterprise SDLC &amp; DevOps to access your role-based software development workspace
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4">
        <div className="bg-white py-8 px-6 sm:px-10 rounded-3xl border border-slate-200 shadow-xl shadow-slate-200/50">
          {successMessage && (
            <div className="mb-6 p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold flex items-center space-x-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}

          {serverError && (
            <div className="mb-6 p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center space-x-3">
              <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
              <span>{serverError}</span>
            </div>
          )}

          <form className="space-y-5" onSubmit={handleSubmit}>
            {/* Full Name */}
            <div>
              <label htmlFor="fullName" className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Full Name
              </label>
              <div className="relative rounded-xl shadow-xs">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <User className="w-4 h-4" />
                </div>
                <input
                  id="fullName"
                  type="text"
                  value={fullName}
                  onChange={(e) => {
                    setFullName(e.target.value);
                    if (fullNameError) setFullNameError('');
                  }}
                  placeholder="Enter full name"
                  className={`w-full pl-10 pr-4 py-2.5 rounded-xl border text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none transition-colors ${
                    fullNameError ? 'border-rose-300 bg-rose-50/50' : 'border-slate-300 focus:border-indigo-600'
                  }`}
                />
              </div>
              {fullNameError && <p className="mt-1 text-xs text-rose-600 font-medium flex items-center"><AlertCircle className="w-3.5 h-3.5 mr-1" />{fullNameError}</p>}
            </div>

            {/* Email Address */}
            <div>
              <label htmlFor="email" className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Email Address
              </label>
              <div className="relative rounded-xl shadow-xs">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  id="email"
                  type="text"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (emailError) setEmailError('');
                  }}
                  placeholder="Enter email address"
                  className={`w-full pl-10 pr-4 py-2.5 rounded-xl border text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none transition-colors ${
                    emailError ? 'border-rose-300 bg-rose-50/50' : 'border-slate-300 focus:border-indigo-600'
                  }`}
                />
              </div>
              {emailError && <p className="mt-1 text-xs text-rose-600 font-medium flex items-center"><AlertCircle className="w-3.5 h-3.5 mr-1" />{emailError}</p>}
            </div>

            {/* Role Selection (NO ADMIN) */}
            <div>
              <label htmlFor="role" className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Role
              </label>
              <div className="relative rounded-xl shadow-xs">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Briefcase className="w-4 h-4" />
                </div>
                <select
                  id="role"
                  value={role}
                  onChange={(e) => {
                    setRole(e.target.value);
                    if (roleError) setRoleError('');
                  }}
                  className={`w-full pl-10 pr-4 py-2.5 rounded-xl border text-xs bg-white focus:outline-none transition-colors ${
                    !role ? 'text-slate-400' : 'text-slate-900'
                  } ${
                    roleError ? 'border-rose-300 bg-rose-50/50' : 'border-slate-300 focus:border-indigo-600'
                  }`}
                >
                  <option value="" disabled>Select your role...</option>
                  <option value="DEVELOPER" className="text-slate-900">Developer</option>
                  <option value="PROJECT_MANAGER" className="text-slate-900">Project Manager</option>
                  <option value="TESTER" className="text-slate-900">Tester / QA Engineer</option>
                  <option value="DEVOPS_ENGINEER" className="text-slate-900">DevOps Engineer</option>
                  <option value="CLIENT" className="text-slate-900">Client</option>
                </select>
              </div>
              {roleError && <p className="mt-1 text-xs text-rose-600 font-medium flex items-center"><AlertCircle className="w-3.5 h-3.5 mr-1" />{roleError}</p>}
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Password
              </label>
              <div className="relative rounded-xl shadow-xs">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (passwordError) setPasswordError('');
                  }}
                  placeholder="At least 6 characters"
                  className={`w-full pl-10 pr-10 py-2.5 rounded-xl border text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none transition-colors ${
                    passwordError ? 'border-rose-300 bg-rose-50/50' : 'border-slate-300 focus:border-indigo-600'
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
              {passwordError && <p className="mt-1 text-xs text-rose-600 font-medium flex items-center"><AlertCircle className="w-3.5 h-3.5 mr-1" />{passwordError}</p>}
            </div>

            {/* Confirm Password */}
            <div>
              <label htmlFor="confirmPassword" className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Confirm Password
              </label>
              <div className="relative rounded-xl shadow-xs">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  id="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value);
                    if (confirmPasswordError) setConfirmPasswordError('');
                  }}
                  placeholder="Re-enter password"
                  className={`w-full pl-10 pr-10 py-2.5 rounded-xl border text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none transition-colors ${
                    confirmPasswordError ? 'border-rose-300 bg-rose-50/50' : 'border-slate-300 focus:border-indigo-600'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600"
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {confirmPasswordError && <p className="mt-1 text-xs text-rose-600 font-medium flex items-center"><AlertCircle className="w-3.5 h-3.5 mr-1" />{confirmPasswordError}</p>}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-md shadow-indigo-600/25 transition-all flex items-center justify-center space-x-2 disabled:opacity-50 mt-6"
            >
              {submitting ? (
                <>
                  <Activity className="w-4 h-4 animate-spin" />
                  <span>Creating Account...</span>
                </>
              ) : (
                <>
                  <span>Register Account</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 pt-4 border-t border-slate-100 text-center text-xs text-slate-600">
            Already have an account?{' '}
            <Link
              to="/login"
              className="font-bold text-indigo-600 hover:text-indigo-700"
            >
              Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
