import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldAlert, ArrowLeft, Home } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const AccessDeniedPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleReturnHome = () => {
    if (!user) {
      navigate('/');
      return;
    }
    const role = user.role.toUpperCase();
    if (role === 'ADMIN') navigate('/admin/dashboard');
    else if (role === 'PROJECT_MANAGER' || role === 'PROJECT MANAGER') navigate('/pm/dashboard');
    else if (role === 'DEVELOPER') navigate('/developer/dashboard');
    else if (role === 'TESTER') navigate('/tester/dashboard');
    else if (role === 'DEVOPS_ENGINEER' || role === 'DEVOPS') navigate('/devops/dashboard');
    else if (role === 'CLIENT') navigate('/client/dashboard');
    else navigate('/dashboard');
  };

  return (
    <div className="relative z-10 min-h-screen flex items-center justify-center p-6 text-center">
      <div className="bg-white rounded-3xl p-8 sm:p-12 max-w-lg w-full border border-slate-200 shadow-2xl shadow-slate-200/60">
        <div className="w-16 h-16 rounded-2xl bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center mx-auto mb-6">
          <ShieldAlert className="w-8 h-8" />
        </div>

        <h1 className="text-3xl font-black text-slate-900 tracking-tight">Access Denied</h1>
        <p className="mt-3 text-sm text-slate-600 leading-relaxed">
          You do not have administrative or role-based permission to access this module page.
        </p>

        {user && (
          <div className="mt-4 p-3 rounded-xl bg-slate-100 border border-slate-200 text-xs font-mono text-slate-600 inline-block">
            Current Authenticated Role: <strong className="text-indigo-600 uppercase">{user.role}</strong>
          </div>
        )}

        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors flex items-center justify-center space-x-2"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Go Back</span>
          </button>
          <button
            onClick={handleReturnHome}
            className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-600/20 transition-all flex items-center justify-center space-x-2"
          >
            <Home className="w-4 h-4" />
            <span>Return to Dashboard</span>
          </button>
        </div>
      </div>
    </div>
  );
};
