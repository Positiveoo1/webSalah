'use client';

import { useState, useEffect } from 'react';
import { Sun, Moon } from 'lucide-react';
import { motion } from 'framer-motion';

export function ThemeToggle() {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      const savedTheme = localStorage.getItem('web-salah-theme');
      const dark =
        savedTheme !== null
          ? savedTheme === 'dark'
          : window.matchMedia('(prefers-color-scheme: dark)').matches;
      setIsDark(dark);
      document.documentElement.classList.toggle('dark', dark);
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  const toggleTheme = () => {
    const newTheme = !isDark;
    setIsDark(newTheme);
    localStorage.setItem('web-salah-theme', newTheme ? 'dark' : 'light');
    document.documentElement.classList.toggle('dark', newTheme);
  };

  return (
    <button
      onClick={toggleTheme}
      className="relative flex h-11 w-11 items-center justify-center rounded-xl border border-border bg-card/80 backdrop-blur-sm transition-colors hover:bg-card focus:outline-none focus:ring-2 focus:ring-ring"
      aria-label="Toggle theme"
    >
      <motion.div
        initial={false}
        animate={{ rotate: isDark ? 180 : 0, scale: isDark ? 0.8 : 1 }}
        transition={{ duration: 0.3, type: 'spring' }}
        className="relative w-5 h-5"
      >
        {isDark ? <Moon className="absolute inset-0" /> : <Sun className="absolute inset-0" />}
      </motion.div>
    </button>
  );
}