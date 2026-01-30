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
  imageAlt?: string
  link: string
  tags: string[]
  published: boolean
  // SEO Fields
  seoTitle?: string
  metaDescription?: string
  focusKeyword?: string
  canonicalUrl?: string
  robots?: {
    index: boolean
    follow: boolean
  }
  ogTitle?: string
  ogDescription?: string
  ogImage?: string
  twitterCard?: 'summary' | 'summary_large_image'
  schemaType?: 'BlogPosting' | 'Article'
  breadcrumbsEnabled?: boolean
  status?: 'draft' | 'published' | 'scheduled'
  publishedAt?: string
  scheduledAt?: string
  featured?: boolean
  allowComments?: boolean
}

interface BlogModalProps {
  blog: BlogPost | null
  onClose: () => void
}

export default function BlogModal({ blog, onClose }: BlogModalProps) {
  const [loading, setLoading] = useState(false)
  const [tagsString, setTagsString] = useState('')
  const [content, setContent] = useState(blog?.content || '')
  const [showSEO, setShowSEO] = useState(false)
  const [seoValidation, setSeoValidation] = useState<{errors: string[], warnings: string[]} | null>(null)
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
      imageAlt: '',
      link: '',
      tags: [],
      published: true,
      status: 'published',
      robots: { index: true, follow: true },
      twitterCard: 'summary_large_image',
      schemaType: 'BlogPosting',
      breadcrumbsEnabled: true,
      featured: false,
      allowComments: true
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
      const blogContent = blog.content || ''
      // Set content state immediately
      setContent(blogContent)
      
      setValue('slug', blog.slug)
      setValue('title', blog.title)
      setValue('excerpt', blog.excerpt)
      setValue('content', blogContent)
      setValue('date', blog.date.split('T')[0])
      setValue('readTime', blog.readTime)
      setValue('category', blog.category)
      setValue('image', blog.image)
      setValue('imageAlt', blog.imageAlt || '')
      setValue('link', blog.link)
      setValue('tags', blog.tags || [])
      setValue('published', blog.published)
      setValue('status', blog.status || (blog.published ? 'published' : 'draft'))
      setValue('seoTitle', blog.seoTitle || '')
      setValue('metaDescription', blog.metaDescription || '')
      setValue('focusKeyword', blog.focusKeyword || '')
      setValue('canonicalUrl', blog.canonicalUrl || '')
      setValue('robots', blog.robots || { index: true, follow: true })
      setValue('ogTitle', blog.ogTitle || '')
      setValue('ogDescription', blog.ogDescription || '')
      setValue('ogImage', blog.ogImage || '')
      setValue('twitterCard', blog.twitterCard || 'summary_large_image')
      setValue('schemaType', blog.schemaType || 'BlogPosting')
      setValue('breadcrumbsEnabled', blog.breadcrumbsEnabled !== undefined ? blog.breadcrumbsEnabled : true)
      setValue('featured', blog.featured || false)
      setValue('allowComments', blog.allowComments !== undefined ? blog.allowComments : true)
      setValue('publishedAt', blog.publishedAt ? blog.publishedAt.split('T')[0] : '')
      setValue('scheduledAt', blog.scheduledAt ? blog.scheduledAt.split('T')[0] : '')
      setTagsString((blog.tags || []).join(', '))
    } else {
      setTagsString('')
      setContent('')
      setValue('content', '')
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
        date: new Date(data.date).toISOString(),
        // Include SEO fields
        seoTitle: data.seoTitle || undefined,
        metaDescription: data.metaDescription || undefined,
        focusKeyword: data.focusKeyword || undefined,
        canonicalUrl: data.canonicalUrl || undefined,
        robots: data.robots || { index: true, follow: true },
        ogTitle: data.ogTitle || undefined,
        ogDescription: data.ogDescription || undefined,
        ogImage: data.ogImage || undefined,
        twitterCard: data.twitterCard || 'summary_large_image',
        schemaType: data.schemaType || 'BlogPosting',
        breadcrumbsEnabled: data.breadcrumbsEnabled !== undefined ? data.breadcrumbsEnabled : true,
        status: data.status || (data.published ? 'published' : 'draft'),
        featured: data.featured || false,
        allowComments: data.allowComments !== undefined ? data.allowComments : true,
        imageAlt: data.imageAlt || undefined,
        scheduledAt: data.status === 'scheduled' && data.scheduledAt ? new Date(data.scheduledAt).toISOString() : undefined
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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4">
      <div className="bg-white dark:bg-gray-800 max-w-4xl w-full max-h-[95vh] sm:max-h-[90vh] overflow-y-auto border border-gray-300 dark:border-gray-700 rounded-lg sm:rounded-xl">
        <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-3 sm:p-4 md:p-6 flex justify-between items-center">
          <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 dark:text-white">
            {blog ? 'Edit Blog Post' : 'Create New Blog Post'}
          </h2>
          <button
            onClick={onClose}
            className="px-2 sm:px-3 py-1 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 text-xs sm:text-sm font-medium rounded"
          >
            Close
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-3 sm:p-4 md:p-6 space-y-4 sm:space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Title *
              </label>
              <input
                {...register('title', { required: 'Title is required' })}
                type="text"
                className="w-full px-3 sm:px-4 py-2 sm:py-2.5 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm sm:text-base rounded-lg"
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
                className="w-full px-3 sm:px-4 py-2 sm:py-2.5 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm sm:text-base rounded-lg"
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
                key={blog?._id || 'new'}
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

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Category *
              </label>
              <input
                {...register('category', { required: 'Category is required' })}
                type="text"
                className="w-full px-3 sm:px-4 py-2 sm:py-2.5 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm sm:text-base rounded-lg"
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
                className="w-full px-3 sm:px-4 py-2 sm:py-2.5 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm sm:text-base rounded-lg"
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
                className="w-full px-3 sm:px-4 py-2 sm:py-2.5 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm sm:text-base rounded-lg"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Featured Image
            </label>
            <ImageUpload
              value={watch('image')}
              onChange={(url) => setValue('image', url)}
            />
            <div className="mt-2">
              <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                Image Alt Text (Required for SEO) *
              </label>
              <input
                {...register('imageAlt', { required: watch('image') ? 'Alt text is required when image is provided' : false })}
                type="text"
                placeholder="Describe the image for accessibility and SEO"
                className="w-full px-3 sm:px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
              />
              {errors.imageAlt && (
                <p className="mt-1 text-xs text-red-600">{errors.imageAlt.message}</p>
              )}
            </div>
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

          {/* Status and Publishing Controls */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Status *
              </label>
              <select
                {...register('status', { required: true })}
                className="w-full px-3 sm:px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm rounded-lg"
              >
                <option value="draft">Draft</option>
                <option value="published">Published</option>
                <option value="scheduled">Scheduled</option>
              </select>
            </div>
            {watch('status') === 'scheduled' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Schedule Date
                </label>
                <input
                  {...register('scheduledAt')}
                  type="datetime-local"
                  className="w-full px-3 sm:px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm rounded-lg"
                />
              </div>
            )}
            <div className="flex items-center gap-4">
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
                  {...register('allowComments')}
                  type="checkbox"
                  id="allowComments"
                  defaultChecked={true}
                  className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                />
                <label htmlFor="allowComments" className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                  Allow Comments
                </label>
              </div>
            </div>
          </div>

          {/* SEO Section - Collapsible */}
          <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
            <button
              type="button"
              onClick={() => setShowSEO(!showSEO)}
              className="w-full flex items-center justify-between text-left py-2 text-sm font-semibold text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
            >
              <span>SEO Settings {showSEO ? '▼' : '▶'}</span>
              <span className="text-xs text-gray-500">Optional</span>
            </button>
            
            {showSEO && (
              <div className="mt-4 space-y-4 pl-4 border-l-2 border-blue-200 dark:border-blue-800">
                {/* SEO Title & Meta Description */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      SEO Title
                      <span className="text-xs text-gray-500 ml-1">
                        ({watch('seoTitle')?.length || 0}/60)
                      </span>
                    </label>
                    <input
                      {...register('seoTitle', { 
                        maxLength: { value: 60, message: 'SEO title must be 60 characters or less' }
                      })}
                      type="text"
                      placeholder="Leave empty to use post title"
                      className="w-full px-3 sm:px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm rounded-lg"
                    />
                    {errors.seoTitle && (
                      <p className="mt-1 text-xs text-red-600">{errors.seoTitle.message}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Meta Description
                      <span className="text-xs text-gray-500 ml-1">
                        ({watch('metaDescription')?.length || 0}/160)
                      </span>
                    </label>
                    <textarea
                      {...register('metaDescription', { 
                        maxLength: { value: 160, message: 'Meta description must be 160 characters or less' }
                      })}
                      rows={2}
                      placeholder="Leave empty to use excerpt"
                      className="w-full px-3 sm:px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm rounded-lg"
                    />
                    {errors.metaDescription && (
                      <p className="mt-1 text-xs text-red-600">{errors.metaDescription.message}</p>
                    )}
                  </div>
                </div>

                {/* Focus Keyword & Canonical URL */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Focus Keyword
                    </label>
                    <input
                      {...register('focusKeyword')}
                      type="text"
                      placeholder="Main keyword for this post"
                      className="w-full px-3 sm:px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Canonical URL
                    </label>
                    <input
                      {...register('canonicalUrl')}
                      type="url"
                      placeholder="Leave empty to use default"
                      className="w-full px-3 sm:px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm rounded-lg"
                    />
                  </div>
                </div>

                {/* Robots Meta */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Robots Meta Tags
                  </label>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center">
                      <input
                        {...register('robots.index')}
                        type="checkbox"
                        id="robotsIndex"
                        defaultChecked={true}
                        className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                      />
                      <label htmlFor="robotsIndex" className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                        Index
                      </label>
                    </div>
                    <div className="flex items-center">
                      <input
                        {...register('robots.follow')}
                        type="checkbox"
                        id="robotsFollow"
                        defaultChecked={true}
                        className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                      />
                      <label htmlFor="robotsFollow" className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                        Follow
                      </label>
                    </div>
                  </div>
                </div>

                {/* Open Graph */}
                <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
                  <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Open Graph (Social Media)</h4>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                        OG Title
                      </label>
                      <input
                        {...register('ogTitle')}
                        type="text"
                        placeholder="Leave empty to use SEO title or post title"
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-xs rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                        OG Description
                      </label>
                      <textarea
                        {...register('ogDescription')}
                        rows={2}
                        placeholder="Leave empty to use meta description or excerpt"
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-xs rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                        OG Image URL
                      </label>
                      <input
                        {...register('ogImage')}
                        type="url"
                        placeholder="Leave empty to use featured image"
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-xs rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                        Twitter Card Type
                      </label>
                      <select
                        {...register('twitterCard')}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-xs rounded-lg"
                      >
                        <option value="summary">Summary</option>
                        <option value="summary_large_image">Summary Large Image</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Schema & Advanced */}
                <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
                  <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Schema & Advanced</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                        Schema Type
                      </label>
                      <select
                        {...register('schemaType')}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-xs rounded-lg"
                      >
                        <option value="BlogPosting">BlogPosting</option>
                        <option value="Article">Article</option>
                      </select>
                    </div>
                    <div className="flex items-center pt-6">
                      <input
                        {...register('breadcrumbsEnabled')}
                        type="checkbox"
                        id="breadcrumbsEnabled"
                        defaultChecked={true}
                        className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                      />
                      <label htmlFor="breadcrumbsEnabled" className="ml-2 text-xs text-gray-700 dark:text-gray-300">
                        Enable Breadcrumbs
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            )}
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
              {loading ? 'Saving...' : blog ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

