const Note = require('../models/Note');
const bcrypt = require('bcryptjs');

const ALLOWED_EXPIRY_HOURS = [1, 6, 12, 24, 72, 168];
const MAX_TEXT_LENGTH = 5000;

const IMAGE_MIME_PREFIX = 'image/';

function generateCode() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < 6; i += 1) code += chars[Math.floor(Math.random() * chars.length)];
  return code;
}

function normalizeExpiry(value) {
  const parsed = Number.parseInt(value, 10);
  return ALLOWED_EXPIRY_HOURS.includes(parsed) ? parsed : 24;
}

function calculateExpiry(hours) {
  return new Date(Date.now() + hours * 60 * 60 * 1000);
}

async function generateUniqueCode() {
  let code = generateCode();
  while (await Note.exists({ code })) code = generateCode();
  return code;
}

async function getHashedPassword(password) {
  if (!password || typeof password !== 'string' || !password.trim()) return null;
  return bcrypt.hash(password.trim(), 10);
}

function sendUploadResponse(res, { code, type, isProtected, expiryHours }) {
  return res.status(201).json({
    success: true,
    code,
    type,
    isProtected,
    expiresIn: `${expiryHours} hours`,
  });
}

exports.uploadAudio = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No audio file uploaded' });

    const expiryHours = normalizeExpiry(req.body.expiryHours);
    const hashedPassword = await getHashedPassword(req.body.password);
    const audioDataUrl = `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`;
    const code = await generateUniqueCode();

    await new Note({
      code,
      type: 'audio',
      audioData: audioDataUrl,
      filename: req.file.originalname,
      password: hashedPassword,
      isProtected: Boolean(hashedPassword),
      expiryHours,
      expiresAt: calculateExpiry(expiryHours),
    }).save();

    return sendUploadResponse(res, {
      code,
      type: 'audio',
      isProtected: Boolean(hashedPassword),
      expiryHours,
    });
  } catch (error) {
    console.error('uploadAudio error:', error);
    return res.status(500).json({ error: 'Audio upload failed' });
  }
};

exports.uploadImage = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No image file uploaded' });

    const expiryHours = normalizeExpiry(req.body.expiryHours);
    const hashedPassword = await getHashedPassword(req.body.password);
    const imageDataUrl = `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`;
    const code = await generateUniqueCode();

    await new Note({
      code,
      type: 'image',
      imageData: imageDataUrl,
      filename: req.file.originalname,
      password: hashedPassword,
      isProtected: Boolean(hashedPassword),
      expiryHours,
      expiresAt: calculateExpiry(expiryHours),
    }).save();

    return sendUploadResponse(res, {
      code,
      type: 'image',
      isProtected: Boolean(hashedPassword),
      expiryHours,
    });
  } catch (error) {
    console.error('uploadImage error:', error);
    return res.status(500).json({ error: 'Image upload failed' });
  }
};

/**
 * Generic file upload — PDF, PPT, DOC, XLS, ZIP, images, etc.
 * If the mime type is image/*, store as image note.
 * Otherwise store as file note.
 */
exports.uploadFile = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

    const expiryHours = normalizeExpiry(req.body.expiryHours);
    const hashedPassword = await getHashedPassword(req.body.password);
    const dataUrl = `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`;
    const code = await generateUniqueCode();

    const isImage = req.file.mimetype.startsWith(IMAGE_MIME_PREFIX);

    const note = new Note({
      code,
      type: isImage ? 'image' : 'file',
      filename: req.file.originalname,
      password: hashedPassword,
      isProtected: Boolean(hashedPassword),
      expiryHours,
      expiresAt: calculateExpiry(expiryHours),
    });

    if (isImage) {
      note.imageData = dataUrl;
    } else {
      note.fileData = dataUrl;
      note.fileMime = req.file.mimetype;
    }

    await note.save();

    return sendUploadResponse(res, {
      code,
      type: note.type,
      isProtected: Boolean(hashedPassword),
      expiryHours,
    });
  } catch (error) {
    console.error('uploadFile error:', error);
    return res.status(500).json({ error: 'File upload failed' });
  }
};

