import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import adminService from '../../services/adminService';
import OrderStatusBadge from '../../components/ui/OrderStatusBadge';
import Pagination from '../../components/ui/Pagination';
import toast from 'react-hot-toast';

const STATUSES = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('');

  const loadOrders = async (p = 1, status = filterStatus) => {
    setLoading(true);
    try {
      const params = { page: p, limit: 15 };
      if (status) params.status = status;
      const data = await adminService.getAllOrders(params);
      setOrders(data.orders);
      setPage(data.page);
      setTotalPages(data.totalPages);
      setTotal(data.total);
    } catch (error) {
      toast.error('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders(1);
  }, [filterStatus]);

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      await adminService.updateOrderStatus(orderId, newStatus);
      toast.success('Order status updated');
      loadOrders(page);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Update failed');
    }
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <h2 className="text-xl font-bold text-gray-900">Orders ({total})</h2>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none bg-white"
        >
          <option value="">All Statuses</option>
          {STATUSES.map((s) => (
            <option key={s} value={s} className="capitalize">
              {s.charAt(0).toUpperCase() + s.slice(1)}
            </option>
          ))}
        </select>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="text-left py-3 px-4 font-medium text-gray-500">
                  Order ID
                </th>
                <th className="text-left py-3 px-4 font-medium text-gray-500">
                  Customer
                </th>
                <th className="text-left py-3 px-4 font-medium text-gray-500">
                  Items
                </th>
                <th className="text-left py-3 px-4 font-medium text-gray-500">
                  Total
                </th>
                <th className="text-left py-3 px-4 font-medium text-gray-500">
                  Date
                </th>
                <th className="text-left py-3 px-4 font-medium text-gray-500">
                  Status
                </th>
                <th className="text-left py-3 px-4 font-medium text-gray-500">
                  Update
                </th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="7" className="py-12 text-center text-gray-400">
                    Loading...
                  </td>
                </tr>
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan="7" className="py-12 text-center text-gray-400">
                    No orders found
                  </td>
                </tr>
              ) : (
                orders.map((order) => (
                  <tr
                    key={order._id}
                    className="border-b border-gray-100 last:border-0 hover:bg-gray-50"
                  >
                    <td className="py-3 px-4">
                      <Link
                        to={`/orders/${order._id}`}
                        className="font-mono text-indigo-600 hover:underline"
                      >
                        #{order._id.slice(-8).toUpperCase()}
                      </Link>
                    </td>
                    <td className="py-3 px-4 text-gray-900">
                      {order.user?.name || 'Deleted User'}
                    </td>
                    <td className="py-3 px-4 text-gray-600">
                      {order.items.length}
                    </td>
                    <td className="py-3 px-4 font-medium text-gray-900">
                      ${order.totalPrice.toFixed(2)}
                    </td>
                    <td className="py-3 px-4 text-gray-500">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4">
                      <OrderStatusBadge status={order.status} />
                    </td>
                    <td className="py-3 px-4">
                      <select
                        value={order.status}
                        onChange={(e) =>
                          handleStatusChange(order._id, e.target.value)
                        }
                        className="px-2 py-1.5 border border-gray-300 rounded-lg text-xs focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none bg-white"
                      >
                        {STATUSES.map((s) => (
                          <option key={s} value={s}>
                            {s.charAt(0).toUpperCase() + s.slice(1)}
                          </option>
                        ))}
                      </select>
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
        onPageChange={(p) => loadOrders(p)}
      />
    </div>
  );
};

export default AdminOrders;
