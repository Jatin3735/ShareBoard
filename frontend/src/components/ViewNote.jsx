import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Play,
  Loader,
  AlertCircle,
  Headphones,
  FileText,
  Image as ImageIcon,
  Volume2,
  Download,
  Lock,
  Copy,
  CheckCircle,
  ExternalLink,
} from 'lucide-react';
import axios from 'axios';
import { API_URL } from '../config';

function ViewNote() {
  const [code, setCode] = useState('');
  const [password, setPassword] = useState('');
  const [showPasswordInput, setShowPasswordInput] = useState(false);
  const [noteData, setNoteData] = useState(null);
  const [audioUrl, setAudioUrl] = useState(null);
  const [imageUrl, setImageUrl] = useState(null);
  const [fileUrl, setFileUrl] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [noteType, setNoteType] = useState(null);
  const [textCopied, setTextCopied] = useState(false);
  const [codeCopied, setCodeCopied] = useState(false);

  useEffect(() => {
    return () => {
      if (imageUrl?.startsWith('blob:')) URL.revokeObjectURL(imageUrl);
      if (audioUrl?.startsWith('blob:')) URL.revokeObjectURL(audioUrl);
      if (fileUrl?.startsWith('blob:')) URL.revokeObjectURL(fileUrl);
    };
  }, [imageUrl, audioUrl, fileUrl]);

  const resetResult = () => {
    setNoteData(null);
    setAudioUrl(null);
    setImageUrl(null);
    setFileUrl(null);
    setNoteType(null);
    setError('');
    setShowPasswordInput(false);
    setTextCopied(false);
  };

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
    setFileUrl(null);
    setNoteType(null);
    setShowPasswordInput(false);
    setTextCopied(false);

    try {
      const infoResponse = await axios.get(`${API_URL}/audio/info/${code}`);
      const info = infoResponse.data;

      if (info.isExpired) {
        setError('This note has expired and is no longer available.');
        setLoading(false);
        return;
      }

      if (info.isProtected && !providedPassword) {
        setShowPasswordInput(true);
        setError('This note is password protected. Enter the password to continue.');
        setLoading(false);
        return;
      }

      let url = `${API_URL}/audio/${code}`;
      if (providedPassword) {
        url += `?password=${encodeURIComponent(providedPassword)}`;
      }

      const response = await axios.get(url);
      const data = response.data;

      if (data.type === 'text') {
        setNoteType('text');
        setNoteData(data);
      } else if (data.type === 'image') {
        setNoteType('image');
        setImageUrl(data.imageData);
        setNoteData(data);
      } else if (data.type === 'audio') {
        setNoteType('audio');
        setAudioUrl(data.audioData);
        setNoteData(data);
      } else if (data.type === 'file') {
        setNoteType('file');
        setFileUrl(data.fileData);
        setNoteData(data);
      } else {
        setError(`Cannot display this note. Response type: ${data.type || 'unknown'}`);
      }
    } catch (err) {
      console.error('Fetch error:', err);

      if (err.response?.status === 401) {
        setShowPasswordInput(true);
        setError('Password required. Enter the correct password.');
      } else if (err.response?.status === 410) {
        setError('This note has expired and is no longer available.');
      } else if (err.response?.status === 404) {
        setError('No content found with this code. Check the code and try again.');
      } else {
        setError(err.response?.data?.error || 'Failed to load note. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordSubmit = () => {
    if (!password.trim()) {
      setError('Please enter the password');
      return;
    }
    setShowPasswordInput(false);
    fetchNote(password);
  };

  const handleCodeChange = (e) => {
    const value = e.target.value
      .toUpperCase()
      .replace(/[^A-Z0-9]/g, '')
      .slice(0, 6);
    setCode(value);
    resetResult();
    setPassword('');
  };

  const downloadFromUrl = (dataUrl, filename) => {
    if (!dataUrl) return;
    const link = document.createElement('a');
    link.href = dataUrl;
    link.download = filename || `shareboard-${code}`;
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  const copyTextContent = async () => {
    if (!noteData?.content) return;
    try {
      await navigator.clipboard.writeText(noteData.content);
    } catch {
      const el = document.createElement('textarea');
      el.value = noteData.content;
      document.body.appendChild(el);
      el.select();
      document.execCommand('copy');
      el.remove();
    }
    setTextCopied(true);
    setTimeout(() => setTextCopied(false), 2000);
  };

  const copyCode = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCodeCopied(true);
      setTimeout(() => setCodeCopied(false), 2000);
    } catch {
      /* ignore */
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString();
  };

  const isPdf = noteData?.fileMime === 'application/pdf';
  const isText =
    noteData?.fileMime?.startsWith('text/') ||
    noteData?.fileMime === 'application/json';

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mx-auto w-full max-w-2xl">
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xl shadow-slate-200/50 sm:p-8 dark:border-slate-800 dark:bg-slate-900/70 dark:shadow-black/20">
        <div className="mb-6 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-indigo-500/10 dark:bg-indigo-500/15">
            <Headphones className="h-7 w-7 text-indigo-500 dark:text-indigo-400" />
          </div>
          <h2 className="text-xl font-semibold text-slate-900 dark:text-white">View a shared note</h2>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
            Enter the 6-character code you received.
          </p>
        </div>

        <div className="mb-4 flex flex-col gap-2 sm:flex-row">
          <input
            type="text"
            placeholder="ABC123"
            value={code}
            onChange={handleCodeChange}
            onKeyDown={(e) => e.key === 'Enter' && code.length === 6 && fetchNote()}
            className="flex-1 rounded-xl border border-slate-200 bg-white px-4 py-3 text-center font-mono text-lg tracking-[0.3em] text-slate-900 placeholder-slate-400 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:placeholder-slate-500"
            maxLength={6}
            autoCapitalize="characters"
          />
          <button
            type="button"
            onClick={() => fetchNote()}
            disabled={code.length !== 6 || loading}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-indigo-600 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? <Loader className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />}
            View
          </button>
        </div>

        <AnimatePresence>
          {showPasswordInput && (
            <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} className="mb-4">
              <div className="flex gap-2">
                <input
                  type="password"
                  placeholder="Enter note password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handlePasswordSubmit()}
                  className="flex-1 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 placeholder-slate-400 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:placeholder-slate-500"
                  autoFocus
                />
                <button
                  type="button"
                  onClick={handlePasswordSubmit}
                  className="inline-flex items-center justify-center rounded-xl bg-indigo-500 px-4 py-2.5 text-white transition hover:bg-indigo-600"
                >
                  <Lock className="h-4 w-4" />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className={`mb-4 flex items-start gap-2 rounded-xl border p-3 text-sm ${
                error.toLowerCase().includes('expired')
                  ? 'border-amber-300 bg-amber-50 text-amber-800 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-200'
                  : 'border-red-300 bg-red-50 text-red-800 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-200'
              }`}
            >
              <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0" />
              <span>{error}</span>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {noteType === 'text' && noteData && (
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} className="mt-6">
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5 dark:border-slate-800 dark:bg-slate-800/50">
                <div className="mb-4 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-200">
                    <FileText className="h-4 w-4 text-indigo-500 dark:text-indigo-400" />
                    Text message
                  </div>
                  <button
                    type="button"
                    onClick={copyTextContent}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-700 transition hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
                  >
                    {textCopied ? (
                      <CheckCircle className="h-3.5 w-3.5 text-emerald-500" />
                    ) : (
                      <Copy className="h-3.5 w-3.5" />
                    )}
                    {textCopied ? 'Copied' : 'Copy'}
                  </button>
                </div>
                <div className="rounded-xl bg-white p-4 dark:bg-slate-900/70">
                  <p className="whitespace-pre-wrap break-words text-sm leading-relaxed text-slate-800 dark:text-slate-100">
                    {noteData.content}
                  </p>
                </div>
                <div className="mt-4 space-y-1 text-center text-xs text-slate-500">
                  <p>Views: {noteData.views}</p>
                  <p>Created: {formatDate(noteData.createdAt)}</p>
                  {noteData.expiresAt && <p>Expires: {formatDate(noteData.expiresAt)}</p>}
                </div>
              </div>
            </motion.div>
          )}

          {noteType === 'image' && imageUrl && (
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} className="mt-6">
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5 dark:border-slate-800 dark:bg-slate-800/50">
                <div className="mb-4 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-200">
                    <ImageIcon className="h-4 w-4 text-indigo-500 dark:text-indigo-400" />
                    Image
                  </div>
                  <button
                    type="button"
                    onClick={() => downloadFromUrl(imageUrl, noteData?.filename || `shareboard-${code}.jpg`)}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-700 transition hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
                  >
                    <Download className="h-3.5 w-3.5" />
                    Download
                  </button>
                </div>
                <div className="flex justify-center rounded-xl bg-white p-4 dark:bg-slate-900/70">
                  <img src={imageUrl} alt="Shared content" className="max-h-96 max-w-full rounded-lg object-contain" />
                </div>
                <div className="mt-4 space-y-1 text-center text-xs text-slate-500">
                  <p>Views: {noteData?.views}</p>
                  <p>Created: {formatDate(noteData?.createdAt)}</p>
                  {noteData?.expiresAt && <p>Expires: {formatDate(noteData.expiresAt)}</p>}
                </div>
              </div>
            </motion.div>
          )}

          {noteType === 'audio' && audioUrl && (
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} className="mt-6">
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5 dark:border-slate-800 dark:bg-slate-800/50">
                <div className="mb-4 flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-200">
                  <Volume2 className="h-4 w-4 text-indigo-500 dark:text-indigo-400" />
                  Audio message
                </div>
                <audio controls src={audioUrl} className="w-full" />
                <div className="mt-4 text-center">
                  <button
                    type="button"
                    onClick={() => downloadFromUrl(audioUrl, noteData?.filename || 'recording.webm')}
                    className="text-xs text-slate-500 transition hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
                  >
                    Download audio
                  </button>
                </div>
                <div className="mt-4 space-y-1 text-center text-xs text-slate-500">
                  <p>Views: {noteData?.views}</p>
                  <p>Created: {formatDate(noteData?.createdAt)}</p>
                  {noteData?.expiresAt && <p>Expires: {formatDate(noteData.expiresAt)}</p>}
                </div>
              </div>
            </motion.div>
          )}

          {noteType === 'file' && fileUrl && (
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} className="mt-6">
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5 dark:border-slate-800 dark:bg-slate-800/50">
                <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                  <div className="flex min-w-0 items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-200">
                    <FileText className="h-4 w-4 flex-shrink-0 text-indigo-500 dark:text-indigo-400" />
                    <span className="truncate">{noteData?.filename || 'Shared file'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <a
                      href={fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-700 transition hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
                    >
                      <ExternalLink className="h-3.5 w-3.5" />
                      Open
                    </a>
                    <button
                      type="button"
                      onClick={() => downloadFromUrl(fileUrl, noteData?.filename || `shareboard-${code}`)}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-700 transition hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
                    >
                      <Download className="h-3.5 w-3.5" />
                      Download
                    </button>
                  </div>
                </div>

                {isPdf && (
                  <div className="overflow-hidden rounded-xl bg-white dark:bg-slate-900/70">
                    <iframe
                      title="PDF preview"
                      src={fileUrl}
                      className="h-[28rem] w-full"
                    />
                  </div>
                )}

                {isText && (
                  <div className="rounded-xl bg-white p-4 dark:bg-slate-900/70">
                    <p className="whitespace-pre-wrap break-words text-xs text-slate-700 dark:text-slate-200">
                      Preview available via the Open button.
                    </p>
                  </div>
                )}

                {!isPdf && !isText && (
                  <div className="rounded-xl border border-dashed border-slate-300 bg-white p-6 text-center dark:border-slate-700 dark:bg-slate-900/70">
                    <FileText className="mx-auto mb-3 h-10 w-10 text-slate-400 dark:text-slate-500" />
                    <p className="text-sm text-slate-600 dark:text-slate-300">
                      This file type can't be previewed inline.
                    </p>
                    <p className="mt-1 text-xs text-slate-500">
                      Use the Open or Download buttons above to view it.
                    </p>
                  </div>
                )}

                <div className="mt-4 space-y-1 text-center text-xs text-slate-500">
                  <p>Views: {noteData?.views}</p>
                  <p>Created: {formatDate(noteData?.createdAt)}</p>
                  {noteData?.expiresAt && <p>Expires: {formatDate(noteData.expiresAt)}</p>}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="mt-8 rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-900/50">
          <div className="mb-2 flex items-center justify-between">
            <h3 className="text-sm font-medium text-slate-700 dark:text-slate-200">Tips</h3>
            {code.length === 6 && (
              <button
                type="button"
                onClick={copyCode}
                className="inline-flex items-center gap-1 text-xs text-slate-500 transition hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
              >
                {codeCopied ? (
                  <>
                    <CheckCircle className="h-3 w-3 text-emerald-500" /> Copied
                  </>
                ) : (
                  <>
                    <Copy className="h-3 w-3" /> Copy code
                  </>
                )}
              </button>
            )}
          </div>
          <ul className="space-y-1 text-xs text-slate-500">
            <li>• Codes are 6 characters and are not case-sensitive.</li>
            <li>• Notes expire automatically based on the creator's setting.</li>
            <li>• Password-protected notes require the password to view.</li>
            <li>• Text notes have a one-click copy button; files can be opened or downloaded.</li>
          </ul>
        </div>
      </div>
    </motion.div>
  );
}

export default ViewNote;