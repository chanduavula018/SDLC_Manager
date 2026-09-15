import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { NeuroForgeLogo } from '../../components/common/NeuroForgeLogo';
import {
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
  ArrowRight,
  Layers,
  Sparkles,
  Zap,
  Cpu,
  CheckCircle2,
} from 'lucide-react';
export const LandingPage: React.FC = () => {
  const navigate = useNavigate();

  const handleGetStarted = () => {
    navigate('/login');
  };

  const lifecycleStages = [
    { title: 'Project', icon: FolderGit2, color: 'text-indigo-500 bg-indigo-500/10' },
    { title: 'Requirements', icon: FileCheck2, color: 'text-cyan-500 bg-cyan-500/10' },
    { title: 'Tasks', icon: CheckSquare, color: 'text-amber-500 bg-amber-500/10' },
    { title: 'Test Cases', icon: TestTube, color: 'text-emerald-500 bg-emerald-500/10' },
    { title: 'Bug Reports', icon: Bug, color: 'text-rose-500 bg-rose-500/10' },
    { title: 'Documentation', icon: BookOpen, color: 'text-purple-500 bg-purple-500/10' },
    { title: 'Versions', icon: GitBranch, color: 'text-sky-500 bg-sky-500/10' },
    { title: 'Builds', icon: Hammer, color: 'text-orange-500 bg-orange-500/10' },
    { title: 'Environments', icon: Server, color: 'text-teal-500 bg-teal-500/10' },
    { title: 'Deployments', icon: Rocket, color: 'text-indigo-600 bg-indigo-600/10' },
  ];

  const features = [
    {
      title: 'Project Management',
      desc: 'Centralize software initiatives, define timelines, and assign team ownership across enterprise portfolios.',
      icon: FolderGit2,
      color: 'text-indigo-600',
    },
    {
      title: 'Requirements Management',
      desc: 'Capture, review, and approve functional specifications connected directly to tasks and tests.',
      icon: FileCheck2,
      color: 'text-cyan-600',
    },
    {
      title: 'Task Management',
      desc: 'Assign engineering tasks, track completion deadlines, and monitor developer sprint progress.',
      icon: CheckSquare,
      color: 'text-amber-600',
    },
    {
      title: 'Test Management',
      desc: 'Formulate test cases, document execution steps, and record Pass/Fail verification results.',
      icon: TestTube,
      color: 'text-emerald-600',
    },
    {
      title: 'Bug Tracking',
      desc: 'Log defect reports linked to failed test cases with severity classification and resolution workflow.',
      icon: Bug,
      color: 'text-rose-600',
    },
    {
      title: 'Documentation',
      desc: 'Maintain architectural docs, API specs, and technical guidelines tied to development tasks.',
      icon: BookOpen,
      color: 'text-purple-600',
    },
    {
      title: 'Version Management',
      desc: 'Track software releases, version tags, release dates, and versioning roadmaps.',
      icon: GitBranch,
      color: 'text-sky-600',
    },
    {
      title: 'Build Management',
      desc: 'Monitor automated build status, commit hashes, compilation logs, and build artifacts.',
      icon: Hammer,
      color: 'text-orange-600',
    },
    {
      title: 'Environment Management',
      desc: 'Manage staging, QA, and production infrastructure environments and health status.',
      icon: Server,
      color: 'text-teal-600',
    },
    {
      title: 'Deployment Management',
      desc: 'Track release deployments to staging and production targets with execution logs.',
      icon: Rocket,
      color: 'text-indigo-600',
    },
  ];

  return (
    <div className="relative z-10 min-h-screen text-slate-800 flex flex-col selection:bg-indigo-500 selection:text-white">
      {/* Header Navigation */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200/80 px-6 lg:px-12 h-20 flex items-center justify-between shadow-xs">
        <NeuroForgeLogo size="md" onClick={() => navigate('/')} />

        <nav className="hidden md:flex items-center space-x-8 text-sm font-semibold text-slate-600">
          <a href="#home" className="hover:text-indigo-600 transition-colors">Home</a>
          <a href="#features" className="hover:text-indigo-600 transition-colors">Features</a>
          <a href="#architecture" className="hover:text-indigo-600 transition-colors">Architecture</a>
          <a href="#sdlc-flow" className="hover:text-indigo-600 transition-colors">SDLC Lifecycle</a>
        </nav>

        <div className="flex items-center space-x-4">
          <Link
            to="/register"
            className="px-3 py-2 text-slate-600 hover:text-indigo-600 font-bold text-sm transition-colors"
          >
            Register
          </Link>
          <Link
            to="/login"
            className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-md shadow-indigo-600/20 hover:shadow-indigo-600/30 hover:-translate-y-0.5 transition-all flex items-center justify-center"
          >
            Log In
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">
        {/* Hero Section */}
        <section id="home" className="relative py-20 lg:py-28 px-6 lg:px-12 max-w-7xl mx-auto text-center">
          <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-indigo-50 border border-indigo-200/80 text-indigo-700 text-xs font-bold mb-6">
            <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
            <span>Unified Software Engineering & DevOps Governance</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight leading-tight max-w-4xl mx-auto">
            Enterprise SDLC & <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-700 bg-clip-text text-transparent">DevOps Platform</span>
          </h1>

          <p className="mt-6 text-lg sm:text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed font-normal">
            Manage your complete software development lifecycle from project planning and requirements to testing, builds, environments, and production deployment.
          </p>

          <div className="mt-10 flex items-center justify-center">
            <button
              onClick={handleGetStarted}
              className="group px-8 py-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-base shadow-lg shadow-indigo-600/25 hover:shadow-indigo-600/35 hover:-translate-y-0.5 transition-all flex items-center justify-center space-x-2 cursor-pointer"
            >
              <span>Get Started Now</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>

          {/* SDLC Lifecycle Flow Visualizer Card */}
          <div id="sdlc-flow" className="mt-16 bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xl shadow-slate-200/60 max-w-5xl mx-auto">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-6">
              <div className="flex items-center space-x-2">
                <Cpu className="w-5 h-5 text-indigo-600" />
                <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider">End-to-End SDLC Lifecycle Pipeline</h3>
              </div>
              <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full">10 Connected Modules</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-5 lg:grid-cols-10 gap-3">
              {lifecycleStages.map((stage) => {
                const Icon = stage.icon;
                return (
                  <div
                    key={stage.title}
                    className="flex flex-col items-center p-3 rounded-2xl bg-slate-50 hover:bg-indigo-50/50 border border-slate-200/60 transition-all group"
                  >
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${stage.color} mb-2 shadow-xs group-hover:scale-110 transition-transform`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="text-[10px] font-extrabold text-slate-600 group-hover:text-indigo-600 transition-colors uppercase tracking-tight text-center">
                      {stage.title}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Integrated SDLC & DevOps Section */}
        <section id="architecture" className="py-16 bg-white border-y border-slate-200/80 px-6 lg:px-12">
          <div className="max-w-7xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div>
                <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-purple-50 text-purple-700 text-xs font-bold mb-4">
                  <ShieldCheck className="w-4 h-4 text-purple-600" />
                  <span>Integrated SaaS Platform</span>
                </div>
                <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight">
                  One Unified Control Center for Requirements, Code, and Infrastructure
                </h2>
                <p className="mt-4 text-base text-slate-600 leading-relaxed">
                  NeuroForge eliminates data silos between product managers, software engineers, QA testers, and DevOps engineers. Every requirement flows directly into development tasks, automated build tracking, test verification, and production release deployments.
                </p>

                <div className="mt-8 space-y-3">
                  {[
                    'Role-Based Dashboards for Admin, PM, Developers, QA, DevOps, and Clients',
                    'Database-Enforced Client Isolation for Secure Multi-Tenant Visibility',
                    'Real-Time System Health Monitoring & Spring Boot PostgreSQL Persistence',
                    'Traceable Artifact Linkage from Requirement Specification to Production Deploy',
                  ].map((text) => (
                    <div key={text} className="flex items-start space-x-3">
                      <CheckCircle2 className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
                      <span className="text-sm font-semibold text-slate-700">{text}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>
                <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-6">
                  <div className="flex items-center space-x-2">
                    <Zap className="w-5 h-5 text-indigo-400" />
                    <span className="text-sm font-mono font-bold text-indigo-400">NEUROFORGE PLATFORM CORE</span>
                  </div>
                  <span className="text-[11px] font-mono bg-emerald-500/20 text-emerald-400 px-2.5 py-1 rounded-md border border-emerald-500/30">
                    SPRING BOOT ACTIVE
                  </span>
                </div>

                <div className="space-y-3 font-mono text-xs text-slate-300">
                  <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700 flex justify-between items-center">
                    <span>Project Governance & Requirements</span>
                    <span className="text-indigo-400 font-bold">100% Synchronized</span>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700 flex justify-between items-center">
                    <span>Test Execution & Defect Tracking</span>
                    <span className="text-emerald-400 font-bold">Auto-Linked</span>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700 flex justify-between items-center">
                    <span>Build Compilation & Deployment Logs</span>
                    <span className="text-purple-400 font-bold">Live Streamed</span>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700 flex justify-between items-center">
                    <span>Client Portal Data Isolation</span>
                    <span className="text-cyan-400 font-bold">Role Enforced</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-20 px-6 lg:px-12 max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-xs font-bold text-indigo-600 uppercase tracking-widest">Enterprise Capabilities</span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight mt-2">
              Everything Needed for End-to-End SDLC Governance
            </h2>
            <p className="mt-4 text-base text-slate-600">
              Complete feature coverage tailored specifically for high-performing engineering teams.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f) => {
              const Icon = f.icon;
              return (
                <div
                  key={f.title}
                  className="bg-white p-6 rounded-3xl border border-slate-200/80 hover:border-indigo-500/40 shadow-xs hover:shadow-lg transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center mb-4">
                      <Icon className={`w-6 h-6 ${f.color}`} />
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 mb-2">{f.title}</h3>
                    <p className="text-xs text-slate-600 leading-relaxed">{f.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-10 px-6 lg:px-12 text-center text-xs text-slate-600">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-2">
            <Layers className="w-4 h-4 text-indigo-600" />
            <span className="font-bold text-slate-900">NeuroForge Enterprise SDLC & DevOps Platform</span>
          </div>
          <p>© {new Date().getFullYear()} NeuroForge Inc. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};
