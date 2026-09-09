import React, { useEffect, useState } from 'react';
import {
  ProjectService,
  UserService,
  RequirementService,
  TaskService,
  TestCaseService,
  BugReportService,
  VersionService,
  BuildService,
  EnvironmentService,
  DeploymentService,
} from '../../services/api';
import type {
  Project,
  User,
  Requirement,
  TaskItem,
  TestCase,
  BugReport,
  Version,
  Build,
  Environment,
  Deployment,
} from '../../types';
import { DataTable, type Column } from '../../components/common/DataTable';
import { Modal } from '../../components/common/Modal';
import { ConfirmModal } from '../../components/common/ConfirmModal';
import { StatusBadge } from '../../components/common/StatusBadge';
import { DetailDrawer, type DetailTab } from '../../components/common/DetailDrawer';
import { useToast } from '../../context/ToastContext';

export const ProjectsPage: React.FC = () => {
  const toast = useToast();
  const [projects, setProjects] = useState<Project[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Form Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [formData, setFormData] = useState<Partial<Project>>({
    projectName: '',
    description: '',
    status: 'PLANNING',
    startDate: '',
    endDate: '',
    userId: 0,
  });
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Delete Modal State
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [deletingProject, setDeletingProject] = useState<Project | null>(null);
  const [deleteSubmitting, setDeleteSubmitting] = useState(false);

  // Detail Drawer State
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [relatedReqs, setRelatedReqs] = useState<Requirement[]>([]);
  const [relatedTasks, setRelatedTasks] = useState<TaskItem[]>([]);
  const [relatedTests, setRelatedTests] = useState<TestCase[]>([]);
  const [relatedBugs, setRelatedBugs] = useState<BugReport[]>([]);
  const [relatedVersions, setRelatedVersions] = useState<Version[]>([]);
  const [relatedBuilds, setRelatedBuilds] = useState<Build[]>([]);
  const [relatedEnvs, setRelatedEnvs] = useState<Environment[]>([]);
  const [relatedDeps, setRelatedDeps] = useState<Deployment[]>([]);
  const [loadingDetails, setLoadingDetails] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [projData, userData] = await Promise.all([
        ProjectService.getAll(),
        UserService.getAll().catch(() => []),
      ]);
      setProjects(projData);
      setUsers(userData);
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Failed to fetch projects from server.';
      setError(msg);
      toast.error('Fetch Error', msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const getUserName = (userId: number) => {
    const user = users.find((u) => u.userId === userId);
    return user ? user.fullName : `User #${userId}`;
  };

  const handleOpenCreate = () => {
    setEditingProject(null);
    setFormData({
      projectName: '',
      description: '',
      status: 'PLANNING',
      startDate: new Date().toISOString().split('T')[0],
      endDate: '',
      userId: users[0]?.userId || 0,
    });
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (project: Project) => {
    setEditingProject(project);
    setFormData({
      projectName: project.projectName,
      description: project.description || '',
      status: project.status,
      startDate: project.startDate || '',
      endDate: project.endDate || '',
      userId: project.userId,
    });
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleOpenDelete = (project: Project) => {
    setDeletingProject(project);
    setIsDeleteOpen(true);
  };

  const handleViewProject = async (project: Project) => {
    setSelectedProject(project);
    if (!project.projectId) return;

    setLoadingDetails(true);
    try {
      const [reqs, tasks, tests, bugs, vers, builds, envs, deps] = await Promise.all([
        RequirementService.getByProjectId(project.projectId).catch(() => []),
        TaskService.getByProjectId(project.projectId).catch(() => []),
        TestCaseService.getByProjectId(project.projectId).catch(() => []),
        BugReportService.getByProjectId(project.projectId).catch(() => []),
        VersionService.getByProjectId(project.projectId).catch(() => []),
        BuildService.getByProjectId(project.projectId).catch(() => []),
        EnvironmentService.getByProjectId(project.projectId).catch(() => []),
        DeploymentService.getByProjectId(project.projectId).catch(() => []),
      ]);

      setRelatedReqs(reqs);
      setRelatedTasks(tasks);
      setRelatedTests(tests);
      setRelatedBugs(bugs);
      setRelatedVersions(vers);
      setRelatedBuilds(builds);
      setRelatedEnvs(envs);
      setRelatedDeps(deps);
    } catch {
      // ignore
    } finally {
      setLoadingDetails(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.projectName || !formData.status || !formData.userId) {
      setFormError('Please fill in all required fields (Project Name, Status, Owner).');
      return;
    }

    setFormSubmitting(true);
    setFormError(null);
    try {
      if (editingProject && editingProject.projectId) {
        await ProjectService.update(editingProject.projectId, formData);
        toast.success('Project Updated', `Project "${formData.projectName}" has been updated.`);
      } else {
        await ProjectService.create(formData);
        toast.success('Project Created', `Project "${formData.projectName}" created successfully.`);
      }
      setIsModalOpen(false);
      fetchData();
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Failed to save project.';
      setFormError(msg);
      toast.error('Save Failed', msg);
    } finally {
      setFormSubmitting(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deletingProject || !deletingProject.projectId) return;
    setDeleteSubmitting(true);
    try {
      await ProjectService.delete(deletingProject.projectId);
      toast.success('Project Deleted', `Project "${deletingProject.projectName}" removed.`);
      setIsDeleteOpen(false);
      fetchData();
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Failed to delete project.';
      toast.error('Delete Failed', msg);
    } finally {
      setDeleteSubmitting(false);
    }
  };

  const columns: Column<Project>[] = [
    { key: 'projectId', header: 'ID', sortable: true },
    { key: 'projectName', header: 'Project Name', sortable: true },
    {
      key: 'description',
      header: 'Description',
      render: (p) => <span className="line-clamp-1 max-w-xs">{p.description || '-'}</span>,
    },
    {
      key: 'status',
      header: 'Status',
      sortable: true,
      render: (p) => <StatusBadge status={p.status} />,
    },
    {
      key: 'userId',
      header: 'Project Owner',
      sortable: true,
      render: (p) => <span className="font-semibold text-[var(--text-primary)]">{getUserName(p.userId)}</span>,
    },
    { key: 'startDate', header: 'Start Date', sortable: true },
    { key: 'endDate', header: 'End Date', sortable: true },
  ];

  // Prepare detail drawer tabs
  const drawerTabs: DetailTab[] = [
    {
      id: 'requirements',
      label: 'Requirements',
      count: relatedReqs.length,
      content: (
        <div className="space-y-3">
          {loadingDetails ? (
            <p className="text-xs text-[var(--text-secondary)]">Loading requirements...</p>
          ) : relatedReqs.length === 0 ? (
            <p className="text-xs text-[var(--text-secondary)]">No requirements linked to this project.</p>
          ) : (
            relatedReqs.map((r) => (
              <div key={r.requirementId} className="glass-panel p-3.5 rounded-xl flex items-center justify-between text-xs">
                <div>
                  <p className="font-bold text-[var(--text-primary)]">{r.title}</p>
                  <p className="text-[11px] text-[var(--text-secondary)] line-clamp-1">{r.description}</p>
                </div>
                <StatusBadge status={r.status} />
              </div>
            ))
          )}
        </div>
      ),
    },
    {
      id: 'tasks',
      label: 'Tasks',
      count: relatedTasks.length,
      content: (
        <div className="space-y-3">
          {loadingDetails ? (
            <p className="text-xs text-[var(--text-secondary)]">Loading tasks...</p>
          ) : relatedTasks.length === 0 ? (
            <p className="text-xs text-[var(--text-secondary)]">No tasks linked to this project.</p>
          ) : (
            relatedTasks.map((t) => (
              <div key={t.taskId} className="glass-panel p-3.5 rounded-xl flex items-center justify-between text-xs">
                <div>
                  <p className="font-bold text-[var(--text-primary)]">{t.taskName}</p>
                  <p className="text-[11px] text-[var(--text-secondary)] line-clamp-1">{t.description}</p>
                </div>
                <StatusBadge status={t.status} />
              </div>
            ))
          )}
        </div>
      ),
    },
    {
      id: 'qa',
      label: 'QA & Bugs',
      count: relatedTests.length + relatedBugs.length,
      content: (
        <div className="space-y-4 text-xs">
          <div>
            <h4 className="font-bold text-[var(--text-primary)] uppercase tracking-wider mb-2">Test Cases ({relatedTests.length})</h4>
            {relatedTests.length === 0 ? (
              <p className="text-[var(--text-secondary)]">No test cases created.</p>
            ) : (
              relatedTests.map((tc) => (
                <div key={tc.testCaseId} className="glass-panel p-3 rounded-xl flex items-center justify-between mb-2">
                  <span>{tc.title}</span>
                  <StatusBadge status={tc.status} />
                </div>
              ))
            )}
          </div>
          <div>
            <h4 className="font-bold text-[var(--text-primary)] uppercase tracking-wider mb-2">Bug Reports ({relatedBugs.length})</h4>
            {relatedBugs.length === 0 ? (
              <p className="text-[var(--text-secondary)]">No bugs reported.</p>
            ) : (
              relatedBugs.map((b) => (
                <div key={b.bugId} className="glass-panel p-3 rounded-xl flex items-center justify-between mb-2">
                  <span>{b.description}</span>
                  <StatusBadge status={b.status} />
                </div>
              ))
            )}
          </div>
        </div>
      ),
    },
    {
      id: 'devops',
      label: 'DevOps & Releases',
      count: relatedVersions.length + relatedBuilds.length + relatedEnvs.length + relatedDeps.length,
      content: (
        <div className="space-y-4 text-xs">
          <div>
            <h4 className="font-bold text-[var(--text-primary)] uppercase tracking-wider mb-2">Versions ({relatedVersions.length})</h4>
            {relatedVersions.length === 0 ? (
              <p className="text-[var(--text-secondary)]">No release versions.</p>
            ) : (
              relatedVersions.map((v) => (
                <div key={v.versionId} className="glass-panel p-3 rounded-xl flex items-center justify-between mb-2">
                  <span className="font-mono text-indigo-400 font-bold">{v.versionName}</span>
                  <StatusBadge status={v.status} />
                </div>
              ))
            )}
          </div>
          <div>
            <h4 className="font-bold text-[var(--text-primary)] uppercase tracking-wider mb-2">Builds ({relatedBuilds.length})</h4>
            {relatedBuilds.length === 0 ? (
              <p className="text-[var(--text-secondary)]">No builds generated yet.</p>
            ) : (
              relatedBuilds.map((bd) => (
                <div key={bd.buildId} className="glass-panel p-3 rounded-xl flex items-center justify-between mb-2">
                  <span>Build #{bd.buildNumber}</span>
                  <StatusBadge status={bd.status} />
                </div>
              ))
            )}
          </div>
          <div>
            <h4 className="font-bold text-[var(--text-primary)] uppercase tracking-wider mb-2">Environments ({relatedEnvs.length})</h4>
            {relatedEnvs.length === 0 ? (
              <p className="text-[var(--text-secondary)]">No environments provisioned.</p>
            ) : (
              relatedEnvs.map((env) => (
                <div key={env.environmentId} className="glass-panel p-3 rounded-xl flex items-center justify-between mb-2">
                  <span>{env.environmentName}</span>
                  <StatusBadge status={env.status} />
                </div>
              ))
            )}
          </div>
          <div>
            <h4 className="font-bold text-[var(--text-primary)] uppercase tracking-wider mb-2">Deployments ({relatedDeps.length})</h4>
            {relatedDeps.length === 0 ? (
              <p className="text-[var(--text-secondary)]">No deployments performed yet.</p>
            ) : (
              relatedDeps.map((dp) => (
                <div key={dp.deploymentId} className="glass-panel p-3 rounded-xl flex items-center justify-between mb-2">
                  <span>Deployment #{dp.deploymentId} ({dp.deploymentDate})</span>
                  <StatusBadge status={dp.status} />
                </div>
              ))
            )}
          </div>
        </div>
      ),
    },
  ];

  return (
    <div>
      <DataTable
        title="Project Management"
        description="Create, monitor, and manage software engineering projects across the SDLC pipeline."
        columns={columns}
        data={projects}
        keyField="projectId"
        isLoading={loading}
        error={error}
        onRefresh={fetchData}
        onAdd={handleOpenCreate}
        onView={handleViewProject}
        onEdit={handleOpenEdit}
        onDelete={handleOpenDelete}
        searchPlaceholder="Search projects by name, status, owner..."
        statusFilterField="status"
        statusOptions={['PLANNING', 'IN_PROGRESS', 'ACTIVE', 'ON_HOLD', 'COMPLETED']}
      />

      {/* Create / Edit Form Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingProject ? `Edit Project #${editingProject.projectId}` : 'Create New Project'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {formError && (
            <div className="p-3 bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs rounded-xl">
              {formError}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-[var(--text-primary)] uppercase tracking-wider mb-1">
              Project Name *
            </label>
            <input
              type="text"
              required
              value={formData.projectName || ''}
              onChange={(e) => setFormData({ ...formData, projectName: e.target.value })}
              placeholder="e.g. NextGen Microservices Platform"
              className="w-full px-3.5 py-2 rounded-xl glass-input text-sm text-[var(--text-primary)] focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[var(--text-primary)] uppercase tracking-wider mb-1">
              Description
            </label>
            <textarea
              rows={3}
              value={formData.description || ''}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Summary of project goals and scope..."
              className="w-full px-3.5 py-2 rounded-xl glass-input text-sm text-[var(--text-primary)] focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[var(--text-primary)] uppercase tracking-wider mb-1">
                Project Owner *
              </label>
              <select
                required
                value={formData.userId || ''}
                onChange={(e) => setFormData({ ...formData, userId: Number(e.target.value) })}
                className="w-full px-3.5 py-2 rounded-xl form-select border border-[var(--border-color)] text-sm text-[var(--text-primary)] focus:outline-none focus:border-indigo-500"
              >
                <option value="">Select Owner...</option>
                {users.map((u) => (
                  <option key={u.userId} value={u.userId}>
                    {u.fullName} ({u.role})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[var(--text-primary)] uppercase tracking-wider mb-1">
                Status *
              </label>
              <select
                value={formData.status || 'PLANNING'}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl form-select border border-[var(--border-color)] text-sm text-[var(--text-primary)] focus:outline-none focus:border-indigo-500"
              >
                <option value="PLANNING">PLANNING</option>
                <option value="IN_PROGRESS">IN_PROGRESS</option>
                <option value="ACTIVE">ACTIVE</option>
                <option value="ON_HOLD">ON_HOLD</option>
                <option value="COMPLETED">COMPLETED</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[var(--text-primary)] uppercase tracking-wider mb-1">
                Start Date
              </label>
              <input
                type="date"
                value={formData.startDate || ''}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl glass-input text-sm text-[var(--text-primary)] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[var(--text-primary)] uppercase tracking-wider mb-1">
                End Date
              </label>
              <input
                type="date"
                value={formData.endDate || ''}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl glass-input text-sm text-[var(--text-primary)] focus:outline-none"
              />
            </div>
          </div>

          <div className="flex items-center justify-end space-x-3 pt-4 border-t border-[var(--border-color)] mt-6">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] bg-slate-500/10 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={formSubmitting}
              className="px-4 py-2 text-sm text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl font-medium shadow-lg shadow-indigo-600/25 transition-all disabled:opacity-50"
            >
              {formSubmitting ? 'Saving...' : editingProject ? 'Update Project' : 'Create Project'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Confirm Delete Modal */}
      <ConfirmModal
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={handleDeleteConfirm}
        isLoading={deleteSubmitting}
        title="Delete Project"
        message={`Are you sure you want to delete project "${deletingProject?.projectName}"?`}
      />

      {/* Relational Detail Drawer */}
      {selectedProject && (
        <DetailDrawer
          isOpen={!!selectedProject}
          onClose={() => setSelectedProject(null)}
          title={selectedProject.projectName}
          subtitle={`Project ID #${selectedProject.projectId}`}
          status={selectedProject.status}
          overviewItems={[
            { label: 'Project Name', value: selectedProject.projectName },
            { label: 'Status', value: selectedProject.status },
            { label: 'Owner', value: getUserName(selectedProject.userId) },
            { label: 'Start Date', value: selectedProject.startDate || 'N/A' },
            { label: 'End Date', value: selectedProject.endDate || 'N/A' },
            { label: 'Description', value: selectedProject.description || 'No description provided' },
          ]}
          tabs={drawerTabs}
        />
      )}
    </div>
  );
};
