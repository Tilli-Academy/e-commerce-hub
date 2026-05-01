import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { placeOrder, clearPlacedOrder } from '../store/orderSlice';
import { resetCart } from '../store/cartSlice';
import toast from 'react-hot-toast';

const INITIAL_SHIPPING = {
  fullName: '',
  address: '',
  city: '',
  state: '',
  zipCode: '',
  country: '',
  phone: '',
};

const Checkout = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { items, totalPrice, totalItems } = useSelector((state) => state.cart);
  const { loading, error, placedOrder } = useSelector((state) => state.orders);

  const [shippingAddress, setShippingAddress] = useState(INITIAL_SHIPPING);
  const [paymentMethod, setPaymentMethod] = useState('cod');

  const shippingCost = totalPrice >= 100 ? 0 : 10;
  const orderTotal = totalPrice + shippingCost;

  useEffect(() => {
    if (items.length === 0 && !placedOrder) {
      navigate('/cart');
    }
  }, [items, placedOrder, navigate]);

  useEffect(() => {
    if (placedOrder) {
      dispatch(resetCart());
      toast.success('Order placed successfully!');
      navigate(`/orders/${placedOrder._id}`);
      dispatch(clearPlacedOrder());
    }
  }, [placedOrder, navigate, dispatch]);

  useEffect(() => {
    if (error) {
      toast.error(error);
    }
  }, [error]);

  const handleChange = (e) => {
    setShippingAddress({ ...shippingAddress, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    dispatch(placeOrder({ shippingAddress, paymentMethod }));
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Checkout</h1>

      <form
        onSubmit={handleSubmit}
        className="grid grid-cols-1 lg:grid-cols-3 gap-8"
      >
        {/* Shipping & Payment */}
        <div className="lg:col-span-2 space-y-6">
          {/* Shipping Address */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">
              Shipping Address
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  name="fullName"
                  value={shippingAddress.fullName}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                  placeholder="John Doe"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Address
                </label>
                <input
                  type="text"
                  name="address"
                  value={shippingAddress.address}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                  placeholder="123 Main St, Apt 4"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  City
                </label>
                <input
                  type="text"
                  name="city"
                  value={shippingAddress.city}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                  placeholder="New York"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  State
                </label>
                <input
                  type="text"
                  name="state"
                  value={shippingAddress.state}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                  placeholder="NY"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Zip Code
                </label>
                <input
                  type="text"
                  name="zipCode"
                  value={shippingAddress.zipCode}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                  placeholder="10001"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Country
                </label>
                <input
                  type="text"
                  name="country"
                  value={shippingAddress.country}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                  placeholder="United States"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone Number
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={shippingAddress.phone}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                  placeholder="+1 (555) 000-0000"
                />
              </div>
            </div>
          </div>

          {/* Payment Method */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">
              Payment Method
            </h2>
            <div className="space-y-3">
              <label className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 has-[:checked]:border-indigo-500 has-[:checked]:bg-indigo-50">
                <input
                  type="radio"
                  name="paymentMethod"
                  value="cod"
                  checked={paymentMethod === 'cod'}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="text-indigo-600 focus:ring-indigo-500"
                />
                <div>
                  <p className="font-medium text-gray-900">Cash on Delivery</p>
                  <p className="text-sm text-gray-500">
                    Pay when your order arrives
                  </p>
                </div>
              </label>
              <label className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 has-[:checked]:border-indigo-500 has-[:checked]:bg-indigo-50">
                <input
                  type="radio"
                  name="paymentMethod"
                  value="card"
                  checked={paymentMethod === 'card'}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="text-indigo-600 focus:ring-indigo-500"
                />
                <div>
                  <p className="font-medium text-gray-900">Credit/Debit Card</p>
                  <p className="text-sm text-gray-500">
                    Pay now securely online
                  </p>
                </div>
              </label>
            </div>
          </div>
        </div>

        {/* Order Summary Sidebar */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 sticky top-24">
            <h2 className="text-lg font-bold text-gray-900 mb-4">
              Order Summary
            </h2>

            {/* Items */}
            <div className="space-y-3 mb-4 max-h-60 overflow-y-auto">
              {items.map((item) => (
                <div
                  key={item._id}
                  className="flex items-center gap-3 text-sm"
                >
                  <img
                    src={
                      item.product?.images?.[0]?.url ||
                      './images/no-image.svg'
                    }
                    alt={item.product?.name}
                    className="w-12 h-12 rounded-lg object-cover bg-gray-100"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-gray-900 truncate">
                      {item.product?.name}
                    </p>
                    <p className="text-gray-500">Qty: {item.quantity}</p>
                  </div>
                  <span className="font-medium text-gray-900">
                    ${(item.price * item.quantity).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>

            <div className="border-t border-gray-200 pt-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">
                  Subtotal ({totalItems} item{totalItems !== 1 ? 's' : ''})
                </span>
                <span className="text-gray-900">${totalPrice.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Shipping</span>
                <span
                  className={
                    shippingCost === 0
                      ? 'text-green-600 font-medium'
                      : 'text-gray-900'
                  }
                >
                  {shippingCost === 0 ? 'Free' : `$${shippingCost.toFixed(2)}`}
                </span>
              </div>
              {shippingCost > 0 && (
                <p className="text-xs text-gray-400">
                  Free shipping on orders over $100
                </p>
              )}
            </div>

            <div className="border-t border-gray-200 pt-4 mt-4 mb-6">
              <div className="flex justify-between">
                <span className="text-lg font-bold text-gray-900">Total</span>
                <span className="text-lg font-bold text-gray-900">
                  ${orderTotal.toFixed(2)}
                </span>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-indigo-600 text-white py-3 rounded-lg font-semibold hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Placing Order...' : 'Place Order'}
            </button>

            <Link
              to="/cart"
              className="block text-center text-sm text-indigo-600 font-medium mt-4 hover:underline"
            >
              Back to Cart
            </Link>
          </div>
        </div>
      </form>
    </div>
  );
};

export default Checkout;
