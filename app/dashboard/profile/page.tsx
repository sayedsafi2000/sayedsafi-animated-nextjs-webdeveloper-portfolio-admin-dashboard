'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { authAPI, analyticsAPI } from '@/lib/api'
import { User, Mail, Calendar, Globe, BarChart3, FileText, Briefcase, Settings, LogOut } from 'lucide-react'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'

export default function ProfilePage() {
  const [user, setUser] = useState<any>(null)
  const [stats, setStats] = useState({
    blogs: 0,
    projects: 0,
    services: 0,
    totalVisits: 0,
    totalLeads: 0
  })
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const userData = localStorage.getItem('user')
        if (userData) {
          setUser(JSON.parse(userData))
        }

        // Fetch user stats
        try {
          const [overviewRes] = await Promise.all([
            analyticsAPI.getOverview()
          ])
          setStats({
            blogs: 0,
            projects: 0,
            services: 0,
            totalVisits: overviewRes.data.totalVisits || 0,
            totalLeads: overviewRes.data.totalLeads || 0
          })
        } catch (error) {
          console.error('Error fetching stats:', error)
        }
      } catch (error) {
        console.error('Error fetching profile:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    toast.success('Logged out successfully')
    router.push('/login')
  }

  const statCards = [
    {
      title: 'Total Visits',
      value: stats.totalVisits.toLocaleString(),
      icon: BarChart3,
      gradient: 'from-blue-500 to-cyan-500',
      color: '#3b82f6'
    },
    {
      title: 'Total Leads',
      value: stats.totalLeads.toLocaleString(),
      icon: Mail,
      gradient: 'from-purple-500 to-pink-500',
      color: '#a855f7'
    },
    {
      title: 'Blog Posts',
      value: stats.blogs.toLocaleString(),
      icon: FileText,
      gradient: 'from-emerald-500 to-teal-500',
      color: '#10b981'
    },
    {
      title: 'Projects',
      value: stats.projects.toLocaleString(),
      icon: Briefcase,
      gradient: 'from-red-500 to-rose-500',
      color: '#ef4444'
    }
  ]

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  return (
    <div className="space-y-4 sm:space-y-6 lg:space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-2 sm:mb-3">
          <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
            Profile
          </span>
        </h1>
        <p className="text-xs sm:text-sm md:text-base text-gray-600 dark:text-gray-400">
          Manage your account and view your statistics
        </p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-5 lg:gap-6">
        {/* Profile Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="lg:col-span-1"
        >
          <div className="bg-gradient-to-br from-white to-purple-50/50 dark:from-slate-800 dark:to-purple-900/20 p-4 sm:p-5 md:p-6 lg:p-8 rounded-xl sm:rounded-2xl border border-purple-200 dark:border-purple-500/30 shadow-xl">
            <div className="flex flex-col items-center text-center">
              {/* Avatar */}
              <motion.div
                className="w-24 h-24 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-2xl shadow-purple-500/50 mb-4"
                whileHover={{ scale: 1.05, rotate: 5 }}
              >
                <span className="text-white text-4xl font-bold">
                  {user?.username?.charAt(0).toUpperCase() || 'A'}
                </span>
              </motion.div>

              {/* User Info */}
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                {user?.username || 'Admin User'}
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-6 flex items-center gap-2">
                <Mail size={16} />
                {user?.email || 'admin@example.com'}
              </p>

              {/* Info Cards */}
              <div className="w-full space-y-3">
                <div className="flex items-center gap-3 p-3 bg-white/50 dark:bg-slate-700/50 rounded-xl">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center">
                    <Calendar size={18} className="text-white" />
                  </div>
                  <div className="flex-1 text-left">
                    <p className="text-xs text-gray-500 dark:text-gray-400">Member Since</p>
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">
                      {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 bg-white/50 dark:bg-slate-700/50 rounded-xl">
                  <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                    <Globe size={18} className="text-white" />
                  </div>
                  <div className="flex-1 text-left">
                    <p className="text-xs text-gray-500 dark:text-gray-400">Role</p>
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">
                      Administrator
                    </p>
                  </div>
                </div>
              </div>

              {/* Logout Button */}
              <motion.button
                onClick={handleLogout}
                className="mt-6 w-full px-6 py-3 bg-gradient-to-r from-red-500 to-rose-500 text-white rounded-xl font-semibold shadow-lg shadow-red-500/50 hover:shadow-red-500/70 transition-all flex items-center justify-center gap-2"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <LogOut size={18} />
                Logout
              </motion.button>
            </div>
          </div>
        </motion.div>

        {/* Stats and Activity */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="lg:col-span-2 space-y-6"
        >
          {/* Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            {statCards.map((stat, index) => {
              const Icon = stat.icon
              return (
                <motion.div
                  key={stat.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 + index * 0.05 }}
                  whileHover={{ scale: 1.03, y: -5 }}
                  className="relative bg-gradient-to-br from-white to-gray-50 dark:from-slate-800 dark:to-slate-900 p-4 sm:p-5 md:p-6 rounded-xl sm:rounded-2xl border border-gray-200 dark:border-gray-700 shadow-lg hover:shadow-2xl transition-all overflow-hidden group"
                >
                  <div 
                    className={`absolute top-0 right-0 w-32 h-32 rounded-full blur-3xl opacity-20 group-hover:opacity-30 transition-opacity bg-gradient-to-r ${stat.gradient}`}
                  />
                  <div className="relative z-10">
                    <div className="flex items-center justify-between mb-4">
                      <div className={`w-12 h-12 bg-gradient-to-r ${stat.gradient} rounded-xl flex items-center justify-center shadow-lg`}>
                        <Icon size={24} className="text-white" />
                      </div>
                    </div>
                    <p className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-2">
                      {stat.title}
                    </p>
                    <p 
                      className="text-3xl font-bold"
                      style={{ color: stat.color }}
                    >
                      {stat.value}
                    </p>
                  </div>
                </motion.div>
              )
            })}
          </div>

          {/* Quick Actions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-gradient-to-br from-white to-purple-50/50 dark:from-slate-800 dark:to-purple-900/20 p-4 sm:p-5 md:p-6 rounded-xl sm:rounded-2xl border border-purple-200 dark:border-purple-500/30 shadow-xl"
          >
            <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white mb-3 sm:mb-4 flex items-center gap-2">
              <Settings size={18} className="sm:w-5 sm:h-5" />
              Quick Actions
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              {[
                { name: 'View Analytics', href: '/dashboard/analytics', icon: BarChart3, color: 'from-blue-500 to-cyan-500' },
                { name: 'Manage Blog', href: '/dashboard/blog', icon: FileText, color: 'from-purple-500 to-pink-500' },
                { name: 'Manage Projects', href: '/dashboard/projects', icon: Briefcase, color: 'from-red-500 to-rose-500' },
                { name: 'View Leads', href: '/dashboard/leads', icon: Mail, color: 'from-emerald-500 to-teal-500' }
              ].map((action, index) => {
                const Icon = action.icon
                return (
                  <motion.a
                    key={action.name}
                    href={action.href}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 + index * 0.05 }}
                    whileHover={{ scale: 1.02, x: 5 }}
                    className={`p-4 bg-gradient-to-r ${action.color} rounded-xl text-white shadow-lg hover:shadow-2xl transition-all flex items-center gap-3`}
                  >
                    <Icon size={20} />
                    <span className="font-semibold">{action.name}</span>
                  </motion.a>
                )
              })}
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  )
}

