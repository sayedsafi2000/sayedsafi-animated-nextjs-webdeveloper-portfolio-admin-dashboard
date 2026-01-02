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
    <div className="space-y-8">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
          Dashboard <span className="text-blue-600 dark:text-blue-400">Overview</span>
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Welcome to your admin dashboard. Manage your content with ease.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {statCards.map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            whileHover={{ scale: 1.02 }}
          >
            <Link href={stat.href}>
              <div 
                className="bg-white dark:bg-gray-800 p-6 border border-gray-300 dark:border-gray-700 shadow-sm hover:shadow-md transition-all"
                style={{ borderLeft: `4px solid ${stat.color}` }}
              >
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
                  {stat.title}
                </p>
                <p 
                  className="text-4xl font-bold"
                  style={{ color: stat.color }}
                >
                  {stats.loading ? (
                    <span className="inline-block w-12 h-8 bg-gray-200 dark:bg-gray-700 animate-pulse" />
                  ) : (
                    stat.value
                  )}
                </p>
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
        className="bg-white dark:bg-gray-800 p-6 border border-gray-300 dark:border-gray-700 shadow-sm"
      >
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
          Quick Actions
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {quickActions.map((action, index) => (
            <Link key={action.title} href={action.href}>
              <motion.div
                className="p-4 border border-gray-300 dark:border-gray-700 hover:shadow-md transition-all"
                style={{ borderLeft: `4px solid ${action.color}` }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <p 
                  className="font-medium"
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
