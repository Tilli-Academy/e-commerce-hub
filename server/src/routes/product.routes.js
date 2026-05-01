const express = require('express');
const { body, param } = require('express-validator');
const validate = require('../middleware/validate');
const { authenticate, authorize } = require('../middleware/auth');
const productController = require('../controllers/product.controller');

const router = express.Router();

// Public routes
router.get('/', productController.getProducts);
router.get('/categories', productController.getCategories);
router.get(
  '/:id',
  [param('id').isInt({ min: 1 }).withMessage('Invalid product ID'), validate],
  productController.getProductById
);

// Authenticated user — reviews
router.post(
  '/:id/reviews',
  authenticate,
  [
    param('id').isInt({ min: 1 }).withMessage('Invalid product ID'),
    body('rating')
      .isInt({ min: 1, max: 5 })
      .withMessage('Rating must be between 1 and 5'),
    body('comment')
      .trim()
      .notEmpty()
      .withMessage('Comment is required')
      .isLength({ max: 500 })
      .withMessage('Comment cannot exceed 500 characters'),
    validate,
  ],
  productController.createReview
);

// Admin routes
router.post(
  '/',
  authenticate,
  authorize('admin'),
  [
    body('name')
      .trim()
      .notEmpty()
      .withMessage('Product name is required')
      .isLength({ max: 200 })
      .withMessage('Name cannot exceed 200 characters'),
    body('description')
      .trim()
      .notEmpty()
      .withMessage('Description is required')
      .isLength({ max: 2000 })
      .withMessage('Description cannot exceed 2000 characters'),
    body('price')
      .isFloat({ min: 0 })
      .withMessage('Price must be a positive number'),
    body('category')
      .trim()
      .notEmpty()
      .withMessage('Category is required')
      .isIn([
        'Electronics',
        'Clothing',
        'Home & Kitchen',
        'Books',
        'Sports',
        'Beauty',
        'Toys',
        'Other',
      ])
      .withMessage('Invalid category'),
    body('stock')
      .isInt({ min: 0 })
      .withMessage('Stock must be a non-negative integer'),
    validate,
  ],
  productController.createProduct
);

router.put(
  '/:id',
  authenticate,
  authorize('admin'),
  [param('id').isInt({ min: 1 }).withMessage('Invalid product ID'), validate],
  productController.updateProduct
);

router.delete(
  '/:id',
  authenticate,
  authorize('admin'),
  [param('id').isInt({ min: 1 }).withMessage('Invalid product ID'), validate],
  productController.deleteProduct
);

module.exports = router;
