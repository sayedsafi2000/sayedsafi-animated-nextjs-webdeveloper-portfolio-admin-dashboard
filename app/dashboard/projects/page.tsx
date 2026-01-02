'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { projectsAPI } from '@/lib/api'
import toast from 'react-hot-toast'
import ProjectModal from '@/components/ProjectModal'

interface Project {
  _id: string
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

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingProject, setEditingProject] = useState<Project | null>(null)

  const fetchProjects = async () => {
    try {
      setLoading(true)
      const response = await projectsAPI.getAll({ limit: 100 })
      setProjects(response.data.projects)
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to fetch projects')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchProjects()
  }, [])

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this project?')) return

    try {
      await projectsAPI.delete(id)
      toast.success('Project deleted successfully')
      fetchProjects()
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to delete project')
    }
  }

  const handleEdit = (project: Project) => {
    setEditingProject(project)
    setIsModalOpen(true)
  }

  const handleCreate = () => {
    setEditingProject(null)
    setIsModalOpen(true)
  }

  const handleModalClose = () => {
    setIsModalOpen(false)
    setEditingProject(null)
    fetchProjects()
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
            <span className="text-red-600 dark:text-red-400">Projects</span>
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Showcase your amazing work and projects
          </p>
        </div>
        <motion.button
          onClick={handleCreate}
          className="px-6 py-3 bg-red-600 text-white hover:bg-red-700 transition-all font-medium"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          Add New Project
        </motion.button>
      </motion.div>

      {loading ? (
        <div className="text-center py-20">
          <div className="inline-block w-8 h-8 border-2 border-red-600 border-t-transparent animate-spin"></div>
        </div>
      ) : projects.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center py-20 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700"
        >
          <p className="text-gray-600 dark:text-gray-400 text-lg">No projects found</p>
          <p className="text-gray-500 dark:text-gray-500 text-sm mt-2">Create your first project to get started</p>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project, index) => (
            <motion.div
              key={project._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              whileHover={{ scale: 1.02 }}
              className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 shadow-sm hover:shadow-md transition-all"
            >
              {/* Featured badge */}
              {project.featured && (
                <div className="px-3 py-1 bg-yellow-500 text-white text-xs font-bold">
                  Featured
                </div>
              )}

              {/* Type badge */}
              <div className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-xs font-medium">
                {project.isCustomCode ? 'Custom Code' : 'WordPress'}
              </div>

              {/* Image */}
              <div className="relative h-56 overflow-hidden">
                {project.image ? (
                  <img
                    src={project.image}
                    alt={project.title}
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
                  <span className="px-3 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 text-xs font-medium">
                    {project.category}
                  </span>
                </div>

                {/* Title */}
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 line-clamp-2">
                  {project.title}
                </h3>

                {/* Description */}
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
                  {project.description}
                </p>

                {/* Tags */}
                {project.tags && project.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-4">
                    {project.tags.slice(0, 4).map((tag) => (
                      <span
                        key={tag}
                        className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs"
                      >
                        {tag}
                      </span>
                    ))}
                    {project.tags.length > 4 && (
                      <span className="px-2 py-1 text-gray-500 dark:text-gray-400 text-xs">
                        +{project.tags.length - 4}
                      </span>
                    )}
                  </div>
                )}

                {/* Links */}
                <div className="flex gap-2 mb-4">
                  {project.link && (
                    <a
                      href={project.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-all text-sm"
                    >
                      View Live
                    </a>
                  )}
                  {project.github && (
                    <a
                      href={project.github}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-all text-sm"
                    >
                      GitHub
                    </a>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 pt-4 border-t border-gray-300 dark:border-gray-700">
                  <motion.button
                    onClick={() => handleEdit(project)}
                    className="flex-1 px-4 py-2 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-all text-sm font-medium"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Edit
                  </motion.button>
                  <motion.button
                    onClick={() => handleDelete(project._id)}
                    className="px-4 py-2 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-900/50 transition-all"
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
        <ProjectModal
          project={editingProject}
          onClose={handleModalClose}
        />
      )}
    </div>
  )
}
