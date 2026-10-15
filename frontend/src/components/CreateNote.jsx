import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Mic,
  Square,
  Copy,
  CheckCircle,
  Loader,
  Type,
  Image as ImageIcon,
  Upload,
  X,
  Lock,
  Unlock,
  Clock,
} from 'lucide-react';
import axios from 'axios';
import { API_URL } from '../config';

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
  const [password, setPassword] = useState('');
  const [enablePassword, setEnablePassword] = useState(false);
  const [expiryHours, setExpiryHours] = useState(24);
  const [noteInfo, setNoteInfo] = useState(null);

  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const timerRef = useRef(null);
  const fileInputRef = useRef(null);

  const expiryOptions = [
    { value: 1, label: '1 hour' },
    { value: 6, label: '6 hours' },
    { value: 12, label: '12 hours' },
    { value: 24, label: '24 hours' },
    { value: 72, label: '3 days' },
    { value: 168, label: '7 days' },
  ];

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.onstop = null;
        mediaRecorderRef.current.stop();
        mediaRecorderRef.current.stream?.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  useEffect(() => {
    return () => {
      if (imagePreview) URL.revokeObjectURL(imagePreview);
    };
  }, [imagePreview]);

  const validateSecurity = () => {
    if (enablePassword && !password.trim()) {
      alert('Please enter a password or disable password protection.');
      return false;
    }
    return true;
  };

  const saveTextNote = async () => {
    if (!textContent.trim()) {
      alert('Please enter some text');
      return;
    }
    if (!validateSecurity()) return;

    setUploading(true);
    try {
      const response = await axios.post(`${API_URL}/audio/text`, {
        text: textContent,
        password: enablePassword ? password : null,
        expiryHours,
      });
      setGeneratedCode(response.data.code);
      setNoteInfo(response.data);
    } catch (error) {
      alert(error.response?.data?.error || 'Failed to save text note');
    } finally {
      setUploading(false);
    }
  };

  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert('Image size should be less than 5MB');
      return;
    }
    if (!file.type.startsWith('image/')) {
      alert('Please select a valid image file');
      return;
    }

    setSelectedImage(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const uploadImage = async () => {
    if (!selectedImage) {
      alert('Please select an image first');
      return;
    }
    if (!validateSecurity()) return;

    setUploading(true);
    const formData = new FormData();
    formData.append('image', selectedImage);
    formData.append('password', enablePassword ? password : '');
    formData.append('expiryHours', expiryHours);

    try {
      const response = await axios.post(`${API_URL}/audio/upload-image`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setGeneratedCode(response.data.code);
      setNoteInfo(response.data);
    } catch (error) {
      alert(error.response?.data?.error || 'Image upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const removeImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const startRecording = async () => {
    if (!validateSecurity()) return;

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) audioChunksRef.current.push(event.data);
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
      setRecordingTime(0);

      timerRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);
    } catch (error) {
      alert('Please allow microphone access to record audio');
    }
  };

  const stopRecording = () => {
    if (!mediaRecorderRef.current) return;

    mediaRecorderRef.current.stop();
    setIsRecording(false);
    if (timerRef.current) clearInterval(timerRef.current);

    mediaRecorderRef.current.onstop = async () => {
      const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
      await uploadAudio(audioBlob);
      mediaRecorderRef.current.stream?.getTracks().forEach((track) => track.stop());
    };
  };

  const uploadAudio = async (audioBlob) => {
    if (!validateSecurity()) return;

    setUploading(true);
    const formData = new FormData();
    formData.append('audio', audioBlob, 'recording.webm');
    formData.append('password', enablePassword ? password : '');
    formData.append('expiryHours', expiryHours);

    try {
      const response = await axios.post(`${API_URL}/audio/upload`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setGeneratedCode(response.data.code);
      setNoteInfo(response.data);
    } catch (error) {
      alert(error.response?.data?.error || 'Upload failed. Please try again.');
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
    setPassword('');
    setEnablePassword(false);
    setExpiryHours(24);
    setNoteInfo(null);
    setNoteType('text');
    setRecordingTime(0);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mx-auto w-full max-w-2xl">
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xl shadow-slate-200/50 sm:p-8 dark:border-slate-800 dark:bg-slate-900/70 dark:shadow-black/20">
        <AnimatePresence mode="wait">
          {!generatedCode ? (
            <motion.div key="creator" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <div className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
                {[
                  { id: 'text', label: 'Text', icon: Type },
                  { id: 'audio', label: 'Audio', icon: Mic },
                  { id: 'image', label: 'Image', icon: ImageIcon },
                ].map(({ id, label, icon: Icon }) => (
                  <button
                    key={id}
                    type="button"
                    onClick={() => setNoteType(id)}
                    disabled={isRecording || uploading}
                    className={`flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-medium transition ${
                      noteType === id
                        ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/20'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700'
                    } disabled:cursor-not-allowed disabled:opacity-60`}
                  >
                    <Icon className="h-4 w-4" />
                    {label}
                  </button>
                ))}
              </div>

              <div className="mb-4 grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-2 flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
                    <Clock className="h-4 w-4 text-slate-400 dark:text-slate-500" />
                    Expires after
                  </label>
                  <select
                    value={expiryHours}
                    onChange={(e) => setExpiryHours(Number(e.target.value))}
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                  >
                    {expiryOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="mb-2 flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
                    {enablePassword ? (
                      <Lock className="h-4 w-4 text-slate-400 dark:text-slate-500" />
                    ) : (
                      <Unlock className="h-4 w-4 text-slate-400 dark:text-slate-500" />
                    )}
                    Privacy
                  </label>
                  <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-2.5 dark:border-slate-700 dark:bg-slate-800">
                    <input
                      type="checkbox"
                      checked={enablePassword}
                      onChange={(e) => setEnablePassword(e.target.checked)}
                      className="h-4 w-4 rounded border-slate-300 bg-white text-indigo-500 focus:ring-indigo-500 dark:border-slate-600 dark:bg-slate-700"
                    />
                    <span className="text-sm text-slate-700 dark:text-slate-200">
                      {enablePassword ? 'Password protected' : 'Public link'}
                    </span>
                  </label>
                </div>
              </div>

              {enablePassword && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="mb-6">
                  <input
                    type="password"
                    placeholder="Enter a password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 placeholder-slate-400 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:placeholder-slate-500"
                  />
                </motion.div>
              )}

              {noteType === 'text' && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
                  <textarea
                    value={textContent}
                    onChange={(e) => setTextContent(e.target.value)}
                    placeholder="Type your message here..."
                    maxLength={5000}
                    rows={6}
                    className="w-full resize-none rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 placeholder-slate-400 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:placeholder-slate-500"
                  />
                  <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-500">
                    <span>Max 5,000 characters</span>
                    <span>{textContent.length}/5000</span>
                  </div>
                  <button
                    type="button"
                    onClick={saveTextNote}
                    disabled={uploading || !textContent.trim()}
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-500 px-4 py-3 text-sm font-semibold text-white transition hover:bg-indigo-600 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {uploading ? <Loader className="h-4 w-4 animate-spin" /> : null}
                    {uploading ? 'Generating code...' : 'Generate code'}
                  </button>
                </motion.div>
              )}

              {noteType === 'audio' && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center">
                  <motion.div
                    animate={isRecording ? { scale: [1, 1.04, 1] } : {}}
                    transition={{ repeat: Infinity, duration: 1.5 }}
                    className="mb-6 flex justify-center"
                  >
                    <div
                      className={`flex h-36 w-36 items-center justify-center rounded-full shadow-xl sm:h-44 sm:w-44 ${
                        isRecording ? 'bg-red-500 shadow-red-500/20' : 'bg-indigo-500 shadow-indigo-500/20'
                      }`}
                    >
                      <Mic className="h-14 w-14 text-white sm:h-16 sm:w-16" />
                    </div>
                  </motion.div>

                  {isRecording && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-4">
                      <div className="font-mono text-3xl font-semibold text-slate-900 dark:text-white">
                        {formatTime(recordingTime)}
                      </div>
                      <div className="mt-3 flex justify-center gap-1">
                        {[...Array(5)].map((_, i) => (
                          <motion.div
                            key={i}
                            animate={{ height: [12, 28, 12] }}
                            transition={{ repeat: Infinity, duration: 0.5, delay: i * 0.1 }}
                            className="w-1.5 rounded-full bg-red-400"
                          />
                        ))}
                      </div>
                    </motion.div>
                  )}

                  <button
                    type="button"
                    onClick={isRecording ? stopRecording : startRecording}
                    disabled={uploading}
                    className={`inline-flex items-center justify-center gap-2 rounded-xl px-6 py-3 text-sm font-semibold text-white transition disabled:cursor-not-allowed disabled:opacity-50 ${
                      isRecording ? 'bg-red-500 hover:bg-red-600' : 'bg-indigo-500 hover:bg-indigo-600'
                    }`}
                  >
                    {isRecording ? <Square className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                    {isRecording ? 'Stop recording' : 'Start recording'}
                  </button>

                  {uploading && (
                    <div className="mt-4 flex items-center justify-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                      <Loader className="h-4 w-4 animate-spin" />
                      Uploading recording...
                    </div>
                  )}
                </motion.div>
              )}

              {noteType === 'image' && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
                  {!imagePreview ? (
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="w-full rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center transition hover:border-indigo-500/60 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800/50 dark:hover:bg-slate-800"
                    >
                      <Upload className="mx-auto mb-4 h-10 w-10 text-slate-400 dark:text-slate-500" />
                      <p className="text-sm font-medium text-slate-700 dark:text-slate-200">Click to upload an image</p>
                      <p className="mt-1 text-xs text-slate-500 dark:text-slate-500">JPG, PNG, GIF, WEBP up to 5MB</p>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleImageSelect}
                        className="hidden"
                      />
                    </button>
                  ) : (
                    <div className="space-y-4">
                      <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-800/50">
                        <img src={imagePreview} alt="Preview" className="max-h-80 w-full object-contain" />
                        <button
                          type="button"
                          onClick={removeImage}
                          className="absolute right-3 top-3 rounded-full bg-slate-950/80 p-2 text-slate-200 transition hover:bg-red-500 hover:text-white"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                      <button
                        type="button"
                        onClick={uploadImage}
                        disabled={uploading}
                        className="flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-500 px-4 py-3 text-sm font-semibold text-white transition hover:bg-indigo-600 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {uploading ? <Loader className="h-4 w-4 animate-spin" /> : null}
                        {uploading ? 'Generating code...' : 'Generate code'}
                      </button>
                    </div>
                  )}
                </motion.div>
              )}
            </motion.div>
          ) : (
            <motion.div key="code" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="text-center">
              <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/15">
                <CheckCircle className="h-8 w-8 text-emerald-500" />
              </div>

              <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
                {noteType === 'text' && 'Text note saved'}
                {noteType === 'audio' && 'Recording saved'}
                {noteType === 'image' && 'Image saved'}
              </h2>

              <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                Share this code with anyone you want to give access.
              </p>

              <div className="my-6 rounded-2xl border border-slate-200 bg-slate-50 p-6 dark:border-slate-800 dark:bg-slate-800/60">
                <p className="text-xs uppercase tracking-wider text-slate-500">Your code</p>
                <motion.div
                  className="mt-2 break-all font-mono text-4xl font-bold tracking-widest text-slate-900 sm:text-5xl dark:text-white"
                  animate={{ scale: [1, 1.03, 1] }}
                  transition={{ duration: 0.4 }}
                >
                  {generatedCode}
                </motion.div>

                {noteInfo && (
                  <div className="mt-4 space-y-1 border-t border-slate-200 pt-4 text-xs text-slate-500 dark:border-slate-700 dark:text-slate-400">
                    {noteInfo.isProtected && (
                      <p className="flex items-center justify-center gap-1">
                        <Lock className="h-3 w-3" /> Password protected
                      </p>
                    )}
                    <p>Expires in {noteInfo.expiresIn}</p>
                  </div>
                )}
              </div>

              <button
                type="button"
                onClick={copyToClipboard}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-200"
              >
                {copied ? <CheckCircle className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                {copied ? 'Copied' : 'Copy code'}
              </button>

              <button
                type="button"
                onClick={resetForm}
                className="mt-4 block w-full text-sm text-slate-500 transition hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
              >
                Create another
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

export default CreateNote;