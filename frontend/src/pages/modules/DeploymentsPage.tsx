import React, { useEffect, useState } from 'react';
import {
  DeploymentService,
  ProjectService,
  VersionService,
  BuildService,
  EnvironmentService,
} from '../../services/api';
import type { Deployment, Project, Version, Build, Environment } from '../../types';
import { DataTable, type Column } from '../../components/common/DataTable';
import { Modal } from '../../components/common/Modal';
import { ConfirmModal } from '../../components/common/ConfirmModal';
import { StatusBadge } from '../../components/common/StatusBadge';
import { DetailDrawer } from '../../components/common/DetailDrawer';
import { useToast } from '../../context/ToastContext';

export const DeploymentsPage: React.FC = () => {
  const toast = useToast();
  const [deployments, setDeployments] = useState<Deployment[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [versions, setVersions] = useState<Version[]>([]);
  const [builds, setBuilds] = useState<Build[]>([]);
  const [environments, setEnvironments] = useState<Environment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Form State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDep, setEditingDep] = useState<Deployment | null>(null);
  const [formData, setFormData] = useState<Partial<Deployment>>({
    deploymentDate: '',
    status: 'SUCCESS',
    projectId: 0,
    versionId: 0,
    buildId: 0,
    environmentId: 0,
  });
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Delete State
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [deletingDep, setDeletingDep] = useState<Deployment | null>(null);
  const [deleteSubmitting, setDeleteSubmitting] = useState(false);

  // Detail State
  const [selectedDep, setSelectedDep] = useState<Deployment | null>(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [depData, projData, verData, buildData, envData] = await Promise.all([
        DeploymentService.getAll(),
        ProjectService.getAll().catch(() => []),
        VersionService.getAll().catch(() => []),
        BuildService.getAll().catch(() => []),
        EnvironmentService.getAll().catch(() => []),
      ]);
      setDeployments(depData);
      setProjects(projData);
      setVersions(verData);
      setBuilds(buildData);
      setEnvironments(envData);
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Failed to fetch deployments from server.';
      setError(msg);
      toast.error('Fetch Error', msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const getProjectName = (id: number) => {
    const p = projects.find((item) => item.projectId === id);
    return p ? p.projectName : `Project #${id}`;
  };

  const getVersionTag = (id: number) => {
    const v = versions.find((item) => item.versionId === id);
    return v ? v.versionName : `Version #${id}`;
  };

  const getBuildNum = (id: number) => {
    const b = builds.find((item) => item.buildId === id);
    return b ? b.buildNumber : `Build #${id}`;
  };

  const getEnvName = (id: number) => {
    const e = environments.find((item) => item.environmentId === id);
    return e ? e.environmentName : `Env #${id}`;
  };

  const handleOpenCreate = () => {
    setEditingDep(null);
    setFormData({
      deploymentDate: new Date().toISOString().split('T')[0],
      status: 'SUCCESS',
      projectId: projects[0]?.projectId || 0,
      versionId: versions[0]?.versionId || 0,
      buildId: builds[0]?.buildId || 0,
      environmentId: environments[0]?.environmentId || 0,
    });
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (dep: Deployment) => {
    setEditingDep(dep);
    setFormData({
      deploymentDate: dep.deploymentDate || '',
      status: dep.status || 'SUCCESS',
      projectId: dep.projectId,
      versionId: dep.versionId,
      buildId: dep.buildId,
      environmentId: dep.environmentId,
    });
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleOpenDelete = (dep: Deployment) => {
    setDeletingDep(dep);
    setIsDeleteOpen(true);
  };

  const handleViewDeployment = (dep: Deployment) => {
    setSelectedDep(dep);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.projectId || !formData.versionId || !formData.buildId || !formData.environmentId) {
      setFormError('Please fill in all required fields (Project, Version, Build, Environment).');
      return;
    }

    setFormSubmitting(true);
    setFormError(null);
    try {
      if (editingDep && editingDep.deploymentId) {
        await DeploymentService.update(editingDep.deploymentId, formData);
        toast.success('Deployment Updated', `Deployment #${editingDep.deploymentId} updated.`);
      } else {
        await DeploymentService.create(formData);
        toast.success('Deployment Triggered', `Deployment triggered successfully.`);
      }
      setIsModalOpen(false);
      fetchData();
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Failed to save deployment.';
      setFormError(msg);
      toast.error('Save Failed', msg);
    } finally {
      setFormSubmitting(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deletingDep || !deletingDep.deploymentId) return;
    setDeleteSubmitting(true);
    try {
      await DeploymentService.delete(deletingDep.deploymentId);
      toast.success('Deployment Deleted', `Deployment #${deletingDep.deploymentId} removed.`);
      setIsDeleteOpen(false);
      fetchData();
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Failed to delete deployment.';
      toast.error('Delete Failed', msg);
    } finally {
      setDeleteSubmitting(false);
    }
  };

  const columns: Column<Deployment>[] = [
    { key: 'deploymentId', header: 'ID', sortable: true },
    {
      key: 'status',
      header: 'Deployment Status',
      sortable: true,
      render: (d) => <StatusBadge status={d.status} />,
    },
    {
      key: 'projectId',
      header: 'Project',
      sortable: true,
      render: (d) => <span className="font-semibold text-[var(--text-primary)]">{getProjectName(d.projectId)}</span>,
    },
    {
      key: 'versionId',
      header: 'Version',
      sortable: true,
      render: (d) => <span className="font-mono text-xs text-indigo-400">{getVersionTag(d.versionId)}</span>,
    },
    {
      key: 'buildId',
      header: 'Build Artifact',
      sortable: true,
      render: (d) => <span className="font-mono text-xs text-violet-400">{getBuildNum(d.buildId)}</span>,
    },
    {
      key: 'environmentId',
      header: 'Target Environment',
      sortable: true,
      render: (d) => <span className="font-semibold text-emerald-400">{getEnvName(d.environmentId)}</span>,
    },
    { key: 'deploymentDate', header: 'Deployment Date', sortable: true },
  ];

  return (
    <div>
      <DataTable
        title="Deployment Management"
        description="Release build artifacts into target environments with full DevOps traceability."
        columns={columns}
        data={deployments}
        keyField="deploymentId"
        isLoading={loading}
        error={error}
        onRefresh={fetchData}
        onAdd={handleOpenCreate}
        onView={handleViewDeployment}
        onEdit={handleOpenEdit}
        onDelete={handleOpenDelete}
        searchPlaceholder="Search deployments by status, project, environment..."
        statusFilterField="status"
        statusOptions={['PENDING', 'IN_PROGRESS', 'SUCCESS', 'FAILED']}
      />

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingDep ? `Edit Deployment #${editingDep.deploymentId}` : 'Trigger New Deployment Run'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {formError && (
            <div className="p-3 bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs rounded-xl">
              {formError}
            </div>
          )}

          {/* DevOps Pipeline Relationship Card */}
          <div className="p-3.5 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-xs space-y-1">
            <span className="font-bold text-indigo-400 uppercase tracking-wider block">DevOps Traceability Pipeline</span>
            <div className="text-[11px] text-[var(--text-secondary)]">
              Version → Build → Target Environment → Deployment Execution
            </div>
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
                Release Version *
              </label>
              <select
                required
                value={formData.versionId || ''}
                onChange={(e) => setFormData({ ...formData, versionId: Number(e.target.value) })}
                className="w-full px-3.5 py-2 rounded-xl form-select border border-[var(--border-color)] text-sm text-[var(--text-primary)] focus:outline-none focus:border-indigo-500"
              >
                <option value="">Select Version...</option>
                {versions.map((v) => (
                  <option key={v.versionId} value={v.versionId}>
                    {v.versionName}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[var(--text-primary)] uppercase tracking-wider mb-1">
                Build Artifact *
              </label>
              <select
                required
                value={formData.buildId || ''}
                onChange={(e) => setFormData({ ...formData, buildId: Number(e.target.value) })}
                className="w-full px-3.5 py-2 rounded-xl form-select border border-[var(--border-color)] text-sm text-[var(--text-primary)] focus:outline-none focus:border-indigo-500"
              >
                <option value="">Select Build Run...</option>
                {builds.map((b) => (
                  <option key={b.buildId} value={b.buildId}>
                    {b.buildNumber} ({b.status})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[var(--text-primary)] uppercase tracking-wider mb-1">
                Target Environment *
              </label>
              <select
                required
                value={formData.environmentId || ''}
                onChange={(e) => setFormData({ ...formData, environmentId: Number(e.target.value) })}
                className="w-full px-3.5 py-2 rounded-xl form-select border border-[var(--border-color)] text-sm text-[var(--text-primary)] focus:outline-none focus:border-indigo-500"
              >
                <option value="">Select Environment...</option>
                {environments.map((env) => (
                  <option key={env.environmentId} value={env.environmentId}>
                    {env.environmentName}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[var(--text-primary)] uppercase tracking-wider mb-1">
                Deployment Status
              </label>
              <select
                value={formData.status || 'SUCCESS'}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl form-select border border-[var(--border-color)] text-sm text-[var(--text-primary)] focus:outline-none focus:border-indigo-500"
              >
                <option value="PENDING">PENDING</option>
                <option value="IN_PROGRESS">IN_PROGRESS</option>
                <option value="SUCCESS">SUCCESS</option>
                <option value="FAILED">FAILED</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[var(--text-primary)] uppercase tracking-wider mb-1">
                Deployment Date
              </label>
              <input
                type="date"
                value={formData.deploymentDate || ''}
                onChange={(e) => setFormData({ ...formData, deploymentDate: e.target.value })}
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
              {formSubmitting ? 'Saving...' : editingDep ? 'Update Deployment' : 'Trigger Deployment'}
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmModal
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={handleDeleteConfirm}
        isLoading={deleteSubmitting}
        title="Delete Deployment Record"
        message={`Are you sure you want to delete deployment #${deletingDep?.deploymentId}?`}
      />

      {selectedDep && (
        <DetailDrawer
          isOpen={!!selectedDep}
          onClose={() => setSelectedDep(null)}
          title={`Deployment #${selectedDep.deploymentId}`}
          subtitle={`Executed on ${selectedDep.deploymentDate}`}
          status={selectedDep.status}
          overviewItems={[
            { label: 'Deployment ID', value: `#${selectedDep.deploymentId}` },
            { label: 'Status', value: selectedDep.status },
            { label: 'Project', value: getProjectName(selectedDep.projectId) },
            { label: 'Release Version', value: getVersionTag(selectedDep.versionId) },
            { label: 'Build Artifact', value: getBuildNum(selectedDep.buildId) },
            { label: 'Target Environment', value: getEnvName(selectedDep.environmentId) },
            { label: 'Deployment Date', value: selectedDep.deploymentDate },
          ]}
        />
      )}
    </div>
  );
};
