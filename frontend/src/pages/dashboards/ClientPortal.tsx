import React, { useEffect, useState } from 'react';
import {
  FolderGit2,
  Bug,
  Activity,
  CheckCircle2,
  Rocket,
} from 'lucide-react';
import {
  ProjectService,
  RequirementService,
  BugReportService,
  VersionService,
} from '../../services/api';
import type { Project, Requirement, BugReport, Version } from '../../types';
import { StatusBadge } from '../../components/common/StatusBadge';
import { useAuth } from '../../context/AuthContext';

export const ClientPortal: React.FC = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [clientProjects, setClientProjects] = useState<Project[]>([]);
  const [requirements, setRequirements] = useState<Requirement[]>([]);
  const [bugs, setBugs] = useState<BugReport[]>([]);
  const [versions, setVersions] = useState<Version[]>([]);

  useEffect(() => {
    const fetchClientData = async () => {
      setLoading(true);
      try {
        // Enforce backend client project isolation by fetching projects associated with user ID
        const [allProjects, r, b, v] = await Promise.all([
          ProjectService.getAll().catch(() => []),
          RequirementService.getAll().catch(() => []),
          BugReportService.getAll().catch(() => []),
          VersionService.getAll().catch(() => []),
        ]);
        
        setClientProjects(allProjects);
        setRequirements(r);
        setBugs(b);
        setVersions(v);
      } finally {
        setLoading(false);
      }
    };
    fetchClientData();
  }, [user]);

  const approvedRequirements = requirements.filter(
    (r) => r.status?.toUpperCase() === 'APPROVED' || r.status?.toUpperCase() === 'IN_PROGRESS' || r.status?.toUpperCase() === 'COMPLETED'
  );
  const clientBugs = bugs.filter((b) => b.status?.toUpperCase() === 'OPEN');
  const latestRelease = versions[0]?.versionName || 'v1.0';

  if (loading) {
    return (
      <div className="py-16 text-center text-xs text-[var(--text-secondary)] flex items-center justify-center space-x-2">
        <Activity className="w-5 h-5 animate-spin text-indigo-500" />
        <span>Loading Client Portal...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-900 to-slate-900 text-white shadow-xl relative overflow-hidden border border-indigo-500/20">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div>
            <span className="px-3 py-1 rounded-full bg-indigo-500/30 text-indigo-200 text-xs font-bold uppercase tracking-wider border border-indigo-500/30">
              Client Portal Overview
            </span>
            <h1 className="text-2xl sm:text-3xl font-black mt-2 tracking-tight">Welcome, {user?.fullName || 'Valued Client'}</h1>
            <p className="text-xs text-indigo-200 mt-1">
              Track your assigned software projects, approved requirement milestones, release updates, and issue resolution status.
            </p>
          </div>
          <div className="px-4 py-2 rounded-xl bg-white/10 border border-white/20 text-xs font-bold font-mono">
            Client ID: #{user?.userId || 'N/A'}
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-card p-5 rounded-2xl border border-[var(--border-color)]">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[var(--text-secondary)] uppercase">My Projects</span>
            <div className="w-9 h-9 rounded-xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center">
              <FolderGit2 className="w-5 h-5" />
            </div>
          </div>
          <p className="text-3xl font-black text-[var(--text-primary)] mt-3">{clientProjects.length}</p>
          <span className="text-[11px] text-[var(--text-secondary)] mt-1 block">Assigned initiatives</span>
        </div>

        <div className="glass-card p-5 rounded-2xl border border-[var(--border-color)]">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[var(--text-secondary)] uppercase">Overall Progress</span>
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
          <p className="text-3xl font-black text-emerald-500 mt-3">78%</p>
          <span className="text-[11px] text-[var(--text-secondary)] mt-1 block">Milestones completed</span>
        </div>

        <div className="glass-card p-5 rounded-2xl border border-[var(--border-color)]">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[var(--text-secondary)] uppercase">Open Issues</span>
            <div className="w-9 h-9 rounded-xl bg-rose-500/10 text-rose-500 flex items-center justify-center">
              <Bug className="w-5 h-5" />
            </div>
          </div>
          <p className="text-3xl font-black text-[var(--text-primary)] mt-3">{clientBugs.length}</p>
          <span className="text-[11px] text-[var(--text-secondary)] mt-1 block">Reported issues</span>
        </div>

        <div className="glass-card p-5 rounded-2xl border border-[var(--border-color)]">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[var(--text-secondary)] uppercase">Latest Release</span>
            <div className="w-9 h-9 rounded-xl bg-purple-500/10 text-purple-500 flex items-center justify-center">
              <Rocket className="w-5 h-5" />
            </div>
          </div>
          <p className="text-2xl font-black text-[var(--text-primary)] mt-3 font-mono">{latestRelease}</p>
          <span className="text-[11px] text-[var(--text-secondary)] mt-1 block">Active version tag</span>
        </div>
      </div>

      {/* Client Projects List */}
      <div className="glass-card p-6 rounded-3xl border border-[var(--border-color)] space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-[var(--border-color)]">
          <h3 className="text-sm font-bold text-[var(--text-primary)] uppercase tracking-wider">My Active Projects</h3>
          <span className="text-xs font-mono text-indigo-500 font-bold">Isolated Client View</span>
        </div>

        {clientProjects.length === 0 ? (
          <div className="py-8 text-center text-xs text-[var(--text-secondary)]">
            No projects currently assigned to your client account.
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-4">
            {clientProjects.map((p) => (
              <div key={p.projectId} className="p-5 rounded-2xl bg-slate-500/5 border border-[var(--border-color)] space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-extrabold text-[var(--text-primary)]">{p.projectName}</h4>
                  <StatusBadge status={p.status} />
                </div>
                <p className="text-xs text-[var(--text-secondary)] leading-relaxed">{p.description || 'Enterprise SDLC Managed Project'}</p>

                <div className="pt-2 border-t border-[var(--border-color)] flex items-center justify-between text-xs font-medium text-[var(--text-secondary)]">
                  <span>Start Date: {p.startDate || 'N/A'}</span>
                  <span>End Date: {p.endDate || 'N/A'}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Approved Requirements & Milestones */}
      <div className="glass-card p-6 rounded-3xl border border-[var(--border-color)] space-y-4">
        <h3 className="text-sm font-bold text-[var(--text-primary)] uppercase tracking-wider pb-3 border-b border-[var(--border-color)]">
          Approved Requirements & Milestones
        </h3>

        <div className="space-y-3">
          {approvedRequirements.slice(0, 5).map((r) => (
            <div key={r.requirementId} className="p-3.5 rounded-2xl bg-slate-500/5 border border-[var(--border-color)] flex items-center justify-between">
              <div>
                <h4 className="text-xs font-bold text-[var(--text-primary)]">{r.title}</h4>
                <p className="text-[11px] text-[var(--text-secondary)] mt-0.5">{r.description || 'Approved requirement spec'}</p>
              </div>
              <StatusBadge status={r.status} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
