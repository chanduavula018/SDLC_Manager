import React, { useEffect, useState } from 'react';
import { BuildService, ProjectService, VersionService, DeploymentService } from '../../services/api';
import type { Build, Project, Version, Deployment } from '../../types';
import { DataTable, type Column } from '../../components/common/DataTable';
import { Modal } from '../../components/common/Modal';
import { ConfirmModal } from '../../components/common/ConfirmModal';
import { StatusBadge } from '../../components/common/StatusBadge';
import { DetailDrawer, type DetailTab } from '../../components/common/DetailDrawer';
import { useToast } from '../../context/ToastContext';

export const BuildsPage: React.FC = () => {
  const toast = useToast();
  const [builds, setBuilds] = useState<Build[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [versions, setVersions] = useState<Version[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Form State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBuild, setEditingBuild] = useState<Build | null>(null);
  const [formData, setFormData] = useState<Partial<Build>>({
    buildNumber: '',
    status: 'SUCCESS',
    buildDate: '',
    projectId: 0,
    versionId: 0,
  });
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Delete State
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [deletingBuild, setDeletingBuild] = useState<Build | null>(null);
  const [deleteSubmitting, setDeleteSubmitting] = useState(false);

  // Detail State
  const [selectedBuild, setSelectedBuild] = useState<Build | null>(null);
  const [relatedDeps, setRelatedDeps] = useState<Deployment[]>([]);
  const [loadingDetails, setLoadingDetails] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [buildData, projData, verData] = await Promise.all([
        BuildService.getAll(),
        ProjectService.getAll().catch(() => []),
        VersionService.getAll().catch(() => []),
      ]);
      setBuilds(buildData);
      setProjects(projData);
      setVersions(verData);
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Failed to fetch build runs from server.';
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

  const getVersionTag = (versionId: number) => {
    const v = versions.find((item) => item.versionId === versionId);
    return v ? v.versionName : `Version #${versionId}`;
  };

  const handleOpenCreate = () => {
    setEditingBuild(null);
    setFormData({
      buildNumber: `BUILD-${Math.floor(1000 + Math.random() * 9000)}`,
      status: 'SUCCESS',
      buildDate: new Date().toISOString().split('T')[0],
      projectId: projects[0]?.projectId || 0,
      versionId: versions[0]?.versionId || 0,
    });
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (build: Build) => {
    setEditingBuild(build);
    setFormData({
      buildNumber: build.buildNumber,
      status: build.status || 'SUCCESS',
      buildDate: build.buildDate || '',
      projectId: build.projectId,
      versionId: build.versionId,
    });
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleOpenDelete = (build: Build) => {
    setDeletingBuild(build);
    setIsDeleteOpen(true);
  };

  const handleViewBuild = async (build: Build) => {
    setSelectedBuild(build);
    if (!build.buildId) return;

    setLoadingDetails(true);
    try {
      const deps = await DeploymentService.getByBuildId(build.buildId).catch(() => []);
      setRelatedDeps(deps);
    } catch {
      // ignore
    } finally {
      setLoadingDetails(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.buildNumber || !formData.projectId || !formData.versionId) {
      setFormError('Please fill in all required fields (Build Number, Project, Version).');
      return;
    }

    setFormSubmitting(true);
    setFormError(null);
    try {
      if (editingBuild && editingBuild.buildId) {
        await BuildService.update(editingBuild.buildId, formData);
        toast.success('Build Updated', `Build #${formData.buildNumber} updated.`);
      } else {
        await BuildService.create(formData);
        toast.success('Build Executed', `Build #${formData.buildNumber} created successfully.`);
      }
      setIsModalOpen(false);
      fetchData();
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Failed to save build run.';
      setFormError(msg);
      toast.error('Save Failed', msg);
    } finally {
      setFormSubmitting(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deletingBuild || !deletingBuild.buildId) return;
    setDeleteSubmitting(true);
    try {
      await BuildService.delete(deletingBuild.buildId);
      toast.success('Build Deleted', `Build #${deletingBuild.buildId} removed.`);
      setIsDeleteOpen(false);
      fetchData();
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Failed to delete build.';
      toast.error('Delete Failed', msg);
    } finally {
      setDeleteSubmitting(false);
    }
  };

  const columns: Column<Build>[] = [
    { key: 'buildId', header: 'ID', sortable: true },
    {
      key: 'buildNumber',
      header: 'Build Identifier',
      sortable: true,
      render: (b) => <span className="font-mono font-bold text-violet-400">{b.buildNumber}</span>,
    },
    {
      key: 'status',
      header: 'Build Status',
      sortable: true,
      render: (b) => <StatusBadge status={b.status} />,
    },
    {
      key: 'projectId',
      header: 'Project',
      sortable: true,
      render: (b) => <span className="font-semibold text-[var(--text-primary)]">{getProjectName(b.projectId)}</span>,
    },
    {
      key: 'versionId',
      header: 'Compiled Version',
      sortable: true,
      render: (b) => <span className="font-mono text-xs text-indigo-400">{getVersionTag(b.versionId)}</span>,
    },
    { key: 'buildDate', header: 'Build Execution Date', sortable: true },
  ];

  const drawerTabs: DetailTab[] = [
    {
      id: 'deployments',
      label: 'Deployments',
      count: relatedDeps.length,
      content: (
        <div className="space-y-3">
          {loadingDetails ? (
            <p className="text-xs text-[var(--text-secondary)]">Loading deployments...</p>
          ) : relatedDeps.length === 0 ? (
            <p className="text-xs text-[var(--text-secondary)]">No deployments triggered using this build artifact yet.</p>
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
        title="Build Management"
        description="Track automated build jobs, compiled artifacts, and execution statuses."
        columns={columns}
        data={builds}
        keyField="buildId"
        isLoading={loading}
        error={error}
        onRefresh={fetchData}
        onAdd={handleOpenCreate}
        onView={handleViewBuild}
        onEdit={handleOpenEdit}
        onDelete={handleOpenDelete}
        searchPlaceholder="Search builds by number, status, project..."
        statusFilterField="status"
        statusOptions={['PENDING', 'RUNNING', 'SUCCESS', 'FAILED']}
      />

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingBuild ? `Edit Build #${editingBuild.buildId}` : 'Trigger New Build Run'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {formError && (
            <div className="p-3 bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs rounded-xl">
              {formError}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-[var(--text-primary)] uppercase tracking-wider mb-1">
              Build Number / Identifier *
            </label>
            <input
              type="text"
              required
              value={formData.buildNumber || ''}
              onChange={(e) => setFormData({ ...formData, buildNumber: e.target.value })}
              placeholder="e.g. BUILD-2026-0901"
              className="w-full px-3.5 py-2 rounded-xl glass-input text-sm text-[var(--text-primary)] font-mono focus:outline-none"
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
                Compiled Version *
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
                Build Status
              </label>
              <select
                value={formData.status || 'SUCCESS'}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl form-select border border-[var(--border-color)] text-sm text-[var(--text-primary)] focus:outline-none focus:border-indigo-500"
              >
                <option value="PENDING">PENDING</option>
                <option value="RUNNING">RUNNING</option>
                <option value="SUCCESS">SUCCESS</option>
                <option value="FAILED">FAILED</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[var(--text-primary)] uppercase tracking-wider mb-1">
                Build Date
              </label>
              <input
                type="date"
                value={formData.buildDate || ''}
                onChange={(e) => setFormData({ ...formData, buildDate: e.target.value })}
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
              {formSubmitting ? 'Saving...' : editingBuild ? 'Update Build' : 'Save Build Run'}
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmModal
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={handleDeleteConfirm}
        isLoading={deleteSubmitting}
        title="Delete Build"
        message={`Are you sure you want to delete build "${deletingBuild?.buildNumber}"?`}
      />

      {selectedBuild && (
        <DetailDrawer
          isOpen={!!selectedBuild}
          onClose={() => setSelectedBuild(null)}
          title={`Build #${selectedBuild.buildNumber}`}
          subtitle={`Build ID #${selectedBuild.buildId}`}
          status={selectedBuild.status}
          overviewItems={[
            { label: 'Build Number', value: selectedBuild.buildNumber },
            { label: 'Build Status', value: selectedBuild.status },
            { label: 'Project', value: getProjectName(selectedBuild.projectId) },
            { label: 'Compiled Version', value: getVersionTag(selectedBuild.versionId) },
            { label: 'Execution Date', value: selectedBuild.buildDate || 'N/A' },
          ]}
          tabs={drawerTabs}
        />
      )}
    </div>
  );
};
