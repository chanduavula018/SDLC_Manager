import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Bug,
  Hammer,
  Clock,
  CheckCircle2,
  ArrowUpRight,
  Activity,
  Code,
} from 'lucide-react';
import {
  TaskService,
  BugReportService,
  BuildService,
} from '../../services/api';
import type { TaskItem, BugReport, Build } from '../../types';
import { StatusBadge } from '../../components/common/StatusBadge';
import { useAuth } from '../../context/AuthContext';

export const DeveloperDashboard: React.FC = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [bugs, setBugs] = useState<BugReport[]>([]);
  const [builds, setBuilds] = useState<Build[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [t, b, bld] = await Promise.all([
          TaskService.getAll().catch(() => []),
          BugReportService.getAll().catch(() => []),
          BuildService.getAll().catch(() => []),
        ]);
        setTasks(t);
        setBugs(b);
        setBuilds(bld);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const pendingTasks = tasks.filter((t) => t.status?.toUpperCase() !== 'COMPLETED');
  const completedTasks = tasks.filter((t) => t.status?.toUpperCase() === 'COMPLETED');
  const openBugs = bugs.filter((b) => b.status?.toUpperCase() === 'OPEN');

  if (loading) {
    return (
      <div className="py-16 text-center text-xs text-[var(--text-secondary)] flex items-center justify-center space-x-2">
        <Activity className="w-5 h-5 animate-spin text-indigo-500" />
        <span>Loading Developer Workspace...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white shadow-xl relative overflow-hidden border border-indigo-500/20">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div>
            <span className="px-3 py-1 rounded-full bg-indigo-500/30 text-indigo-300 text-xs font-bold uppercase tracking-wider border border-indigo-500/30">
              Developer Workspace
            </span>
            <h1 className="text-2xl sm:text-3xl font-black mt-2 tracking-tight">Engineering & Implementation</h1>
            <p className="text-xs text-slate-300 mt-1">
              Welcome back, {user?.fullName}. Here are your assigned development tasks and build status.
            </p>
          </div>
          <Link
            to="/tasks"
            className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md transition-all flex items-center space-x-2 w-fit"
          >
            <Code className="w-4 h-4" />
            <span>My Tasks Board</span>
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-card p-5 rounded-2xl border border-[var(--border-color)]">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[var(--text-secondary)] uppercase">Pending Tasks</span>
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <p className="text-3xl font-black text-[var(--text-primary)] mt-3">{pendingTasks.length}</p>
          <span className="text-[11px] text-[var(--text-secondary)] mt-1 block">Requires development</span>
        </div>

        <div className="glass-card p-5 rounded-2xl border border-[var(--border-color)]">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[var(--text-secondary)] uppercase">Completed Tasks</span>
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
          <p className="text-3xl font-black text-[var(--text-primary)] mt-3">{completedTasks.length}</p>
          <span className="text-[11px] text-[var(--text-secondary)] mt-1 block">Finished implementations</span>
        </div>

        <div className="glass-card p-5 rounded-2xl border border-[var(--border-color)]">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[var(--text-secondary)] uppercase">Open Bugs</span>
            <div className="w-9 h-9 rounded-xl bg-rose-500/10 text-rose-500 flex items-center justify-center">
              <Bug className="w-5 h-5" />
            </div>
          </div>
          <p className="text-3xl font-black text-[var(--text-primary)] mt-3">{openBugs.length}</p>
          <span className="text-[11px] text-[var(--text-secondary)] mt-1 block">Assigned code defects</span>
        </div>

        <div className="glass-card p-5 rounded-2xl border border-[var(--border-color)]">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[var(--text-secondary)] uppercase">Active Builds</span>
            <div className="w-9 h-9 rounded-xl bg-purple-500/10 text-purple-500 flex items-center justify-center">
              <Hammer className="w-5 h-5" />
            </div>
          </div>
          <p className="text-3xl font-black text-[var(--text-primary)] mt-3">{builds.length}</p>
          <span className="text-[11px] text-[var(--text-secondary)] mt-1 block">Compiled code artifacts</span>
        </div>
      </div>

      {/* Development Tasks & Builds */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Assigned Tasks */}
        <div className="glass-card p-6 rounded-3xl border border-[var(--border-color)] space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[var(--border-color)]">
            <h3 className="text-sm font-bold text-[var(--text-primary)] uppercase tracking-wider">Assigned Engineering Tasks</h3>
            <Link to="/tasks" className="text-xs text-indigo-500 hover:text-indigo-600 font-bold flex items-center">
              <span>View All</span>
              <ArrowUpRight className="w-3.5 h-3.5 ml-1" />
            </Link>
          </div>

          <div className="space-y-3">
            {tasks.slice(0, 5).map((t) => (
              <div key={t.taskId} className="p-3.5 rounded-2xl bg-slate-500/5 border border-[var(--border-color)] flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-[var(--text-primary)]">{t.taskName}</h4>
                  <p className="text-[11px] text-[var(--text-secondary)] mt-0.5">Deadline: {t.deadline || 'Flexible'}</p>
                </div>
                <StatusBadge status={t.status} />
              </div>
            ))}
          </div>
        </div>

        {/* Recent Builds */}
        <div className="glass-card p-6 rounded-3xl border border-[var(--border-color)] space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[var(--border-color)]">
            <h3 className="text-sm font-bold text-[var(--text-primary)] uppercase tracking-wider">Recent Builds</h3>
            <Link to="/builds" className="text-xs text-indigo-500 hover:text-indigo-600 font-bold flex items-center">
              <span>Build Artifacts</span>
              <ArrowUpRight className="w-3.5 h-3.5 ml-1" />
            </Link>
          </div>

          <div className="space-y-3">
            {builds.slice(0, 5).map((b) => (
              <div key={b.buildId} className="p-3.5 rounded-2xl bg-slate-500/5 border border-[var(--border-color)] flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-mono font-bold text-[var(--text-primary)]">{b.buildNumber}</h4>
                  <p className="text-[11px] text-[var(--text-secondary)] mt-0.5">Date: {b.buildDate ? b.buildDate.split('T')[0] : 'N/A'}</p>
                </div>
                <StatusBadge status={b.status} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
