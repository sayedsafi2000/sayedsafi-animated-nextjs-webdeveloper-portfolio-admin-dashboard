'use client'

import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { servicesAPI } from '@/lib/api'
import toast from 'react-hot-toast'

interface Service {
  _id?: string
  title: string
  description: string
  icon: string
  color: string
  features: string[]
  price: string
  order: number
  active: boolean
}

interface ServiceModalProps {
  service: Service | null
  onClose: () => void
}

const iconOptions = ['Code', 'Globe', 'Palette', 'Database', 'Mobile', 'Cloud']
const colorOptions = [
  'from-blue-500 to-cyan-500',
  'from-blue-600 to-blue-400',
  'from-purple-500 to-pink-500',
  'from-green-500 to-emerald-500',
  'from-orange-500 to-red-500',
  'from-indigo-500 to-purple-500'
]

export default function ServiceModal({ service, onClose }: ServiceModalProps) {
  const [loading, setLoading] = useState(false)
  const [featuresString, setFeaturesString] = useState('')
  const { register, handleSubmit, formState: { errors }, setValue } = useForm<Service>({
    defaultValues: {
      title: '',
      description: '',
      icon: 'Code',
      color: 'from-blue-500 to-cyan-500',
      features: [],
      price: 'Custom',
      order: 0,
      active: true
    }
  })

  useEffect(() => {
    if (service) {
      setValue('title', service.title)
      setValue('description', service.description)
      setValue('icon', service.icon)
      setValue('color', service.color)
      setValue('features', service.features || [])
      setValue('price', service.price)
      setValue('order', service.order)
      setValue('active', service.active)
      setFeaturesString((service.features || []).join('\n'))
    } else {
      setFeaturesString('')
    }
  }, [service, setValue])

  const onSubmit = async (data: Service) => {
    setLoading(true)
    try {
      // Convert features string to array - handle newline-separated
      const features = featuresString
        .split('\n')
        .map(feature => feature.trim())
        .filter(feature => feature.length > 0)

      const serviceData = {
        ...data,
        features
      }

      if (service?._id) {
        await servicesAPI.update(service._id, serviceData)
        toast.success('Service updated successfully')
      } else {
        await servicesAPI.create(serviceData)
        toast.success('Service created successfully')
      }
      onClose()
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to save service')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4">
      <div className="bg-white dark:bg-gray-800 max-w-2xl w-full max-h-[95vh] sm:max-h-[90vh] overflow-y-auto border border-gray-300 dark:border-gray-700 rounded-lg sm:rounded-xl">
        <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-3 sm:p-4 md:p-6 flex justify-between items-center">
          <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 dark:text-white">
            {service ? 'Edit Service' : 'Create New Service'}
          </h2>
          <button
            onClick={onClose}
            className="px-2 sm:px-3 py-1 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 text-xs sm:text-sm font-medium rounded"
          >
            Close
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-3 sm:p-4 md:p-6 space-y-4 sm:space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Title *
            </label>
            <input
              {...register('title', { required: 'Title is required' })}
              type="text"
              className="w-full px-3 sm:px-4 py-2 sm:py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm sm:text-base"
            />
            {errors.title && (
              <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Description *
            </label>
            <textarea
              {...register('description', { required: 'Description is required' })}
              rows={3}
              className="w-full px-3 sm:px-4 py-2 sm:py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm sm:text-base"
            />
            {errors.description && (
              <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Icon *
              </label>
              <select
                {...register('icon', { required: 'Icon is required' })}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                {iconOptions.map((icon) => (
                  <option key={icon} value={icon}>
                    {icon}
                  </option>
                ))}
              </select>
              {errors.icon && (
                <p className="mt-1 text-sm text-red-600">{errors.icon.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Color Gradient *
              </label>
              <select
                {...register('color', { required: 'Color is required' })}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                {colorOptions.map((color) => (
                  <option key={color} value={color}>
                    {color}
                  </option>
                ))}
              </select>
              {errors.color && (
                <p className="mt-1 text-sm text-red-600">{errors.color.message}</p>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Features (one per line)
            </label>
            <textarea
              value={featuresString}
              onChange={(e) => {
                setFeaturesString(e.target.value)
              }}
              rows={6}
              className="w-full px-3 sm:px-4 py-2 sm:py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm sm:text-base"
              placeholder="Feature 1&#10;Feature 2&#10;Feature 3"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Price
              </label>
              <input
                {...register('price')}
                type="text"
                placeholder="Custom"
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Order
              </label>
              <input
                {...register('order', { valueAsNumber: true })}
                type="number"
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
          </div>

          <div className="flex items-center">
            <input
              {...register('active')}
              type="checkbox"
              id="active"
              className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
            />
            <label htmlFor="active" className="ml-2 text-sm text-gray-700 dark:text-gray-300">
              Active
            </label>
          </div>

          <div className="flex flex-col sm:flex-row justify-end gap-2 sm:gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <button
              type="button"
              onClick={onClose}
              className="w-full sm:w-auto px-4 sm:px-6 py-2 sm:py-2.5 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg text-sm sm:text-base font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="w-full sm:w-auto px-4 sm:px-6 py-2 sm:py-2.5 bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 rounded-lg text-sm sm:text-base font-medium"
            >
              {loading ? 'Saving...' : service ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

