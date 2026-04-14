import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, Square, Copy, CheckCircle, Loader, Type, Image, Upload, X } from 'lucide-react';
import axios from 'axios';

function CreateNote() {
  const [noteType, setNoteType] = useState('text');
  const [textContent, setTextContent] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [generatedCode, setGeneratedCode] = useState('');
  const [uploading, setUploading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const timerRef = useRef(null);
  const fileInputRef = useRef(null);

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

  // Text Note Functions
  const saveTextNote = async () => {
    if (!textContent.trim()) {
      alert('Please enter some text');
      return;
    }

    setUploading(true);
    try {
      const response = await axios.post(`${API_URL}/audio/text`, {
        text: textContent
      });
      setGeneratedCode(response.data.code);
    } catch (error) {
      alert('Failed to save text note');
    } finally {
      setUploading(false);
    }
  };

  // Image Functions
  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert('Image size should be less than 5MB');
        return;
      }
      if (!file.type.startsWith('image/')) {
        alert('Please select a valid image file');
        return;
      }
      setSelectedImage(file);
      const previewUrl = URL.createObjectURL(file);
      setImagePreview(previewUrl);
    }
  };

  const uploadImage = async () => {
    if (!selectedImage) {
      alert('Please select an image first');
      return;
    }

    setUploading(true);
    const formData = new FormData();
    formData.append('image', selectedImage);

    try {
      const response = await axios.post(`${API_URL}/audio/upload-image`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setGeneratedCode(response.data.code);
    } catch (error) {
      alert('Image upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const removeImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Audio Recording Functions
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
      
      setRecordingTime(0);
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
      
    } catch (error) {
      alert('Please allow microphone access to record audio');
    }
  };

  const stopRecording = () => {
    mediaRecorderRef.current.stop();
    setIsRecording(false);
    clearInterval(timerRef.current);

    mediaRecorderRef.current.onstop = async () => {
      const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
      await uploadAudio(audioBlob);
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
    };
  };

  const uploadAudio = async (audioBlob) => {
    setUploading(true);
    const formData = new FormData();
    formData.append('audio', audioBlob, 'recording.webm');

    try {
      const response = await axios.post(`${API_URL}/audio/upload`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setGeneratedCode(response.data.code);
    } catch (error) {
      alert('Upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const resetForm = () => {
    setGeneratedCode('');
    setTextContent('');
    setSelectedImage(null);
    setImagePreview(null);
    setNoteType('text');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <motion.div 
      initial={{ scale: 0.9 }}
      animate={{ scale: 1 }}
      className="w-full max-w-2xl mx-auto px-2 sm:px-4"
    >
      <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-4 sm:p-6 md:p-8 shadow-2xl border border-white/20">
        <AnimatePresence mode="wait">
          {!generatedCode ? (
            <motion.div
              key="creator"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              {/* Note Type Selector - Responsive Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
                <button
                  onClick={() => setNoteType('text')}
                  className={`py-2 sm:py-3 rounded-lg font-semibold transition-all flex items-center justify-center gap-2 text-sm sm:text-base ${
                    noteType === 'text'
                      ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg'
                      : 'bg-white/10 text-white/70 hover:bg-white/20'
                  }`}
                >
                  <Type className="w-4 h-4 sm:w-5 sm:h-5" />
                  <span className="hidden xs:inline">Text</span>
                </button>
                <button
                  onClick={() => setNoteType('audio')}
                  className={`py-2 sm:py-3 rounded-lg font-semibold transition-all flex items-center justify-center gap-2 text-sm sm:text-base ${
                    noteType === 'audio'
                      ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg'
                      : 'bg-white/10 text-white/70 hover:bg-white/20'
                  }`}
                >
                  <Mic className="w-4 h-4 sm:w-5 sm:h-5" />
                  <span className="hidden xs:inline">Audio</span>
                </button>
                <button
                  onClick={() => setNoteType('image')}
                  className={`py-2 sm:py-3 rounded-lg font-semibold transition-all flex items-center justify-center gap-2 text-sm sm:text-base ${
                    noteType === 'image'
                      ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg'
                      : 'bg-white/10 text-white/70 hover:bg-white/20'
                  }`}
                >
                  <Image className="w-4 h-4 sm:w-5 sm:h-5" />
                  <span className="hidden xs:inline">Image</span>
                </button>
              </div>

              {/* Text Note Interface */}
              {noteType === 'text' && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-4"
                >
                  <textarea
                    value={textContent}
                    onChange={(e) => setTextContent(e.target.value)}
                    placeholder="Type your message here... (max 5000 characters)"
                    maxLength="5000"
                    rows={6}
                    className="w-full px-4 py-3 bg-white/20 border border-white/30 rounded-lg text-white placeholder-white/50 focus:outline-none focus:border-white resize-none text-sm sm:text-base"
                  />
                  <div className="text-right text-white/40 text-xs sm:text-sm">
                    {textContent.length}/5000 characters
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={saveTextNote}
                    disabled={uploading || !textContent.trim()}
                    className="w-full py-2 sm:py-3 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg font-semibold text-white disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
                  >
                    {uploading ? (
                      <span className="flex items-center justify-center gap-2">
                        <Loader className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" />
                        Saving...
                      </span>
                    ) : (
                      'Generate Code →'
                    )}
                  </motion.button>
                </motion.div>
              )}

              {/* Audio Note Interface - Responsive */}
              {noteType === 'audio' && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-center"
                >
                  <motion.div
                    animate={isRecording ? {
                      scale: [1, 1.2, 1],
                      boxShadow: ["0 0 0 0 rgba(239, 68, 68, 0.7)", "0 0 0 20px rgba(239, 68, 68, 0)"]
                    } : {}}
                    transition={{ repeat: Infinity, duration: 1.5 }}
                    className="mb-6 sm:mb-8"
                  >
                    <div className={`w-32 h-32 sm:w-40 sm:h-40 md:w-48 md:h-48 mx-auto rounded-full flex items-center justify-center shadow-2xl ${
                      isRecording 
                        ? 'bg-gradient-to-br from-red-500 to-pink-500' 
                        : 'bg-gradient-to-br from-purple-500 to-pink-500'
                    }`}>
                      {isRecording ? (
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
                        >
                          <Mic className="w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 text-white" />
                        </motion.div>
                      ) : (
                        <Mic className="w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 text-white" />
                      )}
                    </div>
                  </motion.div>

                  {isRecording && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="mb-4"
                    >
                      <div className="text-2xl sm:text-3xl md:text-4xl font-mono font-bold text-white">
                        {formatTime(recordingTime)}
                      </div>
                      <div className="flex justify-center gap-1 mt-2">
                        {[...Array(5)].map((_, i) => (
                          <motion.div
                            key={i}
                            animate={{ height: [20, 40, 20] }}
                            transition={{ repeat: Infinity, duration: 0.5, delay: i * 0.1 }}
                            className="w-1.5 sm:w-2 bg-red-400 rounded-full"
                          />
                        ))}
                      </div>
                    </motion.div>
                  )}

                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={isRecording ? stopRecording : startRecording}
                    className={`px-6 sm:px-8 py-2 sm:py-3 md:py-4 rounded-full font-semibold text-sm sm:text-base md:text-lg transition-all ${
                      isRecording 
                        ? 'bg-red-500 hover:bg-red-600 text-white shadow-lg shadow-red-500/50' 
                        : 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg shadow-purple-500/50'
                    }`}
                  >
                    {isRecording ? (
                      <span className="flex items-center gap-2">
                        <Square className="w-4 h-4 sm:w-5 sm:h-5" />
                        Stop Recording
                      </span>
                    ) : (
                      <span className="flex items-center gap-2">
                        <Mic className="w-4 h-4 sm:w-5 sm:h-5" />
                        Start Recording
                      </span>
                    )}
                  </motion.button>

                  {uploading && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="mt-4 flex items-center justify-center gap-2 text-white text-sm sm:text-base"
                    >
                      <Loader className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" />
                      Uploading your recording...
                    </motion.div>
                  )}
                </motion.div>
              )}

              {/* Image Note Interface - Responsive */}
              {noteType === 'image' && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-4"
                >
                  {!imagePreview ? (
                    <div
                      onClick={() => fileInputRef.current.click()}
                      className="border-2 border-dashed border-white/30 rounded-lg p-8 sm:p-12 text-center cursor-pointer hover:border-white/50 transition-all"
                    >
                      <Upload className="w-12 h-12 sm:w-16 sm:h-16 text-white/50 mx-auto mb-4" />
                      <p className="text-white/70 text-sm sm:text-base mb-2">Click to upload an image</p>
                      <p className="text-white/40 text-xs sm:text-sm">JPG, PNG, GIF up to 5MB</p>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleImageSelect}
                        className="hidden"
                      />
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="relative">
                        <img
                          src={imagePreview}
                          alt="Preview"
                          className="w-full rounded-lg max-h-64 sm:max-h-96 object-contain bg-white/10"
                        />
                        <button
                          onClick={removeImage}
                          className="absolute top-2 right-2 p-1 bg-red-500 rounded-full hover:bg-red-600 transition"
                        >
                          <X className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                        </button>
                      </div>
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={uploadImage}
                        disabled={uploading}
                        className="w-full py-2 sm:py-3 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg font-semibold text-white disabled:opacity-50 text-sm sm:text-base"
                      >
                        {uploading ? (
                          <span className="flex items-center justify-center gap-2">
                            <Loader className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" />
                            Uploading Image...
                          </span>
                        ) : (
                          'Generate Code →'
                        )}
                      </motion.button>
                    </div>
                  )}
                </motion.div>
              )}
            </motion.div>
          ) : (
            <motion.div
              key="code"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", bounce: 0.5 }}
                className="mb-6"
              >
                <div className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 mx-auto bg-green-500 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 text-white" />
                </div>
              </motion.div>
              
              <h2 className="text-xl sm:text-2xl font-bold text-white mb-2">
                {noteType === 'text' && 'Text Note Saved!'}
                {noteType === 'audio' && 'Recording Saved!'}
                {noteType === 'image' && 'Image Saved!'}
                🎉
              </h2>
              
              <div className="bg-white/20 rounded-lg p-4 sm:p-6 mb-4">
                <p className="text-white/80 text-sm sm:text-base mb-2">Your unique code:</p>
                <motion.div 
                  className="text-3xl sm:text-4xl md:text-5xl font-mono font-bold text-white tracking-wider break-all"
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 0.5 }}
                >
                  {generatedCode}
                </motion.div>
              </div>
              
              <p className="text-white/80 text-sm sm:text-base mb-4">
                Share this code with anyone to let them view your {noteType} note
              </p>
              
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={copyToClipboard}
                className="px-4 sm:px-6 py-2 sm:py-3 bg-white text-purple-600 rounded-full font-semibold flex items-center gap-2 mx-auto text-sm sm:text-base"
              >
                {copied ? (
                  <>
                    <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4 sm:w-5 sm:h-5" />
                    Copy Code
                  </>
                )}
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={resetForm}
                className="mt-4 text-white/60 hover:text-white transition-colors text-sm sm:text-base"
              >
                Create Another →
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

export default CreateNote;