import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import CreateNote from './components/CreateNote';
import ViewNote from './components/ViewNote';
import Footer from './components/Footer';

function App() {
  const [mode, setMode] = useState('create'); // 'create' or 'view'

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-blue-600 to-indigo-700">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-yellow-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse animation-delay-2000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse animation-delay-4000"></div>
      </div>

      {/* Header */}
      <motion.div 
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ type: "spring", bounce: 0.5 }}
        className="relative bg-white/10 backdrop-blur-lg border-b border-white/20"
      >
        <div className="container mx-auto px-4 py-6">
          <div className="text-center">
            <motion.div
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 0.5, delay: 0.5 }}
              className="inline-block"
            >
              <h1 className="text-5xl font-bold text-white mb-2">
                📝🎙️ ShareBoard
              </h1>
            </motion.div>
            <p className="text-white/80 text-lg">
              Share Text or Audio with a Simple Code
            </p>
          </div>
        </div>
      </motion.div>

      {/* Mode Toggle Buttons */}
      <div className="relative container mx-auto px-4 pt-8">
        <div className="flex justify-center gap-4">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setMode('create')}
            className={`px-8 py-3 rounded-full font-semibold transition-all duration-300 ${
              mode === 'create' 
                ? 'bg-white text-purple-600 shadow-lg shadow-purple-500/50' 
                : 'bg-white/20 text-white backdrop-blur-sm hover:bg-white/30'
            }`}
          >
            ✨ Create Note
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setMode('view')}
            className={`px-8 py-3 rounded-full font-semibold transition-all duration-300 ${
              mode === 'view' 
                ? 'bg-white text-purple-600 shadow-lg shadow-purple-500/50' 
                : 'bg-white/20 text-white backdrop-blur-sm hover:bg-white/30'
            }`}
          >
            🔓 View Note
          </motion.button>
        </div>
      </div>

      {/* Content with Animation */}
      <div className="relative container mx-auto px-4 py-12">
        <AnimatePresence mode="wait">
          <motion.div
            key={mode}
            initial={{ opacity: 0, x: mode === 'create' ? -100 : 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: mode === 'create' ? 100 : -100 }}
            transition={{ duration: 0.3 }}
          >
            {mode === 'create' ? <CreateNote /> : <ViewNote />}
          </motion.div>
        </AnimatePresence>
      </div>

      <Footer />
    </div>
  );
}

export default App;