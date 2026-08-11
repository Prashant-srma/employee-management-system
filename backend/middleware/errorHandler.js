function notFound(req, res) {
  res.status(404).json({ success: false, message: `Route not found: ${req.method} ${req.originalUrl}` });
}

function errorHandler(err, req, res, next) {
  console.error(err);
  if (res.headersSent) return next(err);
  if (err.name === 'ValidationError') return res.status(400).json({ success: false, message: 'Validation failed', details: Object.values(err.errors).map(e => e.message) });
  if (err.code === 11000) return res.status(409).json({ success: false, message: 'A record with this unique value already exists' });
  res.status(err.statusCode || 500).json({ success: false, message: process.env.NODE_ENV === 'production' ? 'Something went wrong' : err.message });
}

module.exports = { notFound, errorHandler };
