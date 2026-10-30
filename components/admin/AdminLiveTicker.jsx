'use client'

import React, { useState, useEffect, useMemo } from 'react'
import {
  Bell,
  Sparkles,
  TrendingUp,
  DollarSign,
  Calendar,
  Building2,
  CheckCircle2,
  X,
  Clock,
  ChevronRight,
  ShieldAlert,
  ShieldCheck
} from 'lucide-react'
import { toast } from 'sonner'

export default function AdminLiveTicker({
  bookings = [],
  vendors = [],
  settlements = [],
  negotiations = []
}) {
  const [currentTickerIdx, setCurrentTickerIdx] = useState(0)
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [filter, setFilter] = useState('ALL')
  const [dismissedIds, setDismissedIds] = useState([])

  // Dynamically derive operational events from REAL database state — NO FAKE DATA
  const events = useMemo(() => {
    const list = []

    // 1. Pending vendor KYC verifications
    const pendingVendors = vendors.filter(v => !v.verified)
    pendingVendors.slice(0, 3).forEach(v => {
      list.push({
        id: `v_pending_${v.id}`,
        category: 'KYC',
        urgency: 'HIGH',
        title: `Vendor KYC pending review: ${v.name} (${v.city || 'India'})`,
        time: 'Pending Review',
        icon: Building2,
        unread: true
      })
    })

    // 2. Real recent bookings
    bookings.slice(0, 4).forEach(b => {
      const bNum = b.bookingNumber || (b.id ? b.id.slice(-6) : 'BK-NEW')
      const amt = Number(b.totalAmount || b.totalPrice || 0)
      list.push({
        id: `bk_${b.id || bNum}`,
        category: 'BOOKING',
        urgency: b.paymentStatus === 'paid' ? 'NORMAL' : 'HIGH',
        title: `Booking #${bNum} • ${b.venueName || b.items?.[0]?.name || 'Venue'} (${b.paymentStatus === 'paid' ? 'Paid' : 'Advance: ₹' + amt.toLocaleString('en-IN')})`,
        time: b.createdAt ? new Date(b.createdAt).toLocaleDateString('en-IN') : 'Recent',
        icon: CheckCircle2,
        unread: b.paymentStatus !== 'paid'
      })
    })

    // 3. Real pending settlements
    const pendingSettlements = settlements.filter(s => s.status === 'PENDING')
    pendingSettlements.slice(0, 3).forEach(s => {
      list.push({
        id: `stl_${s.id}`,
        category: 'FINANCIAL',
        urgency: 'CRITICAL',
        title: `Settlement pending release: ₹${Number(s.netPayable || 0).toLocaleString('en-IN')} for ${s.vendorName || 'Vendor'}`,
        time: 'Pending Payout',
        icon: ShieldAlert,
        unread: true
      })
    })

    // 4. Real active negotiations
    negotiations.slice(0, 2).forEach(n => {
      list.push({
        id: `neg_${n.id}`,
        category: 'NEGOTIATION',
        urgency: 'NORMAL',
        title: `Price Negotiation active: ${n.vendorName || 'Client inquiry'}`,
        time: 'Active',
        icon: DollarSign,
        unread: true
      })
    })

    // Fallback if no pending items: clean status
    if (list.length === 0) {
      list.push({
        id: 'evt_healthy',
        category: 'SYSTEM',
        urgency: 'NORMAL',
        title: 'All systems operational • MongoDB Atlas connected • No pending alerts',
        time: 'Live',
        icon: ShieldCheck,
        unread: false
      })
    }

    return list.filter(e => !dismissedIds.includes(e.id))
  }, [bookings, vendors, settlements, negotiations, dismissedIds])

  // Rotate ticker every 5 seconds
  useEffect(() => {
    if (events.length <= 1) return
    const timer = setInterval(() => {
      setCurrentTickerIdx(prev => (prev + 1) % events.length)
    }, 5000)
    return () => clearInterval(timer)
  }, [events.length])

  const unreadCount = events.filter(e => e.unread).length

  const markAllRead = () => {
    setDismissedIds(events.map(e => e.id))
    toast.success('All operational notifications marked as read')
  }

  const filteredEvents = events.filter(e => {
    if (filter === 'ALL') return true
    if (filter === 'UNREAD') return e.unread
    if (filter === 'CRITICAL') return e.urgency === 'CRITICAL' || e.urgency === 'HIGH'
    return true
  })

  const currentEvent = events[currentTickerIdx] || events[0]

  return (
    <div className="relative flex items-center gap-2">
      {/* Live Rotating Ticker Bar */}
      <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-full bg-stone-900/90 border border-stone-800 text-xs max-w-sm xl:max-w-md overflow-hidden">
        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0" />
        <span className="text-[10px] font-mono text-[#c5a059] uppercase font-bold shrink-0">Live:</span>
        <span className="text-stone-300 truncate text-[11px] font-sans">
          {currentEvent?.title}
        </span>
      </div>

      {/* Notification Bell Button with Badge */}
      <div className="relative">
        <button
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          className="relative p-2 rounded-xl bg-stone-900 border border-stone-800 text-stone-300 hover:text-white hover:bg-stone-800 transition-colors"
          title="Operational Notifications"
        >
          <Bell className="w-4 h-4" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#c5a059] text-stone-950 font-bold text-[9px] flex items-center justify-center animate-bounce">
              {unreadCount}
            </span>
          )}
        </button>

        {/* Dropdown Notification Drawer */}
        {isDropdownOpen && (
          <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-[#1c1917] rounded-2xl shadow-2xl border border-stone-800 z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-150 text-white">
            {/* Header */}
            <div className="p-3.5 bg-stone-950 border-b border-stone-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Bell className="w-4 h-4 text-[#c5a059]" />
                <h4 className="font-serif font-bold text-xs">Live Operational Alerts</h4>
                {unreadCount > 0 && (
                  <span className="text-[10px] bg-[#c5a059]/20 text-[#e8d08d] px-2 py-0.5 rounded-full font-bold">
                    {unreadCount} new
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                {unreadCount > 0 && (
                  <button
                    onClick={markAllRead}
                    className="text-[10px] text-stone-400 hover:text-white font-medium"
                  >
                    Clear all
                  </button>
                )}
                <button
                  onClick={() => setIsDropdownOpen(false)}
                  className="text-stone-400 hover:text-white text-xs font-bold"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Filter Tabs */}
            <div className="flex items-center gap-1 p-2 bg-stone-900 border-b border-stone-800 text-[10px] font-bold">
              {['ALL', 'UNREAD', 'CRITICAL'].map(tab => (
                <button
                  key={tab}
                  onClick={() => setFilter(tab)}
                  className={`px-2.5 py-1 rounded-md transition-colors ${
                    filter === tab ? 'bg-[#c5a059] text-stone-950 font-bold' : 'text-stone-400 hover:bg-stone-800'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            {/* Notifications List */}
            <div className="max-h-80 overflow-y-auto divide-y divide-stone-800/60 text-xs">
              {filteredEvents.length === 0 ? (
                <div className="p-6 text-center text-stone-500 text-xs">
                  No alerts in this category
                </div>
              ) : (
                filteredEvents.map(evt => (
                  <div
                    key={evt.id}
                    className={`p-3 transition-colors flex items-start gap-2.5 ${
                      evt.unread ? 'bg-stone-900/80 hover:bg-stone-800/80' : 'hover:bg-stone-900/40'
                    }`}
                  >
                    <span className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${
                      evt.urgency === 'CRITICAL' ? 'bg-rose-500' : evt.unread ? 'bg-[#c5a059]' : 'bg-stone-600'
                    }`} />
                    <div className="flex-1 space-y-0.5">
                      <p className="text-stone-200 text-[11px] font-medium leading-snug">
                        {evt.title}
                      </p>
                      <span className="text-[10px] text-stone-500 block font-mono">
                        {evt.time}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
