import { motion } from 'framer-motion';

function Footer() {
  const currentYear = new Date().getFullYear();

  const teamMembers = [
    { name: "Jatin JanGra", role: "Full Stack Developer", icon: "💻" },
    { name: "Tushar Sharma", role: "UI/UX Designer", icon: "🎨" },
    { name: "Dipender Ahlawat", role: "Audio Engineer", icon: "🎤" },
    { name: "Lakshay Yadav", role: "Product Manager", icon: "📊" },
  ];

  const socialLinks = [
    { name: "GitHub", icon: "🐙", url: "https://github.com/jatin3735" },
    { name: "Twitter", icon: "🐦", url: "https://twitter.com/yourhandle" },
    { name: "LinkedIn", icon: "🔗", url: "https://linkedin.com/in/jatin-jangra-hhjjiss" },
    { name: "Email", icon: "📧", url: "mailto:team@audioboard.com" },
  ];

  return (
    <motion.footer
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="relative mt-12 sm:mt-20 bg-gradient-to-t from-black/50 via-transparent to-transparent"
    >
      <div className="container mx-auto px-4 py-8 sm:py-12">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 mb-6 sm:mb-8">
          
          {/* Brand Section */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-3 sm:space-y-4 text-center sm:text-left"
          >
            <div className="flex items-center justify-center sm:justify-start gap-2">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center text-xl sm:text-2xl">
                🎙️
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-white">ShareBoard</h3>
            </div>
            <p className="text-white/60 text-xs sm:text-sm leading-relaxed">
              Share your voice instantly with a simple code. Record, generate, and share audio messages securely.
            </p>
            <div className="flex gap-3 justify-center sm:justify-start">
              {socialLinks.map((social, index) => (
                <motion.a
                  key={social.name}
                  href={social.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  whileHover={{ scale: 1.1, y: -3 }}
                  whileTap={{ scale: 0.95 }}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 + index * 0.1 }}
                  className="w-7 h-7 sm:w-8 sm:h-8 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center text-white/70 hover:text-white hover:bg-white/20 transition-all duration-300 text-base sm:text-lg"
                >
                  {social.icon}
                </motion.a>
              ))}
            </div>
          </motion.div>

          {/* Team Section */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="space-y-3 sm:space-y-4 text-center sm:text-left"
          >
            <h3 className="text-base sm:text-lg font-semibold text-white flex items-center justify-center sm:justify-start gap-2">
              <span className="text-lg sm:text-xl">👥</span>
              Our Team
            </h3>
            <div className="space-y-2 sm:space-y-3">
              {teamMembers.map((member, index) => (
                <motion.div
                  key={member.name}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 + index * 0.1 }}
                  whileHover={{ x: 5 }}
                  className="flex items-center justify-center sm:justify-start gap-2 sm:gap-3 group cursor-pointer"
                >
                  <div className="w-6 h-6 sm:w-7 sm:h-7 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform text-sm sm:text-base">
                    {member.icon}
                  </div>
                  <div>
                    <p className="text-white font-medium text-xs sm:text-sm">{member.name}</p>
                    <p className="text-white/40 text-[10px] sm:text-xs">{member.role}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Features Section */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="space-y-3 sm:space-y-4 text-center sm:text-left"
          >
            <h3 className="text-base sm:text-lg font-semibold text-white">Features</h3>
            <ul className="space-y-1.5 sm:space-y-2 text-xs sm:text-sm">
              {[
                "🎤 High-quality audio recording",
                "🔐 Secure code-based access",
                "⏰ 24-hour auto-expiry",
                "📱 Mobile responsive",
                "🌐 No account required",
              ].map((feature, index) => (
                <motion.li
                  key={index}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 + index * 0.05 }}
                  className="text-white/60 hover:text-white/80 transition-colors cursor-pointer"
                >
                  {feature}
                </motion.li>
              ))}
            </ul>
          </motion.div>

          {/* Stats Section */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
            className="space-y-3 sm:space-y-4"
          >
            <h3 className="text-base sm:text-lg font-semibold text-white text-center sm:text-left">Quick Stats</h3>
            <div className="grid grid-cols-1 gap-2 sm:gap-3">
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="bg-white/10 backdrop-blur-sm rounded-lg p-2 sm:p-3 text-center"
              >
                <p className="text-xl sm:text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">
                  24h
                </p>
                <p className="text-white/60 text-[10px] sm:text-xs">Message Lifetime</p>
              </motion.div>
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="bg-white/10 backdrop-blur-sm rounded-lg p-2 sm:p-3 text-center"
              >
                <p className="text-xl sm:text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">
                  6
                </p>
                <p className="text-white/60 text-[10px] sm:text-xs">Character Code</p>
              </motion.div>
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="bg-white/10 backdrop-blur-sm rounded-lg p-2 sm:p-3 text-center"
              >
                <p className="text-xl sm:text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">
                  5MB
                </p>
                <p className="text-white/60 text-[10px] sm:text-xs">Max File Size</p>
              </motion.div>
            </div>
          </motion.div>
        </div>

        {/* Divider */}
        <motion.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ delay: 0.6 }}
          className="h-px bg-gradient-to-r from-transparent via-white/20 to-transparent"
        />

        {/* Bottom Bar */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="pt-6 sm:pt-8 flex flex-col md:flex-row justify-between items-center gap-3 sm:gap-4 text-xs sm:text-sm"
        >
          <p className="text-white/40 flex items-center gap-1">
            © {currentYear} ShareBoard. Made with
            <motion.span
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ repeat: Infinity, duration: 1.5 }}
            >
              <span className="text-red-400 inline mx-1">❤️</span>
            </motion.span>
            by Team ShareBoard
          </p>
          
          <div className="flex gap-4 sm:gap-6">
            {["Privacy Policy", "Terms of Service", "Contact Us"].map((item, index) => (
              <motion.a
                key={item}
                href="#"
                whileHover={{ color: "#fff" }}
                className="text-white/40 hover:text-white/80 transition-colors cursor-pointer"
              >
                {item}
              </motion.a>
            ))}
          </div>
        </motion.div>

        {/* Floating animated elements */}
        <div className="absolute bottom-0 left-0 w-24 h-24 sm:w-32 sm:h-32 bg-purple-500/10 rounded-full filter blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-20 right-0 w-32 h-32 sm:w-40 sm:h-40 bg-pink-500/10 rounded-full filter blur-3xl pointer-events-none"></div>
      </div>
    </motion.footer>
  );
}

export default Footer;