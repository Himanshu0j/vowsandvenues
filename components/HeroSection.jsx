'use client'

import React from 'react'
import {
  Sparkles,
  MapPin,
  Calendar,
  Users,
  Search,
  ArrowRight,
  ShieldCheck,
  Crown,
  Compass
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
    headline: "Curating India’s Most Breathtaking Celebrations",
    subheadline: "From illuminated island palaces in Udaipur to authentic Awadhi banquets in Lucknow — discover and book India's most distinguished verified event creators.",
    badge: "The Royal Wedding & Celebration Concierge",
    heroImage: "https://images.unsplash.com/photo-1519741497674-611481863552",
    locationTag: "The Royal Jagmandir Island Palace · Lake Pichola, Udaipur",
    stats: [
      { label: "Verified Heritage Venues & Masters", value: "850+" },
      { label: "Celebrations Curated", value: "14,200+" },
      { label: "Discerning Client Rating", value: "4.98 / 5" },
      { label: "Direct Pricing Guarantee", value: "100%" }
    ]
  }

  // 4K Ultra-HD Indian Royal Palace Celebration Backdrop
  const backdrop4K = getOptimizedImageUrl(
    heroData.heroImage || 'https://images.unsplash.com/photo-1519741497674-611481863552',
    { width: 2560, quality: 85 }
  )

  return (
    <div className="relative w-full overflow-hidden">
      
      {/* ============================================================== */}
      {/* 1. CINEMATIC 4K HERO BANNER (Vibrant, Majestic, Full-Bleed)     */}
      {/* ============================================================== */}
      <section className="relative min-h-[82vh] sm:min-h-[88vh] lg:min-h-[92vh] flex flex-col justify-between py-8 sm:py-12 px-4 sm:px-6 lg:px-8">
        
        {/* 4K Background Photography (High Clarity, Vibrant Warm Tone) */}
        <div 
          className="absolute inset-0 bg-cover bg-center transition-all duration-1000 scale-100"
          style={{ backgroundImage: `url('${backdrop4K}')` }}
        />

        {/* Refined Luxury Editorial Scrim (Preserves Vibrant Palace Lights & Color) */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#14060b] via-[#1a070f]/45 to-black/30" />
        <div className="absolute inset-0 bg-radial-at-c from-transparent via-[#120509]/30 to-[#120509]/75" />

        {/* Top Champagne Gold Accent Border */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#e6ca65] to-transparent opacity-90" />

        {/* TOP STATUS / LOCATION PILL */}
        <div className="relative z-10 max-w-6xl mx-auto w-full flex items-center justify-between text-white/90 pt-2">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-black/40 backdrop-blur-md border border-amber-300/30 text-amber-200 text-[11px] font-semibold tracking-wide shadow-md">
            <Crown className="w-3.5 h-3.5 text-amber-300 shrink-0" />
            <span>{heroData.badge || "The Royal Wedding & Celebration Concierge"}</span>
          </div>

          <div className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/40 backdrop-blur-md border border-white/15 text-stone-200 text-[11px] font-medium">
            <MapPin className="w-3.5 h-3.5 text-amber-300" />
            <span>{heroData.locationTag || "Jagmandir Island Palace · Udaipur"}</span>
          </div>
        </div>

        {/* CENTER TYPOGRAPHY & EDITORIAL STATEMENTS */}
        <div className="relative max-w-5xl mx-auto w-full text-center z-10 my-auto py-6 sm:py-8">
          
          {/* Master Headline with Gold Shimmer Italic */}
          <h1 className="font-serif text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight text-white mb-4 leading-[1.1] drop-shadow-lg">
            Curating India’s Most <br className="hidden sm:inline" />
            <span className="italic font-normal text-amber-200 drop-shadow-[0_2px_15px_rgba(230,202,101,0.4)]">
              Breathtaking Celebrations
            </span>
          </h1>

          {/* Editorial Subtitle */}
          <p className="max-w-2xl mx-auto text-xs sm:text-sm md:text-base text-amber-50/95 font-light mb-6 sm:mb-8 leading-relaxed drop-shadow px-2">
            {heroData.subheadline}
          </p>

          {/* Quick Metrics Strip */}
          <div className="inline-flex flex-wrap items-center justify-center gap-4 sm:gap-8 px-6 py-2.5 rounded-full bg-black/45 backdrop-blur-md border border-amber-300/25 text-amber-100 text-xs shadow-lg">
            <div className="flex items-center gap-2">
              <span className="font-serif font-bold text-amber-300 text-sm sm:text-base">850+</span>
              <span className="text-stone-300 text-[11px]">Verified Masters</span>
            </div>
            <span className="w-1 h-1 rounded-full bg-amber-400 hidden sm:inline-block" />
            <div className="flex items-center gap-2">
              <span className="font-serif font-bold text-amber-300 text-sm sm:text-base">14,200+</span>
              <span className="text-stone-300 text-[11px]">Celebrations</span>
            </div>
            <span className="w-1 h-1 rounded-full bg-amber-400 hidden sm:inline-block" />
            <div className="flex items-center gap-2">
              <span className="font-serif font-bold text-amber-300 text-sm sm:text-base">4.98 ★</span>
              <span className="text-stone-300 text-[11px]">Client Rating</span>
            </div>
            <span className="w-1 h-1 rounded-full bg-amber-400 hidden sm:inline-block" />
            <div className="flex items-center gap-1.5 text-emerald-300 text-[11px] font-semibold">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Zero Markup Guarantee</span>
            </div>
          </div>
        </div>

        {/* ============================================================== */}
        {/* 2. FLOATING FROSTED-GLASS QUICK DISCOVERY CONSOLE              */}
        {/* Docked neatly inside the hero with high contrast and ease of use */}
        {/* ============================================================== */}
        <div className="relative z-20 max-w-5xl mx-auto w-full pb-2">
          <div className="bg-gradient-to-br from-[#ffffff]/98 via-[#fefdfa]/95 to-[#fbf7f0]/95 backdrop-blur-2xl rounded-2xl sm:rounded-3xl p-3.5 sm:p-5 shadow-[0_25px_60px_rgba(20,5,10,0.35)] border-2 border-amber-300/80 ring-4 ring-amber-400/20 text-stone-900 transition-all">
            
            {/* Inline 4-Field Search Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 mb-3">
              
              {/* Field 1: Event Type */}
              <div className="bg-stone-50/90 hover:bg-white rounded-xl p-2.5 border border-stone-200 hover:border-amber-400 transition-all shadow-2xs">
                <label className="block text-[10px] font-bold text-[#6E2338] uppercase tracking-wider mb-0.5 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-rose-500" />
                  <span>Celebration Type</span>
                </label>
                <select
                  value={heroSearch.eventType}
                  onChange={(e) => setHeroSearch({ ...heroSearch, eventType: e.target.value })}
                  className="w-full bg-transparent font-semibold text-stone-900 text-xs sm:text-sm focus:outline-none cursor-pointer"
                >
                  {eventTypes.map(t => (
                    <option key={t.id} value={t.name}>{t.icon} {t.name}</option>
                  ))}
                </select>
              </div>

              {/* Field 2: Location */}
              <div className="bg-stone-50/90 hover:bg-white rounded-xl p-2.5 border border-stone-200 hover:border-amber-400 transition-all shadow-2xs">
                <label className="block text-[10px] font-bold text-[#6E2338] uppercase tracking-wider mb-0.5 flex items-center gap-1.5">
                  <MapPin className="w-3 h-3 text-amber-600" />
                  <span>Destination City</span>
                </label>
                <select
                  value={heroSearch.city}
                  onChange={(e) => {
                    setHeroSearch({ ...heroSearch, city: e.target.value })
                    setSelectedCity(e.target.value)
                  }}
                  className="w-full bg-transparent font-semibold text-stone-900 text-xs sm:text-sm focus:outline-none cursor-pointer"
                >
                  {cities.filter(c => c !== 'All Cities').map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              {/* Field 3: Event Date */}
              <div className="bg-stone-50/90 hover:bg-white rounded-xl p-2.5 border border-stone-200 hover:border-amber-400 transition-all shadow-2xs">
                <label className="block text-[10px] font-bold text-[#6E2338] uppercase tracking-wider mb-0.5 flex items-center gap-1.5">
                  <Calendar className="w-3 h-3 text-emerald-600" />
                  <span>Event Date</span>
                </label>
                <input
                  type="date"
                  value={heroSearch.date}
                  onChange={(e) => setHeroSearch({ ...heroSearch, date: e.target.value })}
                  className="w-full bg-transparent font-semibold text-stone-900 text-xs sm:text-sm focus:outline-none cursor-pointer"
                />
              </div>

              {/* Field 4: Guests & Target Budget */}
              <div className="bg-stone-50/90 hover:bg-white rounded-xl p-2.5 border border-stone-200 hover:border-amber-400 transition-all shadow-2xs">
                <label className="block text-[10px] font-bold text-[#6E2338] uppercase tracking-wider mb-0.5 flex items-center gap-1.5">
                  <Users className="w-3 h-3 text-purple-600" />
                  <span>Guests &amp; Scale</span>
                </label>
                <select
                  value={heroSearch.guests}
                  onChange={(e) => setHeroSearch({ ...heroSearch, guests: e.target.value })}
                  className="w-full bg-transparent font-semibold text-stone-900 text-xs sm:text-sm focus:outline-none cursor-pointer"
                >
                  <option value="50">50 – 100 Guests (Intimate)</option>
                  <option value="250">200 – 350 Guests (Grand)</option>
                  <option value="500">500 – 800 Guests (Royal)</option>
                  <option value="1200">1000+ Guests (Extravaganza)</option>
                </select>
              </div>

            </div>

            {/* Bottom Actions & Quick Trending Filter Pills */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2.5 border-t border-amber-200/60">
              <div className="flex items-center gap-2 overflow-x-auto no-scrollbar w-full sm:w-auto text-xs py-0.5">
                <span className="font-bold text-stone-800 whitespace-nowrap text-[10px] uppercase tracking-wider">Trending:</span>
                <button
                  type="button"
                  onClick={() => {
                    setHeroSearch({ ...heroSearch, eventType: 'Wedding' })
                    onExploreVendors()
                  }}
                  className="bg-amber-100/90 hover:bg-amber-200 text-amber-900 border border-amber-300 px-2.5 py-0.5 rounded-full whitespace-nowrap font-semibold text-[11px] transition-colors cursor-pointer"
                >
                  🏰 Heritage Palaces
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setHeroSearch({ ...heroSearch, eventType: 'Wedding' })
                    onExploreVendors()
                  }}
                  className="bg-orange-100/90 hover:bg-orange-200 text-orange-900 border border-orange-300 px-2.5 py-0.5 rounded-full whitespace-nowrap font-semibold text-[11px] transition-colors cursor-pointer"
                >
                  🍲 Awadhi Feasts
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setHeroSearch({ ...heroSearch, eventType: 'Sangeet' })
                    onExploreVendors()
                  }}
                  className="bg-rose-100/90 hover:bg-rose-200 text-rose-900 border border-rose-300 px-2.5 py-0.5 rounded-full whitespace-nowrap font-semibold text-[11px] transition-colors cursor-pointer"
                >
                  🌸 Floral Mandaps
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setHeroSearch({ ...heroSearch, eventType: 'Wedding' })
                    onExploreVendors()
                  }}
                  className="bg-sky-100/90 hover:bg-sky-200 text-sky-900 border border-sky-300 px-2.5 py-0.5 rounded-full whitespace-nowrap font-semibold text-[11px] transition-colors cursor-pointer"
                >
                  📸 4K Candid Cinema
                </button>
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button
                  onClick={onExploreVendors}
                  className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl bg-white hover:bg-stone-50 text-stone-800 font-bold text-xs transition-all text-center border border-stone-300 hover:border-amber-500 shadow-2xs active:scale-95 cursor-pointer whitespace-nowrap"
                >
                  Explore Directory
                </button>
                <button
                  onClick={onStartPlanning}
                  className="flex-1 sm:flex-none px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#6E2338] via-[#8E334B] to-[#6E2338] hover:brightness-110 text-amber-100 font-bold text-xs flex items-center justify-center gap-1.5 active:scale-95 shadow-md cursor-pointer whitespace-nowrap"
                >
                  <Search className="w-3.5 h-3.5 text-amber-300" />
                  <span>Search Verified Masters</span>
                </button>
              </div>
            </div>

          </div>
        </div>

      </section>

    </div>
  )
}
