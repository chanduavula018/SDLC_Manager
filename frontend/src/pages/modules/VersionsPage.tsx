import React, { useEffect, useState } from 'react';
import { VersionService, ProjectService, BuildService, DeploymentService } from '../../services/api';
import type { Version, Project, Build, Deployment } from '../../types';
import { DataTable, type Column } from '../../components/common/DataTable';
import { Modal } from '../../components/common/Modal';
import { ConfirmModal } from '../../components/common/ConfirmModal';
import { StatusBadge } from '../../components/common/StatusBadge';
import { DetailDrawer, type DetailTab } from '../../components/common/DetailDrawer';
import { useToast } from '../../context/ToastContext';
import { useAuth } from '../../context/AuthContext';

export const VersionsPage: React.FC = () => {
  const toast = useToast();
  const { isAdmin, isManager, isDevOps } = useAuth();

  const canCreate = isAdmin || isManager || isDevOps;
  const canEdit = isAdmin || isManager || isDevOps;
  const canDelete = isAdmin || isManager || isDevOps;
  const [versions, setVersions] = useState<Version[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Form State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingVersion, setEditingVersion] = useState<Version | null>(null);
  const [formData, setFormData] = useState<Partial<Version>>({
    versionName: '',
    description: '',
    status: 'PLANNING',
    releaseDate: '',
    projectId: 0,
  });
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Delete State
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [deletingVersion, setDeletingVersion] = useState<Version | null>(null);
  const [deleteSubmitting, setDeleteSubmitting] = useState(false);

  // Detail Drawer State
  const [selectedVersion, setSelectedVersion] = useState<Version | null>(null);
  const [relatedBuilds, setRelatedBuilds] = useState<Build[]>([]);
  const [relatedDeps, setRelatedDeps] = useState<Deployment[]>([]);
  const [loadingDetails, setLoadingDetails] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [verData, projData] = await Promise.all([
        VersionService.getAll(),
        ProjectService.getAll().catch(() => []),
      ]);
      setVersions(verData);
      setProjects(projData);
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Failed to fetch software versions from server.';
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
    setEditingVersion(null);
    setFormData({
      versionName: 'v1.0.0',
      description: '',
      status: 'PLANNING',
      releaseDate: new Date().toISOString().split('T')[0],
      projectId: projects[0]?.projectId || 0,
    });
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (ver: Version) => {
    setEditingVersion(ver);
    setFormData({
      versionName: ver.versionName,
      description: ver.description || '',
      status: ver.status || 'PLANNING',
      releaseDate: ver.releaseDate || '',
      projectId: ver.projectId,
    });
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleOpenDelete = (ver: Version) => {
    setDeletingVersion(ver);
    setIsDeleteOpen(true);
  };

  const handleViewVersion = async (ver: Version) => {
    setSelectedVersion(ver);
    if (!ver.versionId) return;

    setLoadingDetails(true);
    try {
      const [bds, deps] = await Promise.all([
        BuildService.getByVersionId(ver.versionId).catch(() => []),
        DeploymentService.getByVersionId(ver.versionId).catch(() => []),
      ]);
      setRelatedBuilds(bds);
      setRelatedDeps(deps);
    } catch {
      // ignore
    } finally {
      setLoadingDetails(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.versionName?.trim() || !formData.projectId || formData.projectId <= 0) {
      setFormError('Please select a valid Project and enter a Version Tag/Name.');
      return;
    }

    setFormSubmitting(true);
    setFormError(null);
    try {
      const payload = {
        ...formData,
        versionName: formData.versionName.trim(),
      };
      if (editingVersion && editingVersion.versionId) {
        await VersionService.update(editingVersion.versionId, payload);
        toast.success('Version Updated', `Release "${formData.versionName}" updated.`);
      } else {
        await VersionService.create(payload);
        toast.success('Version Created', `Release "${formData.versionName}" registered.`);
      }
      setIsModalOpen(false);
      fetchData();
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Failed to save release version.';
      setFormError(msg);
      toast.error('Save Failed', msg);
    } finally {
      setFormSubmitting(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deletingVersion || !deletingVersion.versionId) return;
    setDeleteSubmitting(true);
    try {
      await VersionService.delete(deletingVersion.versionId);
      toast.success('Version Deleted', `Release version #${deletingVersion.versionId} removed.`);
      setIsDeleteOpen(false);
      fetchData();
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Failed to delete release version.';
      toast.error('Delete Failed', msg);
    } finally {
      setDeleteSubmitting(false);
    }
  };

  const columns: Column<Version>[] = [
    { key: 'versionId', header: 'ID', sortable: true },
    {
      key: 'versionName',
      header: 'Version Tag',
      sortable: true,
      render: (v) => <span className="font-mono font-bold text-indigo-400">{v.versionName}</span>,
    },
    {
      key: 'description',
      header: 'Release Notes',
      render: (v) => <span className="line-clamp-1 max-w-xs">{v.description || '-'}</span>,
    },
    {
      key: 'status',
      header: 'Status',
      sortable: true,
      render: (v) => <StatusBadge status={v.status} />,
    },
    {
      key: 'projectId',
      header: 'Belongs to Project',
      sortable: true,
      render: (v) => <span className="font-semibold text-[var(--text-primary)]">{getProjectName(v.projectId)}</span>,
    },
    { key: 'releaseDate', header: 'Target Release Date', sortable: true },
  ];

  const drawerTabs: DetailTab[] = [
    {
      id: 'builds',
      label: 'Build Artifacts',
      count: relatedBuilds.length,
      content: (
        <div className="space-y-3">
          {loadingDetails ? (
            <p className="text-xs text-[var(--text-secondary)]">Loading build artifacts...</p>
          ) : relatedBuilds.length === 0 ? (
            <p className="text-xs text-[var(--text-secondary)]">No build runs associated with this release version.</p>
          ) : (
            relatedBuilds.map((b) => (
              <div key={b.buildId} className="glass-panel p-3.5 rounded-xl flex items-center justify-between text-xs">
                <div>
                  <p className="font-bold text-[var(--text-primary)]">Build #{b.buildNumber}</p>
                  <p className="text-[11px] text-[var(--text-secondary)]">Build Date: {b.buildDate || 'N/A'}</p>
                </div>
                <StatusBadge status={b.status} />
              </div>
            ))
          )}
        </div>
      ),
    },
    {
      id: 'deployments',
      label: 'Deployments',
      count: relatedDeps.length,
      content: (
        <div className="space-y-3">
          {loadingDetails ? (
            <p className="text-xs text-[var(--text-secondary)]">Loading deployments...</p>
          ) : relatedDeps.length === 0 ? (
            <p className="text-xs text-[var(--text-secondary)]">No deployments performed for this release version yet.</p>
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
        title="Software Versions"
        description="Manage software release versions, milestone tags, and release schedules."
        columns={columns}
        data={versions}
        keyField="versionId"
        isLoading={loading}
        error={error}
        onRefresh={fetchData}
        onAdd={canCreate ? handleOpenCreate : undefined}
        onView={handleViewVersion}
        onEdit={canEdit ? handleOpenEdit : undefined}
        onDelete={canDelete ? handleOpenDelete : undefined}
        searchPlaceholder="Search versions by tag, project, status..."
        statusFilterField="status"
        statusOptions={['PLANNING', 'BETA', 'RELEASED']}
      />

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingVersion ? `Edit Release Version #${editingVersion.versionId}` : 'Register New Release Version'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {formError && (
            <div className="p-3 bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs rounded-xl">
              {formError}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-[var(--text-primary)] uppercase tracking-wider mb-1">
              Version Name / Tag *
            </label>
            <input
              type="text"
              required
              value={formData.versionName || ''}
              onChange={(e) => setFormData({ ...formData, versionName: e.target.value })}
              placeholder="e.g. v1.2.0-RELEASE"
              className="w-full px-3.5 py-2 rounded-xl glass-input text-sm text-[var(--text-primary)] font-mono focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[var(--text-primary)] uppercase tracking-wider mb-1">
              Release Notes / Scope
            </label>
            <textarea
              rows={3}
              value={formData.description || ''}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Summary of major features and fixes included in this release..."
              className="w-full px-3.5 py-2 rounded-xl glass-input text-sm text-[var(--text-primary)] focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
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
                Release Status
              </label>
              <select
                value={formData.status || 'PLANNING'}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl form-select border border-[var(--border-color)] text-sm text-[var(--text-primary)] focus:outline-none focus:border-indigo-500"
              >
                <option value="PLANNING">PLANNING</option>
                <option value="BETA">BETA</option>
                <option value="RELEASED">RELEASED</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[var(--text-primary)] uppercase tracking-wider mb-1">
                Release Date
              </label>
              <input
                type="date"
                value={formData.releaseDate || ''}
                onChange={(e) => setFormData({ ...formData, releaseDate: e.target.value })}
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
              {formSubmitting ? 'Saving...' : editingVersion ? 'Update Version' : 'Create Version'}
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmModal
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={handleDeleteConfirm}
        isLoading={deleteSubmitting}
        title="Delete Release Version"
        message={`Are you sure you want to delete version "${deletingVersion?.versionName}"?`}
      />

      {selectedVersion && (
        <DetailDrawer
          isOpen={!!selectedVersion}
          onClose={() => setSelectedVersion(null)}
          title={`Version ${selectedVersion.versionName}`}
          subtitle={`Version ID #${selectedVersion.versionId}`}
          status={selectedVersion.status}
          overviewItems={[
            { label: 'Version Tag', value: selectedVersion.versionName },
            { label: 'Status', value: selectedVersion.status },
            { label: 'Project', value: getProjectName(selectedVersion.projectId) },
            { label: 'Target Release Date', value: selectedVersion.releaseDate || 'N/A' },
            { label: 'Release Notes', value: selectedVersion.description || 'No release notes' },
          ]}
          tabs={drawerTabs}
        />
      )}
    </div>
  );
};
