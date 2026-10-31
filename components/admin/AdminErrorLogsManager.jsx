'use client'

import React, { useState, useEffect, useMemo, useCallback } from 'react'
import {
  AlertTriangle,
  AlertOctagon,
  Bug,
  Terminal,
  CheckCircle2,
  Clock,
  Filter,
  Search,
  Trash2,
  RefreshCw,
  Copy,
  ExternalLink,
  ShieldAlert,
  Check,
  Activity,
  FileCode,
  Laptop,
  Smartphone,
  Eye,
  X,
  Sparkles,
  Download,
  Flame,
  User,
  Globe,
  Radio
} from 'lucide-react'
import { toast } from 'sonner'

export default function AdminErrorLogsManager({ onUpdateUnresolvedCount }) {
  const [errors, setErrors] = useState([])
  const [loading, setLoading] = useState(true)
  const [metrics, setMetrics] = useState({
    total: 0,
    unresolvedCount: 0,
    criticalCount: 0,
    frontendCount: 0,
    backendCount: 0
  })

  // Filters
  const [searchQuery, setSearchQuery] = useState('')
  const [severityFilter, setSeverityFilter] = useState('all') // 'all' | 'critical' | 'error' | 'warning'
  const [sourceFilter, setSourceFilter] = useState('all') // 'all' | 'frontend' | 'backend' | 'unhandled_promise' | 'react_boundary'
  const [statusFilter, setStatusFilter] = useState('all') // 'all' | 'unresolved' | 'investigating' | 'resolved'

  // Auto-refresh state
  const [autoRefresh, setAutoRefresh] = useState(true)
  const [lastRefreshedAt, setLastRefreshedAt] = useState(new Date())

  // Inspect Modal State
  const [selectedError, setSelectedError] = useState(null)
  const [adminNoteDraft, setAdminNoteDraft] = useState('')
  const [actionBusy, setActionBusy] = useState(false)
  const [copiedStack, setCopiedStack] = useState(false)

  // Delete Confirm Modal State
  const [deleteConfirm, setDeleteConfirm] = useState(null) // null | { type: 'single', id: '...' } | { type: 'resolved' } | { type: 'all' }

  // Load errors from API
  const fetchErrors = useCallback(async (isSilent = false) => {
    if (!isSilent) setLoading(true)
    try {
      const token = localStorage.getItem('vv_token') || localStorage.getItem('vv_auth_token') || ''
      const params = new URLSearchParams()
      if (severityFilter !== 'all') params.set('severity', severityFilter)
      if (sourceFilter !== 'all') params.set('source', sourceFilter)
      if (statusFilter !== 'all') params.set('status', statusFilter)
      if (searchQuery.trim()) params.set('search', searchQuery.trim())
      params.set('limit', '100')

      const res = await fetch(`/api/admin/errors?${params.toString()}`, {
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        }
      })

      if (res.ok) {
        const data = await res.json()
        setErrors(data.errors || [])
        setMetrics({
          total: data.total || 0,
          unresolvedCount: data.unresolvedCount || 0,
          criticalCount: data.criticalCount || 0,
          frontendCount: data.frontendCount || 0,
          backendCount: data.backendCount || 0
        })
        setLastRefreshedAt(new Date())
        if (onUpdateUnresolvedCount) {
          onUpdateUnresolvedCount(data.unresolvedCount || 0)
        }
      } else {
        const errData = await res.json().catch(() => ({}))
        if (!isSilent) toast.error(errData.error || 'Failed to fetch system error logs')
      }
    } catch (e) {
      if (!isSilent) toast.error('Error fetching logs: ' + e.message)
    } finally {
      if (!isSilent) setLoading(false)
    }
  }, [severityFilter, sourceFilter, statusFilter, searchQuery, onUpdateUnresolvedCount])

  useEffect(() => {
    fetchErrors()
  }, [fetchErrors])

  // Periodic Auto-refresh
  useEffect(() => {
    if (!autoRefresh) return
    const interval = setInterval(() => {
      fetchErrors(true)
    }, 10000)
    return () => clearInterval(interval)
  }, [autoRefresh, fetchErrors])

  // Mark status (Resolved / Investigating / Unresolved)
  const handleUpdateStatus = async (errId, newStatus) => {
    setActionBusy(true)
    try {
      const token = localStorage.getItem('vv_token') || localStorage.getItem('vv_auth_token') || ''
      const res = await fetch(`/api/admin/errors/${errId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          status: newStatus,
          adminNote: adminNoteDraft
        })
      })

      if (res.ok) {
        toast.success(`Error marked as ${newStatus}`)
        fetchErrors(true)
        if (selectedError && selectedError.id === errId) {
          setSelectedError(prev => prev ? { ...prev, status: newStatus, adminNote: adminNoteDraft } : null)
        }
      } else {
        const errData = await res.json().catch(() => ({}))
        toast.error(errData.error || 'Failed to update error status')
      }
    } catch (e) {
      toast.error(e.message)
    } finally {
      setActionBusy(false)
    }
  }

  // Save admin note
  const handleSaveNote = async (errId) => {
    setActionBusy(true)
    try {
      const token = localStorage.getItem('vv_token') || localStorage.getItem('vv_auth_token') || ''
      const res = await fetch(`/api/admin/errors/${errId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          adminNote: adminNoteDraft
        })
      })

      if (res.ok) {
        toast.success('Investigation note saved')
        fetchErrors(true)
        if (selectedError && selectedError.id === errId) {
          setSelectedError(prev => prev ? { ...prev, adminNote: adminNoteDraft } : null)
        }
      } else {
        toast.error('Failed to save note')
      }
    } catch (e) {
      toast.error(e.message)
    } finally {
      setActionBusy(false)
    }
  }

  // Delete Error (Single or Bulk)
  const handleDeleteExecute = async () => {
    if (!deleteConfirm) return
    setActionBusy(true)
    try {
      const token = localStorage.getItem('vv_token') || localStorage.getItem('vv_auth_token') || ''
      let url = '/api/admin/errors'
      if (deleteConfirm.type === 'single') {
        url += `?id=${deleteConfirm.id}`
      } else if (deleteConfirm.type === 'resolved') {
        url += '?action=clear_resolved'
      } else if (deleteConfirm.type === 'all') {
        url += '?action=clear_all'
      }

      const res = await fetch(url, {
        method: 'DELETE',
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        }
      })

      if (res.ok) {
        toast.success('Error log deleted successfully')
        setDeleteConfirm(null)
        if (selectedError && selectedError.id === deleteConfirm.id) {
          setSelectedError(null)
        }
        fetchErrors()
      } else {
        toast.error('Failed to delete error logs')
      }
    } catch (e) {
      toast.error(e.message)
    } finally {
      setActionBusy(false)
    }
  }

  // Trigger Simulated Test Error
  const handleSimulateTestError = async () => {
    setActionBusy(true)
    try {
      const token = localStorage.getItem('vv_token') || localStorage.getItem('vv_auth_token') || ''
      const res = await fetch('/api/admin/errors/simulate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify({})
      })

      if (res.ok) {
        toast.success('🚨 Simulated test error injected and recorded live!')
        fetchErrors()
      } else {
        toast.error('Failed to simulate test error')
      }
    } catch (e) {
      toast.error(e.message)
    } finally {
      setActionBusy(false)
    }
  }

  // Copy Stack Trace
  const handleCopyStack = (stack) => {
    if (!stack) return
    navigator.clipboard.writeText(stack)
    setCopiedStack(true)
    toast.success('Stack trace copied to clipboard')
    setTimeout(() => setCopiedStack(false), 2000)
  }

  // Export logs to CSV
  const handleExportCSV = () => {
    if (!errors.length) {
      return toast.error('No errors to export')
    }
    const headers = ['ID', 'Severity', 'Source', 'Status', 'Message', 'Path', 'Occurrences', 'Timestamp', 'UserEmail']
    const rows = errors.map(e => [
      e.id,
      e.severity,
      e.source,
      e.status,
      `"${(e.message || '').replace(/"/g, '""')}"`,
      `"${(e.path || '').replace(/"/g, '""')}"`,
      e.occurrenceCount || 1,
      e.timestamp,
      e.userEmail || 'Guest'
    ])
    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', `system_error_logs_${new Date().toISOString().split('T')[0]}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    toast.success('Exported error logs to CSV')
  }

  // Helper for human-readable time format
  const formatTimeAgo = (isoString) => {
    if (!isoString) return 'Unknown'
    const diffMs = Date.now() - new Date(isoString).getTime()
    const diffSec = Math.floor(diffMs / 1000)
    if (diffSec < 60) return `${diffSec}s ago`
    const diffMin = Math.floor(diffSec / 60)
    if (diffMin < 60) return `${diffMin}m ago`
    const diffHours = Math.floor(diffMin / 60)
    if (diffHours < 24) return `${diffHours}h ago`
    return new Date(isoString).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <div className="space-y-6">
      {/* 1. TOP HEADER & TELEMETRY PULSE */}
      <div className="bg-[#191715] border border-stone-800/80 rounded-3xl p-5 sm:p-7 shadow-xl">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-400 flex items-center justify-center">
                <ShieldAlert className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="font-serif text-xl sm:text-2xl font-bold text-white tracking-tight">
                    Real-Time System Error Logs &amp; Telemetry
                  </h2>
                  <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    LIVE
                  </span>
                </div>
                <p className="text-xs text-stone-400">
                  Centralized error capturing across all website views: Frontend runtime, API exceptions, unhandled rejections &amp; component boundaries.
                </p>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex flex-wrap items-center gap-2 pt-2 lg:pt-0">
            <button
              onClick={handleSimulateTestError}
              disabled={actionBusy}
              className="px-3.5 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer shadow-sm disabled:opacity-50"
            >
              <Bug className="w-3.5 h-3.5 text-rose-400" />
              Simulate Test Error
            </button>

            <button
              onClick={() => fetchErrors()}
              disabled={loading}
              className="px-3.5 py-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 border border-stone-700 text-xs font-medium flex items-center gap-1.5 transition-all cursor-pointer shadow-sm disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-[#c5a059]' : ''}`} />
              Refresh
            </button>

            <button
              onClick={() => setAutoRefresh(!autoRefresh)}
              className={`px-3 py-2 rounded-xl text-xs font-medium flex items-center gap-1.5 transition-all cursor-pointer border ${
                autoRefresh
                  ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
                  : 'bg-stone-800 text-stone-400 border-stone-700'
              }`}
            >
              <Radio className={`w-3.5 h-3.5 ${autoRefresh ? 'text-emerald-400 animate-pulse' : ''}`} />
              Auto {autoRefresh ? 'On (10s)' : 'Off'}
            </button>

            <button
              onClick={handleExportCSV}
              className="px-3.5 py-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 border border-stone-700 text-xs font-medium flex items-center gap-1.5 transition-all cursor-pointer shadow-sm"
            >
              <Download className="w-3.5 h-3.5 text-stone-400" />
              Export CSV
            </button>
          </div>
        </div>

        {/* 2. SUMMARY METRICS TILES */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mt-6">
          {/* Tile 1: Total Captured */}
          <div className="p-4 rounded-2xl bg-stone-900/60 border border-stone-800 flex flex-col justify-between">
            <span className="text-[11px] font-medium text-stone-400 uppercase tracking-wider">
              Total Captured
            </span>
            <div className="flex items-baseline gap-2 mt-2">
              <span className="font-serif text-2xl sm:text-3xl font-bold text-white">
                {metrics.total}
              </span>
              <span className="text-[10px] text-stone-500">incidents</span>
            </div>
          </div>

          {/* Tile 2: Unresolved Active */}
          <div className={`p-4 rounded-2xl border flex flex-col justify-between ${
            metrics.unresolvedCount > 0
              ? 'bg-rose-950/20 border-rose-800/60'
              : 'bg-emerald-950/20 border-emerald-800/40'
          }`}>
            <div className="flex items-center justify-between">
              <span className={`text-[11px] font-medium uppercase tracking-wider ${
                metrics.unresolvedCount > 0 ? 'text-rose-400 font-bold' : 'text-emerald-400'
              }`}>
                Active Unresolved
              </span>
              {metrics.unresolvedCount > 0 && (
                <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
              )}
            </div>
            <div className="flex items-baseline gap-2 mt-2">
              <span className={`font-serif text-2xl sm:text-3xl font-bold ${
                metrics.unresolvedCount > 0 ? 'text-rose-400' : 'text-emerald-400'
              }`}>
                {metrics.unresolvedCount}
              </span>
              <span className="text-[10px] text-stone-400">
                {metrics.unresolvedCount > 0 ? 'require review' : 'all clean'}
              </span>
            </div>
          </div>

          {/* Tile 3: Critical 500s */}
          <div className="p-4 rounded-2xl bg-stone-900/60 border border-stone-800 flex flex-col justify-between">
            <span className="text-[11px] font-medium text-amber-400/90 uppercase tracking-wider">
              Critical Severity
            </span>
            <div className="flex items-baseline gap-2 mt-2">
              <span className="font-serif text-2xl sm:text-3xl font-bold text-amber-300">
                {metrics.criticalCount}
              </span>
              <span className="text-[10px] text-stone-500">crashes/500s</span>
            </div>
          </div>

          {/* Tile 4: Source Breakdown */}
          <div className="p-4 rounded-2xl bg-stone-900/60 border border-stone-800 flex flex-col justify-between">
            <span className="text-[11px] font-medium text-stone-400 uppercase tracking-wider">
              Frontend / Backend
            </span>
            <div className="flex items-center gap-2 mt-2">
              <span className="px-2 py-0.5 rounded-md bg-sky-500/10 text-sky-400 text-xs font-mono font-bold border border-sky-500/20">
                FE: {metrics.frontendCount}
              </span>
              <span className="px-2 py-0.5 rounded-md bg-purple-500/10 text-purple-400 text-xs font-mono font-bold border border-purple-500/20">
                BE: {metrics.backendCount}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. FILTERS & SEARCH CONTROLS */}
      <div className="bg-[#191715] border border-stone-800/80 rounded-2xl p-4 sm:p-5 shadow-lg space-y-4">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Search Bar */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search error message, URL path, component, or user email..."
              className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-stone-900 border border-stone-800 text-xs text-white placeholder-stone-500 focus:outline-none focus:border-[#c5a059] transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-white p-0.5"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Bulk Actions */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => setDeleteConfirm({ type: 'resolved' })}
              className="px-3 py-2 rounded-xl bg-stone-900 hover:bg-stone-800 text-stone-300 border border-stone-800 text-xs font-medium transition-all cursor-pointer"
            >
              Clear Resolved
            </button>
            <button
              onClick={() => setDeleteConfirm({ type: 'all' })}
              className="px-3 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 text-xs font-medium transition-all cursor-pointer"
            >
              Purge All
            </button>
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap items-center gap-3 pt-1 text-xs">
          {/* Status Tabs */}
          <div className="flex items-center p-1 bg-stone-900/90 rounded-xl border border-stone-800">
            {[
              { id: 'all', label: 'All Status' },
              { id: 'unresolved', label: 'Unresolved', count: metrics.unresolvedCount },
              { id: 'investigating', label: 'Investigating' },
              { id: 'resolved', label: 'Resolved' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setStatusFilter(tab.id)}
                className={`px-3 py-1.5 rounded-lg font-medium transition-all cursor-pointer text-xs flex items-center gap-1.5 ${
                  statusFilter === tab.id
                    ? 'bg-[#c5a059] text-stone-950 font-bold shadow-sm'
                    : 'text-stone-400 hover:text-white'
                }`}
              >
                <span>{tab.label}</span>
                {tab.count !== undefined && tab.count > 0 && (
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                    statusFilter === tab.id ? 'bg-stone-950 text-[#c5a059]' : 'bg-rose-500 text-white'
                  }`}>
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Severity Tabs */}
          <div className="flex items-center p-1 bg-stone-900/90 rounded-xl border border-stone-800">
            {[
              { id: 'all', label: 'All Severity' },
              { id: 'critical', label: 'Critical' },
              { id: 'error', label: 'Error' },
              { id: 'warning', label: 'Warning' }
            ].map(sev => (
              <button
                key={sev.id}
                onClick={() => setSeverityFilter(sev.id)}
                className={`px-3 py-1.5 rounded-lg font-medium transition-all cursor-pointer text-xs ${
                  severityFilter === sev.id
                    ? 'bg-stone-700 text-white font-bold'
                    : 'text-stone-400 hover:text-white'
                }`}
              >
                {sev.label}
              </button>
            ))}
          </div>

          {/* Source Tabs */}
          <div className="flex items-center p-1 bg-stone-900/90 rounded-xl border border-stone-800">
            {[
              { id: 'all', label: 'All Sources' },
              { id: 'frontend', label: 'Frontend' },
              { id: 'backend', label: 'Backend API' },
              { id: 'unhandled_promise', label: 'Promises' }
            ].map(src => (
              <button
                key={src.id}
                onClick={() => setSourceFilter(src.id)}
                className={`px-3 py-1.5 rounded-lg font-medium transition-all cursor-pointer text-xs ${
                  sourceFilter === src.id
                    ? 'bg-stone-700 text-white font-bold'
                    : 'text-stone-400 hover:text-white'
                }`}
              >
                {src.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 4. ERROR LIST CARDS / TABLE */}
      <div className="space-y-3">
        {loading && (
          <div className="p-12 text-center bg-[#191715] rounded-3xl border border-stone-800/80">
            <RefreshCw className="w-8 h-8 text-[#c5a059] animate-spin mx-auto mb-3" />
            <p className="text-xs text-stone-400">Loading system error telemetry logs...</p>
          </div>
        )}

        {!loading && errors.length === 0 && (
          <div className="p-12 text-center bg-[#191715] rounded-3xl border border-stone-800/80 space-y-4">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center">
              <CheckCircle2 className="w-7 h-7" />
            </div>
            <div className="space-y-1">
              <h3 className="font-serif text-lg font-bold text-white">
                All Systems Operational — No Errors Recorded
              </h3>
              <p className="text-xs text-stone-400 max-w-md mx-auto">
                No runtime errors match your active filter. All customer and vendor workflows are operating smoothly.
              </p>
            </div>
            <button
              onClick={handleSimulateTestError}
              className="px-4 py-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 border border-stone-700 text-xs font-semibold inline-flex items-center gap-2 cursor-pointer transition-all"
            >
              <Bug className="w-3.5 h-3.5 text-rose-400" />
              Simulate Test Error to Verify Pipeline
            </button>
          </div>
        )}

        {!loading && errors.map((err) => {
          const isCritical = err.severity === 'critical'
          const isWarning = err.severity === 'warning'
          const isResolved = err.status === 'resolved'
          const isInvestigating = err.status === 'investigating'

          return (
            <div
              key={err.id}
              className={`p-4 sm:p-5 rounded-2xl border transition-all ${
                isResolved
                  ? 'bg-stone-900/40 border-stone-800/60 opacity-80'
                  : isCritical
                  ? 'bg-[#1e1516] border-rose-900/60 hover:border-rose-700'
                  : 'bg-[#191715] border-stone-800/80 hover:border-stone-700'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                {/* Left Info */}
                <div className="space-y-2 flex-1 min-w-0">
                  {/* Badges strip */}
                  <div className="flex flex-wrap items-center gap-2">
                    {/* Severity Badge */}
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider border ${
                      isCritical
                        ? 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                        : isWarning
                        ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                        : 'bg-orange-500/10 text-orange-400 border-orange-500/30'
                    }`}>
                      {err.severity || 'error'}
                    </span>

                    {/* Source Badge */}
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-medium bg-stone-800 text-stone-300 border border-stone-700">
                      {err.source || 'runtime'}
                    </span>

                    {/* Status Badge */}
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase border ${
                      isResolved
                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                        : isInvestigating
                        ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                        : 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                    }`}>
                      {err.status || 'unresolved'}
                    </span>

                    {/* Frequency Counter */}
                    {(err.occurrenceCount || 1) > 1 && (
                      <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/40">
                        <Flame className="w-3 h-3 text-rose-400" />
                        Seen {err.occurrenceCount}x
                      </span>
                    )}

                    {/* Timestamp */}
                    <span className="text-[11px] text-stone-400 flex items-center gap-1 ml-auto sm:ml-0 font-mono">
                      <Clock className="w-3 h-3 text-stone-500" />
                      {formatTimeAgo(err.timestamp)}
                    </span>
                  </div>

                  {/* Error Message */}
                  <div className="font-mono text-xs sm:text-sm font-bold text-white break-words">
                    {err.message}
                  </div>

                  {/* Context Pill Row */}
                  <div className="flex flex-wrap items-center gap-2 text-[11px] text-stone-400 pt-1">
                    {err.path && (
                      <span className="font-mono bg-stone-900 px-2 py-0.5 rounded-md border border-stone-800 text-stone-300 truncate max-w-xs">
                        {err.method ? `${err.method} ` : ''}{err.path}
                      </span>
                    )}

                    {err.component && (
                      <span className="bg-stone-900 px-2 py-0.5 rounded-md border border-stone-800 text-[#e8d08d]">
                        Component: {err.component}
                      </span>
                    )}

                    {err.userEmail && (
                      <span className="flex items-center gap-1 bg-stone-900 px-2 py-0.5 rounded-md border border-stone-800 text-stone-300">
                        <User className="w-3 h-3 text-stone-500" />
                        {err.userEmail} ({err.userRole || 'user'})
                      </span>
                    )}

                    {err.ip && err.ip !== 'unknown' && (
                      <span className="text-stone-500 font-mono">
                        IP: {err.ip}
                      </span>
                    )}
                  </div>

                  {/* Admin Note if present */}
                  {err.adminNote && (
                    <div className="p-2.5 rounded-xl bg-stone-900/90 border border-stone-800 text-[11px] text-stone-300 flex items-start gap-2">
                      <span className="text-[#c5a059] font-bold shrink-0">Admin Note:</span>
                      <span>{err.adminNote}</span>
                    </div>
                  )}
                </div>

                {/* Right Actions */}
                <div className="flex items-center gap-2 pt-2 sm:pt-0 shrink-0">
                  <button
                    onClick={() => {
                      setSelectedError(err)
                      setAdminNoteDraft(err.adminNote || '')
                    }}
                    className="px-3 py-1.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 border border-stone-700 text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
                  >
                    <Eye className="w-3.5 h-3.5 text-[#c5a059]" />
                    Inspect Details
                  </button>

                  {!isResolved ? (
                    <button
                      onClick={() => handleUpdateStatus(err.id, 'resolved')}
                      disabled={actionBusy}
                      title="Mark as Resolved"
                      className="px-3 py-1.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-50"
                    >
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      Resolve
                    </button>
                  ) : (
                    <button
                      onClick={() => handleUpdateStatus(err.id, 'unresolved')}
                      disabled={actionBusy}
                      title="Reopen Issue"
                      className="px-3 py-1.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-400 text-xs font-semibold transition-all cursor-pointer"
                    >
                      Reopen
                    </button>
                  )}

                  <button
                    onClick={() => setDeleteConfirm({ type: 'single', id: err.id })}
                    title="Delete Error Log"
                    className="p-1.5 rounded-xl text-stone-500 hover:text-rose-400 hover:bg-rose-500/10 transition-all cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* 5. INSPECTION MODAL (FULL STACK TRACE & METADATA) */}
      {selectedError && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-[#191715] border border-stone-800 rounded-3xl w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
            {/* Header */}
            <div className="p-5 border-b border-stone-800 flex items-start justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase border ${
                    selectedError.severity === 'critical'
                      ? 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                      : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                  }`}>
                    {selectedError.severity}
                  </span>
                  <span className="text-stone-400 text-xs font-mono">
                    ID: {selectedError.id}
                  </span>
                </div>
                <h3 className="font-mono text-sm font-bold text-white break-words">
                  {selectedError.message}
                </h3>
              </div>
              <button
                onClick={() => setSelectedError(null)}
                className="text-stone-400 hover:text-white p-1 rounded-lg hover:bg-stone-800 transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 overflow-y-auto space-y-5 text-xs">
              {/* Incident Metrics Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-stone-900/60 p-3.5 rounded-2xl border border-stone-800/80">
                <div>
                  <span className="text-[10px] text-stone-500 uppercase tracking-wider block font-bold">Source</span>
                  <span className="text-stone-200 font-mono">{selectedError.source}</span>
                </div>
                <div>
                  <span className="text-[10px] text-stone-500 uppercase tracking-wider block font-bold">Occurrences</span>
                  <span className="text-stone-200 font-mono font-bold">{selectedError.occurrenceCount || 1} times</span>
                </div>
                <div>
                  <span className="text-[10px] text-stone-500 uppercase tracking-wider block font-bold">First Seen</span>
                  <span className="text-stone-200 font-mono">{formatTimeAgo(selectedError.firstSeen || selectedError.timestamp)}</span>
                </div>
                <div>
                  <span className="text-[10px] text-stone-500 uppercase tracking-wider block font-bold">Latest Seen</span>
                  <span className="text-stone-200 font-mono">{formatTimeAgo(selectedError.timestamp)}</span>
                </div>
              </div>

              {/* Stack Trace Terminal Box */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-stone-300 flex items-center gap-1.5">
                    <Terminal className="w-3.5 h-3.5 text-[#c5a059]" />
                    Exception Stack Trace
                  </span>
                  {selectedError.stack && (
                    <button
                      onClick={() => handleCopyStack(selectedError.stack)}
                      className="text-[11px] text-[#c5a059] hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      {copiedStack ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      {copiedStack ? 'Copied' : 'Copy Stack'}
                    </button>
                  )}
                </div>
                <div className="p-3.5 rounded-xl bg-stone-950 border border-stone-800/80 font-mono text-[11px] text-rose-300/90 max-h-56 overflow-y-auto whitespace-pre-wrap leading-relaxed select-all">
                  {selectedError.stack || 'No client stack trace captured for this error.'}
                </div>
              </div>

              {/* Environmental / User Context */}
              <div className="space-y-1.5">
                <span className="text-xs font-bold text-stone-300 flex items-center gap-1.5">
                  <Globe className="w-3.5 h-3.5 text-[#c5a059]" />
                  Telemetry &amp; Environment Context
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 p-3 rounded-xl bg-stone-900/60 border border-stone-800/80 font-mono text-[11px]">
                  <div><span className="text-stone-500">Path:</span> <span className="text-stone-200">{selectedError.path || 'N/A'}</span></div>
                  <div><span className="text-stone-500">User:</span> <span className="text-stone-200">{selectedError.userEmail || 'Anonymous Guest'}</span></div>
                  <div><span className="text-stone-500">IP Address:</span> <span className="text-stone-200">{selectedError.ip || 'unknown'}</span></div>
                  <div><span className="text-stone-500">Component:</span> <span className="text-stone-200">{selectedError.component || 'N/A'}</span></div>
                  <div className="sm:col-span-2 break-words"><span className="text-stone-500">User Agent:</span> <span className="text-stone-400">{selectedError.userAgent || 'unknown'}</span></div>
                  {selectedError.metadata && Object.keys(selectedError.metadata).length > 0 && (
                    <div className="sm:col-span-2 pt-1 border-t border-stone-800">
                      <span className="text-stone-500 block mb-1">Metadata:</span>
                      <pre className="text-[10px] text-stone-400 bg-stone-950 p-2 rounded-lg overflow-x-auto">
                        {JSON.stringify(selectedError.metadata, null, 2)}
                      </pre>
                    </div>
                  )}
                </div>
              </div>

              {/* Admin Note Input */}
              <div className="space-y-1.5">
                <span className="text-xs font-bold text-stone-300">Investigation Note</span>
                <textarea
                  value={adminNoteDraft}
                  onChange={(e) => setAdminNoteDraft(e.target.value)}
                  placeholder="Add troubleshooting findings, Jira ticket links, or resolution details..."
                  className="w-full p-3 rounded-xl bg-stone-900 border border-stone-800 text-xs text-stone-200 placeholder-stone-600 focus:outline-none focus:border-[#c5a059] h-20 resize-none"
                />
              </div>
            </div>

            {/* Footer Actions */}
            <div className="p-4 border-t border-stone-800 bg-stone-900/40 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleSaveNote(selectedError.id)}
                  disabled={actionBusy}
                  className="px-3.5 py-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 border border-stone-700 text-xs font-semibold cursor-pointer transition-all disabled:opacity-50"
                >
                  Save Note
                </button>

                <button
                  onClick={() => {
                    const nextStatus = selectedError.status === 'investigating' ? 'unresolved' : 'investigating'
                    handleUpdateStatus(selectedError.id, nextStatus)
                  }}
                  disabled={actionBusy}
                  className="px-3.5 py-2 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-semibold cursor-pointer transition-all disabled:opacity-50"
                >
                  {selectedError.status === 'investigating' ? 'Mark Unresolved' : 'Mark Investigating'}
                </button>
              </div>

              <div className="flex items-center gap-2">
                {selectedError.status !== 'resolved' ? (
                  <button
                    onClick={() => handleUpdateStatus(selectedError.id, 'resolved')}
                    disabled={actionBusy}
                    className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-md transition-all disabled:opacity-50"
                  >
                    <Check className="w-3.5 h-3.5" />
                    Mark Resolved
                  </button>
                ) : (
                  <button
                    onClick={() => handleUpdateStatus(selectedError.id, 'unresolved')}
                    disabled={actionBusy}
                    className="px-4 py-2 rounded-xl bg-stone-800 text-stone-400 font-bold text-xs cursor-pointer transition-all"
                  >
                    Reopen Issue
                  </button>
                )}

                <button
                  onClick={() => setDeleteConfirm({ type: 'single', id: selectedError.id })}
                  className="p-2 text-stone-500 hover:text-rose-400 rounded-xl hover:bg-rose-500/10 transition-all cursor-pointer"
                  title="Delete Log"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 6. DELETE CONFIRMATION MODAL */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#1c1917] border border-stone-800 rounded-2xl p-6 max-w-sm w-full space-y-4 text-center">
            <div className="w-12 h-12 rounded-xl bg-rose-500/10 text-rose-400 flex items-center justify-center mx-auto border border-rose-500/20">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-serif text-base font-bold text-white">
                {deleteConfirm.type === 'all'
                  ? 'Purge All Error Logs?'
                  : deleteConfirm.type === 'resolved'
                  ? 'Clear All Resolved Errors?'
                  : 'Delete This Error Incident?'}
              </h4>
              <p className="text-xs text-stone-400 mt-1">
                {deleteConfirm.type === 'all'
                  ? 'This will erase all recorded error logs across the entire website permanently.'
                  : deleteConfirm.type === 'resolved'
                  ? 'This will remove all error records that have been marked as resolved.'
                  : 'This error log record will be removed from system telemetry.'}
              </p>
            </div>
            <div className="flex items-center justify-center gap-2 pt-2">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="px-4 py-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 text-xs font-medium cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteExecute}
                disabled={actionBusy}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold cursor-pointer disabled:opacity-50"
              >
                {actionBusy ? 'Deleting...' : 'Confirm Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
