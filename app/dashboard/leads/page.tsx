'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { leadsAPI } from '@/lib/api'
import toast from 'react-hot-toast'

interface Lead {
  _id: string
  name: string
  email: string
  message: string
  page: string
  country: string
  status: 'new' | 'contacted' | 'closed'
  notes?: string
  createdAt: string
  contactedAt?: string
  contactedBy?: {
    username: string
    email: string
  }
}

export default function LeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('')
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null)
  const [notes, setNotes] = useState('')
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 1
  })

  const fetchLeads = async () => {
    try {
      setLoading(true)
      const response = await leadsAPI.getAll({
        page: pagination.page,
        limit: pagination.limit,
        status: statusFilter || undefined,
        search: search || undefined,
        sortBy: 'createdAt',
        sortOrder: 'desc'
      })
      setLeads(response.data.leads)
      setPagination(response.data.pagination)
    } catch (error: any) {
      console.error('Error fetching leads:', error)
      toast.error('Failed to fetch leads')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchLeads()
  }, [pagination.page, statusFilter, search])

  const handleStatusUpdate = async (leadId: string, newStatus: string) => {
    try {
      await leadsAPI.update(leadId, { status: newStatus })
      toast.success('Lead status updated')
      fetchLeads()
      if (selectedLead?._id === leadId) {
        setSelectedLead(null)
      }
    } catch (error) {
      toast.error('Failed to update lead status')
    }
  }

  const handleNotesUpdate = async (leadId: string) => {
    try {
      await leadsAPI.update(leadId, { notes })
      toast.success('Notes updated')
      fetchLeads()
      setSelectedLead(null)
      setNotes('')
    } catch (error) {
      toast.error('Failed to update notes')
    }
  }

  const handleDelete = async (leadId: string) => {
    if (!confirm('Are you sure you want to delete this lead?')) return

    try {
      await leadsAPI.delete(leadId)
      toast.success('Lead deleted')
      fetchLeads()
      if (selectedLead?._id === leadId) {
        setSelectedLead(null)
      }
    } catch (error) {
      toast.error('Failed to delete lead')
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new':
        return 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
      case 'contacted':
        return 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400'
      case 'closed':
        return 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-400'
      default:
        return 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-400'
    }
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="flex justify-between items-center"
      >
        <div>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
            Lead <span className="text-orange-600 dark:text-orange-400">Management</span>
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manage and track your leads
          </p>
        </div>
      </motion.div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white dark:bg-gray-800 p-4 border border-gray-300 dark:border-gray-700"
      >
        <div className="flex gap-4">
          <input
            type="text"
            placeholder="Search leads..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value)
              setPagination({ ...pagination, page: 1 })
            }}
            className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          />
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value)
              setPagination({ ...pagination, page: 1 })
            }}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            <option value="">All Status</option>
            <option value="new">New</option>
            <option value="contacted">Contacted</option>
            <option value="closed">Closed</option>
          </select>
        </div>
      </motion.div>

      {/* Leads Table */}
      {loading ? (
        <div className="text-center py-20">
          <div className="inline-block w-8 h-8 border-2 border-orange-600 border-t-transparent animate-spin"></div>
        </div>
      ) : leads.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center py-20 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700"
        >
          <p className="text-gray-600 dark:text-gray-400 text-lg">No leads found</p>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Leads List */}
          <div className="lg:col-span-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-700">
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-700 dark:text-gray-300">Name</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-700 dark:text-gray-300">Email</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-700 dark:text-gray-300">Status</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-700 dark:text-gray-300">Date</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-700 dark:text-gray-300">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {leads.map((lead) => (
                    <tr
                      key={lead._id}
                      className={`border-b border-gray-100 dark:border-gray-800 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 ${
                        selectedLead?._id === lead._id ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                      }`}
                      onClick={() => {
                        setSelectedLead(lead)
                        setNotes(lead.notes || '')
                      }}
                    >
                      <td className="py-3 px-4 text-sm text-gray-900 dark:text-white font-medium">
                        {lead.name}
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-400">
                        {lead.email}
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-1 text-xs font-medium ${getStatusColor(lead.status)}`}>
                          {lead.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-500 dark:text-gray-500">
                        {new Date(lead.createdAt).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex gap-2">
                          <select
                            value={lead.status}
                            onChange={(e) => handleStatusUpdate(lead._id, e.target.value)}
                            onClick={(e) => e.stopPropagation()}
                            className="text-xs px-2 py-1 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                          >
                            <option value="new">New</option>
                            <option value="contacted">Contacted</option>
                            <option value="closed">Closed</option>
                          </select>
                          <motion.button
                            onClick={(e) => {
                              e.stopPropagation()
                              handleDelete(lead._id)
                            }}
                            className="px-2 py-1 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-900/50 transition-all text-xs"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                          >
                            Delete
                          </motion.button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="flex items-center justify-between p-4 border-t border-gray-200 dark:border-gray-700">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Page {pagination.page} of {pagination.totalPages} ({pagination.total} total)
                </p>
                <div className="flex gap-2">
                  <motion.button
                    onClick={() => setPagination({ ...pagination, page: pagination.page - 1 })}
                    disabled={pagination.page === 1}
                    className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-all text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                    whileHover={{ scale: pagination.page === 1 ? 1 : 1.02 }}
                    whileTap={{ scale: pagination.page === 1 ? 1 : 0.98 }}
                  >
                    Previous
                  </motion.button>
                  <motion.button
                    onClick={() => setPagination({ ...pagination, page: pagination.page + 1 })}
                    disabled={pagination.page === pagination.totalPages}
                    className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-all text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                    whileHover={{ scale: pagination.page === pagination.totalPages ? 1 : 1.02 }}
                    whileTap={{ scale: pagination.page === pagination.totalPages ? 1 : 0.98 }}
                  >
                    Next
                  </motion.button>
                </div>
              </div>
            )}
          </div>

          {/* Lead Details */}
          {selectedLead && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white dark:bg-gray-800 p-6 border border-gray-300 dark:border-gray-700 space-y-4"
            >
              <div className="flex justify-between items-start">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                  Lead Details
                </h3>
                <button
                  onClick={() => setSelectedLead(null)}
                  className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                >
                  Close
                </button>
              </div>

              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Name</p>
                <p className="text-gray-900 dark:text-white">{selectedLead.name}</p>
              </div>

              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Email</p>
                <p className="text-gray-900 dark:text-white">{selectedLead.email}</p>
              </div>

              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Message</p>
                <p className="text-gray-900 dark:text-white whitespace-pre-wrap">{selectedLead.message}</p>
              </div>

              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Page</p>
                <p className="text-gray-900 dark:text-white">{selectedLead.page}</p>
              </div>

              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Country</p>
                <p className="text-gray-900 dark:text-white">{selectedLead.country}</p>
              </div>

              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Status</p>
                <span className={`px-2 py-1 text-xs font-medium ${getStatusColor(selectedLead.status)}`}>
                  {selectedLead.status}
                </span>
              </div>

              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">Notes</p>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="Add notes..."
                />
                <motion.button
                  onClick={() => handleNotesUpdate(selectedLead._id)}
                  className="mt-2 px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 transition-all text-sm font-medium"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Save Notes
                </motion.button>
              </div>

              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Created</p>
                <p className="text-gray-900 dark:text-white text-sm">
                  {new Date(selectedLead.createdAt).toLocaleString()}
                </p>
              </div>
            </motion.div>
          )}
        </div>
      )}
    </div>
  )
}

