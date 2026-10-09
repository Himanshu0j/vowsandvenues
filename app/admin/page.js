'use client'

import React, { useState, useEffect } from 'react'
import {
  ShieldCheck,
  Lock,
  Mail,
  ArrowRight,
  LogOut,
  ExternalLink,
  Sparkles,
  RefreshCw,
  Building2,
  CalendarDays,
  DollarSign
} from 'lucide-react'
import { toast } from 'sonner'
import AdminOperationsSuite from '@/components/AdminOperationsSuite'
import ErrorBoundary from '@/components/ErrorBoundary'

export default function DedicatedAdminPortalPage() {
  const [authToken, setAuthToken] = useState(null)
  const [currentUser, setCurrentUser] = useState(null)
  const [loading, setLoading] = useState(true)

  // Login form state
  const [loginEmail, setLoginEmail] = useState('admin@vowsandvenues.in')
  const [loginPassword, setLoginPassword] = useState('Vows#Stg2026!SecureKey')
  const [loginBusy, setLoginBusy] = useState(false)

  // Admin Data State
  const [adminStats, setAdminStats] = useState(null)
  const [vendors, setVendors] = useState([])
  const [bookings, setBookings] = useState([])
  const [cmsContent, setCmsContent] = useState(null)
  const [mediaLibrary, setMediaLibrary] = useState([])
  const [coupons, setCoupons] = useState([])
  const [settlements, setSettlements] = useState([])
  const [dataLoading, setDataLoading] = useState(false)
  const [actionBusy, setActionBusy] = useState(false)

  // Check stored session
  useEffect(() => {
    try {
      const storedToken = localStorage.getItem('vv_token')
      const storedUser = localStorage.getItem('vv_user')
      if (storedToken && storedUser) {
        const u = JSON.parse(storedUser)
        const adminRoles = [
          'admin', 'super_admin', 'operations_manager', 'vendor_manager',
          'booking_manager', 'finance_manager', 'marketing_seo_manager',
          'content_manager', 'support_agent', 'analyst'
        ]
        if (adminRoles.includes(u.role)) {
          setAuthToken(storedToken)
          setCurrentUser(u)
        }
      }
    } catch (_) {}
    setLoading(false)
  }, [])

  // Fetch admin operational data
  const loadAdminData = async (token) => {
    setDataLoading(true)
    const tok = token || authToken
    const headers = tok ? { Authorization: `Bearer ${tok}` } : {}

    try {
      const [statsRes, vendorsRes, bookingsRes, cmsRes, mediaRes, couponsRes, settlementsRes] = await Promise.all([
        fetch('/api/admin/stats', { headers }).then(r => r.json()).catch(() => null),
        fetch('/api/vendors').then(r => r.json()).catch(() => []),
        fetch('/api/bookings', { headers }).then(r => r.json()).catch(() => []),
        fetch('/api/cms').then(r => r.json()).catch(() => null),
        fetch('/api/media').then(r => r.json()).catch(() => []),
        fetch('/api/coupons').then(r => r.json()).catch(() => []),
        fetch('/api/settlements', { headers }).then(r => r.json()).catch(() => [])
      ])

      if (statsRes && !statsRes.error) setAdminStats(statsRes)
      if (Array.isArray(vendorsRes)) setVendors(vendorsRes)
      if (Array.isArray(bookingsRes)) setBookings(bookingsRes)
      if (cmsRes && !cmsRes.error) setCmsContent(cmsRes)
      if (Array.isArray(mediaRes)) setMediaLibrary(mediaRes)
      if (Array.isArray(couponsRes)) setCoupons(couponsRes)
      if (Array.isArray(settlementsRes)) setSettlements(settlementsRes)
    } catch (e) {
      toast.error('Failed to load operational data: ' + e.message)
    } finally {
      setDataLoading(false)
    }
  }

  useEffect(() => {
    if (authToken && currentUser) {
      loadAdminData(authToken)
    }
  }, [authToken, currentUser])

  // Login handler
  const handleAdminLogin = async (e) => {
    e.preventDefault()
    setLoginBusy(true)
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: loginEmail, password: loginPassword })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Authentication failed')

      const adminRoles = [
        'admin', 'super_admin', 'operations_manager', 'vendor_manager',
        'booking_manager', 'finance_manager', 'marketing_seo_manager',
        'content_manager', 'support_agent', 'analyst'
      ]
      if (!adminRoles.includes(data.user?.role)) {
        throw new Error('Access denied: account does not have administrative privileges')
      }

      localStorage.setItem('vv_token', data.token)
      localStorage.setItem('vv_user', JSON.stringify(data.user))
      setAuthToken(data.token)
      setCurrentUser(data.user)
      toast.success(`Welcome back, ${data.user.name}!`)
    } catch (err) {
      toast.error(err.message)
    } finally {
      setLoginBusy(false)
    }
  }

  // Logout handler
  const handleAdminLogout = () => {
    localStorage.removeItem('vv_token')
    localStorage.removeItem('vv_user')
    setAuthToken(null)
    setCurrentUser(null)
    toast.info('Logged out from Admin Operations')
  }

  // Mutation handlers
  const handleUpdateCMS = async (newContent) => {
    const res = await fetch('/api/cms', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${authToken}`
      },
      body: JSON.stringify(newContent)
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data.error || 'Failed to update CMS')
    setCmsContent(data.cms || newContent)
  }

  const handleUploadMedia = async (media) => {
    const res = await fetch('/api/media', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${authToken}`
      },
      body: JSON.stringify(media)
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data.error || 'Failed to upload media')
    setMediaLibrary(prev => [data.media, ...prev])
  }

  const handleDeleteMedia = async (mediaId) => {
    const res = await fetch(`/api/media/${mediaId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${authToken}` }
    })
    if (!res.ok) throw new Error('Failed to delete media')
    setMediaLibrary(prev => prev.filter(m => m.id !== mediaId))
    toast.success('Media removed from library')
  }

  const handleCreateCoupon = async (couponData) => {
    const res = await fetch('/api/coupons', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${authToken}`
      },
      body: JSON.stringify(couponData)
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data.error || 'Failed to create coupon')
    setCoupons(prev => [data.coupon, ...prev])
  }

  const handleUpdateSettlement = (id, newStatus) => {
    setSettlements(prev => prev.map(s => s.id === id ? { ...s, status: newStatus } : s))
  }

  const handleVerifyToggle = async (vendorId, nextVerified) => {
    setActionBusy(true)
    try {
      const res = await fetch(`/api/admin/vendors/${vendorId}/verify`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`
        },
        body: JSON.stringify({ verified: nextVerified })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Verification failed')
      setVendors(prev => prev.map(v => v.id === vendorId ? { ...v, verified: nextVerified } : v))
      toast.success(`Vendor ${nextVerified ? 'verified' : 'unverified'} successfully`)
    } catch (e) {
      toast.error(e.message)
    } finally {
      setActionBusy(false)
    }
  }

  const handleRejectVendor = async (vendorId) => {
    setActionBusy(true)
    try {
      const res = await fetch(`/api/admin/vendors/${vendorId}/reject`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${authToken}` }
      })
      if (!res.ok) throw new Error('Rejection failed')
      setVendors(prev => prev.map(v => v.id === vendorId ? { ...v, verified: false, status: 'rejected' } : v))
      toast.success('Vendor KYC rejected')
    } catch (e) {
      toast.error(e.message)
    } finally {
      setActionBusy(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#1c1917] flex items-center justify-center p-6 text-center text-white">
        <RefreshCw className="w-8 h-8 animate-spin text-[#c5a059] mb-2" />
      </div>
    )
  }

  // 1. UNLOGGED VIEW: DEDICATED ADMIN LOGIN PORTAL
  if (!authToken || !currentUser) {
    return (
      <div className="min-h-screen bg-[#141211] text-white flex flex-col justify-between p-4 sm:p-8 selection:bg-[#c5a059] selection:text-black">
        {/* Top Header */}
        <div className="max-w-7xl mx-auto w-full flex items-center justify-between py-2">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#c5a059] to-[#8c6b2d] text-[#1c1917] flex items-center justify-center font-serif text-xl font-bold shadow-lg">
              V
            </div>
            <div>
              <span className="font-serif text-lg font-bold tracking-tight text-white">Vows &amp; Venues</span>
              <span className="block text-[10px] text-stone-400 uppercase tracking-widest font-mono">Administrative Suite</span>
            </div>
          </div>

          <a
            href="/"
            className="text-xs text-stone-400 hover:text-stone-200 transition-colors flex items-center gap-1.5"
          >
            <span>Back to Marketplace</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>

        {/* Center Login Box */}
        <div className="max-w-md w-full mx-auto my-12 bg-[#1c1917] border border-stone-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
          <div className="text-center space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#c5a059]/20 text-[#e8d08d] text-[10px] font-bold uppercase tracking-wider border border-[#c5a059]/30">
              <ShieldCheck className="w-3.5 h-3.5" /> Operations Gateway
            </div>
            <h1 className="font-serif text-2xl font-bold tracking-tight text-white">Sign In to Admin Console</h1>
            <p className="text-xs text-stone-400">
              Authorized personnel only. Intended domain binding: <code className="text-[#c5a059] font-mono">admin.vowsandvenues.in</code>
            </p>
          </div>

          <form onSubmit={handleAdminLogin} className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-stone-300">Staff Email</label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3 top-3 text-stone-500" />
                <input
                  type="email"
                  required
                  value={loginEmail}
                  onChange={e => setLoginEmail(e.target.value)}
                  placeholder="admin@vowsandvenues.in"
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-stone-900 border border-stone-800 text-xs text-white focus:outline-none focus:border-[#c5a059]"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-stone-300">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3 top-3 text-stone-500" />
                <input
                  type="password"
                  required
                  value={loginPassword}
                  onChange={e => setLoginPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-stone-900 border border-stone-800 text-xs text-white focus:outline-none focus:border-[#c5a059]"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loginBusy}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-[#c5a059] to-[#a3803b] hover:from-[#d1ab64] hover:to-[#b08d47] text-[#1c1917] font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg transition-all"
            >
              {loginBusy ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Authenticating...
                </>
              ) : (
                <>
                  Enter Operations Console <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </form>

          {/* Quick Credential Fill for Verification */}
          <div className="p-3.5 rounded-2xl bg-stone-900/90 border border-stone-800 text-xs space-y-2">
            <div className="flex items-center justify-between text-stone-400 text-[11px]">
              <span className="font-semibold text-stone-300">Default Super Admin</span>
              <button
                type="button"
                onClick={() => {
                  setLoginEmail('admin@vowsandvenues.in')
                  setLoginPassword('Vows#Stg2026!SecureKey')
                  toast.info('Super Admin credentials prefilled')
                }}
                className="text-[#c5a059] hover:underline font-bold"
              >
                Autofill
              </button>
            </div>
            <div className="text-[11px] font-mono text-stone-400 truncate">
              admin@vowsandvenues.in / Vows#Stg2026!SecureKey
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="max-w-7xl mx-auto w-full text-center text-xs text-stone-500 py-4 border-t border-stone-900">
          Vows &amp; Venues Operations Portal • Protected by HS256 JWT &amp; Role-Based Access Control
        </div>
      </div>
    )
  }

  // 2. LOGGED-IN VIEW: STANDALONE ADMIN OPERATIONS PORTAL
  return (
    <div className="min-h-screen bg-[#fcf8f2] text-stone-900">
      {/* Standalone Admin Top Navigation Bar */}
      <header className="sticky top-0 z-40 bg-[#1c1917] text-white border-b border-stone-800 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#c5a059] to-[#8c6b2d] text-[#1c1917] flex items-center justify-center font-serif text-lg font-bold shadow">
              V
            </div>
            <div>
              <span className="font-serif text-base font-bold tracking-tight">Vows &amp; Venues</span>
              <span className="block text-[10px] text-[#c5a059] font-mono uppercase tracking-widest font-semibold">
                Admin Operations
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-stone-900 border border-stone-800 text-xs">
              <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
              <span className="text-stone-300">{currentUser?.email}</span>
              <span className="px-1.5 py-0.5 rounded bg-[#c5a059]/20 text-[#e8d08d] font-bold text-[10px] uppercase font-mono">
                {currentUser?.role}
              </span>
            </div>

            <a
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-stone-300 hover:text-white px-2.5 py-1.5 rounded-lg hover:bg-stone-800 transition-colors flex items-center gap-1"
            >
              <span>Marketplace</span>
              <ExternalLink className="w-3 h-3 text-stone-400" />
            </a>

            <button
              onClick={handleAdminLogout}
              className="text-xs text-red-400 hover:text-red-300 px-2.5 py-1.5 rounded-lg hover:bg-stone-800 transition-colors flex items-center gap-1 font-semibold"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Sign Out</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="py-6">
        {dataLoading && (
          <div className="max-w-7xl mx-auto px-4 py-2 text-xs text-stone-500 flex items-center gap-2">
            <RefreshCw className="w-3.5 h-3.5 animate-spin text-[#c5a059]" />
            <span>Synchronizing live operational metrics...</span>
          </div>
        )}

        <ErrorBoundary fallbackTitle="Admin Operations Center">
          <AdminOperationsSuite
            adminStats={adminStats}
            vendors={vendors}
            userBookings={bookings}
            cmsContent={cmsContent}
            onUpdateCMS={handleUpdateCMS}
            mediaLibrary={mediaLibrary}
            onUploadMedia={handleUploadMedia}
            onDeleteMedia={handleDeleteMedia}
            coupons={coupons}
            onCreateCoupon={handleCreateCoupon}
            settlements={settlements}
            onUpdateSettlement={handleUpdateSettlement}
            onVerifyToggle={handleVerifyToggle}
            onRejectVendor={handleRejectVendor}
            adminActionBusy={actionBusy}
          />
        </ErrorBoundary>
      </main>
    </div>
  )
}
