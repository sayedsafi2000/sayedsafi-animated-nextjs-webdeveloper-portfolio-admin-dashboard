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
    <div className="space-y-8">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="flex justify-between items-center"
      >
        <div>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
            <span className="text-orange-600 dark:text-orange-400">Services</span>
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manage your service offerings and features
          </p>
        </div>
        <motion.button
          onClick={handleCreate}
          className="px-6 py-3 bg-orange-600 text-white hover:bg-orange-700 transition-all font-medium"
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((service, index) => (
            <motion.div
              key={service._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              whileHover={{ scale: 1.02 }}
              className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 shadow-sm hover:shadow-md transition-all"
            >
              {/* Status indicator */}
              <div className="px-3 py-1 text-xs font-medium flex items-center justify-between">
                <button
                  onClick={() => handleToggleActive(service)}
                  className={`px-2 py-1 ${
                    service.active
                      ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-400'
                  }`}
                >
                  {service.active ? 'Active' : 'Inactive'}
                </button>
              </div>

              {/* Header with color */}
              <div 
                className="h-24 flex items-center justify-center"
                style={{ backgroundColor: service.color || '#ea580c' }}
              >
                <span className="text-white text-2xl font-bold">
                  {service.title.charAt(0)}
                </span>
              </div>

              <div className="p-6">
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
                <div className="flex items-center justify-between pt-4 border-t border-gray-300 dark:border-gray-700">
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Price</p>
                    <p 
                      className="text-lg font-bold"
                      style={{ color: service.color || '#ea580c' }}
                    >
                      {service.price}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <motion.button
                      onClick={() => handleEdit(service)}
                      className="px-3 py-2 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-all text-sm"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      Edit
                    </motion.button>
                    <motion.button
                      onClick={() => handleDelete(service._id)}
                      className="px-3 py-2 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-900/50 transition-all text-sm"
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
