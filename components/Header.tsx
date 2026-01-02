'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { useTheme } from 'next-themes'
import { Search, Sun, Moon } from 'lucide-react'
import NotificationBell from './NotificationBell'
import Link from 'next/link'

export default function Header() {
  const [user, setUser] = useState<any>(null)
  const [mounted, setMounted] = useState(false)
  const { theme, setTheme } = useTheme()

  useEffect(() => {
    setMounted(true)
    const userData = localStorage.getItem('user')
    if (userData) {
      setUser(JSON.parse(userData))
    }
  }, [])

  return (
    <motion.header
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className="sticky top-0 z-30 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-purple-200/50 dark:border-purple-500/20 shadow-lg shadow-purple-500/5"
    >
      <div className="h-16 lg:h-20 flex items-center justify-between px-3 sm:px-4 md:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
          className="flex-1 min-w-0"
        >
          <h2 className="text-base sm:text-lg lg:text-xl font-bold text-gray-900 dark:text-white truncate">
            Welcome back{user ? (
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                , {user.username}
              </span>
            ) : ''}!
          </h2>
        </motion.div>

        <div className="flex items-center gap-2 sm:gap-4">
          {/* Search - Hidden on mobile */}
          <motion.div
            className="hidden md:flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/30 dark:to-pink-900/30 border border-purple-200 dark:border-purple-500/30 rounded-xl"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Search size={18} className="text-purple-600 dark:text-purple-400" />
            <input
              type="text"
              placeholder="Search..."
              className="bg-transparent border-none outline-none text-sm text-gray-700 dark:text-gray-300 placeholder-gray-400 dark:placeholder-gray-500 w-32 lg:w-40"
            />
          </motion.div>

          {/* Notifications - Hidden on mobile */}
          <div className="hidden sm:block">
            <NotificationBell />
          </div>

          {/* Theme Toggle */}
          <motion.button
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="flex items-center justify-center w-10 h-10 bg-gradient-to-r from-amber-400 to-orange-500 rounded-xl text-white shadow-lg shadow-amber-500/50 hover:shadow-amber-500/70 transition-all"
            whileHover={{ scale: 1.1, rotate: 15 }}
            whileTap={{ scale: 0.9 }}
          >
            {mounted && theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </motion.button>

          {/* User Avatar */}
          <Link href="/dashboard/profile">
            <motion.div
              className="w-10 h-10 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 rounded-xl flex items-center justify-center cursor-pointer shadow-lg shadow-purple-500/50 border-2 border-white dark:border-slate-800"
              whileHover={{ scale: 1.1, rotate: 5 }}
              whileTap={{ scale: 0.9 }}
              transition={{ duration: 0.2 }}
            >
              <span className="text-white text-sm font-bold">
                {user?.username?.charAt(0).toUpperCase() || 'A'}
              </span>
            </motion.div>
          </Link>
        </div>
      </div>
    </motion.header>
  )
}
