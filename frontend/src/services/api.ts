import axios from 'axios';
import type {
  User,
  Project,
  ProjectMember,
  Requirement,
  TaskItem,
  TestCase,
  BugReport,
  Documentation,
  Version,
  Build,
  Environment,
  Deployment,
  DashboardSummary,
} from '../types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor for Auth/JWT & RBAC session integration
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  const userJson = localStorage.getItem('neuroforge_user');
  if (userJson) {
    try {
      const u = JSON.parse(userJson);
      if (u.role) config.headers['X-User-Role'] = u.role;
      if (u.userId) config.headers['X-User-Id'] = String(u.userId);
      if (u.email) config.headers['X-User-Email'] = u.email;
    } catch {}
  }
  return config;
});

// Generic API CRUD helper factory
const createCrudService = <T>(endpoint: string) => ({
  getAll: async (): Promise<T[]> => {
    const response = await apiClient.get<T[]>(endpoint);
    return response.data;
  },
  getById: async (id: number): Promise<T> => {
    const response = await apiClient.get<T>(`${endpoint}/${id}`);
    return response.data;
  },
  create: async (data: Partial<T>): Promise<T> => {
    const response = await apiClient.post<T>(endpoint, data);
    return response.data;
  },
  update: async (id: number, data: Partial<T>): Promise<T> => {
    const response = await apiClient.put<T>(`${endpoint}/${id}`, data);
    return response.data;
  },
  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`${endpoint}/${id}`);
  },
});

export const UserService = {
  ...createCrudService<User>('/users'),
  getByEmail: async (email: string): Promise<User> => {
    const res = await apiClient.get<User>(`/users/email/${email}`);
    return res.data;
  },
};

export const ProjectService = {
  ...createCrudService<Project>('/projects'),
  getByUserId: async (userId: number): Promise<Project[]> => {
    const res = await apiClient.get<Project[]>(`/projects/user/${userId}`);
    return res.data;
  },
  getMembers: async (projectId: number): Promise<ProjectMember[]> => {
    const res = await apiClient.get<ProjectMember[]>(`/projects/${projectId}/members`);
    return res.data;
  },
  addMember: async (projectId: number, userId: number): Promise<ProjectMember> => {
    const res = await apiClient.post<ProjectMember>(`/projects/${projectId}/members`, { userId });
    return res.data;
  },
  removeMember: async (projectId: number, userId: number): Promise<void> => {
    await apiClient.delete(`/projects/${projectId}/members/${userId}`);
  },
};

export const RequirementService = {
  ...createCrudService<Requirement>('/requirements'),
  getByProjectId: async (projectId: number): Promise<Requirement[]> => {
    const res = await apiClient.get<Requirement[]>(`/requirements/project/${projectId}`);
    return res.data;
  },
};

export const TaskService = {
  ...createCrudService<TaskItem>('/tasks'),
  getByProjectId: async (projectId: number): Promise<TaskItem[]> => {
    const res = await apiClient.get<TaskItem[]>(`/tasks/project/${projectId}`);
    return res.data;
  },
  getByRequirementId: async (reqId: number): Promise<TaskItem[]> => {
    const res = await apiClient.get<TaskItem[]>(`/tasks/requirement/${reqId}`);
    return res.data;
  },
};

export const TestCaseService = {
  ...createCrudService<TestCase>('/test-cases'),
  getByProjectId: async (projectId: number): Promise<TestCase[]> => {
    const res = await apiClient.get<TestCase[]>(`/test-cases/project/${projectId}`);
    return res.data;
  },
};

export const BugReportService = {
  ...createCrudService<BugReport>('/bug-reports'),
  getByProjectId: async (projectId: number): Promise<BugReport[]> => {
    const res = await apiClient.get<BugReport[]>(`/bug-reports/project/${projectId}`);
    return res.data;
  },
  getByTestCaseId: async (testCaseId: number): Promise<BugReport[]> => {
    const res = await apiClient.get<BugReport[]>(`/bug-reports/test-case/${testCaseId}`);
    return res.data;
  },
};

export const DocumentationService = {
  ...createCrudService<Documentation>('/documentation'),
  getByTaskId: async (taskId: number): Promise<Documentation[]> => {
    const res = await apiClient.get<Documentation[]>(`/documentation/task/${taskId}`);
    return res.data;
  },
};

export const VersionService = {
  ...createCrudService<Version>('/versions'),
  getByProjectId: async (projectId: number): Promise<Version[]> => {
    const res = await apiClient.get<Version[]>(`/versions/project/${projectId}`);
    return res.data;
  },
};

export const BuildService = {
  ...createCrudService<Build>('/builds'),
  getByProjectId: async (projectId: number): Promise<Build[]> => {
    const res = await apiClient.get<Build[]>(`/builds/project/${projectId}`);
    return res.data;
  },
  getByVersionId: async (versionId: number): Promise<Build[]> => {
    const res = await apiClient.get<Build[]>(`/builds/version/${versionId}`);
    return res.data;
  },
};

export const EnvironmentService = {
  ...createCrudService<Environment>('/environments'),
  getByProjectId: async (projectId: number): Promise<Environment[]> => {
    const res = await apiClient.get<Environment[]>(`/environments/project/${projectId}`);
    return res.data;
  },
};

export const DeploymentService = {
  ...createCrudService<Deployment>('/deployments'),
  getByProjectId: async (projectId: number): Promise<Deployment[]> => {
    const res = await apiClient.get<Deployment[]>(`/deployments/project/${projectId}`);
    return res.data;
  },
  getByVersionId: async (versionId: number): Promise<Deployment[]> => {
    const res = await apiClient.get<Deployment[]>(`/deployments/version/${versionId}`);
    return res.data;
  },
  getByBuildId: async (buildId: number): Promise<Deployment[]> => {
    const res = await apiClient.get<Deployment[]>(`/deployments/build/${buildId}`);
    return res.data;
  },
  getByEnvironmentId: async (envId: number): Promise<Deployment[]> => {
    const res = await apiClient.get<Deployment[]>(`/deployments/environment/${envId}`);
    return res.data;
  },
};

export const DashboardService = {
  getSummary: async (): Promise<DashboardSummary> => {
    const res = await apiClient.get<DashboardSummary>('/dashboard/summary');
    return res.data;
  },
};

