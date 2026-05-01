const express = require('express');
const router = express.Router();

router.get('/health', (req, res) => {
  res.json({ success: true, message: 'API is running' });
});

// Route modules
router.use('/auth', require('./auth.routes'));
router.use('/products', require('./product.routes'));
router.use('/cart', require('./cart.routes'));
router.use('/orders', require('./order.routes'));
router.use('/admin', require('./admin.routes'));

module.exports = router;
