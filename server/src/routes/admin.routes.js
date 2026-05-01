const express = require('express');
const { body, param } = require('express-validator');
const validate = require('../middleware/validate');
const { authenticate, authorize } = require('../middleware/auth');
const adminController = require('../controllers/admin.controller');

const router = express.Router();

// All admin routes require authentication + admin role
router.use(authenticate, authorize('admin'));

// Dashboard
router.get('/stats', adminController.getDashboardStats);

// User management
router.get('/users', adminController.getUsers);

router.put(
  '/users/:id/role',
  [
    param('id').isInt({ min: 1 }).withMessage('Invalid user ID'),
    body('role')
      .isIn(['user', 'admin'])
      .withMessage('Role must be user or admin'),
    validate,
  ],
  adminController.updateUserRole
);

router.delete(
  '/users/:id',
  [param('id').isInt({ min: 1 }).withMessage('Invalid user ID'), validate],
  adminController.deleteUser
);

module.exports = router;
