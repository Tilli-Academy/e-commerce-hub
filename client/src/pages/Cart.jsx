import { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchCart,
  updateCartItem,
  removeCartItem,
  clearCart,
} from '../store/cartSlice';
import { HiTrash, HiPlus, HiMinus, HiShoppingCart } from 'react-icons/hi2';
import toast from 'react-hot-toast';

const Cart = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { items, totalPrice, totalItems, loading } = useSelector(
    (state) => state.cart
  );
  const { isAuthenticated } = useSelector((state) => state.auth);

  useEffect(() => {
    if (isAuthenticated) {
      dispatch(fetchCart());
    }
  }, [dispatch, isAuthenticated]);

  const handleQuantityChange = (itemId, currentQty, delta, maxStock) => {
    const newQty = currentQty + delta;
    if (newQty < 1 || newQty > maxStock) return;
    dispatch(updateCartItem({ itemId, quantity: newQty }));
  };

  const handleRemove = (itemId) => {
    dispatch(removeCartItem(itemId));
    toast.success('Item removed from cart');
  };

  const handleClearCart = () => {
    dispatch(clearCart());
    toast.success('Cart cleared');
  };

  if (!isAuthenticated) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <HiShoppingCart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Sign in to view your cart
        </h2>
        <p className="text-gray-500 mb-6">
          You need to be logged in to add items and manage your cart.
        </p>
        <Link
          to="/login"
          className="inline-block bg-indigo-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-indigo-700 transition-colors"
        >
          Sign In
        </Link>
      </div>
    );
  }

  if (loading && items.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <HiShoppingCart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Your cart is empty
        </h2>
        <p className="text-gray-500 mb-6">
          Looks like you haven't added anything to your cart yet.
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
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Shopping Cart ({totalItems} item{totalItems !== 1 ? 's' : ''})
        </h1>
        <button
          onClick={handleClearCart}
          className="text-sm text-red-600 hover:text-red-700 font-medium"
        >
          Clear Cart
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-4">
          {items.map((item) => {
            const product = item.product;
            if (!product) return null;

            const imageUrl =
              product.images?.[0]?.url ||
              './images/no-image.svg';

            return (
              <div
                key={item._id}
                className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 flex gap-4"
              >
                {/* Product Image */}
                <Link
                  to={`/products/${product._id}`}
                  className="w-24 h-24 flex-shrink-0 rounded-lg overflow-hidden bg-gray-100"
                >
                  <img
                    src={imageUrl}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                </Link>

                {/* Product Info */}
                <div className="flex-1 min-w-0">
                  <Link
                    to={`/products/${product._id}`}
                    className="text-gray-900 font-medium hover:text-indigo-600 transition-colors line-clamp-1"
                  >
                    {product.name}
                  </Link>
                  <p className="text-sm text-gray-500 mt-1">
                    ${item.price.toFixed(2)} each
                  </p>

                  {/* Quantity Controls */}
                  <div className="flex items-center gap-3 mt-3">
                    <div className="flex items-center border border-gray-300 rounded-lg">
                      <button
                        onClick={() =>
                          handleQuantityChange(
                            item._id,
                            item.quantity,
                            -1,
                            product.stock
                          )
                        }
                        disabled={item.quantity <= 1}
                        className="p-1.5 text-gray-600 hover:text-gray-900 disabled:opacity-30 disabled:cursor-not-allowed"
                      >
                        <HiMinus className="w-4 h-4" />
                      </button>
                      <span className="px-3 py-1 text-sm font-medium min-w-[2.5rem] text-center">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() =>
                          handleQuantityChange(
                            item._id,
                            item.quantity,
                            1,
                            product.stock
                          )
                        }
                        disabled={item.quantity >= product.stock}
                        className="p-1.5 text-gray-600 hover:text-gray-900 disabled:opacity-30 disabled:cursor-not-allowed"
                      >
                        <HiPlus className="w-4 h-4" />
                      </button>
                    </div>

                    <button
                      onClick={() => handleRemove(item._id)}
                      className="p-1.5 text-red-500 hover:text-red-700 transition-colors"
                    >
                      <HiTrash className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                {/* Item Subtotal */}
                <div className="text-right flex-shrink-0">
                  <p className="text-lg font-bold text-gray-900">
                    ${(item.price * item.quantity).toFixed(2)}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 sticky top-24">
            <h2 className="text-lg font-bold text-gray-900 mb-4">
              Order Summary
            </h2>

            <div className="space-y-3 mb-4">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">
                  Subtotal ({totalItems} item{totalItems !== 1 ? 's' : ''})
                </span>
                <span className="text-gray-900 font-medium">
                  ${totalPrice.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Shipping</span>
                <span className="text-green-600 font-medium">Free</span>
              </div>
            </div>

            <div className="border-t border-gray-200 pt-4 mb-6">
              <div className="flex justify-between">
                <span className="text-lg font-bold text-gray-900">Total</span>
                <span className="text-lg font-bold text-gray-900">
                  ${totalPrice.toFixed(2)}
                </span>
              </div>
            </div>

            <button
              onClick={() => navigate('/checkout')}
              className="w-full bg-indigo-600 text-white py-3 rounded-lg font-semibold hover:bg-indigo-700 transition-colors"
            >
              Proceed to Checkout
            </button>

            <Link
              to="/products"
              className="block text-center text-sm text-indigo-600 font-medium mt-4 hover:underline"
            >
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
