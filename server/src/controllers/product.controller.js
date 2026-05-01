const productService = require('../services/product.service');
const { eq } = require('drizzle-orm');
const { getDB } = require('../db');
const { users } = require('../db/schema');

const getProducts = async (req, res, next) => {
  try {
    const result = await productService.getProducts(req.query);
    res.json({ success: true, ...result });
  } catch (error) {
    next(error);
  }
};

const getProductById = async (req, res, next) => {
  try {
    const product = await productService.getProductById(req.params.id);
    res.json({ success: true, product });
  } catch (error) {
    next(error);
  }
};

const getCategories = async (req, res, next) => {
  try {
    const categories = await productService.getCategories();
    res.json({ success: true, categories });
  } catch (error) {
    next(error);
  }
};

const createProduct = async (req, res, next) => {
  try {
    const product = await productService.createProduct(req.body, req.user.id);
    res.status(201).json({ success: true, product });
  } catch (error) {
    next(error);
  }
};

const updateProduct = async (req, res, next) => {
  try {
    const product = await productService.updateProduct(req.params.id, req.body);
    res.json({ success: true, product });
  } catch (error) {
    next(error);
  }
};

const deleteProduct = async (req, res, next) => {
  try {
    await productService.deleteProduct(req.params.id);
    res.json({ success: true, message: 'Product deleted' });
  } catch (error) {
    next(error);
  }
};

const createReview = async (req, res, next) => {
  try {
    const db = getDB();
    const [user] = await db
      .select({ name: users.name })
      .from(users)
      .where(eq(users.id, req.user.id));

    const product = await productService.createReview(
      req.params.id,
      req.user.id,
      user.name,
      req.body
    );
    res.status(201).json({ success: true, product });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getProducts,
  getProductById,
  getCategories,
  createProduct,
  updateProduct,
  deleteProduct,
  createReview,
};
