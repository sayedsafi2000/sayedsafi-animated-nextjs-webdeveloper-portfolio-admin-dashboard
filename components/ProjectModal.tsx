'use client'

import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { projectsAPI } from '@/lib/api'
import toast from 'react-hot-toast'
import ImageUpload from './ImageUpload'

interface Project {
  _id?: string
  title: string
  description: string
  category: string
  image: string
  tags: string[]
  link: string
  github: string | null
  featured: boolean
  isCustomCode: boolean
  order: number
}

interface ProjectModalProps {
  project: Project | null
  onClose: () => void
}

export default function ProjectModal({ project, onClose }: ProjectModalProps) {
  const [loading, setLoading] = useState(false)
  const [tagsString, setTagsString] = useState('')
  const { register, handleSubmit, formState: { errors }, setValue, watch } = useForm<Project>({
    defaultValues: {
      title: '',
      description: '',
      category: '',
      image: '',
      tags: [],
      link: '',
      github: null,
      featured: false,
      isCustomCode: true,
      order: 0
    }
  })

  useEffect(() => {
    if (project) {
      setValue('title', project.title)
      setValue('description', project.description)
      setValue('category', project.category)
      setValue('image', project.image)
      setValue('tags', project.tags || [])
      setValue('link', project.link)
      setValue('github', project.github || '')
      setValue('featured', project.featured)
      setValue('isCustomCode', project.isCustomCode)
      setValue('order', project.order)
      setTagsString((project.tags || []).join(', '))
    } else {
      setTagsString('')
    }
  }, [project, setValue])

  const onSubmit = async (data: Project) => {
    setLoading(true)
    try {
      // Validate image
      if (!data.image) {
        toast.error('Please upload an image')
        setLoading(false)
        return
      }

      // Convert tags string to array - handle both comma and comma+space
      const tags = tagsString
        .split(',')
        .map(tag => tag.trim())
        .filter(tag => tag.length > 0)

      const projectData = {
        ...data,
        tags,
        github: data.github || null
      }

      if (project?._id) {
        await projectsAPI.update(project._id, projectData)
        toast.success('Project updated successfully')
      } else {
        await projectsAPI.create(projectData)
        toast.success('Project created successfully')
      }
      onClose()
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to save project')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4">
      <div className="bg-white dark:bg-gray-800 max-w-3xl w-full max-h-[95vh] sm:max-h-[90vh] overflow-y-auto border border-gray-300 dark:border-gray-700 rounded-lg sm:rounded-xl">
        <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-3 sm:p-4 md:p-6 flex justify-between items-center">
          <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 dark:text-white">
            {project ? 'Edit Project' : 'Create New Project'}
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
              rows={4}
              className="w-full px-3 sm:px-4 py-2 sm:py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm sm:text-base"
            />
            {errors.description && (
              <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Category *
              </label>
              <input
                {...register('category', { required: 'Category is required' })}
                type="text"
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
              {errors.category && (
                <p className="mt-1 text-sm text-red-600">{errors.category.message}</p>
              )}
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

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Image *
            </label>
            <ImageUpload
              value={watch('image')}
              onChange={(url) => setValue('image', url, { shouldValidate: true })}
            />
            {errors.image && (
              <p className="mt-1 text-sm text-red-600">{errors.image.message}</p>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Link
              </label>
              <input
                {...register('link')}
                type="url"
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                GitHub URL
              </label>
              <input
                {...register('github')}
                type="url"
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Tags (comma-separated)
            </label>
            <input
              value={tagsString}
              onChange={(e) => {
                setTagsString(e.target.value)
              }}
              type="text"
              placeholder="React, Next.js, TypeScript"
              className="w-full px-3 sm:px-4 py-2 sm:py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm sm:text-base"
            />
          </div>

          <div className="flex flex-col sm:flex-row gap-3 sm:gap-6">
            <div className="flex items-center">
              <input
                {...register('featured')}
                type="checkbox"
                id="featured"
                className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
              />
              <label htmlFor="featured" className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                Featured
              </label>
            </div>

            <div className="flex items-center">
              <input
                {...register('isCustomCode')}
                type="checkbox"
                id="isCustomCode"
                className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
              />
              <label htmlFor="isCustomCode" className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                Custom Code (not WordPress)
              </label>
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
              {loading ? 'Saving...' : project ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

