import React from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '../hooks/useTheme';

export default function DarkModeNeonToggle({ className = '' }) {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <button
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      onClick={toggleTheme}
      className={`inline-flex items-center p-1 rounded-full transition-theme focus:outline-none focus:ring-2 focus:ring-neon-400 ${className}`}
    >
      <div className="relative w-12 h-6 rounded-full" style={{ background: isDark ? 'rgba(124,58,237,0.18)' : '#e9e2ff' }}>
        <motion.div
          layout
          initial={false}
          animate={{ x: isDark ? 28 : 2 }}
          transition={{ type: 'spring', stiffness: 500, damping: 40 }}
          className="absolute top-0 left-0 w-6 h-6 rounded-full bg-white shadow-sm flex items-center justify-center text-xs"
          style={{ boxShadow: isDark ? '0 6px 18px rgba(124,58,237,0.28)' : '0 4px 10px rgba(0,0,0,0.06)' }}
        >
          {isDark ? '🌙' : '☀️'}
        </motion.div>
      </div>
    </button>
  );
}




