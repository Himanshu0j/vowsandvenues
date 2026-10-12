'use client'

import React, { useState } from 'react'
import {
  Calendar,
  Sparkles,
  TrendingUp,
  Percent,
  Sliders,
  CheckCircle2,
  AlertCircle,
  Plus,
  Save,
  Sun,
  Flame
} from 'lucide-react'
import { toast } from 'sonner'

export const INITIAL_MUHURAT_DATES = [
  { id: 'm_1', date: '2026-11-18', name: 'Dev Uthani Ekadashi', demandTier: 'SUPER_PEAK (5x)', surgePercent: 20, commissionPercent: 15, active: true },
  { id: 'm_2', date: '2026-11-28', name: 'Margashirsha Shubh Muhurat', demandTier: 'PEAK (3x)', surgePercent: 15, commissionPercent: 12, active: true },
  { id: 'm_3', date: '2026-12-14', name: 'Winter Royal Saaya', demandTier: 'SUPER_PEAK (5x)', surgePercent: 25, commissionPercent: 15, active: true },
  { id: 'm_4', date: '2026-12-21', name: 'Winter Solstice Wedding Muhurat', demandTier: 'PEAK (3x)', surgePercent: 15, commissionPercent: 12, active: true },
  { id: 'm_5', date: '2027-01-18', name: 'Makar Sankranti Pavitra Vivah', demandTier: 'PEAK (3x)', surgePercent: 15, commissionPercent: 12, active: true },
  { id: 'm_6', date: '2027-02-06', name: 'Basant Panchami Grand Muhurat', demandTier: 'SUPER_PEAK (5x)', surgePercent: 25, commissionPercent: 15, active: true }
]

