import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchProducts } from '../../store/productSlice';
import adminService from '../../services/adminService';
import Pagination from '../../components/ui/Pagination';
import { HiPlus, HiPencil, HiTrash, HiXMark } from 'react-icons/hi2';
import toast from 'react-hot-toast';

const CATEGORIES = [
  'Electronics',
  'Clothing',
  'Home & Kitchen',
  'Books',
  'Sports',
  'Beauty',
  'Toys',
  'Other',
];

const EMPTY_FORM = {
  name: '',
  description: '',
  price: '',
  category: 'Electronics',
  brand: '',
  stock: '',
  images: [{ url: '', alt: '' }],
};

const AdminProducts = () => {
  const dispatch = useDispatch();
  const { products, page, totalPages, total, loading } = useSelector(
    (state) => state.products
  );

  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);

  const loadProducts = (p = 1) => {
    dispatch(fetchProducts({ page: p, limit: 10 }));
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const openCreate = () => {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setShowModal(true);
  };

  const openEdit = (product) => {
    setEditingId(product._id);
    setForm({
      name: product.name,
      description: product.description,
      price: product.price,
      category: product.category,
      brand: product.brand || '',
      stock: product.stock,
      images:
        product.images?.length > 0
          ? product.images
          : [{ url: '', alt: '' }],
    });
    setShowModal(true);
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleImageChange = (index, field, value) => {
    const newImages = [...form.images];
    newImages[index] = { ...newImages[index], [field]: value };
    setForm({ ...form, images: newImages });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    const payload = {
      ...form,
      price: Number(form.price),
      stock: Number(form.stock),
      images: form.images.filter((img) => img.url.trim() !== ''),
    };

    try {
      if (editingId) {
        await adminService.updateProduct(editingId, payload);
        toast.success('Product updated');
      } else {
        await adminService.createProduct(payload);
        toast.success('Product created');
      }
      setShowModal(false);
      loadProducts(page);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Operation failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (productId, productName) => {
    if (!window.confirm(`Delete "${productName}"? This cannot be undone.`)) {
      return;
    }
    try {
      await adminService.deleteProduct(productId);
      toast.success('Product deleted');
      loadProducts(page);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Delete failed');
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-900">
          Products ({total})
        </h2>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors"
        >
          <HiPlus className="w-4 h-4" />
          Add Product
        </button>
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="text-left py-3 px-4 font-medium text-gray-500">
                  Product
                </th>
                <th className="text-left py-3 px-4 font-medium text-gray-500">
                  Category
                </th>
                <th className="text-left py-3 px-4 font-medium text-gray-500">
                  Price
                </th>
                <th className="text-left py-3 px-4 font-medium text-gray-500">
                  Stock
                </th>
                <th className="text-left py-3 px-4 font-medium text-gray-500">
                  Rating
                </th>
                <th className="text-right py-3 px-4 font-medium text-gray-500">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="6" className="py-12 text-center text-gray-400">
                    Loading...
                  </td>
                </tr>
              ) : products.length === 0 ? (
                <tr>
                  <td colSpan="6" className="py-12 text-center text-gray-400">
                    No products found
                  </td>
                </tr>
              ) : (
                products.map((product) => (
                  <tr
                    key={product._id}
                    className="border-b border-gray-100 last:border-0 hover:bg-gray-50"
                  >
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={
                            product.images?.[0]?.url ||
                            './images/no-image.svg'
                          }
                          alt={product.name}
                          className="w-10 h-10 rounded-lg object-cover bg-gray-100"
                        />
                        <span className="font-medium text-gray-900 line-clamp-1 max-w-[200px]">
                          {product.name}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-gray-600">
                      {product.category}
                    </td>
                    <td className="py-3 px-4 font-medium text-gray-900">
                      ${product.price.toFixed(2)}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`font-medium ${
                          product.stock === 0
                            ? 'text-red-600'
                            : product.stock < 10
                            ? 'text-yellow-600'
                            : 'text-green-600'
                        }`}
                      >
                        {product.stock}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-gray-600">
                      {product.ratings.toFixed(1)} ({product.numReviews})
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openEdit(product)}
                          className="p-1.5 text-gray-500 hover:text-indigo-600 transition-colors"
                        >
                          <HiPencil className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() =>
                            handleDelete(product._id, product.name)
                          }
                          className="p-1.5 text-gray-500 hover:text-red-600 transition-colors"
                        >
                          <HiTrash className="w-4 h-4" />
                        </button>
                      </div>
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
        onPageChange={loadProducts}
      />

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-5 border-b border-gray-200">
              <h3 className="text-lg font-bold text-gray-900">
                {editingId ? 'Edit Product' : 'Add Product'}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <HiXMark className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  required
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none text-sm resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Price ($)
                  </label>
                  <input
                    type="number"
                    name="price"
                    value={form.price}
                    onChange={handleChange}
                    required
                    min="0"
                    step="0.01"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Stock
                  </label>
                  <input
                    type="number"
                    name="stock"
                    value={form.stock}
                    onChange={handleChange}
                    required
                    min="0"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Category
                  </label>
                  <select
                    name="category"
                    value={form.category}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none text-sm bg-white"
                  >
                    {CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Brand
                  </label>
                  <input
                    type="text"
                    name="brand"
                    value={form.brand}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Image URL
                </label>
                <input
                  type="url"
                  value={form.images[0]?.url || ''}
                  onChange={(e) =>
                    handleImageChange(0, 'url', e.target.value)
                  }
                  placeholder="https://example.com/image.jpg"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none text-sm"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 px-4 py-2.5 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors disabled:opacity-50"
                >
                  {submitting
                    ? 'Saving...'
                    : editingId
                    ? 'Update Product'
                    : 'Create Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminProducts;
