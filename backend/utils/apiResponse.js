exports.success = (res, data = null, message = 'Success', status = 200) =>
  res.status(status).json({ success: true, message, data });
exports.error = (res, message = 'Something went wrong', status = 500, details) =>
  res.status(status).json({ success: false, message, ...(details ? { details } : {}) });
