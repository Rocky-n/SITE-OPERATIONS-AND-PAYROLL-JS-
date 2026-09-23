import React, { useState, useEffect } from 'react';
import { Calendar, ShieldCheck, Sun, Moon, Menu, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Navbar({ title, isMobileMenuOpen, setIsMobileMenuOpen }) {
  const { user } = useAuth();
  const [isDark, setIsDark] = useState(() => {
    return document.documentElement.classList.contains('dark') || localStorage.getItem('theme') === 'dark';
  });

  const todayStr = new Date().toLocaleDateString('en-IN', {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

  const toggleDarkMode = () => {
    const nextDark = !isDark;
    setIsDark(nextDark);
    if (nextDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  };

  return (
    <header className="h-16 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-4 sm:px-6 md:px-8 flex items-center justify-between sticky top-0 z-20 shadow-xs transition-colors">
      <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
        {/* Mobile Hamburger Menu Toggle Button */}
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          aria-label="Toggle navigation menu"
          className="md:hidden p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer shrink-0"
        >
          {isMobileMenuOpen ? (
            <X className="w-5 h-5 text-orange-600 dark:text-orange-400" />
          ) : (
            <Menu className="w-5 h-5" />
          )}
        </button>

        <img
          src="/js-logo.png"
          alt="JS Constructions Logo"
          className="h-8 w-auto object-contain hidden sm:block shrink-0"
        />
        <div className="min-w-0 truncate">
          <h1 className="text-base sm:text-xl font-bold text-slate-800 dark:text-white truncate">{title}</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 hidden sm:block truncate">
            JS Constructions • Site Operations &amp; Payroll
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        {/* Dark Mode Toggle Button */}
        <button
          onClick={toggleDarkMode}
          title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          className="p-2 min-h-[40px] min-w-[40px] flex items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-orange-500 dark:hover:text-orange-400 border border-slate-200 dark:border-slate-700 transition-all cursor-pointer"
        >
          {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
        </button>

        {/* Current Date Badge */}
        <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 bg-slate-100 dark:bg-slate-800 rounded-lg text-xs font-medium text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
          <Calendar className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
          <span>{todayStr}</span>
        </div>

        {/* Manager Auth Badge */}
        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-emerald-50 dark:bg-emerald-950/40 rounded-lg text-xs font-medium text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/60">
          <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          <span>Authorized Staff</span>
        </div>
      </div>
    </header>
  );
}
