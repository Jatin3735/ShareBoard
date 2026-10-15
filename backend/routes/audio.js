const express = require('express');
const router = express.Router();
const upload = require('../middleware/upload');
const noteController = require('../controllers/noteController');

router.post('/text', noteController.saveTextNote);
router.post('/upload', upload.single('audio'), noteController.uploadAudio);
router.post('/upload-image', upload.single('image'), noteController.uploadImage);
router.post('/upload-file', upload.single('file'), noteController.uploadFile);
router.get('/info/:code', noteController.getNoteInfo);
router.get('/:code', noteController.getNoteByCode);

module.exports = router;