'use client'

import React, { useState } from 'react'
import {
  Layers,
  Sparkles,
  Building2,
  Camera,
  Utensils,
  Music,
  Plus,
  Trash2,
  Copy,
  Send,
  Download,
  Share2,
  CheckCircle2,
  ExternalLink,
  DollarSign
} from 'lucide-react'
import { toast } from 'sonner'

export const VENDOR_OPTIONS = {
  venues: [
    { id: 'v_1', name: 'Rambagh Citadel & Mughal Gardens (Jaipur)', price: 1800000 },
    { id: 'v_2', name: 'The Royal Lake Palace & Courtyards (Udaipur)', price: 2400000 },
    { id: 'v_3', name: 'Umaid Bhawan Citadel & Lawns (Jodhpur)', price: 3200000 }
  ],
  decor: [
    { id: 'd_1', name: 'Gulmohar Artisanal Mogra & Cascading Mandap', price: 650000 },
    { id: 'd_2', name: 'Rajwada Royal Velvet & Brass Diya Courtyard', price: 950000 },
    { id: 'd_3', name: 'Minimalist Starlit Glasshouse Floral Atelier', price: 500000 }
  ],
  catering: [
    { id: 'c_1', name: 'Mewari Royal Thali & Live Charcoal Kebabs (400 pax)', price: 1200000 },
    { id: 'c_2', name: 'Gourmet Pan-Asian & Awadhi Nizami Dastarkhwan (350 pax)', price: 1050000 },
    { id: 'c_3', name: 'Artisanal Global Grazing Tables & Saffron Banquets', price: 850000 }
  ],
  photography: [
    { id: 'p_1', name: 'Drishti Royal Memoirs (3-Day 4K Cinematic Crew + Drone)', price: 450000 },
    { id: 'p_2', name: 'Stories by Joseph Radhik Style Luxury Editorial Team', price: 750000 }
  ],
  entertainment: [
    { id: 'e_1', name: 'Manganiyar Folk Symphony & Rajasthani Ghoomar Troupe', price: 250000 },
    { id: 'e_2', name: 'Royal Shehnai Masters of Banaras (Baraat & Pheras)', price: 180000 },
    { id: 'e_3', name: 'Live Sufi Fusion Ensemble for Sangeet Night', price: 350000 }
  ]
}

export const INITIAL_PROPOSALS = [
  {
    id: 'prop_01',
    title: 'The 3-Day Mewari Citadel Extravaganza',
    coupleName: 'Aanya Singhania & Kabir Kapoor',
    phone: '+919820123456',
    venue: 'Rambagh Citadel & Mughal Gardens (Jaipur)',
    decor: 'Gulmohar Artisanal Mogra & Cascading Mandap',
    catering: 'Mewari Royal Thali & Live Charcoal Kebabs (400 pax)',
    photography: 'Drishti Royal Memoirs (3-Day 4K Cinematic Crew + Drone)',
    entertainment: 'Manganiyar Folk Symphony & Rajasthani Ghoomar Troupe',
    grossTotal: 4350000,
    bundleDiscountPercent: 10,
    finalPrice: 3915000,
    status: 'SENT_TO_CLIENT',
    createdAt: '2026-10-10'
  }
]

