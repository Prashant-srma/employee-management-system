const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
  password: { type: String, required: true, select: false },
  role: { type: String, enum: ['admin', 'employee'], required: true, index: true },
  employee: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee', default: null, index: true },
  avatar: { type: String, default: '' },
  isActive: { type: Boolean, default: true },
  bio: { type: String, default: '' }
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
