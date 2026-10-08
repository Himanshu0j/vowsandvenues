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
      <div className="bg-[#ffffff] rounded-3xl p-4 sm:p-6 lg:p-8 border border-[#e8e2d5] shadow-sm relative overflow-hidden">
        {/* Top gold accent line */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#4a1525] via-[#c5a059] to-[#4a1525]" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-8">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#ebd8de] text-[#4a1525] text-xs font-bold uppercase tracking-wider mb-2">
              <Sparkles className="w-3.5 h-3.5" /> Event Builder Studio
            </div>
            <h1 className="font-serif text-2xl sm:text-3xl md:text-4xl font-bold text-[#1c1917]">
              {activeEvent.name}
            </h1>
            <div className="flex flex-wrap items-center gap-4 text-xs sm:text-sm text-[#78716c] mt-2">
              <span className="flex items-center gap-1">
                <Calendar className="w-4 h-4 text-[#4a1525]" />
                {activeEvent.date || 'December 15, 2026'}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <MapPin className="w-4 h-4 text-[#4a1525]" />
                {activeEvent.city || 'Lucknow'}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Users className="w-4 h-4 text-[#4a1525]" />
                {activeEvent.guestCount || 250} Guests
              </span>
            </div>
          </div>

          {/* Quick Action CTAs */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 sm:gap-3 w-full sm:w-auto">
            <button
              onClick={onOpenQuotationModal}
              className="px-4 py-2.5 rounded-full bg-[#f2ede4] hover:bg-[#eae3d7] text-[#1c1917] text-xs font-semibold border border-[#dfd7c8] flex items-center justify-center gap-1.5 transition-colors"
            >
              <Download className="w-4 h-4 text-[#4a1525]" /> Export Quote
            </button>
            <button
              onClick={onProceedToBooking}
              className="px-6 py-2.5 rounded-full bg-[#4a1525] hover:bg-[#3d111e] text-[#f5ebd7] text-xs font-bold shadow-md flex items-center justify-center gap-1.5 transition-colors"
            >
              <span>Book All Services</span>
              <ArrowRight className="w-4 h-4 text-[#c5a059]" />
            </button>
          </div>
        </div>

        {/* 2. THE LIVE BUDGET PROGRESS LEDGER */}
        <div className="bg-[#faf8f5] rounded-2xl p-4 sm:p-6 border border-[#e8e2d5] space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <div className="text-[11px] font-bold uppercase tracking-wider text-stone-500">Target Budget</div>
              <div className="font-serif text-2xl font-bold text-[#1c1917] mt-1">
                ₹{targetBudget.toLocaleString('en-IN')}
              </div>
            </div>

            <div>
              <div className="text-[11px] font-bold uppercase tracking-wider text-stone-500">Allocated Services</div>
              <div className="font-serif text-2xl font-bold text-[#4a1525] mt-1">
                ₹{committedTotal.toLocaleString('en-IN')}
              </div>
            </div>

            <div>
              <div className="text-[11px] font-bold uppercase tracking-wider text-stone-500">
                {isOverBudget ? 'Budget Exceeded By' : 'Remaining Budget'}
              </div>
              <div className={`font-serif text-2xl font-bold mt-1 ${isOverBudget ? 'text-rose-600' : 'text-emerald-700'}`}>
                {isOverBudget ? `+ ₹${Math.abs(remainingBudget).toLocaleString('en-IN')}` : `₹${remainingBudget.toLocaleString('en-IN')}`}
              </div>
            </div>
          </div>

          {/* Visual Progress Bar */}
          <div>
            <div className="flex items-center justify-between text-xs text-[#78716c] mb-1.5">
              <span>Allocation Progress: {budgetMetrics?.count || 0} Categories Selected</span>
              <span className="font-bold text-[#1c1917]">{percentUsed}% Allocated</span>
            </div>
            <div className="w-full h-3 rounded-full bg-[#e8e2d5] overflow-hidden">
              <div
                className={`h-full transition-all duration-500 ${isOverBudget ? 'bg-rose-500' : 'bg-[#4a1525]'}`}
                style={{ width: `${percentUsed}%` }}
              />
            </div>
          </div>

          {/* Over Budget Alert */}
          {isOverBudget && (
            <div className="flex items-center gap-2 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs">
              <AlertTriangle className="w-4 h-4 shrink-0" />
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
          <h2 className="font-serif text-xl sm:text-2xl font-bold text-[#1c1917]">
            Event Line Items ({activeEvent.selectedServices?.length || 0})
          </h2>
          <span className="text-xs text-stone-500">Swap or adjust services individually</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {(activeEvent.selectedServices || []).map((service, index) => {
            const Icon = CATEGORY_ICON_MAP[service.category] || Sparkles
            return (
              <div
                key={index}
                className="bg-white rounded-2xl p-5 border border-[#e8e2d5] shadow-sm flex flex-col justify-between hover:border-[#c5a059] transition-all"
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-xl bg-[#faf8f5] text-[#4a1525] flex items-center justify-center border border-[#e8e2d5]">
                        <Icon className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-stone-500">
                          {service.categoryName || service.category}
                        </span>
                        <h3 className="font-serif font-bold text-base text-[#1c1917]">
                          {service.vendorName}
                        </h3>
                      </div>
                    </div>

                    <span className="font-serif font-bold text-base text-[#4a1525]">
                      ₹{service.price?.toLocaleString('en-IN')}
                    </span>
                  </div>

                  {service.packageName && (
                    <div className="text-xs text-stone-600 bg-[#faf8f5] px-3 py-1.5 rounded-lg border border-[#f0eae1] mb-3">
                      Package: <span className="font-semibold text-stone-900">{service.packageName}</span>
                    </div>
                  )}
                </div>

                <div className="pt-3 border-t border-[#f5f2eb] flex items-center justify-between text-xs">
                  <button
                    onClick={() => onOpenSwapModal(service.category)}
                    className="text-[#4a1525] hover:underline font-semibold flex items-center gap-1"
                  >
                    <RefreshCw className="w-3.5 h-3.5" /> Swap Vendor
                  </button>

                  <button
                    onClick={() => onRemoveService(service.category)}
                    className="text-stone-400 hover:text-rose-600 transition-colors p-1"
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
      <div className="bg-[#faf8f5] rounded-3xl p-6 sm:p-8 border border-[#e8e2d5]">
        <h3 className="font-serif font-bold text-lg text-[#1c1917] mb-4">
          Add Remaining Specializations to Your Event
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
                  className="bg-white p-3 rounded-2xl border border-[#e8e2d5] hover:border-[#c5a059] hover:shadow-md transition-all text-left flex flex-col justify-between group"
                >
                  <div className="w-8 h-8 rounded-lg bg-[#faf8f5] text-[#4a1525] flex items-center justify-center mb-2">
                    <Icon className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-bold text-xs text-stone-900 group-hover:text-[#4a1525] transition-colors truncate">
                      {cat.name}
                    </div>
                    <div className="text-[10px] text-stone-500 mt-0.5 flex items-center gap-1 font-semibold text-[#4a1525]">
                      <Plus className="w-3 h-3" /> Add Service
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
