'use client'

import React, { useState, useEffect } from 'react'
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
  ShieldAlert
} from 'lucide-react'
import { toast } from 'sonner'

export const INITIAL_LIVE_EVENTS = [
  {
    id: 'evt_1',
    category: 'NEGOTIATION',
    urgency: 'HIGH',
    title: 'Kapoor Family submitted counter-offer of ₹3,50,000 on Taj Lake Palace',
    time: '2 mins ago',
    icon: DollarSign,
    unread: true
  },
  {
    id: 'evt_2',
    category: 'BOOKING',
    urgency: 'NORMAL',
    title: 'Vendor Rambagh Citadel confirmed royal wedding booking #VV-8491',
    time: '14 mins ago',
    icon: CheckCircle2,
    unread: true
  },
  {
    id: 'evt_3',
    category: 'FINANCIAL',
    urgency: 'CRITICAL',
    title: 'Milestone 2 payment (₹4,80,000) due in 48 hours for Sharma Wedding',
    time: '45 mins ago',
    icon: ShieldAlert,
    unread: true
  },
  {
    id: 'evt_4',
    category: 'RECCE',
    urgency: 'NORMAL',
    title: 'New Site Recce scheduled for Umaid Bhawan Citadel on Nov 2nd (400 guests)',
    time: '2 hours ago',
    icon: Calendar,
    unread: false
  },
  {
    id: 'evt_5',
    category: 'LEAD',
    urgency: 'NORMAL',
    title: 'Ultra-Luxury Lead (₹65L+) received for Udaipur Lakefront Palace',
    time: '3 hours ago',
    icon: Sparkles,
    unread: false
  }
]

export default function AdminLiveTicker() {
  const [events, setEvents] = useState(INITIAL_LIVE_EVENTS)
  const [currentTickerIdx, setCurrentTickerIdx] = useState(0)
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [filter, setFilter] = useState('ALL')

  // Rotate ticker every 5 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTickerIdx(prev => (prev + 1) % events.length)
    }, 5000)
    return () => clearInterval(timer)
  }, [events.length])

  const unreadCount = events.filter(e => e.unread).length

  const markAllRead = () => {
    setEvents(prev => prev.map(e => ({ ...e, unread: false })))
    toast.success('All operational notifications marked as read')
  }

  const filteredEvents = events.filter(e => {
    if (filter === 'ALL') return true
    if (filter === 'UNREAD') return e.unread
    if (filter === 'CRITICAL') return e.urgency === 'CRITICAL' || e.urgency === 'HIGH'
    return true
  })

  const currentEvent = events[currentTickerIdx]

  return (
    <div className="relative flex items-center gap-3">
      {/* Live Rotating Ticker Bar */}
      <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-full bg-stone-900/90 border border-stone-800 text-xs max-w-md overflow-hidden">
        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0" />
        <span className="text-[10px] font-mono text-champagne uppercase font-bold shrink-0">Live:</span>
        <span className="text-stone-300 truncate text-[11px] font-sans transition-all duration-300">
          {currentEvent?.title}
        </span>
      </div>

      {/* Notification Bell Button with Badge */}
      <div className="relative">
        <button
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          className="relative p-2 rounded-xl bg-stone-900 border border-stone-800 text-stone-300 hover:text-white hover:bg-stone-800 transition-colors"
          title="Live Operational Notifications"
        >
          <Bell className="w-4 h-4" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-amber-500 text-stone-950 font-bold text-[9px] flex items-center justify-center animate-bounce">
              {unreadCount}
            </span>
          )}
        </button>

        {/* Dropdown Notification Drawer */}
        {isDropdownOpen && (
          <div className="absolute right-0 mt-2 w-96 bg-white rounded-2xl shadow-2xl border border-stone-200 z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-150 text-stone-900">
            {/* Header */}
            <div className="p-3.5 bg-stone-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Bell className="w-4 h-4 text-champagne" />
                <h4 className="font-serif font-bold text-xs">Live Operational Feed</h4>
                {unreadCount > 0 && (
                  <span className="text-[10px] bg-champagne/20 text-champagne px-2 py-0.5 rounded-full font-bold">
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
                    Mark read
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
            <div className="flex items-center gap-1 p-2 bg-stone-50 border-b border-stone-200 text-[10px] font-bold">
              {['ALL', 'UNREAD', 'CRITICAL'].map(tab => (
                <button
                  key={tab}
                  onClick={() => setFilter(tab)}
                  className={`px-2.5 py-1 rounded-md transition-colors ${
                    filter === tab ? 'bg-stone-900 text-white' : 'text-stone-600 hover:bg-stone-200'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            {/* Notifications List */}
            <div className="max-h-80 overflow-y-auto divide-y divide-stone-100 text-xs">
              {filteredEvents.length === 0 ? (
                <div className="p-6 text-center text-stone-400 text-xs">
                  No notifications in this filter
                </div>
              ) : (
                filteredEvents.map(evt => (
                  <div
                    key={evt.id}
                    className={`p-3 transition-colors flex items-start gap-2.5 ${
                      evt.unread ? 'bg-amber-50/40 hover:bg-amber-50/70' : 'hover:bg-stone-50'
                    }`}
                  >
                    <span className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${
                      evt.urgency === 'CRITICAL' ? 'bg-rose-500' : evt.unread ? 'bg-amber-400' : 'bg-transparent'
                    }`} />
                    <div className="flex-1 space-y-0.5">
                      <p className="text-stone-800 text-[11px] font-medium leading-snug">
                        {evt.title}
                      </p>
                      <span className="text-[10px] text-stone-400 block font-mono">
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
