import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  FolderGit2,
  FileCheck2,
  CheckSquare,
  Bug,
  Plus,
  ArrowUpRight,
  Activity,
} from 'lucide-react';
import {
  ProjectService,
  RequirementService,
  TaskService,
  BugReportService,
} from '../../services/api';
import type { Project, Requirement, TaskItem, BugReport } from '../../types';
import { StatusBadge } from '../../components/common/StatusBadge';

export const PMDashboard: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [projects, setProjects] = useState<Project[]>([]);
  const [requirements, setRequirements] = useState<Requirement[]>([]);
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [bugs, setBugs] = useState<BugReport[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [p, r, t, b] = await Promise.all([
          ProjectService.getAll().catch(() => []),
          RequirementService.getAll().catch(() => []),
          TaskService.getAll().catch(() => []),
          BugReportService.getAll().catch(() => []),
        ]);
        setProjects(p);
        setRequirements(r);
        setTasks(t);
        setBugs(b);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const openReqs = requirements.filter((r) => r.status?.toUpperCase() !== 'COMPLETED');
  const pendingTasks = tasks.filter((t) => t.status?.toUpperCase() !== 'COMPLETED');
  const openBugs = bugs.filter((b) => b.status?.toUpperCase() !== 'CLOSED' && b.status?.toUpperCase() !== 'RESOLVED');

  if (loading) {
    return (
      <div className="py-16 text-center text-xs text-[var(--text-secondary)] flex items-center justify-center space-x-2">
        <Activity className="w-5 h-5 animate-spin text-indigo-500" />
        <span>Loading Project Manager Workspace...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-indigo-900 via-indigo-800 to-purple-900 text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-white/5 rounded-full blur-3xl pointer-events-none"></div>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div>
            <span className="px-3 py-1 rounded-full bg-indigo-500/30 border border-indigo-400/30 text-indigo-200 text-xs font-bold uppercase tracking-wider">
              Project Manager Workspace
            </span>
            <h1 className="text-2xl sm:text-3xl font-black mt-2 tracking-tight">Project Planning & Governance</h1>
            <p className="text-xs text-indigo-200 mt-1 max-w-xl">
              Track project timelines, requirement specifications, task distributions, and team delivery velocity.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Link
              to="/projects"
              className="px-4 py-2.5 rounded-xl bg-white text-indigo-900 hover:bg-indigo-50 font-bold text-xs shadow-md transition-all flex items-center space-x-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>New Project</span>
            </Link>
            <Link
              to="/requirements"
              className="px-4 py-2.5 rounded-xl bg-indigo-600/50 hover:bg-indigo-600 text-white font-bold text-xs border border-indigo-400/40 transition-all flex items-center space-x-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Add Requirement</span>
            </Link>
          </div>
        </div>
      </div>

      {/* KPI Summary Cards */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-card p-5 rounded-2xl border border-[var(--border-color)]">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[var(--text-secondary)] uppercase">Active Projects</span>
            <div className="w-9 h-9 rounded-xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center">
              <FolderGit2 className="w-5 h-5" />
            </div>
          </div>
          <p className="text-3xl font-black text-[var(--text-primary)] mt-3">{projects.length}</p>
          <span className="text-[11px] text-[var(--text-secondary)] mt-1 block">Initiatives in progress</span>
        </div>

        <div className="glass-card p-5 rounded-2xl border border-[var(--border-color)]">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[var(--text-secondary)] uppercase">Open Requirements</span>
            <div className="w-9 h-9 rounded-xl bg-cyan-500/10 text-cyan-500 flex items-center justify-center">
              <FileCheck2 className="w-5 h-5" />
            </div>
          </div>
          <p className="text-3xl font-black text-[var(--text-primary)] mt-3">{openReqs.length}</p>
          <span className="text-[11px] text-[var(--text-secondary)] mt-1 block">Awaiting signoff / dev</span>
        </div>

        <div className="glass-card p-5 rounded-2xl border border-[var(--border-color)]">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[var(--text-secondary)] uppercase">Pending Tasks</span>
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center">
              <CheckSquare className="w-5 h-5" />
            </div>
          </div>
          <p className="text-3xl font-black text-[var(--text-primary)] mt-3">{pendingTasks.length}</p>
          <span className="text-[11px] text-[var(--text-secondary)] mt-1 block">Assigned team tasks</span>
        </div>

        <div className="glass-card p-5 rounded-2xl border border-[var(--border-color)]">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[var(--text-secondary)] uppercase">Open Bugs</span>
            <div className="w-9 h-9 rounded-xl bg-rose-500/10 text-rose-500 flex items-center justify-center">
              <Bug className="w-5 h-5" />
            </div>
          </div>
          <p className="text-3xl font-black text-[var(--text-primary)] mt-3">{openBugs.length}</p>
          <span className="text-[11px] text-[var(--text-secondary)] mt-1 block">Reported defects</span>
        </div>
      </div>

      {/* Projects Overview & Requirements Grid */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Managed Projects */}
        <div className="glass-card p-6 rounded-3xl border border-[var(--border-color)] space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[var(--border-color)]">
            <h3 className="text-sm font-bold text-[var(--text-primary)] uppercase tracking-wider">Managed Projects</h3>
            <Link to="/projects" className="text-xs text-indigo-500 hover:text-indigo-600 font-bold flex items-center">
              <span>View All</span>
              <ArrowUpRight className="w-3.5 h-3.5 ml-1" />
            </Link>
          </div>

          <div className="space-y-3">
            {projects.slice(0, 4).map((p) => (
              <div key={p.projectId} className="p-3.5 rounded-2xl bg-slate-500/5 border border-[var(--border-color)] hover:border-indigo-500/30 transition-all flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-[var(--text-primary)]">{p.projectName}</h4>
                  <p className="text-[11px] text-[var(--text-secondary)] mt-0.5 line-clamp-1">{p.description || 'No description'}</p>
                </div>
                <StatusBadge status={p.status} />
              </div>
            ))}
          </div>
        </div>

        {/* Recent Requirements */}
        <div className="glass-card p-6 rounded-3xl border border-[var(--border-color)] space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[var(--border-color)]">
            <h3 className="text-sm font-bold text-[var(--text-primary)] uppercase tracking-wider">Project Requirements</h3>
            <Link to="/requirements" className="text-xs text-indigo-500 hover:text-indigo-600 font-bold flex items-center">
              <span>Manage Requirements</span>
              <ArrowUpRight className="w-3.5 h-3.5 ml-1" />
            </Link>
          </div>

          <div className="space-y-3">
            {requirements.slice(0, 4).map((r) => (
              <div key={r.requirementId} className="p-3.5 rounded-2xl bg-slate-500/5 border border-[var(--border-color)] flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-[var(--text-primary)]">{r.title}</h4>
                  <span className="text-[10px] text-[var(--text-secondary)]">Priority: {r.priority}</span>
                </div>
                <StatusBadge status={r.status} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
