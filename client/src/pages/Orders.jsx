import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchMyOrders } from '../store/orderSlice';
import OrderStatusBadge from '../components/ui/OrderStatusBadge';
import Pagination from '../components/ui/Pagination';
import { HiOutlineClipboardDocumentList } from 'react-icons/hi2';

const Orders = () => {
  const dispatch = useDispatch();
  const { orders, page, totalPages, total, loading } = useSelector(
    (state) => state.orders
  );

  useEffect(() => {
    dispatch(fetchMyOrders({ page }));
  }, [dispatch, page]);

  const handlePageChange = (newPage) => {
    dispatch(fetchMyOrders({ page: newPage }));
  };

  if (loading && orders.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <HiOutlineClipboardDocumentList className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          No orders yet
        </h2>
        <p className="text-gray-500 mb-6">
          You haven't placed any orders yet. Start shopping!
        </p>
        <Link
          to="/products"
          className="inline-block bg-indigo-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-indigo-700 transition-colors"
        >
          Browse Products
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">
        My Orders ({total})
      </h1>

      <div className="space-y-4">
        {orders.map((order) => (
          <Link
            key={order._id}
            to={`/orders/${order._id}`}
            className="block bg-white rounded-xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition-shadow"
          >
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <span className="text-sm font-mono text-gray-500">
                    #{order._id.slice(-8).toUpperCase()}
                  </span>
                  <OrderStatusBadge status={order.status} />
                </div>
                <p className="text-sm text-gray-500">
                  {new Date(order.createdAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </p>
              </div>

              <div className="flex items-center gap-4">
                <div className="text-right">
                  <p className="text-lg font-bold text-gray-900">
                    ${order.totalPrice.toFixed(2)}
                  </p>
                  <p className="text-sm text-gray-500">
                    {order.items.length} item{order.items.length !== 1 ? 's' : ''}
                  </p>
                </div>
              </div>
            </div>

            {/* Item thumbnails */}
            <div className="flex gap-2 mt-3 pt-3 border-t border-gray-100">
              {order.items.slice(0, 4).map((item, idx) => (
                <img
                  key={idx}
                  src={
                    item.image ||
                    './images/no-image.svg'
                  }
                  alt={item.name}
                  className="w-10 h-10 rounded-lg object-cover bg-gray-100"
                />
              ))}
              {order.items.length > 4 && (
                <span className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center text-xs text-gray-500 font-medium">
                  +{order.items.length - 4}
                </span>
              )}
            </div>
          </Link>
        ))}
      </div>

      <Pagination
        page={page}
        totalPages={totalPages}
        onPageChange={handlePageChange}
      />
    </div>
  );
};

export default Orders;
