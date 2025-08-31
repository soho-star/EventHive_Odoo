import React, { useState, useEffect } from 'react';
import { 
  MagnifyingGlassIcon, 
  FunnelIcon,
  PencilIcon, 
  TrashIcon,
  CheckCircleIcon,
  XCircleIcon,
  UserPlusIcon,
  EyeIcon
} from '@heroicons/react/24/outline';
import adminService from '../../services/adminService';
import Card from '../../components/UI/Card';
import Button from '../../components/UI/Button';
import Input from '../../components/UI/Input';
import LoadingSpinner from '../../components/UI/LoadingSpinner';
import Modal from '../../components/UI/Modal';
import toast from 'react-hot-toast';

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedUser, setSelectedUser] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [editForm, setEditForm] = useState({
    username: '',
    phone: '',
    role: '',
    isVerified: false
  });

  useEffect(() => {
    fetchUsers();
  }, [currentPage, roleFilter]);

  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      const params = {
        page: currentPage,
        limit: 10,
        role: roleFilter || undefined
      };
      
      const response = await adminService.getUsers(params);
      setUsers(response.data.users);
      setTotalPages(Math.ceil(response.data.total / 10));
    } catch (error) {
      toast.error('Failed to load users');
      console.error('Fetch users error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchUsers();
  };

  const handleEditUser = (user) => {
    setSelectedUser(user);
    setEditForm({
      username: user.username || '',
      phone: user.phone || '',
      role: user.role || 'user',
      isVerified: user.is_verified || false
    });
    setIsEditModalOpen(true);
  };

  const handleUpdateUser = async () => {
    try {
      await adminService.updateUser(selectedUser.id, editForm);
      toast.success('User updated successfully');
      setIsEditModalOpen(false);
      fetchUsers();
    } catch (error) {
      toast.error('Failed to update user');
      console.error('Update user error:', error);
    }
  };

  const handleDeleteUser = async () => {
    try {
      await adminService.deleteUser(selectedUser.id);
      toast.success('User deleted successfully');
      setIsDeleteModalOpen(false);
      fetchUsers();
    } catch (error) {
      toast.error('Failed to delete user');
      console.error('Delete user error:', error);
    }
  };

  const handlePromoteUser = async (userId) => {
    try {
      await adminService.promoteUser(userId);
      toast.success('User promoted to organizer');
      fetchUsers();
    } catch (error) {
      toast.error('Failed to promote user');
      console.error('Promote user error:', error);
    }
  };

  const handleVerifyUser = async (userId, isVerified) => {
    try {
      await adminService.verifyUser(userId, isVerified);
      toast.success(`User ${isVerified ? 'verified' : 'unverified'} successfully`);
      fetchUsers();
    } catch (error) {
      toast.error('Failed to update verification status');
      console.error('Verify user error:', error);
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      active: { color: 'bg-green-100 text-green-800', text: 'Active' },
      inactive: { color: 'bg-red-100 text-red-800', text: 'Inactive' },
      pending: { color: 'bg-yellow-100 text-yellow-800', text: 'Pending' }
    };

    const config = statusConfig[status] || statusConfig.inactive;
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
        {config.text}
      </span>
    );
  };

  const getRoleBadge = (role) => {
    const roleConfig = {
      admin: { color: 'bg-red-100 text-red-800', text: 'Admin' },
      organizer: { color: 'bg-blue-100 text-blue-800', text: 'Organizer' },
      user: { color: 'bg-gray-100 text-gray-800', text: 'User' }
    };

    const config = roleConfig[role] || roleConfig.user;
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
        {config.text}
      </span>
    );
  };

  const filteredUsers = users.filter(user =>
    user.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">User Management</h1>
          <p className="text-gray-300 mt-1">Manage system users and permissions</p>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700 text-white">
          <UserPlusIcon className="w-5 h-5 mr-2" />
          Add User
        </Button>
      </div>

      {/* Search and Filters */}
      <Card className="bg-gray-800/50 border border-gray-700">
        <Card.Content className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <form onSubmit={handleSearch} className="flex-1">
              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Search users by name or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-full"
                />
              </div>
            </form>
            
            <div className="flex items-center space-x-2">
              <FunnelIcon className="w-5 h-5 text-gray-400" />
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="bg-gray-700 border border-gray-600 text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Roles</option>
                <option value="user">User</option>
                <option value="organizer">Organizer</option>
                <option value="admin">Admin</option>
              </select>
            </div>
          </div>
        </Card.Content>
      </Card>

      {/* Users Table */}
      <Card className="bg-gray-800/50 border border-gray-700">
        <Card.Content className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-700/50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Role
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Joined
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-700/30">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                          {user.profile_image_url ? (
                            <img
                              src={user.profile_image_url}
                              alt={user.username}
                              className="w-10 h-10 rounded-full object-cover"
                            />
                          ) : (
                            <span className="text-white font-semibold">
                              {user.username?.charAt(0)?.toUpperCase()}
                            </span>
                          )}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-white">
                            {user.username}
                          </div>
                          <div className="text-sm text-gray-300">
                            {user.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getRoleBadge(user.role)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(user.is_verified ? 'active' : 'pending')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                      {new Date(user.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleVerifyUser(user.id, !user.is_verified)}
                          className="text-gray-400 hover:text-green-400"
                          title={user.is_verified ? 'Unverify' : 'Verify'}
                        >
                          {user.is_verified ? (
                            <XCircleIcon className="w-4 h-4" />
                          ) : (
                            <CheckCircleIcon className="w-4 h-4" />
                          )}
                        </Button>
                        
                        {user.role === 'user' && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handlePromoteUser(user.id)}
                            className="text-gray-400 hover:text-blue-400"
                            title="Promote to Organizer"
                          >
                            <UserPlusIcon className="w-4 h-4" />
                          </Button>
                        )}
                        
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleEditUser(user)}
                          className="text-gray-400 hover:text-blue-400"
                          title="Edit"
                        >
                          <PencilIcon className="w-4 h-4" />
                        </Button>
                        
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => {
                            setSelectedUser(user);
                            setIsDeleteModalOpen(true);
                          }}
                          className="text-gray-400 hover:text-red-400"
                          title="Delete"
                        >
                          <TrashIcon className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {filteredUsers.length === 0 && (
            <div className="text-center py-8">
              <p className="text-gray-400">No users found</p>
            </div>
          )}
        </Card.Content>
      </Card>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-300">
            Page {currentPage} of {totalPages}
          </div>
          <div className="flex space-x-2">
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(currentPage - 1)}
              className="text-white border-gray-600 hover:bg-gray-700"
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(currentPage + 1)}
              className="text-white border-gray-600 hover:bg-gray-700"
            >
              Next
            </Button>
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Edit User"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Username
            </label>
            <Input
              value={editForm.username}
              onChange={(e) => setEditForm({ ...editForm, username: e.target.value })}
              className="w-full"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Phone
            </label>
            <Input
              value={editForm.phone}
              onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
              className="w-full"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Role
            </label>
            <select
              value={editForm.role}
              onChange={(e) => setEditForm({ ...editForm, role: e.target.value })}
              className="w-full bg-gray-700 border border-gray-600 text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="user">User</option>
              <option value="organizer">Organizer</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          
          <div className="flex items-center">
            <input
              type="checkbox"
              id="isVerified"
              checked={editForm.isVerified}
              onChange={(e) => setEditForm({ ...editForm, isVerified: e.target.checked })}
              className="mr-2"
            />
            <label htmlFor="isVerified" className="text-sm text-gray-300">
              Verified Account
            </label>
          </div>
        </div>
        
        <div className="flex justify-end space-x-3 mt-6">
          <Button
            variant="outline"
            onClick={() => setIsEditModalOpen(false)}
            className="text-white border-gray-600 hover:bg-gray-700"
          >
            Cancel
          </Button>
          <Button
            onClick={handleUpdateUser}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            Update User
          </Button>
        </div>
      </Modal>

      {/* Delete User Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Delete User"
      >
        <div className="text-gray-300">
          <p>Are you sure you want to delete the user "{selectedUser?.username}"?</p>
          <p className="text-sm text-gray-400 mt-2">
            This action cannot be undone. All user data will be permanently removed.
          </p>
        </div>
        
        <div className="flex justify-end space-x-3 mt-6">
          <Button
            variant="outline"
            onClick={() => setIsDeleteModalOpen(false)}
            className="text-white border-gray-600 hover:bg-gray-700"
          >
            Cancel
          </Button>
          <Button
            onClick={handleDeleteUser}
            className="bg-red-600 hover:bg-red-700 text-white"
          >
            Delete User
          </Button>
        </div>
      </Modal>
    </div>
  );
};

export default AdminUsers;

