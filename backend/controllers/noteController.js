const Note = require('../models/Note');
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');

// Generate random 6-character code
function generateCode() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

// Calculate expiry date based on hours
function calculateExpiry(expiryHours) {
  const expiryMap = {
    1: 1,
    6: 6,
    12: 12,
    24: 24,
    72: 72,
    168: 168
  };
  const hours = expiryMap[expiryHours] || 24;
  return new Date(Date.now() + hours * 60 * 60 * 1000);
}

// Upload audio
exports.uploadAudio = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No audio file uploaded' });
    }

    let code = generateCode();
    while (await Note.findOne({ code })) {
      code = generateCode();
    }

    const { password, expiryHours } = req.body;
    const hashedPassword = password && password.trim() !== '' ? await bcrypt.hash(password, 10) : null;

    const note = new Note({
      code: code,
      type: 'audio',
      filename: req.file.filename,
      filepath: req.file.path,
      duration: req.body.duration || 0,
      password: hashedPassword,
      isProtected: !!hashedPassword,
      expiryHours: parseInt(expiryHours) || 24,
      expiresAt: calculateExpiry(parseInt(expiryHours) || 24)
    });

    await note.save();

    res.json({
      success: true,
      code: code,
      type: 'audio',
      isProtected: !!hashedPassword,
      expiresIn: `${parseInt(expiryHours) || 24} hours`,
      message: `Share this code: ${code}`
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Upload failed' });
  }
};

// Upload image
exports.uploadImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No image file uploaded' });
    }

    let code = generateCode();
    while (await Note.findOne({ code })) {
      code = generateCode();
    }

    const { password, expiryHours } = req.body;
    const hashedPassword = password && password.trim() !== '' ? await bcrypt.hash(password, 10) : null;

    const note = new Note({
      code: code,
      type: 'image',
      filename: req.file.filename,
      filepath: req.file.path,
      imageUrl: `/uploads/${req.file.filename}`,
      imageMimeType: req.file.mimetype,
      password: hashedPassword,
      isProtected: !!hashedPassword,
      expiryHours: parseInt(expiryHours) || 24,
      expiresAt: calculateExpiry(parseInt(expiryHours) || 24)
    });

    await note.save();

    res.json({
      success: true,
      code: code,
      type: 'image',
      isProtected: !!hashedPassword,
      expiresIn: `${parseInt(expiryHours) || 24} hours`,
      message: `Share this code: ${code}`
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Image upload failed' });
  }
};

// Save text note
exports.saveTextNote = async (req, res) => {
  try {
    const { text, password, expiryHours } = req.body;
    
    if (!text || text.trim().length === 0) {
      return res.status(400).json({ error: 'Text content is required' });
    }

    let code = generateCode();
    while (await Note.findOne({ code })) {
      code = generateCode();
    }

    const hashedPassword = password && password.trim() !== '' ? await bcrypt.hash(password, 10) : null;

    const note = new Note({
      code: code,
      type: 'text',
      textContent: text,
      password: hashedPassword,
      isProtected: !!hashedPassword,
      expiryHours: parseInt(expiryHours) || 24,
      expiresAt: calculateExpiry(parseInt(expiryHours) || 24)
    });

    await note.save();

    res.json({
      success: true,
      code: code,
      type: 'text',
      isProtected: !!hashedPassword,
      expiresIn: `${parseInt(expiryHours) || 24} hours`,
      message: `Share this code: ${code}`
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to save text note' });
  }
};

// Get note by code (with password check)
exports.getNoteByCode = async (req, res) => {
  try {
    const { code } = req.params;
    const { password } = req.query;
    
    const note = await Note.findOne({ code: code.toUpperCase() });

    if (!note) {
      return res.status(404).json({ error: 'No content found with this code' });
    }

    // Check if note is expired
    if (note.expiresAt < new Date()) {
      await Note.deleteOne({ code: note.code });
      return res.status(410).json({ error: 'This note has expired' });
    }

    // Check password if note is protected
    if (note.isProtected) {
      if (!password) {
        return res.status(401).json({ 
          error: 'Password required',
          requiresPassword: true 
        });
      }
      
      const isValid = await bcrypt.compare(password, note.password);
      if (!isValid) {
        return res.status(401).json({ 
          error: 'Incorrect password',
          requiresPassword: true 
        });
      }
    }

    // Increment view count
    note.views += 1;
    await note.save();

    // If it's audio, send the file
    if (note.type === 'audio') {
      return res.sendFile(path.resolve(note.filepath));
    }
    
    // If it's image, send the actual image file
    if (note.type === 'image') {
      return res.sendFile(path.resolve(note.filepath));
    }
    
    // If it's text, return the content
    res.json({
      type: 'text',
      content: note.textContent,
      createdAt: note.createdAt,
      views: note.views,
      expiresAt: note.expiresAt
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to retrieve content' });
  }
};

// Get note info
exports.getNoteInfo = async (req, res) => {
  try {
    const { code } = req.params;
    const note = await Note.findOne({ code: code.toUpperCase() });

    if (!note) {
      return res.status(404).json({ error: 'No content found with this code' });
    }

    // Check if expired
    const isExpired = note.expiresAt < new Date();

    res.json({
      exists: true,
      type: note.type,
      isProtected: note.isProtected,
      isExpired: isExpired,
      createdAt: note.createdAt,
      expiresAt: note.expiresAt,
      views: note.views,
      duration: note.duration
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch info' });
  }
};

// Clean expired notes manually (for backend)
exports.cleanExpiredNotes = async (req, res) => {
  try {
    const result = await Note.deleteMany({ expiresAt: { $lt: new Date() } });
    res.json({ deleted: result.deletedCount });
  } catch (error) {
    res.status(500).json({ error: 'Cleanup failed' });
  }
};