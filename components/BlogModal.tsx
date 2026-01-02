'use client'

import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { blogAPI } from '@/lib/api'
import toast from 'react-hot-toast'
import ImageUpload from './ImageUpload'
import dynamic from 'next/dynamic'

// Dynamically import ReactQuill to avoid SSR issues
const ReactQuill = dynamic(() => import('react-quill'), { ssr: false })

interface BlogPost {
  _id?: string
  slug: string
  title: string
  excerpt: string
  content?: string
  date: string
  readTime: string
  category: string
  image: string
  link: string
  tags: string[]
  published: boolean
}

interface BlogModalProps {
  blog: BlogPost | null
  onClose: () => void
}

export default function BlogModal({ blog, onClose }: BlogModalProps) {
  const [loading, setLoading] = useState(false)
  const [tagsString, setTagsString] = useState('')
  const [content, setContent] = useState('')
  const { register, handleSubmit, formState: { errors }, setValue, watch } = useForm<BlogPost>({
    defaultValues: {
      slug: '',
      title: '',
      excerpt: '',
      content: '',
      date: new Date().toISOString().split('T')[0],
      readTime: '5 min read',
      category: '',
      image: '',
      link: '',
      tags: [],
      published: true
    }
  })

  // Quill editor modules configuration
  const quillModules = {
    toolbar: [
      [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
      [{ 'font': [] }],
      [{ 'size': [] }],
      ['bold', 'italic', 'underline', 'strike', 'blockquote'],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }, { 'indent': '-1'}, { 'indent': '+1' }],
      ['link', 'image', 'video'],
      [{ 'color': [] }, { 'background': [] }],
      [{ 'align': [] }],
      ['code-block'],
      ['clean']
    ],
  }

  const quillFormats = [
    'header', 'font', 'size',
    'bold', 'italic', 'underline', 'strike', 'blockquote',
    'list', 'bullet', 'indent',
    'link', 'image', 'video',
    'color', 'background',
    'align',
    'code-block'
  ]

  useEffect(() => {
    if (blog) {
      setValue('slug', blog.slug)
      setValue('title', blog.title)
      setValue('excerpt', blog.excerpt)
      setValue('content', blog.content || '')
      setContent(blog.content || '')
      setValue('date', blog.date.split('T')[0])
      setValue('readTime', blog.readTime)
      setValue('category', blog.category)
      setValue('image', blog.image)
      setValue('link', blog.link)
      setValue('tags', blog.tags || [])
      setValue('published', blog.published)
      setTagsString((blog.tags || []).join(', '))
    } else {
      setTagsString('')
      setContent('')
    }
  }, [blog, setValue])

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')
  }

  const onSubmit = async (data: BlogPost) => {
    // Validate content
    if (!content || content.trim() === '' || content === '<p><br></p>') {
      toast.error('Content is required')
      return
    }

    setLoading(true)
    try {
      // Generate slug if not provided
      if (!data.slug) {
        data.slug = generateSlug(data.title)
      }

      // Convert tags string to array - handle both comma and comma+space
      const tags = tagsString
        .split(',')
        .map(tag => tag.trim())
        .filter(tag => tag.length > 0)

      const blogData = {
        ...data,
        content: content, // Use the content from Quill editor
        tags,
        date: new Date(data.date).toISOString()
      }

      if (blog?._id) {
        await blogAPI.update(blog._id, blogData)
        toast.success('Blog post updated successfully')
      } else {
        await blogAPI.create(blogData)
        toast.success('Blog post created successfully')
      }
      onClose()
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to save blog post')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 max-w-4xl w-full max-h-[90vh] overflow-y-auto border border-gray-300 dark:border-gray-700">
        <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-6 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            {blog ? 'Edit Blog Post' : 'Create New Blog Post'}
          </h2>
          <button
            onClick={onClose}
            className="px-3 py-1 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 text-sm font-medium"
          >
            Close
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Title *
              </label>
              <input
                {...register('title', { required: 'Title is required' })}
                type="text"
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
              {errors.title && (
                <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Slug
              </label>
              <input
                {...register('slug')}
                type="text"
                placeholder="Auto-generated from title"
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Excerpt *
            </label>
            <textarea
              {...register('excerpt', { required: 'Excerpt is required' })}
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
            {errors.excerpt && (
              <p className="mt-1 text-sm text-red-600">{errors.excerpt.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Content *
            </label>
            <div className="border border-gray-300 dark:border-gray-600 overflow-hidden">
              <ReactQuill
                theme="snow"
                value={content}
                onChange={(value) => {
                  setContent(value)
                  setValue('content', value)
                }}
                modules={quillModules}
                formats={quillFormats}
                placeholder="Start writing your blog post..."
                className="bg-white dark:bg-gray-800"
              />
            </div>
            {(!content || content.trim() === '' || content === '<p><br></p>') && (
              <p className="mt-1 text-sm text-red-600">Content is required</p>
            )}
          </div>

          <div className="grid grid-cols-3 gap-4">
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
                Date
              </label>
              <input
                {...register('date')}
                type="date"
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Read Time
              </label>
              <input
                {...register('readTime')}
                type="text"
                placeholder="5 min read"
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Image
            </label>
            <ImageUpload
              value={watch('image')}
              onChange={(url) => setValue('image', url)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Link
            </label>
            <input
              {...register('link')}
              type="url"
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
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
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>

          <div className="flex items-center">
            <input
              {...register('published')}
              type="checkbox"
              id="published"
              className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
            />
            <label htmlFor="published" className="ml-2 text-sm text-gray-700 dark:text-gray-300">
              Published
            </label>
          </div>

          <div className="flex justify-end gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Saving...' : blog ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

