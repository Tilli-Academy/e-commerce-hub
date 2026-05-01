const { verifyAccessToken } = require('../utils/token');
const { AppError } = require('./errorHandler');

const authenticate = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new AppError('Access token required', 401);
    }

    const token = authHeader.split(' ')[1];
    const decoded = verifyAccessToken(token);

    req.user = { id: decoded.id, role: decoded.role };
    next();
  } catch (error) {
    if (error.isOperational) return next(error);
    next(new AppError('Invalid or expired token', 401));
  }
};

const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(new AppError('Not authorized to access this resource', 403));
    }
    next();
  };
};

module.exports = { authenticate, authorize };
