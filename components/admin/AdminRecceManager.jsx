'use client'

import React, { useState } from 'react'
import {
  CalendarDays,
  Clock,
  MapPin,
  User,
  Phone,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Plus,
  Send,
  Sparkles,
  Building2,
  MessageSquare,
  Search,
  Filter
} from 'lucide-react'
import { toast } from 'sonner'

export const INITIAL_RECCES = [
  {
    id: 'recce_01',
    coupleName: 'Tanvi Joshi & Advait Deshmukh',
    phone: '+919920887766',
    venueName: 'Umaid Bhawan Citadel & Lawns',
    venueCity: 'Jodhpur, Rajasthan',
    dateTime: '2026-11-02T11:00',
    guestEstimate: 400,
    coordinatorName: 'Thakur Gajendra Singh (Venue GM)',
    coordinatorPhone: '+91 98290 88991',
    status: 'SCHEDULED',
    feedback: null,
    conversionScore: 'HIGH (85%)',
    specialNotes: 'Couple arriving via private charter. Requested viewing of the central marble dome at sunset.'
  },
  {
    id: 'recce_02',
    coupleName: 'Aanya Singhania & Kabir Kapoor',
    phone: '+919820123456',
    venueName: 'The Royal Lake Palace & Gardens',
    venueCity: 'Udaipur, Rajasthan',
    dateTime: '2026-10-25T15:30',
    guestEstimate: 450,
    coordinatorName: 'Maharani Vijaylaxmi Rathore (GM Hospitality)',
    coordinatorPhone: '+91 98291 44556',
    status: 'SCHEDULED',
    feedback: null,
    conversionScore: 'VERY HIGH (95%)',
    specialNotes: 'Wants to inspect boat arrival jetty for 25-boat baraat procession.'
  },
  {
    id: 'recce_03',
    coupleName: 'Rhea Bahl & Devrat Mehra',
    phone: '+919811223344',
    venueName: 'The Royal Nawabi Palace & Lawns',
    venueCity: 'Lucknow, UP',
    dateTime: '2026-10-09T14:00',
    guestEstimate: 300,
    coordinatorName: 'Nawab Asad Mirza (Estate Manager)',
    coordinatorPhone: '+91 94150 11223',
    status: 'COMPLETED',
    feedback: 'Loved the Sheesh Mahal ballroom. Requested customized Awadhi royal feast tasting before final token advance.',
    conversionScore: 'WON (Contract In Progress)',
    specialNotes: 'Menu tasting scheduled with Chef Imtiaz for next weekend.'
  }
]

