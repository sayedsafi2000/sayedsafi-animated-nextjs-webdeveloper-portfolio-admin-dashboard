'use client'

import DOMPurify from 'dompurify'
import { useEffect, useState } from 'react'

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

interface BlogPreviewModalProps {
  blog: BlogPost
  onClose: () => void
  onTogglePublish: () => void
}

export default function BlogPreviewModal({ blog, onClose, onTogglePublish }: BlogPreviewModalProps) {
  const [sanitizedContent, setSanitizedContent] = useState('')

  useEffect(() => {
    if (blog.content) {
      // Sanitize HTML content for safe rendering
      const clean = DOMPurify.sanitize(blog.content, {
        ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'u', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'ul', 'ol', 'li', 'blockquote', 'a', 'img', 'code', 'pre', 'span', 'div'],
        ALLOWED_ATTR: ['href', 'src', 'alt', 'class', 'style', 'target', 'rel']
      })
      setSanitizedContent(clean)
    } else {
      setSanitizedContent('')
    }
  }, [blog.content])

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 max-w-4xl w-full max-h-[90vh] overflow-y-auto border border-gray-300 dark:border-gray-700">
        <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-6 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Blog Post Preview
            </h2>
            <span className={`px-3 py-1 text-xs font-medium ${
              blog.published
                ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200'
            }`}>
              {blog.published ? 'Published' : 'Draft'}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onTogglePublish}
              className={`px-3 py-1 text-sm transition-colors ${
                blog.published
                  ? 'bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 hover:bg-orange-200 dark:hover:bg-orange-900/50'
                  : 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 hover:bg-green-200 dark:hover:bg-green-900/50'
              }`}
            >
              {blog.published ? 'Unpublish' : 'Publish'}
            </button>
            <button
              onClick={onClose}
              className="px-3 py-1 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 text-sm font-medium"
            >
              Close
            </button>
          </div>
        </div>

        <div className="p-6">
          {/* Image */}
          {blog.image && (
            <div className="mb-6 overflow-hidden">
              <img
                src={blog.image}
                alt={blog.title}
                className="w-full h-64 object-cover"
                onError={(e) => {
                  const target = e.target as HTMLImageElement
                  target.style.display = 'none'
                }}
              />
            </div>
          )}

          {/* Category */}
          <div className="mb-4">
            <span className="px-3 py-1 text-sm font-medium bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200">
              {blog.category}
            </span>
          </div>

          {/* Title */}
          <h1 className="text-4xl font-bold mb-4 text-gray-900 dark:text-white">
            {blog.title}
          </h1>

          {/* Meta Info */}
          <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400 mb-6">
            <span>{formatDate(blog.date)}</span>
            <span>{blog.readTime}</span>
          </div>

          {/* Excerpt */}
          <p className="text-lg text-gray-700 dark:text-gray-300 mb-6 leading-relaxed">
            {blog.excerpt}
          </p>

          {/* Tags */}
          {blog.tags && blog.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-6">
              {blog.tags.map((tag) => (
                <span
                  key={tag}
                  className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-sm"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}

          {/* Content */}
          <div className="prose dark:prose-invert max-w-none">
            {sanitizedContent ? (
              <div 
                className="text-gray-700 dark:text-gray-300 leading-relaxed blog-content"
                dangerouslySetInnerHTML={{ __html: sanitizedContent }}
              />
            ) : (
              <p className="text-gray-500 dark:text-gray-400 italic">Content is loading or not available...</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

