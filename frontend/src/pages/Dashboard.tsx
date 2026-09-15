import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  FolderGit2,
  Bug,
  CheckSquare,
  Hammer,
  Rocket,
  Users,
  FileCheck2,
  Server,
  ArrowUpRight,
  Activity,
  Plus,
  GitBranch,
  BookOpen,
  TestTube,
  ShieldCheck,
  BarChart3,
  PieChart,
} from 'lucide-react';
import {
  ProjectService,
  BugReportService,
  TaskService,
  BuildService,
  DeploymentService,
  UserService,
  RequirementService,
  EnvironmentService,
  TestCaseService,
  VersionService,
  DashboardService,
} from '../services/api';
import type { Project, BugReport } from '../types';
import { StatusBadge } from '../components/common/StatusBadge';

export const Dashboard: React.FC = () => {
  const [loading, setLoading] = useState(true);

  const [stats, setStats] = useState({
    projectsCount: 0,
    requirementsCount: 0,
    pendingTasksCount: 0,
    testCasesCount: 0,
    openBugsCount: 0,
    activeBuildsCount: 0,
    activeDeploymentsCount: 0,
    usersCount: 0,
    environmentsCount: 0,
    versionsCount: 0,
  });

  const [projectStatusDist, setProjectStatusDist] = useState<Record<string, number>>({});
  const [taskStatusDist, setTaskStatusDist] = useState<Record<string, number>>({});
  const [bugSeverityDist, setBugSeverityDist] = useState<Record<string, number>>({});

  const [recentProjects, setRecentProjects] = useState<Project[]>([]);
  const [recentBugs, setRecentBugs] = useState<BugReport[]>([]);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      // Primary: call dedicated dashboard summary API
      const summary = await DashboardService.getSummary();
      setStats({
        projectsCount: summary.sdlcPipelineCounts?.projects ?? summary.totalProjects,
        requirementsCount: summary.sdlcPipelineCounts?.requirements ?? summary.openRequirements,
        pendingTasksCount: summary.pendingTasks,
        testCasesCount: summary.sdlcPipelineCounts?.testCases ?? 0,
        openBugsCount: summary.openBugReports,
        activeBuildsCount: summary.activeBuilds,
        activeDeploymentsCount: summary.deployments,
        usersCount: summary.registeredUsers,
        environmentsCount: summary.activeEnvironments,
        versionsCount: summary.sdlcPipelineCounts?.versions ?? 0,
      });
      setProjectStatusDist(summary.projectStatusDistribution || {});
      setTaskStatusDist(summary.taskStatusDistribution || {});
      setBugSeverityDist(summary.bugSeverityDistribution || {});
      setRecentProjects(summary.recentProjects || []);
      setRecentBugs(summary.openBugReportsList || []);
    } catch {
      // Fallback: fetch individual endpoints if summary API fails
      try {
        const [
          projects,
          bugs,
          tasks,
          builds,
          deployments,
          users,
          requirements,
          environments,
          testCases,
          versions,
        ] = await Promise.all([
          ProjectService.getAll().catch(() => []),
          BugReportService.getAll().catch(() => []),
          TaskService.getAll().catch(() => []),
          BuildService.getAll().catch(() => []),
          DeploymentService.getAll().catch(() => []),
          UserService.getAll().catch(() => []),
          RequirementService.getAll().catch(() => []),
          EnvironmentService.getAll().catch(() => []),
          TestCaseService.getAll().catch(() => []),
          VersionService.getAll().catch(() => []),
        ]);

        const openBugs = bugs.filter((b) => b.status?.toUpperCase() !== 'CLOSED' && b.status?.toUpperCase() !== 'RESOLVED');
        const pendingTasks = tasks.filter((t) => t.status?.toUpperCase() !== 'COMPLETED' && t.status?.toUpperCase() !== 'DONE');

        setStats({
          projectsCount: projects.length,
          requirementsCount: requirements.length,
          pendingTasksCount: pendingTasks.length,
          testCasesCount: testCases.length,
          openBugsCount: openBugs.length,
          activeBuildsCount: builds.length,
          activeDeploymentsCount: deployments.length,
          usersCount: users.length,
          environmentsCount: environments.length,
          versionsCount: versions.length,
        });

        const pDist: Record<string, number> = {};
        projects.forEach((p) => {
          const st = p.status ? p.status.toUpperCase() : 'UNKNOWN';
          pDist[st] = (pDist[st] || 0) + 1;
        });
        setProjectStatusDist(pDist);

        const tDist: Record<string, number> = {};
        tasks.forEach((t) => {
          const st = t.status ? t.status.toUpperCase() : 'UNKNOWN';
          tDist[st] = (tDist[st] || 0) + 1;
        });
        setTaskStatusDist(tDist);

        const bDist: Record<string, number> = {};
        bugs.forEach((b) => {
          const sev = b.severity ? b.severity.toUpperCase() : 'UNKNOWN';
          bDist[sev] = (bDist[sev] || 0) + 1;
        });
        setBugSeverityDist(bDist);

        setRecentProjects(projects.slice(0, 5));
        setRecentBugs(openBugs.slice(0, 5));
      } catch {
        // ignore
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const kpiCards = [
    {
      title: 'Total Projects',
      count: stats.projectsCount,
      subText: 'Active software initiatives',
      icon: FolderGit2,
      path: '/projects',
      color: 'bg-indigo-500/10 text-indigo-500 border-indigo-500/20',
    },
    {
      title: 'Open Requirements',
      count: stats.requirementsCount,
      subText: 'Functional specifications',
      icon: FileCheck2,
      path: '/requirements',
      color: 'bg-cyan-500/10 text-cyan-500 border-cyan-500/20',
    },
    {
      title: 'Pending Tasks',
      count: stats.pendingTasksCount,
      subText: 'Sprint items & work items',
      icon: CheckSquare,
      path: '/tasks',
      color: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
    },
    {
      title: 'Open Bug Reports',
      count: stats.openBugsCount,
      subText: 'Discovered issues needing fix',
      icon: Bug,
      path: '/bug-reports',
      color: 'bg-rose-500/10 text-rose-500 border-rose-500/20',
    },
    {
      title: 'Active Builds',
      count: stats.activeBuildsCount,
      subText: 'Compiled software artifacts',
      icon: Hammer,
      path: '/builds',
      color: 'bg-violet-500/10 text-violet-500 border-violet-500/20',
    },
    {
      title: 'Deployments',
      count: stats.activeDeploymentsCount,
      subText: 'Released environment runs',
      icon: Rocket,
      path: '/deployments',
      color: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
    },
    {
      title: 'Registered Users',
      count: stats.usersCount,
      subText: 'System leads & team roles',
      icon: Users,
      path: '/users',
      color: 'bg-sky-500/10 text-sky-500 border-sky-500/20',
    },
    {
      title: 'Active Environments',
      count: stats.environmentsCount,
      subText: 'Dev, Staging & Prod targets',
      icon: Server,
      path: '/environments',
      color: 'bg-teal-500/10 text-teal-500 border-teal-500/20',
    },
  ];

  // 10-step SDLC Pipeline visual items
  const pipelineSteps = [
    { name: 'Project', count: stats.projectsCount, icon: FolderGit2, path: '/projects' },
    { name: 'Requirements', count: stats.requirementsCount, icon: FileCheck2, path: '/requirements' },
    { name: 'Tasks', count: stats.pendingTasksCount, icon: CheckSquare, path: '/tasks' },
    { name: 'Test Cases', count: stats.testCasesCount, icon: TestTube, path: '/test-cases' },
    { name: 'Bug Reports', count: stats.openBugsCount, icon: Bug, path: '/bug-reports' },
    { name: 'Documentation', count: stats.requirementsCount, icon: BookOpen, path: '/documentation' },
    { name: 'Versions', count: stats.versionsCount, icon: GitBranch, path: '/versions' },
    { name: 'Builds', count: stats.activeBuildsCount, icon: Hammer, path: '/builds' },
    { name: 'Environments', count: stats.environmentsCount, icon: Server, path: '/environments' },
    { name: 'Deployments', count: stats.activeDeploymentsCount, icon: Rocket, path: '/deployments' },
  ];

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden glass-panel p-8 rounded-3xl border border-indigo-500/30 shadow-2xl">
        <div className="absolute top-0 right-0 -mt-12 -mr-12 w-80 h-80 bg-indigo-600/15 rounded-full blur-3xl pointer-events-none"></div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center space-x-2 px-3.5 py-1 rounded-full bg-indigo-500/15 border border-indigo-500/30 text-indigo-400 text-xs font-semibold mb-3">
              <ShieldCheck className="w-4 h-4 text-indigo-400" />
              <span>SDLC & DevOps Control Center</span>
            </div>
            <h1 className="text-3xl font-extrabold text-[var(--text-primary)] tracking-tight">
              Welcome to <span className="font-black text-[var(--text-primary)]">Neuro</span><span className="text-[#4f46e5] dark:text-[#818cf8]">Forge</span>
            </h1>
            <p className="text-sm text-[var(--text-secondary)] mt-2 max-w-2xl leading-relaxed">
              Manage your complete software development lifecycle in one place, from planning and requirements to development, testing, and deployment.
            </p>
          </div>
          <div className="flex items-center space-x-3 shrink-0">
            <Link
              to="/projects"
              className="px-4 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs flex items-center space-x-2 shadow-lg shadow-indigo-600/30 transition-all shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>New Project</span>
            </Link>
          </div>
        </div>
      </div>

      {/* KPI Cards Grid (8 Cards) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {kpiCards.map((card) => {
          const Icon = card.icon;
          return (
            <Link
              key={card.title}
              to={card.path}
              className="glass-panel p-5 rounded-2xl border hover:border-indigo-500/40 transition-all duration-200 group relative overflow-hidden flex flex-col justify-between"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-[var(--text-secondary)]">{card.title}</span>
                <div className={`p-2.5 rounded-xl ${card.color} border`}>
                  <Icon className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-4 flex items-baseline justify-between">
                {loading ? (
                  <div className="h-8 w-14 bg-slate-500/20 rounded animate-pulse"></div>
                ) : (
                  <span className="text-3xl font-extrabold text-[var(--text-primary)] tracking-tight">
                    {card.count}
                  </span>
                )}
                <span className="text-xs text-[var(--text-secondary)] flex items-center group-hover:text-indigo-400 transition-colors font-medium">
                  View module <ArrowUpRight className="w-3.5 h-3.5 ml-0.5" />
                </span>
              </div>
              <p className="text-[11px] text-[var(--text-secondary)] mt-2 line-clamp-1">{card.subText}</p>
            </Link>
          );
        })}
      </div>

      {/* SDLC Pipeline Workflow Visualizer */}
      <div className="glass-panel p-6 rounded-3xl border border-[var(--border-color)] space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-[var(--text-primary)] flex items-center space-x-2">
              <Activity className="w-5 h-5 text-indigo-500" />
              <span>END-TO-END SDLC LIFECYCLE PIPELINE</span>
            </h2>
            <p className="text-xs text-[var(--text-secondary)] mt-0.5">
              10 Connected Modules representing the complete software lifecycle workflow from project inception to production deployment.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
          {pipelineSteps.map((step) => {
            const StepIcon = step.icon;
            return (
              <Link
                key={step.name}
                to={step.path}
                className="flex flex-col items-center p-3.5 rounded-2xl glass-panel hover:border-indigo-500/50 hover:bg-indigo-500/10 transition-all text-center group relative"
              >
                <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-500 mb-2 border border-indigo-500/20 group-hover:scale-110 transition-transform">
                  <StepIcon className="w-4 h-4" />
                </div>
                <span className="text-[11px] font-extrabold text-[var(--text-primary)] uppercase truncate w-full tracking-tight">{step.name}</span>
                <span className="text-[11px] text-[var(--text-secondary)] mt-1 font-mono font-bold">
                  {loading ? '-' : step.count} items
                </span>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Analytics & Visual Breakdown Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Project Status Overview */}
        <div className="glass-panel p-6 rounded-2xl space-y-4">
          <div className="flex items-center justify-between border-b border-[var(--border-color)] pb-3">
            <h3 className="text-sm font-bold text-[var(--text-primary)] flex items-center space-x-2">
              <PieChart className="w-4 h-4 text-indigo-400" />
              <span>Project Status Overview</span>
            </h3>
            <Link to="/projects" className="text-xs text-indigo-400 hover:underline font-medium">
              Projects →
            </Link>
          </div>

          {loading ? (
            <div className="py-8 text-center text-xs text-[var(--text-secondary)]">Loading analytics...</div>
          ) : Object.keys(projectStatusDist).length === 0 ? (
            <div className="py-8 text-center text-xs text-[var(--text-secondary)]">No projects created yet.</div>
          ) : (
            <div className="space-y-3">
              {Object.entries(projectStatusDist).map(([status, count]) => {
                const pct = Math.round((count / (stats.projectsCount || 1)) * 100);
                return (
                  <div key={status} className="space-y-1">
                    <div className="flex justify-between text-xs font-semibold">
                      <span className="text-[var(--text-primary)]">{status}</span>
                      <span className="text-[var(--text-secondary)]">
                        {count} ({pct}%)
                      </span>
                    </div>
                    <div className="w-full h-2 bg-slate-500/20 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-indigo-500 rounded-full transition-all duration-500"
                        style={{ width: `${pct}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Task Distribution */}
        <div className="glass-panel p-6 rounded-2xl space-y-4">
          <div className="flex items-center justify-between border-b border-[var(--border-color)] pb-3">
            <h3 className="text-sm font-bold text-[var(--text-primary)] flex items-center space-x-2">
              <BarChart3 className="w-4 h-4 text-amber-400" />
              <span>Task Distribution</span>
            </h3>
            <Link to="/tasks" className="text-xs text-indigo-400 hover:underline font-medium">
              Tasks →
            </Link>
          </div>

          {loading ? (
            <div className="py-8 text-center text-xs text-[var(--text-secondary)]">Loading analytics...</div>
          ) : Object.keys(taskStatusDist).length === 0 ? (
            <div className="py-8 text-center text-xs text-[var(--text-secondary)]">No tasks logged yet.</div>
          ) : (
            <div className="space-y-3">
              {Object.entries(taskStatusDist).map(([status, count]) => {
                const totalTasks = Object.values(taskStatusDist).reduce((a, b) => a + b, 0);
                const pct = Math.round((count / (totalTasks || 1)) * 100);
                return (
                  <div key={status} className="space-y-1">
                    <div className="flex justify-between text-xs font-semibold">
                      <span className="text-[var(--text-primary)]">{status}</span>
                      <span className="text-[var(--text-secondary)]">
                        {count} ({pct}%)
                      </span>
                    </div>
                    <div className="w-full h-2 bg-slate-500/20 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-amber-500 rounded-full transition-all duration-500"
                        style={{ width: `${pct}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Bug Severity Breakdown */}
        <div className="glass-panel p-6 rounded-2xl space-y-4">
          <div className="flex items-center justify-between border-b border-[var(--border-color)] pb-3">
            <h3 className="text-sm font-bold text-[var(--text-primary)] flex items-center space-x-2">
              <Bug className="w-4 h-4 text-rose-400" />
              <span>Bug Severity Breakdown</span>
            </h3>
            <Link to="/bug-reports" className="text-xs text-indigo-400 hover:underline font-medium">
              Bugs →
            </Link>
          </div>

          {loading ? (
            <div className="py-8 text-center text-xs text-[var(--text-secondary)]">Loading analytics...</div>
          ) : Object.keys(bugSeverityDist).length === 0 ? (
            <div className="py-8 text-center text-xs text-[var(--text-secondary)]">No bugs reported. System clear! 🎉</div>
          ) : (
            <div className="space-y-3">
              {Object.entries(bugSeverityDist).map(([severity, count]) => {
                const totalBugs = Object.values(bugSeverityDist).reduce((a, b) => a + b, 0);
                const pct = Math.round((count / (totalBugs || 1)) * 100);
                let barColor = 'bg-slate-400';
                if (severity === 'CRITICAL') barColor = 'bg-rose-600';
                else if (severity === 'HIGH') barColor = 'bg-amber-500';
                else if (severity === 'MEDIUM') barColor = 'bg-blue-500';

                return (
                  <div key={severity} className="space-y-1">
                    <div className="flex justify-between text-xs font-semibold">
                      <span className="text-[var(--text-primary)]">{severity}</span>
                      <span className="text-[var(--text-secondary)]">
                        {count} ({pct}%)
                      </span>
                    </div>
                    <div className="w-full h-2 bg-slate-500/20 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${barColor} rounded-full transition-all duration-500`}
                        style={{ width: `${pct}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Recent Activity / System Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Projects */}
        <div className="glass-panel p-6 rounded-2xl space-y-4">
          <div className="flex items-center justify-between border-b border-[var(--border-color)] pb-3">
            <h3 className="text-sm font-bold text-[var(--text-primary)] flex items-center space-x-2">
              <FolderGit2 className="w-4 h-4 text-indigo-400" />
              <span>Recent Projects</span>
            </h3>
            <Link to="/projects" className="text-xs text-indigo-400 hover:underline font-medium">
              View All
            </Link>
          </div>
          {loading ? (
            <div className="py-8 text-center text-xs text-[var(--text-secondary)]">Loading projects...</div>
          ) : recentProjects.length === 0 ? (
            <div className="py-8 text-center text-xs text-[var(--text-secondary)]">No projects added yet.</div>
          ) : (
            <div className="divide-y divide-[var(--border-color)]">
              {recentProjects.map((p) => (
                <div key={p.projectId} className="py-3 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold text-[var(--text-primary)]">{p.projectName}</p>
                    <p className="text-[11px] text-[var(--text-secondary)] line-clamp-1">
                      {p.description || 'No description provided'}
                    </p>
                  </div>
                  <StatusBadge status={p.status} />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Open Bug Reports */}
        <div className="glass-panel p-6 rounded-2xl space-y-4">
          <div className="flex items-center justify-between border-b border-[var(--border-color)] pb-3">
            <h3 className="text-sm font-bold text-[var(--text-primary)] flex items-center space-x-2">
              <Bug className="w-4 h-4 text-rose-400" />
              <span>Open Bug Reports</span>
            </h3>
            <Link to="/bug-reports" className="text-xs text-indigo-400 hover:underline font-medium">
              View All
            </Link>
          </div>
          {loading ? (
            <div className="py-8 text-center text-xs text-[var(--text-secondary)]">Loading bug reports...</div>
          ) : recentBugs.length === 0 ? (
            <div className="py-8 text-center text-xs text-[var(--text-secondary)]">No open bug reports. All clean! 🎉</div>
          ) : (
            <div className="divide-y divide-[var(--border-color)]">
              {recentBugs.map((b) => (
                <div key={b.bugId} className="py-3 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold text-[var(--text-primary)] line-clamp-1">{b.description}</p>
                    <p className="text-[11px] text-[var(--text-secondary)] mt-0.5">
                      Severity:{' '}
                      <span
                        className={`font-bold ${
                          b.severity === 'CRITICAL'
                            ? 'text-rose-400'
                            : b.severity === 'HIGH'
                            ? 'text-amber-400'
                            : 'text-blue-400'
                        }`}
                      >
                        {b.severity}
                      </span>
                    </p>
                  </div>
                  <StatusBadge status={b.status} />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
