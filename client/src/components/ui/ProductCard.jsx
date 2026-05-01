import { Link } from 'react-router-dom';
import StarRating from './StarRating';

const ProductCard = ({ product }) => {
  const imageUrl =
    product.images?.[0]?.url ||
    './images/no-image.svg';

  return (
    <Link
      to={`/products/${product._id}`}
      className="group bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow"
    >
      <div className="aspect-square overflow-hidden bg-gray-100">
        <img
          src={imageUrl}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
      </div>
      <div className="p-4">
        <h3 className="text-sm font-medium text-gray-900 line-clamp-2 mb-1">
          {product.name}
        </h3>
        <StarRating rating={product.ratings} count={product.numReviews} />
        <div className="mt-2 flex items-center justify-between">
          <span className="text-lg font-bold text-gray-900">
            ${product.price.toFixed(2)}
          </span>
          {product.stock === 0 && (
            <span className="text-xs font-medium text-red-600 bg-red-50 px-2 py-1 rounded">
              Out of Stock
            </span>
          )}
        </div>
      </div>
    </Link>
  );
};

export default ProductCard;
