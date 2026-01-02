'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { servicesAPI } from '@/lib/api'
import toast from 'react-hot-toast'
import { Plus, Edit, Trash2, Power, Briefcase, Check, Sparkles } from 'lucide-react'
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

const iconMap: Record<string, any> = {
  Code: Briefcase,
  Globe: Briefcase,
  Palette: Briefcase,
  Database: Briefcase,
  Mobile: Briefcase,
  Cloud: Briefcase,
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
        transition={{ duration: 0.5 }}
        className="flex justify-between items-center"
      >
        <div>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
            <span className="gradient-text">Services</span>
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manage your service offerings and features
          </p>
        </div>
        <motion.button
          onClick={handleCreate}
          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white rounded-xl shadow-lg hover:shadow-xl transition-all font-medium"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Plus size={20} />
          Add New Service
        </motion.button>
      </motion.div>

      {loading ? (
        <div className="text-center py-20">
          <motion.div
            className="inline-block"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          >
            <div className="w-16 h-16 border-4 border-pink-500 border-t-transparent rounded-full"></div>
          </motion.div>
        </div>
      ) : services.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center py-20 bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl border border-gray-200/50 dark:border-gray-700/50"
        >
          <Briefcase className="mx-auto text-gray-400 mb-4" size={48} />
          <p className="text-gray-600 dark:text-gray-400 text-lg">No services found</p>
          <p className="text-gray-500 dark:text-gray-500 text-sm mt-2">Create your first service to get started</p>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((service, index) => {
            const IconComponent = iconMap[service.icon] || Briefcase
            return (
              <motion.div
                key={service._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -8, scale: 1.02 }}
                className="group relative bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl border border-gray-200/50 dark:border-gray-700/50 shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden"
              >
                {/* Status indicator */}
                <div className="absolute top-4 right-4 z-10">
                  <motion.button
                    onClick={() => handleToggleActive(service)}
                    className={`px-3 py-1 rounded-full text-xs font-medium backdrop-blur-sm shadow-lg ${
                      service.active
                        ? 'bg-green-500/20 text-green-700 dark:text-green-400 border border-green-500/30'
                        : 'bg-gray-500/20 text-gray-700 dark:text-gray-400 border border-gray-500/30'
                    }`}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <div className="flex items-center gap-1">
                      <Power size={12} className={service.active ? 'fill-current' : ''} />
                      {service.active ? 'Active' : 'Inactive'}
                    </div>
                  </motion.button>
                </div>

                {/* Gradient header */}
                <div className={`h-32 bg-gradient-to-br ${service.color} relative overflow-hidden`}>
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent"
                    animate={{
                      scale: [1, 1.2, 1],
                      opacity: [0.3, 0.5, 0.3],
                    }}
                    transition={{
                      duration: 3,
                      repeat: Infinity,
                      ease: 'easeInOut',
                    }}
                  />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <motion.div
                      className="p-4 bg-white/20 dark:bg-black/20 backdrop-blur-sm rounded-2xl"
                      whileHover={{ rotate: 360, scale: 1.1 }}
                      transition={{ duration: 0.6 }}
                    >
                      <IconComponent className="text-white" size={32} />
                    </motion.div>
                  </div>
                </div>

                <div className="p-6">
                  {/* Title */}
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 group-hover:text-pink-600 dark:group-hover:text-pink-400 transition-colors">
                    {service.title}
                  </h3>

                  {/* Description */}
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
                    {service.description}
                  </p>

                  {/* Features */}
                  <div className="mb-4">
                    <p className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-1">
                      <Sparkles size={12} className="text-pink-500" />
                      Features:
                    </p>
                    <ul className="space-y-1">
                      {service.features.slice(0, 3).map((feature, idx) => (
                        <li key={idx} className="text-xs text-gray-600 dark:text-gray-400 flex items-center gap-2">
                          <Check size={12} className="text-green-500 flex-shrink-0" />
                          <span className="line-clamp-1">{feature}</span>
                        </li>
                      ))}
                      {service.features.length > 3 && (
                        <li className="text-xs text-gray-500 dark:text-gray-500 pl-4">
                          +{service.features.length - 3} more features
                        </li>
                      )}
                    </ul>
                  </div>

                  {/* Price and Actions */}
                  <div className="flex items-center justify-between pt-4 border-t border-gray-200/50 dark:border-gray-700/50">
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Price</p>
                      <p className="text-lg font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                        {service.price}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <motion.button
                        onClick={() => handleEdit(service)}
                        className="p-2 bg-gradient-to-r from-blue-500/10 to-cyan-500/10 text-blue-600 dark:text-blue-400 rounded-lg hover:from-blue-500/20 hover:to-cyan-500/20 transition-all"
                        whileHover={{ scale: 1.1, rotate: 5 }}
                        whileTap={{ scale: 0.9 }}
                      >
                        <Edit size={16} />
                      </motion.button>
                      <motion.button
                        onClick={() => handleDelete(service._id)}
                        className="p-2 bg-red-500/10 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-500/20 transition-all"
                        whileHover={{ scale: 1.1, rotate: -5 }}
                        whileTap={{ scale: 0.9 }}
                      >
                        <Trash2 size={16} />
                      </motion.button>
                    </div>
                  </div>
                </div>
              </motion.div>
            )
          })}
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
