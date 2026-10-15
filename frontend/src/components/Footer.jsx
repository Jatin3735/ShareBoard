import { motion } from 'framer-motion';

function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <motion.footer
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="relative z-10 border-t border-slate-200 bg-white/80 dark:border-slate-800/80 dark:bg-slate-950/80"
    >
      <div className="mx-auto max-w-5xl px-4 py-6 text-center">
        <p className="text-xs text-slate-500 dark:text-slate-500">
          © {currentYear} ShareBoard. Share text, audio, and images with a simple code.
        </p>
      </div>
    </motion.footer>
  );
}

export default Footer;