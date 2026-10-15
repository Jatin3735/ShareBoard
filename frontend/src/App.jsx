import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Share2, Sun, Moon } from 'lucide-react';
import CreateNote from './components/CreateNote';
import ViewNote from './components/ViewNote';
import Footer from './components/Footer';
import { useTheme } from './hooks/useTheme';

function App() {
  const [mode, setMode] = useState('create');
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="flex min-h-screen flex-col bg-slate-50 text-slate-900 transition-colors dark:bg-slate-950 dark:text-slate-100">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-200/50 via-slate-50 to-slate-50 dark:from-indigo-900/25 dark:via-slate-950 dark:to-slate-950" />

      <header className="relative z-10 border-b border-slate-200 bg-white/80 backdrop-blur dark:border-slate-800/80 dark:bg-slate-950/80">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-3 px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500 shadow-lg shadow-indigo-500/20">
              <Share2 className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-semibold tracking-tight">ShareBoard</h1>
              <p className="hidden text-xs text-slate-500 sm:block dark:text-slate-400">
                Share text, audio, and images with a code
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <nav className="flex rounded-lg border border-slate-200 bg-slate-100 p-1 dark:border-slate-800 dark:bg-slate-900">
              <button
                type="button"
                onClick={() => setMode('create')}
                className={`rounded-md px-3 py-1.5 text-sm font-medium transition ${
                  mode === 'create'
                    ? 'bg-indigo-500 text-white'
                    : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
                }`}
              >
                Create
              </button>
              <button
                type="button"
                onClick={() => setMode('view')}
                className={`rounded-md px-3 py-1.5 text-sm font-medium transition ${
                  mode === 'view'
                    ? 'bg-indigo-500 text-white'
                    : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
                }`}
              >
                View
              </button>
            </nav>

            <button
              type="button"
              onClick={toggleTheme}
              aria-label="Toggle theme"
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              {theme === 'dark' ? (
                <Sun className="h-4 w-4" />
              ) : (
                <Moon className="h-4 w-4" />
              )}
            </button>
          </div>
        </div>
      </header>

      <main className="relative z-10 mx-auto w-full max-w-5xl flex-1 px-4 py-8 sm:py-12">
        <div className="mb-8 text-center">
          <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
            {mode === 'create' ? 'Create a secure share' : 'Access a shared note'}
          </h2>
          <p className="mx-auto mt-2 max-w-xl text-sm text-slate-500 dark:text-slate-400">
            {mode === 'create'
              ? 'Choose a type, add your content, and get a 6-character code.'
              : 'Enter the code you received to view the shared content.'}
          </p>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={mode}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.2 }}
          >
            {mode === 'create' ? <CreateNote /> : <ViewNote />}
          </motion.div>
        </AnimatePresence>
      </main>

      <Footer />
    </div>
  );
}

export default App;