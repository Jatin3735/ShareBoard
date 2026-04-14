const express = require('express');
const router = express.Router();
const upload = require('../middleware/upload');
const noteController = require('../controllers/noteController');

// Audio routes
router.post('/upload', upload.single('audio'), noteController.uploadAudio);

// Image routes
router.post('/upload-image', upload.single('image'), noteController.uploadImage);

// Text routes
router.post('/text', noteController.saveTextNote);

// Get note (works for all types)
router.get('/:code', noteController.getNoteByCode);
router.get('/info/:code', noteController.getNoteInfo);

module.exports = router;