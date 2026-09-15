import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Bug,
  CheckCircle2,
  XCircle,
  Clock,
  ArrowUpRight,
  Activity,
  Plus,
} from 'lucide-react';
import {
  TestCaseService,
  BugReportService,
} from '../../services/api';
import type { TestCase, BugReport } from '../../types';
import { StatusBadge } from '../../components/common/StatusBadge';

export const TesterDashboard: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [testCases, setTestCases] = useState<TestCase[]>([]);
  const [bugs, setBugs] = useState<BugReport[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [tc, b] = await Promise.all([
          TestCaseService.getAll().catch(() => []),
          BugReportService.getAll().catch(() => []),
        ]);
        setTestCases(tc);
        setBugs(b);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const passTests = testCases.filter((tc) => tc.status?.toUpperCase() === 'PASS' || tc.status?.toUpperCase() === 'PASSED');
  const failTests = testCases.filter((tc) => tc.status?.toUpperCase() === 'FAIL' || tc.status?.toUpperCase() === 'FAILED');
  const pendingTests = testCases.filter((tc) => tc.status?.toUpperCase() === 'PENDING');
  const openBugs = bugs.filter((b) => b.status?.toUpperCase() === 'OPEN');

  if (loading) {
    return (
      <div className="py-16 text-center text-xs text-[var(--text-secondary)] flex items-center justify-center space-x-2">
        <Activity className="w-5 h-5 animate-spin text-emerald-500" />
        <span>Loading QA & Testing Workspace...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-emerald-950 via-teal-900 to-slate-900 text-white shadow-xl relative overflow-hidden border border-emerald-500/20">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div>
            <span className="px-3 py-1 rounded-full bg-emerald-500/30 text-emerald-300 text-xs font-bold uppercase tracking-wider border border-emerald-500/30">
              QA & Testing Workspace
            </span>
            <h1 className="text-2xl sm:text-3xl font-black mt-2 tracking-tight">Quality Assurance & Defect Tracking</h1>
            <p className="text-xs text-emerald-200 mt-1">
              Formulate test cases, verify requirement compliance, execute testing suites, and report defects.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link
              to="/test-cases"
              className="px-4 py-2.5 rounded-xl bg-white text-emerald-900 hover:bg-emerald-50 font-bold text-xs shadow-md transition-all flex items-center space-x-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>New Test Case</span>
            </Link>
            <Link
              to="/bug-reports"
              className="px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-md transition-all flex items-center space-x-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Log Bug Report</span>
            </Link>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-card p-5 rounded-2xl border border-[var(--border-color)]">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[var(--text-secondary)] uppercase">Passed Tests</span>
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
          <p className="text-3xl font-black text-[var(--text-primary)] mt-3">{passTests.length}</p>
          <span className="text-[11px] text-[var(--text-secondary)] mt-1 block">Passed verification</span>
        </div>

        <div className="glass-card p-5 rounded-2xl border border-[var(--border-color)]">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[var(--text-secondary)] uppercase">Failed Tests</span>
            <div className="w-9 h-9 rounded-xl bg-rose-500/10 text-rose-500 flex items-center justify-center">
              <XCircle className="w-5 h-5" />
            </div>
          </div>
          <p className="text-3xl font-black text-[var(--text-primary)] mt-3">{failTests.length}</p>
          <span className="text-[11px] text-[var(--text-secondary)] mt-1 block">Failed & logged bugs</span>
        </div>

        <div className="glass-card p-5 rounded-2xl border border-[var(--border-color)]">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[var(--text-secondary)] uppercase">Pending Execution</span>
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <p className="text-3xl font-black text-[var(--text-primary)] mt-3">{pendingTests.length}</p>
          <span className="text-[11px] text-[var(--text-secondary)] mt-1 block">Awaiting test execution</span>
        </div>

        <div className="glass-card p-5 rounded-2xl border border-[var(--border-color)]">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[var(--text-secondary)] uppercase">Open Bug Reports</span>
            <div className="w-9 h-9 rounded-xl bg-rose-500/10 text-rose-500 flex items-center justify-center">
              <Bug className="w-5 h-5" />
            </div>
          </div>
          <p className="text-3xl font-black text-[var(--text-primary)] mt-3">{openBugs.length}</p>
          <span className="text-[11px] text-[var(--text-secondary)] mt-1 block">Active defects</span>
        </div>
      </div>

      {/* Test Cases & Bug Reports Grid */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Test Suite Execution */}
        <div className="glass-card p-6 rounded-3xl border border-[var(--border-color)] space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[var(--border-color)]">
            <h3 className="text-sm font-bold text-[var(--text-primary)] uppercase tracking-wider">Test Suite Execution</h3>
            <Link to="/test-cases" className="text-xs text-indigo-500 hover:text-indigo-600 font-bold flex items-center">
              <span>View All Test Cases</span>
              <ArrowUpRight className="w-3.5 h-3.5 ml-1" />
            </Link>
          </div>

          <div className="space-y-3">
            {testCases.slice(0, 5).map((tc) => (
              <div key={tc.testCaseId} className="p-3.5 rounded-2xl bg-slate-500/5 border border-[var(--border-color)] flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-[var(--text-primary)]">{tc.title}</h4>
                  <p className="text-[11px] text-[var(--text-secondary)] mt-0.5 line-clamp-1">Expected: {tc.expectedResult}</p>
                </div>
                <StatusBadge status={tc.status} />
              </div>
            ))}
          </div>
        </div>

        {/* Logged Bug Reports */}
        <div className="glass-card p-6 rounded-3xl border border-[var(--border-color)] space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[var(--border-color)]">
            <h3 className="text-sm font-bold text-[var(--text-primary)] uppercase tracking-wider">Logged Bug Reports</h3>
            <Link to="/bug-reports" className="text-xs text-indigo-500 hover:text-indigo-600 font-bold flex items-center">
              <span>Manage Bugs</span>
              <ArrowUpRight className="w-3.5 h-3.5 ml-1" />
            </Link>
          </div>

          <div className="space-y-3">
            {bugs.slice(0, 5).map((b) => (
              <div key={b.bugId} className="p-3.5 rounded-2xl bg-slate-500/5 border border-[var(--border-color)] flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-[var(--text-primary)] line-clamp-1">{b.description}</h4>
                  <span className="text-[10px] text-[var(--text-secondary)]">Severity: {b.severity}</span>
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
