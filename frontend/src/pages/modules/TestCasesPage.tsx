import React, { useEffect, useState } from 'react';
import { TestCaseService, ProjectService, BugReportService } from '../../services/api';
import type { TestCase, Project, BugReport } from '../../types';
import { DataTable, type Column } from '../../components/common/DataTable';
import { Modal } from '../../components/common/Modal';
import { ConfirmModal } from '../../components/common/ConfirmModal';
import { StatusBadge } from '../../components/common/StatusBadge';
import { DetailDrawer, type DetailTab } from '../../components/common/DetailDrawer';
import { useToast } from '../../context/ToastContext';

export const TestCasesPage: React.FC = () => {
  const toast = useToast();
  const [testCases, setTestCases] = useState<TestCase[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Form State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTest, setEditingTest] = useState<TestCase | null>(null);
  const [formData, setFormData] = useState<Partial<TestCase>>({
    title: '',
    description: '',
    expectedResult: '',
    status: 'TODO',
    projectId: 0,
  });
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Delete State
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [deletingTest, setDeletingTest] = useState<TestCase | null>(null);
  const [deleteSubmitting, setDeleteSubmitting] = useState(false);

  // Detail Drawer State
  const [selectedTest, setSelectedTest] = useState<TestCase | null>(null);
  const [relatedBugs, setRelatedBugs] = useState<BugReport[]>([]);
  const [loadingDetails, setLoadingDetails] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [testData, projData] = await Promise.all([
        TestCaseService.getAll(),
        ProjectService.getAll().catch(() => []),
      ]);
      setTestCases(testData);
      setProjects(projData);
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Failed to fetch test cases from server.';
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
    setEditingTest(null);
    setFormData({
      title: '',
      description: '',
      expectedResult: '',
      status: 'TODO',
      projectId: projects[0]?.projectId || 0,
    });
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (tc: TestCase) => {
    setEditingTest(tc);
    setFormData({
      title: tc.title,
      description: tc.description || '',
      expectedResult: tc.expectedResult || '',
      status: tc.status || 'TODO',
      projectId: tc.projectId,
    });
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleOpenDelete = (tc: TestCase) => {
    setDeletingTest(tc);
    setIsDeleteOpen(true);
  };

  const handleViewTestCase = async (tc: TestCase) => {
    setSelectedTest(tc);
    if (!tc.testCaseId) return;

    setLoadingDetails(true);
    try {
      const bugs = await BugReportService.getByTestCaseId(tc.testCaseId).catch(() => []);
      setRelatedBugs(bugs);
    } catch {
      // ignore
    } finally {
      setLoadingDetails(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.projectId) {
      setFormError('Please fill in all required fields (Title, Project).');
      return;
    }

    setFormSubmitting(true);
    setFormError(null);
    try {
      if (editingTest && editingTest.testCaseId) {
        await TestCaseService.update(editingTest.testCaseId, formData);
        toast.success('Test Case Updated', `Test Case "${formData.title}" updated.`);
      } else {
        await TestCaseService.create(formData);
        toast.success('Test Case Created', `Test Case "${formData.title}" created successfully.`);
      }
      setIsModalOpen(false);
      fetchData();
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Failed to save test case.';
      setFormError(msg);
      toast.error('Save Failed', msg);
    } finally {
      setFormSubmitting(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deletingTest || !deletingTest.testCaseId) return;
    setDeleteSubmitting(true);
    try {
      await TestCaseService.delete(deletingTest.testCaseId);
      toast.success('Test Case Deleted', `Test Case #${deletingTest.testCaseId} removed.`);
      setIsDeleteOpen(false);
      fetchData();
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Failed to delete test case.';
      toast.error('Delete Failed', msg);
    } finally {
      setDeleteSubmitting(false);
    }
  };

  const columns: Column<TestCase>[] = [
    { key: 'testCaseId', header: 'ID', sortable: true },
    { key: 'title', header: 'Test Title', sortable: true },
    {
      key: 'description',
      header: 'Description',
      render: (tc) => <span className="line-clamp-1 max-w-xs">{tc.description || '-'}</span>,
    },
    {
      key: 'expectedResult',
      header: 'Expected Result',
      render: (tc) => <span className="line-clamp-1 max-w-xs text-xs text-[var(--text-secondary)]">{tc.expectedResult || '-'}</span>,
    },
    {
      key: 'status',
      header: 'Status',
      sortable: true,
      render: (tc) => <StatusBadge status={tc.status} />,
    },
    {
      key: 'projectId',
      header: 'Project',
      sortable: true,
      render: (tc) => <span className="font-semibold text-[var(--text-primary)]">{getProjectName(tc.projectId)}</span>,
    },
  ];

  const drawerTabs: DetailTab[] = [
    {
      id: 'bugs',
      label: 'Linked Bug Reports',
      count: relatedBugs.length,
      content: (
        <div className="space-y-3">
          {loadingDetails ? (
            <p className="text-xs text-[var(--text-secondary)]">Loading bug reports...</p>
          ) : relatedBugs.length === 0 ? (
            <p className="text-xs text-[var(--text-secondary)]">No bugs reported for this test case. Test passed cleanly!</p>
          ) : (
            relatedBugs.map((b) => (
              <div key={b.bugId} className="glass-panel p-3.5 rounded-xl flex items-center justify-between text-xs">
                <div>
                  <p className="font-bold text-[var(--text-primary)]">{b.description}</p>
                  <p className="text-[11px] text-[var(--text-secondary)]">Severity: <span className="font-bold text-rose-400">{b.severity}</span></p>
                </div>
                <StatusBadge status={b.status} />
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
        title="Test Case Management"
        description="Define and execute quality assurance test suites to validate software implementations."
        columns={columns}
        data={testCases}
        keyField="testCaseId"
        isLoading={loading}
        error={error}
        onRefresh={fetchData}
        onAdd={handleOpenCreate}
        onView={handleViewTestCase}
        onEdit={handleOpenEdit}
        onDelete={handleOpenDelete}
        searchPlaceholder="Search test cases by title, status, project..."
        statusFilterField="status"
        statusOptions={['TODO', 'IN_PROGRESS', 'PASSED', 'FAILED']}
      />

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingTest ? `Edit Test Case #${editingTest.testCaseId}` : 'Create New Test Case'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {formError && (
            <div className="p-3 bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs rounded-xl">
              {formError}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-[var(--text-primary)] uppercase tracking-wider mb-1">
              Test Case Title *
            </label>
            <input
              type="text"
              required
              value={formData.title || ''}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g. Verify Login with Invalid Password Returns 401"
              className="w-full px-3.5 py-2 rounded-xl glass-input text-sm text-[var(--text-primary)] focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[var(--text-primary)] uppercase tracking-wider mb-1">
              Description / Test Steps
            </label>
            <textarea
              rows={2}
              value={formData.description || ''}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="1. Enter email, 2. Enter wrong password, 3. Click Submit"
              className="w-full px-3.5 py-2 rounded-xl glass-input text-sm text-[var(--text-primary)] focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[var(--text-primary)] uppercase tracking-wider mb-1">
              Expected Result
            </label>
            <input
              type="text"
              value={formData.expectedResult || ''}
              onChange={(e) => setFormData({ ...formData, expectedResult: e.target.value })}
              placeholder="e.g. System displays 'Invalid credentials' error toast"
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
                value={formData.status || 'TODO'}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl form-select border border-[var(--border-color)] text-sm text-[var(--text-primary)] focus:outline-none focus:border-indigo-500"
              >
                <option value="TODO">TODO</option>
                <option value="IN_PROGRESS">IN_PROGRESS</option>
                <option value="PASSED">PASSED</option>
                <option value="FAILED">FAILED</option>
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
              {formSubmitting ? 'Saving...' : editingTest ? 'Update Test Case' : 'Create Test Case'}
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmModal
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={handleDeleteConfirm}
        isLoading={deleteSubmitting}
        title="Delete Test Case"
        message={`Are you sure you want to delete test case "${deletingTest?.title}"?`}
      />

      {selectedTest && (
        <DetailDrawer
          isOpen={!!selectedTest}
          onClose={() => setSelectedTest(null)}
          title={selectedTest.title}
          subtitle={`Test Case ID #${selectedTest.testCaseId}`}
          status={selectedTest.status}
          overviewItems={[
            { label: 'Title', value: selectedTest.title },
            { label: 'Status', value: selectedTest.status },
            { label: 'Expected Result', value: selectedTest.expectedResult || 'N/A' },
            { label: 'Project', value: getProjectName(selectedTest.projectId) },
            { label: 'Description', value: selectedTest.description || 'No description' },
          ]}
          tabs={drawerTabs}
        />
      )}
    </div>
  );
};
