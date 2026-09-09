import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { ToastProvider } from './context/ToastContext';
import { Layout } from './components/layout/Layout';
import { Dashboard } from './pages/Dashboard';
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

export const App: React.FC = () => {
  return (
    <ThemeProvider>
      <ToastProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Layout />}>
              <Route index element={<Dashboard />} />
              <Route path="users" element={<UsersPage />} />
              <Route path="projects" element={<ProjectsPage />} />
              <Route path="requirements" element={<RequirementsPage />} />
              <Route path="tasks" element={<TasksPage />} />
              <Route path="test-cases" element={<TestCasesPage />} />
              <Route path="bug-reports" element={<BugReportsPage />} />
              <Route path="documentation" element={<DocumentationPage />} />
              <Route path="versions" element={<VersionsPage />} />
              <Route path="builds" element={<BuildsPage />} />
              <Route path="environments" element={<EnvironmentsPage />} />
              <Route path="deployments" element={<DeploymentsPage />} />
              <Route path="*" element={<Dashboard />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </ToastProvider>
    </ThemeProvider>
  );
};

export default App;
