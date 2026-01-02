'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { useTheme } from 'next-themes'

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
      className="sticky top-0 z-30 bg-white dark:bg-gray-900 border-b border-gray-300 dark:border-gray-700 shadow-sm"
    >
      <div className="h-16 flex items-center justify-between px-6">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
        >
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Welcome back{user ? <span className="text-blue-600 dark:text-blue-400">, {user.username}</span> : ''}!
          </h2>
        </motion.div>

        <div className="flex items-center gap-4">
          {/* Search */}
          <motion.div
            className="hidden md:flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <input
              type="text"
              placeholder="Search..."
              className="bg-transparent border-none outline-none text-sm text-gray-700 dark:text-gray-300 placeholder-gray-400 dark:placeholder-gray-500 w-40"
            />
          </motion.div>

          {/* Theme Toggle */}
          <motion.button
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="px-4 py-2 bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <span className="text-sm font-medium">
              {mounted && theme === 'dark' ? 'Light' : 'Dark'}
            </span>
          </motion.button>

          {/* User Avatar */}
          <motion.div
            className="w-10 h-10 bg-blue-600 flex items-center justify-center cursor-pointer"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            transition={{ duration: 0.2 }}
          >
            <span className="text-white text-sm font-bold">
              {user?.username?.charAt(0).toUpperCase() || 'A'}
            </span>
          </motion.div>
        </div>
      </div>
    </motion.header>
  )
}
