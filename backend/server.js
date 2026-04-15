const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const audioRoutes = require('./routes/audio');

const app = express();

// ✅ CORS CONFIGURATION
const allowedOrigins = [
  'https://online-shareboard.netlify.app',
  'http://localhost:5173',
  'http://localhost:3000'
];

app.use(cors({
  origin: function(origin, callback) {
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) === -1) {
      return callback(new Error('CORS policy violation'), false);
    }
    return callback(null, true);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from uploads folder
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Create uploads folder if it doesn't exist
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
  console.log('✅ Created uploads folder');
}

// ✅ DEBUG: Check what files exist on server
app.get('/debug/files', (req, res) => {
  const uploadsPath = path.join(__dirname, 'uploads');
  let files = [];
  let fileDetails = [];
  
  if (fs.existsSync(uploadsPath)) {
    files = fs.readdirSync(uploadsPath);
    fileDetails = files.map(file => {
      const filePath = path.join(uploadsPath, file);
      const stats = fs.statSync(filePath);
      return {
        name: file,
        size: stats.size,
        created: stats.birthtime,
        path: filePath
      };
    });
  }
  
  const uploadsExists = fs.existsSync(uploadsPath);
  
  res.json({
    success: true,
    uploadsFolderExists: uploadsExists,
    uploadsPath: uploadsPath,
    filesCount: files.length,
    files: fileDetails,
    allFiles: files,
    currentDirectory: __dirname
  });
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running' });
});

// MongoDB connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ MongoDB connected'))
  .catch(err => console.error('❌ MongoDB error:', err));

// Routes
app.use('/api/audio', audioRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📁 Uploads folder: ${uploadDir}`);
  console.log(`🔍 Debug endpoint: /debug/files`);
});