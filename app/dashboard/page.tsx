'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { blogAPI, projectsAPI, servicesAPI } from '@/lib/api'
import { BookOpen, FolderKanban, Briefcase, ArrowRight } from 'lucide-react'

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
      icon: BookOpen,
      gradient: 'from-blue-500 to-cyan-500',
      bgGradient: 'from-blue-500/10 to-cyan-500/10',
      href: '/dashboard/blog'
    },
    {
      title: 'Projects',
      value: stats.projects,
      icon: FolderKanban,
      gradient: 'from-purple-500 to-pink-500',
      bgGradient: 'from-purple-500/10 to-pink-500/10',
      href: '/dashboard/projects'
    },
    {
      title: 'Services',
      value: stats.services,
      icon: Briefcase,
      gradient: 'from-pink-500 to-rose-500',
      bgGradient: 'from-pink-500/10 to-rose-500/10',
      href: '/dashboard/services'
    }
  ]

  return (
    <div className="space-y-8">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
          Dashboard <span className="gradient-text">Overview</span>
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Welcome to your admin dashboard. Manage your content with ease.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {statCards.map((stat, index) => {
          const Icon = stat.icon
          return (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ y: -8, scale: 1.02 }}
              className="group relative"
            >
              <Link href={stat.href}>
                <div className="relative bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl p-6 border border-gray-200/50 dark:border-gray-700/50 shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden">
                  {/* Animated background gradient */}
                  <motion.div
                    className={`absolute inset-0 bg-gradient-to-br ${stat.bgGradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300`}
                    animate={{
                      scale: [1, 1.1, 1],
                    }}
                    transition={{
                      duration: 3,
                      repeat: Infinity,
                      ease: 'easeInOut',
                    }}
                  />
                  
                  <div className="relative z-10 flex items-center justify-between">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                        {stat.title}
                      </p>
                      <p className="text-4xl font-bold text-gray-900 dark:text-white">
                        {stats.loading ? (
                          <span className="inline-block w-12 h-8 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                        ) : (
                          stat.value
                        )}
                      </p>
                    </div>
                    <motion.div
                      className={`p-4 rounded-xl bg-gradient-to-br ${stat.gradient} shadow-lg`}
                      whileHover={{ rotate: 360, scale: 1.1 }}
                      transition={{ duration: 0.6 }}
                    >
                      <Icon className="text-white" size={28} />
                    </motion.div>
                  </div>
                  
                  {/* Hover arrow */}
                  <motion.div
                    className="absolute bottom-4 right-4 text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300"
                    initial={{ x: 0 }}
                    whileHover={{ x: 5 }}
                  >
                    <ArrowRight size={20} />
                  </motion.div>
                </div>
              </Link>
            </motion.div>
          )
        })}
      </div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl p-6 border border-gray-200/50 dark:border-gray-700/50 shadow-lg"
      >
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
          Quick Actions
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link href="/dashboard/blog">
            <motion.div
              className="p-4 rounded-xl bg-gradient-to-r from-blue-500/10 to-cyan-500/10 border border-blue-200/50 dark:border-blue-800/50 hover:from-blue-500/20 hover:to-cyan-500/20 transition-all cursor-pointer"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <BookOpen className="text-blue-600 dark:text-blue-400 mb-2" size={24} />
              <p className="font-medium text-gray-900 dark:text-white">Create Blog Post</p>
            </motion.div>
          </Link>
          <Link href="/dashboard/projects">
            <motion.div
              className="p-4 rounded-xl bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-200/50 dark:border-purple-800/50 hover:from-purple-500/20 hover:to-pink-500/20 transition-all cursor-pointer"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <FolderKanban className="text-purple-600 dark:text-purple-400 mb-2" size={24} />
              <p className="font-medium text-gray-900 dark:text-white">Add Project</p>
            </motion.div>
          </Link>
          <Link href="/dashboard/services">
            <motion.div
              className="p-4 rounded-xl bg-gradient-to-r from-pink-500/10 to-rose-500/10 border border-pink-200/50 dark:border-pink-800/50 hover:from-pink-500/20 hover:to-rose-500/20 transition-all cursor-pointer"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Briefcase className="text-pink-600 dark:text-pink-400 mb-2" size={24} />
              <p className="font-medium text-gray-900 dark:text-white">Manage Services</p>
            </motion.div>
          </Link>
        </div>
      </motion.div>
    </div>
  )
}
