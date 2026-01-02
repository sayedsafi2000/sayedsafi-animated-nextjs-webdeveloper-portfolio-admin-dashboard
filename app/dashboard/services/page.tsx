'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { servicesAPI } from '@/lib/api'
import toast from 'react-hot-toast'
import ServiceModal from '@/components/ServiceModal'

interface Service {
  _id: string
  title: string
  description: string
  icon: string
  color: string
  features: string[]
  price: string
  order: number
  active: boolean
}

export default function ServicesPage() {
  const [services, setServices] = useState<Service[]>([])
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingService, setEditingService] = useState<Service | null>(null)

  const fetchServices = async () => {
    try {
      setLoading(true)
      const response = await servicesAPI.getAll({ limit: 100 })
      setServices(response.data.services)
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to fetch services')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchServices()
  }, [])

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this service?')) return

    try {
      await servicesAPI.delete(id)
      toast.success('Service deleted successfully')
      fetchServices()
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to delete service')
    }
  }

  const handleToggleActive = async (service: Service) => {
    try {
      await servicesAPI.update(service._id, { active: !service.active })
      toast.success(`Service ${service.active ? 'deactivated' : 'activated'} successfully`)
      fetchServices()
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update service')
    }
  }

  const handleEdit = (service: Service) => {
    setEditingService(service)
    setIsModalOpen(true)
  }

  const handleCreate = () => {
    setEditingService(null)
    setIsModalOpen(true)
  }

  const handleModalClose = () => {
    setIsModalOpen(false)
    setEditingService(null)
    fetchServices()
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
            <span className="bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent">Services</span>
          </h1>
          <p className="text-xs sm:text-sm md:text-base text-gray-600 dark:text-gray-400">
            Manage your service offerings and features
          </p>
        </div>
        <motion.button
          onClick={handleCreate}
          className="w-full sm:w-auto px-4 sm:px-5 md:px-6 py-2.5 sm:py-3 bg-gradient-to-r from-orange-600 to-amber-600 text-white hover:from-orange-700 hover:to-amber-700 transition-all font-semibold text-sm sm:text-base rounded-lg sm:rounded-xl shadow-lg shadow-orange-500/50"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          Add New Service
        </motion.button>
      </motion.div>

      {loading ? (
        <div className="text-center py-20">
          <div className="inline-block w-8 h-8 border-2 border-orange-600 border-t-transparent animate-spin"></div>
        </div>
      ) : services.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center py-20 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700"
        >
          <p className="text-gray-600 dark:text-gray-400 text-lg">No services found</p>
          <p className="text-gray-500 dark:text-gray-500 text-sm mt-2">Create your first service to get started</p>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-5 lg:gap-6">
          {services.map((service, index) => (
            <motion.div
              key={service._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              whileHover={{ scale: 1.03, y: -5 }}
              className="bg-gradient-to-br from-white to-gray-50 dark:from-slate-800 dark:to-slate-900 border border-gray-200 dark:border-gray-700 rounded-xl sm:rounded-2xl shadow-lg hover:shadow-2xl transition-all overflow-hidden"
            >
              {/* Status indicator */}
              <div className="px-4 py-2 flex items-center justify-between bg-gradient-to-r from-slate-50 to-gray-50 dark:from-slate-700 dark:to-slate-800">
                <button
                  onClick={() => handleToggleActive(service)}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                    service.active
                      ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg'
                      : 'bg-gradient-to-r from-gray-400 to-gray-500 text-white'
                  }`}
                >
                  {service.active ? '✓ Active' : '○ Inactive'}
                </button>
              </div>

              {/* Header with color */}
              <div 
                className="h-32 flex items-center justify-center relative overflow-hidden"
                style={{ 
                  background: `linear-gradient(135deg, ${service.color || '#ea580c'} 0%, ${service.color || '#f97316'}80 100%)`
                }}
              >
                <div className="absolute inset-0 bg-black/10"></div>
                <span className="relative text-white text-4xl font-bold z-10">
                  {service.title.charAt(0)}
                </span>
              </div>

              <div className="p-4 sm:p-6">
                {/* Title */}
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                  {service.title}
                </h3>

                {/* Description */}
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
                  {service.description}
                </p>

                {/* Features */}
                <div className="mb-4">
                  <p className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Features:
                  </p>
                  <ul className="space-y-1">
                    {service.features.slice(0, 3).map((feature, idx) => (
                      <li key={idx} className="text-xs text-gray-600 dark:text-gray-400">
                        • {feature}
                      </li>
                    ))}
                    {service.features.length > 3 && (
                      <li className="text-xs text-gray-500 dark:text-gray-500">
                        +{service.features.length - 3} more features
                      </li>
                    )}
                  </ul>
                </div>

                {/* Price and Actions */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Price</p>
                    <p 
                      className="text-lg sm:text-xl font-bold"
                      style={{ color: service.color || '#ea580c' }}
                    >
                      {service.price}
                    </p>
                  </div>
                  <div className="flex gap-2 w-full sm:w-auto">
                    <motion.button
                      onClick={() => handleEdit(service)}
                      className="flex-1 sm:flex-none px-3 sm:px-4 py-2 sm:py-2.5 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-lg font-semibold shadow-md text-xs sm:text-sm"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      Edit
                    </motion.button>
                    <motion.button
                      onClick={() => handleDelete(service._id)}
                      className="flex-1 sm:flex-none px-3 sm:px-4 py-2 sm:py-2.5 bg-gradient-to-r from-red-500 to-rose-500 text-white rounded-lg font-semibold shadow-md text-xs sm:text-sm"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      Delete
                    </motion.button>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {isModalOpen && (
        <ServiceModal
          service={editingService}
          onClose={handleModalClose}
        />
      )}
    </div>
  )
}
