import { useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchOrderById, clearOrder } from '../store/orderSlice';
import OrderStatusBadge from '../components/ui/OrderStatusBadge';
import { HiArrowLeft, HiCheck } from 'react-icons/hi2';

const ORDER_STEPS = ['pending', 'processing', 'shipped', 'delivered'];

const StatusTimeline = ({ currentStatus }) => {
  const isCancelled = currentStatus === 'cancelled';
  const currentIndex = ORDER_STEPS.indexOf(currentStatus);

  if (isCancelled) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
        <p className="text-red-700 font-semibold">This order has been cancelled</p>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-between">
      {ORDER_STEPS.map((step, idx) => {
        const isComplete = idx <= currentIndex;
        const isActive = idx === currentIndex;

        return (
          <div key={step} className="flex items-center flex-1 last:flex-initial">
            <div className="flex flex-col items-center">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  isComplete
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-200 text-gray-500'
                } ${isActive ? 'ring-4 ring-indigo-100' : ''}`}
              >
                {isComplete && idx < currentIndex ? (
                  <HiCheck className="w-4 h-4" />
                ) : (
                  idx + 1
                )}
              </div>
              <span
                className={`text-xs mt-1.5 capitalize ${
                  isComplete ? 'text-indigo-600 font-medium' : 'text-gray-400'
                }`}
              >
                {step}
              </span>
            </div>
            {idx < ORDER_STEPS.length - 1 && (
              <div
                className={`flex-1 h-0.5 mx-2 mt-[-1rem] ${
                  idx < currentIndex ? 'bg-indigo-600' : 'bg-gray-200'
                }`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
};

const OrderDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { order, loading, error } = useSelector((state) => state.orders);

  useEffect(() => {
    dispatch(fetchOrderById(id));
    return () => {
      dispatch(clearOrder());
    };
  }, [dispatch, id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12 text-center">
        <p className="text-gray-500 text-lg mb-4">
          {error || 'Order not found'}
        </p>
        <Link
          to="/orders"
          className="text-indigo-600 font-medium hover:underline"
        >
          Back to Orders
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <button
        onClick={() => navigate(-1)}
        className="inline-flex items-center gap-1 text-gray-600 hover:text-indigo-600 mb-6 transition-colors"
      >
        <HiArrowLeft className="w-4 h-4" />
        Back to Orders
      </button>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Order #{order._id.slice(-8).toUpperCase()}
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Placed on{' '}
            {new Date(order.createdAt).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            })}
          </p>
        </div>
        <OrderStatusBadge status={order.status} />
      </div>

      {/* Status Timeline */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
        <h2 className="text-sm font-semibold text-gray-500 uppercase mb-4">
          Order Progress
        </h2>
        <StatusTimeline currentStatus={order.status} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Items */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">
              Items ({order.items.length})
            </h2>
            <div className="space-y-4">
              {order.items.map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-4 pb-4 border-b border-gray-100 last:border-0 last:pb-0"
                >
                  <img
                    src={
                      item.image ||
                      './images/no-image.svg'
                    }
                    alt={item.name}
                    className="w-16 h-16 rounded-lg object-cover bg-gray-100"
                  />
                  <div className="flex-1 min-w-0">
                    <Link
                      to={`/products/${item.product}`}
                      className="text-gray-900 font-medium hover:text-indigo-600 transition-colors line-clamp-1"
                    >
                      {item.name}
                    </Link>
                    <p className="text-sm text-gray-500">
                      ${item.price.toFixed(2)} x {item.quantity}
                    </p>
                  </div>
                  <span className="font-medium text-gray-900">
                    ${(item.price * item.quantity).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Price Summary */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">
              Price Summary
            </h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Subtotal</span>
                <span className="text-gray-900">
                  ${order.itemsPrice.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Shipping</span>
                <span
                  className={
                    order.shippingPrice === 0
                      ? 'text-green-600 font-medium'
                      : 'text-gray-900'
                  }
                >
                  {order.shippingPrice === 0
                    ? 'Free'
                    : `$${order.shippingPrice.toFixed(2)}`}
                </span>
              </div>
              <div className="border-t border-gray-200 pt-2 mt-2">
                <div className="flex justify-between font-bold text-gray-900">
                  <span>Total</span>
                  <span>${order.totalPrice.toFixed(2)}</span>
                </div>
              </div>
            </div>
            <div className="mt-3 pt-3 border-t border-gray-100 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Payment</span>
                <span className="text-gray-900 capitalize">
                  {order.paymentMethod === 'cod'
                    ? 'Cash on Delivery'
                    : 'Credit Card'}
                </span>
              </div>
              <div className="flex justify-between mt-1">
                <span className="text-gray-600">Paid</span>
                <span
                  className={
                    order.isPaid ? 'text-green-600 font-medium' : 'text-yellow-600'
                  }
                >
                  {order.isPaid
                    ? `Yes — ${new Date(order.paidAt).toLocaleDateString()}`
                    : 'Not yet'}
                </span>
              </div>
            </div>
          </div>

          {/* Shipping Address */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-3">
              Shipping Address
            </h2>
            <div className="text-sm text-gray-600 space-y-1">
              <p className="font-medium text-gray-900">
                {order.shippingAddress.fullName}
              </p>
              <p>{order.shippingAddress.address}</p>
              <p>
                {order.shippingAddress.city}, {order.shippingAddress.state}{' '}
                {order.shippingAddress.zipCode}
              </p>
              <p>{order.shippingAddress.country}</p>
              <p className="pt-1">{order.shippingAddress.phone}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetail;
