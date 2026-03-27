'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { Bell, Search, Sun, Moon, User, ChevronDown, LogIn } from 'lucide-react';
import { useTheme } from 'next-themes';
import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';

export default function DashboardHeader() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const { user, isAuthenticated, logout } = useAuth();

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="fixed top-0 left-64 right-0 h-16 bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg border-b border-gray-200 dark:border-gray-700 z-30 flex items-center justify-between px-6"
    >
      {/* Search */}
      <div className="relative w-96">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="text"
          placeholder="Search lakes, frothing reports, locations..."
          className="w-full pl-12 pr-4 py-2.5 bg-gray-100 dark:bg-gray-800 rounded-xl border-0 focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white placeholder-gray-400"
        />
      </div>

      {/* Right Section */}
      <div className="flex items-center space-x-4">
        {/* Theme Toggle */}
        {mounted && (
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="p-2.5 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300"
          >
            {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </motion.button>
        )}

        {/* Notifications */}
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          className="relative p-2.5 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300"
        >
          <Bell className="w-5 h-5" />
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full text-white text-xs flex items-center justify-center">3</span>
        </motion.button>

        {/* Profile */}
        <div className="relative">
          {isAuthenticated ? (
            <>
              <motion.button
                whileHover={{ scale: 1.02 }}
                onClick={() => setShowProfile(!showProfile)}
                className="flex items-center space-x-3 p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                <div className="w-9 h-9 bg-gradient-to-br from-blue-400 to-cyan-500 rounded-xl flex items-center justify-center">
                  <User className="w-5 h-5 text-white" />
                </div>
                <div className="text-left hidden sm:block">
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">{user?.name || 'User'}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{user?.email || 'user@email.com'}</p>
                </div>
                <ChevronDown className="w-4 h-4 text-gray-400" />
              </motion.button>

              {showProfile && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="absolute right-0 top-full mt-2 w-48 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 py-2"
                >
                  <Link href="/dashboard/settings" className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700">Profile</Link>
                  <Link href="/dashboard/settings" className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700">Settings</Link>
                  <hr className="my-2 border-gray-200 dark:border-gray-700" />
                  <button onClick={logout} className="w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20">Logout</button>
                </motion.div>
              )}
            </>
          ) : (
            <Link href="/login">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-xl font-medium shadow-lg shadow-blue-500/30"
              >
                <LogIn className="w-4 h-4" />
                <span>Login</span>
              </motion.button>
            </Link>
          )}
        </div>
      </div>
    </motion.header>
  );
}
