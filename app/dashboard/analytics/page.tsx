'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { analyticsAPI, leadsAPI } from '@/lib/api'
import toast from 'react-hot-toast'

interface OverviewStats {
  totalVisits: number
  uniqueVisitors: number
  totalLeads: number
  newLeads: number
  totalEvents: number
}

interface TrafficData {
  date: string
  visits: number
  uniqueVisitors: number
}

interface CountryData {
  country: string
  countryCode: string
  visits: number
  uniqueVisitors: number
}

interface RecentVisit {
  _id: string
  page: string
  path: string
  device: string
  browser: string
  country: string
  countryCode?: string
  timestamp: string
}

interface RecentLead {
  _id: string
  name: string
  email: string
  message: string
  page: string
  country: string
  status: string
  createdAt: string
}

export default function AnalyticsPage() {
  const [loading, setLoading] = useState(true)
  const [overview, setOverview] = useState<OverviewStats | null>(null)
  const [traffic, setTraffic] = useState<TrafficData[]>([])
  const [countries, setCountries] = useState<CountryData[]>([])
  const [recentVisits, setRecentVisits] = useState<RecentVisit[]>([])
  const [recentLeads, setRecentLeads] = useState<RecentLead[]>([])
  const [dateRange, setDateRange] = useState({
    startDate: '',
    endDate: ''
  })

  const fetchData = async () => {
    try {
      setLoading(true)
      const params = {
        ...(dateRange.startDate && { startDate: dateRange.startDate }),
        ...(dateRange.endDate && { endDate: dateRange.endDate })
      }

      const [overviewRes, trafficRes, countriesRes, visitsRes, leadsRes] = await Promise.all([
        analyticsAPI.getOverview(params),
        analyticsAPI.getTraffic({ ...params, period: 'daily' }),
        analyticsAPI.getCountries({ ...params, limit: 10 }),
        analyticsAPI.getRecentVisits({ limit: 10 }),
        leadsAPI.getAll({ page: 1, limit: 10, sortBy: 'createdAt', sortOrder: 'desc' })
      ])

      setOverview(overviewRes.data)
      setTraffic(trafficRes.data.traffic || [])
      setCountries(countriesRes.data.countries || [])
      setRecentVisits(visitsRes.data.visits || [])
      setRecentLeads(leadsRes.data.leads || [])
    } catch (error: any) {
      console.error('Error fetching analytics:', error)
      toast.error('Failed to fetch analytics data')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [dateRange])

  const handleExportVisits = async () => {
    try {
      const blob = await analyticsAPI.exportVisits({
        ...(dateRange.startDate && { startDate: dateRange.startDate }),
        ...(dateRange.endDate && { endDate: dateRange.endDate })
      })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `visits-${new Date().toISOString().split('T')[0]}.csv`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
      toast.success('Visits exported successfully')
    } catch (error) {
      toast.error('Failed to export visits')
    }
  }

  const handleExportLeads = async () => {
    try {
      const blob = await analyticsAPI.exportLeads()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `leads-${new Date().toISOString().split('T')[0]}.csv`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
      toast.success('Leads exported successfully')
    } catch (error) {
      toast.error('Failed to export leads')
    }
  }

  const statCards = overview ? [
    {
      title: 'Total Visits',
      value: overview.totalVisits.toLocaleString(),
      color: '#2563eb'
    },
    {
      title: 'Unique Visitors',
      value: overview.uniqueVisitors.toLocaleString(),
      color: '#dc2626'
    },
    {
      title: 'Total Leads',
      value: overview.totalLeads.toLocaleString(),
      color: '#ea580c'
    },
    {
      title: 'Total Events',
      value: overview.totalEvents.toLocaleString(),
      color: '#9333ea'
    }
  ] : []

  return (
    <div className="space-y-4 sm:space-y-6 lg:space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4"
      >
        <div className="flex-1 min-w-0">
          <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-2 sm:mb-3">
            Analytics <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Dashboard</span>
          </h1>
          <p className="text-xs sm:text-sm md:text-base text-gray-600 dark:text-gray-400">
            Track visitors, leads, and events
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 w-full sm:w-auto">
          <motion.button
            onClick={handleExportVisits}
            className="w-full sm:w-auto px-4 sm:px-5 md:px-6 py-2.5 sm:py-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-lg sm:rounded-xl font-semibold shadow-lg shadow-blue-500/50 hover:shadow-blue-500/70 transition-all text-xs sm:text-sm"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            Export Visits
          </motion.button>
          <motion.button
            onClick={handleExportLeads}
            className="w-full sm:w-auto px-4 sm:px-5 md:px-6 py-2.5 sm:py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg sm:rounded-xl font-semibold shadow-lg shadow-purple-500/50 hover:shadow-purple-500/70 transition-all text-xs sm:text-sm"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            Export Leads
          </motion.button>
        </div>
      </motion.div>

      {/* Date Range Filter */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-gradient-to-br from-white to-purple-50/50 dark:from-slate-800 dark:to-purple-900/20 p-4 sm:p-5 md:p-6 rounded-xl sm:rounded-2xl border border-purple-200 dark:border-purple-500/30 shadow-xl"
      >
        <h3 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white mb-3 sm:mb-4 flex items-center gap-2">
          📅 Date Range Filter
        </h3>
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 items-end">
          <div className="flex-1 w-full">
            <label className="block text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Start Date
            </label>
            <input
              type="date"
              value={dateRange.startDate}
              onChange={(e) => setDateRange({ ...dateRange, startDate: e.target.value })}
              className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border-2 border-purple-200 dark:border-purple-500/30 bg-white dark:bg-slate-700 text-gray-900 dark:text-white text-sm sm:text-base rounded-lg sm:rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
            />
          </div>
          <div className="flex-1 w-full">
            <label className="block text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              End Date
            </label>
            <input
              type="date"
              value={dateRange.endDate}
              onChange={(e) => setDateRange({ ...dateRange, endDate: e.target.value })}
              className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border-2 border-purple-200 dark:border-purple-500/30 bg-white dark:bg-slate-700 text-gray-900 dark:text-white text-sm sm:text-base rounded-lg sm:rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
            />
          </div>
          <motion.button
            onClick={() => setDateRange({ startDate: '', endDate: '' })}
            className="w-full sm:w-auto px-4 sm:px-5 md:px-6 py-2.5 sm:py-3 bg-gradient-to-r from-gray-400 to-gray-500 text-white rounded-lg sm:rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all text-xs sm:text-sm"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            Clear
          </motion.button>
        </div>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-3">
          💡 Click on the date fields to open the calendar picker
        </p>
      </motion.div>

      {/* Overview Cards */}
      {loading ? (
        <div className="text-center py-20">
          <div className="inline-block w-8 h-8 border-2 border-blue-600 border-t-transparent animate-spin"></div>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-5 lg:gap-6">
            {statCards.map((stat, index) => (
              <motion.div
                key={stat.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                whileHover={{ scale: 1.03, y: -5 }}
                className="relative bg-gradient-to-br from-white to-gray-50 dark:from-slate-800 dark:to-slate-900 p-4 sm:p-5 md:p-6 rounded-xl sm:rounded-2xl border border-gray-200 dark:border-gray-700 shadow-lg hover:shadow-2xl transition-all overflow-hidden group"
              >
                <div 
                  className="absolute top-0 right-0 w-32 h-32 rounded-full blur-3xl opacity-20 group-hover:opacity-30 transition-opacity"
                  style={{ backgroundColor: stat.color }}
                />
                <div className="relative z-10">
                  <p className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-3">
                    {stat.title}
                  </p>
                  <p 
                    className="text-3xl sm:text-4xl font-bold"
                    style={{ color: stat.color }}
                  >
                    {stat.value}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Traffic Chart */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-gradient-to-br from-white to-blue-50/50 dark:from-slate-800 dark:to-blue-900/20 p-4 sm:p-5 md:p-6 rounded-xl sm:rounded-2xl border border-blue-200 dark:border-blue-500/30 shadow-xl"
          >
            <h2 className="text-lg sm:text-xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent mb-4 sm:mb-6">
              📊 Traffic Over Time
            </h2>
            {traffic.length > 0 ? (
              <div className="h-64 flex items-end gap-1 sm:gap-2 overflow-x-auto pb-4">
                {traffic.slice(-30).map((item, index) => {
                  const maxVisits = Math.max(...traffic.map(t => t.visits))
                  const height = (item.visits / maxVisits) * 100
                  return (
                    <motion.div 
                      key={index} 
                      className="flex-1 min-w-[20px] flex flex-col items-center group"
                      initial={{ opacity: 0, scaleY: 0 }}
                      animate={{ opacity: 1, scaleY: 1 }}
                      transition={{ delay: index * 0.02 }}
                    >
                      <motion.div
                        className="w-full bg-gradient-to-t from-blue-600 via-blue-500 to-cyan-400 rounded-t-lg hover:from-blue-700 hover:via-blue-600 hover:to-cyan-500 transition-all cursor-pointer shadow-lg hover:shadow-xl"
                        style={{ height: `${height}%`, minHeight: '8px' }}
                        title={`${new Date(item.date).toLocaleDateString()}: ${item.visits} visits`}
                        whileHover={{ scaleY: 1.1 }}
                      />
                      <span className="text-xs text-gray-500 dark:text-gray-400 mt-2 hidden sm:block">
                        {new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </span>
                    </motion.div>
                  )
                })}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-500 dark:text-gray-400">No traffic data available</p>
              </div>
            )}
          </motion.div>

          {/* Countries & Recent Activity */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4 md:gap-5 lg:gap-6">
            {/* Top Countries */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-gradient-to-br from-white to-emerald-50/50 dark:from-slate-800 dark:to-emerald-900/20 p-4 sm:p-5 md:p-6 rounded-xl sm:rounded-2xl border border-emerald-200 dark:border-emerald-500/30 shadow-xl"
            >
              <h2 className="text-lg sm:text-xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent mb-4 sm:mb-6">
                🌍 Top Countries
              </h2>
              {countries.length > 0 ? (
                <div className="space-y-3">
                  {countries
                    .filter(c => c.country && c.country !== 'Unknown' && c.countryCode && c.countryCode !== 'XX')
                    .map((country, index) => (
                    <motion.div 
                      key={`${country.country}-${index}`} 
                      className="flex items-center justify-between p-3 bg-white/50 dark:bg-slate-700/50 rounded-xl hover:bg-white dark:hover:bg-slate-700 transition-colors"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.3 + index * 0.05 }}
                      whileHover={{ scale: 1.02 }}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-3xl">{getCountryFlag(country.countryCode || 'XX')}</span>
                        <span className="font-semibold text-gray-900 dark:text-white">
                          {country.country || 'Unknown'}
                        </span>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-lg text-gray-900 dark:text-white">
                          {country.visits?.toLocaleString() || 0}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {country.uniqueVisitors || 0} unique
                        </p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 dark:text-gray-400 text-center py-8">
                  No country data available
                </p>
              )}
            </motion.div>

            {/* Recent Leads */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-gradient-to-br from-white to-purple-50/50 dark:from-slate-800 dark:to-purple-900/20 p-4 sm:p-5 md:p-6 rounded-xl sm:rounded-2xl border border-purple-200 dark:border-purple-500/30 shadow-xl"
            >
              <h2 className="text-lg sm:text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-4 sm:mb-6">
                📧 Recent Leads
              </h2>
              {recentLeads.length > 0 ? (
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {recentLeads.map((lead) => (
                    <motion.div 
                      key={lead._id} 
                      className="p-4 bg-white/50 dark:bg-slate-700/50 rounded-xl border border-purple-100 dark:border-purple-500/20 hover:bg-white dark:hover:bg-slate-700 transition-colors"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      whileHover={{ scale: 1.02 }}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <p className="font-semibold text-gray-900 dark:text-white">
                          {lead.name}
                        </p>
                        <span className={`px-3 py-1 rounded-lg text-xs font-semibold shadow-md ${
                          lead.status === 'new' ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white' :
                          lead.status === 'contacted' ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white' :
                          'bg-gradient-to-r from-gray-400 to-gray-500 text-white'
                        }`}>
                          {lead.status}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                        {lead.email}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2 mb-2">
                        {lead.message}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-500">
                        {new Date(lead.createdAt).toLocaleDateString()}
                      </p>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 dark:text-gray-400 text-center py-8">
                  No leads yet
                </p>
              )}
            </motion.div>
          </div>

          {/* Recent Visits Table */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-gradient-to-br from-white to-cyan-50/50 dark:from-slate-800 dark:to-cyan-900/20 p-4 sm:p-5 md:p-6 rounded-xl sm:rounded-2xl border border-cyan-200 dark:border-cyan-500/30 shadow-xl"
          >
            <h2 className="text-lg sm:text-xl font-bold bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent mb-4 sm:mb-6">
              🔍 Recent Visits
            </h2>
            {recentVisits.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gradient-to-r from-cyan-50 to-blue-50 dark:from-cyan-900/30 dark:to-blue-900/30">
                      <th className="text-left py-4 px-4 sm:px-6 text-sm font-bold text-gray-900 dark:text-white">Page</th>
                      <th className="text-left py-4 px-4 sm:px-6 text-sm font-bold text-gray-900 dark:text-white hidden sm:table-cell">Device</th>
                      <th className="text-left py-4 px-4 sm:px-6 text-sm font-bold text-gray-900 dark:text-white hidden md:table-cell">Browser</th>
                      <th className="text-left py-4 px-4 sm:px-6 text-sm font-bold text-gray-900 dark:text-white">Country</th>
                      <th className="text-left py-4 px-4 sm:px-6 text-sm font-bold text-gray-900 dark:text-white">Time</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentVisits.map((visit, index) => (
                      <motion.tr 
                        key={visit._id} 
                        className="border-b border-cyan-100 dark:border-cyan-500/20 hover:bg-cyan-50/50 dark:hover:bg-cyan-900/20 transition-colors"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.5 + index * 0.02 }}
                      >
                        <td className="py-3 px-4 sm:px-6 text-sm font-semibold text-gray-900 dark:text-white">{visit.page}</td>
                        <td className="py-3 px-4 sm:px-6 text-sm text-gray-600 dark:text-gray-400 hidden sm:table-cell">{visit.device}</td>
                        <td className="py-3 px-4 sm:px-6 text-sm text-gray-600 dark:text-gray-400 hidden md:table-cell">{visit.browser}</td>
                        <td className="py-3 px-4 sm:px-6 text-sm text-gray-600 dark:text-gray-400">
                          {visit.country && visit.country !== 'Unknown' && visit.countryCode && visit.countryCode !== 'XX' 
                            ? visit.country 
                            : 'Unknown'}
                        </td>
                        <td className="py-3 px-4 sm:px-6 text-sm text-gray-500 dark:text-gray-400">
                          {new Date(visit.timestamp).toLocaleString()}
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-gray-500 dark:text-gray-400 text-center py-8">
                No visits yet
              </p>
            )}
          </motion.div>
        </>
      )}
    </div>
  )
}

// Helper function to get country flag emoji
function getCountryFlag(countryCode: string): string {
  if (!countryCode || countryCode === 'XX') return '🌍'
  const codePoints = countryCode
    .toUpperCase()
    .split('')
    .map(char => 127397 + char.charCodeAt(0))
  return String.fromCodePoint(...codePoints)
}

