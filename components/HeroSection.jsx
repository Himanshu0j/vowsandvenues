'use client'

import React from 'react'
import {
  Sparkles,
  MapPin,
  Calendar,
  Users,
  DollarSign,
  ArrowRight,
  ShieldCheck,
  Search,
  CheckCircle2,
  Crown
} from 'lucide-react'
import { getOptimizedImageUrl } from '@/lib/imageUtils'

export default function HeroSection({
  cmsContent,
  heroSearch,
  setHeroSearch,
  selectedCity,
  setSelectedCity,
  eventTypes = [],
  cities = [],
  onExploreVendors,
  onStartPlanning
}) {
  const heroData = cmsContent?.hero || {
    headline: "Plan Your Perfect Celebration, All in One Place",
    subheadline: "From royal heritage palaces in Udaipur to authentic Awadhi banquets in Lucknow, discover and book India's most distinguished verified event creators.",
    badge: "India's Premier Luxury Wedding & Event Concierge",
    heroImage: "https://images.unsplash.com/photo-1519741497674-611481863552",
    stats: [
      { label: "Verified Venues & Artists", value: "850+" },
      { label: "Celebrations Curated", value: "14,200+" },
      { label: "Client Satisfaction", value: "4.95 / 5" },
      { label: "Direct Pricing Guarantee", value: "100%" }
    ]
  }

  // 4K Ultra-HD Indian Wedding Mandap Backdrop
  const backdrop4K = getOptimizedImageUrl(
    heroData.heroImage || 'https://images.unsplash.com/photo-1519741497674-611481863552',
    { width: 2400, quality: 85 }
  )

  return (
    <div className="relative w-full">
      
      {/* ============================================================== */}
      {/* 1. CINEMATIC 4K HERO BANNER (Clean, Majestic, Uncluttered)     */}
      {/* ============================================================== */}
      <section className="relative min-h-[500px] sm:min-h-[560px] lg:min-h-[600px] flex items-center justify-center overflow-hidden py-16 sm:py-20 px-4 sm:px-6 lg:px-8">
        
        {/* 4K Background Photography */}
        <div 
          className="absolute inset-0 bg-cover bg-center transition-all duration-1000 scale-100"
          style={{ backgroundImage: `url('${backdrop4K}')` }}
        />

        {/* Multi-tier Royal Wine & Deep Emerald Editorial Overlays */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#12070b] via-[#1a0810]/75 to-[#0b1611]/60" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#12070b]/80 via-transparent to-[#12070b]/80" />

        {/* Ambient Gold Sheen */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-amber-400 to-transparent opacity-80" />

        {/* HERO TYPOGRAPHY & TRUST STRIP */}
        <div className="relative max-w-5xl mx-auto w-full text-center z-10">
          
          {/* Eyebrow Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-amber-950/70 via-[#4a1525]/80 to-amber-950/70 border border-amber-400/50 text-amber-200 text-xs sm:text-[13px] font-medium mb-5 tracking-wide backdrop-blur-md shadow-lg">
            <Crown className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span className="truncate max-w-[280px] sm:max-w-none">
              {heroData.badge || "India's Premier Luxury Wedding & Event Concierge"}
            </span>
          </div>

          {/* Master Headline */}
          <h1 className="font-serif text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight text-white mb-4 leading-[1.12] drop-shadow-md">
            Plan Your Perfect Celebration, <br className="hidden sm:inline" />
            <span className="gold-shimmer italic font-normal">All in One Place</span>
          </h1>

          {/* Subtitle */}
          <p className="max-w-2xl mx-auto text-xs sm:text-sm md:text-base text-amber-100/90 font-light mb-8 leading-relaxed drop-shadow px-2">
            {heroData.subheadline}
          </p>

          {/* Hero CTAs */}
          <div className="flex flex-wrap items-center justify-center gap-3.5 mb-10">
            <button
              onClick={onExploreVendors}
              className="btn-3d-wine px-6 sm:px-8 py-3 rounded-full text-amber-100 font-bold text-xs sm:text-sm uppercase tracking-wider flex items-center gap-2 shadow-xl hover:scale-105 active:scale-95 cursor-pointer"
            >
              <span>Explore Verified Directory</span>
              <ArrowRight className="w-4 h-4 text-amber-300" />
            </button>
            <button
              onClick={onStartPlanning}
              className="px-6 sm:px-7 py-3 rounded-full bg-white/10 hover:bg-white/20 text-white font-bold text-xs sm:text-sm tracking-wider border border-amber-300/40 backdrop-blur-md transition-all hover:scale-105 active:scale-95 cursor-pointer"
            >
              Build 5-Service Event
            </button>
          </div>

          {/* 4 Trust Metrics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 max-w-3xl mx-auto">
            {(heroData.stats || []).map((s, idx) => (
              <div 
                key={idx} 
                className="royal-glass-dark rounded-xl p-3 border border-amber-400/30 shadow-lg text-center backdrop-blur-md"
              >
                <div className="font-serif text-xl sm:text-2xl font-bold gold-shimmer">{s.value}</div>
                <div className="text-[10px] sm:text-[11px] text-amber-100/80 mt-0.5 font-medium">{s.label}</div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* ============================================================== */}
      {/* 2. DEDICATED QUICK DISCOVERY SEARCH CONSOLE                    */}
      {/* Positioned cleanly below the hero banner with breathing room  */}
      {/* ============================================================== */}
      <section className="relative z-20 -mt-10 sm:-mt-12 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-br from-[#fffdf9] via-[#fefaf2] to-[#faf2e4] rounded-3xl p-5 sm:p-7 shadow-[0_20px_50px_rgba(74,21,37,0.18)] border-2 border-amber-400/80 ring-4 ring-amber-400/20 text-stone-900 transition-all">
          
          {/* Header Title inside Search Box */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3.5 mb-4 border-b border-amber-200/80 gap-2">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse" />
              <h2 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-[#4a1525]">
                Quick Event Discovery &amp; Date Availability
              </h2>
            </div>
            <div className="text-[11px] font-semibold text-stone-600 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Direct Date Lock &bull; Zero Hidden Markups</span>
            </div>
          </div>

          {/* 5 Input Fields Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 mb-4">
            
            {/* Field 1: Event Type */}
            <div className="bg-white/90 rounded-2xl p-2.5 sm:p-3 border-2 border-amber-200/90 hover:border-amber-400 transition-all shadow-xs">
              <label className="block text-[10px] sm:text-[11px] font-bold text-[#4a1525] uppercase tracking-wider mb-1 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-rose-500" /> Event Type
              </label>
              <select
                value={heroSearch.eventType}
                onChange={(e) => setHeroSearch({ ...heroSearch, eventType: e.target.value })}
                className="w-full bg-transparent font-semibold text-stone-800 text-sm focus:outline-none cursor-pointer py-1"
              >
                {eventTypes.map(t => (
                  <option key={t.id} value={t.name}>{t.icon} {t.name}</option>
                ))}
              </select>
            </div>

            {/* Field 2: Location */}
            <div className="bg-white/90 rounded-2xl p-2.5 sm:p-3 border-2 border-amber-200/90 hover:border-amber-400 transition-all shadow-xs">
              <label className="block text-[10px] sm:text-[11px] font-bold text-[#4a1525] uppercase tracking-wider mb-1 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-amber-500" /> City Location
              </label>
              <select
                value={heroSearch.city}
                onChange={(e) => {
                  setHeroSearch({ ...heroSearch, city: e.target.value })
                  setSelectedCity(e.target.value)
                }}
                className="w-full bg-transparent font-semibold text-stone-800 text-sm focus:outline-none cursor-pointer py-1"
              >
                {cities.filter(c => c !== 'All Cities').map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            {/* Field 3: Event Date */}
            <div className="bg-white/90 rounded-2xl p-2.5 sm:p-3 border-2 border-amber-200/90 hover:border-amber-400 transition-all shadow-xs">
              <label className="block text-[10px] sm:text-[11px] font-bold text-[#4a1525] uppercase tracking-wider mb-1 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500" /> Event Date
              </label>
              <input
                type="date"
                value={heroSearch.date}
                onChange={(e) => setHeroSearch({ ...heroSearch, date: e.target.value })}
                className="w-full bg-transparent font-semibold text-stone-800 text-sm focus:outline-none cursor-pointer py-0.5"
              />
            </div>

            {/* Field 4: Guest Count */}
            <div className="bg-white/90 rounded-2xl p-2.5 sm:p-3 border-2 border-amber-200/90 hover:border-amber-400 transition-all shadow-xs">
              <label className="block text-[10px] sm:text-[11px] font-bold text-[#4a1525] uppercase tracking-wider mb-1 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-blue-500" /> Guest Count
              </label>
              <select
                value={heroSearch.guests}
                onChange={(e) => setHeroSearch({ ...heroSearch, guests: e.target.value })}
                className="w-full bg-transparent font-semibold text-stone-800 text-sm focus:outline-none cursor-pointer py-1"
              >
                <option value="50">50 – 100 Guests (Intimate)</option>
                <option value="250">200 – 350 Guests (Grand)</option>
                <option value="500">500 – 800 Guests (Royal)</option>
                <option value="1200">1000+ Guests (Extravaganza)</option>
              </select>
            </div>

            {/* Field 5: Target Budget */}
            <div className="bg-white/90 rounded-2xl p-2.5 sm:p-3 border-2 border-amber-200/90 hover:border-amber-400 transition-all shadow-xs">
              <label className="block text-[10px] sm:text-[11px] font-bold text-[#4a1525] uppercase tracking-wider mb-1 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-purple-500" /> Target Budget
              </label>
              <select
                value={heroSearch.budget}
                onChange={(e) => setHeroSearch({ ...heroSearch, budget: e.target.value })}
                className="w-full bg-transparent font-semibold text-stone-800 text-sm focus:outline-none cursor-pointer py-1"
              >
                <option value="100000">₹1,00,000 (Pocket Friendly)</option>
                <option value="250000">₹2,50,000 (Celebration)</option>
                <option value="500000">₹5,00,000 (Premium Wedding)</option>
                <option value="1200000">₹12,00,000+ (Royal Palace)</option>
              </select>
            </div>
          </div>

          {/* Action CTAs with Trending Chips */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3.5 border-t border-amber-200/80">
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar w-full sm:w-auto text-xs py-1">
              <span className="font-bold text-stone-900 whitespace-nowrap text-[11px] uppercase tracking-wider">Trending:</span>
              <span className="bg-amber-100 text-amber-900 border border-amber-300 px-3 py-1 rounded-full whitespace-nowrap font-semibold text-[11px] flex items-center gap-1 shadow-xs">
                🏰 Heritage Palaces
              </span>
              <span className="bg-orange-100 text-orange-900 border border-orange-300 px-3 py-1 rounded-full whitespace-nowrap font-semibold text-[11px] flex items-center gap-1 shadow-xs">
                🍲 Awadhi Feasts
              </span>
              <span className="bg-rose-100 text-rose-900 border border-rose-300 px-3 py-1 rounded-full whitespace-nowrap font-semibold text-[11px] flex items-center gap-1 shadow-xs">
                🌸 Floral Mandaps
              </span>
              <span className="bg-sky-100 text-sky-900 border border-sky-300 px-3 py-1 rounded-full whitespace-nowrap font-semibold text-[11px] flex items-center gap-1 shadow-xs">
                📸 Candid Cinema
              </span>
            </div>

            <div className="flex items-center gap-2.5 w-full sm:w-auto">
              <button
                onClick={onExploreVendors}
                className="flex-1 sm:flex-none px-5 py-2.5 rounded-xl bg-white hover:bg-stone-50 text-stone-800 font-bold text-xs sm:text-sm transition-all text-center border-2 border-stone-300 hover:border-amber-500 shadow-xs active:scale-95 cursor-pointer"
              >
                Explore All Creators
              </button>
              <button
                onClick={onStartPlanning}
                className="flex-1 sm:flex-none px-6 py-2.5 rounded-xl btn-3d-wine text-amber-100 font-bold text-xs sm:text-sm flex items-center justify-center gap-2 active:scale-95 shadow-md cursor-pointer hover:brightness-110"
              >
                <span>Build My Event</span>
                <ArrowRight className="w-4 h-4 text-amber-300" />
              </button>
            </div>
          </div>

        </div>
      </section>

    </div>
  )
}
