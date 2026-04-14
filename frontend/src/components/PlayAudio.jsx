import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Loader, AlertCircle, Headphones, Volume2 } from 'lucide-react';
import axios from 'axios';

function PlayAudio() {
  const [code, setCode] = useState('');
  const [audioUrl, setAudioUrl] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);

  const fetchAudio = async () => {
    if (!code || code.length !== 6) {
      setError('Please enter a valid 6-character code');
      return;
    }

    setLoading(true);
    setError('');
    setAudioUrl(null);

    try {
      const infoResponse = await axios.get(`http://localhost:5000/api/audio/info/${code}`);
      if (infoResponse.data.exists) {
        const audioUrl = `http://localhost:5000/api/audio/${code}`;
        setAudioUrl(audioUrl);
      }
    } catch (error) {
      setError('No audio found with this code. Please check and try again.');
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
      fetchAudio();
    }
  };

  return (
    <motion.div 
      initial={{ scale: 0.9 }}
      animate={{ scale: 1 }}
      className="max-w-2xl mx-auto"
    >
      <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 shadow-2xl border border-white/20">
        <div className="text-center mb-8">
          <motion.div
            animate={{ 
              y: [0, -10, 0],
              rotate: [0, 5, -5, 0]
            }}
            transition={{ repeat: Infinity, duration: 3 }}
            className="inline-block"
          >
            <Headphones className="w-16 h-16 text-white mx-auto" />
          </motion.div>
          <h2 className="text-2xl font-bold text-white mt-4">
            Enter Code to Listen
          </h2>
          <p className="text-white/80 mt-2">
            Get a 6-character code from the person who recorded
          </p>
        </div>

        <div className="flex gap-2 mb-6">
          <motion.input
            whileFocus={{ scale: 1.02 }}
            type="text"
            placeholder="Enter 6-character code"
            value={code}
            onChange={handleCodeChange}
            onKeyPress={handleKeyPress}
            className="flex-1 px-4 py-3 bg-white/20 border border-white/30 rounded-lg text-white placeholder-white/50 text-center text-2xl font-mono tracking-wider focus:outline-none focus:border-white"
            maxLength={6}
            autoCapitalize="characters"
          />
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={fetchAudio}
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
              className="mb-4 p-3 bg-red-500/20 border border-red-500/50 rounded-lg flex items-center gap-2 text-red-200"
            >
              <AlertCircle className="w-5 h-5" />
              {error}
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {audioUrl && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="mt-6"
            >
              <div className="bg-white/20 rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Volume2 className="w-5 h-5 text-white" />
                    <span className="text-white font-semibold">Now Playing</span>
                  </div>
                  <div className="text-white/60 text-sm">
                    Code: {code}
                  </div>
                </div>
                
                <audio 
                  controls 
                  className="w-full"
                  onPlay={() => setIsPlaying(true)}
                  onPause={() => setIsPlaying(false)}
                >
                  <source src={audioUrl} type="audio/webm" />
                  Your browser does not support audio playback.
                </audio>
                
                {isPlaying && (
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: "100%" }}
                    transition={{ duration: 0.3 }}
                    className="mt-4 h-1 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full"
                  />
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Tips */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-8 p-4 bg-white/10 rounded-lg"
        >
          <h3 className="text-white font-semibold mb-2">💡 Tips:</h3>
          <ul className="text-white/70 text-sm space-y-1">
            <li>• Codes are 6 characters (letters and numbers)</li>
            <li>• Each recording expires after 24 hours</li>
            <li>• Codes are case-sensitive (use uppercase)</li>
          </ul>
        </motion.div>
      </div>
    </motion.div>
  );
}

export default PlayAudio;