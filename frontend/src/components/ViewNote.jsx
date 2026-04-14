import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Loader, AlertCircle, Headphones, FileText, Image, Volume2, Download } from 'lucide-react';
import axios from 'axios';

function ViewNote() {
  const [code, setCode] = useState('');
  const [noteData, setNoteData] = useState(null);
  const [audioUrl, setAudioUrl] = useState(null);
  const [imageUrl, setImageUrl] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [noteType, setNoteType] = useState(null);

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

  const fetchNote = async () => {
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

    try {
      const infoResponse = await axios.get(`${API_URL}/audio/info/${code}`);
      
      if (infoResponse.data.exists) {
        setNoteType(infoResponse.data.type);
        
        if (infoResponse.data.type === 'text') {
          const textResponse = await axios.get(`${API_URL}/audio/${code}`);
          setNoteData(textResponse.data);
        } else if (infoResponse.data.type === 'image') {
          const imageUrl = `${API_URL}/audio/${code}`;
          setImageUrl(imageUrl);
          setNoteData({
            views: infoResponse.data.views,
            createdAt: infoResponse.data.createdAt
          });
        } else {
          const audioUrl = `${API_URL}/audio/${code}`;
          setAudioUrl(audioUrl);
        }
      }
    } catch (error) {
      console.error('Error:', error);
      setError('No content found with this code. Please check and try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCodeChange = (e) => {
    let value = e.target.value.toUpperCase();
    value = value.replace(/[^A-Z0-9]/g, '').slice(0, 6);
    setCode(value);
    if (error) setError('');
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
            onClick={fetchNote}
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

        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mb-4 p-3 bg-red-500/20 border border-red-500/50 rounded-lg flex items-center gap-2 text-red-200 text-sm sm:text-base"
            >
              <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
              <span className="break-words">{error}</span>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {/* Text Note Display - Responsive */}
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
                <div className="mt-4 text-white/40 text-xs sm:text-sm text-center">
                  Views: {noteData.views} | Created: {new Date(noteData.createdAt).toLocaleString()}
                </div>
              </div>
            </motion.div>
          )}

          {/* Image Note Display - Responsive */}
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
                  <div className="mt-4 text-white/40 text-xs sm:text-sm text-center">
                    Views: {noteData.views} | Created: {new Date(noteData.createdAt).toLocaleString()}
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* Audio Note Display - Responsive */}
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

        {/* Tips - Responsive */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-6 sm:mt-8 p-3 sm:p-4 bg-white/10 rounded-lg"
        >
          <h3 className="text-white font-semibold mb-2 text-sm sm:text-base">💡 Tips:</h3>
          <ul className="text-white/70 text-xs sm:text-sm space-y-1">
            <li>• Codes are 6 characters (letters and numbers)</li>
            <li>• Each note expires after 24 hours</li>
            <li>• Supports Text, Audio, and Image notes</li>
            <li>• Images up to 5MB (JPG, PNG, GIF)</li>
          </ul>
        </motion.div>
      </div>
    </motion.div>
  );
}

export default ViewNote;