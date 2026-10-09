'use client'

import React, { useState, useEffect } from 'react'
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
} from 'lucide-react'
import { toast } from 'sonner'
import { getOptimizedImageUrl } from '@/lib/imageUtils'

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
  const [activeSubTab, setActiveSubTab] = useState('overview') // 'overview' | 'vendors' | 'bookings' | 'cms' | 'media' | 'finance' | 'coupons'
  
  // CMS Edit State
  const [cmsDraft, setCmsDraft] = useState(cmsContent || {})
  const [cmsSaving, setCmsSaving] = useState(false)

  useEffect(() => {
    if (cmsContent && typeof cmsContent === 'object') {
      setCmsDraft(cmsContent)
    }
  }, [cmsContent])

  // Media Upload State
  const [newMediaForm, setNewMediaForm] = useState({ title: '', url: '', category: 'venues', altText: '', caption: '' })
  const [mediaUploading, setMediaUploading] = useState(false)

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

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-in fade-in">
      
      {/* 1. OPERATIONS HEADER & NAVIGATION BAR */}
      <div className="bg-[#1c1917] text-white rounded-3xl p-4 sm:p-6 lg:p-8 shadow-xl border border-stone-800">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#c5a059]/20 text-[#e8d08d] text-[10px] font-bold uppercase tracking-wider border border-[#c5a059]/30 mb-2">
              <ShieldCheck className="w-3.5 h-3.5" /> Operations Control Suite
            </div>
            <h1 className="font-serif text-2xl sm:text-3xl font-bold">
              Vows &amp; Venues Operations
            </h1>
            <p className="text-xs text-stone-400 mt-1">
              Platform administration, vendor verification, CMS management, and financial payouts.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-emerald-400 font-bold bg-emerald-950/60 px-3 py-1.5 rounded-full border border-emerald-800">
              ● System Active (Local Engine)
            </span>
          </div>
        </div>

        {/* OPERATIONS NAVIGATION TABS */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pt-6 mt-6 border-t border-stone-800 text-xs">
          {[
            { id: 'overview', label: 'Overview & KPIs', icon: TrendingUp },
            { id: 'vendors', label: `Vendors (${vendors.length})`, icon: Building2 },
            { id: 'bookings', label: `Bookings (${userBookings.length})`, icon: CalendarDays },
            { id: 'cms', label: 'Website CMS', icon: FileText },
            { id: 'media', label: `Media Library (${mediaLibrary.length})`, icon: ImageIcon },
            { id: 'finance', label: 'Finance & Ledger', icon: DollarSign },
            { id: 'coupons', label: `Coupons (${coupons.length})`, icon: Tag }
          ].map(tab => {
            const Icon = tab.icon
            return (
              <button
                key={tab.id}
                onClick={() => setActiveSubTab(tab.id)}
                className={`px-3.5 py-2 rounded-xl font-semibold flex items-center gap-1.5 whitespace-nowrap transition-all ${
                  activeSubTab === tab.id
                    ? 'bg-[#c5a059] text-[#1c1917]'
                    : 'text-stone-300 hover:bg-stone-800'
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <div className="bg-white p-4 sm:p-5 rounded-2xl border border-[#e8e2d5] shadow-sm">
              <div className="text-xs font-bold text-stone-500 uppercase tracking-wider">Gross Booking Volume</div>
              <div className="font-serif text-2xl font-bold text-[#1c1917] mt-1">
                ₹{Number(adminStats?.grossPlatformVolume || adminStats?.grossMerchandiseValue || 359200).toLocaleString('en-IN')}
              </div>
              <div className="text-[11px] text-stone-400 mt-0.5">Total processed GMV</div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-[#e8e2d5] shadow-sm">
              <div className="text-xs font-bold text-stone-500 uppercase tracking-wider">Platform Commission</div>
              <div className="font-serif text-2xl font-bold text-[#4a1525] mt-1">
                ₹{Number(adminStats?.platformCommissionRevenue || adminStats?.platformRevenue || 34000).toLocaleString('en-IN')}
              </div>
              <div className="text-[11px] text-stone-400 mt-0.5">10% commission + fees</div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-[#e8e2d5] shadow-sm">
              <div className="text-xs font-bold text-stone-500 uppercase tracking-wider">Verified Creators</div>
              <div className="font-serif text-2xl font-bold text-emerald-700 mt-1">
                {adminStats?.totalVerifiedVendors ?? adminStats?.verifiedVendors ?? 33} / {adminStats?.totalVendors ?? vendors?.length ?? 33}
              </div>
              <div className="text-[11px] text-stone-400 mt-0.5">Audited &amp; Background Checked</div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-[#e8e2d5] shadow-sm">
              <div className="text-xs font-bold text-stone-500 uppercase tracking-wider">Active Bookings</div>
              <div className="font-serif text-2xl font-bold text-[#1c1917] mt-1">
                {adminStats?.totalBookings ?? userBookings?.length ?? 14}
              </div>
              <div className="text-[11px] text-stone-400 mt-0.5">In progress / confirmed</div>
            </div>
          </div>
        </div>
      )}

      {/* 3. SUB-TAB: VENDORS MANAGEMENT */}
      {activeSubTab === 'vendors' && (
        <div className="bg-white rounded-3xl p-4 sm:p-6 border border-[#e8e2d5] shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-serif font-bold text-lg text-[#1c1917]">Vendor Directory</h3>
              <p className="text-xs text-stone-500">Audit vendor profiles and toggle verification seals.</p>
            </div>
            <span className="text-xs font-bold text-stone-600">{vendors.length} Total Vendors</span>
          </div>

          <div className="overflow-x-auto -mx-4 sm:mx-0 px-4 sm:px-0">
            <table className="w-full min-w-[700px] text-left text-xs">
              <thead className="bg-[#faf8f5] text-stone-600 uppercase font-bold border-y border-[#e8e2d5]">
                <tr>
                  <th className="py-3 px-4">Vendor Name</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">City</th>
                  <th className="py-3 px-4">Starting Price</th>
                  <th className="py-3 px-4">Rating</th>
                  <th className="py-3 px-4">Verification</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#f2ede4]">
                {(vendors || []).map(v => (
                  <tr key={v.id} className="hover:bg-[#faf8f5]/60 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-stone-900">{v.name}</td>
                    <td className="py-3.5 px-4 text-stone-600">{v.categoryName || v.category}</td>
                    <td className="py-3.5 px-4 text-stone-600">{v.city}</td>
                    <td className="py-3.5 px-4 font-semibold text-stone-900">₹{Number(v.startingPrice || 0).toLocaleString('en-IN')}</td>
                    <td className="py-3.5 px-4 text-amber-600 font-bold">★ {Number(v.rating || 4.9).toFixed(1)}</td>
                    <td className="py-3.5 px-4">
                      {v.verified ? (
                        <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[10px]">
                          ✓ Verified
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 font-bold text-[10px]">
                          Pending Audit
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-right space-x-2">
                      <button
                        onClick={() => onVerifyToggle && onVerifyToggle(v.id, v.verified)}
                        disabled={adminActionBusy === v.id}
                        className="px-3 py-1 rounded-lg text-xs font-semibold bg-stone-100 hover:bg-stone-200 text-stone-800 transition-colors"
                      >
                        {v.verified ? 'Revoke Seal' : 'Approve & Verify'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 4. SUB-TAB: BOOKINGS MANAGEMENT */}
      {activeSubTab === 'bookings' && (
        <div className="bg-white rounded-3xl p-4 sm:p-6 border border-[#e8e2d5] shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-serif font-bold text-lg text-[#1c1917]">Customer Bookings</h3>
              <p className="text-xs text-stone-500">Live booking transactions, advance deposits, and status.</p>
            </div>
            <span className="text-xs font-bold text-stone-600">{(userBookings || []).length} Bookings</span>
          </div>

          <div className="overflow-x-auto -mx-4 sm:mx-0 px-4 sm:px-0">
            <table className="w-full min-w-[720px] text-left text-xs">
              <thead className="bg-[#faf8f5] text-stone-600 uppercase font-bold border-y border-[#e8e2d5]">
                <tr>
                  <th className="py-3 px-4">Booking ID</th>
                  <th className="py-3 px-4">Customer</th>
                  <th className="py-3 px-4">Event Date</th>
                  <th className="py-3 px-4">City</th>
                  <th className="py-3 px-4">Total Amount</th>
                  <th className="py-3 px-4">Advance Paid</th>
                  <th className="py-3 px-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#f2ede4]">
                {(userBookings || []).map(b => (
                  <tr key={b.id} className="hover:bg-[#faf8f5]/60 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-[#4a1525]">{b.id}</td>
                    <td className="py-3.5 px-4 font-semibold text-stone-900">{b.userName || 'Client'}</td>
                    <td className="py-3.5 px-4 text-stone-600">{b.eventDate}</td>
                    <td className="py-3.5 px-4 text-stone-600">{b.city}</td>
                    <td className="py-3.5 px-4 font-bold text-stone-900">₹{Number(b.totalAmount || 0).toLocaleString('en-IN')}</td>
                    <td className="py-3.5 px-4 text-emerald-700 font-semibold">₹{Number(b.advancePaid || 0).toLocaleString('en-IN')}</td>
                    <td className="py-3.5 px-4">
                      <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[10px]">
                        {b.status || b.bookingStatus || 'confirmed'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 5. SUB-TAB: WEBSITE CMS MANAGER */}
      {activeSubTab === 'cms' && (
        <div className="bg-white rounded-3xl p-4 sm:p-6 lg:p-8 border border-[#e8e2d5] shadow-sm space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-serif font-bold text-xl text-[#1c1917]">Homepage &amp; Brand Content Manager</h3>
              <p className="text-xs text-stone-500">Live editor for website typography, hero banners, and promotional announcements.</p>
            </div>
            <button
              onClick={handleSaveCMS}
              disabled={cmsSaving}
              className="px-5 py-2.5 rounded-full bg-[#4a1525] hover:bg-[#3d111e] text-[#f5ebd7] text-xs font-bold flex items-center gap-2 shadow-md transition-all cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>{cmsSaving ? 'Saving...' : 'Publish CMS Changes'}</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-[#f2ede4]">
            {/* HERO HEADLINE */}
            <div className="space-y-4">
              <h4 className="font-serif font-bold text-base text-[#4a1525]">Hero Section Copy</h4>
              <div>
                <label className="text-xs font-bold text-stone-700 uppercase tracking-wider">Main Headline</label>
                <input
                  value={cmsDraft.hero?.headline || ''}
                  onChange={(e) => setCmsDraft({
                    ...cmsDraft,
                    hero: { ...(cmsDraft.hero || {}), headline: e.target.value }
                  })}
                  className="mt-1 w-full px-4 py-2.5 bg-[#faf8f5] border border-[#e8e2d5] rounded-xl text-sm font-semibold"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-stone-700 uppercase tracking-wider">Subheadline / Supporting Pitch</label>
                <textarea
                  rows={3}
                  value={cmsDraft.hero?.subheadline || ''}
                  onChange={(e) => setCmsDraft({
                    ...cmsDraft,
                    hero: { ...(cmsDraft.hero || {}), subheadline: e.target.value }
                  })}
                  className="mt-1 w-full px-4 py-2.5 bg-[#faf8f5] border border-[#e8e2d5] rounded-xl text-xs leading-relaxed"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-stone-700 uppercase tracking-wider">Hero Background Image URL</label>
                <input
                  value={cmsDraft.hero?.heroImage || ''}
                  onChange={(e) => setCmsDraft({
                    ...cmsDraft,
                    hero: { ...(cmsDraft.hero || {}), heroImage: e.target.value }
                  })}
                  className="mt-1 w-full px-4 py-2 bg-[#faf8f5] border border-[#e8e2d5] rounded-xl text-xs font-mono"
                />
                {cmsDraft.hero?.heroImage && (
                  <div className="mt-2 aspect-[21/9] rounded-xl overflow-hidden bg-stone-100 border border-[#e8e2d5]">
                    <img src={cmsDraft.hero.heroImage} alt="preview" className="w-full h-full object-cover" />
                  </div>
                )}
              </div>
            </div>

            {/* ANNOUNCEMENT & CONTACT */}
            <div className="space-y-4">
              <h4 className="font-serif font-bold text-base text-[#4a1525]">Announcement Bar &amp; Contact</h4>
              <div>
                <label className="text-xs font-bold text-stone-700 uppercase tracking-wider">Top Announcement Banner</label>
                <input
                  value={cmsDraft.announcement?.text || ''}
                  onChange={(e) => setCmsDraft({
                    ...cmsDraft,
                    announcement: { ...(cmsDraft.announcement || {}), text: e.target.value }
                  })}
                  className="mt-1 w-full px-4 py-2.5 bg-[#faf8f5] border border-[#e8e2d5] rounded-xl text-sm"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-stone-700 uppercase tracking-wider">Concierge Helpline</label>
                <input
                  value={cmsDraft.contact?.phone || '+91 98765 43210'}
                  onChange={(e) => setCmsDraft({
                    ...cmsDraft,
                    contact: { ...(cmsDraft.contact || {}), phone: e.target.value }
                  })}
                  className="mt-1 w-full px-4 py-2 bg-[#faf8f5] border border-[#e8e2d5] rounded-xl text-xs"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-stone-700 uppercase tracking-wider">Concierge Email</label>
                <input
                  value={cmsDraft.contact?.email || 'concierge@vowsandvenues.in'}
                  onChange={(e) => setCmsDraft({
                    ...cmsDraft,
                    contact: { ...(cmsDraft.contact || {}), email: e.target.value }
                  })}
                  className="mt-1 w-full px-4 py-2 bg-[#faf8f5] border border-[#e8e2d5] rounded-xl text-xs"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 6. SUB-TAB: MEDIA LIBRARY */}
      {activeSubTab === 'media' && (
        <div className="space-y-6">
          {/* UPLOAD NEW ASSET BOX */}
          <div className="bg-white rounded-3xl p-4 sm:p-6 border border-[#e8e2d5] shadow-sm">
            <h3 className="font-serif font-bold text-lg text-[#1c1917] mb-1">Add Media to Library</h3>
            <p className="text-xs text-stone-500 mb-4">Register high-resolution photos for venues, decor, catering, and banners.</p>
            
            <form onSubmit={handleAddMedia} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <div>
                <label className="text-xs font-bold text-stone-700">Image Title</label>
                <input
                  value={newMediaForm.title}
                  onChange={(e) => setNewMediaForm({ ...newMediaForm, title: e.target.value })}
                  placeholder="e.g. Royal Lake Palace Lawn"
                  className="mt-1 w-full px-3 py-2 bg-[#faf8f5] border border-[#e8e2d5] rounded-xl text-xs"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-stone-700">Image URL</label>
                <input
                  value={newMediaForm.url}
                  onChange={(e) => setNewMediaForm({ ...newMediaForm, url: e.target.value })}
                  placeholder="https://images.unsplash.com/..."
                  className="mt-1 w-full px-3 py-2 bg-[#faf8f5] border border-[#e8e2d5] rounded-xl text-xs font-mono"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-stone-700">Category Tag</label>
                <select
                  value={newMediaForm.category}
                  onChange={(e) => setNewMediaForm({ ...newMediaForm, category: e.target.value })}
                  className="mt-1 w-full px-3 py-2 bg-[#faf8f5] border border-[#e8e2d5] rounded-xl text-xs"
                >
                  <option value="venues">Venues</option>
                  <option value="catering">Catering</option>
                  <option value="decor">Decor &amp; Mandap</option>
                  <option value="makeup">Makeup</option>
                  <option value="photography">Photography</option>
                  <option value="banner">Banner / Hero</option>
                  <option value="general">General</option>
                </select>
              </div>

              <div className="flex items-end">
                <button
                  type="submit"
                  disabled={mediaUploading}
                  className="w-full py-2.5 rounded-xl bg-[#4a1525] text-[#f5ebd7] font-bold text-xs hover:bg-[#3d111e] transition-colors"
                >
                  {mediaUploading ? 'Registering...' : 'Add to Media Library'}
                </button>
              </div>
            </form>
          </div>

          {/* MEDIA ASSETS GRID */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
            {(mediaLibrary || []).map(item => (
              <div key={item.id} className="bg-white rounded-2xl overflow-hidden border border-[#e8e2d5] shadow-sm flex flex-col justify-between group">
                <div className="relative aspect-[4/3] bg-stone-100 overflow-hidden">
                  <img
                    src={getOptimizedImageUrl(item.url, { width: 400, quality: 75 })}
                    alt={item.title}
                    loading="lazy"
                    decoding="async"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <span className="absolute top-2 left-2 px-2 py-0.5 rounded-full bg-black/60 text-white text-[10px] uppercase font-bold">
                    {item.category}
                  </span>
                </div>
                <div className="p-3">
                  <div className="font-bold text-xs text-stone-900 truncate mb-1">{item.title}</div>
                  <div className="flex items-center justify-between text-[11px] text-stone-500 pt-2 border-t border-stone-100">
                    <button
                      onClick={() => {
                        navigator.clipboard?.writeText(item.url)
                        toast.success('Image URL copied!')
                      }}
                      className="text-[#4a1525] hover:underline font-semibold"
                    >
                      Copy URL
                    </button>
                    <button
                      onClick={() => onDeleteMedia(item.id)}
                      className="text-stone-400 hover:text-rose-600 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 7. SUB-TAB: COUPONS ENGINE */}
      {activeSubTab === 'coupons' && (
        <div className="space-y-6">
          <div className="bg-white rounded-3xl p-4 sm:p-6 border border-[#e8e2d5] shadow-sm">
            <h3 className="font-serif font-bold text-lg text-[#1c1917] mb-1">Create Promotional Privilege</h3>
            <p className="text-xs text-stone-500 mb-4">Issue multi-vendor booking discount codes.</p>
            
            <form onSubmit={handleAddCoupon} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
              <div>
                <label className="text-xs font-bold text-stone-700">Code</label>
                <input
                  value={newCouponForm.code}
                  onChange={(e) => setNewCouponForm({ ...newCouponForm, code: e.target.value.toUpperCase() })}
                  placeholder="e.g. FESTIVE2026"
                  className="mt-1 w-full px-3 py-2 bg-[#faf8f5] border border-[#e8e2d5] rounded-xl text-xs font-mono font-bold"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-stone-700">Discount (₹)</label>
                <input
                  type="number"
                  value={newCouponForm.discountValue}
                  onChange={(e) => setNewCouponForm({ ...newCouponForm, discountValue: e.target.value })}
                  className="mt-1 w-full px-3 py-2 bg-[#faf8f5] border border-[#e8e2d5] rounded-xl text-xs"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-stone-700">Min Order (₹)</label>
                <input
                  type="number"
                  value={newCouponForm.minOrder}
                  onChange={(e) => setNewCouponForm({ ...newCouponForm, minOrder: e.target.value })}
                  className="mt-1 w-full px-3 py-2 bg-[#faf8f5] border border-[#e8e2d5] rounded-xl text-xs"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-stone-700">Description</label>
                <input
                  value={newCouponForm.description}
                  onChange={(e) => setNewCouponForm({ ...newCouponForm, description: e.target.value })}
                  placeholder="Privilege terms..."
                  className="mt-1 w-full px-3 py-2 bg-[#faf8f5] border border-[#e8e2d5] rounded-xl text-xs"
                />
              </div>

              <div className="flex items-end">
                <button
                  type="submit"
                  disabled={couponCreating}
                  className="w-full py-2.5 rounded-xl bg-[#4a1525] text-[#f5ebd7] font-bold text-xs hover:bg-[#3d111e] transition-colors"
                >
                  Create Code
                </button>
              </div>
            </form>
          </div>

          {/* COUPONS TABLE */}
          <div className="bg-white rounded-3xl p-4 sm:p-6 border border-[#e8e2d5] shadow-sm">
            <h4 className="font-serif font-bold text-base text-[#1c1917] mb-3">Active Promotional Codes</h4>
            <div className="divide-y divide-[#f2ede4]">
              {(coupons || []).map(c => (
                <div key={c.id || c.code} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                  <div>
                    <span className="font-mono font-bold text-sm text-[#4a1525] bg-[#faf8f5] px-2.5 py-1 rounded border border-[#e8e2d5]">
                      {c.code}
                    </span>
                    <span className="ml-3 font-semibold text-stone-800">
                      ₹{c.discountValue?.toLocaleString('en-IN')} OFF
                    </span>
                    <span className="text-stone-500 ml-2">
                      (Min order ₹{c.minOrder?.toLocaleString('en-IN')})
                    </span>
                  </div>
                  <span className="self-start sm:self-auto text-emerald-700 font-bold bg-emerald-50 px-2.5 py-0.5 rounded-full">
                    Active
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 8. SUB-TAB: FINANCE & SETTLEMENTS */}
      {activeSubTab === 'finance' && (
        <div className="bg-white rounded-3xl p-4 sm:p-6 border border-[#e8e2d5] shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-serif font-bold text-lg text-[#1c1917]">Vendor Settlement Ledger</h3>
              <p className="text-xs text-stone-500">Gross amounts, 10% platform commission deductions, and net vendor payables.</p>
            </div>
          </div>

          <div className="overflow-x-auto -mx-4 sm:mx-0 px-4 sm:px-0">
            <table className="w-full min-w-[700px] text-left text-xs">
              <thead className="bg-[#faf8f5] text-stone-600 uppercase font-bold border-y border-[#e8e2d5]">
                <tr>
                  <th className="py-3 px-4">Booking Ref</th>
                  <th className="py-3 px-4">Vendor Partner</th>
                  <th className="py-3 px-4">Gross Booking</th>
                  <th className="py-3 px-4">Platform Fee (10%)</th>
                  <th className="py-3 px-4">Net Payable</th>
                  <th className="py-3 px-4">Payout State</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#f2ede4]">
                {(settlements && settlements.length > 0 ? settlements : [
                  {
                    id: 'set_1',
                    bookingId: 'VV-2026-9841',
                    vendorName: 'The Royal Heritage Palace & Lawn',
                    grossAmount: 125000,
                    commission: 12500,
                    netPayable: 112500,
                    status: 'PENDING'
                  }
                ]).map((s) => (
                  <tr key={s.id || s.bookingId} className="hover:bg-[#faf8f5]/60 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-[#4a1525]">{s.bookingId || s.id}</td>
                    <td className="py-3.5 px-4 font-bold text-stone-900">{s.vendorName || 'Vendor Partner'}</td>
                    <td className="py-3.5 px-4 font-semibold text-stone-900">₹{(s.grossAmount || 0).toLocaleString('en-IN')}</td>
                    <td className="py-3.5 px-4 text-[#4a1525] font-semibold">₹{(s.commission || Math.round((s.grossAmount || 0) * 0.1)).toLocaleString('en-IN')}</td>
                    <td className="py-3.5 px-4 font-bold text-emerald-800">₹{(s.netPayable || Math.round((s.grossAmount || 0) * 0.9)).toLocaleString('en-IN')}</td>
                    <td className="py-3.5 px-4">
                      <span className={`px-2.5 py-0.5 rounded-full font-bold text-[10px] ${
                        s.status === 'PAID' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                      }`}>
                        {s.status || 'PENDING'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      {s.status === 'PAID' ? (
                        <span className="text-xs text-emerald-700 font-semibold">Settled</span>
                      ) : (
                        <button
                          onClick={() => {
                            if (onUpdateSettlement) onUpdateSettlement(s.id, 'PAID')
                            toast.success(`Settlement ${s.bookingId || s.id} payout authorized!`)
                          }}
                          className="px-3 py-1 rounded-lg text-xs font-semibold bg-[#4a1525] text-white hover:bg-[#3d111e] transition-colors"
                        >
                          Authorize Payout
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

    </div>
  )
}
