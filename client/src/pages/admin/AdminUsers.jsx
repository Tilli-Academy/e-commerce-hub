import { useEffect, useState } from 'react';
import adminService from '../../services/adminService';
import Pagination from '../../components/ui/Pagination';
import { HiTrash } from 'react-icons/hi2';
import toast from 'react-hot-toast';

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  const loadUsers = async (p = 1) => {
    setLoading(true);
    try {
      const data = await adminService.getUsers({ page: p });
      setUsers(data.users);
      setPage(data.page);
      setTotalPages(data.totalPages);
      setTotal(data.total);
    } catch (error) {
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleRoleChange = async (userId, newRole) => {
    try {
      await adminService.updateUserRole(userId, newRole);
      toast.success('User role updated');
      loadUsers(page);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Update failed');
    }
  };

  const handleDelete = async (userId, userName) => {
    if (!window.confirm(`Delete user "${userName}"? This cannot be undone.`)) {
      return;
    }
    try {
      await adminService.deleteUser(userId);
      toast.success('User deleted');
      loadUsers(page);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Delete failed');
    }
  };

  return (
    <div>
      <h2 className="text-xl font-bold text-gray-900 mb-6">
        Users ({total})
      </h2>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="text-left py-3 px-4 font-medium text-gray-500">
                  Name
                </th>
                <th className="text-left py-3 px-4 font-medium text-gray-500">
                  Email
                </th>
                <th className="text-left py-3 px-4 font-medium text-gray-500">
                  Role
                </th>
                <th className="text-left py-3 px-4 font-medium text-gray-500">
                  Joined
                </th>
                <th className="text-right py-3 px-4 font-medium text-gray-500">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="5" className="py-12 text-center text-gray-400">
                    Loading...
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan="5" className="py-12 text-center text-gray-400">
                    No users found
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr
                    key={user._id}
                    className="border-b border-gray-100 last:border-0 hover:bg-gray-50"
                  >
                    <td className="py-3 px-4 font-medium text-gray-900">
                      {user.name}
                    </td>
                    <td className="py-3 px-4 text-gray-600">{user.email}</td>
                    <td className="py-3 px-4">
                      <select
                        value={user.role}
                        onChange={(e) =>
                          handleRoleChange(user._id, e.target.value)
                        }
                        className={`px-2 py-1.5 border rounded-lg text-xs font-medium outline-none ${
                          user.role === 'admin'
                            ? 'border-purple-300 bg-purple-50 text-purple-700'
                            : 'border-gray-300 bg-white text-gray-700'
                        }`}
                      >
                        <option value="user">User</option>
                        <option value="admin">Admin</option>
                      </select>
                    </td>
                    <td className="py-3 px-4 text-gray-500">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex justify-end">
                        <button
                          onClick={() => handleDelete(user._id, user.name)}
                          className="p-1.5 text-gray-500 hover:text-red-600 transition-colors"
                        >
                          <HiTrash className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Pagination
        page={page}
        totalPages={totalPages}
        onPageChange={loadUsers}
      />
    </div>
  );
};

export default AdminUsers;
