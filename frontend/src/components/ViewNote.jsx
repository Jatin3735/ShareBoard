import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Loader, AlertCircle, Headphones, FileText, Image, Volume2, Download, Lock, Unlock } from 'lucide-react';
import axios from 'axios';

function ViewNote() {
  const [code, setCode] = useState('');
  const [password, setPassword] = useState('');
  const [showPasswordInput, setShowPasswordInput] = useState(false);
  const [noteData, setNoteData] = useState(null);
  const [audioUrl, setAudioUrl] = useState(null);
  const [imageUrl, setImageUrl] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [noteType, setNoteType] = useState(null);

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

  const fetchNote = async (providedPassword = null) => {
    if (!code || code.length !== 6) {
      setError('Please enter a valid 6-character code');
      return;
    }

    setLoading(true);
    setError('');
    setNoteData(null);
    setAudioUrl(null);
    setImageUrl(null);
    setNoteType(null);
    setShowPasswordInput(false);

    try {
      const url = providedPassword 
        ? `${API_URL}/audio/${code}?password=${encodeURIComponent(providedPassword)}`
        : `${API_URL}/audio/${code}`;
      
      const response = await axios.get(url);
      
      // Handle response based on type
      if (response.data.type === 'text') {
        setNoteType('text');
        setNoteData(response.data);
      } else if (response.data.type === 'image') {
        setNoteType('image');
        setImageUrl(`${API_URL}${response.data.imageUrl}`);
        setNoteData(response.data);
      } else {
        // It's audio (file response)
        setNoteType('audio');
        const audioUrl = `${API_URL}/audio/${code}${providedPassword ? `?password=${encodeURIComponent(providedPassword)}` : ''}`;
        setAudioUrl(audioUrl);
      }
    } catch (error) {
      if (error.response?.status === 401 && error.response?.data?.requiresPassword) {
        setShowPasswordInput(true);
        setError('This note is password protected. Please enter the password.');
      } else if (error.response?.status === 410) {
        setError('This note has expired and is no longer available.');
      } else {
        setError('No content found with this code. Please check and try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordSubmit = () => {
    if (!password) {
      setError('Please enter the password');
      return;
    }
    fetchNote(password);
  };

  const handleCodeChange = (e) => {
    let value = e.target.value.toUpperCase();
    value = value.replace(/[^A-Z0-9]/g, '').slice(0, 6);
    setCode(value);
    if (error) setError('');
    setShowPasswordInput(false);
    setPassword('');
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && code.length === 6) {
      fetchNote();
    }
  };

  const downloadImage = async () => {
    if (imageUrl) {
      try {
        const response = await axios.get(imageUrl, {
          responseType: 'blob'
        });
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `shareboard-${code}.jpg`);
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);
      } catch (error) {
        console.error('Download failed:', error);
        alert('Failed to download image');
      }
    }
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString();
  };

  return (
    <motion.div 
      initial={{ scale: 0.9 }}
      animate={{ scale: 1 }}
      className="w-full max-w-2xl mx-auto px-2 sm:px-4"
    >
      <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-4 sm:p-6 md:p-8 shadow-2xl border border-white/20">
        <div className="text-center mb-6 sm:mb-8">
          <motion.div
            animate={{ 
              y: [0, -10, 0],
              rotate: [0, 5, -5, 0]
            }}
            transition={{ repeat: Infinity, duration: 3 }}
            className="inline-block"
          >
            <Headphones className="w-12 h-12 sm:w-16 sm:h-16 text-white mx-auto" />
          </motion.div>
          <h2 className="text-xl sm:text-2xl font-bold text-white mt-4">
            Enter Code to View Note
          </h2>
          <p className="text-white/80 text-sm sm:text-base mt-2">
            Enter the 6-character code you received
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-2 mb-6">
          <motion.input
            whileFocus={{ scale: 1.02 }}
            type="text"
            placeholder="Enter 6-character code"
            value={code}
            onChange={handleCodeChange}
            onKeyPress={handleKeyPress}
            className="flex-1 px-4 py-3 bg-white/20 border border-white/30 rounded-lg text-white placeholder-white/50 text-center text-xl sm:text-2xl font-mono tracking-wider focus:outline-none focus:border-white"
            maxLength={6}
            autoCapitalize="characters"
          />
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => fetchNote()}
            disabled={code.length !== 6 || loading}
            className={`px-6 py-3 rounded-lg font-semibold transition-all ${
              code.length === 6 && !loading
                ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg shadow-green-500/50'
                : 'bg-white/20 text-white/50 cursor-not-allowed'
            }`}
          >
            {loading ? (
              <Loader className="w-5 h-5 animate-spin" />
            ) : (
              <Play className="w-5 h-5" />
            )}
          </motion.button>
        </div>

        {/* NEW: Password Input for Protected Notes */}
        <AnimatePresence>
          {showPasswordInput && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mb-4"
            >
              <div className="flex gap-2">
                <input
                  type="password"
                  placeholder="Enter note password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handlePasswordSubmit()}
                  className="flex-1 px-4 py-2 bg-white/20 border border-white/30 rounded-lg text-white placeholder-white/50 focus:outline-none focus:border-white"
                />
                <button
                  onClick={handlePasswordSubmit}
                  className="px-4 py-2 bg-purple-500 rounded-lg text-white hover:bg-purple-600 transition"
                >
                  <Lock className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className={`mb-4 p-3 rounded-lg flex items-center gap-2 text-sm sm:text-base ${
                error.includes('expired') 
                  ? 'bg-orange-500/20 border border-orange-500/50 text-orange-200'
                  : 'bg-red-500/20 border border-red-500/50 text-red-200'
              }`}
            >
              <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
              <span className="break-words">{error}</span>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {/* Text Note Display */}
          {noteType === 'text' && noteData && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="mt-6"
            >
              <div className="bg-white/20 rounded-lg p-4 sm:p-6">
                <div className="flex items-center gap-2 mb-4">
                  <FileText className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                  <span className="text-white font-semibold text-sm sm:text-base">Text Message</span>
                </div>
                <div className="bg-white/10 rounded-lg p-3 sm:p-4">
                  <p className="text-white leading-relaxed whitespace-pre-wrap break-words text-sm sm:text-base">
                    {noteData.content}
                  </p>
                </div>
                <div className="mt-4 text-white/40 text-xs sm:text-sm text-center space-y-1">
                  <p>Views: {noteData.views}</p>
                  <p>Created: {formatDate(noteData.createdAt)}</p>
                  {noteData.expiresAt && (
                    <p>Expires: {formatDate(noteData.expiresAt)}</p>
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {/* Image Note Display */}
          {noteType === 'image' && imageUrl && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="mt-6"
            >
              <div className="bg-white/20 rounded-lg p-4 sm:p-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
                  <div className="flex items-center gap-2">
                    <Image className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                    <span className="text-white font-semibold text-sm sm:text-base">Image</span>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={downloadImage}
                    className="px-3 py-1.5 sm:py-2 bg-white/20 rounded-lg text-white text-xs sm:text-sm flex items-center gap-1 hover:bg-white/30 w-full sm:w-auto justify-center"
                  >
                    <Download className="w-3 h-3 sm:w-4 sm:h-4" />
                    Download
                  </motion.button>
                </div>
                <div className="bg-white/10 rounded-lg p-3 sm:p-4 flex justify-center">
                  <img
                    src={imageUrl}
                    alt="Shared content"
                    className="max-w-full rounded-lg max-h-64 sm:max-h-96 object-contain"
                    onError={(e) => {
                      console.error('Image failed to load:', imageUrl);
                      e.target.src = 'https://via.placeholder.com/400x300?text=Image+Load+Failed';
                    }}
                  />
                </div>
                {noteData && (
                  <div className="mt-4 text-white/40 text-xs sm:text-sm text-center space-y-1">
                    <p>Views: {noteData.views}</p>
                    <p>Created: {formatDate(noteData.createdAt)}</p>
                    {noteData.expiresAt && (
                      <p>Expires: {formatDate(noteData.expiresAt)}</p>
                    )}
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* Audio Note Display */}
          {noteType === 'audio' && audioUrl && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="mt-6"
            >
              <div className="bg-white/20 rounded-lg p-4 sm:p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Volume2 className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                  <span className="text-white font-semibold text-sm sm:text-base">Audio Message</span>
                </div>
                <audio controls className="w-full">
                  <source src={audioUrl} type="audio/webm" />
                  Your browser does not support audio playback.
                </audio>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Tips */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-6 sm:mt-8 p-3 sm:p-4 bg-white/10 rounded-lg"
        >
          <h3 className="text-white font-semibold mb-2 text-sm sm:text-base">💡 Tips:</h3>
          <ul className="text-white/70 text-xs sm:text-sm space-y-1">
            <li>• Codes are 6 characters (letters and numbers)</li>
            <li>• Notes auto-expire based on creator's choice</li>
            <li>• Password-protected notes require a password to view</li>
            <li>• Supports Text, Audio, and Image notes</li>
          </ul>
        </motion.div>
      </div>
    </motion.div>
  );
}

export default ViewNote;