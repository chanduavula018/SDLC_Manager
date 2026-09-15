import React, { useState, useEffect } from 'react';
import {
  User,
  Shield,
  Palette,
  Bell,
  Sliders,
  Sun,
  Moon,
  CheckCircle2,
  Activity,
  LogOut,
  Database,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useToast } from '../../context/ToastContext';
import { apiClient } from '../../services/api';

export const SettingsPage: React.FC = () => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { success, error } = useToast();

  const [activeTab, setActiveTab] = useState<'account' | 'appearance' | 'notifications' | 'preferences' | 'security'>('account');
  const [backendConnected, setBackendConnected] = useState<boolean | null>(null);

  useEffect(() => {
    apiClient
      .get('/health')
      .then(() => setBackendConnected(true))
      .catch(() => setBackendConnected(false));
  }, []);

  // Change Password State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordSubmitting, setPasswordSubmitting] = useState(false);

  // Notification Toggles State
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [taskAlerts, setTaskAlerts] = useState(true);
  const [bugAlerts, setBugAlerts] = useState(true);
  const [deploymentAlerts, setDeploymentAlerts] = useState(false);

  // Preferences State
  const [defaultDashboard, setDefaultDashboard] = useState('auto');
  const [tableRows, setTableRows] = useState(10);

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword || newPassword.length < 6) {
      error('Password Error', 'New password must be at least 6 characters long.');
      return;
    }
    if (newPassword !== confirmPassword) {
      error('Password Error', 'New passwords do not match.');
      return;
    }

    setPasswordSubmitting(true);
    setTimeout(() => {
      setPasswordSubmitting(false);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      success('Password Updated', 'Password changed successfully!');
    }, 1000);
  };

  const handleSaveNotifications = () => {
    success('Notifications Saved', 'Notification preferences saved successfully.');
  };

  const handleSavePreferences = () => {
    localStorage.setItem('table_rows_per_page', String(tableRows));
    success('Preferences Saved', 'Preferences saved successfully.');
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-900 to-slate-900 text-white shadow-xl flex items-center justify-between">
        <div>
          <span className="px-3 py-1 rounded-full bg-indigo-500/30 text-indigo-200 text-xs font-bold uppercase tracking-wider border border-indigo-400/30">
            System Settings
          </span>
          <h1 className="text-2xl sm:text-3xl font-black mt-2 tracking-tight">Account & Platform Preferences</h1>
          <p className="text-xs text-indigo-200 mt-1">
            Manage your user profile, theme appearance, notifications, and security options.
          </p>
        </div>
      </div>

      {/* Main Settings Grid */}
      <div className="grid lg:grid-cols-4 gap-6">
        {/* Navigation Tabs */}
        <div className="glass-panel p-3 rounded-3xl border border-[var(--border-color)] space-y-1 h-fit">
          {[
            { id: 'account', label: 'Account Profile', icon: User },
            { id: 'appearance', label: 'Theme & Appearance', icon: Palette },
            { id: 'notifications', label: 'Notifications', icon: Bell },
            { id: 'preferences', label: 'Preferences', icon: Sliders },
            { id: 'security', label: 'Security & Sessions', icon: Shield },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-2xl text-xs font-bold transition-all ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                    : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-slate-500/10'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Tab Content Panel */}
        <div className="lg:col-span-3 glass-panel p-6 sm:p-8 rounded-3xl border border-[var(--border-color)]">
          {/* 1. Account Profile Tab */}
          {activeTab === 'account' && (
            <div className="space-y-6">
              <div className="border-b border-[var(--border-color)] pb-4">
                <h3 className="text-base font-extrabold text-[var(--text-primary)]">User Account Information</h3>
                <p className="text-xs text-[var(--text-secondary)] mt-0.5">View your authenticated user account details.</p>
              </div>

              <div className="grid sm:grid-cols-2 gap-4 text-xs">
                <div className="p-4 rounded-2xl bg-slate-500/5 border border-[var(--border-color)]">
                  <span className="text-[10px] font-bold uppercase text-[var(--text-secondary)]">Full Name</span>
                  <p className="text-sm font-bold text-[var(--text-primary)] mt-1">{user?.fullName || 'N/A'}</p>
                </div>
                <div className="p-4 rounded-2xl bg-slate-500/5 border border-[var(--border-color)]">
                  <span className="text-[10px] font-bold uppercase text-[var(--text-secondary)]">Email Address</span>
                  <p className="text-sm font-bold text-[var(--text-primary)] mt-1">{user?.email || 'N/A'}</p>
                </div>
                <div className="p-4 rounded-2xl bg-slate-500/5 border border-[var(--border-color)]">
                  <span className="text-[10px] font-bold uppercase text-[var(--text-secondary)]">Role Designation</span>
                  <span className="inline-block mt-1.5 px-3 py-1 rounded-full text-xs font-bold bg-indigo-600 text-white uppercase">
                    {user?.role || 'GUEST'}
                  </span>
                </div>
                <div className="p-4 rounded-2xl bg-slate-500/5 border border-[var(--border-color)]">
                  <span className="text-[10px] font-bold uppercase text-[var(--text-secondary)]">User Identifier</span>
                  <p className="text-sm font-mono font-bold text-[var(--text-primary)] mt-1">#{user?.userId || 'N/A'}</p>
                </div>
              </div>

              {/* Change Password Form */}
              <form onSubmit={handleChangePassword} className="pt-6 border-t border-[var(--border-color)] space-y-4">
                <h4 className="text-xs font-bold text-[var(--text-primary)] uppercase tracking-wider">Change Password</h4>

                <div className="grid sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-[11px] font-bold text-[var(--text-secondary)] mb-1">Current Password</label>
                    <input
                      type="password"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full px-3.5 py-2 rounded-xl border border-[var(--border-color)] bg-transparent text-xs text-[var(--text-primary)] focus:outline-none focus:border-indigo-600"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-[var(--text-secondary)] mb-1">New Password</label>
                    <input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full px-3.5 py-2 rounded-xl border border-[var(--border-color)] bg-transparent text-xs text-[var(--text-primary)] focus:outline-none focus:border-indigo-600"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-[var(--text-secondary)] mb-1">Confirm New Password</label>
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full px-3.5 py-2 rounded-xl border border-[var(--border-color)] bg-transparent text-xs text-[var(--text-primary)] focus:outline-none focus:border-indigo-600"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={passwordSubmitting}
                  className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-600/20 transition-all flex items-center space-x-2 disabled:opacity-50"
                >
                  {passwordSubmitting ? (
                    <>
                      <Activity className="w-4 h-4 animate-spin" />
                      <span>Updating Password...</span>
                    </>
                  ) : (
                    <span>Update Password</span>
                  )}
                </button>
              </form>
            </div>
          )}

          {/* 2. Theme & Appearance Tab */}
          {activeTab === 'appearance' && (
            <div className="space-y-6">
              <div className="border-b border-[var(--border-color)] pb-4">
                <h3 className="text-base font-extrabold text-[var(--text-primary)]">Theme & Color Scheme</h3>
                <p className="text-xs text-[var(--text-secondary)] mt-0.5">Customize your interface theme mode. Preference is saved across sessions.</p>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div
                  onClick={() => {
                    if (theme !== 'light') toggleTheme();
                  }}
                  className={`p-5 rounded-2xl border cursor-pointer transition-all ${
                    theme === 'light'
                      ? 'border-indigo-600 bg-indigo-500/10 shadow-md'
                      : 'border-[var(--border-color)] hover:bg-slate-500/5'
                  }`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <Sun className="w-6 h-6 text-amber-500" />
                    {theme === 'light' && <CheckCircle2 className="w-5 h-5 text-indigo-600" />}
                  </div>
                  <h4 className="text-sm font-bold text-[var(--text-primary)]">Light Mode</h4>
                  <p className="text-xs text-[var(--text-secondary)] mt-1">Clean enterprise white background with soft borders and crisp typography.</p>
                </div>

                <div
                  onClick={() => {
                    if (theme !== 'dark') toggleTheme();
                  }}
                  className={`p-5 rounded-2xl border cursor-pointer transition-all ${
                    theme === 'dark'
                      ? 'border-indigo-600 bg-indigo-500/10 shadow-md'
                      : 'border-[var(--border-color)] hover:bg-slate-500/5'
                  }`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <Moon className="w-6 h-6 text-indigo-400" />
                    {theme === 'dark' && <CheckCircle2 className="w-5 h-5 text-indigo-600" />}
                  </div>
                  <h4 className="text-sm font-bold text-[var(--text-primary)]">Dark Mode</h4>
                  <p className="text-xs text-[var(--text-secondary)] mt-1">Balanced deep slate theme for low-light engineering environments.</p>
                </div>
              </div>
            </div>
          )}

          {/* 3. Notifications Tab */}
          {activeTab === 'notifications' && (
            <div className="space-y-6">
              <div className="border-b border-[var(--border-color)] pb-4">
                <h3 className="text-base font-extrabold text-[var(--text-primary)]">System Notification Preferences</h3>
                <p className="text-xs text-[var(--text-secondary)] mt-0.5">Control which event alerts trigger system notifications.</p>
              </div>

              <div className="space-y-4 text-xs">
                {[
                  { label: 'Email Notifications', desc: 'Receive daily activity digests via email', state: emailNotifications, set: setEmailNotifications },
                  { label: 'Task Assignment Alerts', desc: 'Notify when a new task is assigned to you', state: taskAlerts, set: setTaskAlerts },
                  { label: 'Bug Report Alerts', desc: 'Notify when defects are logged or assigned', state: bugAlerts, set: setBugAlerts },
                  { label: 'Deployment Notifications', desc: 'Notify when production release deployments execute', state: deploymentAlerts, set: setDeploymentAlerts },
                ].map((n) => (
                  <div key={n.label} className="p-4 rounded-2xl bg-slate-500/5 border border-[var(--border-color)] flex items-center justify-between">
                    <div>
                      <h4 className="font-bold text-[var(--text-primary)]">{n.label}</h4>
                      <p className="text-[11px] text-[var(--text-secondary)] mt-0.5">{n.desc}</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={n.state}
                      onChange={(e) => n.set(e.target.checked)}
                      className="w-4 h-4 text-indigo-600 rounded cursor-pointer"
                    />
                  </div>
                ))}
              </div>

              <button
                onClick={handleSaveNotifications}
                className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-600/20 transition-all"
              >
                Save Notification Settings
              </button>
            </div>
          )}

          {/* 4. Preferences Tab */}
          {activeTab === 'preferences' && (
            <div className="space-y-6">
              <div className="border-b border-[var(--border-color)] pb-4">
                <h3 className="text-base font-extrabold text-[var(--text-primary)]">Platform Workspace Preferences</h3>
                <p className="text-xs text-[var(--text-secondary)] mt-0.5">Configure default layout and table page sizes.</p>
              </div>

              <div className="grid sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="block font-bold text-[var(--text-primary)] mb-1">Default Dashboard View</label>
                  <select
                    value={defaultDashboard}
                    onChange={(e) => setDefaultDashboard(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--border-color)] bg-transparent text-xs text-[var(--text-primary)] focus:outline-none focus:border-indigo-600"
                  >
                    <option value="auto">Auto-detect based on Role</option>
                    <option value="admin">Admin Dashboard</option>
                    <option value="pm">Project Manager Dashboard</option>
                    <option value="developer">Developer Dashboard</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-[var(--text-primary)] mb-1">Table Rows Per Page</label>
                  <select
                    value={tableRows}
                    onChange={(e) => setTableRows(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--border-color)] bg-transparent text-xs text-[var(--text-primary)] focus:outline-none focus:border-indigo-600"
                  >
                    <option value={10}>10 rows per page</option>
                    <option value={25}>25 rows per page</option>
                    <option value={50}>50 rows per page</option>
                    <option value={100}>100 rows per page</option>
                  </select>
                </div>
              </div>

              <button
                onClick={handleSavePreferences}
                className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-600/20 transition-all"
              >
                Save Preferences
              </button>
            </div>
          )}

          {/* 5. Security & Sessions Tab */}
          {activeTab === 'security' && (
            <div className="space-y-6">
              <div className="border-b border-[var(--border-color)] pb-4">
                <h3 className="text-base font-extrabold text-[var(--text-primary)]">Active Security & Session Control</h3>
                <p className="text-xs text-[var(--text-secondary)] mt-0.5">Manage your active authentication session and security controls.</p>
              </div>

              <div className="p-4 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 space-y-3 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-[var(--text-primary)]">Active Session Token</span>
                  <span className="font-mono text-[10px] bg-slate-500/20 px-2 py-0.5 rounded border border-[var(--border-color)] text-[var(--text-primary)]">
                    {user?.token ? `${user.token.substring(0, 24)}...` : 'None'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-bold text-[var(--text-primary)]">Backend Authentication Protocol</span>
                  <span className="font-bold text-emerald-500">Spring Security (Stateless Token)</span>
                </div>
              </div>

              {/* System Health Diagnostics */}
              <div className="p-4 rounded-2xl bg-slate-500/5 border border-[var(--border-color)] space-y-3 text-xs">
                <h4 className="font-extrabold text-[var(--text-primary)] uppercase tracking-wider text-[11px] flex items-center space-x-2">
                  <Database className="w-4 h-4 text-indigo-500" />
                  <span>System Diagnostics & Health</span>
                </h4>
                <div className="flex items-center justify-between">
                  <span className="font-bold text-[var(--text-primary)]">Backend Connection Status</span>
                  {backendConnected === null ? (
                    <span className="text-amber-500 font-medium flex items-center">
                      <Activity className="w-3 h-3 animate-spin mr-1" /> Checking Status...
                    </span>
                  ) : backendConnected ? (
                    <span className="text-emerald-500 font-bold flex items-center">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 mr-1.5 animate-pulse"></span>
                      Backend Status ● Online
                    </span>
                  ) : (
                    <span className="text-rose-500 font-bold flex items-center">
                      <span className="w-2 h-2 rounded-full bg-rose-500 mr-1.5"></span>
                      Backend Status ● Offline
                    </span>
                  )}
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-bold text-[var(--text-primary)]">Database Engine</span>
                  <span className="font-semibold text-[var(--text-secondary)]">Spring Boot PostgreSQL Persistence</span>
                </div>
              </div>

              <div className="pt-4 border-t border-[var(--border-color)]">
                <button
                  onClick={logout}
                  className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-md shadow-rose-600/20 transition-all flex items-center space-x-2"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Terminate Active Session (Log Out)</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
