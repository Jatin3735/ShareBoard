const Note = require('../models/Note');
const fs = require('fs');
const path = require('path');

// Generate random 6-character code
function generateCode() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

// Upload audio and generate code
exports.uploadAudio = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No audio file uploaded' });
    }

    let code = generateCode();
    while (await Note.findOne({ code })) {
      code = generateCode();
    }

    const note = new Note({
      code: code,
      type: 'audio',
      filename: req.file.filename,
      filepath: req.file.path,
      duration: req.body.duration || 0
    });

    await note.save();

    res.json({
      success: true,
      code: code,
      type: 'audio',
      message: `Share this code: ${code}`
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Upload failed' });
  }
};

// Upload image and generate code
exports.uploadImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No image file uploaded' });
    }

    let code = generateCode();
    while (await Note.findOne({ code })) {
      code = generateCode();
    }

    // Get image URL (for local storage)
    const imageUrl = `/uploads/${req.file.filename}`;

    const note = new Note({
      code: code,
      type: 'image',
      filename: req.file.filename,
      filepath: req.file.path,
      imageUrl: imageUrl,
      imageMimeType: req.file.mimetype
    });

    await note.save();

    res.json({
      success: true,
      code: code,
      type: 'image',
      message: `Share this code: ${code}`
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Image upload failed' });
  }
};

// Save text note and generate code
exports.saveTextNote = async (req, res) => {
  try {
    const { text } = req.body;
    
    if (!text || text.trim().length === 0) {
      return res.status(400).json({ error: 'Text content is required' });
    }

    let code = generateCode();
    while (await Note.findOne({ code })) {
      code = generateCode();
    }

    const note = new Note({
      code: code,
      type: 'text',
      textContent: text
    });

    await note.save();

    res.json({
      success: true,
      code: code,
      type: 'text',
      message: `Share this code: ${code}`
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to save text note' });
  }
};

// Get note by code (works for text, audio, and image)
// Get note by code (works for text, audio, and image)
exports.getNoteByCode = async (req, res) => {
  try {
    const { code } = req.params;
    const note = await Note.findOne({ code: code.toUpperCase() });

    if (!note) {
      return res.status(404).json({ error: 'No content found with this code' });
    }

    // Increment view count
    note.views += 1;
    await note.save();

    // If it's audio, send the file
    if (note.type === 'audio') {
      return res.sendFile(path.resolve(note.filepath));
    }
    
    // If it's image, return the image as a file
    if (note.type === 'image') {
      // Send the actual image file
      return res.sendFile(path.resolve(note.filepath));
    }
    
    // If it's text, return the content
    res.json({
      type: 'text',
      content: note.textContent,
      createdAt: note.createdAt,
      views: note.views
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to retrieve content' });
  }
};
// Get note info (without downloading)
exports.getNoteInfo = async (req, res) => {
  try {
    const { code } = req.params;
    const note = await Note.findOne({ code: code.toUpperCase() });

    if (!note) {
      return res.status(404).json({ error: 'No content found with this code' });
    }

    res.json({
      exists: true,
      type: note.type,
      createdAt: note.createdAt,
      views: note.views,
      duration: note.duration
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch info' });
  }
};