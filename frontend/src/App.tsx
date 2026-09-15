import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { ToastProvider } from './context/ToastContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Layout } from './components/layout/Layout';
import { AppBackground } from './components/common/AppBackground';

// Public Pages
import { LandingPage } from './pages/public/LandingPage';
import { LoginPage } from './pages/auth/LoginPage';
import { RegisterPage } from './pages/auth/RegisterPage';
import { AccessDeniedPage } from './pages/auth/AccessDeniedPage';
import { SettingsPage } from './pages/settings/SettingsPage';

// Auth & Role Guards
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { RoleGuard } from './components/auth/RoleGuard';

// Role Dashboards
import { AdminDashboard } from './pages/dashboards/AdminDashboard';
import { PMDashboard } from './pages/dashboards/PMDashboard';
import { DeveloperDashboard } from './pages/dashboards/DeveloperDashboard';
import { TesterDashboard } from './pages/dashboards/TesterDashboard';
import { DevOpsDashboard } from './pages/dashboards/DevOpsDashboard';
import { ClientPortal } from './pages/dashboards/ClientPortal';

// Module Pages
import { UsersPage } from './pages/modules/UsersPage';
import { ProjectsPage } from './pages/modules/ProjectsPage';
import { RequirementsPage } from './pages/modules/RequirementsPage';
import { TasksPage } from './pages/modules/TasksPage';
import { TestCasesPage } from './pages/modules/TestCasesPage';
import { BugReportsPage } from './pages/modules/BugReportsPage';
import { DocumentationPage } from './pages/modules/DocumentationPage';
import { VersionsPage } from './pages/modules/VersionsPage';
import { BuildsPage } from './pages/modules/BuildsPage';
import { EnvironmentsPage } from './pages/modules/EnvironmentsPage';
import { DeploymentsPage } from './pages/modules/DeploymentsPage';

// Smart Redirector for generic /dashboard route based on logged-in user role
const DashboardRedirector: React.FC = () => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;

  const role = user.role ? user.role.toUpperCase().replace(' ', '_') : '';
  if (role === 'ADMIN') return <Navigate to="/admin/dashboard" replace />;
  if (role === 'PROJECT_MANAGER') return <Navigate to="/pm/dashboard" replace />;
  if (role === 'DEVELOPER') return <Navigate to="/developer/dashboard" replace />;
  if (role === 'TESTER') return <Navigate to="/tester/dashboard" replace />;
  if (role === 'DEVOPS_ENGINEER' || role === 'DEVOPS') return <Navigate to="/devops/dashboard" replace />;
  if (role === 'CLIENT') return <Navigate to="/client/dashboard" replace />;

  return <Navigate to="/admin/dashboard" replace />;
};

