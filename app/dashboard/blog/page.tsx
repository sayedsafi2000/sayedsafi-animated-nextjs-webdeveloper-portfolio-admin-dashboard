'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { blogAPI } from '@/lib/api'
import toast from 'react-hot-toast'
import { Plus, Edit, Trash2, Eye, EyeOff, Calendar, Tag, BookOpen } from 'lucide-react'
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
        transition={{ duration: 0.5 }}
        className="flex justify-between items-center"
      >
        <div>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
            Blog <span className="gradient-text">Posts</span>
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manage and create your blog content
          </p>
        </div>
        <motion.button
          onClick={handleCreate}
          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white rounded-xl shadow-lg hover:shadow-xl transition-all font-medium"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Plus size={20} />
          Add New Post
        </motion.button>
      </motion.div>

      {loading ? (
        <div className="text-center py-20">
          <motion.div
            className="inline-block"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          >
            <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full"></div>
          </motion.div>
        </div>
      ) : blogs.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center py-20 bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl border border-gray-200/50 dark:border-gray-700/50"
        >
          <BookOpen className="mx-auto text-gray-400 mb-4" size={48} />
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
              transition={{ delay: index * 0.1 }}
              whileHover={{ y: -8, scale: 1.02 }}
              className="group relative bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl border border-gray-200/50 dark:border-gray-700/50 shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden"
            >
              {/* Status indicator */}
              <div className={`absolute top-4 right-4 z-10 px-3 py-1 rounded-full text-xs font-medium ${
                blog.published
                  ? 'bg-green-500/20 text-green-700 dark:text-green-400 border border-green-500/30'
                  : 'bg-gray-500/20 text-gray-700 dark:text-gray-400 border border-gray-500/30'
              }`}>
                {blog.published ? 'Published' : 'Draft'}
              </div>

              {/* Image */}
              <div className="relative h-48 overflow-hidden">
                {blog.image ? (
                  <img
                    src={blog.image}
                    alt={blog.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement
                      target.src = '/api/placeholder/600/400'
                    }}
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-blue-500/20 via-purple-500/20 to-pink-500/20 flex items-center justify-center">
                    <BookOpen className="text-gray-400" size={48} />
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>

              <div className="p-6">
                {/* Category */}
                <div className="flex items-center gap-2 mb-3">
                  <span className="px-3 py-1 bg-gradient-to-r from-blue-500/10 to-purple-500/10 text-blue-700 dark:text-blue-400 rounded-full text-xs font-medium border border-blue-500/20">
                    {blog.category}
                  </span>
                </div>

                {/* Title */}
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 line-clamp-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                  {blog.title}
                </h3>

                {/* Excerpt */}
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
                  {blog.excerpt}
                </p>

                {/* Meta info */}
                <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400 mb-4">
                  <div className="flex items-center gap-1">
                    <Calendar size={14} />
                    <span>{new Date(blog.date).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <BookOpen size={14} />
                    <span>{blog.readTime}</span>
                  </div>
                </div>

                {/* Tags */}
                {blog.tags && blog.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-4">
                    {blog.tags.slice(0, 3).map((tag) => (
                      <span
                        key={tag}
                        className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg text-xs flex items-center gap-1"
                      >
                        <Tag size={10} />
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
                <div className="flex items-center gap-2 pt-4 border-t border-gray-200/50 dark:border-gray-700/50">
                  <motion.button
                    onClick={() => handleTogglePublish(blog, true)}
                    className="flex-1 px-3 py-2 bg-gradient-to-r from-blue-500/10 to-cyan-500/10 text-blue-600 dark:text-blue-400 rounded-lg hover:from-blue-500/20 hover:to-cyan-500/20 transition-all flex items-center justify-center gap-2 text-sm font-medium"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Eye size={16} />
                    Preview
                  </motion.button>
                  <motion.button
                    onClick={() => handleEdit(blog)}
                    className="px-3 py-2 bg-gradient-to-r from-purple-500/10 to-pink-500/10 text-purple-600 dark:text-purple-400 rounded-lg hover:from-purple-500/20 hover:to-pink-500/20 transition-all"
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <Edit size={16} />
                  </motion.button>
                  <motion.button
                    onClick={() => handleTogglePublish(blog, false)}
                    className={`px-3 py-2 rounded-lg transition-all ${
                      blog.published
                        ? 'bg-orange-500/10 text-orange-600 dark:text-orange-400 hover:bg-orange-500/20'
                        : 'bg-green-500/10 text-green-600 dark:text-green-400 hover:bg-green-500/20'
                    }`}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    title={blog.published ? 'Unpublish' : 'Publish'}
                  >
                    {blog.published ? <EyeOff size={16} /> : <Eye size={16} />}
                  </motion.button>
                  <motion.button
                    onClick={() => handleDelete(blog._id)}
                    className="px-3 py-2 bg-red-500/10 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-500/20 transition-all"
                    whileHover={{ scale: 1.1, rotate: -5 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <Trash2 size={16} />
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
