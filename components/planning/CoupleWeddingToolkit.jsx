'use client'

import React, { useState } from 'react'
import {
  DollarSign,
  Users,
  CheckCircle2,
  XCircle,
  Clock,
  Sparkles,
  Plus,
  Send,
  Download,
  Building2,
  Heart,
  Percent,
  Sliders,
  Utensils,
  Camera,
  Music,
  ShoppingBag,
  Hotel,
  Search,
  Filter
} from 'lucide-react'
import { toast } from 'sonner'

export const INITIAL_EXPENSES = [
  { id: 'exp_1', category: 'Palace Venue', item: 'Rambagh Citadel 3-Day Booking Advance', budgeted: 1800000, actual: 1600000, status: 'PAID' },
  { id: 'exp_2', category: 'Royal Catering', item: 'Awadhi & Mewari Banquets (350 pax, 4 meals)', budgeted: 1200000, actual: 1150000, status: 'ALLOCATED' },
  { id: 'exp_3', category: 'Floral & Decor', item: 'Gulmohar Artisanal Mogra & Glass Mandap', budgeted: 750000, actual: 700000, status: 'ALLOCATED' },
  { id: 'exp_4', category: 'Cinematography', item: 'Drishti 3-Day 4K Cinematic & Drone Crew', budgeted: 500000, actual: 480000, status: 'PAID' },
  { id: 'exp_5', category: 'Music & Folk', item: 'Manganiyar Troupe & Banaras Shehnai Masters', budgeted: 400000, actual: 380000, status: 'ALLOCATED' },
  { id: 'exp_6', category: 'Bridal & Groom', item: 'Sabyasachi Lehengas & Sherwanis', budgeted: 350000, actual: 370000, status: 'PAID' }
]

export const INITIAL_GUESTS = [
  { id: 'gst_1', name: 'Kabir & Sonal Kapoor', phone: '+919820123456', side: 'Groom', group: 'VIP Family', pax: 4, rsvp: 'CONFIRMED', room: 'Presidential Suite', diet: 'Non-Veg', events: ['Mehendi', 'Sangeet', 'Pheras', 'Reception'] },
  { id: 'gst_2', name: 'Rhea Bahl & Family', phone: '+919811223344', side: 'Bride', group: 'Close Friends', pax: 2, rsvp: 'CONFIRMED', room: 'Courtyard Villa', diet: 'Vegetarian', events: ['Sangeet', 'Pheras', 'Reception'] },
  { id: 'gst_3', name: 'Advait Deshmukh', phone: '+919920887766', side: 'Groom', group: 'College Friends', pax: 1, rsvp: 'CONFIRMED', room: 'Deluxe Heritage Wing', diet: 'Non-Veg', events: ['Sangeet', 'Pheras'] },
  { id: 'gst_4', name: 'Dr. Meera Nambiar', phone: '+919845012345', side: 'Bride', group: 'Relatives', pax: 3, rsvp: 'PENDING', room: 'Deluxe Heritage Wing', diet: 'Pure Jain', events: ['Mehendi', 'Pheras', 'Reception'] },
  { id: 'gst_5', name: 'Vikram & Radhika Seth', phone: '+919876543210', side: 'Bride', group: 'VIP Family', pax: 2, rsvp: 'DECLINED', room: 'No Accommodation', diet: 'Vegetarian', events: [] }
]

