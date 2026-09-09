import React, { useEffect, useState } from 'react';
import { BugReportService, ProjectService, TestCaseService } from '../../services/api';
import type { BugReport, Project, TestCase } from '../../types';
import { DataTable, type Column } from '../../components/common/DataTable';
import { Modal } from '../../components/common/Modal';
import { ConfirmModal } from '../../components/common/ConfirmModal';
import { StatusBadge } from '../../components/common/StatusBadge';
import { DetailDrawer } from '../../components/common/DetailDrawer';
import { useToast } from '../../context/ToastContext';

export const BugReportsPage: React.FC = () => {
  const toast = useToast();
  const [bugs, setBugs] = useState<BugReport[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [testCases, setTestCases] = useState<TestCase[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Form State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBug, setEditingBug] = useState<BugReport | null>(null);
  const [formData, setFormData] = useState<Partial<BugReport>>({
    description: '',
    severity: 'HIGH',
    status: 'OPEN',
    projectId: 0,
    testCaseId: 0,
  });
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Delete State
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [deletingBug, setDeletingBug] = useState<BugReport | null>(null);
  const [deleteSubmitting, setDeleteSubmitting] = useState(false);

  // Detail Drawer State
  const [selectedBug, setSelectedBug] = useState<BugReport | null>(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [bugData, projData, testData] = await Promise.all([
        BugReportService.getAll(),
        ProjectService.getAll().catch(() => []),
        TestCaseService.getAll().catch(() => []),
      ]);
      setBugs(bugData);
      setProjects(projData);
      setTestCases(testData);
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Failed to fetch bug reports from server.';
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

  const getTestCaseTitle = (tcId: number) => {
    const tc = testCases.find((t) => t.testCaseId === tcId);
    return tc ? tc.title : `Test #${tcId}`;
  };

  const handleOpenCreate = () => {
    setEditingBug(null);
    setFormData({
      description: '',
      severity: 'HIGH',
      status: 'OPEN',
      projectId: projects[0]?.projectId || 0,
      testCaseId: testCases[0]?.testCaseId || 0,
    });
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (bug: BugReport) => {
    setEditingBug(bug);
    setFormData({
      description: bug.description || '',
      severity: bug.severity || 'HIGH',
      status: bug.status || 'OPEN',
      projectId: bug.projectId,
      testCaseId: bug.testCaseId,
    });
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleOpenDelete = (bug: BugReport) => {
    setDeletingBug(bug);
    setIsDeleteOpen(true);
  };

  const handleViewBug = (bug: BugReport) => {
    setSelectedBug(bug);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.description || !formData.projectId || !formData.testCaseId) {
      setFormError('Please fill in all required fields (Description, Project, Test Case).');
      return;
    }

    setFormSubmitting(true);
    setFormError(null);
    try {
      if (editingBug && editingBug.bugId) {
        await BugReportService.update(editingBug.bugId, formData);
        toast.success('Bug Updated', `Bug Report #${editingBug.bugId} updated.`);
      } else {
        await BugReportService.create(formData);
        toast.success('Bug Logged', `Bug report logged successfully.`);
      }
      setIsModalOpen(false);
      fetchData();
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Failed to save bug report.';
      setFormError(msg);
      toast.error('Save Failed', msg);
    } finally {
      setFormSubmitting(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deletingBug || !deletingBug.bugId) return;
    setDeleteSubmitting(true);
    try {
      await BugReportService.delete(deletingBug.bugId);
      toast.success('Bug Report Deleted', `Bug Report #${deletingBug.bugId} removed.`);
      setIsDeleteOpen(false);
      fetchData();
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Failed to delete bug report.';
      toast.error('Delete Failed', msg);
    } finally {
      setDeleteSubmitting(false);
    }
  };

  const columns: Column<BugReport>[] = [
    { key: 'bugId', header: 'ID', sortable: true },
    {
      key: 'description',
      header: 'Bug Description',
      sortable: true,
      render: (b) => <span className="font-semibold text-[var(--text-primary)] line-clamp-1">{b.description}</span>,
    },
    {
      key: 'severity',
      header: 'Severity',
      sortable: true,
      render: (b) => <StatusBadge status={b.severity} type="severity" />,
    },
    {
      key: 'status',
      header: 'Status',
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
      key: 'testCaseId',
      header: 'Triggered Test Case',
      sortable: true,
      render: (b) => <span className="text-xs text-[var(--text-secondary)]">{getTestCaseTitle(b.testCaseId)}</span>,
    },
  ];

  return (
    <div>
      <DataTable
        title="Bug Report Management"
        description="Track defects and issues discovered during QA testing or development cycles."
        columns={columns}
        data={bugs}
        keyField="bugId"
        isLoading={loading}
        error={error}
        onRefresh={fetchData}
        onAdd={handleOpenCreate}
        onView={handleViewBug}
        onEdit={handleOpenEdit}
        onDelete={handleOpenDelete}
        searchPlaceholder="Search bugs by description, severity, status..."
        statusFilterField="status"
        statusOptions={['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED']}
      />

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingBug ? `Edit Bug Report #${editingBug.bugId}` : 'Report New Bug'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {formError && (
            <div className="p-3 bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs rounded-xl">
              {formError}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-[var(--text-primary)] uppercase tracking-wider mb-1">
              Bug Description *
            </label>
            <textarea
              rows={3}
              required
              value={formData.description || ''}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Describe the bug, steps to reproduce, and actual outcome..."
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
                Triggered Test Case *
              </label>
              <select
                required
                value={formData.testCaseId || ''}
                onChange={(e) => setFormData({ ...formData, testCaseId: Number(e.target.value) })}
                className="w-full px-3.5 py-2 rounded-xl form-select border border-[var(--border-color)] text-sm text-[var(--text-primary)] focus:outline-none focus:border-indigo-500"
              >
                <option value="">Select Test Case...</option>
                {testCases.map((tc) => (
                  <option key={tc.testCaseId} value={tc.testCaseId}>
                    {tc.title}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[var(--text-primary)] uppercase tracking-wider mb-1">
                Severity Level *
              </label>
              <select
                value={formData.severity || 'HIGH'}
                onChange={(e) => setFormData({ ...formData, severity: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl form-select border border-[var(--border-color)] text-sm text-[var(--text-primary)] focus:outline-none focus:border-indigo-500"
              >
                <option value="CRITICAL">CRITICAL</option>
                <option value="HIGH">HIGH</option>
                <option value="MEDIUM">MEDIUM</option>
                <option value="LOW">LOW</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[var(--text-primary)] uppercase tracking-wider mb-1">
                Resolution Status *
              </label>
              <select
                value={formData.status || 'OPEN'}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl form-select border border-[var(--border-color)] text-sm text-[var(--text-primary)] focus:outline-none focus:border-indigo-500"
              >
                <option value="OPEN">OPEN</option>
                <option value="IN_PROGRESS">IN_PROGRESS</option>
                <option value="RESOLVED">RESOLVED</option>
                <option value="CLOSED">CLOSED</option>
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
              {formSubmitting ? 'Saving...' : editingBug ? 'Update Bug' : 'Report Bug'}
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmModal
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={handleDeleteConfirm}
        isLoading={deleteSubmitting}
        title="Delete Bug Report"
        message={`Are you sure you want to delete bug report #${deletingBug?.bugId}?`}
      />

      {selectedBug && (
        <DetailDrawer
          isOpen={!!selectedBug}
          onClose={() => setSelectedBug(null)}
          title={`Bug Report #${selectedBug.bugId}`}
          subtitle={`Severity: ${selectedBug.severity}`}
          status={selectedBug.status}
          overviewItems={[
            { label: 'Bug ID', value: `#${selectedBug.bugId}` },
            { label: 'Severity', value: selectedBug.severity },
            { label: 'Status', value: selectedBug.status },
            { label: 'Project', value: getProjectName(selectedBug.projectId) },
            { label: 'Triggered Test Case', value: getTestCaseTitle(selectedBug.testCaseId) },
            { label: 'Description', value: selectedBug.description },
          ]}
        />
      )}
    </div>
  );
};
