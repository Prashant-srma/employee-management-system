const jwt = require('jsonwebtoken');
const User = require('../models/User');

async function authenticateUser(req, res, next) {
  try {
    const token = req.cookies?.ems_token || (req.headers.authorization?.startsWith('Bearer ') ? req.headers.authorization.slice(7) : null);
    if (!token) return res.status(401).json({ success: false, message: 'Authentication required' });
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select('-password');
    if (!user || !user.isActive) return res.status(401).json({ success: false, message: 'Session is invalid or expired' });
    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ success: false, message: 'Invalid or expired authentication token' });
  }
}

const requireAdmin = (req, res, next) => {
  if (req.user?.role !== 'admin') return res.status(403).json({ success: false, message: 'Admin access required' });
  next();
};

const requireEmployee = (req, res, next) => {
  if (req.user?.role !== 'employee') return res.status(403).json({ success: false, message: 'Employee access required' });
  next();
};

module.exports = { authenticateUser, requireAdmin, requireEmployee };
