'use client'

import React, { useState, useMemo } from 'react'
import {
  Users,
  Search,
  Filter,
  Plus,
  Phone,
  Mail,
  Calendar,
  MapPin,
  DollarSign,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  XCircle,
  Clock,
  Send,
  UserCheck,
  ChevronRight,
  MoreVertical,
  Download,
  AlertCircle
} from 'lucide-react'
import { toast } from 'sonner'

export const KANBAN_STAGES = [
  { id: 'NEW_INQUIRY', label: 'New Inquiry', color: 'border-amber-400 bg-amber-50/60 text-amber-900', dot: 'bg-amber-400' },
  { id: 'CONCIERGE_CALL', label: 'Concierge Call Done', color: 'border-sky-400 bg-sky-50/60 text-sky-900', dot: 'bg-sky-400' },
  { id: 'SITE_RECCE', label: 'Site Recce Scheduled', color: 'border-purple-400 bg-purple-50/60 text-purple-900', dot: 'bg-purple-400' },
  { id: 'QUOTATION_SENT', label: 'Quotation Sent', color: 'border-teal-400 bg-teal-50/60 text-teal-900', dot: 'bg-teal-400' },
  { id: 'WON', label: 'Token Paid (Won)', color: 'border-emerald-500 bg-emerald-50/60 text-emerald-900', dot: 'bg-emerald-500' },
  { id: 'LOST', label: 'Lost / Closed', color: 'border-stone-400 bg-stone-100 text-stone-700', dot: 'bg-stone-400' },
]

export const CONCIERGE_PLANNERS = [
  'Pooja Sharma (Sr. Luxury Planner)',
  'Vikramaditya Rathore (Heritage Venues Lead)',
  'Ayesha Merchant (Coastal & Destination Lead)',
  'Siddharth Singhania (Palace Concierge)'
]

export const INITIAL_LEADS = []

