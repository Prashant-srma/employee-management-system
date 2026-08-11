const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Employee = require('../models/Employee');

function signToken(user) { return jwt.sign({ id: user._id.toString(), role: user.role }, process.env.JWT_SECRET, { expiresIn: '7d' }); }
function setAuthCookie(res, token) { res.cookie('ems_token', token, { httpOnly: true, sameSite: 'lax', secure: process.env.NODE_ENV === 'production', maxAge: 7 * 24 * 60 * 60 * 1000 }); }

async function login(req, res, role) {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ success: false, message: 'Email and password are required' });
  const user = await User.findOne({ email: email.toLowerCase().trim(), role }).select('+password').populate('employee');
  if (!user || !user.isActive || !(await bcrypt.compare(password, user.password))) return res.status(401).json({ success: false, message: 'Invalid email or password' });
  const token = signToken(user); setAuthCookie(res, token);
  res.json({ success: true, message: 'Login successful', data: { user: { id: user._id, name: user.name, email: user.email, role: user.role, employee: user.employee } } });
}

exports.adminLogin = (req, res) => login(req, res, 'admin');
exports.employeeLogin = (req, res) => login(req, res, 'employee');
exports.logout = (req, res) => { res.clearCookie('ems_token', { httpOnly: true, sameSite: 'lax', secure: process.env.NODE_ENV === 'production' }); res.json({ success: true, message: 'Logged out' }); };
exports.me = async (req, res) => {
  const user = await User.findById(req.user._id).select('-password').populate({ path: 'employee', populate: { path: 'department', select: 'name' } });
  res.json({ success: true, data: { user } });
};
exports.changePassword = async (req, res) => {
  const { currentPassword, newPassword, confirmPassword } = req.body;
  if (!currentPassword || !newPassword || newPassword !== confirmPassword) return res.status(400).json({ success: false, message: 'Please provide valid password fields' });
  if (newPassword.length < 8) return res.status(400).json({ success: false, message: 'New password must be at least 8 characters' });
  const user = await User.findById(req.user._id).select('+password');
  if (!(await bcrypt.compare(currentPassword, user.password))) return res.status(400).json({ success: false, message: 'Current password is incorrect' });
  user.password = await bcrypt.hash(newPassword, 12); await user.save();
  res.json({ success: true, message: 'Password updated successfully' });
};
