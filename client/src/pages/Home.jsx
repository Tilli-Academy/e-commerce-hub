import { Link } from 'react-router-dom';
import SEO from '../components/SEO';

const Home = () => {
  return (
    <div>
      <SEO description="Discover amazing products at unbeatable prices. Shop the latest trends with fast delivery and secure checkout." />
      {/* Hero Section */}
      <section className="bg-indigo-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            Welcome to ShopHub
          </h1>
          <p className="text-lg md:text-xl text-indigo-100 mb-8 max-w-2xl mx-auto">
            Discover amazing products at unbeatable prices. Shop the latest
            trends with fast delivery and secure checkout.
          </p>
          <Link
            to="/products"
            className="inline-block bg-white text-indigo-600 px-8 py-3 rounded-lg font-semibold hover:bg-indigo-50 transition-colors"
          >
            Shop Now
          </Link>
        </div>
      </section>

      {/* Features Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center p-6">
            <div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">
              1
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Wide Selection
            </h3>
            <p className="text-gray-600">
              Browse thousands of products across multiple categories.
            </p>
          </div>
          <div className="text-center p-6">
            <div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">
              2
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Secure Checkout
            </h3>
            <p className="text-gray-600">
              Your payment information is always safe and encrypted.
            </p>
          </div>
          <div className="text-center p-6">
            <div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">
              3
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Fast Delivery
            </h3>
            <p className="text-gray-600">
              Get your orders delivered quickly and reliably.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
