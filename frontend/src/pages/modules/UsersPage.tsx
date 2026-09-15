import React, { useEffect, useState } from 'react';
import { UserService, ProjectService } from '../../services/api';
import type { User, Project } from '../../types';
import { DataTable, type Column } from '../../components/common/DataTable';
import { Modal } from '../../components/common/Modal';
import { ConfirmModal } from '../../components/common/ConfirmModal';
import { StatusBadge } from '../../components/common/StatusBadge';
import { DetailDrawer, type DetailTab } from '../../components/common/DetailDrawer';
import { useToast } from '../../context/ToastContext';
import { useAuth } from '../../context/AuthContext';
import { FolderPlus, Trash2, FolderGit2, AlertCircle, RefreshCw } from 'lucide-react';

export const UsersPage: React.FC = () => {
  const toast = useToast();
  const { isAdmin } = useAuth();

  const canCreate = isAdmin;
  const canEdit = isAdmin;
  const canDelete = isAdmin;
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Form State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [formData, setFormData] = useState<Partial<User>>({
    fullName: '',
    email: '',
    password: '',
    role: 'DEVELOPER',
  });
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Delete State
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [deletingUser, setDeletingUser] = useState<User | null>(null);
  const [deleteSubmitting, setDeleteSubmitting] = useState(false);

  // Detail State
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [ownedProjects, setOwnedProjects] = useState<Project[]>([]);
  const [loadingDetails, setLoadingDetails] = useState(false);

  // Assign Project State
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [assignClient, setAssignClient] = useState<User | null>(null);
  const [assignedProjects, setAssignedProjects] = useState<Project[]>([]);
  const [allProjects, setAllProjects] = useState<Project[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string>('');
  const [loadingAssignData, setLoadingAssignData] = useState(false);
  const [assignSubmitting, setAssignSubmitting] = useState(false);
  const [assignError, setAssignError] = useState<string | null>(null);

  // Unassign Confirm State
  const [isUnassignConfirmOpen, setIsUnassignConfirmOpen] = useState(false);
  const [unassignProject, setUnassignProject] = useState<Project | null>(null);
  const [unassignSubmitting, setUnassignSubmitting] = useState(false);

  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await UserService.getAll();
      setUsers(data);
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Failed to fetch users from server.';
      setError(msg);
      toast.error('Fetch Error', msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleOpenCreate = () => {
    setEditingUser(null);
    setFormData({
      fullName: '',
      email: '',
      password: '',
      role: 'DEVELOPER',
    });
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (user: User) => {
    setEditingUser(user);
    setFormData({
      fullName: user.fullName,
      email: user.email,
      password: '',
      role: user.role,
    });
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleOpenDelete = (user: User) => {
    setDeletingUser(user);
    setIsDeleteOpen(true);
  };

  const handleViewUser = async (user: User) => {
    setSelectedUser(user);
    if (!user.userId) return;

    setLoadingDetails(true);
    try {
      const projs = await ProjectService.getByUserId(user.userId).catch(() => []);
      setOwnedProjects(projs);
    } catch {
      // ignore
    } finally {
      setLoadingDetails(false);
    }
  };

  const handleOpenAssignProjects = async (user: User) => {
    setAssignClient(user);
    setSelectedProjectId('');
    setAssignError(null);
    setIsAssignModalOpen(true);
    if (!user.userId) return;

    setLoadingAssignData(true);
    try {
      const [allProjs, clientProjs] = await Promise.all([
        ProjectService.getAll().catch(() => []),
        ProjectService.getByUserId(user.userId).catch(() => []),
      ]);
      setAllProjects(allProjs);
      setAssignedProjects(clientProjs);
    } catch {
      toast.error('Load Error', 'Failed to load project details.');
    } finally {
      setLoadingAssignData(false);
    }
  };

  const handleAssignProjectSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!assignClient || !assignClient.userId || !selectedProjectId) {
      setAssignError('Please select a project to assign.');
      return;
    }

    const pId = Number(selectedProjectId);
    if (assignedProjects.some((p) => p.projectId === pId)) {
      setAssignError('User is already assigned to this project.');
      return;
    }

    setAssignSubmitting(true);
    setAssignError(null);
    try {
      await ProjectService.addMember(pId, assignClient.userId);
      const targetProj = allProjects.find((p) => p.projectId === pId);
      toast.success(
        'Project Assigned',
        `Assigned "${targetProj?.projectName || 'Project'}" to ${assignClient.fullName}.`
      );
      // Refresh assigned projects list
      const updatedProjs = await ProjectService.getByUserId(assignClient.userId);
      setAssignedProjects(updatedProjs);
      setSelectedProjectId('');
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || 'Unable to assign user to this project.';
      if (msg.includes('already assigned')) {
        setAssignError('User is already assigned to this project.');
      } else {
        setAssignError(msg);
      }
      toast.error('Assignment Failed', msg);
    } finally {
      setAssignSubmitting(false);
    }
  };

  const handleOpenUnassignConfirm = (project: Project) => {
    setUnassignProject(project);
    setIsUnassignConfirmOpen(true);
  };

  const handleUnassignConfirm = async () => {
    if (!assignClient || !assignClient.userId || !unassignProject || !unassignProject.projectId) return;
    setUnassignSubmitting(true);
    try {
      await ProjectService.removeMember(unassignProject.projectId, assignClient.userId);
      toast.success(
        'Assignment Removed',
        `Removed "${unassignProject.projectName}" assignment from ${assignClient.fullName}.`
      );
      setIsUnassignConfirmOpen(false);
      setUnassignProject(null);
      // Refresh assigned projects list
      const updatedProjs = await ProjectService.getByUserId(assignClient.userId);
      setAssignedProjects(updatedProjs);
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Failed to remove project assignment.';
      toast.error('Remove Failed', msg);
    } finally {
      setUnassignSubmitting(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.fullName?.trim() || !formData.email?.trim() || (!editingUser && !formData.password)) {
      setFormError('Please fill in all required fields (Full Name, Email, Password).');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email.trim())) {
      setFormError('Please enter a valid email address (e.g. user@domain.com).');
      return;
    }

    setFormSubmitting(true);
    setFormError(null);
    try {
      if (editingUser && editingUser.userId) {
        const payload = {
          ...formData,
          fullName: formData.fullName.trim(),
          email: formData.email.trim(),
          password: formData.password || editingUser.password,
        };
        await UserService.update(editingUser.userId, payload);
        toast.success('User Updated', `User "${formData.fullName}" profile updated.`);
      } else {
        const payload = {
          ...formData,
          fullName: formData.fullName?.trim(),
          email: formData.email?.trim(),
        };
        await UserService.create(payload);
        toast.success('User Created', `User "${formData.fullName}" added to NeuroForge.`);
      }
      setIsModalOpen(false);
      fetchUsers();
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Failed to save user details.';
      setFormError(msg);
      toast.error('Save Failed', msg);
    } finally {
      setFormSubmitting(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deletingUser || !deletingUser.userId) return;
    setDeleteSubmitting(true);
    try {
      await UserService.delete(deletingUser.userId);
      toast.success('User Deleted', `User "${deletingUser.fullName}" removed.`);
      setIsDeleteOpen(false);
      fetchUsers();
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Failed to delete user.';
      toast.error('Delete Failed', msg);
    } finally {
      setDeleteSubmitting(false);
    }
  };

  const columns: Column<User>[] = [
    { key: 'userId', header: 'ID', sortable: true },
    {
      key: 'fullName',
      header: 'Full Name',
      sortable: true,
      render: (u) => <span className="font-bold text-[var(--text-primary)]">{u.fullName}</span>,
    },
    { key: 'email', header: 'Email Address', sortable: true },
    {
      key: 'role',
      header: 'Role & Permissions',
      sortable: true,
      render: (u) => <StatusBadge status={u.role} type="role" />,
    },
  ];

  const drawerTabs: DetailTab[] = [
    {
      id: 'projects',
      label: 'Owned Projects',
      count: ownedProjects.length,
      content: (
        <div className="space-y-3">
          {loadingDetails ? (
            <p className="text-xs text-[var(--text-secondary)]">Loading owned projects...</p>
          ) : ownedProjects.length === 0 ? (
            <p className="text-xs text-[var(--text-secondary)]">This user is not assigned as lead owner for any project yet.</p>
          ) : (
            ownedProjects.map((p) => (
              <div key={p.projectId} className="glass-panel p-3.5 rounded-xl flex items-center justify-between text-xs">
                <div>
                  <p className="font-bold text-[var(--text-primary)]">{p.projectName}</p>
                  <p className="text-[11px] text-[var(--text-secondary)] line-clamp-1">{p.description}</p>
                </div>
                <StatusBadge status={p.status} />
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
        title="User & Role Management"
        description="Manage engineering team members, access roles, and project ownership."
        columns={columns}
        data={users}
        keyField="userId"
        isLoading={loading}
        error={error}
        onRefresh={fetchUsers}
        onAdd={canCreate ? handleOpenCreate : undefined}
        onView={handleViewUser}
        onEdit={canEdit ? handleOpenEdit : undefined}
        onDelete={canDelete ? handleOpenDelete : undefined}
        renderActions={(u) => {
          const roleUpper = u.role ? u.role.toUpperCase() : '';
          if (canEdit && roleUpper !== 'ADMIN') {
            return (
              <button
                onClick={() => handleOpenAssignProjects(u)}
                className="p-1.5 text-[var(--text-secondary)] hover:text-indigo-600 hover:bg-indigo-500/10 rounded-lg transition-colors flex items-center space-x-1"
                title="Assign Project"
                aria-label="Assign Project"
              >
                <FolderPlus className="w-4 h-4" />
                <span className="sr-only">Assign Project</span>
              </button>
            );
          }
          return null;
        }}
        searchPlaceholder="Search users by name, email, role..."
        statusFilterField="role"
        statusOptions={['ADMIN', 'PROJECT_MANAGER', 'DEVELOPER', 'QA_TESTER', 'DEVOPS_ENGINEER', 'CLIENT']}
      />

      {/* Add / Edit User Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingUser ? `Edit User #${editingUser.userId}` : 'Add New User'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {formError && (
            <div className="p-3 bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs rounded-xl">
              {formError}
            </div>
          )}

          <div>
            <label htmlFor="user-fullname" className="block text-xs font-semibold text-[var(--text-primary)] uppercase tracking-wider mb-1">
              Full Name *
            </label>
            <input
              id="user-fullname"
              type="text"
              required
              value={formData.fullName || ''}
              onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
              placeholder="Enter full name"
              className="w-full px-3.5 py-2 rounded-xl glass-input text-sm text-[var(--text-primary)] focus:outline-none"
            />
          </div>

          <div>
            <label htmlFor="user-email" className="block text-xs font-semibold text-[var(--text-primary)] uppercase tracking-wider mb-1">
              Email Address *
            </label>
            <input
              id="user-email"
              type="email"
              required
              value={formData.email || ''}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="Enter email address"
              className="w-full px-3.5 py-2 rounded-xl glass-input text-sm text-[var(--text-primary)] focus:outline-none"
            />
          </div>

          <div>
            <label htmlFor="user-password" className="block text-xs font-semibold text-[var(--text-primary)] uppercase tracking-wider mb-1">
              Password {editingUser ? '(leave blank to keep current)' : '*'}
            </label>
            <input
              id="user-password"
              type="password"
              required={!editingUser}
              value={formData.password || ''}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              placeholder="••••••••"
              className="w-full px-3.5 py-2 rounded-xl glass-input text-sm text-[var(--text-primary)] focus:outline-none"
            />
          </div>

          <div>
            <label htmlFor="user-role" className="block text-xs font-semibold text-[var(--text-primary)] uppercase tracking-wider mb-1">
              System Role & Permissions *
            </label>
            <select
              id="user-role"
              required
              value={formData.role || ''}
              onChange={(e) => setFormData({ ...formData, role: e.target.value })}
              className="w-full px-3.5 py-2 rounded-xl form-select border border-[var(--border-color)] text-sm text-[var(--text-primary)] focus:outline-none focus:border-indigo-500"
            >
              <option value="" disabled>Select system role...</option>
              <option value="ADMIN">ADMIN</option>
              <option value="PROJECT_MANAGER">PROJECT_MANAGER</option>
              <option value="DEVELOPER">DEVELOPER</option>
              <option value="QA_TESTER">QA_TESTER</option>
              <option value="DEVOPS_ENGINEER">DEVOPS_ENGINEER</option>
              <option value="CLIENT">CLIENT</option>
            </select>
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
              {formSubmitting ? 'Saving...' : editingUser ? 'Update User Profile' : 'Create User Account'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Assign Project Modal */}
      {assignClient && (
        <Modal
          isOpen={isAssignModalOpen}
          onClose={() => setIsAssignModalOpen(false)}
          title="Assign Project"
        >
          <div className="space-y-5">
            {/* Client Info Header */}
            <div className="p-3.5 rounded-2xl bg-slate-500/10 border border-[var(--border-color)] flex items-center justify-between">
              <div>
                <p className="font-extrabold text-sm text-[var(--text-primary)]">{assignClient.fullName}</p>
                <p className="text-xs text-[var(--text-secondary)] font-mono">{assignClient.email}</p>
              </div>
              <StatusBadge status={assignClient.role} type="role" />
            </div>

            {/* Current Assigned Projects List */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-xs font-bold text-[var(--text-primary)] uppercase tracking-wider">
                  Current Assigned Projects ({assignedProjects.length})
                </h4>
                {loadingAssignData && (
                  <span className="text-xs text-indigo-500 flex items-center">
                    <RefreshCw className="w-3 h-3 animate-spin mr-1" /> Loading...
                  </span>
                )}
              </div>

              {loadingAssignData ? (
                <div className="py-4 text-center text-xs text-[var(--text-secondary)]">
                  Fetching client project assignments...
                </div>
              ) : assignedProjects.length === 0 ? (
                <div className="p-4 rounded-xl bg-slate-500/5 border border-dashed border-[var(--border-color)] text-center text-xs text-[var(--text-secondary)]">
                  No projects assigned yet.
                </div>
              ) : (
                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {assignedProjects.map((p) => (
                    <div
                      key={p.projectId}
                      className="glass-panel p-3 rounded-xl flex items-center justify-between text-xs"
                    >
                      <div className="flex items-center space-x-2.5 min-w-0 pr-2">
                        <FolderGit2 className="w-4 h-4 text-indigo-500 shrink-0" />
                        <div className="min-w-0">
                          <p className="font-bold text-[var(--text-primary)] truncate">{p.projectName}</p>
                          <p className="text-[11px] text-[var(--text-secondary)] truncate">
                            {p.description || 'No description'}
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleOpenUnassignConfirm(p)}
                        className="px-2.5 py-1 text-[11px] font-semibold text-rose-500 hover:text-white bg-rose-500/10 hover:bg-rose-500 border border-rose-500/20 rounded-lg transition-all flex items-center space-x-1 shrink-0"
                      >
                        <Trash2 className="w-3 h-3" />
                        <span>Remove</span>
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Assign New Project Form */}
            <form onSubmit={handleAssignProjectSubmit} className="pt-3 border-t border-[var(--border-color)] space-y-3">
              <h4 className="text-xs font-bold text-[var(--text-primary)] uppercase tracking-wider">
                Assign New Project
              </h4>

              {assignError && (
                <div className="p-3 bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs rounded-xl flex items-center space-x-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{assignError}</span>
                </div>
              )}

              <div>
                <label htmlFor="assign-project-select" className="block text-xs font-medium text-[var(--text-secondary)] mb-1">
                  Select Available Project *
                </label>
                <select
                  id="assign-project-select"
                  value={selectedProjectId}
                  onChange={(e) => {
                    setSelectedProjectId(e.target.value);
                    if (assignError) setAssignError(null);
                  }}
                  className="w-full px-3.5 py-2 rounded-xl form-select border border-[var(--border-color)] text-xs text-[var(--text-primary)] focus:outline-none focus:border-indigo-500"
                >
                  <option value="" disabled>Select Project ▼</option>
                  {allProjects.map((p) => {
                    const isAlreadyAssigned = assignedProjects.some((ap) => ap.projectId === p.projectId);
                    return (
                      <option key={p.projectId} value={p.projectId} disabled={isAlreadyAssigned}>
                        {p.projectName} {isAlreadyAssigned ? '(Already Assigned)' : ''}
                      </option>
                    );
                  })}
                </select>
              </div>

              <div className="flex items-center justify-end space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAssignModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-[var(--text-secondary)] hover:text-[var(--text-primary)] bg-slate-500/10 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!selectedProjectId || assignSubmitting}
                  className="px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl shadow-md shadow-indigo-600/20 transition-all disabled:opacity-50"
                >
                  {assignSubmitting ? 'Assigning...' : 'Assign Project'}
                </button>
              </div>
            </form>
          </div>
        </Modal>
      )}

      {/* Remove Assignment Confirmation Modal */}
      <ConfirmModal
        isOpen={isUnassignConfirmOpen}
        onClose={() => setIsUnassignConfirmOpen(false)}
        onConfirm={handleUnassignConfirm}
        isLoading={unassignSubmitting}
        title="Remove Project Assignment"
        message={`Remove "${unassignProject?.projectName}" from ${assignClient?.fullName}?`}
      />

      {/* Delete User Account Modal */}
      <ConfirmModal
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={handleDeleteConfirm}
        isLoading={deleteSubmitting}
        title="Delete User Account"
        message={`Are you sure you want to delete user "${deletingUser?.fullName}" (${deletingUser?.email})?`}
      />

      {selectedUser && (
        <DetailDrawer
          isOpen={!!selectedUser}
          onClose={() => setSelectedUser(null)}
          title={selectedUser.fullName}
          subtitle={`User ID #${selectedUser.userId}`}
          status={selectedUser.role}
          badgeType="role"
          overviewItems={[
            { label: 'Full Name', value: selectedUser.fullName },
            { label: 'Email Address', value: selectedUser.email },
            { label: 'Role & Permissions', value: selectedUser.role },
            { label: 'User ID', value: `#${selectedUser.userId}` },
          ]}
          tabs={drawerTabs}
        />
      )}
    </div>
  );
};
