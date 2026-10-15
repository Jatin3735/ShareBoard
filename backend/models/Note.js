const mongoose = require('mongoose');

const noteSchema = new mongoose.Schema({
  code: { type: String, required: true, unique: true, uppercase: true, trim: true },
  type: { type: String, enum: ['text', 'audio', 'image'], required: true },
  textContent: { type: String, default: null },
  audioData: { type: String, default: null },
  imageData: { type: String, default: null },
  filename: { type: String, default: null },
  password: { type: String, default: null },
  isProtected: { type: Boolean, default: false },
  expiryHours: { type: Number, default: 24 },
  expiresAt: { type: Date, default: () => new Date(Date.now() + 24 * 60 * 60 * 1000) },
  createdAt: { type: Date, default: Date.now },
  views: { type: Number, default: 0 },
});

noteSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model('Note', noteSchema);