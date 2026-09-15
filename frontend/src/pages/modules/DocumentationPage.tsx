import React, { useEffect, useState } from 'react';
import { DocumentationService, TaskService } from '../../services/api';
import type { Documentation, TaskItem } from '../../types';
import { DataTable, type Column } from '../../components/common/DataTable';
import { Modal } from '../../components/common/Modal';
import { ConfirmModal } from '../../components/common/ConfirmModal';
import { DetailDrawer } from '../../components/common/DetailDrawer';
import { useToast } from '../../context/ToastContext';
import { useAuth } from '../../context/AuthContext';

export const DocumentationPage: React.FC = () => {
  const toast = useToast();
  const { isAdmin, isManager, isDeveloper } = useAuth();

  const canCreate = isAdmin || isManager || isDeveloper;
  const canEdit = isAdmin || isManager || isDeveloper;
  const canDelete = isAdmin || isManager || isDeveloper;
  const [docs, setDocs] = useState<Documentation[]>([]);
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Form State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDoc, setEditingDoc] = useState<Documentation | null>(null);
  const [formData, setFormData] = useState<Partial<Documentation>>({
    title: '',
    content: '',
    createdDate: '',
    taskId: 0,
  });
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Delete State
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [deletingDoc, setDeletingDoc] = useState<Documentation | null>(null);
  const [deleteSubmitting, setDeleteSubmitting] = useState(false);

  // Detail State
  const [selectedDoc, setSelectedDoc] = useState<Documentation | null>(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [docData, taskData] = await Promise.all([
        DocumentationService.getAll(),
        TaskService.getAll().catch(() => []),
      ]);
      setDocs(docData);
      setTasks(taskData);
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Failed to fetch documentation from server.';
      setError(msg);
      toast.error('Fetch Error', msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const getTaskName = (taskId: number) => {
    const t = tasks.find((item) => item.taskId === taskId);
    return t ? t.taskName : `Task #${taskId}`;
  };

  const handleOpenCreate = () => {
    setEditingDoc(null);
    setFormData({
      title: '',
      content: '',
      createdDate: new Date().toISOString().split('T')[0],
      taskId: tasks[0]?.taskId || 0,
    });
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (doc: Documentation) => {
    setEditingDoc(doc);
    setFormData({
      title: doc.title,
      content: doc.content || '',
      createdDate: doc.createdDate || '',
      taskId: doc.taskId,
    });
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleOpenDelete = (doc: Documentation) => {
    setDeletingDoc(doc);
    setIsDeleteOpen(true);
  };

  const handleViewDoc = (doc: Documentation) => {
    setSelectedDoc(doc);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title?.trim() || !formData.taskId || formData.taskId <= 0) {
      setFormError('Please select a valid Associated Task and enter a Document Title.');
      return;
    }

    setFormSubmitting(true);
    setFormError(null);
    try {
      const payload = {
        ...formData,
        title: formData.title.trim(),
      };
      if (editingDoc && editingDoc.documentId) {
        await DocumentationService.update(editingDoc.documentId, payload);
        toast.success('Document Updated', `Document "${formData.title}" updated.`);
      } else {
        await DocumentationService.create(payload);
        toast.success('Document Created', `Document "${formData.title}" published successfully.`);
      }
      setIsModalOpen(false);
      fetchData();
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Failed to save document.';
      setFormError(msg);
      toast.error('Save Failed', msg);
    } finally {
      setFormSubmitting(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deletingDoc || !deletingDoc.documentId) return;
    setDeleteSubmitting(true);
    try {
      await DocumentationService.delete(deletingDoc.documentId);
      toast.success('Document Deleted', `Document #${deletingDoc.documentId} removed.`);
      setIsDeleteOpen(false);
      fetchData();
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Failed to delete document.';
      toast.error('Delete Failed', msg);
    } finally {
      setDeleteSubmitting(false);
    }
  };

  const columns: Column<Documentation>[] = [
    { key: 'documentId', header: 'ID', sortable: true },
    { key: 'title', header: 'Document Title', sortable: true },
    {
      key: 'content',
      header: 'Content Preview',
      render: (d) => <span className="line-clamp-1 max-w-md text-xs text-[var(--text-secondary)]">{d.content || '-'}</span>,
    },
    {
      key: 'taskId',
      header: 'Associated Task',
      sortable: true,
      render: (d) => <span className="font-semibold text-[var(--text-primary)]">{getTaskName(d.taskId)}</span>,
    },
    { key: 'createdDate', header: 'Created Date', sortable: true },
  ];

  return (
    <div>
      <DataTable
        title="Documentation Management"
        description="Maintain technical documentation, architecture decisions, and task execution specs."
        columns={columns}
        data={docs}
        keyField="documentId"
        isLoading={loading}
        error={error}
        onRefresh={fetchData}
        onAdd={canCreate ? handleOpenCreate : undefined}
        onView={handleViewDoc}
        onEdit={canEdit ? handleOpenEdit : undefined}
        onDelete={canDelete ? handleOpenDelete : undefined}
        searchPlaceholder="Search documentation by title, task, content..."
      />

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingDoc ? `Edit Document #${editingDoc.documentId}` : 'Create New Document'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {formError && (
            <div className="p-3 bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs rounded-xl">
              {formError}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-[var(--text-primary)] uppercase tracking-wider mb-1">
              Document Title *
            </label>
            <input
              type="text"
              required
              value={formData.title || ''}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g. System Architecture & API Specification"
              className="w-full px-3.5 py-2 rounded-xl glass-input text-sm text-[var(--text-primary)] focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[var(--text-primary)] uppercase tracking-wider mb-1">
                Associated Task *
              </label>
              <select
                required
                value={formData.taskId || ''}
                onChange={(e) => setFormData({ ...formData, taskId: Number(e.target.value) })}
                className="w-full px-3.5 py-2 rounded-xl form-select border border-[var(--border-color)] text-sm text-[var(--text-primary)] focus:outline-none focus:border-indigo-500"
              >
                <option value="">Select Task...</option>
                {tasks.map((t) => (
                  <option key={t.taskId} value={t.taskId}>
                    {t.taskName}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[var(--text-primary)] uppercase tracking-wider mb-1">
                Created Date
              </label>
              <input
                type="date"
                value={formData.createdDate || ''}
                onChange={(e) => setFormData({ ...formData, createdDate: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl glass-input text-sm text-[var(--text-primary)] focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[var(--text-primary)] uppercase tracking-wider mb-1">
              Content Body
            </label>
            <textarea
              rows={6}
              value={formData.content || ''}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              placeholder="Enter markdown or plain text documentation..."
              className="w-full px-3.5 py-2 rounded-xl glass-input text-sm text-[var(--text-primary)] focus:outline-none font-mono text-xs"
            />
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
              {formSubmitting ? 'Saving...' : editingDoc ? 'Update Document' : 'Save Document'}
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmModal
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={handleDeleteConfirm}
        isLoading={deleteSubmitting}
        title="Delete Document"
        message={`Are you sure you want to delete document "${deletingDoc?.title}"?`}
      />

      {selectedDoc && (
        <DetailDrawer
          isOpen={!!selectedDoc}
          onClose={() => setSelectedDoc(null)}
          title={selectedDoc.title}
          subtitle={`Document ID #${selectedDoc.documentId}`}
          overviewItems={[
            { label: 'Title', value: selectedDoc.title },
            { label: 'Associated Task', value: getTaskName(selectedDoc.taskId) },
            { label: 'Created Date', value: selectedDoc.createdDate || 'N/A' },
            { label: 'Content', value: <pre className="whitespace-pre-wrap font-mono text-xs text-[var(--text-primary)] bg-slate-500/10 p-3 rounded-xl">{selectedDoc.content}</pre> },
          ]}
        />
      )}
    </div>
  );
};
