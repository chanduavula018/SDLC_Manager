import React from 'react';

interface StatusBadgeProps {
  status: string;
  type?: 'status' | 'priority' | 'role' | 'severity';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, type }) => {
  if (!status) return <span className="text-[var(--text-secondary)]">-</span>;

  const normalized = status.toUpperCase().replace(/\s+/g, '_');

  let colorClasses = 'bg-slate-500/15 text-slate-700 dark:text-slate-300 border-slate-500/30';

  // Priority / Severity styling
  if (type === 'severity' || type === 'priority' || normalized === 'CRITICAL' || normalized === 'BLOCKER') {
    if (normalized === 'CRITICAL' || normalized === 'BLOCKER') {
      colorClasses = 'bg-rose-500/15 text-rose-700 dark:text-rose-400 border-rose-500/30 font-bold animate-pulse';
    } else if (normalized === 'HIGH') {
      colorClasses = 'bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-500/30 font-semibold';
    } else if (normalized === 'MEDIUM') {
      colorClasses = 'bg-blue-500/15 text-blue-700 dark:text-blue-400 border-blue-500/30';
    } else if (normalized === 'LOW') {
      colorClasses = 'bg-slate-500/15 text-slate-700 dark:text-slate-400 border-slate-500/30';
    }
  }

  // Roles styling
  if (type === 'role' || normalized === 'ADMIN' || normalized === 'PROJECT_MANAGER' || normalized === 'DEVELOPER' || normalized === 'QA_TESTER' || normalized === 'DEVOPS_ENGINEER' || normalized === 'CLIENT') {
    if (normalized === 'ADMIN' || normalized === 'PROJECT_MANAGER') {
      colorClasses = 'bg-purple-500/15 text-purple-700 dark:text-purple-400 border-purple-500/30 font-semibold';
    } else if (normalized === 'DEVELOPER') {
      colorClasses = 'bg-indigo-500/15 text-indigo-700 dark:text-indigo-400 border-indigo-500/30 font-semibold';
    } else if (normalized === 'QA_TESTER' || normalized === 'TESTER') {
      colorClasses = 'bg-cyan-500/15 text-cyan-800 dark:text-cyan-400 border-cyan-500/30 font-semibold';
    } else if (normalized === 'DEVOPS_ENGINEER' || normalized === 'DEVOPS') {
      colorClasses = 'bg-emerald-500/15 text-emerald-800 dark:text-emerald-400 border-emerald-500/30 font-semibold';
    } else if (normalized === 'CLIENT') {
      colorClasses = 'bg-amber-500/15 text-amber-800 dark:text-amber-400 border-amber-500/30 font-semibold';
    }
  }

  // Standard Statuses
  if (
    normalized.includes('COMPLETED') ||
    normalized.includes('ACTIVE') ||
    normalized.includes('SUCCESS') ||
    normalized.includes('PASSED') ||
    normalized.includes('RELEASED') ||
    normalized.includes('DEPLOYED') ||
    normalized.includes('STABLE') ||
    normalized.includes('RESOLVED')
  ) {
    colorClasses = 'bg-emerald-500/15 text-emerald-800 dark:text-emerald-400 border-emerald-500/30 font-medium';
  } else if (
    normalized.includes('IN_PROGRESS') ||
    normalized.includes('RUNNING') ||
    normalized.includes('BUILDING') ||
    normalized.includes('BETA')
  ) {
    colorClasses = 'bg-indigo-500/15 text-indigo-700 dark:text-indigo-400 border-indigo-500/30 font-medium';
  } else if (
    normalized.includes('PENDING') ||
    normalized.includes('OPEN') ||
    normalized.includes('PLANNING') ||
    normalized.includes('DRAFT') ||
    normalized.includes('DEV') ||
    normalized.includes('STAGING') ||
    normalized.includes('TODO')
  ) {
    colorClasses = 'bg-amber-500/15 text-amber-800 dark:text-amber-400 border-amber-500/30 font-medium';
  } else if (
    normalized.includes('FAILED') ||
    normalized.includes('BLOCKED') ||
    normalized.includes('CLOSED') ||
    normalized.includes('INACTIVE')
  ) {
    colorClasses = 'bg-rose-500/15 text-rose-700 dark:text-rose-400 border-rose-500/30 font-medium';
  }

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] uppercase tracking-wider border ${colorClasses}`}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current mr-1.5 opacity-90"></span>
      {status.replace(/_/g, ' ')}
    </span>
  );
};
