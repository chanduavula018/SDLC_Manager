import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  FolderGit2,
  FileCheck2,
  CheckSquare,
  TestTube,
  Bug,
  BookOpen,
  GitBranch,
  Hammer,
  Server,
  Rocket,
  ChevronRight,
  Settings,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { NeuroForgeLogo } from '../common/NeuroForgeLogo';

interface NavItem {
  name: string;
  path: string;
  icon: React.ElementType;
  section: 'core' | 'devops' | 'admin';
  roles: string[];
}

const allNavItems: NavItem[] = [
  {
    name: 'Dashboard',
    path: '/dashboard',
    icon: LayoutDashboard,
    section: 'core',
    roles: ['ADMIN', 'PROJECT_MANAGER', 'DEVELOPER', 'TESTER', 'DEVOPS_ENGINEER', 'CLIENT'],
  },
  {
    name: 'Project Management',
    path: '/projects',
    icon: FolderGit2,
    section: 'core',
    roles: ['ADMIN', 'PROJECT_MANAGER', 'DEVELOPER', 'TESTER', 'DEVOPS_ENGINEER', 'CLIENT'],
  },
  {
    name: 'Requirements',
    path: '/requirements',
    icon: FileCheck2,
    section: 'core',
    roles: ['ADMIN', 'PROJECT_MANAGER', 'DEVELOPER', 'TESTER', 'CLIENT'],
  },
  {
    name: 'Tasks',
    path: '/tasks',
    icon: CheckSquare,
    section: 'core',
    roles: ['ADMIN', 'PROJECT_MANAGER', 'DEVELOPER'],
  },
  {
    name: 'Test Cases',
    path: '/test-cases',
    icon: TestTube,
    section: 'core',
    roles: ['ADMIN', 'TESTER'],
  },
  {
    name: 'Bug Reports',
    path: '/bug-reports',
    icon: Bug,
    section: 'core',
    roles: ['ADMIN', 'PROJECT_MANAGER', 'DEVELOPER', 'TESTER', 'CLIENT'],
  },
  {
    name: 'Documentation',
    path: '/documentation',
    icon: BookOpen,
    section: 'core',
    roles: ['ADMIN', 'PROJECT_MANAGER', 'DEVELOPER', 'TESTER', 'CLIENT'],
  },
  {
    name: 'Versions',
    path: '/versions',
    icon: GitBranch,
    section: 'devops',
    roles: ['ADMIN', 'PROJECT_MANAGER', 'DEVELOPER', 'DEVOPS_ENGINEER'],
  },
  {
    name: 'Builds',
    path: '/builds',
    icon: Hammer,
    section: 'devops',
    roles: ['ADMIN', 'DEVELOPER', 'DEVOPS_ENGINEER'],
  },
  {
    name: 'Environments',
    path: '/environments',
    icon: Server,
    section: 'devops',
    roles: ['ADMIN', 'DEVOPS_ENGINEER'],
  },
  {
    name: 'Deployments',
    path: '/deployments',
    icon: Rocket,
    section: 'devops',
    roles: ['ADMIN', 'DEVOPS_ENGINEER'],
  },
  {
    name: 'User Management',
    path: '/users',
    icon: Users,
    section: 'admin',
    roles: ['ADMIN'],
  },
];

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen = false, onClose }) => {
  const { user } = useAuth();
  const rawRole = user?.role ? user.role.toUpperCase().replace(' ', '_') : 'DEVELOPER';

  const getDashboardPath = (r: string) => {
    if (r === 'ADMIN') return '/admin/dashboard';
    if (r === 'PROJECT_MANAGER') return '/pm/dashboard';
    if (r === 'DEVELOPER') return '/developer/dashboard';
    if (r === 'TESTER') return '/tester/dashboard';
    if (r === 'DEVOPS_ENGINEER') return '/devops/dashboard';
    if (r === 'CLIENT') return '/client/dashboard';
    return '/dashboard';
  };

  const userDashboardPath = getDashboardPath(rawRole);

  const allowedItems = allNavItems.filter(
    (item) => rawRole === 'ADMIN' || item.roles.includes(rawRole)
  );

  const coreItems = allowedItems.filter((i) => i.section === 'core');
  const devopsItems = allowedItems.filter((i) => i.section === 'devops');
  const adminItems = allowedItems.filter((i) => i.section === 'admin');

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-40 lg:hidden transition-opacity"
          aria-hidden="true"
        />
      )}

      <aside
        className={`app-sidebar w-64 bg-[var(--bg-sidebar)] border-r border-[var(--border-color)] flex flex-col h-screen fixed lg:sticky top-0 left-0 z-50 lg:z-30 select-none transition-transform duration-300 shrink-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Brand Header */}
        <div className="h-16 px-5 flex items-center justify-between border-b border-[var(--border-color)]">
          <NeuroForgeLogo size="sm" subtitle={`${rawRole.replace('_', ' ')} PORTAL`} />

          {onClose && (
            <button
              onClick={onClose}
              className="lg:hidden p-1.5 rounded-lg text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-slate-500/10"
              aria-label="Close menu"
            >
              ✕
            </button>
          )}
        </div>

        {/* Navigation List */}
        <div className="flex-1 overflow-y-auto py-4 px-3 space-y-6">
          {/* CORE / SDLC Section */}
          <div className="space-y-1">
            <div className="px-3 pb-2 text-[10px] font-extrabold text-[var(--text-secondary)] tracking-wider uppercase">
              CORE / SDLC
            </div>
            {coreItems.map((item) => {
              const Icon = item.icon;
              const targetPath = item.name === 'Dashboard' ? userDashboardPath : item.path;

              return (
                <NavLink
                  key={item.path}
                  to={targetPath}
                  onClick={onClose}
                  className={({ isActive }) =>
                    `flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all group ${
                      isActive
                        ? 'bg-indigo-600/15 text-indigo-500 border border-indigo-500/30 shadow-xs'
                        : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-indigo-500/10'
                    }`
                  }
                >
                  <div className="flex items-center space-x-2.5 min-w-0">
                    <Icon className="w-4 h-4 shrink-0 transition-transform group-hover:scale-110" />
                    <span className="truncate">{item.name}</span>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                </NavLink>
              );
            })}
          </div>

          {/* DEVOPS Section */}
          {devopsItems.length > 0 && (
            <div className="space-y-1">
              <div className="px-3 pb-2 text-[10px] font-extrabold text-[var(--text-secondary)] tracking-wider uppercase">
                DEVOPS
              </div>
              {devopsItems.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    onClick={onClose}
                    className={({ isActive }) =>
                      `flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all group ${
                        isActive
                          ? 'bg-indigo-600/15 text-indigo-500 border border-indigo-500/30 shadow-xs'
                          : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-indigo-500/10'
                      }`
                    }
                  >
                    <div className="flex items-center space-x-2.5 min-w-0">
                      <Icon className="w-4 h-4 shrink-0 transition-transform group-hover:scale-110" />
                      <span className="truncate">{item.name}</span>
                    </div>
                    <ChevronRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                  </NavLink>
                );
              })}
            </div>
          )}

          {/* ADMINISTRATION Section */}
          {adminItems.length > 0 && (
            <div className="space-y-1">
              <div className="px-3 pb-2 text-[10px] font-extrabold text-[var(--text-secondary)] tracking-wider uppercase">
                ADMINISTRATION
              </div>
              {adminItems.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    onClick={onClose}
                    className={({ isActive }) =>
                      `flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all group ${
                        isActive
                          ? 'bg-indigo-600/15 text-indigo-500 border border-indigo-500/30 shadow-xs'
                          : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-indigo-500/10'
                      }`
                    }
                  >
                    <div className="flex items-center space-x-2.5 min-w-0">
                      <Icon className="w-4 h-4 shrink-0 transition-transform group-hover:scale-110" />
                      <span className="truncate">{item.name}</span>
                    </div>
                    <ChevronRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                  </NavLink>
                );
              })}
            </div>
          )}

          {/* Settings Nav Option */}
          <div className="pt-2 border-t border-[var(--border-color)]">
            <NavLink
              to="/settings"
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all group ${
                  isActive
                    ? 'bg-indigo-600/15 text-indigo-500 border border-indigo-500/30 shadow-xs'
                    : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-indigo-500/10'
                }`
              }
            >
              <div className="flex items-center space-x-2.5 min-w-0">
                <Settings className="w-4 h-4 shrink-0 transition-transform group-hover:scale-110 text-indigo-400" />
                <span className="truncate">Settings & Preferences</span>
              </div>
              <ChevronRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
            </NavLink>
          </div>
        </div>

        {/* Footer Profile Card */}
        <div className="p-3 border-t border-[var(--border-color)]">
          <NavLink
            to="/settings"
            onClick={onClose}
            className="glass-panel p-3 rounded-xl flex items-center justify-between text-xs text-[var(--text-secondary)] hover:border-indigo-500/30 transition-all cursor-pointer block"
          >
            <div className="flex items-center space-x-2 min-w-0">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0"></div>
              <div className="min-w-0">
                <p className="font-bold text-xs text-[var(--text-primary)] truncate">
                  {user?.fullName || 'User Profile'}
                </p>
                <p className="text-[10px] text-[var(--text-secondary)] truncate">
                  {user?.email || 'Settings'}
                </p>
              </div>
            </div>
            <span className="text-[10px] text-indigo-500 font-bold uppercase bg-indigo-500/10 px-2 py-0.5 rounded-md border border-indigo-500/20 shrink-0">
              {rawRole}
            </span>
          </NavLink>
        </div>
      </aside>
    </>
  );
};

