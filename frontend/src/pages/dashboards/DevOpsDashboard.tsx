import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  GitBranch,
  Hammer,
  Server,
  Rocket,
  Activity,
  ArrowUpRight,
  Plus,
} from 'lucide-react';
import {
  VersionService,
  BuildService,
  EnvironmentService,
  DeploymentService,
} from '../../services/api';
import type { Version, Build, Environment, Deployment } from '../../types';
import { StatusBadge } from '../../components/common/StatusBadge';

export const DevOpsDashboard: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [versions, setVersions] = useState<Version[]>([]);
  const [builds, setBuilds] = useState<Build[]>([]);
  const [environments, setEnvironments] = useState<Environment[]>([]);
  const [deployments, setDeployments] = useState<Deployment[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [v, b, e, d] = await Promise.all([
          VersionService.getAll().catch(() => []),
          BuildService.getAll().catch(() => []),
          EnvironmentService.getAll().catch(() => []),
          DeploymentService.getAll().catch(() => []),
        ]);
        setVersions(v);
        setBuilds(b);
        setEnvironments(e);
        setDeployments(d);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const successfulBuilds = builds.filter((b) => b.status?.toUpperCase() === 'SUCCESS');
  const activeEnvs = environments.filter((e) => e.status?.toUpperCase() === 'ACTIVE' || e.status?.toUpperCase() === 'HEALTHY');

  if (loading) {
    return (
      <div className="py-16 text-center text-xs text-[var(--text-secondary)] flex items-center justify-center space-x-2">
        <Activity className="w-5 h-5 animate-spin text-purple-500" />
        <span>Loading DevOps Engineering Workspace...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-purple-950 via-slate-900 to-indigo-950 text-white shadow-xl relative overflow-hidden border border-purple-500/20">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div>
            <span className="px-3 py-1 rounded-full bg-purple-500/30 text-purple-300 text-xs font-bold uppercase tracking-wider border border-purple-500/30">
              DevOps & Infrastructure Workspace
            </span>
            <h1 className="text-2xl sm:text-3xl font-black mt-2 tracking-tight">Build, Release & Environment Governance</h1>
            <p className="text-xs text-purple-200 mt-1">
              Manage version tags, compiled build artifacts, server environments, and production release deployments.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link
              to="/builds"
              className="px-4 py-2.5 rounded-xl bg-white text-purple-950 hover:bg-purple-50 font-bold text-xs shadow-md transition-all flex items-center space-x-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Trigger Build</span>
            </Link>
            <Link
              to="/deployments"
              className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md transition-all flex items-center space-x-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>New Deployment</span>
            </Link>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-card p-5 rounded-2xl border border-[var(--border-color)]">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[var(--text-secondary)] uppercase">Software Versions</span>
            <div className="w-9 h-9 rounded-xl bg-sky-500/10 text-sky-500 flex items-center justify-center">
              <GitBranch className="w-5 h-5" />
            </div>
          </div>
          <p className="text-3xl font-black text-[var(--text-primary)] mt-3">{versions.length}</p>
          <span className="text-[11px] text-[var(--text-secondary)] mt-1 block">Release tags & roadmap</span>
        </div>

        <div className="glass-card p-5 rounded-2xl border border-[var(--border-color)]">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[var(--text-secondary)] uppercase">Successful Builds</span>
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
              <Hammer className="w-5 h-5" />
            </div>
          </div>
          <p className="text-3xl font-black text-[var(--text-primary)] mt-3">{successfulBuilds.length}</p>
          <span className="text-[11px] text-[var(--text-secondary)] mt-1 block">Artifacts compiled cleanly</span>
        </div>

        <div className="glass-card p-5 rounded-2xl border border-[var(--border-color)]">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[var(--text-secondary)] uppercase">Active Environments</span>
            <div className="w-9 h-9 rounded-xl bg-teal-500/10 text-teal-500 flex items-center justify-center">
              <Server className="w-5 h-5" />
            </div>
          </div>
          <p className="text-3xl font-black text-[var(--text-primary)] mt-3">{activeEnvs.length}</p>
          <span className="text-[11px] text-[var(--text-secondary)] mt-1 block">Staging & Production servers</span>
        </div>

        <div className="glass-card p-5 rounded-2xl border border-[var(--border-color)]">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[var(--text-secondary)] uppercase">Total Deployments</span>
            <div className="w-9 h-9 rounded-xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center">
              <Rocket className="w-5 h-5" />
            </div>
          </div>
          <p className="text-3xl font-black text-[var(--text-primary)] mt-3">{deployments.length}</p>
          <span className="text-[11px] text-[var(--text-secondary)] mt-1 block">Executed releases</span>
        </div>
      </div>

      {/* Environments & Recent Deployments */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Active Environments */}
        <div className="glass-card p-6 rounded-3xl border border-[var(--border-color)] space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[var(--border-color)]">
            <h3 className="text-sm font-bold text-[var(--text-primary)] uppercase tracking-wider">Infrastructure Environments</h3>
            <Link to="/environments" className="text-xs text-indigo-500 hover:text-indigo-600 font-bold flex items-center">
              <span>View All</span>
              <ArrowUpRight className="w-3.5 h-3.5 ml-1" />
            </Link>
          </div>

          <div className="space-y-3">
            {environments.slice(0, 4).map((e) => (
              <div key={e.environmentId} className="p-3.5 rounded-2xl bg-slate-500/5 border border-[var(--border-color)] flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-[var(--text-primary)]">{e.environmentName}</h4>
                  <p className="text-[11px] text-[var(--text-secondary)] mt-0.5">{e.description || 'No description'}</p>
                </div>
                <StatusBadge status={e.status} />
              </div>
            ))}
          </div>
        </div>

        {/* Recent Deployments */}
        <div className="glass-card p-6 rounded-3xl border border-[var(--border-color)] space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[var(--border-color)]">
            <h3 className="text-sm font-bold text-[var(--text-primary)] uppercase tracking-wider">Recent Release Deployments</h3>
            <Link to="/deployments" className="text-xs text-indigo-500 hover:text-indigo-600 font-bold flex items-center">
              <span>Deployment Logs</span>
              <ArrowUpRight className="w-3.5 h-3.5 ml-1" />
            </Link>
          </div>

          <div className="space-y-3">
            {deployments.slice(0, 4).map((d) => (
              <div key={d.deploymentId} className="p-3.5 rounded-2xl bg-slate-500/5 border border-[var(--border-color)] flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-[var(--text-primary)]">Deployment #{d.deploymentId}</h4>
                  <p className="text-[11px] text-[var(--text-secondary)] mt-0.5">Date: {d.deploymentDate ? d.deploymentDate.split('T')[0] : 'N/A'}</p>
                </div>
                <StatusBadge status={d.status} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
