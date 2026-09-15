export interface User {
  userId?: number;
  fullName: string;
  email: string;
  password?: string;
  role: string;
}

export interface Project {
  projectId?: number;
  projectName: string;
  description: string;
  status: string;
  startDate: string;
  endDate: string;
  userId: number;
}

export interface ProjectMember {
  memberId?: number;
  projectId: number;
  userId: number;
  assignedRole: string;
  assignedDate: string;
}

export interface Requirement {
  requirementId?: number;
  title: string;
  description: string;
  priority: string;
  status: string;
  projectId: number;
}

export interface TaskItem {
  taskId?: number;
  taskName: string;
  description: string;
  status: string;
  deadline: string;
  requirementId: number;
  projectId: number;
}

export interface TestCase {
  testCaseId?: number;
  title: string;
  description: string;
  expectedResult: string;
  status: string;
  projectId: number;
}

export interface BugReport {
  bugId?: number;
  description: string;
  severity: string;
  status: string;
  projectId: number;
  testCaseId: number;
}

export interface Documentation {
  documentId?: number;
  title: string;
  content: string;
  createdDate: string;
  taskId: number;
}

export interface Version {
  versionId?: number;
  projectId: number;
  versionName: string;
  description: string;
  status: string;
  releaseDate: string;
}

export interface Build {
  buildId?: number;
  projectId: number;
  versionId: number;
  buildNumber: string;
  status: string;
  buildDate: string;
}

export interface Environment {
  environmentId?: number;
  projectId: number;
  environmentName: string;
  description: string;
  status: string;
}

export interface Deployment {
  deploymentId?: number;
  deploymentDate: string;
  status: string;
  projectId: number;
  versionId: number;
  buildId: number;
  environmentId: number;
}

export interface ModuleStats {
  projectsCount: number;
  openBugsCount: number;
  pendingTasksCount: number;
  activeBuildsCount: number;
  activeDeploymentsCount: number;
  usersCount: number;
}

export interface DashboardSummary {
  totalProjects: number;
  openRequirements: number;
  pendingTasks: number;
  openBugReports: number;
  activeBuilds: number;
  deployments: number;
  registeredUsers: number;
  activeEnvironments: number;
  projectStatusDistribution: Record<string, number>;
  taskStatusDistribution: Record<string, number>;
  bugSeverityDistribution: Record<string, number>;
  recentProjects: Project[];
  openBugReportsList: BugReport[];
  sdlcPipelineCounts: Record<string, number>;
}

