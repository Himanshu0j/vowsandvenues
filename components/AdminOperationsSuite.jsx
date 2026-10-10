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
  Clock,
  MessageSquare,
  Sparkles,
  Percent
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
  const [cmsSectionTab, setCmsSectionTab] = useState('visuals') // 'visuals' | 'text' | 'offers'

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

  // Live Price Negotiations & Chat State (Client Requested)
  const [negotiations, setNegotiations] = useState([])
  const [selectedNegId, setSelectedNegId] = useState(null)
  const [negSearch, setNegSearch] = useState('')
  const [negStatusFilter, setNegStatusFilter] = useState('all')
  const [adminReplyText, setAdminReplyText] = useState('')
  const [adminCounterPrice, setAdminCounterPrice] = useState('')
  const [adminPromoCode, setAdminPromoCode] = useState('')
  const [negBusy, setNegBusy] = useState(false)

  // Fetch negotiations from API
  const loadNegotiations = async () => {
    try {
      const token = localStorage.getItem('vv_token') || ''
      const headers = token ? { Authorization: `Bearer ${token}` } : {}
      const res = await fetch('/api/negotiations', { headers })
      if (res.ok) {
        const data = await res.json()
        if (Array.isArray(data)) {
          setNegotiations(data)
          if (!selectedNegId && data.length > 0) {
            setSelectedNegId(data[0].id)
          }
        }
      }
    } catch (_) {}
  }

  useEffect(() => {
    loadNegotiations()
  }, [])

  useEffect(() => {
    if (activeSubTab === 'negotiations') {
      loadNegotiations()
      const t = setInterval(loadNegotiations, 4500)
      return () => clearInterval(t)
    }
  }, [activeSubTab])

  const handleAdminSendMessage = async (negId) => {
    if (!adminReplyText.trim()) return
    setNegBusy(true)
    try {
      const token = localStorage.getItem('vv_token') || ''
      const res = await fetch(`/api/negotiations/${negId}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          text: adminReplyText.trim(),
          sender: 'Royal Concierge (Admin)',
          senderRole: 'admin'
        })
      })
      if (!res.ok) throw new Error('Failed to send message')
      setAdminReplyText('')
      toast.success('Reply sent to customer!')
      loadNegotiations()
    } catch (e) {
      toast.error(e.message)
    } finally {
      setNegBusy(false)
    }
  }

  const handleAdminSendCounterOffer = async (negId) => {
    if (!adminCounterPrice || Number(adminCounterPrice) <= 0) {
      return toast.error('Please enter a counter-offer price')
    }
    setNegBusy(true)
    try {
      const token = localStorage.getItem('vv_token') || ''
      const numPrice = Number(adminCounterPrice)
      const promo = adminPromoCode.trim() || `ROYAL_${Math.floor(1000 + Math.random() * 9000)}`
      const msg = adminReplyText.trim() || `Greetings! We reviewed your event details with the palace team. We are delighted to approve a special rate of ₹${numPrice.toLocaleString('en-IN')}. Please click Accept Offer to confirm.`

      const res = await fetch(`/api/negotiations/${negId}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          text: msg,
          sender: 'Royal Concierge (Admin)',
          senderRole: 'admin',
          offerPrice: numPrice,
          promoCode: promo,
          status: 'OFFER_MADE'
        })
      })
      if (!res.ok) throw new Error('Failed to send counter-offer')
      setAdminReplyText('')
      setAdminCounterPrice('')
      setAdminPromoCode('')
      toast.success(`Counter-offer of ₹${numPrice.toLocaleString('en-IN')} approved with promo ${promo}!`)
      loadNegotiations()
    } catch (e) {
      toast.error(e.message)
    } finally {
      setNegBusy(false)
    }
  }

  const handleAdminAcceptCustomerPrice = async (negId, customerPrice) => {
    setNegBusy(true)
    try {
      const token = localStorage.getItem('vv_token') || ''
      const promo = `ROYAL_DEAL_${Math.floor(1000 + Math.random() * 9000)}`
      const msg = `🎉 Great news! We have approved your requested price of ₹${customerPrice.toLocaleString('en-IN')}. Use promo code ${promo} to lock in your booking.`

      const res = await fetch(`/api/negotiations/${negId}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          text: msg,
          sender: 'Royal Concierge (Admin)',
          senderRole: 'admin',
          offerPrice: customerPrice,
          promoCode: promo,
          status: 'ACCEPTED'
        })
      })
      if (!res.ok) throw new Error('Failed to accept customer price')
      toast.success(`Approved customer's price at ₹${customerPrice.toLocaleString('en-IN')}!`)
      loadNegotiations()
    } catch (e) {
      toast.error(e.message)
    } finally {
      setNegBusy(false)
    }
  }

  const handleUpdateNegStatus = async (negId, newStatus) => {
    try {
      const token = localStorage.getItem('vv_token') || ''
      const res = await fetch(`/api/negotiations/${negId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify({ status: newStatus })
      })
      if (!res.ok) throw new Error('Failed to update status')
      toast.success(`Negotiation status updated to ${newStatus}`)
      loadNegotiations()
    } catch (e) {
      toast.error(e.message)
    }
  }

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
      const heroImg = cmsDraft.hero?.heroImage || cmsDraft.banners?.heroBackdrop || 'https://images.unsplash.com/photo-1519741497674-611481863552'
      const payload = {
        ...cmsDraft,
        hero: {
          ...(cmsDraft.hero || {}),
          heroImage: heroImg,
          headline: cmsDraft.hero?.headline || cmsDraft.heroSection?.title || "Plan Your Perfect Celebration, All in One Place",
          subheadline: cmsDraft.hero?.subheadline || cmsDraft.heroSection?.subtitle || "From royal heritage palaces in Udaipur to authentic Awadhi banquets in Lucknow, discover and book India's most distinguished verified event creators."
        },
        banners: {
          ...(cmsDraft.banners || {}),
          heroBackdrop: heroImg
        }
      }
      await onUpdateCMS(payload)
      toast.success('Website visual assets and CMS published live!')
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
            { id: 'negotiations', label: `Price Negotiations (${negotiations.length})`, icon: MessageSquare },
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

      {/* 4.5. SUB-TAB: LIVE PRICE NEGOTIATIONS & CHAT (Client Requested) */}
      {activeSubTab === 'negotiations' && (() => {
        const filteredNegs = negotiations.filter(n => {
          const matchSearch = !negSearch ||
            n.userName?.toLowerCase().includes(negSearch.toLowerCase()) ||
            n.vendorName?.toLowerCase().includes(negSearch.toLowerCase()) ||
            n.userEmail?.toLowerCase().includes(negSearch.toLowerCase()) ||
            n.city?.toLowerCase().includes(negSearch.toLowerCase())
          const matchStatus = negStatusFilter === 'all' || n.status === negStatusFilter
          return matchSearch && matchStatus
        })

        const currentNeg = negotiations.find(n => n.id === selectedNegId) || filteredNegs[0]

        return (
          <div className="space-y-6">
            {/* KPI Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="bg-white p-4 rounded-2xl border border-[#e8e2d5] shadow-xs">
                <div className="text-[11px] font-bold uppercase tracking-wider text-stone-500">Total Inquiries</div>
                <div className="font-serif text-2xl font-bold text-stone-900 mt-1">{negotiations.length}</div>
                <div className="text-[10px] text-stone-400 mt-0.5">Price negotiations logged</div>
              </div>

              <div className="bg-white p-4 rounded-2xl border border-amber-200 bg-amber-50/30 shadow-xs">
                <div className="text-[11px] font-bold uppercase tracking-wider text-amber-900">Awaiting Reply</div>
                <div className="font-serif text-2xl font-bold text-amber-800 mt-1">
                  {negotiations.filter(n => n.status === 'OPEN').length}
                </div>
                <div className="text-[10px] text-amber-700/80 mt-0.5">Pending admin review</div>
              </div>

              <div className="bg-white p-4 rounded-2xl border border-blue-200 bg-blue-50/30 shadow-xs">
                <div className="text-[11px] font-bold uppercase tracking-wider text-blue-900">Offers Sent</div>
                <div className="font-serif text-2xl font-bold text-blue-800 mt-1">
                  {negotiations.filter(n => n.status === 'OFFER_MADE').length}
                </div>
                <div className="text-[10px] text-blue-700/80 mt-0.5">Counter-offers active</div>
              </div>

              <div className="bg-white p-4 rounded-2xl border border-emerald-200 bg-emerald-50/30 shadow-xs">
                <div className="text-[11px] font-bold uppercase tracking-wider text-emerald-900">Deals Closed</div>
                <div className="font-serif text-2xl font-bold text-emerald-800 mt-1">
                  {negotiations.filter(n => n.status === 'ACCEPTED').length}
                </div>
                <div className="text-[10px] text-emerald-700/80 mt-0.5">Customer accepted rates</div>
              </div>
            </div>

            {/* Split Screen Chat & Negotiation Workspace */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              
              {/* LEFT COLUMN: Threads List (5 cols) */}
              <div className="lg:col-span-5 bg-white rounded-3xl p-5 border border-[#e8e2d5] shadow-sm flex flex-col space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-serif font-bold text-base text-stone-900 flex items-center gap-2">
                    <MessageSquare className="w-4 h-4 text-[#4a1525]" />
                    <span>Customer Threads ({filteredNegs.length})</span>
                  </h3>
                  <button
                    onClick={loadNegotiations}
                    className="p-1.5 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-700 transition-colors"
                    title="Refresh threads"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Search & Status Filters */}
                <div className="space-y-2">
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
                    <input
                      type="text"
                      placeholder="Search customer, venue, city..."
                      value={negSearch}
                      onChange={(e) => setNegSearch(e.target.value)}
                      className="w-full pl-8 pr-3 py-2 rounded-xl border border-stone-200 text-xs bg-stone-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#c5a059]"
                    />
                  </div>

                  <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1 text-[11px]">
                    {[
                      { id: 'all', label: 'All' },
                      { id: 'OPEN', label: 'Pending' },
                      { id: 'OFFER_MADE', label: 'Offer Sent' },
                      { id: 'ACCEPTED', label: 'Accepted' },
                      { id: 'CLOSED', label: 'Closed' }
                    ].map(st => (
                      <button
                        key={st.id}
                        onClick={() => setNegStatusFilter(st.id)}
                        className={`px-2.5 py-1 rounded-lg font-semibold whitespace-nowrap transition-all ${
                          negStatusFilter === st.id
                            ? 'bg-[#4a1525] text-amber-200 font-bold shadow-xs'
                            : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                        }`}
                      >
                        {st.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Threads List */}
                <div className="flex-1 overflow-y-auto space-y-2.5 max-h-[620px] pr-1">
                  {filteredNegs.length === 0 ? (
                    <div className="text-center py-12 text-stone-400 text-xs">
                      No negotiations match your search.
                    </div>
                  ) : (
                    filteredNegs.map((neg) => {
                      const isSelected = currentNeg?.id === neg.id
                      const orig = Number(neg.originalPrice || 0)
                      const off = Number(neg.offeredPrice || 0)
                      const disc = orig > 0 ? Math.round(((orig - off) / orig) * 100) : 0

                      return (
                        <div
                          key={neg.id}
                          onClick={() => setSelectedNegId(neg.id)}
                          className={`p-3.5 rounded-2xl border transition-all cursor-pointer relative ${
                            isSelected
                              ? 'bg-gradient-to-r from-[#faf6ed] to-[#f4ebd8] border-[#c5a059] shadow-md ring-1 ring-[#c5a059]'
                              : 'bg-stone-50/60 hover:bg-white border-stone-200 hover:border-amber-300'
                          }`}
                        >
                          <div className="flex items-start justify-between gap-2 mb-1">
                            <div>
                              <h4 className="font-serif font-bold text-sm text-stone-900 line-clamp-1">
                                {neg.userName}
                              </h4>
                              <p className="text-[11px] text-[#4a1525] font-semibold truncate">
                                {neg.vendorName}
                              </p>
                            </div>

                            <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider shrink-0 ${
                              neg.status === 'OFFER_MADE'
                                ? 'bg-amber-100 text-amber-900 border border-amber-300'
                                : neg.status === 'ACCEPTED'
                                ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                                : neg.status === 'OPEN'
                                ? 'bg-rose-100 text-rose-900 border border-rose-300'
                                : 'bg-stone-200 text-stone-700'
                            }`}>
                              {neg.status === 'OPEN' ? 'Needs Reply' : neg.status}
                            </span>
                          </div>

                          <div className="flex items-center justify-between text-xs mt-2 pt-2 border-t border-stone-200/60">
                            <div className="flex items-center gap-1.5 font-sans">
                              <span className="text-stone-400 line-through text-[11px]">
                                ₹{orig.toLocaleString('en-IN')}
                              </span>
                              <span className="font-bold text-emerald-900">
                                ₹{off.toLocaleString('en-IN')}
                              </span>
                              <span className="text-[10px] font-bold text-amber-900 bg-amber-100 px-1.5 py-0.2 rounded">
                                -{disc}%
                              </span>
                            </div>

                            <span className="text-[10px] text-stone-400">
                              {neg.eventDate || 'Dec 2026'} • {neg.guestCount || 200}g
                            </span>
                          </div>
                        </div>
                      )
                    })
                  )}
                </div>
              </div>

              {/* RIGHT COLUMN: Active Chat & Negotiation Terminal (7 cols) */}
              <div className="lg:col-span-7 bg-white rounded-3xl p-5 sm:p-6 border border-[#e8e2d5] shadow-sm flex flex-col justify-between">
                {currentNeg ? (
                  <div className="flex-1 flex flex-col justify-between space-y-4">
                    
                    {/* Top Customer Dossier Header */}
                    <div className="p-4 rounded-2xl bg-[#faf8f5] border border-[#e8e2d5] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-serif font-bold text-lg text-stone-900">
                            {currentNeg.userName}
                          </h3>
                          <span className="text-xs text-stone-500 font-medium">({currentNeg.city})</span>
                        </div>
                        <div className="text-xs text-stone-600 mt-0.5 flex flex-wrap items-center gap-3">
                          <span>📧 {currentNeg.userEmail}</span>
                          <span>📞 {currentNeg.userPhone}</span>
                          <span>📅 {currentNeg.eventDate}</span>
                          <span>👥 {currentNeg.guestCount} guests</span>
                        </div>
                      </div>

                      {/* Status Dropdown */}
                      <div className="flex items-center gap-2">
                        <select
                          value={currentNeg.status}
                          onChange={(e) => handleUpdateNegStatus(currentNeg.id, e.target.value)}
                          className="text-xs font-bold px-3 py-1.5 rounded-xl border border-stone-300 bg-white text-stone-800 focus:outline-none focus:ring-1 focus:ring-[#c5a059]"
                        >
                          <option value="OPEN">Status: OPEN (Pending)</option>
                          <option value="OFFER_MADE">Status: OFFER_MADE</option>
                          <option value="ACCEPTED">Status: ACCEPTED (Won)</option>
                          <option value="REJECTED">Status: REJECTED</option>
                          <option value="CLOSED">Status: CLOSED</option>
                        </select>
                      </div>
                    </div>

                    {/* Venue Pricing Banner */}
                    <div className="px-4 py-3 rounded-xl bg-gradient-to-r from-[#2c0e17] to-[#4a1525] text-white flex items-center justify-between text-xs">
                      <div>
                        <span className="text-[10px] text-amber-300 uppercase tracking-wider font-bold">Venue / Service:</span>
                        <div className="font-serif font-bold text-sm text-[#f5ebd7]">{currentNeg.vendorName}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-stone-300 text-[10px]">Listed: ₹{currentNeg.originalPrice?.toLocaleString('en-IN')}</div>
                        <div className="font-serif font-bold text-amber-300 text-sm">
                          Client Target: ₹{currentNeg.offeredPrice?.toLocaleString('en-IN')}
                        </div>
                      </div>
                    </div>

                    {/* Chat Messages Stream */}
                    <div className="p-4 rounded-2xl bg-stone-50/90 border border-stone-200 overflow-y-auto space-y-3 max-h-[300px]">
                      {(currentNeg.messages || []).map((m, idx) => {
                        const isAdmin = m.senderRole === 'admin'
                        return (
                          <div
                            key={m.id || idx}
                            className={`flex flex-col ${isAdmin ? 'items-end' : 'items-start'}`}
                          >
                            <div className="flex items-center gap-1.5 mb-1 text-[10px] text-stone-400">
                              <span>{isAdmin ? '👑 Royal Admin (You)' : m.sender || 'Customer'}</span>
                              <span>•</span>
                              <span>{m.timestamp ? new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}</span>
                            </div>

                            <div
                              className={`max-w-[85%] p-3.5 rounded-2xl text-xs leading-relaxed shadow-xs ${
                                isAdmin
                                  ? 'bg-[#1c1917] text-stone-100 rounded-tr-xs border border-stone-800'
                                  : 'bg-white text-stone-900 rounded-tl-xs border border-stone-200'
                              }`}
                            >
                              <p>{m.text}</p>
                              {m.offerPrice && (
                                <div className="mt-2.5 p-2.5 rounded-xl bg-amber-500/20 border border-amber-400/40 text-amber-200 text-[11px] font-bold flex items-center justify-between">
                                  <span>Offer Amount: ₹{m.offerPrice.toLocaleString('en-IN')}</span>
                                  {m.promoCode && <span className="font-mono text-[10px] bg-black/40 px-2 py-0.5 rounded text-amber-300">Code: {m.promoCode}</span>}
                                </div>
                              )}
                            </div>
                          </div>
                        )
                      })}
                    </div>

                    {/* Admin Counter-Offer Console & Controls */}
                    <div className="space-y-3 pt-3 border-t border-stone-200">
                      
                      {/* Counter-Offer Controls */}
                      <div className="p-3.5 rounded-2xl bg-gradient-to-r from-amber-50 to-amber-100/60 border border-amber-300/80 space-y-2.5">
                        <div className="flex items-center justify-between">
                          <label className="text-xs font-bold text-amber-950 uppercase tracking-wider flex items-center gap-1.5">
                            <Tag className="w-3.5 h-3.5 text-amber-800" />
                            Send Counter-Offer Price (₹)
                          </label>
                          <button
                            type="button"
                            onClick={() => handleAdminAcceptCustomerPrice(currentNeg.id, currentNeg.offeredPrice)}
                            disabled={negBusy}
                            className="px-2.5 py-1 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white text-[11px] font-bold shadow-xs transition-colors flex items-center gap-1"
                          >
                            <Check className="w-3.5 h-3.5" />
                            <span>Accept Client Rate (₹{currentNeg.offeredPrice?.toLocaleString('en-IN')})</span>
                          </button>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          <input
                            type="number"
                            placeholder="Counter-offer amount (e.g. 175000)"
                            value={adminCounterPrice}
                            onChange={(e) => setAdminCounterPrice(e.target.value)}
                            className="p-2.5 rounded-xl border border-amber-400 bg-white font-serif font-bold text-sm text-stone-900 focus:outline-none"
                          />

                          <input
                            type="text"
                            placeholder="Promo Code (e.g. ROYAL_175K)"
                            value={adminPromoCode}
                            onChange={(e) => setAdminPromoCode(e.target.value)}
                            className="p-2.5 rounded-xl border border-amber-400 bg-white text-xs font-mono font-bold text-stone-900 focus:outline-none"
                          />
                        </div>

                        {/* Quick Presets based on Original Price */}
                        <div className="flex items-center gap-2 flex-wrap text-[11px]">
                          <span className="text-[10px] font-bold text-amber-900">Quick Presets:</span>
                          {[
                            { label: '-10%', mult: 0.90 },
                            { label: '-15%', mult: 0.85 },
                            { label: '-20%', mult: 0.80 },
                          ].map((p, i) => {
                            const val = Math.round(Number(currentNeg.originalPrice || 200000) * p.mult / 1000) * 1000
                            return (
                              <button
                                key={i}
                                type="button"
                                onClick={() => {
                                  setAdminCounterPrice(val)
                                  setAdminPromoCode(`ROYAL_${(val / 1000).toFixed(0)}K`)
                                }}
                                className="px-2 py-0.5 rounded-md bg-white hover:bg-amber-200 border border-amber-300 text-stone-800 font-bold transition-colors"
                              >
                                {p.label} (₹{val.toLocaleString('en-IN')})
                              </button>
                            )
                          })}
                          
                          <button
                            type="button"
                            onClick={() => handleAdminSendCounterOffer(currentNeg.id, currentNeg.originalPrice)}
                            disabled={negBusy || !adminCounterPrice}
                            className="ml-auto px-3.5 py-1 rounded-lg bg-[#4a1525] hover:bg-[#38101c] text-amber-200 text-xs font-bold transition-colors shadow-xs disabled:opacity-40"
                          >
                            Send Official Offer
                          </button>
                        </div>
                      </div>

                      {/* Chat Message Box */}
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          placeholder="Type reply to customer..."
                          value={adminReplyText}
                          onChange={(e) => setAdminReplyText(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault()
                              handleAdminSendMessage(currentNeg.id)
                            }
                          }}
                          className="flex-1 p-3 rounded-xl border border-stone-300 text-xs text-stone-900 focus:outline-none focus:ring-1 focus:ring-[#c5a059]"
                        />
                        <button
                          type="button"
                          onClick={() => handleAdminSendMessage(currentNeg.id)}
                          disabled={negBusy || !adminReplyText.trim()}
                          className="px-4 py-3 rounded-xl bg-[#1c1917] hover:bg-stone-800 text-amber-200 text-xs font-bold flex items-center gap-1.5 transition-colors disabled:opacity-40"
                        >
                          <Send className="w-3.5 h-3.5" />
                          <span>Send Reply</span>
                        </button>
                      </div>

                    </div>

                  </div>
                ) : (
                  <div className="text-center py-24 text-stone-400 text-sm">
                    Select a negotiation thread on the left to start chatting and sending counter-offers.
                  </div>
                )}
              </div>

            </div>
          </div>
        )
      })()}

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

      {/* 7. SUB-TAB: LIVE CMS — WEBSITE BANNERS, IMAGES & EDITORIAL MANAGER */}
      {activeSubTab === 'cms' && (
        <div className="bg-white rounded-3xl p-5 sm:p-7 border border-[#e8e2d5] shadow-sm space-y-6">
          {/* Header with Save Button */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-stone-200">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100/80 text-[#4a1525] border border-amber-300 text-[10px] font-bold uppercase tracking-wider mb-1.5">
                <Sparkles className="w-3 h-3 text-amber-700" />
                <span>Live Marketplace Visual & Content CMS</span>
              </div>
              <h3 className="font-serif font-bold text-xl text-[#1c1917]">
                Website Banners, Images & Editorial Manager
              </h3>
              <p className="text-xs text-stone-500">
                Update royal backdrops, top sliding 3D galleries, category showcase imagery, headlines and privilege offers with 1-click persistence.
              </p>
            </div>
            <button
              onClick={handleSaveCMS}
              disabled={cmsSaving}
              className="px-5 py-2.5 rounded-xl bg-[#c5a059] hover:bg-[#b08d47] text-[#1c1917] font-bold text-xs flex items-center gap-2 shadow-md transition-all shrink-0 cursor-pointer disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{cmsSaving ? 'Publishing Live...' : 'Save & Publish Live'}</span>
            </button>
          </div>

          {/* CMS Sub-tabs: Visuals | Text | Offers */}
          <div className="flex items-center gap-2 p-1 bg-stone-100 rounded-2xl w-fit">
            <button
              onClick={() => setCmsSectionTab('visuals')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                cmsSectionTab === 'visuals'
                  ? 'bg-white text-[#4a1525] shadow-xs'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              <ImageIcon className="w-3.5 h-3.5" />
              <span>Website Banners & Images</span>
            </button>
            <button
              onClick={() => setCmsSectionTab('text')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                cmsSectionTab === 'text'
                  ? 'bg-white text-[#4a1525] shadow-xs'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Headlines & Announcements</span>
            </button>
            <button
              onClick={() => setCmsSectionTab('offers')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                cmsSectionTab === 'offers'
                  ? 'bg-white text-[#4a1525] shadow-xs'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              <Tag className="w-3.5 h-3.5" />
              <span>Privilege Offers & Vouchers</span>
            </button>
          </div>

          {/* ---------------------------------------------------- */}
          {/* TAB 1: WEBSITE BANNERS & IMAGES                      */}
          {/* ---------------------------------------------------- */}
          {cmsSectionTab === 'visuals' && (
            <div className="space-y-8 animate-in fade-in">
              {/* 1.1 HERO BANNER 4K BACKDROP */}
              <div className="p-5 rounded-2xl bg-stone-50 border border-stone-200 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-serif font-bold text-sm text-stone-900 flex items-center gap-2">
                      <span>1. Hero Section 4K Background Wallpaper</span>
                      <span className="text-[10px] bg-amber-200/80 text-amber-950 font-sans px-2 py-0.5 rounded-full font-bold">Main Homepage</span>
                    </h4>
                    <p className="text-[11px] text-stone-500 mt-0.5">
                      The primary 4K visual shown behind the royal headline when visitors land on the marketplace.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-start">
                  {/* Live Preview Thumbnail */}
                  <div className="relative aspect-[16/9] rounded-xl overflow-hidden border-2 border-amber-400/80 bg-stone-900 shadow-sm group">
                    <img
                      src={getOptimizedImageUrl(cmsDraft.hero?.heroImage || cmsDraft.banners?.heroBackdrop || 'https://images.unsplash.com/photo-1519741497674-611481863552', { width: 600, quality: 75 })}
                      alt="Hero Live Preview"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent flex flex-col justify-end p-2.5">
                      <div className="text-[9px] font-bold text-amber-300 uppercase tracking-widest">Live Hero Backdrop Preview</div>
                      <div className="text-[11px] font-serif font-bold text-white truncate">Plan Your Perfect Celebration</div>
                    </div>
                  </div>

                  {/* URL Input & Preset Selector */}
                  <div className="md:col-span-2 space-y-3">
                    <div>
                      <label className="block text-xs font-bold text-stone-700 mb-1">
                        Hero Background Image URL (Direct 4K / High-Res Image Link)
                      </label>
                      <input
                        type="url"
                        value={cmsDraft.hero?.heroImage || cmsDraft.banners?.heroBackdrop || ''}
                        onChange={(e) => {
                          const val = e.target.value
                          setCmsDraft({
                            ...cmsDraft,
                            hero: { ...(cmsDraft.hero || {}), heroImage: val },
                            banners: { ...(cmsDraft.banners || {}), heroBackdrop: val }
                          })
                        }}
                        placeholder="https://images.unsplash.com/photo-..."
                        className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-stone-300 text-xs focus:outline-none focus:border-[#4a1525] font-mono"
                      />
                    </div>

                    {/* Presets */}
                    <div>
                      <div className="text-[11px] font-bold text-stone-600 mb-1.5 flex items-center gap-1">
                        <span>⚜ Quick Apply Verified 4K Indian Royal Backdrops:</span>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {[
                          { name: 'Udaipur Island Palace', url: 'https://images.unsplash.com/photo-1519741497674-611481863552' },
                          { name: 'Jaipur Rambagh Citadel', url: 'https://images.unsplash.com/photo-1587271407850-8d438ca9fdf2' },
                          { name: 'Grand Marigold Mandap', url: 'https://images.unsplash.com/photo-1583939003579-730e3918a45a' },
                          { name: 'Awadhi Feast Banquet', url: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5' },
                          { name: 'Fragrant Mogra Florals', url: 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622' }
                        ].map((preset) => (
                          <button
                            key={preset.name}
                            type="button"
                            onClick={() => {
                              setCmsDraft({
                                ...cmsDraft,
                                hero: { ...(cmsDraft.hero || {}), heroImage: preset.url },
                                banners: { ...(cmsDraft.banners || {}), heroBackdrop: preset.url }
                              })
                              toast.info(`Selected "${preset.name}" preset! Click Save & Publish Live to apply.`)
                            }}
                            className="px-2.5 py-1 rounded-lg bg-white hover:bg-amber-100 border border-stone-200 text-[10.5px] font-medium text-stone-700 hover:text-[#4a1525] transition-colors cursor-pointer"
                          >
                            + {preset.name}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* 1.2 TOP 3D SLIDING GALLERY SLIDES */}
              <div className="p-5 rounded-2xl bg-stone-50 border border-stone-200 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <h4 className="font-serif font-bold text-sm text-stone-900 flex items-center gap-2">
                      <span>2. 3D Interactive Top Gallery Slides ({(cmsDraft.gallerySlides || []).length} Slides)</span>
                      <span className="text-[10px] bg-emerald-200 text-emerald-900 font-sans px-2 py-0.5 rounded-full font-bold">Auto-Sliding Showcase</span>
                    </h4>
                    <p className="text-[11px] text-stone-500 mt-0.5">
                      Configure slide images, royal titles, locations, and pricing tags displayed in the top sliding carousel.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      const cur = cmsDraft.gallerySlides || []
                      const newSlide = {
                        id: `slide_${Date.now()}`,
                        title: 'Grand Royal Celebration Venue',
                        city: 'Udaipur / Delhi NCR',
                        category: 'Heritage Venues & Forts',
                        rating: 4.98,
                        reviews: 65,
                        price: '₹2,50,000 / day',
                        tag: 'Signature Showcase',
                        image: 'https://images.unsplash.com/photo-1519741497674-611481863552',
                        description: 'Bespoke celebration setting with royal hospitality, verified staff, and 100% direct date lock guarantee.'
                      }
                      setCmsDraft({ ...cmsDraft, gallerySlides: [...cur, newSlide] })
                      toast.success('Added new slide! Update its image and title below.')
                    }}
                    className="px-3 py-1.5 rounded-xl bg-[#4a1525] hover:bg-[#340b17] text-amber-200 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shrink-0"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add New Slide</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {(cmsDraft.gallerySlides || []).map((slide, sIdx) => (
                    <div
                      key={slide.id || sIdx}
                      className="p-3.5 rounded-xl bg-white border border-stone-200 space-y-3 shadow-xs hover:border-amber-400 transition-all"
                    >
                      <div className="flex items-start gap-3">
                        {/* Slide Thumbnail */}
                        <div className="w-24 h-20 rounded-lg overflow-hidden bg-stone-900 border border-stone-200 shrink-0 relative">
                          <img
                            src={getOptimizedImageUrl(slide.image, { width: 250, quality: 75 })}
                            alt={slide.title}
                            className="w-full h-full object-cover"
                          />
                          <span className="absolute top-1 left-1 px-1.5 py-0.5 rounded text-[8px] font-bold bg-black/80 text-amber-300">
                            #{sIdx + 1}
                          </span>
                        </div>

                        {/* Title, City, Price */}
                        <div className="flex-1 min-w-0 space-y-1.5">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-bold uppercase text-amber-800 tracking-wider">Slide #{sIdx + 1}</span>
                            {(cmsDraft.gallerySlides || []).length > 1 && (
                              <button
                                type="button"
                                onClick={() => {
                                  const updated = (cmsDraft.gallerySlides || []).filter((_, i) => i !== sIdx)
                                  setCmsDraft({ ...cmsDraft, gallerySlides: updated })
                                  toast.info(`Removed Slide #${sIdx + 1}`)
                                }}
                                className="text-stone-400 hover:text-rose-600 transition-colors p-1"
                                title="Delete Slide"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                          <input
                            type="text"
                            value={slide.title || ''}
                            onChange={(e) => {
                              const updated = [...(cmsDraft.gallerySlides || [])]
                              updated[sIdx] = { ...updated[sIdx], title: e.target.value }
                              setCmsDraft({ ...cmsDraft, gallerySlides: updated })
                            }}
                            placeholder="Slide Title"
                            className="w-full px-2 py-1 rounded bg-stone-50 border border-stone-200 text-xs font-semibold focus:outline-none"
                          />
                          <div className="grid grid-cols-2 gap-1.5">
                            <input
                              type="text"
                              value={slide.city || ''}
                              onChange={(e) => {
                                const updated = [...(cmsDraft.gallerySlides || [])]
                                updated[sIdx] = { ...updated[sIdx], city: e.target.value }
                                setCmsDraft({ ...cmsDraft, gallerySlides: updated })
                              }}
                              placeholder="City / Region"
                              className="w-full px-2 py-1 rounded bg-stone-50 border border-stone-200 text-[11px] focus:outline-none"
                            />
                            <input
                              type="text"
                              value={slide.price || ''}
                              onChange={(e) => {
                                const updated = [...(cmsDraft.gallerySlides || [])]
                                updated[sIdx] = { ...updated[sIdx], price: e.target.value }
                                setCmsDraft({ ...cmsDraft, gallerySlides: updated })
                              }}
                              placeholder="e.g. ₹3,50,000 / day"
                              className="w-full px-2 py-1 rounded bg-stone-50 border border-stone-200 text-[11px] focus:outline-none font-medium"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Image URL input */}
                      <div>
                        <label className="block text-[10.5px] font-bold text-stone-600 mb-1">
                          Slide Image URL:
                        </label>
                        <input
                          type="url"
                          value={slide.image || ''}
                          onChange={(e) => {
                            const updated = [...(cmsDraft.gallerySlides || [])]
                            updated[sIdx] = { ...updated[sIdx], image: e.target.value }
                            setCmsDraft({ ...cmsDraft, gallerySlides: updated })
                          }}
                          placeholder="https://images.unsplash.com/photo-..."
                          className="w-full px-2.5 py-1.5 rounded-lg bg-stone-50 border border-stone-200 text-[11px] font-mono focus:outline-none focus:border-[#4a1525]"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* 1.3 11 SPECIALIZATION CATEGORY SHOWCASE IMAGES */}
              <div className="p-5 rounded-2xl bg-stone-50 border border-stone-200 space-y-4">
                <div>
                  <h4 className="font-serif font-bold text-sm text-stone-900 flex items-center gap-2">
                    <span>3. 11 Verified Specialization Category Cards</span>
                    <span className="text-[10px] bg-purple-200 text-purple-900 font-sans px-2 py-0.5 rounded-full font-bold">Category Grid</span>
                  </h4>
                  <p className="text-[11px] text-stone-500 mt-0.5">
                    Customize the thumbnail photo for each celebration category card shown on the homepage.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
                  {[
                    { slug: 'venues', label: '1. Heritage Venues & Forts', defaultImg: 'https://images.unsplash.com/photo-1587271407850-8d438ca9fdf2' },
                    { slug: 'catering', label: '2. Catering & Royal Feasts', defaultImg: 'https://images.unsplash.com/photo-1555244162-803834f70033' },
                    { slug: 'decor', label: '3. Decoration & Mandaps', defaultImg: 'https://images.unsplash.com/photo-1587271636175-90d58cdad458' },
                    { slug: 'makeup', label: '4. Bridal Makeup Artists', defaultImg: 'https://images.unsplash.com/photo-1600685890506-593fdf55949b' },
                    { slug: 'outfits', label: '5. Couture Rental Outfits', defaultImg: 'https://images.unsplash.com/photo-1767955694884-d4bf352c23c2' },
                    { slug: 'photography', label: '6. Photography & 4K Cinema', defaultImg: 'https://images.unsplash.com/photo-1744805624954-a6686543c3ff' },
                    { slug: 'music', label: '7. DJ & Live Music', defaultImg: 'https://images.unsplash.com/photo-1541126274323-dbac58d14741' },
                    { slug: 'gifts', label: '8. Return Gifts & Favors', defaultImg: 'https://images.unsplash.com/photo-1508899203029-1c9eb493c9bd' },
                    { slug: 'florists', label: '9. Florists & Garlands', defaultImg: 'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb' },
                    { slug: 'invitations', label: '10. Invitation Cards & E-Invites', defaultImg: 'https://images.unsplash.com/photo-1656104717095-9d062b0d4e8d' },
                    { slug: 'planners', label: '11. Event Planners & Concierge', defaultImg: 'https://images.unsplash.com/photo-1527529482837-4698179dc6ce' }
                  ].map((catItem) => {
                    const currentImg = cmsDraft.categoryImages?.[catItem.slug] || catItem.defaultImg
                    return (
                      <div
                        key={catItem.slug}
                        className="p-3 rounded-xl bg-white border border-stone-200 flex flex-col justify-between space-y-2.5 shadow-2xs"
                      >
                        <div className="flex items-center gap-2.5">
                          <div className="w-12 h-12 rounded-lg overflow-hidden bg-stone-100 shrink-0 border border-stone-200">
                            <img
                              src={getOptimizedImageUrl(currentImg, { width: 120, quality: 70 })}
                              alt={catItem.label}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div className="min-w-0 flex-1">
                            <span className="font-serif font-bold text-xs text-stone-900 block truncate">
                              {catItem.label}
                            </span>
                            <span className="text-[10px] text-stone-500 font-mono">
                              slug: {catItem.slug}
                            </span>
                          </div>
                        </div>

                        <div>
                          <input
                            type="url"
                            value={cmsDraft.categoryImages?.[catItem.slug] || ''}
                            onChange={(e) => {
                              setCmsDraft({
                                ...cmsDraft,
                                categoryImages: {
                                  ...(cmsDraft.categoryImages || {}),
                                  [catItem.slug]: e.target.value
                                }
                              })
                            }}
                            placeholder={catItem.defaultImg}
                            className="w-full px-2 py-1 rounded bg-stone-50 border border-stone-200 text-[10.5px] font-mono focus:outline-none focus:border-[#4a1525]"
                          />
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          )}

          {/* ---------------------------------------------------- */}
          {/* TAB 2: HEADLINES & ANNOUNCEMENTS                     */}
          {/* ---------------------------------------------------- */}
          {cmsSectionTab === 'text' && (
            <div className="space-y-4 animate-in fade-in">
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">Top Announcement Bar Text</label>
                <input
                  type="text"
                  value={cmsDraft.announcementBar?.text || cmsDraft.announcement?.text || ''}
                  onChange={e => setCmsDraft({
                    ...cmsDraft,
                    announcementBar: { ...(cmsDraft.announcementBar || {}), text: e.target.value },
                    announcement: { ...(cmsDraft.announcement || {}), text: e.target.value }
                  })}
                  className="w-full px-3 py-2 rounded-xl bg-stone-50 border border-stone-200 text-xs focus:outline-none focus:border-stone-400 font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">Hero Section Eyebrow Badge</label>
                <input
                  type="text"
                  value={cmsDraft.hero?.badge || "India's Premier Luxury Wedding & Event Concierge"}
                  onChange={e => setCmsDraft({
                    ...cmsDraft,
                    hero: { ...(cmsDraft.hero || {}), badge: e.target.value }
                  })}
                  className="w-full px-3 py-2 rounded-xl bg-stone-50 border border-stone-200 text-xs focus:outline-none focus:border-stone-400 font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">Hero Section Master Headline</label>
                <input
                  type="text"
                  value={cmsDraft.heroSection?.title || cmsDraft.hero?.headline || ''}
                  onChange={e => setCmsDraft({
                    ...cmsDraft,
                    heroSection: { ...(cmsDraft.heroSection || {}), title: e.target.value },
                    hero: { ...(cmsDraft.hero || {}), headline: e.target.value }
                  })}
                  className="w-full px-3 py-2 rounded-xl bg-stone-50 border border-stone-200 text-xs focus:outline-none focus:border-stone-400 font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">Hero Subtitle</label>
                <textarea
                  rows={3}
                  value={cmsDraft.heroSection?.subtitle || cmsDraft.hero?.subheadline || ''}
                  onChange={e => setCmsDraft({
                    ...cmsDraft,
                    heroSection: { ...(cmsDraft.heroSection || {}), subtitle: e.target.value },
                    hero: { ...(cmsDraft.hero || {}), subheadline: e.target.value }
                  })}
                  className="w-full px-3 py-2 rounded-xl bg-stone-50 border border-stone-200 text-xs focus:outline-none focus:border-stone-400 font-medium"
                />
              </div>
            </div>
          )}

          {/* ---------------------------------------------------- */}
          {/* TAB 3: PRIVILEGE OFFERS & PROMO CODES                */}
          {/* ---------------------------------------------------- */}
          {cmsSectionTab === 'offers' && (
            <div className="space-y-4 animate-in fade-in">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-serif font-bold text-sm text-stone-900">Curated Privilege Offers (3 Cards)</h4>
                  <p className="text-[11px] text-stone-500">Edit the discount amount, promo code, and description shown on the homepage.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {(cmsDraft.offers || []).map((offer, oIdx) => (
                  <div
                    key={offer.id || oIdx}
                    className="p-4 rounded-xl bg-stone-50 border border-stone-200 space-y-3 shadow-2xs"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold uppercase text-amber-800 tracking-wider">Offer #{oIdx + 1}</span>
                      <input
                        type="text"
                        value={offer.badge || 'Signature Privilege'}
                        onChange={(e) => {
                          const updated = [...(cmsDraft.offers || [])]
                          updated[oIdx] = { ...updated[oIdx], badge: e.target.value }
                          setCmsDraft({ ...cmsDraft, offers: updated })
                        }}
                        className="px-2 py-0.5 rounded text-[10px] font-bold bg-white border border-stone-200 text-right"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-stone-600 mb-0.5">Offer Title</label>
                      <input
                        type="text"
                        value={offer.title || ''}
                        onChange={(e) => {
                          const updated = [...(cmsDraft.offers || [])]
                          updated[oIdx] = { ...updated[oIdx], title: e.target.value }
                          setCmsDraft({ ...cmsDraft, offers: updated })
                        }}
                        className="w-full px-2.5 py-1.5 rounded-lg bg-white border border-stone-200 text-xs font-semibold focus:outline-none"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[10px] font-bold text-stone-600 mb-0.5">Discount</label>
                        <input
                          type="text"
                          value={offer.discount || ''}
                          onChange={(e) => {
                            const updated = [...(cmsDraft.offers || [])]
                            updated[oIdx] = { ...updated[oIdx], discount: e.target.value }
                            setCmsDraft({ ...cmsDraft, offers: updated })
                          }}
                          className="w-full px-2 py-1 rounded bg-white border border-stone-200 text-xs font-bold text-[#4a1525]"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-stone-600 mb-0.5">Promo Code</label>
                        <input
                          type="text"
                          value={offer.code || ''}
                          onChange={(e) => {
                            const updated = [...(cmsDraft.offers || [])]
                            updated[oIdx] = { ...updated[oIdx], code: e.target.value }
                            setCmsDraft({ ...cmsDraft, offers: updated })
                          }}
                          className="w-full px-2 py-1 rounded bg-white border border-stone-200 text-xs font-mono font-bold"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-stone-600 mb-0.5">Description</label>
                      <textarea
                        rows={2}
                        value={offer.desc || offer.description || ''}
                        onChange={(e) => {
                          const updated = [...(cmsDraft.offers || [])]
                          updated[oIdx] = { ...updated[oIdx], desc: e.target.value, description: e.target.value }
                          setCmsDraft({ ...cmsDraft, offers: updated })
                        }}
                        className="w-full px-2.5 py-1.5 rounded-lg bg-white border border-stone-200 text-[11px] focus:outline-none"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Bottom Save CTA Strip */}
          <div className="pt-4 border-t border-stone-200 flex items-center justify-between">
            <span className="text-xs text-stone-500">
              Changes take effect immediately across all customer and vendor portal pages once published.
            </span>
            <button
              onClick={handleSaveCMS}
              disabled={cmsSaving}
              className="px-5 py-2.5 rounded-xl bg-[#c5a059] hover:bg-[#b08d47] text-[#1c1917] font-bold text-xs flex items-center gap-2 shadow-md transition-all cursor-pointer disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{cmsSaving ? 'Publishing Live...' : 'Save & Publish Live'}</span>
            </button>
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
