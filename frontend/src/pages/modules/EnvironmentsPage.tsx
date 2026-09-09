import React, { useEffect, useState } from 'react';
import { EnvironmentService, ProjectService, DeploymentService } from '../../services/api';
import type { Environment, Project, Deployment } from '../../types';
import { DataTable, type Column } from '../../components/common/DataTable';
import { Modal } from '../../components/common/Modal';
import { ConfirmModal } from '../../components/common/ConfirmModal';
import { StatusBadge } from '../../components/common/StatusBadge';
import { DetailDrawer, type DetailTab } from '../../components/common/DetailDrawer';
import { useToast } from '../../context/ToastContext';

export const EnvironmentsPage: React.FC = () => {
  const toast = useToast();
  const [environments, setEnvironments] = useState<Environment[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Form State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEnv, setEditingEnv] = useState<Environment | null>(null);
  const [formData, setFormData] = useState<Partial<Environment>>({
    environmentName: 'Development',
    description: '',
    status: 'ACTIVE',
    projectId: 0,
  });
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Delete State
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [deletingEnv, setDeletingEnv] = useState<Environment | null>(null);
  const [deleteSubmitting, setDeleteSubmitting] = useState(false);

  // Detail State
  const [selectedEnv, setSelectedEnv] = useState<Environment | null>(null);
  const [relatedDeps, setRelatedDeps] = useState<Deployment[]>([]);
  const [loadingDetails, setLoadingDetails] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [envData, projData] = await Promise.all([
        EnvironmentService.getAll(),
        ProjectService.getAll().catch(() => []),
      ]);
      setEnvironments(envData);
      setProjects(projData);
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Failed to fetch environments from server.';
      setError(msg);
      toast.error('Fetch Error', msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const getProjectName = (projectId: number) => {
    const p = projects.find((item) => item.projectId === projectId);
    return p ? p.projectName : `Project #${projectId}`;
  };

  const handleOpenCreate = () => {
    setEditingEnv(null);
    setFormData({
      environmentName: 'Development',
      description: '',
      status: 'ACTIVE',
      projectId: projects[0]?.projectId || 0,
    });
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (env: Environment) => {
    setEditingEnv(env);
    setFormData({
      environmentName: env.environmentName,
      description: env.description || '',
      status: env.status || 'ACTIVE',
      projectId: env.projectId,
    });
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleOpenDelete = (env: Environment) => {
    setDeletingEnv(env);
    setIsDeleteOpen(true);
  };

  const handleViewEnv = async (env: Environment) => {
    setSelectedEnv(env);
    if (!env.environmentId) return;

    setLoadingDetails(true);
    try {
      const deps = await DeploymentService.getByEnvironmentId(env.environmentId).catch(() => []);
      setRelatedDeps(deps);
    } catch {
      // ignore
    } finally {
      setLoadingDetails(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.environmentName || !formData.projectId) {
      setFormError('Please fill in all required fields (Environment Name, Project).');
      return;
    }

    setFormSubmitting(true);
    setFormError(null);
    try {
      if (editingEnv && editingEnv.environmentId) {
        await EnvironmentService.update(editingEnv.environmentId, formData);
        toast.success('Environment Updated', `Environment "${formData.environmentName}" updated.`);
      } else {
        await EnvironmentService.create(formData);
        toast.success('Environment Provisioned', `Environment "${formData.environmentName}" created.`);
      }
      setIsModalOpen(false);
      fetchData();
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Failed to save environment.';
      setFormError(msg);
      toast.error('Save Failed', msg);
    } finally {
      setFormSubmitting(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deletingEnv || !deletingEnv.environmentId) return;
    setDeleteSubmitting(true);
    try {
      await EnvironmentService.delete(deletingEnv.environmentId);
      toast.success('Environment Deleted', `Environment #${deletingEnv.environmentId} removed.`);
      setIsDeleteOpen(false);
      fetchData();
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Failed to delete environment.';
      toast.error('Delete Failed', msg);
    } finally {
      setDeleteSubmitting(false);
    }
  };

  const columns: Column<Environment>[] = [
    { key: 'environmentId', header: 'ID', sortable: true },
    {
      key: 'environmentName',
      header: 'Environment Name',
      sortable: true,
      render: (e) => <span className="font-bold text-[var(--text-primary)]">{e.environmentName}</span>,
    },
    {
      key: 'description',
      header: 'Description',
      render: (e) => <span className="line-clamp-1 max-w-xs">{e.description || '-'}</span>,
    },
    {
      key: 'status',
      header: 'Status',
      sortable: true,
      render: (e) => <StatusBadge status={e.status} />,
    },
    {
      key: 'projectId',
      header: 'Project',
      sortable: true,
      render: (e) => <span className="font-semibold text-[var(--text-primary)]">{getProjectName(e.projectId)}</span>,
    },
  ];

  const drawerTabs: DetailTab[] = [
    {
      id: 'deployments',
      label: 'Active Deployments',
      count: relatedDeps.length,
      content: (
        <div className="space-y-3">
          {loadingDetails ? (
            <p className="text-xs text-[var(--text-secondary)]">Loading deployments...</p>
          ) : relatedDeps.length === 0 ? (
            <p className="text-xs text-[var(--text-secondary)]">No deployments executed on this environment yet.</p>
          ) : (
            relatedDeps.map((dp) => (
              <div key={dp.deploymentId} className="glass-panel p-3.5 rounded-xl flex items-center justify-between text-xs">
                <div>
                  <p className="font-bold text-[var(--text-primary)]">Deployment #{dp.deploymentId}</p>
                  <p className="text-[11px] text-[var(--text-secondary)]">Date: {dp.deploymentDate}</p>
                </div>
                <StatusBadge status={dp.status} />
              </div>
            ))
          )}
        </div>
      ),
    },
  ];

  return (
    <div>
      <DataTable
        title="Environment Management"
        description="Provision and configure deployment targets (Development, Staging, Production)."
        columns={columns}
        data={environments}
        keyField="environmentId"
        isLoading={loading}
        error={error}
        onRefresh={fetchData}
        onAdd={handleOpenCreate}
        onView={handleViewEnv}
        onEdit={handleOpenEdit}
        onDelete={handleOpenDelete}
        searchPlaceholder="Search environments by name, status, project..."
        statusFilterField="status"
        statusOptions={['ACTIVE', 'INACTIVE', 'MAINTENANCE']}
      />

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingEnv ? `Edit Environment #${editingEnv.environmentId}` : 'Provision New Environment'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {formError && (
            <div className="p-3 bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs rounded-xl">
              {formError}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-[var(--text-primary)] uppercase tracking-wider mb-1">
              Environment Name *
            </label>
            <input
              type="text"
              required
              value={formData.environmentName || ''}
              onChange={(e) => setFormData({ ...formData, environmentName: e.target.value })}
              placeholder="e.g. Production Cluster (us-east-1)"
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
              placeholder="Infrastructure specifications and environment URL..."
              className="w-full px-3.5 py-2 rounded-xl glass-input text-sm text-[var(--text-primary)] focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[var(--text-primary)] uppercase tracking-wider mb-1">
                Project *
              </label>
              <select
                required
                value={formData.projectId || ''}
                onChange={(e) => setFormData({ ...formData, projectId: Number(e.target.value) })}
                className="w-full px-3.5 py-2 rounded-xl form-select border border-[var(--border-color)] text-sm text-[var(--text-primary)] focus:outline-none focus:border-indigo-500"
              >
                <option value="">Select Project...</option>
                {projects.map((p) => (
                  <option key={p.projectId} value={p.projectId}>
                    {p.projectName}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[var(--text-primary)] uppercase tracking-wider mb-1">
                Status
              </label>
              <select
                value={formData.status || 'ACTIVE'}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl form-select border border-[var(--border-color)] text-sm text-[var(--text-primary)] focus:outline-none focus:border-indigo-500"
              >
                <option value="ACTIVE">ACTIVE</option>
                <option value="INACTIVE">INACTIVE</option>
                <option value="MAINTENANCE">MAINTENANCE</option>
              </select>
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
              {formSubmitting ? 'Saving...' : editingEnv ? 'Update Environment' : 'Save Environment'}
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmModal
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={handleDeleteConfirm}
        isLoading={deleteSubmitting}
        title="Delete Environment"
        message={`Are you sure you want to delete environment "${deletingEnv?.environmentName}"?`}
      />

      {selectedEnv && (
        <DetailDrawer
          isOpen={!!selectedEnv}
          onClose={() => setSelectedEnv(null)}
          title={selectedEnv.environmentName}
          subtitle={`Environment ID #${selectedEnv.environmentId}`}
          status={selectedEnv.status}
          overviewItems={[
            { label: 'Environment Name', value: selectedEnv.environmentName },
            { label: 'Status', value: selectedEnv.status },
            { label: 'Project', value: getProjectName(selectedEnv.projectId) },
            { label: 'Description', value: selectedEnv.description || 'No description' },
          ]}
          tabs={drawerTabs}
        />
      )}
    </div>
  );
};
