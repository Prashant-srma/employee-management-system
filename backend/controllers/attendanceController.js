const Attendance = require('../models/Attendance');
const Employee = require('../models/Employee');

function dayStart(d = new Date()) { const x = new Date(d); x.setHours(0,0,0,0); return x; }
exports.list = async (req, res) => {
  const { employee, department, status, from, to, page = 1, limit = 50 } = req.query;
  const q = {};
  if (employee) q.employee = employee;
  if (status) q.status = status;
  if (from || to) q.date = {}; if (from) q.date.$gte = dayStart(from); if (to) { const end = dayStart(to); end.setHours(23,59,59,999); q.date.$lte = end; }
  let docs = await Attendance.find(q).populate({ path: 'employee', populate: { path: 'department', select: 'name' } }).sort({ date: -1 }).skip((page-1)*limit).limit(Number(limit));
  if (department) docs = docs.filter(a => String(a.employee?.department?._id) === String(department));
  res.json({ success: true, data: { items: docs } });
};
exports.employeeList = async (req, res) => { const id = req.user.employee; const items = await Attendance.find({ employee: id }).sort({ date: -1 }).limit(100); res.json({ success: true, data: items }); };
exports.clockIn = async (req, res) => {
  const employee = req.user.employee; if (!employee) return res.status(400).json({ success: false, message: 'Employee profile not linked' });
  const date = dayStart();
  let a = await Attendance.findOne({ employee, date });
  if (a?.checkIn) return res.status(409).json({ success: false, message: 'You are already clocked in today' });
  if (!a) a = new Attendance({ employee, date });
  a.checkIn = new Date(); a.status = a.checkIn.getHours() >= 10 ? 'Late' : 'Present'; await a.save();
  res.json({ success: true, message: 'Clocked in successfully', data: a });
};
exports.clockOut = async (req, res) => {
  const a = await Attendance.findOne({ employee: req.user.employee, date: dayStart() });
  if (!a?.checkIn) return res.status(400).json({ success: false, message: 'Please clock in first' });
  if (a.checkOut) return res.status(409).json({ success: false, message: 'You are already clocked out' });
  a.checkOut = new Date(); a.workingHours = Math.round(((a.checkOut - a.checkIn) / 3600000) * 100) / 100; if (a.workingHours < 4) a.dayType = 'Half Day'; await a.save();
  res.json({ success: true, message: 'Clocked out successfully', data: a });
};
exports.exportCsv = async (req, res) => {
  const items = await Attendance.find().populate('employee', 'employeeId firstName lastName').sort({ date: -1 });
  const rows = ['Employee ID,Employee,Date,Check In,Check Out,Working Hours,Status,Day Type'];
  items.forEach(a => rows.push([a.employee?.employeeId, `${a.employee?.firstName} ${a.employee?.lastName}`, new Date(a.date).toISOString().slice(0,10), a.checkIn ? new Date(a.checkIn).toISOString() : '', a.checkOut ? new Date(a.checkOut).toISOString() : '', a.workingHours, a.status, a.dayType].map(v => `"${String(v ?? '').replace(/"/g,'""')}"`).join(',')));
  res.setHeader('Content-Type','text/csv'); res.setHeader('Content-Disposition','attachment; filename="attendance.csv"'); res.send(rows.join('\n'));
};
