import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Bell,
  Search,
  UserCheck,
  Activity,
  FolderGit2,
  CheckSquare,
  Bug,
  Users,
  FileCheck2,
  X,
  ChevronDown,
  Menu,
  LogOut,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import {
  ProjectService,
  TaskService,
  BugReportService,
  UserService,
  RequirementService,
} from '../../services/api';

interface SearchResult {
  id: string | number;
  title: string;
  category: string;
  path: string;
}

interface TopBarProps {
  onMenuToggle?: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({ onMenuToggle }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSearchModal, setShowSearchModal] = useState(false);

  // Profile dropdown state
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const profileMenuRef = useRef<HTMLDivElement>(null);

  // Notifications modal state
  const [showNotifications, setShowNotifications] = useState(false);

  // Close profile dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(e.target as Node)) {
        setShowProfileMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    setShowProfileMenu(false);
    logout();
    navigate('/login');
  };

  // Real-time Global Search across backend items
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const [projects, tasks, bugs, users, requirements] = await Promise.all([
          ProjectService.getAll().catch(() => []),
          TaskService.getAll().catch(() => []),
          BugReportService.getAll().catch(() => []),
          UserService.getAll().catch(() => []),
          RequirementService.getAll().catch(() => []),
        ]);

        const q = searchQuery.toLowerCase();
        const results: SearchResult[] = [];

        projects.forEach((p) => {
          if (p.projectName.toLowerCase().includes(q) || (p.description && p.description.toLowerCase().includes(q))) {
            results.push({
              id: p.projectId!,
              title: p.projectName,
              category: 'Project',
              path: '/projects',
            });
          }
        });

        requirements.forEach((r) => {
          if (r.title.toLowerCase().includes(q) || (r.description && r.description.toLowerCase().includes(q))) {
            results.push({
              id: r.requirementId!,
              title: r.title,
              category: 'Requirement',
              path: '/requirements',
            });
          }
        });

        tasks.forEach((t) => {
          if (t.taskName.toLowerCase().includes(q) || (t.description && t.description.toLowerCase().includes(q))) {
            results.push({
              id: t.taskId!,
              title: t.taskName,
              category: 'Task',
              path: '/tasks',
            });
          }
        });

        bugs.forEach((b) => {
          if (b.description && b.description.toLowerCase().includes(q)) {
            results.push({
              id: b.bugId!,
              title: b.description,
              category: 'Bug Report',
              path: '/bug-reports',
            });
          }
        });

        users.forEach((u) => {
          if (u.fullName.toLowerCase().includes(q) || u.email.toLowerCase().includes(q)) {
            results.push({
              id: u.userId!,
              title: `${u.fullName} (${u.role})`,
              category: 'User',
              path: '/users',
            });
          }
        });

        setSearchResults(results.slice(0, 8));
      } catch {
        // ignore
      } finally {
        setIsSearching(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleSelectSearchResult = (path: string) => {
    setShowSearchModal(false);
    setSearchQuery('');
    navigate(path);
  };

  return (
    <header className="app-header h-16 bg-[var(--bg-header)] border-b border-[var(--border-color)] sticky top-0 z-20 backdrop-blur-md px-4 sm:px-6 flex items-center justify-between transition-colors duration-250 shrink-0">
      {/* Mobile Hamburger Toggle */}
      {onMenuToggle && (
        <button
          onClick={onMenuToggle}
          className="lg:hidden p-2 mr-2 rounded-xl bg-slate-500/10 hover:bg-slate-500/20 text-[var(--text-primary)] border border-[var(--border-color)]"
          aria-label="Open navigation menu"
        >
          <Menu className="w-5 h-5" />
        </button>
      )}

      {/* Global Search Bar Input */}
      <div className="flex items-center space-x-4 flex-1 max-w-md relative">
        <div className="relative w-full">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-secondary)]" />
          <input
            type="text"
            value={searchQuery}
            onFocus={() => setShowSearchModal(true)}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setShowSearchModal(true);
            }}
            placeholder="Search projects, requirements, tasks, bugs..."
            className="w-full pl-10 pr-9 py-1.5 rounded-xl glass-input text-xs text-[var(--text-primary)] placeholder:text-[var(--text-secondary)] focus:outline-none"
          />
          {searchQuery && (
            <button
              onClick={() => {
                setSearchQuery('');
                setSearchResults([]);
              }}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Quick Search Overlay Dropdown */}
        {showSearchModal && searchQuery.trim() && (
          <div className="absolute top-12 left-0 right-0 glass-modal rounded-2xl border border-[var(--border-color)] shadow-2xl p-4 z-50 space-y-2">
            <div className="flex items-center justify-between px-2 pb-2 border-b border-[var(--border-color)]">
              <span className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-wider">
                Search Results ({searchResults.length})
              </span>
              <button
                onClick={() => setShowSearchModal(false)}
                className="text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
              >
                Close
              </button>
            </div>

            {isSearching ? (
              <div className="py-6 text-center text-xs text-[var(--text-secondary)] flex items-center justify-center space-x-2">
                <Activity className="w-4 h-4 animate-spin text-indigo-500" />
                <span>Searching NeuroForge modules...</span>
              </div>
            ) : searchResults.length === 0 ? (
              <div className="py-6 text-center text-xs text-[var(--text-secondary)]">
                No matching projects, tasks, or bugs found.
              </div>
            ) : (
              <div className="divide-y divide-[var(--border-color)] max-h-64 overflow-y-auto">
                {searchResults.map((res) => (
                  <div
                    key={`${res.category}-${res.id}`}
                    onClick={() => handleSelectSearchResult(res.path)}
                    className="py-2 px-3 rounded-xl hover:bg-indigo-500/10 cursor-pointer flex items-center justify-between transition-colors"
                  >
                    <div className="flex items-center space-x-2.5 min-w-0">
                      {res.category === 'Project' && <FolderGit2 className="w-4 h-4 text-indigo-400 shrink-0" />}
                      {res.category === 'Requirement' && <FileCheck2 className="w-4 h-4 text-cyan-400 shrink-0" />}
                      {res.category === 'Task' && <CheckSquare className="w-4 h-4 text-amber-400 shrink-0" />}
                      {res.category === 'Bug Report' && <Bug className="w-4 h-4 text-rose-400 shrink-0" />}
                      {res.category === 'User' && <Users className="w-4 h-4 text-sky-400 shrink-0" />}
                      <span className="text-xs font-semibold text-[var(--text-primary)] truncate">{res.title}</span>
                    </div>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-500/10 text-[var(--text-secondary)] font-mono border border-[var(--border-color)] shrink-0">
                      {res.category}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Right Navigation Controls */}
      <div className="flex items-center space-x-3">
        {/* Notification Bell */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-2 rounded-xl bg-slate-500/10 hover:bg-slate-500/20 text-[var(--text-secondary)] hover:text-[var(--text-primary)] border border-[var(--border-color)] transition-colors relative"
            title="System Notifications"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-indigo-500 animate-ping"></span>
            <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-indigo-500"></span>
          </button>

          {showNotifications && (
            <div className="absolute right-0 top-12 w-80 glass-modal rounded-2xl border border-[var(--border-color)] shadow-2xl p-4 z-50 space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-[var(--border-color)]">
                <h4 className="text-xs font-bold text-[var(--text-primary)] uppercase tracking-wider">
                  System Notifications
                </h4>
                <button
                  onClick={() => setShowNotifications(false)}
                  className="text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                >
                  Dismiss
                </button>
              </div>
              <div className="space-y-2 text-xs">
                <div className="p-2.5 rounded-xl bg-indigo-500/10 border border-indigo-500/20">
                  <p className="font-semibold text-indigo-400">Spring Boot Security Active</p>
                  <p className="text-[11px] text-[var(--text-secondary)] mt-0.5">
                    Authenticated session active for {user?.fullName || 'User'}.
                  </p>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-500/10 border border-[var(--border-color)]">
                  <p className="font-semibold text-[var(--text-primary)]">Role Authorization Granted</p>
                  <p className="text-[11px] text-[var(--text-secondary)] mt-0.5">
                    Current role: {user?.role || 'GUEST'}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* User Profile Avatar & Dropdown */}
        <div className="relative" ref={profileMenuRef}>
          <button
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className="flex items-center space-x-2.5 pl-2 border-l border-[var(--border-color)] focus:outline-none"
          >
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-xs shadow-md">
              <UserCheck className="w-4 h-4" />
            </div>
            <div className="hidden sm:block text-left">
              <div className="flex items-center space-x-1">
                <p className="text-xs font-bold text-[var(--text-primary)]">{user?.fullName || 'Guest User'}</p>
                <ChevronDown className="w-3 h-3 text-[var(--text-secondary)]" />
              </div>
              <p className="text-[10px] text-[var(--text-secondary)]">{user?.email || 'not logged in'}</p>
            </div>
          </button>

          {showProfileMenu && (
            <div className="absolute right-0 top-12 w-64 glass-modal rounded-2xl border border-[var(--border-color)] shadow-2xl p-3 z-50 space-y-3">
              <div className="p-3 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-xs">
                <p className="font-bold text-[var(--text-primary)]">{user?.fullName || 'User Profile'}</p>
                <p className="text-[11px] text-[var(--text-secondary)]">{user?.email}</p>
                <span className="inline-block mt-2 px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-600 text-white uppercase">
                  Role: {user?.role || 'GUEST'}
                </span>
              </div>
              <div className="space-y-1 text-xs">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center space-x-2 px-3 py-2 rounded-xl text-rose-500 hover:bg-rose-500/10 font-bold transition-colors"
                >
                  <LogOut className="w-4 h-4 text-rose-500" />
                  <span>Logout</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
