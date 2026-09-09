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
  ShieldCheck,
  ChevronRight,
} from 'lucide-react';

interface NavItem {
  name: string;
  path: string;
  icon: React.ElementType;
}

const coreModules: NavItem[] = [
  { name: 'Dashboard', path: '/', icon: LayoutDashboard },
  { name: 'User Management', path: '/users', icon: Users },
  { name: 'Project Management', path: '/projects', icon: FolderGit2 },
  { name: 'Requirements', path: '/requirements', icon: FileCheck2 },
  { name: 'Tasks', path: '/tasks', icon: CheckSquare },
  { name: 'Test Cases', path: '/test-cases', icon: TestTube },
  { name: 'Bug Reports', path: '/bug-reports', icon: Bug },
  { name: 'Documentation', path: '/documentation', icon: BookOpen },
];

const devopsModules: NavItem[] = [
  { name: 'Versions', path: '/versions', icon: GitBranch },
  { name: 'Builds', path: '/builds', icon: Hammer },
  { name: 'Environments', path: '/environments', icon: Server },
  { name: 'Deployments', path: '/deployments', icon: Rocket },
];

export const Sidebar: React.FC = () => {
  return (
    <aside className="app-sidebar w-64 bg-[var(--bg-sidebar)] border-r border-[var(--border-color)] flex flex-col h-screen sticky top-0 z-30 select-none transition-colors duration-250 shrink-0">
      {/* Brand Header */}
      <div className="h-16 px-5 flex items-center border-b border-[var(--border-color)]">
        <div className="flex items-center space-x-3">
          <div className="p-2 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 shadow-md shadow-indigo-500/20 text-white shrink-0">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h1 className="font-bold text-base text-[var(--text-primary)] tracking-wide flex items-center">
              NEURO<span className="text-indigo-500 font-extrabold">FORGE</span>
            </h1>
            <p className="text-[10px] text-[var(--text-secondary)] font-mono tracking-tighter uppercase font-medium">
              SDLC & DevOps Control Center
            </p>
          </div>
        </div>
      </div>

      {/* Navigation List */}
      <div className="flex-1 overflow-y-auto py-4 px-3 space-y-6">
        {/* Core Modules */}
        <div className="space-y-1">
          <div className="px-3 pb-2 text-[10px] font-bold text-[var(--text-secondary)] tracking-wider uppercase">
            Core Modules
          </div>
          {coreModules.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === '/'}
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

        {/* DevOps Modules */}
        <div className="space-y-1">
          <div className="px-3 pb-2 text-[10px] font-bold text-[var(--text-secondary)] tracking-wider uppercase">
            DevOps
          </div>
          {devopsModules.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
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
      </div>

      {/* Footer Status */}
      <div className="p-3 border-t border-[var(--border-color)]">
        <div className="glass-panel p-3 rounded-xl flex items-center justify-between text-xs text-[var(--text-secondary)]">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
            <span className="font-semibold text-xs text-[var(--text-primary)]">Backend Ready</span>
          </div>
          <span className="text-[10px] text-[var(--text-secondary)] font-mono bg-slate-500/10 px-2 py-0.5 rounded-md border border-[var(--border-color)]">
            v1.0.0
          </span>
        </div>
      </div>
    </aside>
  );
};
