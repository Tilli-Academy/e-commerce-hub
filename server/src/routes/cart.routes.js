const express = require('express');
const { body, param } = require('express-validator');
const validate = require('../middleware/validate');
const { authenticate } = require('../middleware/auth');
const cartController = require('../controllers/cart.controller');

const router = express.Router();

// All cart routes require authentication
router.use(authenticate);

router.get('/', cartController.getCart);

router.post(
  '/',
  [
    body('productId').isInt({ min: 1 }).withMessage('Invalid product ID'),
    body('quantity')
      .optional()
      .isInt({ min: 1 })
      .withMessage('Quantity must be at least 1'),
    validate,
  ],
  cartController.addToCart
);

router.put(
  '/:itemId',
  [
    param('itemId').isInt({ min: 1 }).withMessage('Invalid item ID'),
    body('quantity')
      .isInt({ min: 1 })
      .withMessage('Quantity must be at least 1'),
    validate,
  ],
  cartController.updateCartItem
);

router.delete(
  '/:itemId',
  [param('itemId').isInt({ min: 1 }).withMessage('Invalid item ID'), validate],
  cartController.removeCartItem
);

router.delete('/', cartController.clearCart);

module.exports = router;
