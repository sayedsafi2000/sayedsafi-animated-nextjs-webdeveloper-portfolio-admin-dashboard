'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { blogAPI } from '@/lib/api'
import toast from 'react-hot-toast'
import BlogModal from '@/components/BlogModal'
import BlogPreviewModal from '@/components/BlogPreviewModal'

interface BlogPost {
  _id: string
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

export default function BlogPage() {
  const [blogs, setBlogs] = useState<BlogPost[]>([])
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false)
  const [editingBlog, setEditingBlog] = useState<BlogPost | null>(null)
  const [previewBlog, setPreviewBlog] = useState<BlogPost | null>(null)

  const fetchBlogs = async () => {
    try {
      setLoading(true)
      const response = await blogAPI.getAll({ limit: 100 })
      setBlogs(response.data.posts)
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to fetch blogs')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchBlogs()
  }, [])

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this blog post?')) return

    try {
      await blogAPI.delete(id)
      toast.success('Blog post deleted successfully')
      fetchBlogs()
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to delete blog post')
    }
  }

  const handleTogglePublish = async (blog: BlogPost, showPreview = false) => {
    try {
      if (showPreview) {
        try {
          const response = await blogAPI.getBySlug(blog.slug)
          setPreviewBlog(response.data.post)
          setIsPreviewModalOpen(true)
        } catch (error: any) {
          console.error('Failed to fetch full blog:', error)
          setPreviewBlog(blog)
          setIsPreviewModalOpen(true)
        }
        return
      }

      const newPublishedStatus = !blog.published
      await blogAPI.update(blog._id, { published: newPublishedStatus })
      toast.success(`Blog post ${newPublishedStatus ? 'published' : 'unpublished'} successfully`)
      
      setBlogs(blogs.map(b => 
        b._id === blog._id ? { ...b, published: newPublishedStatus } : b
      ))

      if (previewBlog && previewBlog._id === blog._id) {
        setPreviewBlog({ ...previewBlog, published: newPublishedStatus })
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update blog post')
    }
  }

  const handlePreviewClose = () => {
    setIsPreviewModalOpen(false)
    setPreviewBlog(null)
    fetchBlogs()
  }

  const handleEdit = (blog: BlogPost) => {
    setEditingBlog(blog)
    setIsModalOpen(true)
  }

  const handleCreate = () => {
    setEditingBlog(null)
    setIsModalOpen(true)
  }

  const handleModalClose = () => {
    setIsModalOpen(false)
    setEditingBlog(null)
    fetchBlogs()
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
            Blog <span className="text-blue-600 dark:text-blue-400">Posts</span>
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manage and create your blog content
          </p>
        </div>
        <motion.button
          onClick={handleCreate}
          className="px-6 py-3 bg-blue-600 text-white hover:bg-blue-700 transition-all font-medium"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          Add New Post
        </motion.button>
      </motion.div>

      {loading ? (
        <div className="text-center py-20">
          <div className="inline-block w-8 h-8 border-2 border-blue-600 border-t-transparent animate-spin"></div>
        </div>
      ) : blogs.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center py-20 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700"
        >
          <p className="text-gray-600 dark:text-gray-400 text-lg">No blog posts found</p>
          <p className="text-gray-500 dark:text-gray-500 text-sm mt-2">Create your first blog post to get started</p>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {blogs.map((blog, index) => (
            <motion.div
              key={blog._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              whileHover={{ scale: 1.02 }}
              className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 shadow-sm hover:shadow-md transition-all"
            >
              {/* Status indicator */}
              <div className={`px-3 py-1 text-xs font-medium ${
                blog.published
                  ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-400'
              }`}>
                {blog.published ? 'Published' : 'Draft'}
              </div>

              {/* Image */}
              <div className="relative h-48 overflow-hidden">
                {blog.image ? (
                  <img
                    src={blog.image}
                    alt={blog.title}
                    className="w-full h-full object-cover hover:scale-110 transition-transform duration-300"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement
                      target.src = '/api/placeholder/600/400'
                    }}
                  />
                ) : (
                  <div className="w-full h-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                    <span className="text-gray-400 text-sm">No Image</span>
                  </div>
                )}
              </div>

              <div className="p-6">
                {/* Category */}
                <div className="mb-3">
                  <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 text-xs font-medium">
                    {blog.category}
                  </span>
                </div>

                {/* Title */}
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 line-clamp-2">
                  {blog.title}
                </h3>

                {/* Excerpt */}
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
                  {blog.excerpt}
                </p>

                {/* Meta info */}
                <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400 mb-4">
                  <span>{new Date(blog.date).toLocaleDateString()}</span>
                  <span>{blog.readTime}</span>
                </div>

                {/* Tags */}
                {blog.tags && blog.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-4">
                    {blog.tags.slice(0, 3).map((tag) => (
                      <span
                        key={tag}
                        className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs"
                      >
                        {tag}
                      </span>
                    ))}
                    {blog.tags.length > 3 && (
                      <span className="px-2 py-1 text-gray-500 dark:text-gray-400 text-xs">
                        +{blog.tags.length - 3}
                      </span>
                    )}
                  </div>
                )}

                {/* Actions */}
                <div className="flex items-center gap-2 pt-4 border-t border-gray-300 dark:border-gray-700">
                  <motion.button
                    onClick={() => handleTogglePublish(blog, true)}
                    className="flex-1 px-3 py-2 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-all text-sm font-medium"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Preview
                  </motion.button>
                  <motion.button
                    onClick={() => handleEdit(blog)}
                    className="px-3 py-2 bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 hover:bg-purple-200 dark:hover:bg-purple-900/50 transition-all"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Edit
                  </motion.button>
                  <motion.button
                    onClick={() => handleTogglePublish(blog, false)}
                    className={`px-3 py-2 transition-all text-sm ${
                      blog.published
                        ? 'bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 hover:bg-orange-200 dark:hover:bg-orange-900/50'
                        : 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 hover:bg-green-200 dark:hover:bg-green-900/50'
                    }`}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    title={blog.published ? 'Unpublish' : 'Publish'}
                  >
                    {blog.published ? 'Unpublish' : 'Publish'}
                  </motion.button>
                  <motion.button
                    onClick={() => handleDelete(blog._id)}
                    className="px-3 py-2 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-900/50 transition-all"
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
        <BlogModal
          blog={editingBlog}
          onClose={handleModalClose}
        />
      )}

      {isPreviewModalOpen && previewBlog && (
        <BlogPreviewModal
          blog={previewBlog}
          onClose={handlePreviewClose}
          onTogglePublish={async () => {
            await handleTogglePublish(previewBlog, false)
            if (previewBlog) {
              try {
                const response = await blogAPI.getBySlug(previewBlog.slug)
                setPreviewBlog(response.data.post)
              } catch (error) {
                setPreviewBlog({ ...previewBlog, published: !previewBlog.published })
              }
            }
          }}
        />
      )}
    </div>
  )
}
