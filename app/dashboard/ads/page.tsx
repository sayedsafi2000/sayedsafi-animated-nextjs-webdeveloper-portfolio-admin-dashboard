'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { adsAPI } from '@/lib/api'
import toast from 'react-hot-toast'
import AdModal from '@/components/AdModal'
import ImageUpload from '@/components/ImageUpload'

interface Ad {
  _id: string
  title: string
  description?: string
  image: string
  link: string
  priority: number
  startDate: string
  endDate: string
  status: 'draft' | 'active' | 'expired'
  clicks: number
  impressions: number
  createdAt: string
  updatedAt: string
}

export default function AdsPage() {
  const [ads, setAds] = useState<Ad[]>([])
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingAd, setEditingAd] = useState<Ad | null>(null)

  const fetchAds = async () => {
    try {
      setLoading(true)
      const response = await adsAPI.getAll()
      setAds(response.data.ads)
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to fetch ads')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAds()
  }, [])

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this ad?')) return

    try {
      await adsAPI.delete(id)
      toast.success('Ad deleted successfully')
      fetchAds()
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to delete ad')
    }
  }

  const handleEdit = (ad: Ad) => {
    setEditingAd(ad)
    setIsModalOpen(true)
  }

  const handleCreate = () => {
    setEditingAd(null)
    setIsModalOpen(true)
  }

  const handleModalClose = () => {
    setIsModalOpen(false)
    setEditingAd(null)
    fetchAds()
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300'
      case 'expired':
        return 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300'
      case 'draft':
        return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300'
      default:
        return 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300'
    }
  }

  const isCurrentlyActive = (ad: Ad) => {
    const now = new Date()
    const start = new Date(ad.startDate)
    const end = new Date(ad.endDate)
    return ad.status === 'active' && start <= now && end >= now
  }

  return (
    <div className="space-y-4 sm:space-y-6 lg:space-y-8">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4"
      >
        <div className="flex-1 min-w-0">
          <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-2 sm:mb-3">
            Ad <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Management</span>
          </h1>
          <p className="text-xs sm:text-sm md:text-base text-gray-600 dark:text-gray-400">
            Manage your blog advertisements and affiliate links
          </p>
        </div>
        <motion.button
          onClick={handleCreate}
          className="w-full sm:w-auto px-4 sm:px-5 md:px-6 py-2.5 sm:py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 transition-all font-semibold text-sm sm:text-base rounded-lg sm:rounded-xl shadow-lg shadow-blue-500/50"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          Add New Ad
        </motion.button>
      </motion.div>

      {loading ? (
        <div className="text-center py-20">
          <div className="inline-block w-8 h-8 border-2 border-blue-600 border-t-transparent animate-spin"></div>
        </div>
      ) : ads.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center py-20 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl"
        >
          <p className="text-gray-600 dark:text-gray-400 text-lg">No ads found</p>
          <p className="text-gray-500 dark:text-gray-500 text-sm mt-2">Create your first ad to get started</p>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          {ads.map((ad, index) => (
            <motion.div
              key={ad._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              whileHover={{ scale: 1.02, y: -5 }}
              className="bg-gradient-to-br from-white to-gray-50 dark:from-slate-800 dark:to-slate-900 border border-gray-200 dark:border-gray-700 rounded-xl sm:rounded-2xl shadow-lg hover:shadow-2xl transition-all overflow-hidden"
            >
              {/* Status indicator */}
              <div className={`px-4 py-2 text-xs font-semibold flex items-center justify-between ${
                getStatusColor(ad.status)
              }`}>
                <span>{ad.status.charAt(0).toUpperCase() + ad.status.slice(1)}</span>
                {isCurrentlyActive(ad) && (
                  <span className="ml-2 px-2 py-0.5 bg-green-500 text-white rounded-full text-xs">LIVE</span>
                )}
              </div>

              {/* Ad Preview */}
              <div className="p-4 sm:p-6">
                <div className="mb-4">
                  <div className="relative h-32 sm:h-40 bg-gray-200 dark:bg-gray-700 rounded-lg overflow-hidden mb-3">
                    {ad.image ? (
                      <img
                        src={ad.image}
                        alt={ad.title}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement
                          target.src = '/api/placeholder/400/200'
                        }}
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                        <span className="text-gray-400 text-sm">No Image</span>
                      </div>
                    )}
                  </div>
                  
                  <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white mb-2 line-clamp-2">
                    {ad.title}
                  </h3>
                  
                  {ad.description && (
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
                      {ad.description}
                    </p>
                  )}
                </div>

                {/* Ad Details */}
                <div className="space-y-2 mb-4 text-xs sm:text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-500 dark:text-gray-400">Priority:</span>
                    <span className="font-semibold text-gray-900 dark:text-white">{ad.priority}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-500 dark:text-gray-400">Start Date:</span>
                    <span className="text-gray-900 dark:text-white">
                      {new Date(ad.startDate).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-500 dark:text-gray-400">End Date:</span>
                    <span className="text-gray-900 dark:text-white">
                      {new Date(ad.endDate).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-500 dark:text-gray-400">Clicks:</span>
                    <span className="font-semibold text-blue-600 dark:text-blue-400">{ad.clicks}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-500 dark:text-gray-400">Impressions:</span>
                    <span className="font-semibold text-purple-600 dark:text-purple-400">{ad.impressions}</span>
                  </div>
                  <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
                    <a
                      href={ad.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 dark:text-blue-400 hover:underline text-xs break-all"
                    >
                      {ad.link}
                    </a>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <motion.button
                    onClick={() => handleEdit(ad)}
                    className="flex-1 px-3 sm:px-4 py-2 sm:py-2.5 bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600 transition-all text-xs sm:text-sm font-semibold rounded-lg shadow-md"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Edit
                  </motion.button>
                  <motion.button
                    onClick={() => handleDelete(ad._id)}
                    className="px-3 py-2 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-900/50 transition-all text-xs sm:text-sm font-semibold rounded-lg"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Delete
                  </motion.button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {isModalOpen && (
        <AdModal
          ad={editingAd}
          onClose={handleModalClose}
        />
      )}
    </div>
  )
}