export default function CoupleWeddingToolkit() {
  const [activeTab, setActiveTab] = useState('budget') // 'budget' | 'guests_rsvp'
  const [totalBudget, setTotalBudget] = useState(5000000) // ₹50 Lakhs default
  const [expenses, setExpenses] = useState(INITIAL_EXPENSES)
  const [guests, setGuests] = useState(INITIAL_GUESTS)

  // Budget Modal State
  const [isAddExpenseOpen, setIsAddExpenseOpen] = useState(false)
  const [newExpense, setNewExpense] = useState({ category: 'Palace Venue', item: '', budgeted: 200000, actual: 200000, status: 'ALLOCATED' })

  // Guest Modal State
  const [isAddGuestOpen, setIsAddGuestOpen] = useState(false)
  const [guestSearch, setGuestSearch] = useState('')
  const [guestSideFilter, setGuestSideFilter] = useState('ALL')
  const [newGuest, setNewGuest] = useState({
    name: '',
    phone: '',
    side: 'Bride',
    group: 'VIP Family',
    pax: 2,
    rsvp: 'PENDING',
    room: 'Courtyard Villa',
    diet: 'Vegetarian'
  })

  // Budget calculations
  const totalSpent = expenses.reduce((sum, e) => sum + (e.actual || 0), 0)
  const remainingBudget = totalBudget - totalSpent

  // Guest calculations
  const totalInvitedPax = guests.reduce((sum, g) => sum + g.pax, 0)
  const confirmedPax = guests.filter(g => g.rsvp === 'CONFIRMED').reduce((sum, g) => sum + g.pax, 0)
  const roomsNeeded = guests.filter(g => g.room !== 'No Accommodation' && g.rsvp !== 'DECLINED').length

  const filteredGuests = guests.filter(g => {
    const matchSearch = g.name.toLowerCase().includes(guestSearch.toLowerCase()) || g.phone.includes(guestSearch)
    const matchSide = guestSideFilter === 'ALL' || g.side === guestSideFilter
    return matchSearch && matchSide
  })

  const handleAddExpense = (e) => {
    e.preventDefault()
    if (!newExpense.item) return
    setExpenses(prev => [...prev, { ...newExpense, id: `exp_${Date.now()}` }])
    setIsAddExpenseOpen(false)
    setNewExpense({ category: 'Palace Venue', item: '', budgeted: 200000, actual: 200000, status: 'ALLOCATED' })
    toast.success('New wedding expense added to budget tracker!')
  }

  const handleAddGuest = (e) => {
    e.preventDefault()
    if (!newGuest.name || !newGuest.phone) {
      toast.error('Please enter guest name and phone')
      return
    }
    setGuests(prev => [...prev, { ...newGuest, id: `gst_${Date.now()}`, events: ['Mehendi', 'Sangeet', 'Pheras', 'Reception'] }])
    setIsAddGuestOpen(false)
    toast.success('Guest added to RSVP registry!')
  }

  const sendWhatsAppRSVP = (guest) => {
    const cleanPhone = guest.phone.replace(/[^0-9]/g, '')
    const msg = encodeURIComponent(
      `Namaste ${guest.name}! ✨\n\n` +
      `You and your family (${guest.pax} pax) are cordially invited to celebrate our Royal Wedding at Vows & Venues!\n\n` +
      `🏰 Palace Accommodation: ${guest.room}\n` +
      `🍽️ Dining Preference: ${guest.diet}\n\n` +
      `Please confirm your RSVP attendance by replying to this message.\n\n` +
      `With warm love & regards,\nThe Bride & Groom Family`
    )
    window.open(`https://wa.me/${cleanPhone}?text=${msg}`, '_blank')
  }

  const exportBudgetCSV = () => {
    const headers = 'Category,Item Description,Budgeted (INR),Actual Spent (INR),Status\n'
    const rows = expenses.map(e => `"${e.category}","${e.item}",${e.budgeted},${e.actual},"${e.status}"`).join('\n')
    const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `Wedding_Budget_Plan_VowsAndVenues.csv`
    link.click()
    toast.success('Wedding Budget exported to CSV!')
  }

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-stone-900 via-burgundy/90 to-stone-900 text-white rounded-3xl p-6 sm:p-8 border border-champagne/40 shadow-2xl">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-champagne/20 border border-champagne/40 text-champagne text-xs font-semibold uppercase tracking-wider mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Couple Planning Concierge</span>
            </div>
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-white">Interactive Wedding Planning Suite</h2>
            <p className="text-xs text-stone-300 mt-1 max-w-2xl leading-relaxed">
              Plan your grand celebration with precision. Track budgets with luxury wedding standards, manage guests, palace room allocations, and 1-click WhatsApp RSVP invites.
            </p>
          </div>

          <div className="flex items-center gap-2 bg-stone-900/90 border border-white/10 p-1.5 rounded-2xl">
            <button
              onClick={() => setActiveTab('budget')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeTab === 'budget' ? 'bg-gradient-to-r from-champagne to-amber-400 text-stone-900 shadow' : 'text-stone-300 hover:text-white'
              }`}
            >
              <DollarSign className="w-3.5 h-3.5" />
              <span>Budget Planner</span>
            </button>
            <button
              onClick={() => setActiveTab('guests_rsvp')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeTab === 'guests_rsvp' ? 'bg-gradient-to-r from-champagne to-amber-400 text-stone-900 shadow' : 'text-stone-300 hover:text-white'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>Guests &amp; RSVP ({guests.length})</span>
            </button>
          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* 1. BUDGET PLANNER TAB */}
      {/* ======================================================== */}
      {activeTab === 'budget' && (
        <div className="space-y-6">
          {/* Total Budget Controller & KPI Bar */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200 shadow-sm space-y-6">
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 pb-6 border-b border-stone-100">
              <div className="space-y-2 flex-1">
                <span className="text-xs font-bold text-stone-500 uppercase tracking-wider block">Set Target Wedding Budget</span>
                <div className="flex items-center gap-3">
                  <span className="font-serif text-3xl font-bold text-stone-900">
                    ₹{(totalBudget / 100000).toFixed(0)} Lakhs
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {[2500000, 5000000, 7500000, 10000000, 20000000].map(amt => (
                      <button
                        key={amt}
                        onClick={() => setTotalBudget(amt)}
                        className={`text-[10px] font-bold px-2.5 py-1 rounded-lg border transition-all ${
                          totalBudget === amt ? 'bg-stone-900 text-white border-stone-900' : 'bg-stone-50 text-stone-600 border-stone-200 hover:bg-stone-100'
                        }`}
                      >
                        ₹{(amt / 100000).toFixed(0)}L
                      </button>
                    ))}
                  </div>
                </div>

                {/* Slider */}
                <input
                  type="range"
                  min="1000000"
                  max="20000000"
                  step="500000"
                  value={totalBudget}
                  onChange={(e) => setTotalBudget(Number(e.target.value))}
                  className="w-full h-2 bg-stone-200 rounded-lg appearance-none cursor-pointer accent-champagne"
                />
              </div>

              {/* Financial Metrics */}
              <div className="grid grid-cols-2 gap-4 w-full lg:w-auto">
                <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 min-w-[140px]">
                  <span className="text-[10px] uppercase font-bold text-stone-400 block">Total Allocated</span>
                  <span className="font-serif text-xl font-bold text-stone-900 mt-0.5 block">
                    ₹{(totalSpent / 100000).toFixed(2)}L
                  </span>
                  <span className="text-[10px] text-emerald-600 font-bold block mt-0.5">
                    {Math.round((totalSpent / totalBudget) * 100)}% of Target
                  </span>
                </div>

                <div className="p-4 rounded-2xl bg-champagne/15 border border-champagne/40 min-w-[140px]">
                  <span className="text-[10px] uppercase font-bold text-stone-500 block">Remaining Buffer</span>
                  <span className="font-serif text-xl font-bold text-burgundy mt-0.5 block">
                    ₹{(remainingBudget / 100000).toFixed(2)}L
                  </span>
                  <span className="text-[10px] text-stone-600 font-bold block mt-0.5">Available for extras</span>
                </div>
              </div>
            </div>

            {/* Standard Category Allocation Breakdown */}
            <div className="space-y-3">
              <h4 className="font-serif font-bold text-sm text-stone-900">Standard Indian Luxury Wedding Allocations</h4>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 text-xs">
                {[
                  { name: 'Palace Venue', pct: 35, amt: totalBudget * 0.35, color: 'bg-amber-400' },
                  { name: 'Royal Feast', pct: 25, amt: totalBudget * 0.25, color: 'bg-emerald-400' },
                  { name: 'Floral Atelier', pct: 15, amt: totalBudget * 0.15, color: 'bg-rose-400' },
                  { name: '4K Cinema Crew', pct: 10, amt: totalBudget * 0.10, color: 'bg-sky-400' },
                  { name: 'Folk & Shehnai', pct: 8, amt: totalBudget * 0.08, color: 'bg-purple-400' },
                  { name: 'Bridal Couture', pct: 7, amt: totalBudget * 0.07, color: 'bg-teal-400' }
                ].map(cat => (
                  <div key={cat.name} className="p-3 rounded-xl bg-stone-50 border border-stone-200">
                    <div className="flex items-center gap-1.5 mb-1">
                      <span className={`w-2 h-2 rounded-full ${cat.color}`} />
                      <span className="font-bold text-stone-800 text-[11px] truncate">{cat.name}</span>
                    </div>
                    <span className="font-serif font-bold text-stone-900 block">₹{(cat.amt / 100000).toFixed(1)}L</span>
                    <span className="text-[10px] text-stone-400 block">{cat.pct}% Benchmark</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Itemized Expenses Table */}
          <div className="bg-white rounded-3xl p-6 border border-stone-200 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-stone-200">
              <div>
                <h3 className="font-serif font-bold text-base text-stone-900">Itemized Vendor Commitments</h3>
                <p className="text-xs text-stone-500">Compare budgeted estimates vs contracted rates.</p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={exportBudgetCSV}
                  className="px-3 py-2 rounded-xl border border-stone-200 hover:bg-stone-50 text-stone-700 font-bold text-xs flex items-center gap-1.5"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Export CSV</span>
                </button>
                <button
                  onClick={() => setIsAddExpenseOpen(true)}
                  className="px-4 py-2 rounded-xl bg-stone-900 hover:bg-black text-white font-bold text-xs flex items-center gap-1.5 shadow"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Expense</span>
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-stone-200 text-stone-400 uppercase tracking-wider text-[10px] bg-stone-50/50">
                    <th className="p-3">Category</th>
                    <th className="p-3">Item / Vendor</th>
                    <th className="p-3">Budgeted</th>
                    <th className="p-3">Actual Contract</th>
                    <th className="p-3">Variance</th>
                    <th className="p-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {expenses.map(e => {
                    const diff = e.budgeted - e.actual
                    return (
                      <tr key={e.id} className="hover:bg-stone-50/50 transition-colors">
                        <td className="p-3 font-semibold text-stone-800">{e.category}</td>
                        <td className="p-3 font-medium text-stone-900">{e.item}</td>
                        <td className="p-3 font-mono text-stone-600">₹{(e.budgeted).toLocaleString('en-IN')}</td>
                        <td className="p-3 font-mono font-bold text-stone-900">₹{(e.actual).toLocaleString('en-IN')}</td>
                        <td className="p-3 font-mono font-bold">
                          {diff >= 0 ? (
                            <span className="text-emerald-600">+₹{(diff).toLocaleString('en-IN')} Saved</span>
                          ) : (
                            <span className="text-rose-600">-₹{(Math.abs(diff)).toLocaleString('en-IN')} Over</span>
                          )}
                        </td>
                        <td className="p-3">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            e.status === 'PAID' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                          }`}>
                            {e.status}
                          </span>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 2. GUESTS & RSVP REGISTRY TAB */}
      {/* ======================================================== */}
      {activeTab === 'guests_rsvp' && (
        <div className="space-y-6">
          {/* Guest Stats Bar */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white rounded-2xl p-5 border border-stone-200 shadow-sm">
              <span className="text-[11px] text-stone-500 uppercase tracking-wider block font-bold">Total Invited Pax</span>
              <span className="font-serif text-2xl font-bold text-stone-900 mt-1 block">{totalInvitedPax} Guests</span>
              <span className="text-[10px] text-stone-400 block mt-1">{guests.length} Families / Groups</span>
            </div>
            <div className="bg-emerald-50/70 rounded-2xl p-5 border border-emerald-200 shadow-sm">
              <span className="text-[11px] text-emerald-800 uppercase tracking-wider block font-bold">Confirmed Attending</span>
              <span className="font-serif text-2xl font-bold text-emerald-950 mt-1 block">{confirmedPax} Confirmed</span>
              <span className="text-[10px] text-emerald-700 block mt-1">{Math.round((confirmedPax / totalInvitedPax) * 100)}% RSVP Rate</span>
            </div>
            <div className="bg-white rounded-2xl p-5 border border-stone-200 shadow-sm">
              <span className="text-[11px] text-stone-500 uppercase tracking-wider block font-bold">Palace Rooms Needed</span>
              <span className="font-serif text-2xl font-bold text-stone-900 mt-1 block">{roomsNeeded} Suites</span>
              <span className="text-[10px] text-stone-400 block mt-1">Allocated in Heritage Wings</span>
            </div>
            <div className="bg-white rounded-2xl p-5 border border-stone-200 shadow-sm">
              <span className="text-[11px] text-stone-500 uppercase tracking-wider block font-bold">Pending RSVPs</span>
              <span className="font-serif text-2xl font-bold text-amber-600 mt-1 block">
                {guests.filter(g => g.rsvp === 'PENDING').length} Families
              </span>
              <span className="text-[10px] text-stone-400 block mt-1">Awaiting confirmation</span>
            </div>
          </div>

          {/* Guest Directory and WhatsApp Dispacther */}
          <div className="bg-white rounded-3xl p-6 border border-stone-200 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-stone-200">
              <div className="flex items-center gap-2">
                <div className="relative w-64">
                  <Search className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={guestSearch}
                    onChange={(e) => setGuestSearch(e.target.value)}
                    placeholder="Search guest or phone..."
                    className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-champagne"
                  />
                </div>

                <select
                  value={guestSideFilter}
                  onChange={(e) => setGuestSideFilter(e.target.value)}
                  className="text-xs px-3 py-1.5 rounded-xl border border-stone-200 bg-stone-50 font-medium"
                >
                  <option value="ALL">All Sides</option>
                  <option value="Bride">Bride's Side</option>
                  <option value="Groom">Groom's Side</option>
                </select>
              </div>

              <button
                onClick={() => setIsAddGuestOpen(true)}
                className="px-4 py-2 rounded-xl bg-stone-900 hover:bg-black text-white font-bold text-xs flex items-center gap-1.5 shadow"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Guest Family</span>
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-stone-200 text-stone-400 uppercase tracking-wider text-[10px] bg-stone-50/50">
                    <th className="p-3">Guest / Family</th>
                    <th className="p-3">Side &amp; Group</th>
                    <th className="p-3">Pax</th>
                    <th className="p-3">RSVP Status</th>
                    <th className="p-3">Palace Accommodation</th>
                    <th className="p-3">Dietary</th>
                    <th className="p-3 text-right">WhatsApp Invite</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {filteredGuests.map(g => (
                    <tr key={g.id} className="hover:bg-stone-50/50 transition-colors">
                      <td className="p-3">
                        <span className="font-bold text-stone-900 block">{g.name}</span>
                        <span className="text-[10px] text-stone-400 font-mono">{g.phone}</span>
                      </td>

                      <td className="p-3">
                        <span className="font-semibold text-stone-800 block">{g.side}'s Side</span>
                        <span className="text-[10px] text-stone-500">{g.group}</span>
                      </td>

                      <td className="p-3 font-bold text-stone-900">
                        {g.pax} pax
                      </td>

                      <td className="p-3">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold ${
                          g.rsvp === 'CONFIRMED'
                            ? 'bg-emerald-100 text-emerald-800'
                            : g.rsvp === 'DECLINED'
                            ? 'bg-rose-100 text-rose-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}>
                          {g.rsvp === 'CONFIRMED' && <CheckCircle2 className="w-2.5 h-2.5" />}
                          {g.rsvp === 'DECLINED' && <XCircle className="w-2.5 h-2.5" />}
                          {g.rsvp === 'PENDING' && <Clock className="w-2.5 h-2.5" />}
                          <span>{g.rsvp}</span>
                        </span>
                      </td>

                      <td className="p-3">
                        <span className="text-stone-800 font-medium block truncate max-w-[140px]">{g.room}</span>
                      </td>

                      <td className="p-3 font-semibold text-stone-700">
                        {g.diet}
                      </td>

                      <td className="p-3 text-right">
                        <button
                          onClick={() => sendWhatsAppRSVP(g)}
                          className="px-2.5 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 font-bold text-[10px] inline-flex items-center gap-1 transition-colors"
                        >
                          <Send className="w-2.5 h-2.5 text-emerald-600" />
                          <span>Send Invite</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ADD EXPENSE MODAL */}
      {isAddExpenseOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-stone-200 text-xs">
            <h3 className="font-serif font-bold text-base text-stone-900 mb-3">Add Wedding Expense Item</h3>
            <form onSubmit={handleAddExpense} className="space-y-3">
              <div>
                <label className="block font-bold text-stone-700 mb-1">Category</label>
                <select
                  value={newExpense.category}
                  onChange={(e) => setNewExpense(p => ({ ...p, category: e.target.value }))}
                  className="w-full px-3 py-2 border rounded-xl"
                >
                  <option value="Palace Venue">Palace Venue</option>
                  <option value="Royal Catering">Royal Catering</option>
                  <option value="Floral & Decor">Floral &amp; Decor</option>
                  <option value="Cinematography">Cinematography</option>
                  <option value="Music & Folk">Music &amp; Folk</option>
                  <option value="Bridal & Groom">Bridal &amp; Groom</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-stone-700 mb-1">Item / Vendor Description *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Sangeet DJ & Sound System"
                  value={newExpense.item}
                  onChange={(e) => setNewExpense(p => ({ ...p, item: e.target.value }))}
                  className="w-full px-3 py-2 border rounded-xl"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-stone-700 mb-1">Budgeted (₹)</label>
                  <input
                    type="number"
                    value={newExpense.budgeted}
                    onChange={(e) => setNewExpense(p => ({ ...p, budgeted: Number(e.target.value) }))}
                    className="w-full px-3 py-2 border rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-bold text-stone-700 mb-1">Actual Contract (₹)</label>
                  <input
                    type="number"
                    value={newExpense.actual}
                    onChange={(e) => setNewExpense(p => ({ ...p, actual: Number(e.target.value) }))}
                    className="w-full px-3 py-2 border rounded-xl"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t">
                <button type="button" onClick={() => setIsAddExpenseOpen(false)} className="px-3 py-1.5 font-bold text-stone-600">Cancel</button>
                <button type="submit" className="px-5 py-2 bg-stone-900 text-white font-bold rounded-xl shadow">Save Expense</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ADD GUEST MODAL */}
      {isAddGuestOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-stone-200 text-xs">
            <h3 className="font-serif font-bold text-base text-stone-900 mb-3">Add Guest Family to RSVP Registry</h3>
            <form onSubmit={handleAddGuest} className="space-y-3">
              <div>
                <label className="block font-bold text-stone-700 mb-1">Guest / Family Head Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Mr. & Mrs. Ratan Tata"
                  value={newGuest.name}
                  onChange={(e) => setNewGuest(p => ({ ...p, name: e.target.value }))}
                  className="w-full px-3 py-2 border rounded-xl"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-stone-700 mb-1">WhatsApp Phone *</label>
                  <input
                    type="tel"
                    required
                    placeholder="+919876543210"
                    value={newGuest.phone}
                    onChange={(e) => setNewGuest(p => ({ ...p, phone: e.target.value }))}
                    className="w-full px-3 py-2 border rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-bold text-stone-700 mb-1">Total Pax Count</label>
                  <input
                    type="number"
                    min="1"
                    value={newGuest.pax}
                    onChange={(e) => setNewGuest(p => ({ ...p, pax: Number(e.target.value) }))}
                    className="w-full px-3 py-2 border rounded-xl"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-stone-700 mb-1">Side</label>
                  <select
                    value={newGuest.side}
                    onChange={(e) => setNewGuest(p => ({ ...p, side: e.target.value }))}
                    className="w-full px-3 py-2 border rounded-xl"
                  >
                    <option value="Bride">Bride's Side</option>
                    <option value="Groom">Groom's Side</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-stone-700 mb-1">Relationship Group</label>
                  <select
                    value={newGuest.group}
                    onChange={(e) => setNewGuest(p => ({ ...p, group: e.target.value }))}
                    className="w-full px-3 py-2 border rounded-xl"
                  >
                    <option value="VIP Family">VIP Family</option>
                    <option value="Close Friends">Close Friends</option>
                    <option value="Relatives">Relatives</option>
                    <option value="Colleagues">Colleagues</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-stone-700 mb-1">Palace Suite Allocation</label>
                  <select
                    value={newGuest.room}
                    onChange={(e) => setNewGuest(p => ({ ...p, room: e.target.value }))}
                    className="w-full px-3 py-2 border rounded-xl"
                  >
                    <option value="Presidential Suite">Presidential Suite</option>
                    <option value="Courtyard Villa">Courtyard Villa</option>
                    <option value="Deluxe Heritage Wing">Deluxe Heritage Wing</option>
                    <option value="No Accommodation">No Accommodation</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-stone-700 mb-1">Dining Preference</label>
                  <select
                    value={newGuest.diet}
                    onChange={(e) => setNewGuest(p => ({ ...p, diet: e.target.value }))}
                    className="w-full px-3 py-2 border rounded-xl"
                  >
                    <option value="Vegetarian">Vegetarian</option>
                    <option value="Non-Veg">Royal Awadhi Non-Veg</option>
                    <option value="Pure Jain">Pure Jain</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t">
                <button type="button" onClick={() => setIsAddGuestOpen(false)} className="px-3 py-1.5 font-bold text-stone-600">Cancel</button>
                <button type="submit" className="px-5 py-2 bg-stone-900 text-white font-bold rounded-xl shadow">Add to Guest Registry</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
