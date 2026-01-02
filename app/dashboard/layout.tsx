'use client'

import ProtectedRoute from '@/components/ProtectedRoute'
import Sidebar from '@/components/Sidebar'
import Header from '@/components/Header'
import { motion } from 'framer-motion'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50/30 to-pink-50/30 dark:from-slate-950 dark:via-purple-950/30 dark:to-pink-950/30">
        <Sidebar />
        <div className="lg:pl-72">
          <Header />
          <motion.main
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="p-4 sm:p-5 md:p-6 lg:p-8 xl:p-10 min-h-[calc(100vh-4rem)] lg:min-h-[calc(100vh-5rem)] pt-20 sm:pt-6 lg:pt-8"
          >
            {children}
          </motion.main>
        </div>
      </div>
    </ProtectedRoute>
  )
}

