class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal Server Error';

  // PostgreSQL unique violation (duplicate key)
  if (err.code === '23505') {
    statusCode = 400;
    const detail = err.detail || '';
    const match = detail.match(/Key \((.+?)\)/);
    const field = match ? match[1] : 'field';
    message = `Duplicate value for ${field}`;
  }

  // PostgreSQL foreign key violation
  if (err.code === '23503') {
    statusCode = 400;
    message = 'Referenced resource not found';
  }

  // PostgreSQL not-null violation
  if (err.code === '23502') {
    statusCode = 400;
    const column = err.column || 'field';
    message = `${column} is required`;
  }

  // PostgreSQL check constraint violation
  if (err.code === '23514') {
    statusCode = 400;
    message = 'Value violates a constraint';
  }

  // PostgreSQL invalid text representation (e.g. invalid integer)
  if (err.code === '22P02') {
    statusCode = 400;
    message = 'Invalid input value';
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Invalid token';
  }

  if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Token expired';
  }

  res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};

module.exports = { AppError, errorHandler };
