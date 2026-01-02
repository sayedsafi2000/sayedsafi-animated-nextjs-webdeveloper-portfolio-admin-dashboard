'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { blogAPI, projectsAPI, servicesAPI } from '@/lib/api'

export default function DashboardPage() {
  const [stats, setStats] = useState({
    blogs: 0,
    projects: 0,
    services: 0,
    loading: true
  })

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [blogsRes, projectsRes, servicesRes] = await Promise.all([
          blogAPI.getAll({ limit: 1 }),
          projectsAPI.getAll({ limit: 1 }),
          servicesAPI.getAll({ limit: 1 })
        ])

        setStats({
          blogs: blogsRes.data.pagination.total,
          projects: projectsRes.data.pagination.total,
          services: servicesRes.data.pagination.total,
          loading: false
        })
      } catch (error) {
        console.error('Error fetching stats:', error)
        setStats(prev => ({ ...prev, loading: false }))
      }
    }

    fetchStats()
  }, [])

  const statCards = [
    {
      title: 'Blog Posts',
      value: stats.blogs,
      color: '#2563eb',
      bgColor: '#dbeafe',
      darkBgColor: '#1e3a8a',
      href: '/dashboard/blog'
    },
    {
      title: 'Projects',
      value: stats.projects,
      color: '#dc2626',
      bgColor: '#fee2e2',
      darkBgColor: '#991b1b',
      href: '/dashboard/projects'
    },
    {
      title: 'Services',
      value: stats.services,
      color: '#ea580c',
      bgColor: '#ffedd5',
      darkBgColor: '#9a3412',
      href: '/dashboard/services'
    }
  ]

  const quickActions = [
    {
      title: 'Create Blog Post',
      href: '/dashboard/blog',
      color: '#2563eb',
      bgColor: '#dbeafe',
      darkBgColor: '#1e3a8a'
    },
    {
      title: 'Add Project',
      href: '/dashboard/projects',
      color: '#dc2626',
      bgColor: '#fee2e2',
      darkBgColor: '#991b1b'
    },
    {
      title: 'Manage Services',
      href: '/dashboard/services',
      color: '#ea580c',
      bgColor: '#ffedd5',
      darkBgColor: '#9a3412'
    }
  ]

  return (
    <div className="space-y-4 sm:space-y-6 lg:space-y-8">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-3 sm:mb-2">
          Dashboard <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">Overview</span>
        </h1>
        <p className="text-xs sm:text-sm md:text-base text-gray-600 dark:text-gray-400">
          Welcome to your admin dashboard. Manage your content with ease.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-5 lg:gap-6">
        {statCards.map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            whileHover={{ scale: 1.03, y: -5 }}
          >
            <Link href={stat.href}>
              <div 
                className="relative bg-gradient-to-br from-white to-gray-50 dark:from-slate-800 dark:to-slate-900 p-4 sm:p-5 md:p-6 rounded-xl sm:rounded-2xl border border-gray-200 dark:border-gray-700 shadow-lg hover:shadow-2xl transition-all overflow-hidden group"
              >
                {/* Gradient overlay */}
                <div 
                  className="absolute top-0 right-0 w-32 h-32 rounded-full blur-3xl opacity-20 group-hover:opacity-30 transition-opacity"
                  style={{ backgroundColor: stat.color }}
                />
                <div className="relative z-10">
                  <p className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-3">
                    {stat.title}
                  </p>
                  <p 
                    className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-2"
                    style={{ color: stat.color }}
                  >
                    {stats.loading ? (
                      <span className="inline-block w-16 h-10 bg-gray-200 dark:bg-gray-700 animate-pulse rounded" />
                    ) : (
                      stat.value
                    )}
                  </p>
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-2 h-2 rounded-full animate-pulse"
                      style={{ backgroundColor: stat.color }}
                    />
                    <span className="text-xs text-gray-500 dark:text-gray-400">Active</span>
                  </div>
                </div>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-gradient-to-br from-white to-purple-50/50 dark:from-slate-800 dark:to-purple-900/20 p-4 sm:p-5 md:p-6 rounded-xl sm:rounded-2xl border border-purple-200 dark:border-purple-500/30 shadow-xl"
      >
        <h2 className="text-lg sm:text-xl md:text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-4 sm:mb-6">
          Quick Actions
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          {quickActions.map((action, index) => (
            <Link key={action.title} href={action.href}>
              <motion.div
                className="relative p-4 sm:p-5 bg-gradient-to-br from-white to-gray-50 dark:from-slate-700 dark:to-slate-800 rounded-lg sm:rounded-xl border border-gray-200 dark:border-gray-600 hover:shadow-xl transition-all overflow-hidden group"
                whileHover={{ scale: 1.02, y: -3 }}
                whileTap={{ scale: 0.98 }}
              >
                <div 
                  className="absolute left-0 top-0 bottom-0 w-1 rounded-r-full"
                  style={{ backgroundColor: action.color }}
                />
                <div 
                  className="absolute top-0 right-0 w-20 h-20 rounded-full blur-2xl opacity-10 group-hover:opacity-20 transition-opacity"
                  style={{ backgroundColor: action.color }}
                />
                <p 
                  className="relative z-10 font-semibold text-base"
                  style={{ color: action.color }}
                >
                  {action.title}
                </p>
              </motion.div>
            </Link>
          ))}
        </div>
      </motion.div>
    </div>
  )
}