export default function AdminPackageBuilder() {
  const [proposals, setProposals] = useState(INITIAL_PROPOSALS)
  const [isBuilderOpen, setIsBuilderOpen] = useState(false)

  // Builder Form State
  const [coupleName, setCoupleName] = useState('')
  const [phone, setPhone] = useState('')
  const [title, setTitle] = useState('Bespoke Royal Wedding Proposal')
  const [selectedVenue, setSelectedVenue] = useState(VENDOR_OPTIONS.venues[0])
  const [selectedDecor, setSelectedDecor] = useState(VENDOR_OPTIONS.decor[0])
  const [selectedCatering, setSelectedCatering] = useState(VENDOR_OPTIONS.catering[0])
  const [selectedPhoto, setSelectedPhoto] = useState(VENDOR_OPTIONS.photography[0])
  const [selectedEntertainment, setSelectedEntertainment] = useState(VENDOR_OPTIONS.entertainment[0])
  const [discountPercent, setDiscountPercent] = useState(10)

  // Calculations
  const grossTotal = (selectedVenue?.price || 0) +
    (selectedDecor?.price || 0) +
    (selectedCatering?.price || 0) +
    (selectedPhoto?.price || 0) +
    (selectedEntertainment?.price || 0)

  const discountAmount = Math.round((grossTotal * discountPercent) / 100)
  const finalPrice = grossTotal - discountAmount

  const handleSaveProposal = (e) => {
    e.preventDefault()
    if (!coupleName || !phone) {
      toast.error('Please enter couple name and phone')
      return
    }

    const newProp = {
      id: `prop_${Date.now().toString().slice(-4)}`,
      title,
      coupleName,
      phone,
      venue: selectedVenue.name,
      decor: selectedDecor.name,
      catering: selectedCatering.name,
      photography: selectedPhoto.name,
      entertainment: selectedEntertainment.name,
      grossTotal,
      bundleDiscountPercent: discountPercent,
      finalPrice,
      status: 'SENT_TO_CLIENT',
      createdAt: new Date().toISOString().split('T')[0]
    }

    setProposals(prev => [newProp, ...prev])
    setIsBuilderOpen(false)
    toast.success('Bespoke wedding package proposal generated!')
  }

  const copyProposalLink = (prop) => {
    const link = `https://vowsandvenues-staging.onrender.com/proposal/${prop.id}`
    navigator.clipboard.writeText(link)
    toast.success('Private proposal link copied!')
  }

  const sendViaWhatsApp = (prop) => {
    const cleanPhone = prop.phone.replace(/[^0-9]/g, '')
    const msg = encodeURIComponent(
      `Namaste ${prop.coupleName}! ✨\n\n` +
      `Your bespoke *${prop.title}* from Vows & Venues Luxury Concierge is ready for review:\n\n` +
      `🏰 Venue: ${prop.venue}\n` +
      `🌸 Decor: ${prop.decor}\n` +
      `🍽️ Feast: ${prop.catering}\n` +
      `📸 Cinema: ${prop.photography}\n` +
      `🪕 Music: ${prop.entertainment}\n\n` +
      `Itemized Total: ₹${(prop.grossTotal).toLocaleString('en-IN')}\n` +
      `*Exclusive Concierge Rate (${prop.bundleDiscountPercent}% off): ₹${(prop.finalPrice).toLocaleString('en-IN')}*\n\n` +
      `Review your interactive proposal & lock with 20% token:\n` +
      `https://vowsandvenues-staging.onrender.com/proposal/${prop.id}\n\n` +
      `Warm regards,\nVows & Venues Royal Concierge`
    )
    window.open(`https://wa.me/${cleanPhone}?text=${msg}`, '_blank')
  }

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-stone-900 via-stone-950 to-stone-900 text-white rounded-2xl p-6 border border-champagne/30 shadow-xl">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-champagne/20 border border-champagne/40 text-champagne text-xs font-semibold uppercase tracking-wider mb-2">
              <Layers className="w-3.5 h-3.5" />
              <span>Concierge Mode Proposal Studio</span>
            </div>
            <h2 className="font-serif text-2xl font-bold text-white">Multi-Vendor Wedding Package Builder</h2>
            <p className="text-xs text-stone-300 mt-1 max-w-2xl leading-relaxed">
              Curate bespoke multi-vendor wedding packages (Venue + Decor + Royal Feast + Cinema + Shehnai). Generate private secret proposal links with 1-click token checkout.
            </p>
          </div>

          <button
            onClick={() => setIsBuilderOpen(true)}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-champagne to-amber-400 hover:brightness-105 text-stone-900 font-bold text-xs shadow-md transition-all flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>Compose Bespoke Package</span>
          </button>
        </div>
      </div>

      {/* Existing Proposals List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-serif font-bold text-base text-stone-900">Generated Client Quotations</h3>
          <span className="text-xs text-stone-500 font-medium">{proposals.length} Proposals Active</span>
        </div>

        {proposals.map(prop => (
          <div
            key={prop.id}
            className="bg-white rounded-2xl p-5 border border-stone-200 shadow-sm space-y-4"
          >
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-stone-100">
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded bg-champagne/20 border border-champagne/40 text-burgundy font-mono text-xs font-bold">
                    {prop.id}
                  </span>
                  <h4 className="font-serif font-bold text-base text-stone-900">{prop.title}</h4>
                </div>
                <div className="text-xs text-stone-500 mt-0.5">
                  Client: <strong className="text-stone-800">{prop.coupleName}</strong> · Phone: {prop.phone} · Created: {prop.createdAt}
                </div>
              </div>

              <div className="text-right">
                <span className="text-[10px] text-stone-400 uppercase line-through block">
                  ₹{(prop.grossTotal / 100000).toFixed(2)}L
                </span>
                <span className="font-serif text-lg font-bold text-emerald-700">
                  ₹{(prop.finalPrice / 100000).toFixed(2)}L
                </span>
                <span className="text-[10px] text-emerald-600 font-bold block">
                  {prop.bundleDiscountPercent}% Bundle Concierge Discount
                </span>
              </div>
            </div>

            {/* Bundled Components */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2.5 text-xs">
              <div className="p-2.5 rounded-xl bg-stone-50 border border-stone-200/70">
                <span className="text-[10px] font-bold text-stone-400 uppercase block mb-0.5">Palace Venue</span>
                <span className="font-semibold text-stone-800 line-clamp-2">{prop.venue}</span>
              </div>
              <div className="p-2.5 rounded-xl bg-stone-50 border border-stone-200/70">
                <span className="text-[10px] font-bold text-stone-400 uppercase block mb-0.5">Floral Decor</span>
                <span className="font-semibold text-stone-800 line-clamp-2">{prop.decor}</span>
              </div>
              <div className="p-2.5 rounded-xl bg-stone-50 border border-stone-200/70">
                <span className="text-[10px] font-bold text-stone-400 uppercase block mb-0.5">Royal Catering</span>
                <span className="font-semibold text-stone-800 line-clamp-2">{prop.catering}</span>
              </div>
              <div className="p-2.5 rounded-xl bg-stone-50 border border-stone-200/70">
                <span className="text-[10px] font-bold text-stone-400 uppercase block mb-0.5">Cinematography</span>
                <span className="font-semibold text-stone-800 line-clamp-2">{prop.photography}</span>
              </div>
              <div className="p-2.5 rounded-xl bg-stone-50 border border-stone-200/70">
                <span className="text-[10px] font-bold text-stone-400 uppercase block mb-0.5">Entertainment</span>
                <span className="font-semibold text-stone-800 line-clamp-2">{prop.entertainment}</span>
              </div>
            </div>

            {/* Actions */}
            <div className="pt-2 border-t border-stone-100 flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => copyProposalLink(prop)}
                  className="px-3 py-1.5 rounded-lg border border-stone-200 hover:bg-stone-50 text-stone-700 font-bold text-xs flex items-center gap-1.5 transition-colors"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy Private Link</span>
                </button>
                <button
                  onClick={() => sendViaWhatsApp(prop)}
                  className="px-3 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 font-bold text-xs flex items-center gap-1.5 transition-colors"
                >
                  <Send className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Dispatch WhatsApp Quote</span>
                </button>
              </div>

              <span className="text-xs text-stone-400 italic">
                Secret Proposal Endpoint: /proposal/{prop.id}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* BUILDER MODAL */}
      {isBuilderOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-stone-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-stone-200 mb-4">
              <div className="flex items-center gap-2">
                <Layers className="w-5 h-5 text-champagne" />
                <h3 className="font-serif font-bold text-lg text-stone-900">Compose Bespoke Wedding Package</h3>
              </div>
              <button onClick={() => setIsBuilderOpen(false)} className="text-stone-400 hover:text-stone-700 font-bold">✕</button>
            </div>

            <form onSubmit={handleSaveProposal} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-stone-700 mb-1">Couple Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Radhika & Anant"
                    value={coupleName}
                    onChange={(e) => setCoupleName(e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>
                <div>
                  <label className="block font-bold text-stone-700 mb-1">WhatsApp Phone *</label>
                  <input
                    type="tel"
                    required
                    placeholder="+919876543210"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-stone-700 mb-1">Package Title</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>

              {/* Vendor Pickers */}
              <div className="space-y-3 pt-2 border-t border-stone-200">
                <h4 className="font-bold text-stone-800 uppercase tracking-wider text-[11px]">Select Multi-Vendor Partners</h4>
                
                <div>
                  <label className="block font-medium text-stone-600 mb-1">1. Heritage Venue</label>
                  <select
                    value={selectedVenue.id}
                    onChange={(e) => setSelectedVenue(VENDOR_OPTIONS.venues.find(v => v.id === e.target.value))}
                    className="w-full px-3 py-2 border rounded-lg bg-stone-50"
                  >
                    {VENDOR_OPTIONS.venues.map(v => (
                      <option key={v.id} value={v.id}>{v.name} — ₹{(v.price / 100000).toFixed(1)}L</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-medium text-stone-600 mb-1">2. Floral &amp; Stage Decor Atelier</label>
                  <select
                    value={selectedDecor.id}
                    onChange={(e) => setSelectedDecor(VENDOR_OPTIONS.decor.find(d => d.id === e.target.value))}
                    className="w-full px-3 py-2 border rounded-lg bg-stone-50"
                  >
                    {VENDOR_OPTIONS.decor.map(d => (
                      <option key={d.id} value={d.id}>{d.name} — ₹{(d.price / 100000).toFixed(1)}L</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-medium text-stone-600 mb-1">3. Royal Banquet &amp; Catering</label>
                  <select
                    value={selectedCatering.id}
                    onChange={(e) => setSelectedCatering(VENDOR_OPTIONS.catering.find(c => c.id === e.target.value))}
                    className="w-full px-3 py-2 border rounded-lg bg-stone-50"
                  >
                    {VENDOR_OPTIONS.catering.map(c => (
                      <option key={c.id} value={c.id}>{c.name} — ₹{(c.price / 100000).toFixed(1)}L</option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-medium text-stone-600 mb-1">4. Cinematography</label>
                    <select
                      value={selectedPhoto.id}
                      onChange={(e) => setSelectedPhoto(VENDOR_OPTIONS.photography.find(p => p.id === e.target.value))}
                      className="w-full px-3 py-2 border rounded-lg bg-stone-50"
                    >
                      {VENDOR_OPTIONS.photography.map(p => (
                        <option key={p.id} value={p.id}>{p.name} — ₹{(p.price / 100000).toFixed(1)}L</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block font-medium text-stone-600 mb-1">5. Entertainment</label>
                    <select
                      value={selectedEntertainment.id}
                      onChange={(e) => setSelectedEntertainment(VENDOR_OPTIONS.entertainment.find(ent => ent.id === e.target.value))}
                      className="w-full px-3 py-2 border rounded-lg bg-stone-50"
                    >
                      {VENDOR_OPTIONS.entertainment.map(ent => (
                        <option key={ent.id} value={ent.id}>{ent.name} — ₹{(ent.price / 100000).toFixed(1)}L</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Price Calculation Summary Box */}
              <div className="bg-stone-900 text-white p-4 rounded-xl space-y-2 mt-4">
                <div className="flex justify-between text-xs text-stone-400">
                  <span>Gross Itemized Sum:</span>
                  <span className="font-mono">₹{(grossTotal).toLocaleString('en-IN')}</span>
                </div>

                <div className="flex items-center justify-between text-xs">
                  <span className="text-amber-300 font-bold">Bundle Concierge Discount:</span>
                  <div className="flex items-center gap-1">
                    <input
                      type="number"
                      min="0"
                      max="30"
                      value={discountPercent}
                      onChange={(e) => setDiscountPercent(Number(e.target.value))}
                      className="w-14 px-2 py-1 text-right text-stone-900 rounded bg-white font-bold"
                    />
                    <span className="text-white font-bold">%</span>
                  </div>
                </div>

                <div className="pt-2 border-t border-white/20 flex justify-between items-center text-sm">
                  <span className="font-serif font-bold text-white">Client Proposal Price:</span>
                  <span className="font-serif text-lg font-bold text-champagne">
                    ₹{(finalPrice).toLocaleString('en-IN')}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t">
                <button type="button" onClick={() => setIsBuilderOpen(false)} className="px-4 py-2 font-bold text-stone-600">Cancel</button>
                <button type="submit" className="px-5 py-2 bg-stone-900 hover:bg-black text-white font-bold rounded-lg shadow">Generate &amp; Lock Proposal</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
