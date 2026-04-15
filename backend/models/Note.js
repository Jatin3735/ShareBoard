const mongoose = require('mongoose');

const noteSchema = new mongoose.Schema({
  code: {
    type: String,
    required: true,
    unique: true,
    uppercase: true
  },
  type: {
    type: String,
    enum: ['text', 'audio', 'image'],
    required: true
  },
  // For text notes
  textContent: {
    type: String,
    default: null
  },
  // For audio notes
  filename: {
    type: String,
    default: null
  },
  filepath: {
    type: String,
    default: null
  },
  // For image notes
  imageUrl: {
    type: String,
    default: null
  },
  imageMimeType: {
    type: String,
    default: null
  },
  duration: {
    type: Number,
    default: 0
  },
  // NEW: Password protection
  password: {
    type: String,
    default: null
  },
  isProtected: {
    type: Boolean,
    default: false
  },
  // NEW: Custom expiry
  expiryHours: {
    type: Number,
    default: 24
  },
  expiresAt: {
    type: Date,
    default: () => new Date(+new Date() + 24*60*60*1000)
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  views: {
    type: Number,
    default: 0
  }
});

// Auto-delete expired notes (runs every minute)
noteSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model('Note', noteSchema);