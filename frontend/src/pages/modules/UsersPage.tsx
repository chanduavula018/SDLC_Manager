import React, { useEffect, useState } from 'react';
import { UserService, ProjectService } from '../../services/api';
import type { User, Project } from '../../types';
import { DataTable, type Column } from '../../components/common/DataTable';
import { Modal } from '../../components/common/Modal';
import { ConfirmModal } from '../../components/common/ConfirmModal';
import { StatusBadge } from '../../components/common/StatusBadge';
import { DetailDrawer, type DetailTab } from '../../components/common/DetailDrawer';
import { useToast } from '../../context/ToastContext';

export const UsersPage: React.FC = () => {
  const toast = useToast();
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.fullName || !formData.email || (!editingUser && !formData.password)) {
      setFormError('Please fill in all required fields (Full Name, Email, Password).');
      return;
    }

    setFormSubmitting(true);
    setFormError(null);
    try {
      if (editingUser && editingUser.userId) {
        const payload = {
          ...formData,
          password: formData.password || editingUser.password,
        };
        await UserService.update(editingUser.userId, payload);
        toast.success('User Updated', `User "${formData.fullName}" profile updated.`);
      } else {
        await UserService.create(formData);
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
        onAdd={handleOpenCreate}
        onView={handleViewUser}
        onEdit={handleOpenEdit}
        onDelete={handleOpenDelete}
        searchPlaceholder="Search users by name, email, role..."
        statusFilterField="role"
        statusOptions={['ADMIN', 'PROJECT_MANAGER', 'DEVELOPER', 'QA_TESTER', 'DEVOPS_ENGINEER']}
      />

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
            <label className="block text-xs font-semibold text-[var(--text-primary)] uppercase tracking-wider mb-1">
              Full Name *
            </label>
            <input
              type="text"
              required
              value={formData.fullName || ''}
              onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
              placeholder="e.g. Sarah Connor"
              className="w-full px-3.5 py-2 rounded-xl glass-input text-sm text-[var(--text-primary)] focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[var(--text-primary)] uppercase tracking-wider mb-1">
              Email Address *
            </label>
            <input
              type="email"
              required
              value={formData.email || ''}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="e.g. sarah.connor@neuroforge.io"
              className="w-full px-3.5 py-2 rounded-xl glass-input text-sm text-[var(--text-primary)] focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[var(--text-primary)] uppercase tracking-wider mb-1">
              Password {editingUser ? '(leave blank to keep current)' : '*'}
            </label>
            <input
              type="password"
              required={!editingUser}
              value={formData.password || ''}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              placeholder="••••••••"
              className="w-full px-3.5 py-2 rounded-xl glass-input text-sm text-[var(--text-primary)] focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[var(--text-primary)] uppercase tracking-wider mb-1">
              System Role & Permissions *
            </label>
            <select
              value={formData.role || 'DEVELOPER'}
              onChange={(e) => setFormData({ ...formData, role: e.target.value })}
              className="w-full px-3.5 py-2 rounded-xl form-select border border-[var(--border-color)] text-sm text-[var(--text-primary)] focus:outline-none focus:border-indigo-500"
            >
              <option value="ADMIN">ADMIN</option>
              <option value="PROJECT_MANAGER">PROJECT_MANAGER</option>
              <option value="DEVELOPER">DEVELOPER</option>
              <option value="QA_TESTER">QA_TESTER</option>
              <option value="DEVOPS_ENGINEER">DEVOPS_ENGINEER</option>
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