export default function AdminLeadsKanban({ inquiries = [] }) {
  const [leads, setLeads] = useState(() => {
    try {
      const stored = typeof window !== 'undefined' ? localStorage.getItem('vv_admin_crm_leads') : null
      if (stored) {
        const parsed = JSON.parse(stored)
        if (Array.isArray(parsed) && parsed.length > 0) return parsed
      }
    } catch (_) {}
    if (Array.isArray(inquiries) && inquiries.length > 0) {
      return inquiries.map((inq, idx) => ({
        id: inq.id || `inq_${idx}`,
        coupleName: inq.name || inq.clientName || 'Wedding Client',
        phone: inq.phone || '+91 ••••••••••',
        email: inq.email || 'client@email.com',
        stage: inq.status === 'confirmed' ? 'WON' : 'NEW_INQUIRY',
        budgetTier: inq.budgetTier || 'Royal (₹25L–₹50L)',
        estimatedBudget: inq.budget || 3500000,
        guestCount: inq.guestCount || 300,
        preferredCity: inq.city || 'India',
        muhuratDate: inq.date || 'Upcoming',
        functions: ['Wedding Reception'],
        assignedTo: CONCIERGE_PLANNERS[0],
        notes: inq.message || inq.notes || 'Inquiry received via marketplace venue page',
        createdAt: inq.createdAt || new Date().toISOString()
      }))
    }
    return []
  })

  // Sync to localStorage
  const updateLeads = (newLeadsOrFn) => {
    setLeads(prev => {
      const next = typeof newLeadsOrFn === 'function' ? newLeadsOrFn(prev) : newLeadsOrFn
      try {
        localStorage.setItem('vv_admin_crm_leads', JSON.stringify(next))
      } catch (_) {}
      return next
    })
  }
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCity, setSelectedCity] = useState('ALL')
  const [selectedTier, setSelectedTier] = useState('ALL')
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [activeLeadDetails, setActiveLeadDetails] = useState(null)

  // New Lead Form State
  const [newLead, setNewLead] = useState({
    coupleName: '',
    phone: '',
    email: '',
    budgetTier: 'Royal (₹25L–₹50L)',
    estimatedBudget: 3500000,
    guestCount: 300,
    preferredCity: 'Jaipur, Rajasthan',
    muhuratDate: '2026-12-15',
    functions: ['Mehendi', 'Sangeet', 'Pheras'],
    assignedTo: CONCIERGE_PLANNERS[0],
    notes: ''
  })

  // Filtered Leads
  const filteredLeads = useMemo(() => {
    return leads.filter(lead => {
      const matchSearch =
        lead.coupleName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lead.phone.includes(searchTerm) ||
        lead.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lead.preferredCity.toLowerCase().includes(searchTerm.toLowerCase())
      const matchCity = selectedCity === 'ALL' || lead.preferredCity.toLowerCase().includes(selectedCity.toLowerCase())
      const matchTier = selectedTier === 'ALL' || lead.budgetTier.toLowerCase().includes(selectedTier.toLowerCase())
      return matchSearch && matchCity && matchTier
    })
  }, [leads, searchTerm, selectedCity, selectedTier])

  // Move Lead Stage
  const moveLeadStage = (leadId, nextStage) => {
    updateLeads(prev => prev.map(l => l.id === leadId ? { ...l, stage: nextStage } : l))
    const stageName = KANBAN_STAGES.find(s => s.id === nextStage)?.label || nextStage
    toast.success(`Lead moved to "${stageName}"`)
  }

  // Assign Planner
  const assignPlanner = (leadId, planner) => {
    updateLeads(prev => prev.map(l => l.id === leadId ? { ...l, assignedTo: planner } : l))
    toast.success(`Assigned to ${planner}`)
  }

  // Add Lead Handler
  const handleAddLead = (e) => {
    e.preventDefault()
    if (!newLead.coupleName || !newLead.phone) {
      toast.error('Please enter couple name and phone number')
      return
    }
    const created = {
      ...newLead,
      id: `lead_${Date.now()}`,
      stage: 'NEW_INQUIRY',
      createdAt: new Date().toISOString()
    }
    updateLeads(prev => [created, ...prev])
    setIsAddModalOpen(false)
    toast.success('New wedding lead logged into CRM pipeline!')
  }

  // 1-Click WhatsApp Opener
  const openWhatsApp = (lead) => {
    const cleanPhone = lead.phone.replace(/[^0-9]/g, '')
    const msg = encodeURIComponent(
      `Namaste ${lead.coupleName}! Greetings from Vows & Venues Luxury Concierge.\n\n` +
      `We received your wedding inquiry for ${lead.preferredCity} (Muhurat Date: ${lead.muhuratDate}, Guests: ~${lead.guestCount}).\n` +
      `Your dedicated wedding concierge is ${lead.assignedTo}.\n\n` +
      `Would 4:00 PM today work for a brief 10-minute discovery call to review palace availability & custom decor options?`
    )
    window.open(`https://wa.me/${cleanPhone}?text=${msg}`, '_blank')
  }

  return (
    <div className="space-y-6">
      {/* Top Banner & Pipeline Header */}
      <div className="bg-gradient-to-r from-stone-900 via-burgundy/90 to-stone-900 text-white rounded-2xl p-6 shadow-xl border border-champagne/30">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-champagne/20 border border-champagne/40 text-champagne text-xs font-semibold uppercase tracking-wider mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              <span>High-Value Concierge CRM</span>
            </div>
            <h2 className="font-serif text-2xl font-bold text-white">Wedding Leads &amp; Inquiry Pipeline</h2>
            <p className="text-xs text-stone-300 mt-1 max-w-2xl leading-relaxed">
              Track luxury couples from first inquiry to contract signing. Manage Muhurat dates, guest counts, recce visits, and 1-click WhatsApp follow-ups.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-champagne to-amber-400 text-stone-900 font-bold text-xs shadow-md hover:brightness-105 transition-all flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              <span>Add New Lead</span>
            </button>
          </div>
        </div>

        {/* Quick KPI Counters */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 pt-5 border-t border-white/10">
          <div>
            <span className="text-[11px] text-stone-400 uppercase tracking-wider block">Total Active Leads</span>
            <span className="font-serif text-xl font-bold text-white">{leads.length} Couples</span>
          </div>
          <div>
            <span className="text-[11px] text-stone-400 uppercase tracking-wider block">Pipeline Value</span>
            <span className="font-serif text-xl font-bold text-champagne">
              ₹{(leads.reduce((acc, l) => acc + (l.estimatedBudget || 0), 0) / 10000000).toFixed(2)} Cr
            </span>
          </div>
          <div>
            <span className="text-[11px] text-stone-400 uppercase tracking-wider block">In Negotiation / Recce</span>
            <span className="font-serif text-xl font-bold text-amber-300">
              {leads.filter(l => ['SITE_RECCE', 'QUOTATION_SENT'].includes(l.stage)).length} In Progress
            </span>
          </div>
          <div>
            <span className="text-[11px] text-stone-400 uppercase tracking-wider block">Token Won (Signed)</span>
            <span className="font-serif text-xl font-bold text-emerald-400">
              {leads.filter(l => l.stage === 'WON').length} Won
            </span>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-xl p-4 border border-stone-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search couple name, city, phone..."
            className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-stone-200 focus:outline-none focus:ring-2 focus:ring-champagne"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          <select
            value={selectedCity}
            onChange={(e) => setSelectedCity(e.target.value)}
            className="text-xs px-3 py-2 rounded-lg border border-stone-200 bg-stone-50 font-medium text-stone-700"
          >
            <option value="ALL">All Destinations</option>
            <option value="Udaipur">Udaipur</option>
            <option value="Jaipur">Jaipur</option>
            <option value="Jodhpur">Jodhpur</option>
            <option value="Goa">Goa</option>
          </select>

          <select
            value={selectedTier}
            onChange={(e) => setSelectedTier(e.target.value)}
            className="text-xs px-3 py-2 rounded-lg border border-stone-200 bg-stone-50 font-medium text-stone-700"
          >
            <option value="ALL">All Budget Tiers</option>
            <option value="Ultra-Luxury">Ultra-Luxury (₹50L+)</option>
            <option value="Royal">Royal (₹25L–₹50L)</option>
          </select>
        </div>
      </div>

      {/* KANBAN BOARD */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 overflow-x-auto pb-4">
        {KANBAN_STAGES.map((stage) => {
          const stageLeads = filteredLeads.filter(l => l.stage === stage.id)
          return (
            <div
              key={stage.id}
              className="bg-stone-50/80 rounded-2xl border border-stone-200/80 p-3 flex flex-col min-h-[500px]"
            >
              {/* Column Header */}
              <div className="flex items-center justify-between pb-3 mb-3 border-b border-stone-200">
                <div className="flex items-center gap-2">
                  <span className={`w-2.5 h-2.5 rounded-full ${stage.dot}`} />
                  <h3 className="text-xs font-bold text-stone-800">{stage.label}</h3>
                </div>
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-white border border-stone-200 text-stone-600 shadow-2xs">
                  {stageLeads.length}
                </span>
              </div>

              {/* Lead Cards List */}
              <div className="space-y-3 flex-1 overflow-y-auto pr-0.5">
                {stageLeads.length === 0 ? (
                  <div className="h-32 border-2 border-dashed border-stone-200 rounded-xl flex items-center justify-center text-center p-3 text-stone-400 text-xs">
                    No leads in this stage
                  </div>
                ) : (
                  stageLeads.map((lead) => (
                    <div
                      key={lead.id}
                      className="bg-white rounded-xl p-3.5 border border-stone-200 shadow-sm hover:shadow-md transition-all group relative space-y-2.5"
                    >
                      {/* Budget Badge & City */}
                      <div className="flex items-center justify-between gap-1 text-[10px]">
                        <span className="px-2 py-0.5 rounded-md font-semibold bg-champagne/15 text-stone-900 border border-champagne/30">
                          {lead.budgetTier.split(' ')[0]} · ₹{(lead.estimatedBudget / 100000).toFixed(1)}L
                        </span>
                        <span className="text-stone-500 font-medium flex items-center gap-1">
                          <MapPin className="w-2.5 h-2.5 text-champagne" />
                          {lead.preferredCity.split(',')[0]}
                        </span>
                      </div>

                      {/* Couple Name */}
                      <h4 className="font-serif font-bold text-stone-900 text-sm leading-snug">
                        {lead.coupleName}
                      </h4>

                      {/* Key Wedding Specs */}
                      <div className="bg-stone-50 rounded-lg p-2 text-[11px] text-stone-600 space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="text-stone-400">Muhurat:</span>
                          <span className="font-semibold text-stone-800">{lead.muhuratDate}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-stone-400">Guests:</span>
                          <span className="font-semibold text-stone-800">~{lead.guestCount} pax</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-stone-400">Events:</span>
                          <span className="font-medium text-stone-700 truncate max-w-[120px]">
                            {lead.functions.join(', ')}
                          </span>
                        </div>
                      </div>

                      {/* Planner Assignment */}
                      <div className="text-[10px] text-stone-500 flex items-center gap-1">
                        <UserCheck className="w-3 h-3 text-emerald-600" />
                        <span className="truncate">{lead.assignedTo.split(' (')[0]}</span>
                      </div>

                      {/* Action Bar (1-Click WhatsApp + Stage Switcher) */}
                      <div className="pt-2 border-t border-stone-100 flex items-center justify-between gap-1">
                        <button
                          onClick={() => openWhatsApp(lead)}
                          title="Open WhatsApp with pre-filled luxury greeting"
                          className="px-2.5 py-1 rounded-md bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 font-bold text-[10px] flex items-center gap-1 transition-colors"
                        >
                          <Send className="w-2.5 h-2.5 text-emerald-600" />
                          <span>WhatsApp</span>
                        </button>

                        <div className="flex items-center gap-1">
                          {/* Previous Stage */}
                          {stage.id !== 'NEW_INQUIRY' && (
                            <button
                              onClick={() => {
                                const currIdx = KANBAN_STAGES.findIndex(s => s.id === stage.id)
                                if (currIdx > 0) moveLeadStage(lead.id, KANBAN_STAGES[currIdx - 1].id)
                              }}
                              title="Move to previous stage"
                              className="p-1 rounded hover:bg-stone-100 text-stone-400 hover:text-stone-700"
                            >
                              <ArrowLeft className="w-3 h-3" />
                            </button>
                          )}
                          {/* Next Stage */}
                          {stage.id !== 'WON' && stage.id !== 'LOST' && (
                            <button
                              onClick={() => {
                                const currIdx = KANBAN_STAGES.findIndex(s => s.id === stage.id)
                                if (currIdx < KANBAN_STAGES.length - 1) moveLeadStage(lead.id, KANBAN_STAGES[currIdx + 1].id)
                              }}
                              title="Advance to next stage"
                              className="p-1 rounded bg-stone-900 text-white hover:bg-black"
                            >
                              <ArrowRight className="w-3 h-3" />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* ADD LEAD MODAL */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-stone-200 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-stone-200 mb-4">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-burgundy" />
                <h3 className="font-serif font-bold text-lg text-stone-900">Add New Wedding Inquiry</h3>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-stone-400 hover:text-stone-700 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddLead} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">Couple Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Radhika Merchant & Anant Ambani"
                  value={newLead.coupleName}
                  onChange={(e) => setNewLead(prev => ({ ...prev, coupleName: e.target.value }))}
                  className="w-full px-3 py-2 text-xs border border-stone-200 rounded-lg focus:ring-2 focus:ring-champagne focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">Phone Number (WhatsApp) *</label>
                  <input
                    type="tel"
                    required
                    placeholder="+919876543210"
                    value={newLead.phone}
                    onChange={(e) => setNewLead(prev => ({ ...prev, phone: e.target.value }))}
                    className="w-full px-3 py-2 text-xs border border-stone-200 rounded-lg focus:ring-2 focus:ring-champagne focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">Email</label>
                  <input
                    type="email"
                    placeholder="couple@email.com"
                    value={newLead.email}
                    onChange={(e) => setNewLead(prev => ({ ...prev, email: e.target.value }))}
                    className="w-full px-3 py-2 text-xs border border-stone-200 rounded-lg focus:ring-2 focus:ring-champagne focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">Muhurat Date</label>
                  <input
                    type="date"
                    value={newLead.muhuratDate}
                    onChange={(e) => setNewLead(prev => ({ ...prev, muhuratDate: e.target.value }))}
                    className="w-full px-2 py-2 text-xs border border-stone-200 rounded-lg focus:ring-2 focus:ring-champagne focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">Est. Guests</label>
                  <input
                    type="number"
                    value={newLead.guestCount}
                    onChange={(e) => setNewLead(prev => ({ ...prev, guestCount: Number(e.target.value) }))}
                    className="w-full px-3 py-2 text-xs border border-stone-200 rounded-lg focus:ring-2 focus:ring-champagne focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">City</label>
                  <input
                    type="text"
                    placeholder="Udaipur, Jaipur..."
                    value={newLead.preferredCity}
                    onChange={(e) => setNewLead(prev => ({ ...prev, preferredCity: e.target.value }))}
                    className="w-full px-3 py-2 text-xs border border-stone-200 rounded-lg focus:ring-2 focus:ring-champagne focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">Budget Tier</label>
                  <select
                    value={newLead.budgetTier}
                    onChange={(e) => setNewLead(prev => ({ ...prev, budgetTier: e.target.value }))}
                    className="w-full px-3 py-2 text-xs border border-stone-200 rounded-lg bg-stone-50 focus:ring-2 focus:ring-champagne focus:outline-none"
                  >
                    <option value="Ultra-Luxury (₹50L+)">Ultra-Luxury (₹50L+)</option>
                    <option value="Royal (₹25L–₹50L)">Royal (₹25L–₹50L)</option>
                    <option value="Premium (₹10L–₹25L)">Premium (₹10L–₹25L)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">Assign Concierge Planner</label>
                  <select
                    value={newLead.assignedTo}
                    onChange={(e) => setNewLead(prev => ({ ...prev, assignedTo: e.target.value }))}
                    className="w-full px-3 py-2 text-xs border border-stone-200 rounded-lg bg-stone-50 focus:ring-2 focus:ring-champagne focus:outline-none"
                  >
                    {CONCIERGE_PLANNERS.map(p => (
                      <option key={p} value={p}>{p}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">Special Requirements &amp; Notes</label>
                <textarea
                  rows={2}
                  placeholder="e.g. Mandap on water, Sufi night singer required..."
                  value={newLead.notes}
                  onChange={(e) => setNewLead(prev => ({ ...prev, notes: e.target.value }))}
                  className="w-full px-3 py-2 text-xs border border-stone-200 rounded-lg focus:ring-2 focus:ring-champagne focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-stone-200">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-lg text-xs font-bold text-stone-600 hover:bg-stone-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-stone-900 hover:bg-black text-white text-xs font-bold shadow-md"
                >
                  Create &amp; Log Lead
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
