'use client'

import React, { useState, useEffect, useRef } from 'react'
import {
  X,
  MessageSquare,
  Sparkles,
  Send,
  Building2,
  Calendar,
  Users,
  CheckCircle2,
  Tag,
  Clock,
  ArrowRight,
  ShieldCheck,
  Percent,
  RefreshCw,
  Gift,
  HelpCircle,
  ChevronRight,
  Check
} from 'lucide-react'
import { toast } from 'sonner'
import { getOptimizedImageUrl } from '@/lib/imageUtils'

export default function NegotiationChatDrawer({
  isOpen,
  onClose,
  targetVendor,
  allVendors = [],
  currentUser,
  onApplyDeal
}) {
  // Current view: 'chat' | 'new' | 'list'
  const [view, setView] = useState('new')
  
  // Negotiations data
  const [userNegotiations, setUserNegotiations] = useState([])
  const [activeNegotiation, setActiveNegotiation] = useState(null)
  const [loading, setLoading] = useState(false)
  const [sendingMsg, setSendingMsg] = useState(false)
  const [msgInput, setMsgInput] = useState('')

  // New Negotiation Form
  const [selectedVendorId, setSelectedVendorId] = useState(targetVendor?.id || '')
  const [offeredBudget, setOfferedBudget] = useState('')
  const [guestCount, setGuestCount] = useState(250)
  const [eventDate, setEventDate] = useState('2026-12-20')
  const [customerName, setCustomerName] = useState('')
  const [customerEmail, setCustomerEmail] = useState('')
  const [customerPhone, setCustomerPhone] = useState('')
  const [customerMessage, setCustomerMessage] = useState('')
  const [submittingNew, setSubmittingNew] = useState(false)

  const messagesEndRef = useRef(null)

  // Initialize or read customer info from localStorage
  useEffect(() => {
    try {
      const savedName = localStorage.getItem('vv_neg_name') || currentUser?.name || ''
      const savedEmail = localStorage.getItem('vv_neg_email') || currentUser?.email || ''
      const savedPhone = localStorage.getItem('vv_neg_phone') || ''
      if (savedName) setCustomerName(savedName)
      if (savedEmail) setCustomerEmail(savedEmail)
      if (savedPhone) setCustomerPhone(savedPhone)
    } catch (_) {}
  }, [currentUser])

  // Get effective target vendor
  const effectiveVendor = targetVendor || allVendors.find(v => v.id === selectedVendorId) || allVendors[0]
  const originalStartingPrice = effectiveVendor?.startingPrice || 200000

  // Whenever targetVendor changes or modal opens
  useEffect(() => {
    if (targetVendor?.id) {
      setSelectedVendorId(targetVendor.id)
      const defaultSuggested = Math.round(originalStartingPrice * 0.85 / 1000) * 1000
      setOfferedBudget(defaultSuggested)
      setView('new')
    }
  }, [targetVendor, originalStartingPrice])

  // Load user negotiations from API
  const loadMyNegotiations = async () => {
    try {
      const email = customerEmail || currentUser?.email || localStorage.getItem('vv_neg_email')
      const userId = currentUser?.id
      const sessionId = localStorage.getItem('vv_neg_session') || ''
      
      const params = new URLSearchParams()
      if (email) params.append('email', email)
      if (userId) params.append('userId', userId)
      if (sessionId) params.append('sessionId', sessionId)

      const res = await fetch(`/api/negotiations?${params.toString()}`)
      if (res.ok) {
        const data = await res.json()
        if (Array.isArray(data)) {
          setUserNegotiations(data)
          // If we have an active negotiation, refresh it with latest data
          if (activeNegotiation) {
            const fresh = data.find(n => n.id === activeNegotiation.id)
            if (fresh) setActiveNegotiation(fresh)
          }
        }
      }
    } catch (_) {}
  }

  // Polling for live updates when chat is active
  useEffect(() => {
    if (!isOpen) return

    loadMyNegotiations()
    const interval = setInterval(() => {
      loadMyNegotiations()
    }, 4000)

    return () => clearInterval(interval)
  }, [isOpen, customerEmail, currentUser, activeNegotiation?.id])

  // Scroll messages to bottom
  useEffect(() => {
    if (view === 'chat' && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [activeNegotiation?.messages, view])

  // Start new negotiation submission
  const handleStartNegotiation = async (e) => {
    e.preventDefault()
    if (!effectiveVendor) return toast.error('Please select a venue or vendor')
    if (!offeredBudget || Number(offeredBudget) <= 0) return toast.error('Please enter your proposed budget')
    if (!customerEmail) return toast.error('Please provide your email address')

    setSubmittingNew(true)
    try {
      // Save info in localStorage for future convenience
      let sess = localStorage.getItem('vv_neg_session')
      if (!sess) {
        sess = `sess_${Math.random().toString(36).substring(2, 10)}`
        localStorage.setItem('vv_neg_session', sess)
      }
      localStorage.setItem('vv_neg_name', customerName)
      localStorage.setItem('vv_neg_email', customerEmail)
      localStorage.setItem('vv_neg_phone', customerPhone)

      const payload = {
        vendorId: effectiveVendor.id,
        vendorName: effectiveVendor.name,
        vendorCategory: effectiveVendor.category || 'venues',
        originalPrice: originalStartingPrice,
        offeredPrice: Number(offeredBudget),
        guestCount: Number(guestCount || 200),
        eventDate: eventDate || '2026-12-20',
        city: effectiveVendor.city || 'Lucknow',
        userName: customerName || 'Interested Customer',
        userEmail: customerEmail,
        userPhone: customerPhone || '+91 98765 43210',
        message: customerMessage.trim() || `Namaste! We are interested in ${effectiveVendor.name} for our ${guestCount}-guest celebration on ${eventDate}. Listed starting price is ₹${originalStartingPrice.toLocaleString('en-IN')}, but our budget is ₹${Number(offeredBudget).toLocaleString('en-IN')}. Can you please offer a negotiated royal quote?`,
        sessionId: sess
      }

      const res = await fetch('/api/negotiations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })

      if (!res.ok) throw new Error('Failed to initiate price negotiation')
      const result = await res.json()
      
      toast.success('Negotiation request sent directly to Royal Admin Concierge!')
      setActiveNegotiation(result.negotiation)
      setView('chat')
      loadMyNegotiations()
    } catch (err) {
      toast.error(err.message || 'Error starting negotiation')
    } finally {
      setSubmittingNew(false)
    }
  }

  // Send message in active negotiation thread
  const handleSendMessage = async (e) => {
    e?.preventDefault()
    if (!msgInput.trim() || !activeNegotiation) return

    setSendingMsg(true)
    const textToSend = msgInput.trim()
    setMsgInput('')

    try {
      const res = await fetch(`/api/negotiations/${activeNegotiation.id}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: textToSend,
          sender: customerName || activeNegotiation.userName || 'Customer',
          senderRole: 'customer'
        })
      })

      if (!res.ok) throw new Error('Failed to send message')
      const result = await res.json()
      setActiveNegotiation(result.negotiation)
      loadMyNegotiations()
    } catch (err) {
      toast.error('Could not send message: ' + err.message)
      setMsgInput(textToSend)
    } finally {
      setSendingMsg(false)
    }
  }

  // Accept counter offer from Admin
  const handleAcceptOffer = async (offerPrice, promoCode) => {
    if (!activeNegotiation) return
    try {
      const res = await fetch(`/api/negotiations/${activeNegotiation.id}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: `🎉 Deal Accepted! I agree to the special offer of ₹${offerPrice.toLocaleString('en-IN')}. Proceeding with booking.`,
          sender: customerName || activeNegotiation.userName || 'Customer',
          senderRole: 'customer',
          status: 'ACCEPTED'
        })
      })

      if (res.ok) {
        const result = await res.json()
        setActiveNegotiation(result.negotiation)
        toast.success(`Deal Accepted at ₹${offerPrice.toLocaleString('en-IN')}!`)
        
        if (onApplyDeal) {
          onApplyDeal({
            vendor: effectiveVendor,
            offerPrice,
            promoCode: promoCode || activeNegotiation.promoCode || 'NEGOTIATED_ROYAL_DEAL',
            discountAmount: Math.max(0, originalStartingPrice - offerPrice)
          })
        }
        onClose()
      }
    } catch (err) {
      toast.error('Error accepting offer')
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/70 backdrop-blur-md flex justify-end animate-in fade-in duration-200">
      <div className="w-full max-w-xl bg-[#fffefc] h-full shadow-2xl flex flex-col border-l border-[#e8dcc6] animate-in slide-in-from-right duration-300">
        
        {/* 1. TOP ROYAL HEADER */}
        <div className="bg-gradient-to-r from-[#2c0e17] via-[#4a1525] to-[#2c0e17] text-white p-4 sm:p-5 border-b border-[#c5a059]/40 relative shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#c5a059] to-[#8c6b2d] flex items-center justify-center text-[#1c1917] shadow-lg border border-amber-300/40">
                <MessageSquare className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h3 className="font-serif font-bold text-base sm:text-lg text-[#f7efdc]">
                    Live Price Negotiation
                  </h3>
                  <span className="px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider bg-amber-400/20 text-amber-300 border border-amber-400/30">
                    Admin Concierge
                  </span>
                </div>
                <p className="text-[11px] text-stone-300">
                  Chat directly with Admin to negotiate venue rates, custom packages &amp; discounts
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-stone-200 flex items-center justify-center transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Sub Navigation Switcher */}
          <div className="flex items-center gap-2 mt-4 pt-3 border-t border-white/10 text-xs">
            <button
              onClick={() => setView('new')}
              className={`px-3 py-1.5 rounded-xl font-semibold transition-all ${
                view === 'new'
                  ? 'bg-[#c5a059] text-[#1c1917] font-bold shadow-sm'
                  : 'text-stone-300 hover:text-white hover:bg-white/10'
              }`}
            >
              + Make New Offer
            </button>

            {activeNegotiation && (
              <button
                onClick={() => setView('chat')}
                className={`px-3 py-1.5 rounded-xl font-semibold transition-all flex items-center gap-1.5 ${
                  view === 'chat'
                    ? 'bg-[#c5a059] text-[#1c1917] font-bold shadow-sm'
                    : 'text-stone-300 hover:text-white hover:bg-white/10'
                }`}
              >
                <span>Active Chat</span>
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              </button>
            )}

            {userNegotiations.length > 0 && (
              <button
                onClick={() => setView('list')}
                className={`px-3 py-1.5 rounded-xl font-semibold transition-all ml-auto ${
                  view === 'list'
                    ? 'bg-[#c5a059] text-[#1c1917] font-bold shadow-sm'
                    : 'text-stone-300 hover:text-white hover:bg-white/10'
                }`}
              >
                My Negotiations ({userNegotiations.length})
              </button>
            )}
          </div>
        </div>

        {/* 2. BODY CONTENT ACCORDING TO ACTIVE VIEW */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 flex flex-col">

          {/* ======================================================== */}
          {/* VIEW: NEW NEGOTIATION FORM */}
          {/* ======================================================== */}
          {view === 'new' && (
            <form onSubmit={handleStartNegotiation} className="space-y-5 my-auto">
              {/* Selected Venue/Vendor Card */}
              {effectiveVendor && (
                <div className="p-3.5 rounded-2xl bg-gradient-to-r from-[#faf6ee] to-[#f5ebd7] border-2 border-[#decfaa] flex items-center gap-3.5 shadow-sm">
                  <div className="w-16 h-16 rounded-xl overflow-hidden shrink-0 border border-[#c5a059]/40 bg-stone-100">
                    <img
                      src={getOptimizedImageUrl(effectiveVendor.heroImage || effectiveVendor.image, { width: 200, quality: 75 })}
                      alt={effectiveVendor.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="text-[10px] uppercase font-bold tracking-wider text-amber-900 bg-amber-100/90 px-2 py-0.5 rounded-md border border-amber-300/50">
                      {effectiveVendor.categoryName || effectiveVendor.category}
                    </span>
                    <h4 className="font-serif font-bold text-sm sm:text-base text-stone-900 truncate mt-1">
                      {effectiveVendor.name}
                    </h4>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-xs text-stone-500 font-medium">
                        {effectiveVendor.locality ? `${effectiveVendor.locality}, ${effectiveVendor.city}` : effectiveVendor.city}
                      </span>
                      <span className="text-xs text-stone-300">•</span>
                      <span className="text-xs font-bold text-emerald-900 font-serif">
                        Listed: ₹{originalStartingPrice.toLocaleString('en-IN')}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Vendor Selector if not preselected */}
              {!targetVendor && allVendors.length > 0 && (
                <div>
                  <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                    Select Venue or Service to Negotiate
                  </label>
                  <select
                    value={selectedVendorId}
                    onChange={(e) => setSelectedVendorId(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-[#decfaa] bg-white text-xs font-semibold text-stone-800 focus:outline-none focus:ring-2 focus:ring-[#c5a059]"
                  >
                    {allVendors.map(v => (
                      <option key={v.id} value={v.id}>
                        {v.name} ({v.city}) — Listed: ₹{(v.startingPrice || 25000).toLocaleString('en-IN')}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Proposed Budget / Offer Price */}
              <div className="bg-[#fff9ef] p-4 rounded-2xl border-2 border-amber-300/70 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-amber-950 uppercase tracking-wider flex items-center gap-1.5">
                    <Tag className="w-3.5 h-3.5 text-amber-700" />
                    Your Proposed Budget (₹)
                  </label>
                  {originalStartingPrice > 0 && offeredBudget > 0 && (
                    <span className="text-xs font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-md border border-emerald-300">
                      Save ₹{Math.max(0, originalStartingPrice - Number(offeredBudget)).toLocaleString('en-IN')} ({Math.round(((originalStartingPrice - Number(offeredBudget)) / originalStartingPrice) * 100)}% off)
                    </span>
                  )}
                </div>

                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-serif text-lg font-bold text-stone-700">₹</span>
                  <input
                    type="number"
                    step="1000"
                    value={offeredBudget}
                    onChange={(e) => setOfferedBudget(e.target.value)}
                    placeholder="Enter your target budget"
                    className="w-full pl-8 pr-4 py-3 rounded-xl border-2 border-amber-400 bg-white font-serif text-lg font-bold text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#c5a059]"
                    required
                  />
                </div>

                {/* Quick Discount Presets */}
                <div className="flex items-center gap-2 pt-1 overflow-x-auto no-scrollbar">
                  {[
                    { label: '-10%', mult: 0.90 },
                    { label: '-15%', mult: 0.85 },
                    { label: '-20%', mult: 0.80 },
                    { label: '-25%', mult: 0.75 },
                  ].map((p, i) => {
                    const calc = Math.round(originalStartingPrice * p.mult / 1000) * 1000
                    return (
                      <button
                        key={i}
                        type="button"
                        onClick={() => setOfferedBudget(calc)}
                        className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all border ${
                          Number(offeredBudget) === calc
                            ? 'bg-[#4a1525] text-amber-200 border-[#4a1525]'
                            : 'bg-white hover:bg-amber-100 text-stone-800 border-amber-300/80'
                        }`}
                      >
                        {p.label} (₹{(calc / 1000).toFixed(0)}k)
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Event Details: Date & Guests */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-stone-700 uppercase tracking-wider mb-1">
                    Event Date
                  </label>
                  <input
                    type="date"
                    value={eventDate}
                    onChange={(e) => setEventDate(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-[#decfaa] bg-white text-xs font-semibold text-stone-800"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-stone-700 uppercase tracking-wider mb-1">
                    Expected Guests
                  </label>
                  <input
                    type="number"
                    value={guestCount}
                    onChange={(e) => setGuestCount(e.target.value)}
                    placeholder="e.g. 350"
                    className="w-full p-2.5 rounded-xl border border-[#decfaa] bg-white text-xs font-semibold text-stone-800"
                    required
                  />
                </div>
              </div>

              {/* Customer Contact Details */}
              <div className="space-y-3 pt-2 border-t border-[#f0e6d6]">
                <h5 className="text-xs font-bold text-stone-900 uppercase tracking-wider">
                  Your Contact Information
                </h5>

                <div>
                  <input
                    type="text"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="Full Name (e.g. Rohit &amp; Ananya Sharma)"
                    className="w-full p-2.5 rounded-xl border border-[#decfaa] bg-white text-xs font-semibold text-stone-800"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="email"
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                    placeholder="Email address"
                    className="w-full p-2.5 rounded-xl border border-[#decfaa] bg-white text-xs font-semibold text-stone-800"
                    required
                  />
                  <input
                    type="tel"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    placeholder="Phone / WhatsApp"
                    className="w-full p-2.5 rounded-xl border border-[#decfaa] bg-white text-xs font-semibold text-stone-800"
                    required
                  />
                </div>

                <div>
                  <textarea
                    rows={2}
                    value={customerMessage}
                    onChange={(e) => setCustomerMessage(e.target.value)}
                    placeholder="Reason or special requirements (e.g. We have a strict family budget of ₹1.6L for 350 guests. Can you approve this rate?)"
                    className="w-full p-2.5 rounded-xl border border-[#decfaa] bg-white text-xs text-stone-800"
                  />
                </div>
              </div>

              {/* Submit CTA */}
              <button
                type="submit"
                disabled={submittingNew}
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-[#4a1525] via-[#6d1e35] to-[#4a1525] hover:from-[#3a101d] hover:to-[#581729] text-amber-200 font-bold text-sm shadow-xl flex items-center justify-center gap-2 border border-amber-400/40 transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50"
              >
                {submittingNew ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin text-amber-300" />
                    <span>Connecting with Royal Concierge...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-amber-400" />
                    <span>Send Offer &amp; Start Live Chat with Admin</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          )}

          {/* ======================================================== */}
          {/* VIEW: ACTIVE CHAT THREAD */}
          {/* ======================================================== */}
          {view === 'chat' && activeNegotiation && (
            <div className="flex-1 flex flex-col justify-between">
              
              {/* Active Deal Status Pill Header */}
              <div className="p-3 rounded-2xl bg-gradient-to-r from-[#faf6ed] to-[#f4ead5] border border-[#e2d4bc] mb-4 flex items-center justify-between shadow-xs">
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-serif font-bold text-sm text-stone-900 truncate">
                      {activeNegotiation.vendorName}
                    </h4>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                      activeNegotiation.status === 'OFFER_MADE'
                        ? 'bg-amber-100 text-amber-900 border border-amber-400'
                        : activeNegotiation.status === 'ACCEPTED'
                        ? 'bg-emerald-100 text-emerald-900 border border-emerald-400'
                        : 'bg-stone-200 text-stone-800'
                    }`}>
                      {activeNegotiation.status === 'OFFER_MADE' ? 'Special Offer Received!' : activeNegotiation.status}
                    </span>
                  </div>
                  <div className="text-[11px] text-stone-600 mt-0.5 flex items-center gap-2">
                    <span>Listed: <s className="text-stone-400">₹{activeNegotiation.originalPrice?.toLocaleString('en-IN')}</s></span>
                    <span>•</span>
                    <span className="font-bold text-[#4a1525]">Your Offer: ₹{activeNegotiation.offeredPrice?.toLocaleString('en-IN')}</span>
                    {activeNegotiation.adminOfferPrice && (
                      <>
                        <span>•</span>
                        <span className="font-bold text-emerald-800">Admin Offer: ₹{activeNegotiation.adminOfferPrice?.toLocaleString('en-IN')}</span>
                      </>
                    )}
                  </div>
                </div>

                <button
                  onClick={() => setView('new')}
                  className="text-[10px] text-stone-600 hover:text-stone-900 font-bold underline px-2 py-1"
                >
                  New Offer
                </button>
              </div>

              {/* Chat Messages Stream */}
              <div className="flex-1 space-y-3.5 overflow-y-auto pr-1 mb-4 max-h-[55vh]">
                {(activeNegotiation.messages || []).map((m, idx) => {
                  const isAdmin = m.senderRole === 'admin'
                  return (
                    <div
                      key={m.id || idx}
                      className={`flex flex-col ${isAdmin ? 'items-start' : 'items-end'}`}
                    >
                      <div className="flex items-center gap-1.5 mb-1 text-[10px] text-stone-400">
                        <span>{isAdmin ? '👑 Royal Concierge (Admin)' : m.sender || 'You'}</span>
                        <span>•</span>
                        <span>{m.timestamp ? new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}</span>
                      </div>

                      {/* Message Bubble */}
                      <div
                        className={`max-w-[85%] p-3.5 rounded-2xl text-xs leading-relaxed shadow-sm ${
                          isAdmin
                            ? 'bg-gradient-to-br from-[#1c1917] to-[#292524] text-stone-100 border border-stone-700 rounded-tl-xs'
                            : 'bg-gradient-to-r from-[#4a1525] to-[#6d1e35] text-[#fbf6ec] rounded-tr-xs'
                        }`}
                      >
                        <p>{m.text}</p>

                        {/* Special Admin Counter-Offer Card Inline */}
                        {m.offerPrice && (
                          <div className="mt-3 p-3 rounded-xl bg-gradient-to-r from-amber-500/20 to-amber-600/30 border border-amber-400/50 text-white space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-300 flex items-center gap-1">
                                <Sparkles className="w-3.5 h-3.5 text-amber-300" /> Special Approved Rate
                              </span>
                              <span className="font-serif font-bold text-base text-amber-200">
                                ₹{m.offerPrice.toLocaleString('en-IN')}
                              </span>
                            </div>

                            {m.promoCode && (
                              <div className="text-[10px] text-amber-100 font-mono bg-black/40 px-2 py-1 rounded border border-amber-300/30 flex items-center justify-between">
                                <span>Promo: <b>{m.promoCode}</b></span>
                                <span className="text-[9px] text-amber-300">Auto-Applied</span>
                              </div>
                            )}

                            {activeNegotiation.status !== 'ACCEPTED' && (
                              <button
                                onClick={() => handleAcceptOffer(m.offerPrice, m.promoCode)}
                                className="w-full mt-1 py-1.5 rounded-lg bg-[#c5a059] hover:bg-[#b08c47] text-[#1c1917] font-bold text-[11px] shadow-sm flex items-center justify-center gap-1 transition-colors"
                              >
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                <span>Accept Offer &amp; Book at ₹{m.offerPrice.toLocaleString('en-IN')}</span>
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
                <div ref={messagesEndRef} />
              </div>

              {/* Chat Input Bar */}
              <form onSubmit={handleSendMessage} className="pt-3 border-t border-[#f0e6d6] flex items-center gap-2">
                <input
                  type="text"
                  value={msgInput}
                  onChange={(e) => setMsgInput(e.target.value)}
                  placeholder="Type your reply to Admin Concierge..."
                  className="flex-1 p-3 rounded-xl border border-[#decfaa] bg-white text-xs text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#c5a059]"
                />
                <button
                  type="submit"
                  disabled={sendingMsg || !msgInput.trim()}
                  className="p-3 rounded-xl bg-[#4a1525] hover:bg-[#38101c] text-amber-200 shadow-md transition-all disabled:opacity-40"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </div>
          )}

          {/* ======================================================== */}
          {/* VIEW: MY NEGOTIATIONS LIST */}
          {/* ======================================================== */}
          {view === 'list' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-serif font-bold text-sm text-stone-900">
                  Your Past &amp; Active Negotiations
                </h4>
                <button
                  onClick={() => setView('new')}
                  className="text-xs font-bold text-[#4a1525] hover:underline"
                >
                  + New Negotiation
                </button>
              </div>

              {userNegotiations.length === 0 ? (
                <div className="text-center py-12 text-stone-400 text-xs">
                  No negotiations found. Submit an offer to start chatting!
                </div>
              ) : (
                userNegotiations.map((neg) => (
                  <div
                    key={neg.id}
                    onClick={() => {
                      setActiveNegotiation(neg)
                      setView('chat')
                    }}
                    className="p-3.5 rounded-2xl bg-white border border-[#decfaa] hover:border-amber-500 shadow-xs hover:shadow-md cursor-pointer transition-all flex items-center justify-between group"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-serif font-bold text-sm text-stone-900 group-hover:text-[#4a1525]">
                          {neg.vendorName}
                        </span>
                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${
                          neg.status === 'OFFER_MADE' ? 'bg-amber-100 text-amber-900' :
                          neg.status === 'ACCEPTED' ? 'bg-emerald-100 text-emerald-900' : 'bg-stone-100 text-stone-700'
                        }`}>
                          {neg.status}
                        </span>
                      </div>
                      <div className="text-xs text-stone-600 mt-1 flex items-center gap-2">
                        <span>Original: ₹{neg.originalPrice?.toLocaleString('en-IN')}</span>
                        <span>→</span>
                        <span className="font-bold text-emerald-800">Offered: ₹{neg.offeredPrice?.toLocaleString('en-IN')}</span>
                      </div>
                      <div className="text-[10px] text-stone-400 mt-1">
                        {neg.messages?.length || 0} messages • Last active {new Date(neg.updatedAt).toLocaleDateString()}
                      </div>
                    </div>

                    <ChevronRight className="w-4 h-4 text-stone-400 group-hover:text-[#4a1525] transition-transform group-hover:translate-x-1" />
                  </div>
                ))
              )}
            </div>
          )}

        </div>

        {/* 3. FOOTER TRUST NOTE */}
        <div className="p-3 bg-[#faf8f5] border-t border-[#e8dcc6] text-center text-[10px] text-stone-500 flex items-center justify-center gap-2">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          <span>Vows &amp; Venues Official Price Protection • Direct Admin Authority Guaranteed</span>
        </div>

      </div>
    </div>
  )
}