export default function AdminRecceManager() {
  const [recces, setRecces] = useState(INITIAL_RECCES)
  const [searchTerm, setSearchTerm] = useState('')
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false)
  const [activeFeedbackModal, setActiveFeedbackModal] = useState(null)
  const [feedbackInput, setFeedbackInput] = useState('')

  // New Recce Form
  const [newRecce, setNewRecce] = useState({
    coupleName: '',
    phone: '',
    venueName: 'Umaid Bhawan Citadel & Lawns',
    venueCity: 'Jodhpur, Rajasthan',
    dateTime: '2026-11-15T11:00',
    guestEstimate: 350,
    coordinatorName: 'Palace Estate GM',
    coordinatorPhone: '+91 98290 00000',
    specialNotes: ''
  })

  const filteredRecces = recces.filter(r =>
    r.coupleName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.venueName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.venueCity.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleScheduleRecce = (e) => {
    e.preventDefault()
    if (!newRecce.coupleName || !newRecce.phone) {
      toast.error('Please enter couple name and phone')
      return
    }
    const created = {
      ...newRecce,
      id: `recce_${Date.now()}`,
      status: 'SCHEDULED',
      feedback: null,
      conversionScore: 'PENDING'
    }
    setRecces(prev => [created, ...prev])
    setIsScheduleModalOpen(false)
    toast.success('Site inspection recce scheduled!')
  }

  const handleCompleteRecce = () => {
    if (!activeFeedbackModal) return
    setRecces(prev => prev.map(r => r.id === activeFeedbackModal.id ? {
      ...r,
      status: 'COMPLETED',
      feedback: feedbackInput || 'Couple completed walkthrough satisfactorily.'
    } : r))
    setActiveFeedbackModal(null)
    setFeedbackInput('')
    toast.success('Recce marked as COMPLETED and feedback logged!')
  }

  const sendWhatsAppInvite = (recce) => {
    const cleanPhone = recce.phone.replace(/[^0-9]/g, '')
    const msg = encodeURIComponent(
      `Namaste ${recce.coupleName}! 🏰\n\n` +
      `Your royal site inspection recce at *${recce.venueName}* (${recce.venueCity}) is scheduled for:\n` +
      `📅 Date & Time: ${new Date(recce.dateTime).toLocaleString('en-IN')}\n\n` +
      `Palace Coordinator: ${recce.coordinatorName}\n` +
      `Direct Phone: ${recce.coordinatorPhone}\n\n` +
      `Valet parking, royal high tea, and personal estate tour are arranged for you and your family.\n\n` +
      `Warm regards,\nVows & Venues Luxury Concierge`
    )
    window.open(`https://wa.me/${cleanPhone}?text=${msg}`, '_blank')
  }

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-stone-900 via-purple-950/90 to-stone-900 text-white rounded-2xl p-6 border border-purple-400/30 shadow-xl">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/20 border border-purple-500/40 text-purple-300 text-xs font-semibold uppercase tracking-wider mb-2">
              <Building2 className="w-3.5 h-3.5" />
              <span>Palace &amp; Venue Inspection Suite</span>
            </div>
            <h2 className="font-serif text-2xl font-bold text-white">Site Visit &amp; Recce Coordination</h2>
            <p className="text-xs text-stone-300 mt-1 max-w-2xl leading-relaxed">
              Heritage palaces require meticulous on-ground coordination. Manage couple arrival schedules, venue GM contact numbers, and post-recce conversion notes.
            </p>
          </div>

          <button
            onClick={() => setIsScheduleModalOpen(true)}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 text-white font-bold text-xs shadow-md transition-all flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>Schedule New Recce</span>
          </button>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-3 gap-4 mt-6 pt-5 border-t border-white/10">
          <div>
            <span className="text-[11px] text-stone-400 uppercase tracking-wider block">Upcoming Recces</span>
            <span className="font-serif text-xl font-bold text-white">
              {recces.filter(r => r.status === 'SCHEDULED').length} Scheduled
            </span>
          </div>
          <div>
            <span className="text-[11px] text-stone-400 uppercase tracking-wider block">Completed Recces</span>
            <span className="font-serif text-xl font-bold text-emerald-400">
              {recces.filter(r => r.status === 'COMPLETED').length} Walkthroughs
            </span>
          </div>
          <div>
            <span className="text-[11px] text-stone-400 uppercase tracking-wider block">Recce-to-Contract Rate</span>
            <span className="font-serif text-xl font-bold text-champagne">87.5% Win Rate</span>
          </div>
        </div>
      </div>

      {/* Recce Cards List */}
      <div className="bg-white rounded-2xl p-5 border border-stone-200 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pb-3 border-b border-stone-200">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search couple or palace venue..."
              className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-stone-200 focus:outline-none focus:ring-2 focus:ring-purple-400"
            />
          </div>
          <span className="text-xs text-stone-500 font-medium">{filteredRecces.length} Recces Listed</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredRecces.map((recce) => (
            <div
              key={recce.id}
              className="bg-stone-50 rounded-2xl p-4 border border-stone-200 shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-3"
            >
              <div>
                {/* Header & Status */}
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
                    recce.status === 'COMPLETED'
                      ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                      : 'bg-purple-50 text-purple-800 border-purple-300'
                  }`}>
                    {recce.status}
                  </span>
                  <span className="text-[10px] font-bold text-amber-700 bg-amber-100/60 px-2 py-0.5 rounded">
                    {recce.conversionScore}
                  </span>
                </div>

                {/* Couple & Venue */}
                <h4 className="font-serif font-bold text-stone-900 text-sm">{recce.coupleName}</h4>
                <div className="flex items-center gap-1 text-xs text-stone-600 mt-0.5">
                  <Building2 className="w-3.5 h-3.5 text-champagne shrink-0" />
                  <span className="font-semibold text-stone-800 truncate">{recce.venueName}</span>
                </div>
                <div className="flex items-center gap-1 text-[11px] text-stone-500 mt-0.5">
                  <MapPin className="w-3 h-3 text-stone-400 shrink-0" />
                  <span>{recce.venueCity}</span>
                </div>

                {/* Recce Time */}
                <div className="mt-3 p-2.5 rounded-xl bg-white border border-stone-200/80 text-[11px] space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-stone-400 flex items-center gap-1">
                      <CalendarDays className="w-3 h-3" />
                      <span>Date &amp; Time:</span>
                    </span>
                    <span className="font-bold text-stone-800">
                      {new Date(recce.dateTime).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-stone-400 flex items-center gap-1">
                      <User className="w-3 h-3" />
                      <span>Venue GM:</span>
                    </span>
                    <span className="font-medium text-stone-700 truncate max-w-[130px]">
                      {recce.coordinatorName.split(' (')[0]}
                    </span>
                  </div>
                </div>

                {/* Feedback or Notes */}
                {recce.feedback ? (
                  <div className="mt-2.5 p-2 rounded-lg bg-emerald-50/60 border border-emerald-200 text-[11px] text-emerald-900">
                    <span className="font-bold block mb-0.5">Post-Recce Feedback:</span>
                    <p className="italic leading-snug">{recce.feedback}</p>
                  </div>
                ) : (
                  <p className="mt-2 text-[11px] text-stone-500 italic line-clamp-2">
                    {recce.specialNotes}
                  </p>
                )}
              </div>

              {/* Action Buttons */}
              <div className="pt-2 border-t border-stone-200 flex items-center justify-between gap-2">
                <button
                  onClick={() => sendWhatsAppInvite(recce)}
                  className="px-2.5 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 font-bold text-[10px] flex items-center gap-1 transition-colors"
                >
                  <Send className="w-2.5 h-2.5 text-emerald-600" />
                  <span>Invite via WhatsApp</span>
                </button>

                {recce.status === 'SCHEDULED' && (
                  <button
                    onClick={() => {
                      setActiveFeedbackModal(recce)
                      setFeedbackInput('')
                    }}
                    className="px-2.5 py-1.5 rounded-lg bg-stone-900 hover:bg-black text-white font-bold text-[10px] transition-colors"
                  >
                    Log Feedback
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* SCHEDULE RECCE MODAL */}
      {isScheduleModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-stone-200">
            <div className="flex items-center justify-between pb-3 border-b border-stone-200 mb-4">
              <div className="flex items-center gap-2">
                <Building2 className="w-5 h-5 text-purple-600" />
                <h3 className="font-serif font-bold text-lg text-stone-900">Schedule Site Recce Visit</h3>
              </div>
              <button onClick={() => setIsScheduleModalOpen(false)} className="text-stone-400 hover:text-stone-700">✕</button>
            </div>

            <form onSubmit={handleScheduleRecce} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-stone-700 mb-1">Couple Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Ananya & Kabir"
                  value={newRecce.coupleName}
                  onChange={(e) => setNewRecce(p => ({ ...p, coupleName: e.target.value }))}
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-stone-700 mb-1">Phone *</label>
                  <input
                    type="tel"
                    required
                    placeholder="+919876543210"
                    value={newRecce.phone}
                    onChange={(e) => setNewRecce(p => ({ ...p, phone: e.target.value }))}
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>
                <div>
                  <label className="block font-bold text-stone-700 mb-1">Date &amp; Time *</label>
                  <input
                    type="datetime-local"
                    required
                    value={newRecce.dateTime}
                    onChange={(e) => setNewRecce(p => ({ ...p, dateTime: e.target.value }))}
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-stone-700 mb-1">Venue / Palace</label>
                  <input
                    type="text"
                    value={newRecce.venueName}
                    onChange={(e) => setNewRecce(p => ({ ...p, venueName: e.target.value }))}
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>
                <div>
                  <label className="block font-bold text-stone-700 mb-1">City</label>
                  <input
                    type="text"
                    value={newRecce.venueCity}
                    onChange={(e) => setNewRecce(p => ({ ...p, venueCity: e.target.value }))}
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-stone-700 mb-1">Special Instructions &amp; VVIP Requests</label>
                <textarea
                  rows={2}
                  placeholder="e.g. Sunset terrace walkthrough, high tea requested..."
                  value={newRecce.specialNotes}
                  onChange={(e) => setNewRecce(p => ({ ...p, specialNotes: e.target.value }))}
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t">
                <button type="button" onClick={() => setIsScheduleModalOpen(false)} className="px-4 py-2 text-stone-600 font-bold">Cancel</button>
                <button type="submit" className="px-5 py-2 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-lg shadow">Schedule Recce</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* FEEDBACK LOG MODAL */}
      {activeFeedbackModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-stone-200">
            <h3 className="font-serif font-bold text-base text-stone-900 mb-1">
              Log Post-Recce Feedback: {activeFeedbackModal.coupleName}
            </h3>
            <p className="text-xs text-stone-500 mb-3">
              Venue: {activeFeedbackModal.venueName}
            </p>
            <textarea
              rows={4}
              placeholder="What did the couple think? Any catering tasting requests, discount demands, or room block questions?"
              value={feedbackInput}
              onChange={(e) => setFeedbackInput(e.target.value)}
              className="w-full p-3 text-xs border border-stone-200 rounded-xl mb-4 focus:ring-2 focus:ring-purple-400 focus:outline-none"
            />
            <div className="flex items-center justify-end gap-2">
              <button onClick={() => setActiveFeedbackModal(null)} className="px-4 py-2 text-xs font-bold text-stone-600">Cancel</button>
              <button onClick={handleCompleteRecce} className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow">Mark Completed</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
