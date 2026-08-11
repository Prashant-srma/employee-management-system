const Department = require('../models/Department');
exports.list = async (req, res) => res.json({ success: true, data: await Department.find().populate('manager', 'firstName lastName').sort({ name: 1 }) });
exports.create = async (req, res) => res.status(201).json({ success: true, message: 'Department created', data: await Department.create(req.body) });
exports.update = async (req, res) => { const d = await Department.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true }); if (!d) return res.status(404).json({ success: false, message: 'Department not found' }); res.json({ success: true, message: 'Department updated', data: d }); };
exports.remove = async (req, res) => { const d = await Department.findByIdAndDelete(req.params.id); if (!d) return res.status(404).json({ success: false, message: 'Department not found' }); res.json({ success: true, message: 'Department deleted' }); };
