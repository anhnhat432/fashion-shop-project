const notFound = (req, res, next) => {
  res.status(404).json({ success: false, message: `Route not found: ${req.originalUrl}` });
};

const errorHandler = (err, req, res, next) => {
  console.error(err.stack);

  if (err.code === 11000) {
    return res.status(400).json({ success: false, message: 'Duplicated value' });
  }

  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || 'Server error'
  });
};

module.exports = { notFound, errorHandler };
