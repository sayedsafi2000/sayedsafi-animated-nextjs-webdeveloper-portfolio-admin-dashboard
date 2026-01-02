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
            Analytics <span className="text-blue-600 dark:text-blue-400">Dashboard</span>
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Track visitors, leads, and events
          </p>
        </div>
        <div className="flex gap-2">
          <motion.button
            onClick={handleExportVisits}
            className="px-4 py-2 bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-all text-sm font-medium"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            Export Visits
          </motion.button>
          <motion.button
            onClick={handleExportLeads}
            className="px-4 py-2 bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-all text-sm font-medium"
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
        className="bg-white dark:bg-gray-800 p-4 border border-gray-300 dark:border-gray-700"
      >
        <div className="flex gap-4 items-end">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Start Date
            </label>
            <input
              type="date"
              value={dateRange.startDate}
              onChange={(e) => setDateRange({ ...dateRange, startDate: e.target.value })}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              End Date
            </label>
            <input
              type="date"
              value={dateRange.endDate}
              onChange={(e) => setDateRange({ ...dateRange, endDate: e.target.value })}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>
          <motion.button
            onClick={() => setDateRange({ startDate: '', endDate: '' })}
            className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-all text-sm"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            Clear
          </motion.button>
        </div>
      </motion.div>

      {/* Overview Cards */}
      {loading ? (
        <div className="text-center py-20">
          <div className="inline-block w-8 h-8 border-2 border-blue-600 border-t-transparent animate-spin"></div>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {statCards.map((stat, index) => (
              <motion.div
                key={stat.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                whileHover={{ scale: 1.02 }}
                className="bg-white dark:bg-gray-800 p-6 border border-gray-300 dark:border-gray-700 shadow-sm hover:shadow-md transition-all"
                style={{ borderLeft: `4px solid ${stat.color}` }}
              >
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
                  {stat.title}
                </p>
                <p 
                  className="text-4xl font-bold"
                  style={{ color: stat.color }}
                >
                  {stat.value}
                </p>
              </motion.div>
            ))}
          </div>

          {/* Traffic Chart */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white dark:bg-gray-800 p-6 border border-gray-300 dark:border-gray-700"
          >
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              Traffic Over Time
            </h2>
            {traffic.length > 0 ? (
              <div className="h-64 flex items-end gap-2">
                {traffic.slice(-30).map((item, index) => {
                  const maxVisits = Math.max(...traffic.map(t => t.visits))
                  const height = (item.visits / maxVisits) * 100
                  return (
                    <div key={index} className="flex-1 flex flex-col items-center">
                      <div
                        className="w-full bg-blue-600 hover:bg-blue-700 transition-colors"
                        style={{ height: `${height}%`, minHeight: '4px' }}
                        title={`${new Date(item.date).toLocaleDateString()}: ${item.visits} visits`}
                      />
                      <span className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        {new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </span>
                    </div>
                  )
                })}
              </div>
            ) : (
              <p className="text-gray-500 dark:text-gray-400 text-center py-12">
                No traffic data available
              </p>
            )}
          </motion.div>

          {/* Countries & Recent Activity */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Top Countries */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white dark:bg-gray-800 p-6 border border-gray-300 dark:border-gray-700"
            >
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                Top Countries
              </h2>
              {countries.length > 0 ? (
                <div className="space-y-3">
                  {countries.map((country, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{getCountryFlag(country.countryCode)}</span>
                        <span className="font-medium text-gray-900 dark:text-white">
                          {country.country}
                        </span>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-gray-900 dark:text-white">
                          {country.visits.toLocaleString()}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {country.uniqueVisitors} unique
                        </p>
                      </div>
                    </div>
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
              className="bg-white dark:bg-gray-800 p-6 border border-gray-300 dark:border-gray-700"
            >
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                Recent Leads
              </h2>
              {recentLeads.length > 0 ? (
                <div className="space-y-3">
                  {recentLeads.map((lead) => (
                    <div key={lead._id} className="border-b border-gray-200 dark:border-gray-700 pb-3 last:border-0">
                      <div className="flex items-start justify-between mb-1">
                        <p className="font-medium text-gray-900 dark:text-white">
                          {lead.name}
                        </p>
                        <span className={`px-2 py-1 text-xs font-medium ${
                          lead.status === 'new' ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' :
                          lead.status === 'contacted' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400' :
                          'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-400'
                        }`}>
                          {lead.status}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                        {lead.email}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-500 line-clamp-2">
                        {lead.message}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                        {new Date(lead.createdAt).toLocaleDateString()}
                      </p>
                    </div>
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
            className="bg-white dark:bg-gray-800 p-6 border border-gray-300 dark:border-gray-700"
          >
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              Recent Visits
            </h2>
            {recentVisits.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200 dark:border-gray-700">
                      <th className="text-left py-2 px-4 text-sm font-medium text-gray-700 dark:text-gray-300">Page</th>
                      <th className="text-left py-2 px-4 text-sm font-medium text-gray-700 dark:text-gray-300">Device</th>
                      <th className="text-left py-2 px-4 text-sm font-medium text-gray-700 dark:text-gray-300">Browser</th>
                      <th className="text-left py-2 px-4 text-sm font-medium text-gray-700 dark:text-gray-300">Country</th>
                      <th className="text-left py-2 px-4 text-sm font-medium text-gray-700 dark:text-gray-300">Time</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentVisits.map((visit) => (
                      <tr key={visit._id} className="border-b border-gray-100 dark:border-gray-800">
                        <td className="py-2 px-4 text-sm text-gray-900 dark:text-white">{visit.page}</td>
                        <td className="py-2 px-4 text-sm text-gray-600 dark:text-gray-400">{visit.device}</td>
                        <td className="py-2 px-4 text-sm text-gray-600 dark:text-gray-400">{visit.browser}</td>
                        <td className="py-2 px-4 text-sm text-gray-600 dark:text-gray-400">{visit.country}</td>
                        <td className="py-2 px-4 text-sm text-gray-500 dark:text-gray-500">
                          {new Date(visit.timestamp).toLocaleString()}
                        </td>
                      </tr>
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