exports.saveTextNote = async (req, res) => {
  try {
    const { text, password, expiryHours } = req.body;

    if (typeof text !== 'string' || !text.trim()) {
      return res.status(400).json({ error: 'Text content is required' });
    }
    if (text.length > MAX_TEXT_LENGTH) {
      return res.status(400).json({ error: `Text cannot exceed ${MAX_TEXT_LENGTH} characters` });
    }

    const normalizedExpiry = normalizeExpiry(expiryHours);
    const hashedPassword = await getHashedPassword(password);
    const code = await generateUniqueCode();

    await new Note({
      code,
      type: 'text',
      textContent: text.trim(),
      password: hashedPassword,
      isProtected: Boolean(hashedPassword),
      expiryHours: normalizedExpiry,
      expiresAt: calculateExpiry(normalizedExpiry),
    }).save();

    return sendUploadResponse(res, {
      code,
      type: 'text',
      isProtected: Boolean(hashedPassword),
      expiryHours: normalizedExpiry,
    });
  } catch (error) {
    console.error('saveTextNote error:', error);
    return res.status(500).json({ error: 'Failed to save text note' });
  }
};

exports.getNoteByCode = async (req, res) => {
  try {
    const code = String(req.params.code || '').toUpperCase();
    const { password } = req.query;

    if (!code) return res.status(400).json({ error: 'Code is required' });

    const note = await Note.findOne({ code });
    if (!note) return res.status(404).json({ error: 'No content found with this code' });

    if (note.expiresAt < new Date()) {
      await Note.deleteOne({ _id: note._id });
      return res.status(410).json({ error: 'This note has expired' });
    }

    if (note.isProtected) {
      if (!password) {
        return res.status(401).json({ requiresPassword: true, error: 'Password required' });
      }
      const isValid = await bcrypt.compare(String(password), note.password);
      if (!isValid) return res.status(401).json({ error: 'Incorrect password' });
    }

    note.views += 1;
    await note.save();

    if (note.type === 'text') {
      return res.json({
        type: 'text',
        content: note.textContent,
        createdAt: note.createdAt,
        views: note.views,
        expiresAt: note.expiresAt,
      });
    }
    if (note.type === 'image') {
      return res.json({
        type: 'image',
        imageData: note.imageData,
        filename: note.filename,
        createdAt: note.createdAt,
        views: note.views,
        expiresAt: note.expiresAt,
      });
    }
    if (note.type === 'audio') {
      return res.json({
        type: 'audio',
        audioData: note.audioData,
        filename: note.filename,
        createdAt: note.createdAt,
        views: note.views,
        expiresAt: note.expiresAt,
      });
    }
    if (note.type === 'file') {
      return res.json({
        type: 'file',
        fileData: note.fileData,
        fileMime: note.fileMime,
        filename: note.filename,
        createdAt: note.createdAt,
        views: note.views,
        expiresAt: note.expiresAt,
      });
    }

    return res.status(400).json({ error: 'Unknown note type' });
  } catch (error) {
    console.error('getNoteByCode error:', error);
    return res.status(500).json({ error: 'Failed to retrieve content' });
  }
};

exports.getNoteInfo = async (req, res) => {
  try {
    const code = String(req.params.code || '').toUpperCase();
    if (!code) return res.status(400).json({ error: 'Code is required' });

    const note = await Note.findOne({ code });
    if (!note) return res.status(404).json({ error: 'No content found with this code' });

    return res.json({
      exists: true,
      type: note.type,
      isProtected: note.isProtected,
      isExpired: note.expiresAt < new Date(),
      createdAt: note.createdAt,
      expiresAt: note.expiresAt,
      views: note.views,
    });
  } catch (error) {
    console.error('getNoteInfo error:', error);
    return res.status(500).json({ error: 'Failed to fetch info' });
  }
};