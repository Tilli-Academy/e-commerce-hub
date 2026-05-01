import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import adminService from '../../services/adminService';
import OrderStatusBadge from '../../components/ui/OrderStatusBadge';
import {
  HiOutlineUsers,
  HiOutlineCube,
  HiOutlineClipboardDocumentList,
  HiOutlineCurrencyDollar,
} from 'react-icons/hi2';

const StatCard = ({ icon: Icon, label, value, color, link }) => (
  <Link
    to={link}
    className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition-shadow"
  >
    <div className="flex items-center gap-4">
      <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${color}`}>
        <Icon className="w-6 h-6" />
      </div>
      <div>
        <p className="text-sm text-gray-500">{label}</p>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
      </div>
    </div>
  </Link>
);

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await adminService.getStats();
        setStats(data);
      } catch (error) {
        console.error('Failed to fetch stats:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!stats) {
    return <p className="text-gray-500">Failed to load dashboard data.</p>;
  }

  return (
    <div className="space-y-8">
      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard
          icon={HiOutlineCurrencyDollar}
          label="Total Revenue"
          value={`$${stats.revenue.toFixed(2)}`}
          color="bg-green-100 text-green-600"
          link="/admin/orders"
        />
        <StatCard
          icon={HiOutlineClipboardDocumentList}
          label="Total Orders"
          value={stats.totalOrders}
          color="bg-blue-100 text-blue-600"
          link="/admin/orders"
        />
        <StatCard
          icon={HiOutlineCube}
          label="Total Products"
          value={stats.totalProducts}
          color="bg-purple-100 text-purple-600"
          link="/admin/products"
        />
        <StatCard
          icon={HiOutlineUsers}
          label="Total Users"
          value={stats.totalUsers}
          color="bg-orange-100 text-orange-600"
          link="/admin/users"
        />
      </div>

      {/* Orders by Status */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-lg font-bold text-gray-900 mb-4">
          Orders by Status
        </h2>
        <div className="flex flex-wrap gap-4">
          {['pending', 'processing', 'shipped', 'delivered', 'cancelled'].map(
            (status) => (
              <div key={status} className="text-center">
                <p className="text-2xl font-bold text-gray-900">
                  {stats.ordersByStatus[status] || 0}
                </p>
                <OrderStatusBadge status={status} />
              </div>
            )
          )}
        </div>
      </div>

      {/* Recent Orders */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-gray-900">Recent Orders</h2>
          <Link
            to="/admin/orders"
            className="text-sm text-indigo-600 font-medium hover:underline"
          >
            View All
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-2 font-medium text-gray-500">
                  Order ID
                </th>
                <th className="text-left py-3 px-2 font-medium text-gray-500">
                  Customer
                </th>
                <th className="text-left py-3 px-2 font-medium text-gray-500">
                  Total
                </th>
                <th className="text-left py-3 px-2 font-medium text-gray-500">
                  Status
                </th>
                <th className="text-left py-3 px-2 font-medium text-gray-500">
                  Date
                </th>
              </tr>
            </thead>
            <tbody>
              {stats.recentOrders.map((order) => (
                <tr
                  key={order._id}
                  className="border-b border-gray-100 last:border-0"
                >
                  <td className="py-3 px-2">
                    <Link
                      to={`/orders/${order._id}`}
                      className="font-mono text-indigo-600 hover:underline"
                    >
                      #{order._id.slice(-8).toUpperCase()}
                    </Link>
                  </td>
                  <td className="py-3 px-2 text-gray-900">
                    {order.user?.name || 'Deleted User'}
                  </td>
                  <td className="py-3 px-2 font-medium text-gray-900">
                    ${order.totalPrice.toFixed(2)}
                  </td>
                  <td className="py-3 px-2">
                    <OrderStatusBadge status={order.status} />
                  </td>
                  <td className="py-3 px-2 text-gray-500">
                    {new Date(order.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
