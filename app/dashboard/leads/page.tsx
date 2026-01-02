'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { leadsAPI } from '@/lib/api'
import toast from 'react-hot-toast'
import { X, Mail, User, MessageSquare, Globe, Calendar, FileText, Edit2 } from 'lucide-react'

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
        return 'bg-gradient-to-r from-green-500 to-emerald-500 text-white'
      case 'contacted':
        return 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white'
      case 'closed':
        return 'bg-gradient-to-r from-gray-400 to-gray-500 text-white'
      default:
        return 'bg-gradient-to-r from-gray-400 to-gray-500 text-white'
    }
  }

  return (
    <div className="space-y-4 sm:space-y-6 lg:space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-2 sm:mb-3">
          Lead <span className="bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">Management</span>
        </h1>
        <p className="text-xs sm:text-sm md:text-base text-gray-600 dark:text-gray-400">
          Manage and track your leads
        </p>
      </motion.div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-gradient-to-br from-white to-orange-50/50 dark:from-slate-800 dark:to-orange-900/20 p-4 sm:p-5 md:p-6 rounded-xl sm:rounded-2xl border border-orange-200 dark:border-orange-500/30 shadow-xl"
      >
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
          <input
            type="text"
            placeholder="Search leads..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value)
              setPagination({ ...pagination, page: 1 })
            }}
            className="flex-1 px-3 sm:px-4 py-2.5 sm:py-3 border-2 border-orange-200 dark:border-orange-500/30 bg-white dark:bg-slate-700 text-gray-900 dark:text-white text-sm sm:text-base rounded-lg sm:rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
          />
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value)
              setPagination({ ...pagination, page: 1 })
            }}
            className="px-3 sm:px-4 py-2.5 sm:py-3 border-2 border-orange-200 dark:border-orange-500/30 bg-white dark:bg-slate-700 text-gray-900 dark:text-white text-sm sm:text-base rounded-lg sm:rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
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
        <>
          {/* Leads Table - Full Width */}
          <div className="bg-gradient-to-br from-white to-orange-50/30 dark:from-slate-800 dark:to-orange-900/20 rounded-xl sm:rounded-2xl border border-orange-200 dark:border-orange-500/30 shadow-xl overflow-hidden">
            <div className="overflow-hidden">
              <table className="w-full table-auto">
                <thead className="bg-gradient-to-r from-orange-50 to-amber-50 dark:from-orange-900/30 dark:to-amber-900/30">
                  <tr>
                    <th className="text-left py-4 px-4 sm:px-6 text-xs sm:text-sm font-bold text-gray-900 dark:text-white whitespace-nowrap">Name</th>
                    <th className="text-left py-4 px-4 sm:px-6 text-xs sm:text-sm font-bold text-gray-900 dark:text-white whitespace-nowrap hidden sm:table-cell">Email</th>
                    <th className="text-left py-4 px-4 sm:px-6 text-xs sm:text-sm font-bold text-gray-900 dark:text-white whitespace-nowrap">Status</th>
                    <th className="text-left py-4 px-4 sm:px-6 text-xs sm:text-sm font-bold text-gray-900 dark:text-white whitespace-nowrap hidden md:table-cell">Date</th>
                    <th className="text-left py-4 px-4 sm:px-6 text-xs sm:text-sm font-bold text-gray-900 dark:text-white whitespace-nowrap">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {leads.map((lead) => (
                    <motion.tr
                      key={lead._id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="border-b border-orange-100 dark:border-orange-500/20 cursor-pointer hover:bg-orange-50/50 dark:hover:bg-orange-900/20 transition-colors"
                      onClick={() => {
                        setSelectedLead(lead)
                        setNotes(lead.notes || '')
                      }}
                      whileHover={{ backgroundColor: 'rgba(251, 146, 60, 0.1)' }}
                    >
                      <td className="py-4 px-4 sm:px-6">
                        <div>
                          <p className="text-sm font-semibold text-gray-900 dark:text-white">{lead.name}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 sm:hidden mt-1">{lead.email}</p>
                        </div>
                      </td>
                      <td className="py-4 px-4 sm:px-6 text-sm text-gray-600 dark:text-gray-400 hidden sm:table-cell">
                        <a 
                          href={`mailto:${lead.email}`}
                          onClick={(e) => e.stopPropagation()}
                          className="hover:text-orange-600 dark:hover:text-orange-400 transition-colors break-all"
                        >
                          {lead.email}
                        </a>
                      </td>
                      <td className="py-4 px-4 sm:px-6">
                        <span className={`px-3 py-1 rounded-lg text-xs font-semibold shadow-md whitespace-nowrap ${getStatusColor(lead.status)}`}>
                          {lead.status}
                        </span>
                      </td>
                      <td className="py-4 px-4 sm:px-6 text-xs sm:text-sm text-gray-500 dark:text-gray-400 hidden md:table-cell whitespace-nowrap">
                        {new Date(lead.createdAt).toLocaleDateString()}
                      </td>
                      <td className="py-4 px-4 sm:px-6">
                        <div className="flex gap-2 items-center">
                          <select
                            value={lead.status}
                            onChange={(e) => handleStatusUpdate(lead._id, e.target.value)}
                            onClick={(e) => e.stopPropagation()}
                            className="text-xs sm:text-sm px-2 sm:px-3 py-1.5 sm:py-2 border-2 border-orange-200 dark:border-orange-500/30 bg-white dark:bg-slate-700 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-orange-500 whitespace-nowrap"
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
                            className="px-2 sm:px-3 py-1.5 sm:py-2 bg-gradient-to-r from-red-500 to-rose-500 text-white rounded-lg font-semibold text-xs shadow-md whitespace-nowrap"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                          >
                            Delete
                          </motion.button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4 p-3 sm:p-4 md:p-6 border-t border-orange-200 dark:border-orange-500/20 bg-gradient-to-r from-orange-50/50 to-amber-50/50 dark:from-orange-900/10 dark:to-amber-900/10">
                <p className="text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-300 text-center sm:text-left">
                  Page {pagination.page} of {pagination.totalPages} ({pagination.total} total)
                </p>
                <div className="flex gap-2 w-full sm:w-auto">
                  <motion.button
                    onClick={() => setPagination({ ...pagination, page: pagination.page - 1 })}
                    disabled={pagination.page === 1}
                    className="flex-1 sm:flex-none px-4 sm:px-5 md:px-6 py-2 sm:py-2.5 bg-gradient-to-r from-gray-400 to-gray-500 text-white rounded-lg sm:rounded-xl font-semibold shadow-md text-xs sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                    whileHover={{ scale: pagination.page === 1 ? 1 : 1.02 }}
                    whileTap={{ scale: pagination.page === 1 ? 1 : 0.98 }}
                  >
                    Previous
                  </motion.button>
                  <motion.button
                    onClick={() => setPagination({ ...pagination, page: pagination.page + 1 })}
                    disabled={pagination.page === pagination.totalPages}
                    className="flex-1 sm:flex-none px-4 sm:px-5 md:px-6 py-2 sm:py-2.5 bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-lg sm:rounded-xl font-semibold shadow-md text-xs sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                    whileHover={{ scale: pagination.page === pagination.totalPages ? 1 : 1.02 }}
                    whileTap={{ scale: pagination.page === pagination.totalPages ? 1 : 0.98 }}
                  >
                    Next
                  </motion.button>
                </div>
              </div>
            )}
          </div>

          {/* Lead Details Modal */}
          <AnimatePresence>
            {selectedLead && (
              <>
                {/* Backdrop */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={() => setSelectedLead(null)}
                  className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
                />
                
                {/* Modal */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="fixed top-8 -translate-x-1/2 -translate-y-1/2 w-[95%] sm:w-[90%] md:w-[85%] lg:w-[80%] xl:w-[70%] max-w-4xl z-[60] bg-gradient-to-br from-white to-purple-50/50 dark:from-slate-800 dark:to-purple-900/20 rounded-xl sm:rounded-2xl border border-purple-200 dark:border-purple-500/30 shadow-2xl overflow-hidden flex flex-col max-h-[85vh] sm:max-h-[90vh]"
                >
                  {/* Header */}
                  <div className="flex justify-between items-center p-4 sm:p-6 border-b border-purple-200 dark:border-purple-500/20 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20">
                    <h3 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent flex items-center gap-2">
                      <User size={24} />
                      Lead Details
                    </h3>
                    <motion.button
                      onClick={() => setSelectedLead(null)}
                      className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                      whileHover={{ scale: 1.1, rotate: 90 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      <X size={20} />
                    </motion.button>
                  </div>

                  {/* Content - Scrollable */}
                  <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
                    {/* Name */}
                    <div className="p-4 sm:p-5 bg-white/70 dark:bg-slate-700/70 rounded-xl border border-purple-100 dark:border-purple-500/20">
                      <div className="flex items-center gap-2 mb-2">
                        <User size={18} className="text-purple-600 dark:text-purple-400" />
                        <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Name</p>
                      </div>
                      <p className="text-base sm:text-lg font-bold text-gray-900 dark:text-white">{selectedLead.name}</p>
                    </div>

                    {/* Email */}
                    <div className="p-4 sm:p-5 bg-white/70 dark:bg-slate-700/70 rounded-xl border border-purple-100 dark:border-purple-500/20">
                      <div className="flex items-center gap-2 mb-2">
                        <Mail size={18} className="text-purple-600 dark:text-purple-400" />
                        <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Email</p>
                      </div>
                      <a 
                        href={`mailto:${selectedLead.email}`}
                        className="text-base sm:text-lg text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 break-all transition-colors"
                      >
                        {selectedLead.email}
                      </a>
                    </div>

                    {/* Message */}
                    <div className="p-4 sm:p-5 bg-white/70 dark:bg-slate-700/70 rounded-xl border border-purple-100 dark:border-purple-500/20">
                      <div className="flex items-center gap-2 mb-3">
                        <MessageSquare size={18} className="text-purple-600 dark:text-purple-400" />
                        <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Message</p>
                      </div>
                      <div className="bg-gray-50 dark:bg-slate-800/50 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                        <p className="text-sm sm:text-base text-gray-900 dark:text-white whitespace-pre-wrap break-words">
                          {selectedLead.message}
                        </p>
                      </div>
                    </div>

                    {/* Info Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="p-4 sm:p-5 bg-white/70 dark:bg-slate-700/70 rounded-xl border border-purple-100 dark:border-purple-500/20">
                        <div className="flex items-center gap-2 mb-2">
                          <FileText size={18} className="text-purple-600 dark:text-purple-400" />
                          <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Page</p>
                        </div>
                        <p className="text-sm sm:text-base font-semibold text-gray-900 dark:text-white">{selectedLead.page}</p>
                      </div>
                      <div className="p-4 sm:p-5 bg-white/70 dark:bg-slate-700/70 rounded-xl border border-purple-100 dark:border-purple-500/20">
                        <div className="flex items-center gap-2 mb-2">
                          <Globe size={18} className="text-purple-600 dark:text-purple-400" />
                          <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Country</p>
                        </div>
                        <p className="text-sm sm:text-base font-semibold text-gray-900 dark:text-white">{selectedLead.country || 'Unknown'}</p>
                      </div>
                    </div>

                    {/* Status */}
                    <div className="p-4 sm:p-5 bg-white/70 dark:bg-slate-700/70 rounded-xl border border-purple-100 dark:border-purple-500/20">
                      <div className="flex items-center gap-2 mb-3">
                        <Edit2 size={18} className="text-purple-600 dark:text-purple-400" />
                        <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Status</p>
                      </div>
                      <select
                        value={selectedLead.status}
                        onChange={(e) => handleStatusUpdate(selectedLead._id, e.target.value)}
                        className="w-full px-4 py-2.5 border-2 border-purple-200 dark:border-purple-500/30 bg-white dark:bg-slate-700 text-gray-900 dark:text-white rounded-lg text-sm font-semibold focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                      >
                        <option value="new">New</option>
                        <option value="contacted">Contacted</option>
                        <option value="closed">Closed</option>
                      </select>
                    </div>

                    {/* Notes */}
                    <div className="p-4 sm:p-5 bg-white/70 dark:bg-slate-700/70 rounded-xl border border-purple-100 dark:border-purple-500/20">
                      <div className="flex items-center gap-2 mb-3">
                        <FileText size={18} className="text-purple-600 dark:text-purple-400" />
                        <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Notes</p>
                      </div>
                      <textarea
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        rows={4}
                        className="w-full px-4 py-3 border-2 border-purple-200 dark:border-purple-500/30 bg-white dark:bg-slate-700 text-gray-900 dark:text-white rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all text-sm sm:text-base"
                        placeholder="Add notes about this lead..."
                      />
                      <motion.button
                        onClick={() => handleNotesUpdate(selectedLead._id)}
                        className="mt-3 w-full px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all text-sm sm:text-base"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        Save Notes
                      </motion.button>
                    </div>

                    {/* Created Date */}
                    <div className="p-4 sm:p-5 bg-white/70 dark:bg-slate-700/70 rounded-xl border border-purple-100 dark:border-purple-500/20">
                      <div className="flex items-center gap-2 mb-2">
                        <Calendar size={18} className="text-purple-600 dark:text-purple-400" />
                        <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Created</p>
                      </div>
                      <p className="text-sm sm:text-base text-gray-900 dark:text-white">
                        {new Date(selectedLead.createdAt).toLocaleString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </>
      )}
    </div>
  )
}

