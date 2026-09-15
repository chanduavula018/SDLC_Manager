import React, { useEffect, useState } from 'react';
import { TaskService, ProjectService, RequirementService, DocumentationService } from '../../services/api';
import type { TaskItem, Project, Requirement, Documentation } from '../../types';
import { DataTable, type Column } from '../../components/common/DataTable';
import { Modal } from '../../components/common/Modal';
import { ConfirmModal } from '../../components/common/ConfirmModal';
import { StatusBadge } from '../../components/common/StatusBadge';
import { DetailDrawer, type DetailTab } from '../../components/common/DetailDrawer';
import { useToast } from '../../context/ToastContext';
import { useAuth } from '../../context/AuthContext';

export const TasksPage: React.FC = () => {
  const toast = useToast();
  const { isAdmin, isManager, isDeveloper } = useAuth();

  const canCreate = isAdmin || isManager;
  const canEdit = isAdmin || isManager || isDeveloper;
  const canDelete = isAdmin || isManager;
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [requirements, setRequirements] = useState<Requirement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Form State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<TaskItem | null>(null);
  const [formData, setFormData] = useState<Partial<TaskItem>>({
    taskName: '',
    description: '',
    status: 'TODO',
    deadline: '',
    requirementId: 0,
    projectId: 0,
  });
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Delete State
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [deletingTask, setDeletingTask] = useState<TaskItem | null>(null);
  const [deleteSubmitting, setDeleteSubmitting] = useState(false);

  // Detail Drawer State
  const [selectedTask, setSelectedTask] = useState<TaskItem | null>(null);
  const [relatedDocs, setRelatedDocs] = useState<Documentation[]>([]);
  const [loadingDetails, setLoadingDetails] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [taskData, projData, reqData] = await Promise.all([
        TaskService.getAll(),
        ProjectService.getAll().catch(() => []),
        RequirementService.getAll().catch(() => []),
      ]);
      setTasks(taskData);
      setProjects(projData);
      setRequirements(reqData);
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Failed to fetch tasks from server.';
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

  const getReqTitle = (reqId: number) => {
    const req = requirements.find((r) => r.requirementId === reqId);
    return req ? req.title : `Req #${reqId}`;
  };

  const handleOpenCreate = () => {
    setEditingTask(null);
    setFormData({
      taskName: '',
      description: '',
      status: 'TODO',
      deadline: new Date().toISOString().split('T')[0],
      requirementId: requirements[0]?.requirementId || 0,
      projectId: projects[0]?.projectId || 0,
    });
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (taskItem: TaskItem) => {
    setEditingTask(taskItem);
    setFormData({
      taskName: taskItem.taskName,
      description: taskItem.description || '',
      status: taskItem.status || 'TODO',
      deadline: taskItem.deadline || '',
      requirementId: taskItem.requirementId,
      projectId: taskItem.projectId,
    });
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleOpenDelete = (taskItem: TaskItem) => {
    setDeletingTask(taskItem);
    setIsDeleteOpen(true);
  };

  const handleViewTask = async (taskItem: TaskItem) => {
    setSelectedTask(taskItem);
    if (!taskItem.taskId) return;

    setLoadingDetails(true);
    try {
      const docs = await DocumentationService.getByTaskId(taskItem.taskId).catch(() => []);
      setRelatedDocs(docs);
    } catch {
      // ignore
    } finally {
      setLoadingDetails(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.taskName?.trim() || !formData.projectId || formData.projectId <= 0 || !formData.requirementId || formData.requirementId <= 0) {
      setFormError('Please select a valid Project and Requirement, and enter a Task Name.');
      return;
    }

    setFormSubmitting(true);
    setFormError(null);
    try {
      const payload = {
        ...formData,
        taskName: formData.taskName.trim(),
      };
      if (editingTask && editingTask.taskId) {
        await TaskService.update(editingTask.taskId, payload);
        toast.success('Task Updated', `Task "${formData.taskName}" updated.`);
      } else {
        await TaskService.create(payload);
        toast.success('Task Created', `Task "${formData.taskName}" created successfully.`);
      }
      setIsModalOpen(false);
      fetchData();
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Failed to save task.';
      setFormError(msg);
      toast.error('Save Failed', msg);
    } finally {
      setFormSubmitting(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deletingTask || !deletingTask.taskId) return;
    setDeleteSubmitting(true);
    try {
      await TaskService.delete(deletingTask.taskId);
      toast.success('Task Deleted', `Task #${deletingTask.taskId} removed.`);
      setIsDeleteOpen(false);
      fetchData();
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Failed to delete task.';
      toast.error('Delete Failed', msg);
    } finally {
      setDeleteSubmitting(false);
    }
  };

  const columns: Column<TaskItem>[] = [
    { key: 'taskId', header: 'ID', sortable: true },
    { key: 'taskName', header: 'Task Name', sortable: true },
    {
      key: 'description',
      header: 'Description',
      render: (t) => <span className="line-clamp-1 max-w-xs">{t.description || '-'}</span>,
    },
    {
      key: 'status',
      header: 'Status',
      sortable: true,
      render: (t) => <StatusBadge status={t.status} />,
    },
    {
      key: 'projectId',
      header: 'Project',
      sortable: true,
      render: (t) => <span className="font-semibold text-[var(--text-primary)]">{getProjectName(t.projectId)}</span>,
    },
    {
      key: 'requirementId',
      header: 'Requirement',
      sortable: true,
      render: (t) => <span className="text-xs text-[var(--text-secondary)]">{getReqTitle(t.requirementId)}</span>,
    },
    { key: 'deadline', header: 'Deadline', sortable: true },
  ];

  const drawerTabs: DetailTab[] = [
    {
      id: 'docs',
      label: 'Documentation',
      count: relatedDocs.length,
      content: (
        <div className="space-y-3">
          {loadingDetails ? (
            <p className="text-xs text-[var(--text-secondary)]">Loading documentation...</p>
          ) : relatedDocs.length === 0 ? (
            <p className="text-xs text-[var(--text-secondary)]">No documentation pages created for this task yet.</p>
          ) : (
            relatedDocs.map((d) => (
              <div key={d.documentId} className="glass-panel p-3.5 rounded-xl text-xs space-y-1">
                <p className="font-bold text-[var(--text-primary)]">{d.title}</p>
                <p className="text-[11px] text-[var(--text-secondary)] line-clamp-2">{d.content}</p>
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
        title="Task Management"
        description="Organize work items, sprint tasks, deadlines, and link them to requirements."
        columns={columns}
        data={tasks}
        keyField="taskId"
        isLoading={loading}
        error={error}
        onRefresh={fetchData}
        onAdd={canCreate ? handleOpenCreate : undefined}
        onView={handleViewTask}
        onEdit={canEdit ? handleOpenEdit : undefined}
        onDelete={canDelete ? handleOpenDelete : undefined}
        searchPlaceholder="Search tasks by name, project, requirement..."
        statusFilterField="status"
        statusOptions={['TODO', 'IN_PROGRESS', 'COMPLETED']}
      />

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingTask ? `Edit Task #${editingTask.taskId}` : 'Create New Task'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {formError && (
            <div className="p-3 bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs rounded-xl">
              {formError}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-[var(--text-primary)] uppercase tracking-wider mb-1">
              Task Name *
            </label>
            <input
              type="text"
              required
              value={formData.taskName || ''}
              onChange={(e) => setFormData({ ...formData, taskName: e.target.value })}
              placeholder="e.g. Implement JWT Auth Token Refreshes"
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
              placeholder="Detailed description of task deliverables..."
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
                onChange={(e) => {
                  const pId = Number(e.target.value);
                  setFormData({ ...formData, projectId: pId, requirementId: 0 });
                }}
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
                Linked Requirement *
              </label>
              <select
                required
                value={formData.requirementId || ''}
                onChange={(e) => setFormData({ ...formData, requirementId: Number(e.target.value) })}
                className="w-full px-3.5 py-2 rounded-xl form-select border border-[var(--border-color)] text-sm text-[var(--text-primary)] focus:outline-none focus:border-indigo-500"
              >
                <option value="">Select Requirement...</option>
                {requirements
                  .filter((r) => !formData.projectId || r.projectId === formData.projectId)
                  .map((r) => (
                    <option key={r.requirementId} value={r.requirementId}>
                      {r.title}
                    </option>
                  ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[var(--text-primary)] uppercase tracking-wider mb-1">
                Status
              </label>
              <select
                value={formData.status || 'TODO'}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl form-select border border-[var(--border-color)] text-sm text-[var(--text-primary)] focus:outline-none focus:border-indigo-500"
              >
                <option value="TODO">TODO</option>
                <option value="IN_PROGRESS">IN_PROGRESS</option>
                <option value="COMPLETED">COMPLETED</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[var(--text-primary)] uppercase tracking-wider mb-1">
                Deadline
              </label>
              <input
                type="date"
                value={formData.deadline || ''}
                onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
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
              {formSubmitting ? 'Saving...' : editingTask ? 'Update Task' : 'Create Task'}
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmModal
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={handleDeleteConfirm}
        isLoading={deleteSubmitting}
        title="Delete Task"
        message={`Are you sure you want to delete task "${deletingTask?.taskName}"?`}
      />

      {selectedTask && (
        <DetailDrawer
          isOpen={!!selectedTask}
          onClose={() => setSelectedTask(null)}
          title={selectedTask.taskName}
          subtitle={`Task ID #${selectedTask.taskId}`}
          status={selectedTask.status}
          overviewItems={[
            { label: 'Task Name', value: selectedTask.taskName },
            { label: 'Status', value: selectedTask.status },
            { label: 'Deadline', value: selectedTask.deadline || 'N/A' },
            { label: 'Linked Project', value: getProjectName(selectedTask.projectId) },
            { label: 'Linked Requirement', value: getReqTitle(selectedTask.requirementId) },
            { label: 'Description', value: selectedTask.description || 'No description' },
          ]}
          tabs={drawerTabs}
        />
      )}
    </div>
  );
};