export const App: React.FC = () => {
  return (
    <ThemeProvider>
      <AppBackground />
      <ToastProvider>
        <AuthProvider>
          <BrowserRouter>
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<LandingPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/access-denied" element={<AccessDeniedPage />} />

              {/* Protected Workspace Routes inside App Layout */}
              <Route element={<ProtectedRoute />}>
                <Route element={<Layout />}>
                  {/* Settings Page */}
                  <Route path="settings" element={<SettingsPage />} />
                  {/* Generic /dashboard redirector */}
                  <Route path="dashboard" element={<DashboardRedirector />} />

                  {/* Role-Specific Dashboards */}
                  <Route
                    path="admin/dashboard"
                    element={
                      <RoleGuard allowedRoles={['ADMIN']}>
                        <AdminDashboard />
                      </RoleGuard>
                    }
                  />
                  <Route
                    path="pm/dashboard"
                    element={
                      <RoleGuard allowedRoles={['ADMIN', 'PROJECT_MANAGER']}>
                        <PMDashboard />
                      </RoleGuard>
                    }
                  />
                  <Route
                    path="developer/dashboard"
                    element={
                      <RoleGuard allowedRoles={['ADMIN', 'DEVELOPER']}>
                        <DeveloperDashboard />
                      </RoleGuard>
                    }
                  />
                  <Route
                    path="tester/dashboard"
                    element={
                      <RoleGuard allowedRoles={['ADMIN', 'TESTER']}>
                        <TesterDashboard />
                      </RoleGuard>
                    }
                  />
                  <Route
                    path="devops/dashboard"
                    element={
                      <RoleGuard allowedRoles={['ADMIN', 'DEVOPS_ENGINEER']}>
                        <DevOpsDashboard />
                      </RoleGuard>
                    }
                  />
                  <Route
                    path="client/dashboard"
                    element={
                      <RoleGuard allowedRoles={['ADMIN', 'CLIENT']}>
                        <ClientPortal />
                      </RoleGuard>
                    }
                  />

                  {/* Protected Module Routes */}
                  <Route
                    path="users"
                    element={
                      <RoleGuard allowedRoles={['ADMIN']}>
                        <UsersPage />
                      </RoleGuard>
                    }
                  />
                  <Route
                    path="projects"
                    element={
                      <RoleGuard allowedRoles={['ADMIN', 'PROJECT_MANAGER', 'DEVELOPER', 'TESTER', 'DEVOPS_ENGINEER', 'CLIENT']}>
                        <ProjectsPage />
                      </RoleGuard>
                    }
                  />
                  <Route
                    path="requirements"
                    element={
                      <RoleGuard allowedRoles={['ADMIN', 'PROJECT_MANAGER', 'DEVELOPER', 'TESTER', 'CLIENT']}>
                        <RequirementsPage />
                      </RoleGuard>
                    }
                  />
                  <Route
                    path="tasks"
                    element={
                      <RoleGuard allowedRoles={['ADMIN', 'PROJECT_MANAGER', 'DEVELOPER']}>
                        <TasksPage />
                      </RoleGuard>
                    }
                  />
                  <Route
                    path="test-cases"
                    element={
                      <RoleGuard allowedRoles={['ADMIN', 'TESTER']}>
                        <TestCasesPage />
                      </RoleGuard>
                    }
                  />
                  <Route
                    path="bug-reports"
                    element={
                      <RoleGuard allowedRoles={['ADMIN', 'PROJECT_MANAGER', 'DEVELOPER', 'TESTER', 'CLIENT']}>
                        <BugReportsPage />
                      </RoleGuard>
                    }
                  />
                  <Route
                    path="documentation"
                    element={
                      <RoleGuard allowedRoles={['ADMIN', 'PROJECT_MANAGER', 'DEVELOPER', 'TESTER', 'CLIENT']}>
                        <DocumentationPage />
                      </RoleGuard>
                    }
                  />
                  <Route
                    path="versions"
                    element={
                      <RoleGuard allowedRoles={['ADMIN', 'PROJECT_MANAGER', 'DEVELOPER', 'DEVOPS_ENGINEER']}>
                        <VersionsPage />
                      </RoleGuard>
                    }
                  />
                  <Route
                    path="builds"
                    element={
                      <RoleGuard allowedRoles={['ADMIN', 'DEVELOPER', 'DEVOPS_ENGINEER']}>
                        <BuildsPage />
                      </RoleGuard>
                    }
                  />
                  <Route
                    path="environments"
                    element={
                      <RoleGuard allowedRoles={['ADMIN', 'DEVOPS_ENGINEER']}>
                        <EnvironmentsPage />
                      </RoleGuard>
                    }
                  />
                  <Route
                    path="deployments"
                    element={
                      <RoleGuard allowedRoles={['ADMIN', 'DEVOPS_ENGINEER']}>
                        <DeploymentsPage />
                      </RoleGuard>
                    }
                  />
                </Route>
              </Route>

              {/* Catch-all route */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </BrowserRouter>
        </AuthProvider>
      </ToastProvider>
    </ThemeProvider>
  );
};

export default App;
