const mongoose = require('mongoose');
const schema = new mongoose.Schema({
  employeeId: { type: String, required: true, unique: true, index: true, trim: true },
  firstName: { type: String, required: true, trim: true },
  lastName: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
  phone: { type: String, default: '' },
  dateOfBirth: { type: Date, default: null },
  gender: { type: String, enum: ['Male', 'Female', 'Other', 'Prefer not to say'], default: 'Prefer not to say' },
  address: { type: String, default: '' },
  bio: { type: String, default: '' },
  profilePhoto: { type: String, default: '' },
  department: { type: mongoose.Schema.Types.ObjectId, ref: 'Department', index: true },
  position: { type: String, required: true, trim: true, index: true },
  role: { type: String, default: 'Employee' },
  joiningDate: { type: Date, default: Date.now },
  employmentType: { type: String, enum: ['Full Time', 'Part Time', 'Intern', 'Contract'], default: 'Full Time', index: true },
  salary: { type: Number, default: 0, min: 0 },
  status: { type: String, enum: ['Active', 'Inactive', 'Suspended'], default: 'Active', index: true },
  emergencyContact: { name: String, relationship: String, phone: String },
  bankDetails: { accountName: String, accountNumber: String, bankName: String, ifsc: String },
  leaveBalances: {
    sick: { type: Number, default: 12 },
    casual: { type: Number, default: 12 },
    annual: { type: Number, default: 18 },
    unpaid: { type: Number, default: 999 }
  }
}, { timestamps: true });

schema.index({ firstName: 'text', lastName: 'text', email: 'text', employeeId: 'text', position: 'text' });
schema.virtual('fullName').get(function () { return `${this.firstName} ${this.lastName}`; });
schema.set('toJSON', { virtuals: true });
module.exports = mongoose.model('Employee', schema);
