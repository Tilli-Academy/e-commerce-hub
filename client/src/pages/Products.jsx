import { useEffect, useState, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchProducts, fetchCategories } from '../store/productSlice';
import ProductCard from '../components/ui/ProductCard';
import Pagination from '../components/ui/Pagination';
import { HiMagnifyingGlass, HiXMark } from 'react-icons/hi2';
import SEO from '../components/SEO';

const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest' },
  { value: 'price_asc', label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
  { value: 'rating', label: 'Top Rated' },
];

const Products = () => {
  const dispatch = useDispatch();
  const [searchParams, setSearchParams] = useSearchParams();
  const { products, categories, page, totalPages, total, loading } =
    useSelector((state) => state.products);

  const [keyword, setKeyword] = useState(searchParams.get('keyword') || '');

  const currentParams = {
    keyword: searchParams.get('keyword') || '',
    category: searchParams.get('category') || '',
    sort: searchParams.get('sort') || 'newest',
    page: searchParams.get('page') || '1',
  };

  useEffect(() => {
    dispatch(fetchCategories());
  }, [dispatch]);

  useEffect(() => {
    const params = {};
    if (currentParams.keyword) params.keyword = currentParams.keyword;
    if (currentParams.category) params.category = currentParams.category;
    if (currentParams.sort) params.sort = currentParams.sort;
    params.page = currentParams.page;

    dispatch(fetchProducts(params));
  }, [dispatch, searchParams]);

  const updateParams = useCallback(
    (updates) => {
      const newParams = new URLSearchParams(searchParams);
      Object.entries(updates).forEach(([key, value]) => {
        if (value) {
          newParams.set(key, value);
        } else {
          newParams.delete(key);
        }
      });
      // Reset to page 1 on filter changes (unless changing page itself)
      if (!('page' in updates)) {
        newParams.set('page', '1');
      }
      setSearchParams(newParams);
    },
    [searchParams, setSearchParams]
  );

  const handleSearch = (e) => {
    e.preventDefault();
    updateParams({ keyword: keyword.trim() });
  };

  const clearFilters = () => {
    setKeyword('');
    setSearchParams({});
  };

  const hasActiveFilters =
    currentParams.keyword || currentParams.category;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <SEO title="Products" description="Browse our wide selection of products across multiple categories." />
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Products</h1>

      {/* Search & Filters Bar */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-8">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <form onSubmit={handleSearch} className="flex-1 flex gap-2">
            <div className="relative flex-1">
              <HiMagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search products..."
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
              />
            </div>
            <button
              type="submit"
              className="px-5 py-2.5 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors"
            >
              Search
            </button>
          </form>

          {/* Category Filter */}
          <select
            value={currentParams.category}
            onChange={(e) => updateParams({ category: e.target.value })}
            className="px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none bg-white"
          >
            <option value="">All Categories</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>

          {/* Sort */}
          <select
            value={currentParams.sort}
            onChange={(e) => updateParams({ sort: e.target.value })}
            className="px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none bg-white"
          >
            {SORT_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        {/* Active Filters */}
        {hasActiveFilters && (
          <div className="flex items-center gap-2 mt-3 pt-3 border-t border-gray-100">
            <span className="text-sm text-gray-500">Active filters:</span>
            {currentParams.keyword && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-indigo-50 text-indigo-700 rounded-full text-sm">
                "{currentParams.keyword}"
                <button
                  onClick={() => {
                    setKeyword('');
                    updateParams({ keyword: '' });
                  }}
                >
                  <HiXMark className="w-4 h-4" />
                </button>
              </span>
            )}
            {currentParams.category && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-indigo-50 text-indigo-700 rounded-full text-sm">
                {currentParams.category}
                <button onClick={() => updateParams({ category: '' })}>
                  <HiXMark className="w-4 h-4" />
                </button>
              </span>
            )}
            <button
              onClick={clearFilters}
              className="text-sm text-red-600 hover:underline ml-2"
            >
              Clear all
            </button>
          </div>
        )}
      </div>

      {/* Results Count */}
      <p className="text-sm text-gray-500 mb-4">
        {total} product{total !== 1 ? 's' : ''} found
      </p>

      {/* Product Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-gray-500 text-lg">No products found.</p>
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="mt-4 text-indigo-600 font-medium hover:underline"
            >
              Clear filters
            </button>
          )}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {products.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>

          <Pagination
            page={page}
            totalPages={totalPages}
            onPageChange={(p) => updateParams({ page: String(p) })}
          />
        </>
      )}
    </div>
  );
};

export default Products;
