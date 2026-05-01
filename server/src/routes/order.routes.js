const express = require('express');
const { body, param, query } = require('express-validator');
const validate = require('../middleware/validate');
const { authenticate, authorize } = require('../middleware/auth');
const orderController = require('../controllers/order.controller');

const router = express.Router();

// All order routes require authentication
router.use(authenticate);

// User routes
router.post(
  '/',
  [
    body('shippingAddress.fullName')
      .trim()
      .notEmpty()
      .withMessage('Full name is required'),
    body('shippingAddress.address')
      .trim()
      .notEmpty()
      .withMessage('Address is required'),
    body('shippingAddress.city')
      .trim()
      .notEmpty()
      .withMessage('City is required'),
    body('shippingAddress.state')
      .trim()
      .notEmpty()
      .withMessage('State is required'),
    body('shippingAddress.zipCode')
      .trim()
      .notEmpty()
      .withMessage('Zip code is required'),
    body('shippingAddress.country')
      .trim()
      .notEmpty()
      .withMessage('Country is required'),
    body('shippingAddress.phone')
      .trim()
      .notEmpty()
      .withMessage('Phone number is required'),
    body('paymentMethod')
      .isIn(['cod', 'card'])
      .withMessage('Payment method must be cod or card'),
    validate,
  ],
  orderController.placeOrder
);

router.get('/my-orders', orderController.getUserOrders);

router.get(
  '/:id',
  [param('id').isInt({ min: 1 }).withMessage('Invalid order ID'), validate],
  orderController.getOrderById
);

// Admin routes
router.get('/', authorize('admin'), orderController.getAllOrders);

router.put(
  '/:id/status',
  authorize('admin'),
  [
    param('id').isInt({ min: 1 }).withMessage('Invalid order ID'),
    body('status')
      .isIn(['pending', 'processing', 'shipped', 'delivered', 'cancelled'])
      .withMessage('Invalid status'),
    validate,
  ],
  orderController.updateOrderStatus
);

module.exports = router;
