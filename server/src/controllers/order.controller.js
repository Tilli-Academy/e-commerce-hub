const orderService = require('../services/order.service');

const placeOrder = async (req, res, next) => {
  try {
    const { shippingAddress, paymentMethod } = req.body;
    const order = await orderService.placeOrder(req.user.id, {
      shippingAddress,
      paymentMethod,
    });

    res.status(201).json({
      success: true,
      message: 'Order placed successfully',
      order,
    });
  } catch (error) {
    next(error);
  }
};

const getUserOrders = async (req, res, next) => {
  try {
    const result = await orderService.getUserOrders(req.user.id, req.query);
    res.json({ success: true, ...result });
  } catch (error) {
    next(error);
  }
};

const getOrderById = async (req, res, next) => {
  try {
    const isAdmin = req.user.role === 'admin';
    const order = await orderService.getOrderById(
      req.params.id,
      req.user.id,
      isAdmin
    );
    res.json({ success: true, order });
  } catch (error) {
    next(error);
  }
};

const getAllOrders = async (req, res, next) => {
  try {
    const result = await orderService.getAllOrders(req.query);
    res.json({ success: true, ...result });
  } catch (error) {
    next(error);
  }
};

const updateOrderStatus = async (req, res, next) => {
  try {
    const order = await orderService.updateOrderStatus(
      req.params.id,
      req.body.status
    );
    res.json({ success: true, order });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  placeOrder,
  getUserOrders,
  getOrderById,
  getAllOrders,
  updateOrderStatus,
};
