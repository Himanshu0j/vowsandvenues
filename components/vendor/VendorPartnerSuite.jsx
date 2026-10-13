'use client'

import React, { useState } from 'react'
import {
  Building2,
  CalendarDays,
  DollarSign,
  TrendingUp,
  MessageSquare,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Clock,
  Sparkles,
  Phone,
  Send,
  Lock,
  ChevronLeft,
  ChevronRight,
  Plus,
  Image as ImageIcon,
  Save,
  AlertCircle,
  ExternalLink,
  UserCheck,
  Percent
} from 'lucide-react'
import { toast } from 'sonner'

export const MOCK_VENDOR_PARTNERS = [
  {
    id: 'v_royal_palace_lko',
    name: 'The Royal Nawabi Palace & Lawns',
    category: 'venues',
    city: 'Lucknow',
    rating: 4.95,
    reviewCount: 142,
    startingPrice: 200000,
    priceUnit: 'per day',
    vegPlate: 2400,
    nonVegPlate: 3200,
    capacity: 800,
    responseTime: '< 30 mins',
    verified: true,
    accountHolder: 'Nawab Asad Mirza Hospitality Pvt Ltd',
    bankName: 'HDFC Bank, Hazratganj Branch',
    accountNumber: '•••• •••• 9842',
    ifsc: 'HDFC0001245',
    pan: 'AABCN8291F',
    gstin: '09AABCN8291F1Z4',
    coverImage: 'https://images.unsplash.com/photo-1545232979-fbf675432098?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 'v_rambagh_citadel',
    name: 'Rambagh Citadel & Mughal Gardens',
    category: 'venues',
    city: 'Jaipur',
    rating: 4.99,
    reviewCount: 218,
    startingPrice: 1800000,
    priceUnit: 'per day',
    vegPlate: 4500,
    nonVegPlate: 5800,
    capacity: 1200,
    responseTime: '< 45 mins',
    verified: true,
    accountHolder: 'Rambagh Heritage Citadels Ltd',
    bankName: 'ICICI Bank, C-Scheme Jaipur',
    accountNumber: '•••• •••• 6104',
    ifsc: 'ICIC0000014',
    pan: 'AAACR1098E',
    gstin: '08AAACR1098E1Z8',
    coverImage: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 'v_gulmohar_decor',
    name: 'Gulmohar Luxury Events & Stage Decor',
    category: 'decor',
    city: 'Lucknow',
    rating: 4.88,
    reviewCount: 96,
    startingPrice: 450000,
    priceUnit: 'per event',
    vegPlate: 0,
    nonVegPlate: 0,
    capacity: 600,
    responseTime: '< 2 hours',
    verified: true,
    accountHolder: 'Gulmohar Artisanal Decors LLP',
    bankName: 'Axis Bank, Gomti Nagar',
    accountNumber: '•••• •••• 4421',
    ifsc: 'UTIB0000452',
    pan: 'AABFG3821C',
    gstin: '09AABFG3821C1Z1',
    coverImage: 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=800&q=80'
  }
]

export const INITIAL_VENDOR_LEADS = [
  {
    id: 'neg_v_01',
    clientName: 'Aanya Singhania & Kabir Kapoor',
    phone: '+919820123456',
    eventDate: '2026-12-14',
    guestCount: 450,
    originalPrice: 200000,
    offeredPrice: 160000,
    status: 'OFFER_MADE',
    notes: 'Requested inclusion of the central marble fountain lighting for evening baraat.',
    updatedAt: '2 hours ago'
  },
  {
    id: 'neg_v_02',
    clientName: 'Rhea Bahl & Devrat Mehra',
    phone: '+919811223344',
    eventDate: '2026-11-28',
    guestCount: 300,
    originalPrice: 200000,
    offeredPrice: 180000,
    status: 'COUNTER_SENT',
    counterPrice: 185000,
    notes: 'Countered with complimentary bridal suite upgrade.',
    updatedAt: 'Yesterday'
  },
  {
    id: 'neg_v_03',
    clientName: 'Simran Chawla & Rohan Oberoi',
    phone: '+919876543210',
    eventDate: '2026-12-21',
    guestCount: 500,
    originalPrice: 250000,
    offeredPrice: 220000,
    status: 'ACCEPTED',
    notes: '20% Token advance paid into escrow. Contract confirmed!',
    updatedAt: '3 days ago'
  }
]

