'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import { 
  LayoutDashboard, 
  BarChart3, 
  Users, 
  FileText, 
  Briefcase, 
  Settings,
  LogOut,
  Menu,
  X
} from 'lucide-react'

import { User } from 'lucide-react'

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard, gradient: 'from-blue-500 to-cyan-500', color: '#3b82f6' },
  { name: 'Analytics', href: '/dashboard/analytics', icon: BarChart3, gradient: 'from-emerald-500 to-teal-500', color: '#10b981' },
  { name: 'Leads', href: '/dashboard/leads', icon: Users, gradient: 'from-orange-500 to-red-500', color: '#f97316' },
  { name: 'Blog Posts', href: '/dashboard/blog', icon: FileText, gradient: 'from-purple-500 to-pink-500', color: '#a855f7' },
  { name: 'Projects', href: '/dashboard/projects', icon: Briefcase, gradient: 'from-red-500 to-rose-500', color: '#ef4444' },
  { name: 'Services', href: '/dashboard/services', icon: Settings, gradient: 'from-amber-500 to-orange-500', color: '#f59e0b' },
  { name: 'Profile', href: '/dashboard/profile', icon: User, gradient: 'from-indigo-500 to-purple-500', color: '#6366f1' },
]

export default function Sidebar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [isDesktop, setIsDesktop] = useState(false)
  const pathname = usePathname()
  const router = useRouter()

  // Check if desktop on mount and resize
  useEffect(() => {
    const checkDesktop = () => {
      setIsDesktop(window.innerWidth >= 1024)
    }
    checkDesktop()
    window.addEventListener('resize', checkDesktop)
    return () => window.removeEventListener('resize', checkDesktop)
  }, [])

  // Close mobile menu when route changes
  useEffect(() => {
    setMobileMenuOpen(false)
  }, [pathname])

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    toast.success('Logged out successfully')
    router.push('/login')
  }

  return (
    <>
      {/* Mobile menu button */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 dark:from-indigo-900 dark:via-purple-900 dark:to-pink-900 p-4 shadow-xl border-b border-white/10">
        <div className="flex items-center justify-between">
          <motion.div
            className="flex items-center gap-2"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center border border-white/30">
              <span className="text-white text-lg font-bold">SS</span>
            </div>
            <span className="text-white font-bold text-lg">Admin</span>
          </motion.div>
          <motion.button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="text-white hover:bg-white/20 p-2 rounded-lg transition-colors"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </motion.button>
        </div>
      </div>

      {/* Sidebar */}
      <motion.div
        initial={false}
        animate={{ 
          x: isDesktop ? 0 : (mobileMenuOpen ? 0 : -320)
        }}
        transition={{ type: 'spring', damping: 30, stiffness: 300 }}
        className="fixed inset-y-0 left-0 z-40 w-72 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 dark:from-slate-950 dark:via-purple-950 dark:to-slate-950 shadow-2xl border-r border-purple-500/20"
      >
          <div className="flex flex-col h-full">
            {/* Logo - Desktop */}
            <div className="hidden lg:flex items-center justify-center h-24 px-6 border-b border-purple-500/20">
              <motion.div
                className="flex items-center gap-3"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
              >
                <div className="w-14 h-14 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg shadow-purple-500/50">
                  <span className="text-white text-xl font-bold">SS</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xl font-bold bg-gradient-to-r from-blue-400 to-pink-400 bg-clip-text text-transparent">
                    Admin Panel
                  </span>
                  <span className="text-xs text-purple-300/70">Dashboard Control</span>
                </div>
              </motion.div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
              {navigation.map((item, index) => {
                const isActive = pathname === item.href
                const Icon = item.icon
                return (
                  <motion.div
                    key={item.name}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Link
                      href={item.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`group relative flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 ${
                        isActive
                          ? `bg-gradient-to-r ${item.gradient} shadow-lg shadow-${item.gradient.split('-')[1]}-500/50`
                          : 'hover:bg-white/5 hover:backdrop-blur-sm'
                      }`}
                    >
                      {isActive && (
                        <motion.div
                          layoutId="activeTab"
                          className="absolute inset-0 bg-gradient-to-r opacity-100 rounded-xl"
                          style={{
                            background: `linear-gradient(to right, ${item.color}22, ${item.color}11)`
                          }}
                          transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                        />
                      )}
                      <div className={`relative z-10 ${isActive ? 'text-white' : 'text-purple-200 group-hover:text-white'}`}>
                        <Icon size={20} className={isActive ? 'text-white' : 'text-purple-300 group-hover:text-white'} />
                      </div>
                      <span 
                        className={`relative z-10 font-semibold transition-colors ${
                          isActive 
                            ? 'text-white' 
                            : 'text-purple-200 group-hover:text-white'
                        }`}
                      >
                        {item.name}
                      </span>
                      {isActive && (
                        <motion.div
                          className="absolute right-2 w-2 h-2 bg-white rounded-full"
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ delay: 0.2 }}
                        />
                      )}
                    </Link>
                  </motion.div>
                )
              })}
            </nav>

            {/* Logout */}
            <div className="p-4 border-t border-purple-500/20">
              <motion.button
                onClick={handleLogout}
                className="flex items-center gap-3 w-full px-4 py-3 text-red-400 hover:bg-red-500/20 rounded-xl transition-all group"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <LogOut size={20} className="group-hover:rotate-12 transition-transform" />
                <span className="font-semibold">Logout</span>
              </motion.button>
            </div>
          </div>
        </motion.div>

      {/* Overlay for mobile */}
      <AnimatePresence>
        {mobileMenuOpen && !isDesktop && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="lg:hidden fixed inset-0 bg-black/70 backdrop-blur-sm z-30"
            onClick={() => setMobileMenuOpen(false)}
          />
        )}
      </AnimatePresence>
    </>
  )
}
