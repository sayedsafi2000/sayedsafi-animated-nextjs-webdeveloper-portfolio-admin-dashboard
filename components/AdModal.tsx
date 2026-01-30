'use client'

import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { adsAPI } from '@/lib/api'
import toast from 'react-hot-toast'
import ImageUpload from './ImageUpload'

interface Ad {
  _id?: string
  title: string
  description?: string
  image: string
  link: string
  priority: number
  startDate: string
  endDate: string
  status: 'draft' | 'active' | 'expired'
}

interface AdModalProps {
  ad: Ad | null
  onClose: () => void
}

export default function AdModal({ ad, onClose }: AdModalProps) {
  const [loading, setLoading] = useState(false)
  const { register, handleSubmit, formState: { errors }, setValue, watch } = useForm<Ad>({
    defaultValues: {
      title: '',
      description: '',
      image: '',
      link: '',
      priority: 0,
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      status: 'draft'
    }
  })

  useEffect(() => {
    if (ad) {
      setValue('title', ad.title)
      setValue('description', ad.description || '')
      setValue('image', ad.image)
      setValue('link', ad.link)
      setValue('priority', ad.priority)
      setValue('startDate', ad.startDate.split('T')[0])
      setValue('endDate', ad.endDate.split('T')[0])
      setValue('status', ad.status)
    }
  }, [ad, setValue])

  const onSubmit = async (data: Ad) => {
    setLoading(true)
    try {
      // Convert dates to ISO strings
      const adData = {
        ...data,
        startDate: new Date(data.startDate).toISOString(),
        endDate: new Date(data.endDate).toISOString(),
        priority: parseInt(data.priority.toString())
      }

      if (ad?._id) {
        await adsAPI.update(ad._id, adData)
        toast.success('Ad updated successfully')
      } else {
        await adsAPI.create(adData)
        toast.success('Ad created successfully')
      }
      onClose()
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to save ad')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4">
      <div className="bg-white dark:bg-gray-800 max-w-2xl w-full max-h-[95vh] sm:max-h-[90vh] overflow-y-auto border border-gray-300 dark:border-gray-700 rounded-lg sm:rounded-xl">
        <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-3 sm:p-4 md:p-6 flex justify-between items-center">
          <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 dark:text-white">
            {ad ? 'Edit Ad' : 'Create New Ad'}
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
              className="w-full px-3 sm:px-4 py-2 sm:py-2.5 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm sm:text-base rounded-lg"
              placeholder="e.g., Hostinger 20% Off"
            />
            {errors.title && (
              <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Description
            </label>
            <textarea
              {...register('description')}
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              placeholder="Optional description"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Affiliate/Referral Link *
            </label>
            <input
              {...register('link', { 
                required: 'Link is required',
                pattern: {
                  value: /^https?:\/\/.+/,
                  message: 'Please enter a valid URL starting with http:// or https://'
                }
              })}
              type="url"
              className="w-full px-3 sm:px-4 py-2 sm:py-2.5 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm sm:text-base rounded-lg"
              placeholder="https://example.com/ref=yourcode"
            />
            {errors.link && (
              <p className="mt-1 text-sm text-red-600">{errors.link.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Ad Image *
            </label>
            <ImageUpload
              value={watch('image')}
              onChange={(url) => setValue('image', url)}
            />
            {errors.image && (
              <p className="mt-1 text-sm text-red-600">{errors.image.message}</p>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Priority (0-100) *
              </label>
              <input
                {...register('priority', { 
                  required: 'Priority is required',
                  min: { value: 0, message: 'Priority must be 0 or higher' },
                  max: { value: 100, message: 'Priority must be 100 or lower' }
                })}
                type="number"
                min="0"
                max="100"
                className="w-full px-3 sm:px-4 py-2 sm:py-2.5 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm sm:text-base rounded-lg"
              />
              <p className="mt-1 text-xs text-gray-500">Higher priority ads appear first</p>
              {errors.priority && (
                <p className="mt-1 text-sm text-red-600">{errors.priority.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Status *
              </label>
              <select
                {...register('status', { required: true })}
                className="w-full px-3 sm:px-4 py-2 sm:py-2.5 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm sm:text-base rounded-lg"
              >
                <option value="draft">Draft</option>
                <option value="active">Active</option>
                <option value="expired">Expired</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Start Date *
              </label>
              <input
                {...register('startDate', { required: 'Start date is required' })}
                type="datetime-local"
                className="w-full px-3 sm:px-4 py-2 sm:py-2.5 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm sm:text-base rounded-lg"
              />
              {errors.startDate && (
                <p className="mt-1 text-sm text-red-600">{errors.startDate.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                End Date *
              </label>
              <input
                {...register('endDate', { required: 'End date is required' })}
                type="datetime-local"
                className="w-full px-3 sm:px-4 py-2 sm:py-2.5 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm sm:text-base rounded-lg"
              />
              {errors.endDate && (
                <p className="mt-1 text-sm text-red-600">{errors.endDate.message}</p>
              )}
            </div>
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
              {loading ? 'Saving...' : ad ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
