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
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 86400  // Auto-delete after 24 hours
  },
  views: {
    type: Number,
    default: 0
  }
});

module.exports = mongoose.model('Note', noteSchema);