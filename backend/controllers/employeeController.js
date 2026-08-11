const bcrypt = require('bcryptjs');
const Employee = require('../models/Employee');
const User = require('../models/User');
const Department = require('../models/Department');
const { createNotification } = require('../services/notificationService');

function escapeRegex(v = '') { return v.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); }

exports.list = async (req, res) => {
  const { search = '', department, status, employmentType, page = 1, limit = 20 } = req.query;
  const q = {};
  if (search) { const r = new RegExp(escapeRegex(search), 'i'); q.$or = [{ firstName: r }, { lastName: r }, { email: r }, { employeeId: r }, { position: r }]; }
  if (department) q.department = department;
  if (status) q.status = status;
  if (employmentType) q.employmentType = employmentType;
  const skip = (Number(page) - 1) * Number(limit);
  const [items, total] = await Promise.all([Employee.find(q).populate('department', 'name').sort({ createdAt: -1 }).skip(skip).limit(Number(limit)), Employee.countDocuments(q)]);
  res.json({ success: true, data: { items, total, page: Number(page), pages: Math.ceil(total / Number(limit)) } });
};
exports.getOne = async (req, res) => {
  const employee = await Employee.findById(req.params.id).populate('department', 'name').populate('department.manager', 'firstName lastName');
  if (!employee) return res.status(404).json({ success: false, message: 'Employee not found' });
  res.json({ success: true, data: employee });
};
exports.create = async (req, res) => {
  const body = { ...req.body };
  if (!body.employeeId) body.employeeId = `EMP-${Date.now().toString().slice(-6)}`;
  const employee = await Employee.create(body);
  const password = body.initialPassword || 'ChangeMe123!';
  const hashed = await bcrypt.hash(password, 12);
  await User.create({ name: `${employee.firstName} ${employee.lastName}`, email: employee.email, password: hashed, role: 'employee', employee: employee._id, avatar: employee.profilePhoto || '' });
  const admins = await User.find({ role: 'admin', isActive: true }).select('_id');
  await Promise.all(admins.map(a => createNotification({ user: a._id, title: 'Employee added', message: `${employee.firstName} ${employee.lastName} was added to the team.`, type: 'success' })));
  res.status(201).json({ success: true, message: 'Employee created successfully', data: employee });
};
exports.update = async (req, res) => {
  const employee = await Employee.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true }).populate('department', 'name');
  if (!employee) return res.status(404).json({ success: false, message: 'Employee not found' });
  await User.findOneAndUpdate({ employee: employee._id }, { name: `${employee.firstName} ${employee.lastName}`, email: employee.email, avatar: employee.profilePhoto || '' });
  res.json({ success: true, message: 'Employee updated successfully', data: employee });
};
exports.remove = async (req, res) => {
  const employee = await Employee.findById(req.params.id);
  if (!employee) return res.status(404).json({ success: false, message: 'Employee not found' });
  await Promise.all([Employee.deleteOne({ _id: employee._id }), User.deleteOne({ employee: employee._id })]);
  res.json({ success: true, message: 'Employee deleted successfully' });
};
exports.updateSelf = async (req, res) => {
  const employeeId = req.user.employee?._id || req.user.employee;
  const employee = await Employee.findById(employeeId);
  if (!employee) return res.status(404).json({ success: false, message: 'Employee profile not found' });
  const allowed = ['firstName', 'lastName', 'phone', 'address', 'profilePhoto', 'bio'];
  allowed.forEach(k => { if (req.body[k] !== undefined) employee[k] = req.body[k]; });
  await employee.save();
  if (req.body.bio !== undefined) req.user.bio = req.body.bio;
  await User.findByIdAndUpdate(req.user._id, { name: `${employee.firstName} ${employee.lastName}`, avatar: employee.profilePhoto || '', bio: employee.bio || req.body.bio || '' });
  res.json({ success: true, message: 'Profile updated', data: employee });
};