export const INITIAL_BLOCKED_DATES = [
  { date: '2026-11-18', reason: 'Dev Uthani Ekadashi — Booked for Sharma Royal Wedding' },
  { date: '2026-11-28', reason: 'Private Palace Event' },
  { date: '2026-12-14', reason: 'Under Negotiation (Singhania Family)' },
  { date: '2026-12-21', reason: 'Booked — Oberoi Grand Sangeet' }
]

export default function VendorPartnerSuite() {
  const [selectedVendorId, setSelectedVendorId] = useState(MOCK_VENDOR_PARTNERS[0].id)
  const [activeTab, setActiveTab] = useState('overview') // 'overview' | 'negotiations' | 'calendar' | 'kyc_finance' | 'storefront'
  const [leads, setLeads] = useState(INITIAL_VENDOR_LEADS)
  const [blockedDates, setBlockedDates] = useState(INITIAL_BLOCKED_DATES)

  // Counter offer modal state
  const [activeCounterLead, setActiveCounterLead] = useState(null)
  const [counterPriceInput, setCounterPriceInput] = useState('')
  const [counterNotesInput, setCounterNotesInput] = useState('')

  // Calendar state
  const [selectedMonth, setSelectedMonth] = useState('November 2026')
  const [blockDateInput, setBlockDateInput] = useState('')
  const [blockReasonInput, setBlockReasonInput] = useState('')

  const activeVendor = MOCK_VENDOR_PARTNERS.find(v => v.id === selectedVendorId) || MOCK_VENDOR_PARTNERS[0]

  // Lead Actions
  const handleAcceptOffer = (leadId) => {
    setLeads(prev => prev.map(l => l.id === leadId ? { ...l, status: 'ACCEPTED' } : l))
    toast.success('Offer Accepted! Customer notified to deposit 20% token advance.')
  }

  const handleDeclineOffer = (leadId) => {
    setLeads(prev => prev.map(l => l.id === leadId ? { ...l, status: 'DECLINED' } : l))
    toast.error('Offer declined.')
  }

  const handleSendCounter = (e) => {
    e.preventDefault()
    if (!counterPriceInput) {
      toast.error('Please enter a valid counter price')
      return
    }
    const priceNum = Number(counterPriceInput)
    setLeads(prev => prev.map(l => l.id === activeCounterLead.id ? {
      ...l,
      status: 'COUNTER_SENT',
      counterPrice: priceNum,
      notes: counterNotesInput || l.notes
    } : l))
    toast.success(`Counter-offer of ₹${priceNum.toLocaleString('en-IN')} sent to customer!`)
    setActiveCounterLead(null)
    setCounterPriceInput('')
    setCounterNotesInput('')
  }

  // Calendar Block Action
  const handleToggleBlockDate = (e) => {
    e.preventDefault()
    if (!blockDateInput) return
    const exists = blockedDates.some(b => b.date === blockDateInput)
    if (exists) {
      setBlockedDates(prev => prev.filter(b => b.date !== blockDateInput))
      toast.success(`Date ${blockDateInput} is now AVAILABLE for booking!`)
    } else {
      setBlockedDates(prev => [...prev, { date: blockDateInput, reason: blockReasonInput || 'Blocked by Venue Owner' }])
      toast.info(`Date ${blockDateInput} BLOCKED on marketplace!`)
    }
    setBlockDateInput('')
    setBlockReasonInput('')
  }

  // 1-Click WhatsApp Chat
  const openWhatsAppLead = (lead) => {
    const cleanPhone = lead.phone.replace(/[^0-9]/g, '')
    const msg = encodeURIComponent(
      `Namaste ${lead.clientName}! Greetings from ${activeVendor.name} management.\n\n` +
      `Regarding your wedding event on ${lead.eventDate} (Guests: ~${lead.guestCount}):\n` +
      `We have reviewed your request on Vows & Venues.\n\n` +
      `Would you like to schedule a personal venue walkthrough or discuss customized menus?`
    )
    window.open(`https://wa.me/${cleanPhone}?text=${msg}`, '_blank')
  }

  return (
    <div className="space-y-6">
      {/* Top Banner with Vendor Profile Switcher */}
      <div className="bg-gradient-to-r from-stone-900 via-emerald-950/90 to-stone-900 text-white rounded-3xl p-6 sm:p-8 border border-emerald-500/30 shadow-2xl">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 text-stone-950 flex items-center justify-center font-serif text-2xl font-bold shadow-lg shrink-0">
              {activeVendor.name.split(' ').map(w => w[0]).slice(0, 2).join('')}
            </div>
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-semibold uppercase tracking-wider mb-1">
                <Building2 className="w-3.5 h-3.5" />
                <span>Verified Partner Storefront</span>
              </div>
              <h1 className="font-serif text-2xl sm:text-3xl font-bold text-white">{activeVendor.name}</h1>
              <div className="flex flex-wrap items-center gap-3 text-xs text-stone-300 mt-1">
                <span>📍 {activeVendor.city}</span>
                <span>★ {activeVendor.rating} ({activeVendor.reviewCount} Reviews)</span>
                <span>⚡ Avg Response: {activeVendor.responseTime}</span>
              </div>
            </div>
          </div>

          {/* Quick Vendor Selector (For Testing Multiple Venues) */}
          <div className="bg-stone-900/90 border border-white/10 rounded-2xl p-3 flex flex-col sm:flex-row items-start sm:items-center gap-2">
            <span className="text-[11px] font-bold text-stone-400 uppercase tracking-wider">Switch Storefront:</span>
            <select
              value={selectedVendorId}
              onChange={(e) => setSelectedVendorId(e.target.value)}
              className="text-xs bg-stone-800 text-white font-semibold px-3 py-1.5 rounded-xl border border-stone-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
            >
              {MOCK_VENDOR_PARTNERS.map(v => (
                <option key={v.id} value={v.id}>{v.name} ({v.city})</option>
              ))}
            </select>
          </div>
        </div>

        {/* Operational Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pt-6 mt-6 border-t border-white/10 text-xs">
          {[
            { id: 'overview', label: 'Overview & Analytics', icon: TrendingUp },
            { id: 'negotiations', label: `Lead Inbox & Offers (${leads.filter(l => l.status === 'OFFER_MADE').length})`, icon: MessageSquare },
            { id: 'calendar', label: `Availability Calendar (${blockedDates.length} Blocked)`, icon: CalendarDays },
            { id: 'kyc_finance', label: 'Bank KYC & Escrow Payouts', icon: DollarSign },
            { id: 'storefront', label: 'Pricing & Capacity Settings', icon: Building2 }
          ].map(tab => {
            const Icon = tab.icon
            const isActive = activeTab === tab.id
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2.5 rounded-xl font-bold flex items-center gap-2 whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-gradient-to-r from-amber-400 to-champagne text-stone-900 shadow-md'
                    : 'text-stone-300 hover:bg-stone-800 hover:text-white'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            )
          })}
        </div>
      </div>

      {/* ======================================================== */}
      {/* 1. OVERVIEW & ANALYTICS TAB */}
      {/* ======================================================== */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white rounded-2xl p-5 border border-stone-200 shadow-sm">
              <span className="text-[11px] text-stone-500 uppercase tracking-wider block font-bold">Total Inquiries</span>
              <span className="font-serif text-2xl font-bold text-stone-900 mt-1 block">48 Couples</span>
              <span className="text-[10px] text-emerald-600 font-bold block mt-1">↑ 18% this wedding season</span>
            </div>
            <div className="bg-white rounded-2xl p-5 border border-stone-200 shadow-sm">
              <span className="text-[11px] text-stone-500 uppercase tracking-wider block font-bold">Confirmed Bookings</span>
              <span className="font-serif text-2xl font-bold text-emerald-700 mt-1 block">14 Weddings</span>
              <span className="text-[10px] text-stone-500 block mt-1">Token advance held in escrow</span>
            </div>
            <div className="bg-white rounded-2xl p-5 border border-stone-200 shadow-sm">
              <span className="text-[11px] text-stone-500 uppercase tracking-wider block font-bold">Gross Contract Value</span>
              <span className="font-serif text-2xl font-bold text-stone-900 mt-1 block">₹38.5 Lakhs</span>
              <span className="text-[10px] text-stone-500 block mt-1">Avg ₹2.75L per event</span>
            </div>
            <div className="bg-emerald-50/70 rounded-2xl p-5 border border-emerald-200 shadow-sm">
              <span className="text-[11px] text-emerald-800 uppercase tracking-wider block font-bold">Net Payouts Received</span>
              <span className="font-serif text-2xl font-bold text-emerald-950 mt-1 block">₹34.65 Lakhs</span>
              <span className="text-[10px] text-emerald-700 font-bold block mt-1">10% Platform fee deducted</span>
            </div>
          </div>

          {/* Incoming Recent Offers Banner */}
          <div className="bg-white rounded-2xl p-6 border border-stone-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100">
              <div>
                <h3 className="font-serif font-bold text-base text-stone-900">Urgent Pending Price Negotiations</h3>
                <p className="text-xs text-stone-500">Respond within 45 mins to maintain your Elite Partner SLA badge.</p>
              </div>
              <button
                onClick={() => setActiveTab('negotiations')}
                className="text-xs text-emerald-700 hover:text-emerald-800 font-bold"
              >
                View All Leads →
              </button>
            </div>

            <div className="divide-y divide-stone-100">
              {leads.filter(l => l.status === 'OFFER_MADE').map(lead => (
                <div key={lead.id} className="py-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
                  <div>
                    <span className="font-bold text-stone-900 text-sm block">{lead.clientName}</span>
                    <span className="text-stone-500 text-[11px]">
                      Date: {lead.eventDate} · Guests: ~{lead.guestCount} pax · Offered: <strong>₹{(lead.offeredPrice).toLocaleString('en-IN')}</strong> (Original: ₹{(lead.originalPrice).toLocaleString('en-IN')})
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleAcceptOffer(lead.id)}
                      className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs"
                    >
                      Accept ₹{(lead.offeredPrice / 1000).toFixed(0)}k
                    </button>
                    <button
                      onClick={() => {
                        setActiveCounterLead(lead)
                        setCounterPriceInput(String(Math.round((lead.originalPrice + lead.offeredPrice) / 2)))
                      }}
                      className="px-3 py-1.5 rounded-lg bg-stone-900 hover:bg-black text-white font-bold text-xs"
                    >
                      Counter-Offer
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 2. LEAD INBOX & PRICE OFFERS TAB */}
      {/* ======================================================== */}
      {activeTab === 'negotiations' && (
        <div className="bg-white rounded-2xl p-6 border border-stone-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-stone-200">
            <div>
              <h3 className="font-serif font-bold text-lg text-stone-900">Live Customer Negotiations &amp; Offers</h3>
              <p className="text-xs text-stone-500">Manage price bids submitted by couples through the marketplace concierge.</p>
            </div>
            <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-3 py-1 rounded-full">
              {leads.length} Total Negotiations
            </span>
          </div>

          <div className="space-y-4">
            {leads.map(lead => (
              <div
                key={lead.id}
                className="p-5 rounded-2xl border border-stone-200 bg-stone-50/60 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4"
              >
                <div className="space-y-1.5 flex-1">
                  <div className="flex items-center gap-2">
                    <h4 className="font-serif font-bold text-base text-stone-900">{lead.clientName}</h4>
                    <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                      lead.status === 'ACCEPTED'
                        ? 'bg-emerald-100 text-emerald-800'
                        : lead.status === 'COUNTER_SENT'
                        ? 'bg-sky-100 text-sky-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}>
                      {lead.status === 'ACCEPTED' ? 'Offer Accepted' : lead.status === 'COUNTER_SENT' ? 'Counter Sent' : 'Pending Vendor Action'}
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-4 text-xs text-stone-600">
                    <span>📅 Event Date: <strong>{lead.eventDate}</strong></span>
                    <span>👥 Estimated Guests: <strong>{lead.guestCount} pax</strong></span>
                    <span>🕒 Activity: {lead.updatedAt}</span>
                  </div>

                  {/* Price Comparison Pill */}
                  <div className="inline-flex items-center gap-3 bg-white px-3 py-1.5 rounded-xl border border-stone-200 text-xs mt-1">
                    <span className="text-stone-400 line-through">Original: ₹{(lead.originalPrice).toLocaleString('en-IN')}</span>
                    <span className="font-bold text-emerald-700">Client Offered: ₹{(lead.offeredPrice).toLocaleString('en-IN')}</span>
                    {lead.counterPrice && (
                      <span className="font-bold text-purple-700">Your Counter: ₹{(lead.counterPrice).toLocaleString('en-IN')}</span>
                    )}
                  </div>

                  {lead.notes && (
                    <p className="text-xs text-stone-500 italic mt-1">&ldquo;{lead.notes}&rdquo;</p>
                  )}
                </div>

                {/* Actions */}
                <div className="flex flex-wrap items-center gap-2 self-end lg:self-center">
                  <button
                    onClick={() => openWhatsAppLead(lead)}
                    className="px-3 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 font-bold text-xs flex items-center gap-1.5 transition-colors"
                  >
                    <Send className="w-3.5 h-3.5 text-emerald-600" />
                    <span>WhatsApp</span>
                  </button>

                  {lead.status === 'OFFER_MADE' && (
                    <>
                      <button
                        onClick={() => handleAcceptOffer(lead.id)}
                        className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs"
                      >
                        Accept Offer
                      </button>
                      <button
                        onClick={() => {
                          setActiveCounterLead(lead)
                          setCounterPriceInput(String(Math.round((lead.originalPrice + lead.offeredPrice) / 2)))
                        }}
                        className="px-4 py-2 rounded-xl bg-stone-900 hover:bg-black text-white font-bold text-xs shadow-xs"
                      >
                        Counter
                      </button>
                      <button
                        onClick={() => handleDeclineOffer(lead.id)}
                        className="px-3 py-2 rounded-xl bg-stone-200 hover:bg-stone-300 text-stone-700 font-semibold text-xs"
                      >
                        Decline
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 3. AVAILABILITY & BLOCKED DATES CALENDAR TAB */}
      {/* ======================================================== */}
      {activeTab === 'calendar' && (
        <div className="bg-white rounded-2xl p-6 border border-stone-200 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-stone-200">
            <div>
              <h3 className="font-serif font-bold text-lg text-stone-900">Venue Availability &amp; Blackout Dates</h3>
              <p className="text-xs text-stone-500">Block offline bookings or maintenance days to avoid double-bookings.</p>
            </div>
            <span className="text-xs font-mono font-bold text-amber-800 bg-amber-50 px-3 py-1 rounded-full border border-amber-200">
              {blockedDates.length} Dates Blocked
            </span>
          </div>

          {/* Quick Block / Unblock Form */}
          <form onSubmit={handleToggleBlockDate} className="bg-stone-50 p-4 rounded-2xl border border-stone-200 flex flex-col md:flex-row items-end gap-3 text-xs">
            <div className="w-full md:w-48">
              <label className="block font-bold text-stone-700 mb-1">Select Date</label>
              <input
                type="date"
                required
                value={blockDateInput}
                onChange={(e) => setBlockDateInput(e.target.value)}
                className="w-full px-3 py-2 border rounded-xl bg-white"
              />
            </div>
            <div className="flex-1 w-full">
              <label className="block font-bold text-stone-700 mb-1">Reason / Notes (Optional)</label>
              <input
                type="text"
                placeholder="e.g. Booked for Kapoor Family Wedding or Renovation"
                value={blockReasonInput}
                onChange={(e) => setBlockReasonInput(e.target.value)}
                className="w-full px-3 py-2 border rounded-xl bg-white"
              />
            </div>
            <button
              type="submit"
              className="w-full md:w-auto px-5 py-2.5 rounded-xl bg-stone-900 hover:bg-black text-white font-bold text-xs shrink-0"
            >
              Toggle Blackout Date
            </button>
          </form>

          {/* Blocked Dates List */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {blockedDates.map(b => (
              <div key={b.date} className="p-3.5 rounded-xl border border-rose-200 bg-rose-50/50 flex flex-col justify-between space-y-2">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-rose-950 font-mono">{b.date}</span>
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-rose-200 text-rose-900">BLOCKED</span>
                  </div>
                  <p className="text-[11px] text-stone-600 mt-1 line-clamp-2">{b.reason}</p>
                </div>
                <button
                  onClick={() => {
                    setBlockedDates(prev => prev.filter(x => x.date !== b.date))
                    toast.success(`Date ${b.date} unblocked!`)
                  }}
                  className="text-[11px] text-rose-700 hover:underline font-bold text-left"
                >
                  Unblock Date ✕
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 4. BANK KYC & MILESTONE PAYOUTS TAB */}
      {/* ======================================================== */}
      {activeTab === 'kyc_finance' && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl p-6 border border-stone-200 shadow-sm space-y-4">
            <h3 className="font-serif font-bold text-lg text-stone-900">Verified Bank Account Details (NEFT/RTGS)</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-mono bg-stone-50 p-4 rounded-2xl border border-stone-200">
              <div>
                <span className="text-stone-400 block text-[10px] uppercase font-bold font-sans">Beneficiary Name</span>
                <span className="font-bold text-stone-900">{activeVendor.accountHolder}</span>
              </div>
              <div>
                <span className="text-stone-400 block text-[10px] uppercase font-bold font-sans">Bank &amp; Branch</span>
                <span className="font-bold text-stone-900">{activeVendor.bankName}</span>
              </div>
              <div>
                <span className="text-stone-400 block text-[10px] uppercase font-bold font-sans">Account Number</span>
                <span className="font-bold text-stone-900">{activeVendor.accountNumber}</span>
              </div>
              <div>
                <span className="text-stone-400 block text-[10px] uppercase font-bold font-sans">IFSC Code</span>
                <span className="font-bold text-stone-900">{activeVendor.ifsc}</span>
              </div>
              <div>
                <span className="text-stone-400 block text-[10px] uppercase font-bold font-sans">PAN Registration</span>
                <span className="font-bold text-stone-900">{activeVendor.pan}</span>
              </div>
              <div>
                <span className="text-stone-400 block text-[10px] uppercase font-bold font-sans">GSTIN</span>
                <span className="font-bold text-stone-900">{activeVendor.gstin}</span>
              </div>
            </div>
          </div>

          {/* Milestone Settlements Register */}
          <div className="bg-white rounded-2xl p-6 border border-stone-200 shadow-sm space-y-4">
            <h3 className="font-serif font-bold text-base text-stone-900">Recent Milestone Payouts</h3>
            <div className="divide-y divide-stone-100 text-xs">
              <div className="py-3 flex items-center justify-between">
                <div>
                  <span className="font-bold text-stone-900 block">Singhania Wedding — 20% Token Advance</span>
                  <span className="text-[10px] text-stone-500">UTR: HDFC891240189 • Released 10 Oct 2026</span>
                </div>
                <div className="text-right">
                  <span className="font-bold text-emerald-700 block font-mono">₹40,000</span>
                  <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded">SETTLED</span>
                </div>
              </div>
              <div className="py-3 flex items-center justify-between">
                <div>
                  <span className="font-bold text-stone-900 block">Oberoi Sangeet — 40% Milestone 2</span>
                  <span className="text-[10px] text-stone-500">Scheduled for release on 15 Nov 2026</span>
                </div>
                <div className="text-right">
                  <span className="font-bold text-amber-700 block font-mono">₹88,000</span>
                  <span className="text-[10px] font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded">HELD IN ESCROW</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 5. PRICING & CAPACITY STOREFRONT TAB */}
      {/* ======================================================== */}
      {activeTab === 'storefront' && (
        <div className="bg-white rounded-2xl p-6 border border-stone-200 shadow-sm space-y-4 text-xs">
          <h3 className="font-serif font-bold text-lg text-stone-900">Manage Storefront Pricing &amp; Guest Capacity</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block font-bold text-stone-700 mb-1">Starting Rental Price (₹)</label>
              <input
                type="number"
                defaultValue={activeVendor.startingPrice}
                className="w-full px-3 py-2 border rounded-xl"
              />
            </div>
            <div>
              <label className="block font-bold text-stone-700 mb-1">Veg Per-Plate Rate (₹)</label>
              <input
                type="number"
                defaultValue={activeVendor.vegPlate}
                className="w-full px-3 py-2 border rounded-xl"
              />
            </div>
            <div>
              <label className="block font-bold text-stone-700 mb-1">Non-Veg Per-Plate Rate (₹)</label>
              <input
                type="number"
                defaultValue={activeVendor.nonVegPlate}
                className="w-full px-3 py-2 border rounded-xl"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-stone-700 mb-1">Maximum Guest Capacity (Pax)</label>
              <input
                type="number"
                defaultValue={activeVendor.capacity}
                className="w-full px-3 py-2 border rounded-xl"
              />
            </div>
            <div>
              <label className="block font-bold text-stone-700 mb-1">City Location</label>
              <input
                type="text"
                defaultValue={activeVendor.city}
                className="w-full px-3 py-2 border rounded-xl"
              />
            </div>
          </div>

          <div className="pt-3 border-t flex justify-end">
            <button
              onClick={() => toast.success('Storefront pricing & capacity updated successfully!')}
              className="px-5 py-2.5 bg-stone-900 hover:bg-black text-white font-bold rounded-xl shadow-md"
            >
              Save Storefront Changes
            </button>
          </div>
        </div>
      )}

      {/* COUNTER-OFFER MODAL */}
      {activeCounterLead && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-stone-200 text-xs">
            <h3 className="font-serif font-bold text-base text-stone-900 mb-1">
              Send Counter-Offer to {activeCounterLead.clientName}
            </h3>
            <p className="text-stone-500 mb-3">
              Client offered ₹{(activeCounterLead.offeredPrice).toLocaleString('en-IN')} (Original: ₹{(activeCounterLead.originalPrice).toLocaleString('en-IN')})
            </p>

            <form onSubmit={handleSendCounter} className="space-y-3">
              <div>
                <label className="block font-bold text-stone-700 mb-1">Your Proposed Counter Price (₹) *</label>
                <input
                  type="number"
                  required
                  value={counterPriceInput}
                  onChange={(e) => setCounterPriceInput(e.target.value)}
                  className="w-full px-3 py-2 border rounded-xl font-bold font-mono text-sm"
                />
              </div>

              <div>
                <label className="block font-bold text-stone-700 mb-1">Note / Inclusions for Client</label>
                <textarea
                  rows={3}
                  placeholder="e.g. We can do ₹1,85,000 including complimentary bridal hospitality suite and generator backup."
                  value={counterNotesInput}
                  onChange={(e) => setCounterNotesInput(e.target.value)}
                  className="w-full px-3 py-2 border rounded-xl"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t">
                <button type="button" onClick={() => setActiveCounterLead(null)} className="px-3 py-1.5 font-bold text-stone-600">Cancel</button>
                <button type="submit" className="px-5 py-2 bg-stone-900 hover:bg-black text-white font-bold rounded-xl shadow">Dispatch Counter-Offer</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
