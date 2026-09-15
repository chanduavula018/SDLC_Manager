import React, { useEffect, useState } from 'react';
import { RequirementService, ProjectService, TaskService } from '../../services/api';
import type { Requirement, Project, TaskItem } from '../../types';
import { DataTable, type Column } from '../../components/common/DataTable';
import { Modal } from '../../components/common/Modal';
import { ConfirmModal } from '../../components/common/ConfirmModal';
import { StatusBadge } from '../../components/common/StatusBadge';
import { DetailDrawer, type DetailTab } from '../../components/common/DetailDrawer';
import { useToast } from '../../context/ToastContext';
import { useAuth } from '../../context/AuthContext';

export const RequirementsPage: React.FC = () => {
  const toast = useToast();
  const { isAdmin, isManager } = useAuth();

  const canCreate = isAdmin || isManager;
  const canEdit = isAdmin || isManager;
  const canDelete = isAdmin || isManager;
  const [requirements, setRequirements] = useState<Requirement[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingReq, setEditingReq] = useState<Requirement | null>(null);
  const [formData, setFormData] = useState<Partial<Requirement>>({
    title: '',
    description: '',
    priority: 'HIGH',
    status: 'PENDING',
    projectId: 0,
  });
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Delete State
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [deletingReq, setDeletingReq] = useState<Requirement | null>(null);
  const [deleteSubmitting, setDeleteSubmitting] = useState(false);

  // Detail Drawer State
  const [selectedReq, setSelectedReq] = useState<Requirement | null>(null);
  const [relatedTasks, setRelatedTasks] = useState<TaskItem[]>([]);
  const [loadingDetails, setLoadingDetails] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [reqData, projData] = await Promise.all([
        RequirementService.getAll(),
        ProjectService.getAll().catch(() => []),
      ]);
      setRequirements(reqData);
      setProjects(projData);
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Failed to fetch requirements from server.';
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
    const proj = projects.find((p) => p.projectId === projectId);
    return proj ? proj.projectName : `Project #${projectId}`;
  };

  const handleOpenCreate = () => {
    setEditingReq(null);
    setFormData({
      title: '',
      description: '',
      priority: 'HIGH',
      status: 'PENDING',
      projectId: projects[0]?.projectId || 0,
    });
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (req: Requirement) => {
    setEditingReq(req);
    setFormData({
      title: req.title,
      description: req.description || '',
      priority: req.priority || 'HIGH',
      status: req.status || 'PENDING',
      projectId: req.projectId,
    });
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleOpenDelete = (req: Requirement) => {
    setDeletingReq(req);
    setIsDeleteOpen(true);
  };

  const handleViewRequirement = async (req: Requirement) => {
    setSelectedReq(req);
    if (!req.requirementId) return;

    setLoadingDetails(true);
    try {
      const tasks = await TaskService.getByRequirementId(req.requirementId).catch(() => []);
      setRelatedTasks(tasks);
    } catch {
      // ignore
    } finally {
      setLoadingDetails(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title?.trim() || !formData.projectId || formData.projectId <= 0) {
      setFormError('Please select a valid Linked Project and provide a Requirement Title.');
      return;
    }

    setFormSubmitting(true);
    setFormError(null);
    try {
      const payload = {
        ...formData,
        title: formData.title.trim(),
      };
      if (editingReq && editingReq.requirementId) {
        await RequirementService.update(editingReq.requirementId, payload);
        toast.success('Requirement Updated', `Requirement "${formData.title}" updated.`);
      } else {
        await RequirementService.create(payload);
        toast.success('Requirement Created', `Requirement "${formData.title}" created successfully.`);
      }
      setIsModalOpen(false);
      fetchData();
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Failed to save requirement.';
      setFormError(msg);
      toast.error('Save Failed', msg);
    } finally {
      setFormSubmitting(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deletingReq || !deletingReq.requirementId) return;
    setDeleteSubmitting(true);
    try {
      await RequirementService.delete(deletingReq.requirementId);
      toast.success('Requirement Deleted', `Requirement #${deletingReq.requirementId} removed.`);
      setIsDeleteOpen(false);
      fetchData();
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Failed to delete requirement.';
      toast.error('Delete Failed', msg);
    } finally {
      setDeleteSubmitting(false);
    }
  };

  const columns: Column<Requirement>[] = [
    { key: 'requirementId', header: 'ID', sortable: true },
    { key: 'title', header: 'Title', sortable: true },
    {
      key: 'description',
      header: 'Description',
      render: (r) => <span className="line-clamp-1 max-w-xs">{r.description || '-'}</span>,
    },
    {
      key: 'priority',
      header: 'Priority',
      sortable: true,
      render: (r) => <StatusBadge status={r.priority} type="priority" />,
    },
    {
      key: 'status',
      header: 'Status',
      sortable: true,
      render: (r) => <StatusBadge status={r.status} />,
    },
    {
      key: 'projectId',
      header: 'Linked Project',
      sortable: true,
      render: (r) => <span className="font-semibold text-[var(--text-primary)]">{getProjectName(r.projectId)}</span>,
    },
  ];

  const drawerTabs: DetailTab[] = [
    {
      id: 'tasks',
      label: 'Derived Tasks',
      count: relatedTasks.length,
      content: (
        <div className="space-y-3">
          {loadingDetails ? (
            <p className="text-xs text-[var(--text-secondary)]">Loading derived tasks...</p>
          ) : relatedTasks.length === 0 ? (
            <p className="text-xs text-[var(--text-secondary)]">No sprint tasks derived from this requirement yet.</p>
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
  ];

  return (
    <div>
      <DataTable
        title="Requirements Management"
        description="Define functional specifications, business goals, and priorities for engineering projects."
        columns={columns}
        data={requirements}
        keyField="requirementId"
        isLoading={loading}
        error={error}
        onRefresh={fetchData}
        onAdd={canCreate ? handleOpenCreate : undefined}
        onView={handleViewRequirement}
        onEdit={canEdit ? handleOpenEdit : undefined}
        onDelete={canDelete ? handleOpenDelete : undefined}
        searchPlaceholder="Search requirements by title, project, status..."
        statusFilterField="status"
        statusOptions={['PENDING', 'IN_PROGRESS', 'COMPLETED']}
      />

      {/* Modal Form */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingReq ? `Edit Requirement #${editingReq.requirementId}` : 'Create New Requirement'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {formError && (
            <div className="p-3 bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs rounded-xl">
              {formError}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-[var(--text-primary)] uppercase tracking-wider mb-1">
              Title *
            </label>
            <input
              type="text"
              required
              value={formData.title || ''}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g. OAuth 2.0 Single Sign-On Authentication"
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
              placeholder="Detailed functional specification..."
              className="w-full px-3.5 py-2 rounded-xl glass-input text-sm text-[var(--text-primary)] focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[var(--text-primary)] uppercase tracking-wider mb-1">
                Linked Project *
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
                Priority
              </label>
              <select
                value={formData.priority || 'HIGH'}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl form-select border border-[var(--border-color)] text-sm text-[var(--text-primary)] focus:outline-none focus:border-indigo-500"
              >
                <option value="HIGH">HIGH</option>
                <option value="MEDIUM">MEDIUM</option>
                <option value="LOW">LOW</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[var(--text-primary)] uppercase tracking-wider mb-1">
                Status
              </label>
              <select
                value={formData.status || 'PENDING'}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl form-select border border-[var(--border-color)] text-sm text-[var(--text-primary)] focus:outline-none focus:border-indigo-500"
              >
                <option value="PENDING">PENDING</option>
                <option value="IN_PROGRESS">IN_PROGRESS</option>
                <option value="COMPLETED">COMPLETED</option>
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
              {formSubmitting ? 'Saving...' : editingReq ? 'Update Requirement' : 'Create Requirement'}
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmModal
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={handleDeleteConfirm}
        isLoading={deleteSubmitting}
        title="Delete Requirement"
        message={`Are you sure you want to delete requirement "${deletingReq?.title}"?`}
      />

      {selectedReq && (
        <DetailDrawer
          isOpen={!!selectedReq}
          onClose={() => setSelectedReq(null)}
          title={selectedReq.title}
          subtitle={`Requirement ID #${selectedReq.requirementId}`}
          status={selectedReq.status}
          overviewItems={[
            { label: 'Title', value: selectedReq.title },
            { label: 'Priority', value: selectedReq.priority },
            { label: 'Status', value: selectedReq.status },
            { label: 'Linked Project', value: getProjectName(selectedReq.projectId) },
            { label: 'Description', value: selectedReq.description || 'No description' },
          ]}
          tabs={drawerTabs}
        />
      )}
    </div>
  );
};
