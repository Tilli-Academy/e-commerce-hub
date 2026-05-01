import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchProductById, clearProduct, submitReview } from '../store/productSlice';
import { addToCart } from '../store/cartSlice';
import StarRating from '../components/ui/StarRating';
import { HiArrowLeft, HiShoppingCart } from 'react-icons/hi2';
import SEO from '../components/SEO';
import toast from 'react-hot-toast';

const ProductDetail = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { product, loading, error } = useSelector((state) => state.products);
  const { isAuthenticated } = useSelector((state) => state.auth);

  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: '' });
  const [submitting, setSubmitting] = useState(false);

  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      toast.error('Please sign in to add items to cart');
      navigate('/login');
      return;
    }
    try {
      await dispatch(addToCart({ productId: id, quantity })).unwrap();
      toast.success('Added to cart');
    } catch (err) {
      toast.error(err || 'Failed to add to cart');
    }
  };

  useEffect(() => {
    dispatch(fetchProductById(id));
    return () => {
      dispatch(clearProduct());
    };
  }, [dispatch, id]);

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await dispatch(
        submitReview({ productId: id, reviewData: reviewForm })
      ).unwrap();
      toast.success('Review submitted');
      setReviewForm({ rating: 5, comment: '' });
    } catch (err) {
      toast.error(err || 'Failed to submit review');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12 text-center">
        <p className="text-gray-500 text-lg mb-4">
          {error || 'Product not found'}
        </p>
        <Link
          to="/products"
          className="text-indigo-600 font-medium hover:underline"
        >
          Back to Products
        </Link>
      </div>
    );
  }

  const images =
    product.images?.length > 0
      ? product.images
      : [{ url: './images/no-image.svg', alt: '' }];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <SEO title={product.name} description={product.description?.slice(0, 160)} />
      {/* Back Link */}
      <Link
        to="/products"
        className="inline-flex items-center gap-1 text-gray-600 hover:text-indigo-600 mb-6 transition-colors"
      >
        <HiArrowLeft className="w-4 h-4" />
        Back to Products
      </Link>

      {/* Product Info */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        {/* Images */}
        <div>
          <div className="aspect-square rounded-xl overflow-hidden bg-gray-100 mb-4">
            <img
              src={images[selectedImage].url}
              alt={images[selectedImage].alt || product.name}
              className="w-full h-full object-cover"
            />
          </div>
          {images.length > 1 && (
            <div className="flex gap-3">
              {images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImage(idx)}
                  className={`w-20 h-20 rounded-lg overflow-hidden border-2 transition-colors ${
                    idx === selectedImage
                      ? 'border-indigo-600'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <img
                    src={img.url}
                    alt={img.alt || `${product.name} ${idx + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Details */}
        <div>
          <span className="inline-block px-3 py-1 bg-indigo-50 text-indigo-700 rounded-full text-sm font-medium mb-3">
            {product.category}
          </span>
          <h1 className="text-3xl font-bold text-gray-900 mb-3">
            {product.name}
          </h1>

          <div className="flex items-center gap-3 mb-4">
            <StarRating
              rating={product.ratings}
              count={product.numReviews}
              size="w-5 h-5"
            />
          </div>

          <p className="text-3xl font-bold text-gray-900 mb-6">
            ${product.price.toFixed(2)}
          </p>

          <p className="text-gray-600 leading-relaxed mb-6">
            {product.description}
          </p>

          <div className="space-y-3 mb-6 pb-6 border-b border-gray-200">
            {product.brand && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Brand</span>
                <span className="text-gray-900 font-medium">
                  {product.brand}
                </span>
              </div>
            )}
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Availability</span>
              <span
                className={`font-medium ${
                  product.stock > 0 ? 'text-green-600' : 'text-red-600'
                }`}
              >
                {product.stock > 0
                  ? `In Stock (${product.stock})`
                  : 'Out of Stock'}
              </span>
            </div>
          </div>

          {/* Quantity Selector */}
          {product.stock > 0 && (
            <div className="flex items-center gap-4 mb-4">
              <span className="text-sm font-medium text-gray-700">Qty:</span>
              <select
                value={quantity}
                onChange={(e) => setQuantity(Number(e.target.value))}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none bg-white"
              >
                {[...Array(Math.min(product.stock, 10)).keys()].map((i) => (
                  <option key={i + 1} value={i + 1}>
                    {i + 1}
                  </option>
                ))}
              </select>
            </div>
          )}

          <button
            onClick={handleAddToCart}
            disabled={product.stock === 0}
            className="w-full flex items-center justify-center gap-2 bg-indigo-600 text-white py-3 rounded-lg font-semibold hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <HiShoppingCart className="w-5 h-5" />
            {product.stock > 0 ? 'Add to Cart' : 'Out of Stock'}
          </button>
        </div>
      </div>

      {/* Reviews Section */}
      <div className="mt-16">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          Customer Reviews ({product.numReviews})
        </h2>

        {/* Review Form */}
        {isAuthenticated && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Write a Review
            </h3>
            <form onSubmit={handleReviewSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Rating
                </label>
                <select
                  value={reviewForm.rating}
                  onChange={(e) =>
                    setReviewForm({
                      ...reviewForm,
                      rating: Number(e.target.value),
                    })
                  }
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none bg-white"
                >
                  {[5, 4, 3, 2, 1].map((n) => (
                    <option key={n} value={n}>
                      {n} Star{n !== 1 ? 's' : ''}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Comment
                </label>
                <textarea
                  value={reviewForm.comment}
                  onChange={(e) =>
                    setReviewForm({ ...reviewForm, comment: e.target.value })
                  }
                  required
                  maxLength={500}
                  rows={4}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none resize-none"
                  placeholder="Share your experience..."
                />
              </div>
              <button
                type="submit"
                disabled={submitting}
                className="px-6 py-2.5 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors disabled:opacity-50"
              >
                {submitting ? 'Submitting...' : 'Submit Review'}
              </button>
            </form>
          </div>
        )}

        {/* Reviews List */}
        {product.reviews?.length === 0 ? (
          <p className="text-gray-500">No reviews yet. Be the first!</p>
        ) : (
          <div className="space-y-4">
            {product.reviews?.map((review) => (
              <div
                key={review._id}
                className="bg-white rounded-xl shadow-sm border border-gray-100 p-6"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-gray-900">
                    {review.name}
                  </span>
                  <span className="text-sm text-gray-400">
                    {new Date(review.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <StarRating rating={review.rating} />
                <p className="mt-2 text-gray-600">{review.comment}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductDetail;
