const mongoose = require('mongoose');
const schema = new mongoose.Schema({
  employee: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee', required: true, index: true },
  period: { type: String, required: true, index: true },
  basicSalary: { type: Number, required: true, min: 0 },
  allowances: { type: Number, default: 0, min: 0 },
  bonus: { type: Number, default: 0, min: 0 },
  tax: { type: Number, default: 0, min: 0 },
  pf: { type: Number, default: 0, min: 0 },
  otherDeductions: { type: Number, default: 0, min: 0 },
  netSalary: { type: Number, required: true },
  status: { type: String, enum: ['Draft', 'Generated', 'Paid'], default: 'Generated', index: true },
  generatedAt: { type: Date, default: Date.now }
}, { timestamps: true });
schema.index({ employee: 1, period: 1 }, { unique: true });
module.exports = mongoose.model('Payroll', schema);