export default function AdminMuhuratPricing() {
  const [muhuratDates, setMuhuratDates] = useState(INITIAL_MUHURAT_DATES)
  const [globalOffSeasonDiscount, setGlobalOffSeasonDiscount] = useState(10)
  const [isAddingDate, setIsAddingDate] = useState(false)
  const [newDate, setNewDate] = useState({
    date: '2027-02-14',
    name: 'Valentine Royal Muhurat',
    demandTier: 'PEAK (3x)',
    surgePercent: 15,
    commissionPercent: 12
  })

  const toggleRule = (id) => {
    setMuhuratDates(prev => prev.map(m => m.id === id ? { ...m, active: !m.active } : m))
    toast.success('Muhurat dynamic pricing rule updated!')
  }

  const handleAddDate = (e) => {
    e.preventDefault()
    setMuhuratDates(prev => [...prev, { ...newDate, id: `m_${Date.now()}`, active: true }])
    setIsAddingDate(false)
    toast.success('New auspicious wedding muhurat date registered!')
  }

  const handleSaveGlobal = () => {
    toast.success('Global off-season and peak season parameters saved!')
  }

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-stone-900 via-amber-950/80 to-stone-900 text-white rounded-2xl p-6 border border-amber-400/30 shadow-xl">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs font-semibold uppercase tracking-wider mb-2">
              <Sun className="w-3.5 h-3.5" />
              <span>Shubh Vivah Saaya Calendar</span>
            </div>
            <h2 className="font-serif text-2xl font-bold text-white">Auspicious Muhurat &amp; Dynamic Peak Pricing</h2>
            <p className="text-xs text-stone-300 mt-1 max-w-2xl leading-relaxed">
              Indian weddings center around high-demand Saaya dates. Apply automated peak surge markup and platform commission rules to maximize marketplace yields.
            </p>
          </div>

          <button
            onClick={() => setIsAddingDate(true)}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 to-champagne hover:brightness-105 text-stone-900 font-bold text-xs shadow-md transition-all flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>Add Muhurat Date</span>
          </button>
        </div>
      </div>

      {/* Global Off-Season Settings */}
      <div className="bg-white rounded-2xl p-5 border border-stone-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <h3 className="font-serif font-bold text-sm text-stone-900">Monsoon &amp; Off-Peak Season Promotion Rule</h3>
          <p className="text-xs text-stone-500 mt-0.5">
            Auto-apply special incentives (July–September) to stimulate banquet hall &amp; indoor ballroom bookings.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-bold text-stone-700">Incentive Discount:</span>
            <input
              type="number"
              min="0"
              max="25"
              value={globalOffSeasonDiscount}
              onChange={(e) => setGlobalOffSeasonDiscount(Number(e.target.value))}
              className="w-16 px-2 py-1 text-xs border rounded-lg text-center font-bold"
            />
            <span className="text-xs font-bold text-stone-600">%</span>
          </div>

          <button
            onClick={handleSaveGlobal}
            className="px-3 py-1.5 bg-stone-900 hover:bg-black text-white text-xs font-bold rounded-lg"
          >
            Save Rule
          </button>
        </div>
      </div>

      {/* Muhurat Dates Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {muhuratDates.map(m => (
          <div
            key={m.id}
            className={`p-4 rounded-2xl border transition-all ${
              m.active
                ? 'bg-white border-amber-300 shadow-sm'
                : 'bg-stone-50 border-stone-200 opacity-60'
            }`}
          >
            <div className="flex items-center justify-between gap-2 mb-2">
              <span className="font-serif font-bold text-xs text-amber-900 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200 flex items-center gap-1">
                <Flame className="w-3 h-3 text-amber-600" />
                <span>{m.demandTier}</span>
              </span>
              <button
                onClick={() => toggleRule(m.id)}
                className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                  m.active ? 'bg-emerald-100 text-emerald-800' : 'bg-stone-200 text-stone-600'
                }`}
              >
                {m.active ? 'Active' : 'Disabled'}
              </button>
            </div>

            <h4 className="font-serif font-bold text-sm text-stone-900">{m.name}</h4>
            <div className="flex items-center gap-1.5 text-xs text-stone-600 mt-1">
              <Calendar className="w-3.5 h-3.5 text-champagne" />
              <span className="font-semibold text-stone-800">{m.date}</span>
            </div>

            <div className="mt-3 pt-3 border-t border-stone-100 grid grid-cols-2 gap-2 text-xs">
              <div className="bg-stone-50 p-2 rounded-lg">
                <span className="text-[10px] text-stone-400 block uppercase font-bold">Venue Markup</span>
                <span className="font-bold text-stone-800">+{m.surgePercent}% Surge</span>
              </div>
              <div className="bg-stone-50 p-2 rounded-lg">
                <span className="text-[10px] text-stone-400 block uppercase font-bold">Platform Comm.</span>
                <span className="font-bold text-champagne">{m.commissionPercent}%</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add Modal */}
      {isAddingDate && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-stone-200 text-xs">
            <h3 className="font-serif font-bold text-base text-stone-900 mb-3">Add Shubh Vivah Muhurat Date</h3>
            <form onSubmit={handleAddDate} className="space-y-3">
              <div>
                <label className="block font-bold mb-1">Occasion / Muhurat Name</label>
                <input
                  type="text"
                  required
                  value={newDate.name}
                  onChange={(e) => setNewDate(p => ({ ...p, name: e.target.value }))}
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>
              <div>
                <label className="block font-bold mb-1">Calendar Date</label>
                <input
                  type="date"
                  required
                  value={newDate.date}
                  onChange={(e) => setNewDate(p => ({ ...p, date: e.target.value }))}
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold mb-1">Surge %</label>
                  <input
                    type="number"
                    value={newDate.surgePercent}
                    onChange={(e) => setNewDate(p => ({ ...p, surgePercent: Number(e.target.value) }))}
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>
                <div>
                  <label className="block font-bold mb-1">Commission %</label>
                  <input
                    type="number"
                    value={newDate.commissionPercent}
                    onChange={(e) => setNewDate(p => ({ ...p, commissionPercent: Number(e.target.value) }))}
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-2 border-t">
                <button type="button" onClick={() => setIsAddingDate(false)} className="px-3 py-1.5 font-bold text-stone-600">Cancel</button>
                <button type="submit" className="px-4 py-1.5 bg-stone-900 text-white font-bold rounded-lg">Save Muhurat</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
