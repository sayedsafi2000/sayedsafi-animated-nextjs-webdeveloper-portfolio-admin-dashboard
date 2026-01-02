'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Bell, X, Globe, Clock } from 'lucide-react'
import { analyticsAPI } from '@/lib/api'
import toast from 'react-hot-toast'

interface RecentVisit {
  _id: string
  page: string
  path: string
  country: string
  timestamp: string
}

const NOTIFICATIONS_STORAGE_KEY = 'admin_notifications'
const LAST_VISIT_ID_KEY = 'admin_last_visit_id'
const UNREAD_COUNT_KEY = 'admin_unread_count'

export default function NotificationBell() {
  const [notifications, setNotifications] = useState<RecentVisit[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)
  const lastVisitIdRef = useRef<string | null>(null)
  const notificationRef = useRef<HTMLDivElement>(null)

  // Load notifications from localStorage on mount
  useEffect(() => {
    try {
      const savedNotifications = localStorage.getItem(NOTIFICATIONS_STORAGE_KEY)
      const savedLastVisitId = localStorage.getItem(LAST_VISIT_ID_KEY)
      const savedUnreadCount = localStorage.getItem(UNREAD_COUNT_KEY)

      if (savedNotifications) {
        const parsed = JSON.parse(savedNotifications)
        setNotifications(parsed)
      }

      if (savedLastVisitId) {
        lastVisitIdRef.current = savedLastVisitId
      }

      if (savedUnreadCount) {
        setUnreadCount(parseInt(savedUnreadCount, 10) || 0)
      }
    } catch (error) {
      console.error('Error loading notifications from localStorage:', error)
    }
  }, [])

  // Save notifications to localStorage whenever they change
  useEffect(() => {
    try {
      localStorage.setItem(NOTIFICATIONS_STORAGE_KEY, JSON.stringify(notifications))
    } catch (error) {
      console.error('Error saving notifications to localStorage:', error)
    }
  }, [notifications])

  // Save unread count to localStorage whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem(UNREAD_COUNT_KEY, unreadCount.toString())
    } catch (error) {
      console.error('Error saving unread count to localStorage:', error)
    }
  }, [unreadCount])

  // Fetch recent visits and check for new ones
  const checkNewVisits = async () => {
    try {
      const response = await analyticsAPI.getRecentVisits({ limit: 10 })
      const visits = response.data.visits || []
      
      if (visits.length > 0) {
        const latestVisit = visits[0]
        
        // If this is the first time (no lastVisitId), just set it without creating notification
        if (!lastVisitIdRef.current) {
          lastVisitIdRef.current = latestVisit._id
          try {
            localStorage.setItem(LAST_VISIT_ID_KEY, latestVisit._id)
          } catch (error) {
            console.error('Error saving last visit ID:', error)
          }
          return
        }
        
        // Check if there's a new visit (different from last one we saw)
        if (latestVisit._id !== lastVisitIdRef.current) {
          // New visit detected!
          setNotifications(prev => {
            // Check if this visit already exists in notifications
            const exists = prev.some(n => n._id === latestVisit._id)
            if (exists) {
              return prev
            }
            // Add new visit and keep only last 20
            const updated = [latestVisit, ...prev].slice(0, 20)
            return updated
          })
          setUnreadCount(prev => prev + 1)
          
          // Show toast notification
          toast.success(`New visit: ${latestVisit.page}`, {
            icon: '🌍',
            duration: 3000,
          })
          
          // Update last visit ID
          lastVisitIdRef.current = latestVisit._id
          try {
            localStorage.setItem(LAST_VISIT_ID_KEY, latestVisit._id)
          } catch (error) {
            console.error('Error saving last visit ID:', error)
          }
        }
      }
    } catch (error) {
      console.error('Error checking visits:', error)
    }
  }

  // Poll for new visits every 10 seconds
  useEffect(() => {
    // Initial fetch
    checkNewVisits()
    
    // Set up polling
    const interval = setInterval(checkNewVisits, 10000) // Check every 10 seconds
    
    return () => clearInterval(interval)
  }, [])

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  const handleMarkAsRead = () => {
    setUnreadCount(0)
  }

  const handleClearAll = () => {
    setNotifications([])
    setUnreadCount(0)
    // Clear from localStorage
    try {
      localStorage.removeItem(NOTIFICATIONS_STORAGE_KEY)
      localStorage.removeItem(UNREAD_COUNT_KEY)
    } catch (error) {
      console.error('Error clearing notifications from localStorage:', error)
    }
    toast.success('Notifications cleared')
  }

  return (
    <div className="relative" ref={notificationRef}>
      <motion.button
        onClick={() => {
          setIsOpen(!isOpen)
          if (isOpen) {
            handleMarkAsRead()
          }
        }}
        className="relative flex items-center justify-center w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl text-white shadow-lg shadow-purple-500/50 hover:shadow-purple-500/70 transition-all"
        whileHover={{ scale: 1.1, rotate: 5 }}
        whileTap={{ scale: 0.9 }}
      >
        <Bell size={18} />
        {unreadCount > 0 && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-xs font-bold text-white border-2 border-white dark:border-slate-900"
          >
            {unreadCount > 9 ? '9+' : unreadCount}
          </motion.span>
        )}
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="absolute right-0 mt-2 w-80 sm:w-96 bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-purple-200/50 dark:border-purple-500/30 z-50 overflow-hidden"
            >
              {/* Header */}
              <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    <Bell size={18} />
                    Notifications
                    {unreadCount > 0 && (
                      <span className="px-2 py-0.5 bg-red-500 text-white text-xs rounded-full">
                        {unreadCount}
                      </span>
                    )}
                  </h3>
                  <div className="flex items-center gap-2">
                    {notifications.length > 0 && (
                      <button
                        onClick={handleClearAll}
                        className="text-xs text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                      >
                        Clear all
                      </button>
                    )}
                    <button
                      onClick={() => setIsOpen(false)}
                      className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                    >
                      <X size={16} />
                    </button>
                  </div>
                </div>
              </div>

              {/* Notifications List */}
              <div className="max-h-96 overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="p-8 text-center">
                    <Globe size={48} className="mx-auto text-gray-400 dark:text-gray-500 mb-3" />
                    <p className="text-gray-500 dark:text-gray-400 text-sm">
                      No notifications yet
                    </p>
                    <p className="text-gray-400 dark:text-gray-500 text-xs mt-1">
                      New visits will appear here
                    </p>
                  </div>
                ) : (
                  <div className="divide-y divide-gray-200 dark:divide-gray-700">
                    {notifications.map((visit, index) => (
                      <motion.div
                        key={visit._id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                      >
                        <div className="flex items-start gap-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg flex items-center justify-center flex-shrink-0">
                            <Globe size={18} className="text-white" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-gray-900 dark:text-white">
                              New Visit
                            </p>
                            <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                              {visit.page}
                            </p>
                            <div className="flex items-center gap-3 mt-2">
                              <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                                <Globe size={12} />
                                {visit.country || 'Unknown'}
                              </div>
                              <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                                <Clock size={12} />
                                {new Date(visit.timestamp).toLocaleTimeString('en-US', {
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                              </div>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}

