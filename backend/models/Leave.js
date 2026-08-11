const mongoose = require('mongoose');
const schema = new mongoose.Schema({
  employee: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee', required: true, index: true },
  type: { type: String, enum: ['Casual', 'Sick', 'Annual', 'Unpaid', 'Other'], required: true },
  startDate: { type: Date, required: true, index: true },
  endDate: { type: Date, required: true },
  reason: { type: String, required: true, trim: true },
  status: { type: String, enum: ['Pending', 'Approved', 'Rejected'], default: 'Pending', index: true },
  approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  decisionNote: { type: String, default: '' }
}, { timestamps: true });
schema.index({ employee: 1, startDate: 1, endDate: 1 });
module.exports = mongoose.model('Leave', schema);
