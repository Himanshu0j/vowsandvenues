'use client'

import React from 'react'
import {
  Sparkles,
  Calendar,
  MapPin,
  Users,
  DollarSign,
  Plus,
  Trash2,
  RefreshCw,
  ArrowRight,
  ShieldCheck,
  Building2,
  Utensils,
  Camera,
  Music,
  Palette,
  Shirt,
  Gift,
  Flower2,
  MailOpen,
  CalendarDays,
  AlertTriangle,
  CheckCircle2,
  Download
} from 'lucide-react'

const CATEGORY_ICON_MAP = {
  venues: Building2,
  catering: Utensils,
  decor: Sparkles,
  makeup: Palette,
  outfits: Shirt,
  photography: Camera,
  music: Music,
  gifts: Gift,
  florists: Flower2,
  invitations: MailOpen,
  planners: CalendarDays
}

export default function EventBuilderWorkspace({
  activeEvent,
  categories = [],
  budgetMetrics,
  onUpdateEvent,
  onRemoveService,
  onOpenSwapModal,
  onOpenQuotationModal,
  onProceedToBooking
}) {
  if (!activeEvent) return null

  const targetBudget = Number(activeEvent.budget || 500000)
  const committedTotal = Number(budgetMetrics?.total || 0)
  const remainingBudget = targetBudget - committedTotal
  const percentUsed = Math.min(Math.round((committedTotal / targetBudget) * 100), 100)
  const isOverBudget = committedTotal > targetBudget

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-in fade-in">
      
      {/* 1. EVENT HEADER & LIVE BUDGET PROGRESS METER */}
      <div className="card-3d-wrap bg-white rounded-3xl p-5 sm:p-7 lg:p-9 border border-[#e8e2d5] shadow-[0_8px_30px_rgba(74,21,37,0.06)] relative overflow-hidden">
        {/* Top celebratory royal tricolor accent line */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#4a1525] via-amber-400 via-emerald-600 to-[#4a1525]" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-8">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-gradient-to-r from-amber-100 to-rose-100 text-[#4a1525] text-xs font-bold uppercase tracking-wider mb-2 border border-amber-300/40 shadow-sm">
              <Sparkles className="w-3.5 h-3.5 text-amber-600 animate-pulse" />
              <span>Royal Event Builder Studio</span>
            </div>
            <h1 className="font-serif text-2xl sm:text-3xl md:text-4xl font-bold text-[#1c1917]">
              {activeEvent.name}
            </h1>
            <div className="flex flex-wrap items-center gap-4 text-xs sm:text-sm text-stone-600 mt-2 font-medium">
              <span className="flex items-center gap-1.5 bg-[#faf8f5] px-2.5 py-1 rounded-lg border border-stone-200">
                <Calendar className="w-4 h-4 text-[#4a1525]" />
                {activeEvent.date || 'December 15, 2026'}
              </span>
              <span className="flex items-center gap-1.5 bg-[#faf8f5] px-2.5 py-1 rounded-lg border border-stone-200">
                <MapPin className="w-4 h-4 text-[#4a1525]" />
                {activeEvent.city || 'Lucknow'}
              </span>
              <span className="flex items-center gap-1.5 bg-[#faf8f5] px-2.5 py-1 rounded-lg border border-stone-200">
                <Users className="w-4 h-4 text-[#4a1525]" />
                {activeEvent.guestCount || 250} Royal Guests
              </span>
            </div>
          </div>

          {/* Quick Action CTAs */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto">
            <button
              onClick={onOpenQuotationModal}
              className="px-5 py-2.5 rounded-full bg-white hover:bg-[#faf8f5] text-[#1c1917] text-xs font-bold border border-amber-300/80 shadow-sm flex items-center justify-center gap-1.5 transition-all hover:scale-105 active:scale-95"
            >
              <Download className="w-4 h-4 text-[#4a1525]" /> Export Formal Quote
            </button>
            <button
              onClick={onProceedToBooking}
              className="btn-3d-wine px-6 py-2.5 rounded-full bg-gradient-to-r from-[#4a1525] via-[#6a1c32] to-[#4a1525] hover:brightness-110 text-[#f5ebd7] text-xs font-bold shadow-lg flex items-center justify-center gap-2 transition-all hover:scale-105 active:scale-95 border border-amber-400/40"
            >
              <span>Book All Services</span>
              <ArrowRight className="w-4 h-4 text-amber-300" />
            </button>
          </div>
        </div>

        {/* 2. THE LIVE BUDGET PROGRESS LEDGER */}
        <div className="bg-[#faf8f5] rounded-3xl p-5 sm:p-7 border border-[#e8e2d5] space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Target Budget Box */}
            <div className="card-3d-wrap bg-gradient-to-br from-amber-50/90 to-amber-100/40 border border-amber-200/80 rounded-2xl p-4 shadow-sm hover:-translate-y-1 transition-transform">
              <div className="text-[11px] font-bold uppercase tracking-wider text-amber-900 flex items-center gap-1">
                <span>🎯 Target Budget</span>
              </div>
              <div className="font-serif text-2xl sm:text-3xl font-bold text-stone-900 mt-1">
                ₹{targetBudget.toLocaleString('en-IN')}
              </div>
            </div>

            {/* Allocated Services Box */}
            <div className="card-3d-wrap bg-gradient-to-br from-rose-50/90 to-rose-100/40 border border-rose-200/80 rounded-2xl p-4 shadow-sm hover:-translate-y-1 transition-transform">
              <div className="text-[11px] font-bold uppercase tracking-wider text-[#4a1525] flex items-center gap-1">
                <span>💎 Allocated Services</span>
              </div>
              <div className="font-serif text-2xl sm:text-3xl font-bold text-[#4a1525] mt-1">
                ₹{committedTotal.toLocaleString('en-IN')}
              </div>
            </div>

            {/* Remaining Budget Box */}
            <div className={`card-3d-wrap border rounded-2xl p-4 shadow-sm hover:-translate-y-1 transition-transform ${isOverBudget ? 'bg-gradient-to-br from-red-50 to-red-100/50 border-red-200' : 'bg-gradient-to-br from-emerald-50/90 to-emerald-100/40 border-emerald-200/80'}`}>
              <div className={`text-[11px] font-bold uppercase tracking-wider ${isOverBudget ? 'text-red-800' : 'text-emerald-800'}`}>
                {isOverBudget ? '⚠️ Budget Exceeded By' : '✨ Remaining Balance'}
              </div>
              <div className={`font-serif text-2xl sm:text-3xl font-bold mt-1 ${isOverBudget ? 'text-rose-600' : 'text-emerald-800'}`}>
                {isOverBudget ? `+ ₹${Math.abs(remainingBudget).toLocaleString('en-IN')}` : `₹${remainingBudget.toLocaleString('en-IN')}`}
              </div>
            </div>
          </div>

          {/* Visual Multi-Stop Progress Bar */}
          <div>
            <div className="flex items-center justify-between text-xs text-stone-600 font-semibold mb-2">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                Allocation Progress: {budgetMetrics?.count || 0} Categories Selected
              </span>
              <span className="font-bold text-[#1c1917] bg-white px-2 py-0.5 rounded-md border border-stone-200 shadow-xs">
                {percentUsed}% Allocated
              </span>
            </div>
            <div className="w-full h-3.5 rounded-full bg-stone-200/80 overflow-hidden p-0.5 border border-stone-300/40">
              <div
                className={`h-full rounded-full transition-all duration-700 ease-out shadow-sm ${
                  isOverBudget 
                    ? 'bg-gradient-to-r from-amber-500 to-rose-600' 
                    : 'bg-gradient-to-r from-emerald-500 via-amber-400 to-[#4a1525]'
                }`}
                style={{ width: `${percentUsed}%` }}
              />
            </div>
          </div>

          {/* Over Budget Alert */}
          {isOverBudget && (
            <div className="flex items-center gap-2 p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs shadow-sm">
              <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>
                Your selections exceed your target budget. You can swap vendors or adjust service packages to balance your numbers.
              </span>
            </div>
          )}
        </div>
      </div>

      {/* 3. SELECTED SERVICES TILES */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-serif text-xl sm:text-2xl font-bold text-[#1c1917] flex items-center gap-2">
            <span>Event Line Items ({activeEvent.selectedServices?.length || 0})</span>
            <span className="w-2 h-2 rounded-full bg-[#4a1525]"></span>
          </h2>
          <span className="text-xs text-stone-500 font-medium">Swap or adjust services individually</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {(activeEvent.selectedServices || []).map((service, index) => {
            const Icon = CATEGORY_ICON_MAP[service.category] || Sparkles
            return (
              <div
                key={index}
                className="card-3d-wrap group bg-white rounded-2xl p-5 border border-[#e8e2d5] shadow-[0_4px_16px_rgba(0,0,0,0.04)] hover:shadow-[0_12px_30px_rgba(74,21,37,0.1)] flex flex-col justify-between hover:border-amber-400/70 transition-all duration-300 hover:-translate-y-1"
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#faf8f5] to-amber-50 text-[#4a1525] flex items-center justify-center border border-amber-200/60 shadow-xs group-hover:scale-105 transition-transform">
                        <Icon className="w-5 h-5" />
                      </div>
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200/50">
                          {service.categoryName || service.category}
                        </span>
                        <h3 className="font-serif font-bold text-base text-[#1c1917] group-hover:text-[#4a1525] transition-colors mt-0.5">
                          {service.vendorName}
                        </h3>
                      </div>
                    </div>

                    <span className="font-serif font-bold text-base sm:text-lg text-emerald-950">
                      ₹{service.price?.toLocaleString('en-IN')}
                    </span>
                  </div>

                  {service.packageName && (
                    <div className="text-xs text-stone-600 bg-[#faf8f5] px-3 py-1.5 rounded-lg border border-[#f0eae1] mb-3 font-medium">
                      Package: <span className="font-bold text-stone-900">{service.packageName}</span>
                    </div>
                  )}
                </div>

                <div className="pt-3 border-t border-[#f5f2eb] flex items-center justify-between text-xs">
                  <button
                    onClick={() => onOpenSwapModal(service.category)}
                    className="text-[#4a1525] hover:text-amber-700 font-bold flex items-center gap-1.5 transition-colors"
                  >
                    <RefreshCw className="w-3.5 h-3.5 text-amber-600" />
                    <span>Swap Vendor</span>
                  </button>

                  <button
                    onClick={() => onRemoveService(service.category)}
                    className="text-stone-400 hover:text-rose-600 transition-colors p-1 hover:scale-110 active:scale-90"
                    title="Remove from event"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* 4. UNSELECTED CATEGORIES — QUICK ADD RECOMMENDATIONS */}
      <div className="card-3d-wrap bg-[#faf8f5] rounded-3xl p-6 sm:p-8 border border-[#e8e2d5] shadow-xs">
        <h3 className="font-serif font-bold text-lg text-[#1c1917] mb-4 flex items-center gap-2">
          <span>Add Remaining Specializations to Your Event</span>
          <span className="text-xs font-sans font-normal text-stone-500">({categories.filter(cat => !activeEvent.selectedServices?.some(s => s.category === cat.slug)).length} available)</span>
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {categories
            .filter(cat => !activeEvent.selectedServices?.some(s => s.category === cat.slug))
            .map(cat => {
              const Icon = CATEGORY_ICON_MAP[cat.slug] || Sparkles
              return (
                <button
                  key={cat.id || cat.slug}
                  onClick={() => onOpenSwapModal(cat.slug)}
                  className="bg-white p-3.5 rounded-2xl border border-[#e8e2d5] hover:border-amber-400 hover:shadow-md transition-all text-left flex flex-col justify-between group hover:-translate-y-1"
                >
                  <div className="w-8 h-8 rounded-lg bg-amber-50 text-[#4a1525] flex items-center justify-center mb-2 group-hover:scale-110 transition-transform border border-amber-200/50">
                    <Icon className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-bold text-xs text-stone-900 group-hover:text-[#4a1525] transition-colors truncate">
                      {cat.name}
                    </div>
                    <div className="text-[10px] text-[#4a1525] mt-1 flex items-center gap-1 font-bold">
                      <Plus className="w-3 h-3 text-amber-600" /> Add Service
                    </div>
                  </div>
                </button>
              )
            })}
        </div>
      </div>

    </div>
  )
}
