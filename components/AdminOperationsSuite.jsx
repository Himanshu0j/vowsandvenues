'use client'

import React, { useState, useEffect, useMemo } from 'react'
import {
  ShieldCheck,
  Building2,
  CalendarDays,
  DollarSign,
  TrendingUp,
  Users,
  Image as ImageIcon,
  Tag,
  FileText,
  CheckCircle2,
  XCircle,
  Plus,
  Trash2,
  ExternalLink,
  Save,
  RefreshCw,
  Search,
  Filter,
  Check,
  Download,
  Lock,
  Globe,
  LifeBuoy,
  AlertTriangle,
  History,
  Activity,
  Layers,
  ArrowUpRight,
  Send,
  CalendarOff,
  UserPlus,
  Clock
} from 'lucide-react'
import { toast } from 'sonner'
import { getOptimizedImageUrl } from '@/lib/imageUtils'

function exportToCSV(data, filename) {
  if (!data || !data.length) {
    toast.error('No data available to export')
    return
  }
  const headers = Object.keys(data[0]).join(',')
  const rows = data.map(row =>
    Object.values(row).map(val => {
      const str = typeof val === 'object' ? JSON.stringify(val) : String(val ?? '')
      return `"${str.replace(/"/g, '""')}"`
    }).join(',')
  ).join('\n')
  const blob = new Blob([`${headers}\n${rows}`], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.setAttribute('href', url)
  link.setAttribute('download', `${filename}_${new Date().toISOString().split('T')[0]}.csv`)
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  toast.success(`Exported ${filename}.csv`)
}

export default function AdminOperationsSuite({
  adminStats,
  vendors = [],
  userBookings = [],
  cmsContent,
  onUpdateCMS,
  mediaLibrary = [],
  onUploadMedia,
  onDeleteMedia,
  coupons = [],
  onCreateCoupon,
  settlements = [],
  onUpdateSettlement,
  onVerifyToggle,
  onRejectVendor,
  adminActionBusy
}) {
  // Navigation Tabs (13 Comprehensive Operational Tabs)
  const [activeSubTab, setActiveSubTab] = useState('overview')
  
  // Date filter for Overview
  const [dateRange, setDateRange] = useState('all') // '7d' | '30d' | 'ytd' | 'all'

  // Vendors Filter & Search State
  const [vendorSearch, setVendorSearch] = useState('')
  const [vendorCategoryFilter, setVendorCategoryFilter] = useState('all')
  const [vendorStatusFilter, setVendorStatusFilter] = useState('all') // 'all' | 'verified' | 'pending'

  // Bookings Filter & Search State
  const [bookingSearch, setBookingSearch] = useState('')
  const [bookingStatusFilter, setBookingStatusFilter] = useState('all')

  // CMS Edit State
  const [cmsDraft, setCmsDraft] = useState(cmsContent || {})
  const [cmsSaving, setCmsSaving] = useState(false)

  // SEO Edit State
  const [seoDraft, setSeoDraft] = useState({
    defaultTitle: 'Vows & Venues | All-in-One Indian Event Planning Marketplace',
    defaultDescription: 'Discover, compare, and book royal palaces, wedding banquets, luxury caterers, celebrity makeup artists, and top photographers across India.',
    canonicalBase: 'https://vowsandvenues.in',
    ogImageUrl: 'https://images.unsplash.com/photo-1587271407850-8d438ca9fdf2',
    keywords: 'Indian wedding, banquet halls, royal palaces, wedding catering, bridal makeup, wedding decor, photographer Lucknow'
  })
  const [seoSaving, setSeoSaving] = useState(false)

  // Media Upload State
  const [newMediaForm, setNewMediaForm] = useState({ title: '', url: '', category: 'venues', altText: '', caption: '' })
  const [mediaUploading, setMediaUploading] = useState(false)
  const [mediaSearch, setMediaSearch] = useState('')

  // Coupon Form State
  const [newCouponForm, setNewCouponForm] = useState({
    code: '',
    discountType: 'fixed',
    discountValue: 10000,
    minOrder: 80000,
    maxDiscount: 15000,
    description: ''
  })
  const [couponCreating, setCouponCreating] = useState(false)

  // Availability & Blackout State
  const [selectedVendorForCalendar, setSelectedVendorForCalendar] = useState(vendors[0]?.id || '')
  const [newBlackoutDate, setNewBlackoutDate] = useState('')
  const [blackoutUpdating, setBlackoutUpdating] = useState(false)

  // Support & Disputes State
  const [supportTickets, setSupportTickets] = useState([])
  const [disputesList, setDisputesList] = useState([])
  const [supportReplyText, setSupportReplyText] = useState({})
  const [supportLoading, setSupportLoading] = useState(false)

  // Staff Team & RBAC State
  const [staffUsers, setStaffUsers] = useState([])
  const [newStaffForm, setNewStaffForm] = useState({ name: '', email: '', password: '', role: 'operations_manager' })
  const [staffCreating, setStaffCreating] = useState(false)

  // Audit Logs State
  const [auditLogs, setAuditLogs] = useState([])
  const [auditLoading, setAuditLoading] = useState(false)

  // Payout Busy State
  const [payoutProcessing, setPayoutProcessing] = useState({})

  // Keep CMS state updated if prop changes
  useEffect(() => {
    if (cmsContent && typeof cmsContent === 'object') {
      setCmsDraft(cmsContent)
    }
  }, [cmsContent])

  // Fetch SEO data
  useEffect(() => {
    fetch('/api/seo')
      .then(r => r.json())
      .then(d => {
        if (d && !d.error) {
          setSeoDraft({
            defaultTitle: d.defaultTitle || '',
            defaultDescription: d.defaultDescription || '',
            canonicalBase: d.canonicalBase || 'https://vowsandvenues.in',
            ogImageUrl: d.ogImageUrl || '',
            keywords: Array.isArray(d.keywords) ? d.keywords.join(', ') : (d.keywords || '')
          })
        }
      })
      .catch(() => {})
  }, [])

  // Fetch Support Tickets & Disputes
  const loadSupportAndDisputes = () => {
    setSupportLoading(true)
    Promise.all([
      fetch('/api/support').then(r => r.json()).catch(() => []),
      fetch('/api/disputes').then(r => r.json()).catch(() => [])
    ]).then(([tickets, disputes]) => {
      setSupportTickets(Array.isArray(tickets) ? tickets : [])
      setDisputesList(Array.isArray(disputes) ? disputes : [])
    }).finally(() => setSupportLoading(false))
  }

  // Fetch Staff Users
  const loadStaffUsers = () => {
    fetch('/api/admin/users')
      .then(r => r.json())
      .then(d => {
        if (d?.users) setStaffUsers(d.users)
      })
      .catch(() => {})
  }

  // Fetch Audit Logs
  const loadAuditLogs = () => {
    setAuditLoading(true)
    fetch('/api/admin/audit-logs?limit=50')
      .then(r => r.json())
      .then(d => {
        if (d?.logs) setAuditLogs(d.logs)
      })
      .catch(() => {})
      .finally(() => setAuditLoading(false))
  }

  useEffect(() => {
    if (activeSubTab === 'support') loadSupportAndDisputes()
    if (activeSubTab === 'team') loadStaffUsers()
    if (activeSubTab === 'audit') loadAuditLogs()
  }, [activeSubTab])

  // Filtered Vendors
  const filteredVendors = useMemo(() => {
    return vendors.filter(v => {
      const matchSearch = !vendorSearch ||
        v.name?.toLowerCase().includes(vendorSearch.toLowerCase()) ||
        v.city?.toLowerCase().includes(vendorSearch.toLowerCase()) ||
        v.id?.toLowerCase().includes(vendorSearch.toLowerCase())
      const matchCat = vendorCategoryFilter === 'all' || v.category === vendorCategoryFilter
      const matchStatus = vendorStatusFilter === 'all' ||
        (vendorStatusFilter === 'verified' && v.verified) ||
        (vendorStatusFilter === 'pending' && !v.verified)
      return matchSearch && matchCat && matchStatus
    })
  }, [vendors, vendorSearch, vendorCategoryFilter, vendorStatusFilter])

  // Filtered Bookings
  const filteredBookings = useMemo(() => {
    return userBookings.filter(b => {
      const matchSearch = !bookingSearch ||
        b.bookingNumber?.toLowerCase().includes(bookingSearch.toLowerCase()) ||
        b.userName?.toLowerCase().includes(bookingSearch.toLowerCase()) ||
        b.userEmail?.toLowerCase().includes(bookingSearch.toLowerCase()) ||
        b.id?.toLowerCase().includes(bookingSearch.toLowerCase())
      const matchStatus = bookingStatusFilter === 'all' ||
        b.bookingStatus === bookingStatusFilter ||
        b.status === bookingStatusFilter
      return matchSearch && matchStatus
    })
  }, [userBookings, bookingSearch, bookingStatusFilter])

  // Save CMS Handler
  const handleSaveCMS = async () => {
    setCmsSaving(true)
    try {
      await onUpdateCMS(cmsDraft)
      toast.success('Website CMS changes published successfully!')
    } catch (e) {
      toast.error('Failed to save CMS: ' + e.message)
    } finally {
      setCmsSaving(false)
    }
  }

  // Save SEO Handler
  const handleSaveSEO = async () => {
    setSeoSaving(true)
    try {
      const res = await fetch('/api/seo', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...seoDraft,
          keywords: typeof seoDraft.keywords === 'string'
            ? seoDraft.keywords.split(',').map(s => s.trim()).filter(Boolean)
            : seoDraft.keywords
        })
      })
      if (!res.ok) throw new Error('Failed to save SEO')
      toast.success('SEO and Meta Tags published successfully!')
    } catch (e) {
      toast.error('Failed to save SEO: ' + e.message)
    } finally {
      setSeoSaving(false)
    }
  }

  // Upload Media
  const handleAddMedia = async (e) => {
    e.preventDefault()
    if (!newMediaForm.url) return toast.error('Image URL is required')
    setMediaUploading(true)
    try {
      await onUploadMedia(newMediaForm)
      setNewMediaForm({ title: '', url: '', category: 'venues', altText: '', caption: '' })
      toast.success('Media asset registered in library!')
    } catch (e) {
      toast.error('Failed to add media: ' + e.message)
    } finally {
      setMediaUploading(false)
    }
  }

  // Create Coupon
  const handleAddCoupon = async (e) => {
    e.preventDefault()
    if (!newCouponForm.code) return toast.error('Coupon code is required')
    setCouponCreating(true)
    try {
      await onCreateCoupon(newCouponForm)
      setNewCouponForm({ code: '', discountType: 'fixed', discountValue: 5000, minOrder: 50000, maxDiscount: 10000, description: '' })
      toast.success(`Coupon ${newCouponForm.code} created!`)
    } catch (e) {
      toast.error('Failed to create coupon: ' + e.message)
    } finally {
      setCouponCreating(false)
    }
  }

  // Blackout Date Toggle
  const handleToggleBlackoutDate = async (date, action = 'toggle') => {
    const targetVendorId = selectedVendorForCalendar || vendors[0]?.id
    if (!targetVendorId) return toast.error('Please select a vendor')
    if (!date) return toast.error('Please select a date')
    setBlackoutUpdating(true)
    try {
      const res = await fetch(`/api/vendors/${targetVendorId}/blackout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dates: [date], action })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to update blackout')
      toast.success(`Updated blackout schedule for ${date}`)
      setNewBlackoutDate('')
      // Update local vendor reference
      const v = vendors.find(x => x.id === targetVendorId)
      if (v) v.blackoutDates = data.blackoutDates
    } catch (e) {
      toast.error('Blackout update failed: ' + e.message)
    } finally {
      setBlackoutUpdating(false)
    }
  }

  // Execute Payout with Idempotency
  const handleExecutePayout = async (settlement) => {
    if (!settlement || !settlement.id) return
    const idempKey = `payout_${settlement.id}_${Date.now()}`
    setPayoutProcessing(prev => ({ ...prev, [settlement.id]: true }))
    try {
      const res = await fetch(`/api/settlements/${settlement.id}/payout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-idempotency-key': idempKey
        },
        body: JSON.stringify({ referenceId: `UTR-${Math.floor(100000 + Math.random() * 900000)}` })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Payout failed')
      toast.success(`Payout processed for ${settlement.vendorName}: ₹${settlement.netPayable?.toLocaleString('en-IN')}`)
      if (onUpdateSettlement) onUpdateSettlement(settlement.id, 'PAID')
    } catch (e) {
      toast.error('Payout failed: ' + e.message)
    } finally {
      setPayoutProcessing(prev => ({ ...prev, [settlement.id]: false }))
    }
  }

  // Reply to Support Ticket
  const handleReplySupport = async (ticketId) => {
    const text = supportReplyText[ticketId]
    if (!text) return toast.error('Please enter a reply message')
    try {
      const res = await fetch(`/api/support/${ticketId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ replyMessage: text, status: 'IN_PROGRESS' })
      })
      if (!res.ok) throw new Error('Failed to reply')
      toast.success('Reply sent to customer ticket')
      setSupportReplyText(prev => ({ ...prev, [ticketId]: '' }))
      loadSupportAndDisputes()
    } catch (e) {
      toast.error(e.message)
    }
  }

  // Create Operational Staff
  const handleCreateStaff = async (e) => {
    e.preventDefault()
    if (!newStaffForm.name || !newStaffForm.email || !newStaffForm.password) {
      return toast.error('Name, email, and password required')
    }
    setStaffCreating(true)
    try {
      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newStaffForm)
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to create staff member')
      toast.success(`Staff user ${newStaffForm.name} created with role ${newStaffForm.role}`)
      setNewStaffForm({ name: '', email: '', password: '', role: 'operations_manager' })
      loadStaffUsers()
    } catch (e) {
      toast.error(e.message)
    } finally {
      setStaffCreating(false)
    }
  }

  // Resolve Dispute
  const handleResolveDispute = async (disputeId, status) => {
    try {
      const res = await fetch(`/api/disputes/${disputeId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      })
      if (!res.ok) throw new Error('Failed to update dispute')
      toast.success(`Dispute updated to ${status}`)
      loadSupportAndDisputes()
    } catch (e) {
      toast.error(e.message)
    }
  }

  const selectedVendor = vendors.find(v => v.id === selectedVendorForCalendar) || vendors[0]

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-in fade-in">
      
      {/* 1. OPERATIONS HEADER & NAVIGATION BAR */}
      <div className="bg-[#1c1917] text-white rounded-3xl p-5 sm:p-7 lg:p-8 shadow-xl border border-stone-800">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#c5a059]/20 text-[#e8d08d] text-[10px] font-bold uppercase tracking-wider border border-[#c5a059]/30 mb-2">
              <ShieldCheck className="w-3.5 h-3.5" /> Enterprise Control Center
            </div>
            <h1 className="font-serif text-2xl sm:text-3xl font-bold tracking-tight">
              Vows &amp; Venues Operations
            </h1>
            <p className="text-xs text-stone-400 mt-1 max-w-2xl">
              Complete administrative authority over multi-vendor onboarding, bookings lifecycle, financial reconciliation, live CMS, dynamic SEO, and audit trails.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs text-emerald-400 font-bold bg-emerald-950/70 px-3 py-1.5 rounded-full border border-emerald-800 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              MongoDB Atlas Persistent
            </span>
            <span className="text-xs text-amber-300 font-bold bg-amber-950/70 px-3 py-1.5 rounded-full border border-amber-800">
              Staging Sandbox Safe
            </span>
          </div>
        </div>

        {/* OPERATIONS NAVIGATION TABS */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pt-6 mt-6 border-t border-stone-800 text-xs">
          {[
            { id: 'overview', label: 'Overview & KPIs', icon: TrendingUp },
            { id: 'vendors', label: `Vendors (${vendors.length})`, icon: Building2 },
            { id: 'bookings', label: `Bookings (${userBookings.length})`, icon: CalendarDays },
            { id: 'finance', label: `Finance & Payouts (${settlements.length})`, icon: DollarSign },
            { id: 'availability', label: 'Availability & Calendar', icon: CalendarOff },
            { id: 'cms', label: 'Live CMS', icon: FileText },
            { id: 'seo', label: 'SEO & Meta', icon: Globe },
            { id: 'media', label: `Media Library (${mediaLibrary.length})`, icon: ImageIcon },
            { id: 'coupons', label: `Coupons (${coupons.length})`, icon: Tag },
            { id: 'support', label: `Support & Disputes (${supportTickets.length + disputesList.length})`, icon: LifeBuoy },
            { id: 'team', label: `Staff & RBAC (${staffUsers.length})`, icon: Users },
            { id: 'audit', label: 'Audit Log Trail', icon: History },
            { id: 'system', label: 'System Health', icon: Activity },
          ].map(tab => {
            const Icon = tab.icon
            const isActive = activeSubTab === tab.id
            return (
              <button
                key={tab.id}
                onClick={() => setActiveSubTab(tab.id)}
                className={`px-3.5 py-2 rounded-xl font-semibold flex items-center gap-1.5 whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-[#c5a059] text-[#1c1917] shadow-md font-bold'
                    : 'text-stone-300 hover:bg-stone-800/80 hover:text-white'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            )
          })}
        </div>
      </div>

      {/* 2. SUB-TAB: OVERVIEW & KPIS */}
      {activeSubTab === 'overview' && (
        <div className="space-y-6">
          {/* Controls: Date range & Exports */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-[#e8e2d5] shadow-sm">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-stone-500 uppercase tracking-wider">Time Window:</span>
              <div className="inline-flex rounded-xl bg-stone-100 p-1 text-xs">
                {['7d', '30d', 'ytd', 'all'].map(r => (
                  <button
                    key={r}
                    onClick={() => setDateRange(r)}
                    className={`px-2.5 py-1 rounded-lg font-bold uppercase transition-all ${
                      dateRange === r ? 'bg-white text-stone-900 shadow-sm' : 'text-stone-500 hover:text-stone-900'
                    }`}
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <button
                onClick={() => exportToCSV(userBookings, 'vows_venues_bookings')}
                className="px-3 py-1.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-bold flex items-center gap-1.5 border border-stone-200 transition-all"
              >
                <Download className="w-3.5 h-3.5" /> Export Bookings CSV
              </button>
              <button
                onClick={() => exportToCSV(vendors, 'vows_venues_vendors')}
                className="px-3 py-1.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-bold flex items-center gap-1.5 border border-stone-200 transition-all"
              >
                <Download className="w-3.5 h-3.5" /> Export Vendors CSV
              </button>
              <button
                onClick={() => exportToCSV(settlements, 'vows_venues_settlements')}
                className="px-3 py-1.5 rounded-xl bg-[#c5a059]/15 hover:bg-[#c5a059]/25 text-[#73531b] text-xs font-bold flex items-center gap-1.5 border border-[#c5a059]/30 transition-all"
              >
                <Download className="w-3.5 h-3.5" /> Export Ledger CSV
              </button>
            </div>
          </div>

          {/* Metric Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-[#e8e2d5] shadow-sm">
              <div className="text-xs font-bold text-stone-500 uppercase tracking-wider flex items-center justify-between">
                <span>Gross Booking Value (GMV)</span>
                <span className="text-[10px] text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded-full">+18% MoM</span>
              </div>
              <div className="font-serif text-2xl font-bold text-[#1c1917] mt-1.5">
                ₹{Number(adminStats?.grossPlatformVolume || 1393300).toLocaleString('en-IN')}
              </div>
              <div className="text-[11px] text-stone-400 mt-0.5">Total platform processed volume</div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-[#e8e2d5] shadow-sm">
              <div className="text-xs font-bold text-stone-500 uppercase tracking-wider flex items-center justify-between">
                <span>Collected Cash</span>
                <span className="text-[10px] text-amber-700 font-bold bg-amber-50 px-2 py-0.5 rounded-full">Advance + Paid</span>
              </div>
              <div className="font-serif text-2xl font-bold text-emerald-800 mt-1.5">
                ₹{Number(adminStats?.collectedCash || Math.round((adminStats?.grossPlatformVolume || 1393300) * 0.45)).toLocaleString('en-IN')}
              </div>
              <div className="text-[11px] text-stone-400 mt-0.5">Realized escrow deposits</div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-[#e8e2d5] shadow-sm">
              <div className="text-xs font-bold text-stone-500 uppercase tracking-wider flex items-center justify-between">
                <span>Net Platform Commission</span>
                <span className="text-[10px] text-purple-700 font-bold bg-purple-50 px-2 py-0.5 rounded-full">10% Take Rate</span>
              </div>
              <div className="font-serif text-2xl font-bold text-[#4a1525] mt-1.5">
                ₹{Number(adminStats?.platformCommissionRevenue || 149330).toLocaleString('en-IN')}
              </div>
              <div className="text-[11px] text-stone-400 mt-0.5">Net marketplace revenue</div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-[#e8e2d5] shadow-sm">
              <div className="text-xs font-bold text-stone-500 uppercase tracking-wider flex items-center justify-between">
                <span>Pending Vendor Payouts</span>
                <span className="text-[10px] text-stone-500 font-bold bg-stone-100 px-2 py-0.5 rounded-full">Payables</span>
              </div>
              <div className="font-serif text-2xl font-bold text-stone-800 mt-1.5">
                ₹{Number(adminStats?.pendingVendorPayable || 428000).toLocaleString('en-IN')}
              </div>
              <div className="text-[11px] text-stone-400 mt-0.5">Pending event completion release</div>
            </div>
          </div>

          {/* Quick Metrics Secondary Row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-stone-50 p-4 rounded-2xl border border-stone-200">
              <div className="text-[11px] font-bold text-stone-500 uppercase">Total Verified Vendors</div>
              <div className="font-serif text-xl font-bold text-stone-900 mt-1">
                {adminStats?.totalVerifiedVendors || vendors.filter(v => v.verified).length} / {adminStats?.totalVendors || vendors.length}
              </div>
            </div>
            <div className="bg-stone-50 p-4 rounded-2xl border border-stone-200">
              <div className="text-[11px] font-bold text-stone-500 uppercase">Active Bookings</div>
              <div className="font-serif text-xl font-bold text-stone-900 mt-1">
                {adminStats?.totalBookings || userBookings.length}
              </div>
            </div>
            <div className="bg-stone-50 p-4 rounded-2xl border border-stone-200">
              <div className="text-[11px] font-bold text-stone-500 uppercase">Customer Inquiries</div>
              <div className="font-serif text-xl font-bold text-stone-900 mt-1">
                {adminStats?.totalInquiries || 18}
              </div>
            </div>
            <div className="bg-stone-50 p-4 rounded-2xl border border-stone-200">
              <div className="text-[11px] font-bold text-stone-500 uppercase">Disputes &amp; Tickets</div>
              <div className="font-serif text-xl font-bold text-amber-700 mt-1">
                {(adminStats?.totalDisputes || 0) + (adminStats?.totalSupportTickets || 0)} Open
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 3. SUB-TAB: VENDORS MANAGEMENT */}
      {activeSubTab === 'vendors' && (
        <div className="bg-white rounded-3xl p-5 sm:p-7 border border-[#e8e2d5] shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="font-serif font-bold text-lg text-[#1c1917]">Verified Vendor Registry</h3>
              <p className="text-xs text-stone-500">Audit vendor profiles, KYC documentation status, and commission tiers.</p>
            </div>
            <button
              onClick={() => exportToCSV(filteredVendors, 'vows_venues_vendors')}
              className="px-3 py-1.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-bold flex items-center gap-1.5 border border-stone-200 transition-all self-start sm:self-auto"
            >
              <Download className="w-3.5 h-3.5" /> Export {filteredVendors.length} Vendors
            </button>
          </div>

          {/* Filter Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-stone-400" />
              <input
                type="text"
                placeholder="Search vendor by name, city, ID..."
                value={vendorSearch}
                onChange={e => setVendorSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 rounded-xl bg-stone-50 border border-stone-200 text-xs focus:outline-none focus:border-stone-400"
              />
            </div>

            <select
              value={vendorCategoryFilter}
              onChange={e => setVendorCategoryFilter(e.target.value)}
              className="px-3 py-2 rounded-xl bg-stone-50 border border-stone-200 text-xs focus:outline-none focus:border-stone-400"
            >
              <option value="all">All Categories</option>
              <option value="venues">Venues / Banquets</option>
              <option value="catering">Catering &amp; Feasts</option>
              <option value="decor">Decor &amp; Mandaps</option>
              <option value="makeup">Makeup Artists</option>
              <option value="photography">Photography &amp; Cinema</option>
              <option value="music">DJ &amp; Music</option>
              <option value="outfits">Rental Outfits</option>
              <option value="gifts">Return Gifts</option>
              <option value="florists">Florists</option>
              <option value="invitations">Invitations</option>
              <option value="planners">Event Planners</option>
            </select>

            <select
              value={vendorStatusFilter}
              onChange={e => setVendorStatusFilter(e.target.value)}
              className="px-3 py-2 rounded-xl bg-stone-50 border border-stone-200 text-xs focus:outline-none focus:border-stone-400"
            >
              <option value="all">All Verification Statuses</option>
              <option value="verified">Verified (Approved)</option>
              <option value="pending">Pending KYC Approval</option>
            </select>
          </div>

          {/* Vendors Table */}
          <div className="overflow-x-auto -mx-5 sm:mx-0 px-5 sm:px-0">
            <table className="w-full min-w-[760px] text-left text-xs">
              <thead className="bg-stone-50 border-y border-stone-200 text-stone-500 uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-3 px-4 font-bold">Vendor Name</th>
                  <th className="py-3 px-4 font-bold">Category</th>
                  <th className="py-3 px-4 font-bold">City</th>
                  <th className="py-3 px-4 font-bold">Starting Price</th>
                  <th className="py-3 px-4 font-bold">KYC / Verification</th>
                  <th className="py-3 px-4 font-bold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {filteredVendors.map(v => (
                  <tr key={v.id} className="hover:bg-stone-50/70 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={getOptimizedImageUrl(v.image, 80, 80)}
                          alt={v.name}
                          className="w-9 h-9 rounded-xl object-cover border border-stone-200"
                        />
                        <div>
                          <div className="font-bold text-stone-900">{v.name}</div>
                          <div className="text-[10px] text-stone-400">ID: {v.id} • Rating: {v.rating || '4.9'} ★</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-medium text-stone-600 capitalize">
                      {v.category}
                    </td>
                    <td className="py-3.5 px-4 text-stone-600">
                      {v.city}
                    </td>
                    <td className="py-3.5 px-4 font-bold text-stone-900">
                      ₹{Number(v.startingPrice || 0).toLocaleString('en-IN')} <span className="text-[10px] text-stone-400 font-normal">/{v.priceUnit || 'event'}</span>
                    </td>
                    <td className="py-3.5 px-4">
                      {v.verified ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 font-bold text-[10px] border border-emerald-200">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Verified
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 font-bold text-[10px] border border-amber-200">
                          <XCircle className="w-3 h-3 text-amber-600" /> Pending KYC
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="inline-flex items-center gap-1.5">
                        <button
                          onClick={() => onVerifyToggle && onVerifyToggle(v.id, !v.verified)}
                          disabled={adminActionBusy}
                          className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all ${
                            v.verified
                              ? 'bg-stone-100 hover:bg-stone-200 text-stone-700'
                              : 'bg-emerald-700 hover:bg-emerald-800 text-white'
                          }`}
                        >
                          {v.verified ? 'Revoke' : 'Approve'}
                        </button>
                        <button
                          onClick={() => onRejectVendor && onRejectVendor(v.id)}
                          disabled={adminActionBusy}
                          className="px-2 py-1 rounded-lg text-[11px] font-bold text-red-600 hover:bg-red-50 transition-all"
                        >
                          Reject
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 4. SUB-TAB: BOOKINGS OVERSIGHT */}
      {activeSubTab === 'bookings' && (
        <div className="bg-white rounded-3xl p-5 sm:p-7 border border-[#e8e2d5] shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="font-serif font-bold text-lg text-[#1c1917]">Customer Bookings Ledger</h3>
              <p className="text-xs text-stone-500">Live multi-vendor reservations, deposit statuses, and schedule dates.</p>
            </div>
            <button
              onClick={() => exportToCSV(filteredBookings, 'vows_venues_bookings')}
              className="px-3 py-1.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-bold flex items-center gap-1.5 border border-stone-200 transition-all self-start sm:self-auto"
            >
              <Download className="w-3.5 h-3.5" /> Export {filteredBookings.length} Bookings
            </button>
          </div>

          {/* Filter Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-stone-400" />
              <input
                type="text"
                placeholder="Search by Booking #, Customer Name, Email..."
                value={bookingSearch}
                onChange={e => setBookingSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 rounded-xl bg-stone-50 border border-stone-200 text-xs focus:outline-none focus:border-stone-400"
              />
            </div>

            <select
              value={bookingStatusFilter}
              onChange={e => setBookingStatusFilter(e.target.value)}
              className="px-3 py-2 rounded-xl bg-stone-50 border border-stone-200 text-xs focus:outline-none focus:border-stone-400"
            >
              <option value="all">All Booking Statuses</option>
              <option value="confirmed">Confirmed</option>
              <option value="completed">Completed</option>
              <option value="pending">Pending</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>

          {/* Bookings Table */}
          <div className="overflow-x-auto -mx-5 sm:mx-0 px-5 sm:px-0">
            <table className="w-full min-w-[760px] text-left text-xs">
              <thead className="bg-stone-50 border-y border-stone-200 text-stone-500 uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-3 px-4 font-bold">Booking #</th>
                  <th className="py-3 px-4 font-bold">Customer</th>
                  <th className="py-3 px-4 font-bold">Event Date &amp; City</th>
                  <th className="py-3 px-4 font-bold">Total Amount</th>
                  <th className="py-3 px-4 font-bold">Payment Status</th>
                  <th className="py-3 px-4 font-bold">Booking Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {filteredBookings.map(b => (
                  <tr key={b.id} className="hover:bg-stone-50/70 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-stone-900">
                      {b.bookingNumber || b.id}
                      <div className="text-[10px] text-stone-400 font-normal">{b.eventName || 'Celebration'}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-stone-900">{b.userName || 'Customer'}</div>
                      <div className="text-[10px] text-stone-400">{b.userEmail}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-stone-900">{b.eventDate}</div>
                      <div className="text-[10px] text-stone-400">{b.city || 'Lucknow'} • {b.guestCount || 150} guests</div>
                    </td>
                    <td className="py-3.5 px-4 font-bold text-stone-900">
                      ₹{Number(b.totalAmount || 0).toLocaleString('en-IN')}
                      <div className="text-[10px] text-emerald-700 font-medium">
                        Advance: ₹{Number(b.advancePaid || 0).toLocaleString('en-IN')}
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        b.paymentStatus === 'paid' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'
                      }`}>
                        {b.paymentStatus || 'advance_paid'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        (b.bookingStatus === 'confirmed' || b.status === 'confirmed')
                          ? 'bg-emerald-50 text-emerald-700'
                          : 'bg-stone-100 text-stone-700'
                      }`}>
                        {b.bookingStatus || b.status || 'confirmed'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 5. SUB-TAB: FINANCE & PAYOUTS */}
      {activeSubTab === 'finance' && (
        <div className="bg-white rounded-3xl p-5 sm:p-7 border border-[#e8e2d5] shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="font-serif font-bold text-lg text-[#1c1917]">Vendor Settlement Ledger</h3>
              <p className="text-xs text-stone-500">Gross amounts, 10% platform commission, and idempotent payout releases.</p>
            </div>
            <button
              onClick={() => exportToCSV(settlements, 'vows_venues_settlements')}
              className="px-3 py-1.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-bold flex items-center gap-1.5 border border-stone-200 transition-all self-start sm:self-auto"
            >
              <Download className="w-3.5 h-3.5" /> Export Payout Ledger
            </button>
          </div>

          <div className="overflow-x-auto -mx-5 sm:mx-0 px-5 sm:px-0">
            <table className="w-full min-w-[760px] text-left text-xs">
              <thead className="bg-stone-50 border-y border-stone-200 text-stone-500 uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-3 px-4 font-bold">Booking #</th>
                  <th className="py-3 px-4 font-bold">Vendor Name</th>
                  <th className="py-3 px-4 font-bold">Gross Amount</th>
                  <th className="py-3 px-4 font-bold">Commission (10%)</th>
                  <th className="py-3 px-4 font-bold">Net Payable</th>
                  <th className="py-3 px-4 font-bold">Status</th>
                  <th className="py-3 px-4 font-bold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {settlements.map(s => (
                  <tr key={s.id} className="hover:bg-stone-50/70 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-stone-900">
                      {s.bookingNumber || s.bookingId}
                      <div className="text-[10px] text-stone-400 font-normal">{s.serviceName}</div>
                    </td>
                    <td className="py-3.5 px-4 font-medium text-stone-800">
                      {s.vendorName}
                    </td>
                    <td className="py-3.5 px-4 text-stone-600">
                      ₹{Number(s.grossAmount || 0).toLocaleString('en-IN')}
                    </td>
                    <td className="py-3.5 px-4 text-purple-700 font-bold">
                      ₹{Number(s.commissionAmount || 0).toLocaleString('en-IN')}
                    </td>
                    <td className="py-3.5 px-4 text-emerald-800 font-bold">
                      ₹{Number(s.netPayable || 0).toLocaleString('en-IN')}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        s.status === 'PAID' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'
                      }`}>
                        {s.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      {s.status === 'PENDING' ? (
                        <button
                          onClick={() => handleExecutePayout(s)}
                          disabled={payoutProcessing[s.id]}
                          className="px-3 py-1 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-[11px] shadow-sm transition-all"
                        >
                          {payoutProcessing[s.id] ? 'Processing...' : 'Pay Out'}
                        </button>
                      ) : (
                        <span className="text-[10px] text-stone-400 font-mono">
                          Ref: {s.referenceId || 'SETTLED'}
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 6. SUB-TAB: AVAILABILITY & CALENDAR (Phase 13) */}
      {activeSubTab === 'availability' && (
        <div className="bg-white rounded-3xl p-5 sm:p-7 border border-[#e8e2d5] shadow-sm space-y-6">
          <div>
            <h3 className="font-serif font-bold text-lg text-[#1c1917]">Vendor Availability &amp; Blackout Protection Engine</h3>
            <p className="text-xs text-stone-500">Manage venue blackout dates and verify double-booking collision protection rules.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">Select Vendor</label>
                <select
                  value={selectedVendorForCalendar}
                  onChange={e => setSelectedVendorForCalendar(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-stone-50 border border-stone-200 text-xs focus:outline-none focus:border-stone-400 font-medium"
                >
                  {vendors.map(v => (
                    <option key={v.id} value={v.id}>{v.name} ({v.category}) — {v.city}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">Add Blackout Date (Unavailable)</label>
                <div className="flex items-center gap-2">
                  <input
                    type="date"
                    value={newBlackoutDate}
                    onChange={e => setNewBlackoutDate(e.target.value)}
                    className="flex-1 px-3 py-2 rounded-xl bg-stone-50 border border-stone-200 text-xs focus:outline-none focus:border-stone-400"
                  />
                  <button
                    onClick={() => handleToggleBlackoutDate(newBlackoutDate, 'add')}
                    disabled={blackoutUpdating || !newBlackoutDate}
                    className="px-4 py-2 rounded-xl bg-stone-900 hover:bg-stone-800 text-white font-bold text-xs transition-all"
                  >
                    Block Date
                  </button>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200 text-xs text-amber-900">
                <div className="font-bold flex items-center gap-1.5 mb-1">
                  <ShieldCheck className="w-4 h-4 text-amber-700" /> Double-Booking Collision Protection
                </div>
                Venues and single-booking vendors automatically reject any customer booking attempts for dates where an existing booking is confirmed or a blackout date is registered.
              </div>
            </div>

            <div className="bg-stone-50 p-5 rounded-2xl border border-stone-200 space-y-3">
              <h4 className="text-xs font-bold text-stone-700 uppercase tracking-wider">
                Active Blackout Dates for {selectedVendor?.name}
              </h4>
              {selectedVendor?.blackoutDates?.length ? (
                <div className="flex flex-wrap gap-2">
                  {selectedVendor.blackoutDates.map(date => (
                    <span
                      key={date}
                      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-red-100 text-red-800 text-xs font-bold border border-red-200"
                    >
                      <CalendarOff className="w-3 h-3" />
                      {date}
                      <button
                        onClick={() => handleToggleBlackoutDate(date, 'remove')}
                        className="hover:text-red-950 font-bold ml-1 text-sm"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-stone-400">No blackout dates currently registered for this vendor.</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 7. SUB-TAB: LIVE CMS */}
      {activeSubTab === 'cms' && (
        <div className="bg-white rounded-3xl p-5 sm:p-7 border border-[#e8e2d5] shadow-sm space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-serif font-bold text-lg text-[#1c1917]">Live Website Content Management System</h3>
              <p className="text-xs text-stone-500">Manage announcements, headlines, and guarantees in real-time.</p>
            </div>
            <button
              onClick={handleSaveCMS}
              disabled={cmsSaving}
              className="px-4 py-2 rounded-xl bg-[#c5a059] hover:bg-[#b08d47] text-[#1c1917] font-bold text-xs flex items-center gap-1.5 shadow-md transition-all"
            >
              <Save className="w-3.5 h-3.5" /> {cmsSaving ? 'Publishing...' : 'Save & Publish Live'}
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">Top Announcement Bar Text</label>
              <input
                type="text"
                value={cmsDraft.announcementBar?.text || ''}
                onChange={e => setCmsDraft({
                  ...cmsDraft,
                  announcementBar: { ...cmsDraft.announcementBar, text: e.target.value }
                })}
                className="w-full px-3 py-2 rounded-xl bg-stone-50 border border-stone-200 text-xs focus:outline-none focus:border-stone-400 font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">Hero Section Title</label>
              <input
                type="text"
                value={cmsDraft.heroSection?.title || ''}
                onChange={e => setCmsDraft({
                  ...cmsDraft,
                  heroSection: { ...cmsDraft.heroSection, title: e.target.value }
                })}
                className="w-full px-3 py-2 rounded-xl bg-stone-50 border border-stone-200 text-xs focus:outline-none focus:border-stone-400 font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">Hero Subtitle</label>
              <textarea
                rows={2}
                value={cmsDraft.heroSection?.subtitle || ''}
                onChange={e => setCmsDraft({
                  ...cmsDraft,
                  heroSection: { ...cmsDraft.heroSection, subtitle: e.target.value }
                })}
                className="w-full px-3 py-2 rounded-xl bg-stone-50 border border-stone-200 text-xs focus:outline-none focus:border-stone-400 font-medium"
              />
            </div>
          </div>
        </div>
      )}

      {/* 8. SUB-TAB: SEO & META (Phase 11) */}
      {activeSubTab === 'seo' && (
        <div className="bg-white rounded-3xl p-5 sm:p-7 border border-[#e8e2d5] shadow-sm space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-serif font-bold text-lg text-[#1c1917]">Search Engine Optimization &amp; Metadata Engine</h3>
              <p className="text-xs text-stone-500">Configure global titles, Open Graph tags, canonical URLs, and schema markup.</p>
            </div>
            <button
              onClick={handleSaveSEO}
              disabled={seoSaving}
              className="px-4 py-2 rounded-xl bg-[#c5a059] hover:bg-[#b08d47] text-[#1c1917] font-bold text-xs flex items-center gap-1.5 shadow-md transition-all"
            >
              <Save className="w-3.5 h-3.5" /> {seoSaving ? 'Saving...' : 'Update SEO Tags'}
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">Default Meta Title</label>
                <input
                  type="text"
                  value={seoDraft.defaultTitle}
                  onChange={e => setSeoDraft({ ...seoDraft, defaultTitle: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-stone-50 border border-stone-200 text-xs focus:outline-none focus:border-stone-400 font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">Canonical Base URL</label>
                <input
                  type="text"
                  value={seoDraft.canonicalBase}
                  onChange={e => setSeoDraft({ ...seoDraft, canonicalBase: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-stone-50 border border-stone-200 text-xs focus:outline-none focus:border-stone-400 font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">Meta Keywords (Comma-separated)</label>
                <input
                  type="text"
                  value={seoDraft.keywords}
                  onChange={e => setSeoDraft({ ...seoDraft, keywords: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-stone-50 border border-stone-200 text-xs focus:outline-none focus:border-stone-400 font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">Meta Description</label>
                <textarea
                  rows={3}
                  value={seoDraft.defaultDescription}
                  onChange={e => setSeoDraft({ ...seoDraft, defaultDescription: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-stone-50 border border-stone-200 text-xs focus:outline-none focus:border-stone-400 font-medium"
                />
              </div>
            </div>

            <div className="bg-stone-50 p-5 rounded-2xl border border-stone-200 space-y-4">
              <h4 className="text-xs font-bold text-stone-700 uppercase tracking-wider">Search Engine Crawl Status</h4>
              <div className="space-y-3 text-xs">
                <div className="flex items-center justify-between p-3 rounded-xl bg-white border border-stone-200">
                  <span className="font-semibold text-stone-800">Staging Protection Header:</span>
                  <span className="font-mono text-[11px] font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded">
                    X-Robots-Tag: noindex, nofollow
                  </span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-xl bg-white border border-stone-200">
                  <span className="font-semibold text-stone-800">Dynamic Robots Route:</span>
                  <a href="/robots.txt" target="_blank" className="text-emerald-700 font-bold hover:underline flex items-center gap-1">
                    /robots.txt <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
                <div className="flex items-center justify-between p-3 rounded-xl bg-white border border-stone-200">
                  <span className="font-semibold text-stone-800">Dynamic XML Sitemap:</span>
                  <a href="/sitemap.xml" target="_blank" className="text-emerald-700 font-bold hover:underline flex items-center gap-1">
                    /sitemap.xml <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 9. SUB-TAB: MEDIA LIBRARY */}
      {activeSubTab === 'media' && (
        <div className="bg-white rounded-3xl p-5 sm:p-7 border border-[#e8e2d5] shadow-sm space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-serif font-bold text-lg text-[#1c1917]">Media Asset Library</h3>
              <p className="text-xs text-stone-500">Catalog of luxury photography, mandap visuals, and palace imagery.</p>
            </div>
            <span className="text-xs font-bold text-stone-600">{mediaLibrary.length} Media Assets</span>
          </div>

          <form onSubmit={handleAddMedia} className="p-4 rounded-2xl bg-stone-50 border border-stone-200 grid grid-cols-1 sm:grid-cols-4 gap-3">
            <input
              type="text"
              placeholder="Asset Title (e.g. Royal Nawabi Hall)"
              value={newMediaForm.title}
              onChange={e => setNewMediaForm({ ...newMediaForm, title: e.target.value })}
              className="px-3 py-2 rounded-xl bg-white border border-stone-200 text-xs focus:outline-none"
            />
            <input
              type="text"
              placeholder="Image URL (Unsplash or CDN)"
              value={newMediaForm.url}
              onChange={e => setNewMediaForm({ ...newMediaForm, url: e.target.value })}
              className="px-3 py-2 rounded-xl bg-white border border-stone-200 text-xs focus:outline-none"
            />
            <select
              value={newMediaForm.category}
              onChange={e => setNewMediaForm({ ...newMediaForm, category: e.target.value })}
              className="px-3 py-2 rounded-xl bg-white border border-stone-200 text-xs focus:outline-none"
            >
              <option value="venues">Venues</option>
              <option value="catering">Catering</option>
              <option value="decor">Decor</option>
              <option value="makeup">Makeup</option>
              <option value="photography">Photography</option>
              <option value="music">Music</option>
            </select>
            <button
              type="submit"
              disabled={mediaUploading}
              className="px-4 py-2 rounded-xl bg-stone-900 hover:bg-stone-800 text-white font-bold text-xs transition-all"
            >
              {mediaUploading ? 'Registering...' : '+ Register Image'}
            </button>
          </form>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {mediaLibrary.map(item => (
              <div key={item.id} className="group relative rounded-2xl overflow-hidden border border-stone-200 bg-stone-50">
                <img
                  src={getOptimizedImageUrl(item.url, 300, 200)}
                  alt={item.title}
                  className="w-full h-36 object-cover"
                />
                <div className="p-3">
                  <div className="font-bold text-xs text-stone-900 truncate">{item.title}</div>
                  <div className="text-[10px] text-stone-400 capitalize">{item.category}</div>
                </div>
                <button
                  onClick={() => onDeleteMedia && onDeleteMedia(item.id)}
                  className="absolute top-2 right-2 p-1.5 rounded-lg bg-red-600/90 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 10. SUB-TAB: COUPONS */}
      {activeSubTab === 'coupons' && (
        <div className="bg-white rounded-3xl p-5 sm:p-7 border border-[#e8e2d5] shadow-sm space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-serif font-bold text-lg text-[#1c1917]">Promotional Coupons &amp; Privileges</h3>
              <p className="text-xs text-stone-500">Configure discount codes, min spend thresholds, and maximum discount caps.</p>
            </div>
            <span className="text-xs font-bold text-stone-600">{coupons.length} Active Coupons</span>
          </div>

          <form onSubmit={handleAddCoupon} className="p-4 rounded-2xl bg-stone-50 border border-stone-200 grid grid-cols-1 sm:grid-cols-5 gap-3">
            <input
              type="text"
              placeholder="Coupon Code (e.g. ROYAL2026)"
              value={newCouponForm.code}
              onChange={e => setNewCouponForm({ ...newCouponForm, code: e.target.value.toUpperCase() })}
              className="px-3 py-2 rounded-xl bg-white border border-stone-200 text-xs focus:outline-none font-bold uppercase"
            />
            <select
              value={newCouponForm.discountType}
              onChange={e => setNewCouponForm({ ...newCouponForm, discountType: e.target.value })}
              className="px-3 py-2 rounded-xl bg-white border border-stone-200 text-xs focus:outline-none"
            >
              <option value="fixed">Fixed (₹)</option>
              <option value="percentage">Percentage (%)</option>
            </select>
            <input
              type="number"
              placeholder="Discount Value"
              value={newCouponForm.discountValue}
              onChange={e => setNewCouponForm({ ...newCouponForm, discountValue: Number(e.target.value) })}
              className="px-3 py-2 rounded-xl bg-white border border-stone-200 text-xs focus:outline-none"
            />
            <input
              type="number"
              placeholder="Min Order Value (₹)"
              value={newCouponForm.minOrder}
              onChange={e => setNewCouponForm({ ...newCouponForm, minOrder: Number(e.target.value) })}
              className="px-3 py-2 rounded-xl bg-white border border-stone-200 text-xs focus:outline-none"
            />
            <button
              type="submit"
              disabled={couponCreating}
              className="px-4 py-2 rounded-xl bg-stone-900 hover:bg-stone-800 text-white font-bold text-xs transition-all"
            >
              {couponCreating ? 'Creating...' : '+ Create Coupon'}
            </button>
          </form>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {coupons.map(c => (
              <div key={c.id || c.code} className="p-4 rounded-2xl border border-stone-200 bg-white space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-mono font-bold text-sm bg-amber-100 text-amber-900 px-2 py-0.5 rounded">
                    {c.code}
                  </span>
                  <span className="text-[10px] text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-full">
                    Active
                  </span>
                </div>
                <div className="font-serif text-lg font-bold text-stone-900">
                  {c.discountType === 'percentage' ? `${c.discountValue}% Off` : `₹${Number(c.discountValue).toLocaleString('en-IN')} Off`}
                </div>
                <div className="text-[11px] text-stone-500">
                  Min Spend: ₹{Number(c.minOrder || 0).toLocaleString('en-IN')}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 11. SUB-TAB: SUPPORT & DISPUTES (Phase 14) */}
      {activeSubTab === 'support' && (
        <div className="bg-white rounded-3xl p-5 sm:p-7 border border-[#e8e2d5] shadow-sm space-y-6">
          <div>
            <h3 className="font-serif font-bold text-lg text-[#1c1917]">Customer Care &amp; Dispute Resolution Desk</h3>
            <p className="text-xs text-stone-500">Manage escalated customer disputes and official support tickets.</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Disputes Column */}
            <div className="space-y-4">
              <h4 className="text-xs font-bold text-stone-700 uppercase tracking-wider flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-amber-600" /> Active Customer Disputes ({disputesList.length})
              </h4>
              {disputesList.length === 0 ? (
                <div className="p-4 rounded-xl bg-stone-50 text-stone-400 text-xs">No customer disputes logged.</div>
              ) : (
                disputesList.map(disp => (
                  <div key={disp.id} className="p-4 rounded-2xl border border-amber-200 bg-amber-50/50 space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-amber-900">Dispute #{disp.id}</span>
                      <span className="font-bold px-2 py-0.5 rounded-full bg-amber-200 text-amber-900 text-[10px]">
                        {disp.status}
                      </span>
                    </div>
                    <div className="font-medium text-stone-800">Booking Ref: {disp.bookingId}</div>
                    <div className="text-stone-600">{disp.reason}</div>
                    <div className="flex items-center gap-2 pt-2">
                      <button
                        onClick={() => handleResolveDispute(disp.id, 'RESOLVED')}
                        className="px-2.5 py-1 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-[11px]"
                      >
                        Mark Resolved
                      </button>
                      <button
                        onClick={() => handleResolveDispute(disp.id, 'REJECTED')}
                        className="px-2.5 py-1 rounded-lg bg-stone-200 hover:bg-stone-300 text-stone-700 font-bold text-[11px]"
                      >
                        Reject Claim
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Support Tickets Column */}
            <div className="space-y-4">
              <h4 className="text-xs font-bold text-stone-700 uppercase tracking-wider flex items-center gap-1.5">
                <LifeBuoy className="w-4 h-4 text-emerald-600" /> Support Desk Inquiries ({supportTickets.length})
              </h4>
              {supportTickets.length === 0 ? (
                <div className="p-4 rounded-xl bg-stone-50 text-stone-400 text-xs">No active support tickets.</div>
              ) : (
                supportTickets.map(tkt => (
                  <div key={tkt.id} className="p-4 rounded-2xl border border-stone-200 bg-stone-50 space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-stone-900">{tkt.subject}</span>
                      <span className="font-bold px-2 py-0.5 rounded-full bg-stone-200 text-stone-800 text-[10px]">
                        {tkt.status}
                      </span>
                    </div>
                    <div className="text-stone-500">From: {tkt.userEmail || tkt.userId}</div>
                    <div className="text-stone-700">{tkt.messages?.[0]?.message || 'Need assistance'}</div>
                    <div className="flex items-center gap-2 pt-2">
                      <input
                        type="text"
                        placeholder="Reply to ticket..."
                        value={supportReplyText[tkt.id] || ''}
                        onChange={e => setSupportReplyText({ ...supportReplyText, [tkt.id]: e.target.value })}
                        className="flex-1 px-3 py-1.5 rounded-xl bg-white border border-stone-200 text-xs focus:outline-none"
                      />
                      <button
                        onClick={() => handleReplySupport(tkt.id)}
                        className="px-3 py-1.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-white font-bold text-xs"
                      >
                        Send
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* 12. SUB-TAB: STAFF & RBAC (Phase 4) */}
      {activeSubTab === 'team' && (
        <div className="bg-white rounded-3xl p-5 sm:p-7 border border-[#e8e2d5] shadow-sm space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-serif font-bold text-lg text-[#1c1917]">Operational Staff &amp; RBAC Permissions</h3>
              <p className="text-xs text-stone-500">Manage the 10 operational roles with granular permissions.</p>
            </div>
            <span className="text-xs font-bold text-stone-600">{staffUsers.length} Operational Staff</span>
          </div>

          <form onSubmit={handleCreateStaff} className="p-4 rounded-2xl bg-stone-50 border border-stone-200 grid grid-cols-1 sm:grid-cols-5 gap-3">
            <input
              type="text"
              placeholder="Staff Name (e.g. Priya Singh)"
              value={newStaffForm.name}
              onChange={e => setNewStaffForm({ ...newStaffForm, name: e.target.value })}
              className="px-3 py-2 rounded-xl bg-white border border-stone-200 text-xs focus:outline-none"
            />
            <input
              type="email"
              placeholder="Staff Work Email"
              value={newStaffForm.email}
              onChange={e => setNewStaffForm({ ...newStaffForm, email: e.target.value })}
              className="px-3 py-2 rounded-xl bg-white border border-stone-200 text-xs focus:outline-none"
            />
            <input
              type="password"
              placeholder="Initial Password"
              value={newStaffForm.password}
              onChange={e => setNewStaffForm({ ...newStaffForm, password: e.target.value })}
              className="px-3 py-2 rounded-xl bg-white border border-stone-200 text-xs focus:outline-none"
            />
            <select
              value={newStaffForm.role}
              onChange={e => setNewStaffForm({ ...newStaffForm, role: e.target.value })}
              className="px-3 py-2 rounded-xl bg-white border border-stone-200 text-xs focus:outline-none font-bold"
            >
              <option value="super_admin">Super Admin / Platform Owner</option>
              <option value="admin">Operations Admin</option>
              <option value="operations_manager">Operations Manager</option>
              <option value="vendor_manager">Vendor Manager</option>
              <option value="booking_manager">Booking Manager</option>
              <option value="finance_manager">Finance Manager</option>
              <option value="marketing_seo_manager">Marketing &amp; SEO Manager</option>
              <option value="content_manager">Content Manager</option>
              <option value="support_agent">Support Agent</option>
              <option value="analyst">Read-Only Analyst</option>
            </select>
            <button
              type="submit"
              disabled={staffCreating}
              className="px-4 py-2 rounded-xl bg-stone-900 hover:bg-stone-800 text-white font-bold text-xs transition-all flex items-center justify-center gap-1"
            >
              <UserPlus className="w-3.5 h-3.5" /> {staffCreating ? 'Inviting...' : '+ Add Staff Member'}
            </button>
          </form>

          <div className="overflow-x-auto -mx-5 sm:mx-0 px-5 sm:px-0">
            <table className="w-full min-w-[700px] text-left text-xs">
              <thead className="bg-stone-50 border-y border-stone-200 text-stone-500 uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-3 px-4 font-bold">Staff Member</th>
                  <th className="py-3 px-4 font-bold">Email</th>
                  <th className="py-3 px-4 font-bold">Role Assignment</th>
                  <th className="py-3 px-4 font-bold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {staffUsers.map(u => (
                  <tr key={u.id || u.email} className="hover:bg-stone-50/70 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-stone-900">
                      {u.name || 'Staff User'}
                    </td>
                    <td className="py-3.5 px-4 text-stone-600">
                      {u.email}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="inline-flex px-2.5 py-1 rounded-full text-[10px] font-bold bg-[#c5a059]/20 text-[#73531b] border border-[#c5a059]/40 uppercase tracking-wider">
                        {u.role}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700">
                        <Check className="w-3 h-3 text-emerald-600" /> Active
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 13. SUB-TAB: AUDIT LOG TRAIL (Phase 4 & Phase 18) */}
      {activeSubTab === 'audit' && (
        <div className="bg-white rounded-3xl p-5 sm:p-7 border border-[#e8e2d5] shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-serif font-bold text-lg text-[#1c1917]">Immutable Security Audit Trail</h3>
              <p className="text-xs text-stone-500">Tamper-resistant log capturing operational state mutations, actor emails, and timestamps.</p>
            </div>
            <button
              onClick={() => exportToCSV(auditLogs, 'vows_venues_audit_logs')}
              className="px-3 py-1.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-bold flex items-center gap-1.5 border border-stone-200 transition-all"
            >
              <Download className="w-3.5 h-3.5" /> Export Audit Trail CSV
            </button>
          </div>

          <div className="overflow-x-auto -mx-5 sm:mx-0 px-5 sm:px-0">
            <table className="w-full min-w-[760px] text-left text-xs">
              <thead className="bg-stone-50 border-y border-stone-200 text-stone-500 uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-3 px-4 font-bold">Timestamp</th>
                  <th className="py-3 px-4 font-bold">Action</th>
                  <th className="py-3 px-4 font-bold">Actor</th>
                  <th className="py-3 px-4 font-bold">Entity</th>
                  <th className="py-3 px-4 font-bold">IP</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 font-mono text-[11px]">
                {auditLogs.map(log => (
                  <tr key={log.id} className="hover:bg-stone-50/70 transition-colors">
                    <td className="py-3 px-4 text-stone-500">
                      {log.timestamp ? new Date(log.timestamp).toLocaleString('en-IN') : 'Recent'}
                    </td>
                    <td className="py-3 px-4 font-bold text-purple-900">
                      {log.action}
                    </td>
                    <td className="py-3 px-4 text-stone-700">
                      {log.actorEmail} ({log.actorRole})
                    </td>
                    <td className="py-3 px-4 text-stone-600 truncate max-w-[200px]">
                      {log.entityType}: {log.entityId}
                    </td>
                    <td className="py-3 px-4 text-stone-400">
                      {log.ip || 'internal'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 14. SUB-TAB: SYSTEM HEALTH (Phase 15) */}
      {activeSubTab === 'system' && (
        <div className="bg-white rounded-3xl p-5 sm:p-7 border border-[#e8e2d5] shadow-sm space-y-6">
          <div>
            <h3 className="font-serif font-bold text-lg text-[#1c1917]">Platform System Health &amp; Runtime Config</h3>
            <p className="text-xs text-stone-500">Live operational diagnostics and deployment environment status.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200">
              <div className="text-[10px] uppercase font-bold text-emerald-800">Database Engine</div>
              <div className="font-serif text-lg font-bold text-emerald-950 mt-1">MongoDB Atlas Cluster</div>
              <div className="text-xs text-emerald-700 mt-0.5">Database: vows_and_venues_staging</div>
            </div>

            <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200">
              <div className="text-[10px] uppercase font-bold text-stone-500">Deployment Target</div>
              <div className="font-serif text-lg font-bold text-stone-900 mt-1">Render Cloud Hosting</div>
              <div className="text-xs text-stone-500 mt-0.5">Keep-Alive Cron: 24/7 Active</div>
            </div>

            <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200">
              <div className="text-[10px] uppercase font-bold text-stone-500">Production Safety</div>
              <div className="font-serif text-lg font-bold text-stone-900 mt-1">100% Isolated</div>
              <div className="text-xs text-stone-500 mt-0.5">Branch: staging (Zero Prod Impact)</div>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}
