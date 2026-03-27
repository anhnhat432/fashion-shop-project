const notFound = (req, res, next) => {
  res.status(404).json({ success: false, message: `Route not found: ${req.originalUrl}` });
};

const errorHandler = (err, req, res, next) => {
  console.error(err.stack);

  if (err.code === 11000) {
    return res.status(400).json({ success: false, message: 'Duplicated value' });
  }

  const statusCode = err.statusCode || 500;
  // Không leak internal error details trong production
  const message = statusCode < 500
    ? (err.message || 'Request error')
    : (process.env.NODE_ENV === 'production' ? 'Internal server error' : err.message || 'Server error');

  res.status(statusCode).json({ success: false, message });
};

module.exports = { notFound, errorHandler };
