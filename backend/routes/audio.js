const express = require('express');
const router = express.Router();
const upload = require('../middleware/upload');
const noteController = require('../controllers/noteController');

router.post('/upload', upload.single('audio'), noteController.uploadAudio);
router.post('/upload-image', upload.single('image'), noteController.uploadImage);
router.post('/text', noteController.saveTextNote);
router.get('/:code', noteController.getNoteByCode);
router.get('/info/:code', noteController.getNoteInfo);

module.exports = router;