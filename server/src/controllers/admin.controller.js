const adminService = require('../services/admin.service');

const getDashboardStats = async (req, res, next) => {
  try {
    const stats = await adminService.getDashboardStats();
    res.json({ success: true, ...stats });
  } catch (error) {
    next(error);
  }
};

const getUsers = async (req, res, next) => {
  try {
    const result = await adminService.getUsers(req.query);
    res.json({ success: true, ...result });
  } catch (error) {
    next(error);
  }
};

const updateUserRole = async (req, res, next) => {
  try {
    const user = await adminService.updateUserRole(
      req.params.id,
      req.body.role
    );
    res.json({ success: true, user });
  } catch (error) {
    next(error);
  }
};

const deleteUser = async (req, res, next) => {
  try {
    await adminService.deleteUser(req.params.id, req.user.id);
    res.json({ success: true, message: 'User deleted' });
  } catch (error) {
    next(error);
  }
};

module.exports = { getDashboardStats, getUsers, updateUserRole, deleteUser };
