'use client'

import {
  Sparkles,
  MapPin,
  Calendar,
  Users,
  DollarSign,
  ArrowRight,
  ShieldCheck,
  Award,
  CheckCircle2,
  Clock
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

  const optimizedHeroBg = getOptimizedImageUrl(heroData.heroImage, { width: 1400, quality: 80 })

  return (
    <section className="relative min-h-[580px] sm:min-h-[640px] lg:min-h-[700px] flex items-center justify-center overflow-hidden py-12 sm:py-20 px-3.5 sm:px-6 lg:px-8">
      {/* 1. CINEMATIC BACKGROUND PHOTOGRAPHY */}
      <div 
        className="absolute inset-0 bg-cover bg-center transition-all duration-700 scale-100"
        style={{ backgroundImage: `url('${optimizedHeroBg}')` }}
      />

      {/* 2. ELEGANT EDITORIAL OVERLAYS (Warm dark chocolate & vignette, no neon glow) */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#141210] via-[#1c1917]/80 to-[#1c1917]/60" />
      <div className="absolute inset-0 bg-radial from-transparent via-[#141210]/40 to-[#141210]/80 pointer-events-none" />

      {/* 3. HERO CONTENT WRAPPER */}
      <div className="relative max-w-5xl mx-auto w-full text-center z-10">
        
        {/* Editorial Eyebrow Tag */}
        <div className="inline-flex items-center gap-2 px-3.5 sm:px-4 py-1.5 rounded-full bg-[#f5ebd7]/15 border border-[#c5a059]/40 text-[#e8d08d] text-xs sm:text-[13px] font-medium mb-4 sm:mb-6 tracking-wide backdrop-blur-md">
          <Sparkles className="w-3.5 h-3.5 text-[#c5a059] shrink-0" />
          <span className="truncate max-w-[280px] sm:max-w-none">{heroData.badge || "India's Premier Luxury Wedding & Event Concierge"}</span>
        </div>

        {/* Master Headline */}
        <h1 className="font-serif text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight text-white mb-4 sm:mb-6 leading-[1.15]">
          Plan Your Perfect Celebration, <br className="hidden sm:inline" />
          <span className="gold-shimmer italic font-normal">All in One Place</span>
        </h1>

        {/* Subtitle */}
        <p className="max-w-2xl mx-auto text-sm sm:text-base md:text-lg text-[#e7e2d8] font-light mb-8 sm:mb-10 leading-relaxed drop-shadow-sm px-2">
          {heroData.subheadline}
        </p>

        {/* 4. LUXURY MULTI-FIELD DISCOVERY SEARCH BOX */}
        <div className="bg-[#ffffff]/98 backdrop-blur-xl rounded-3xl p-3.5 sm:p-6 shadow-2xl border border-[#e8e2d5] text-[#1c1917] text-left max-w-4xl mx-auto transition-all">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2.5 sm:gap-3 mb-4">
            
            {/* Field 1: Event Type */}
            <div className="bg-[#faf8f5] rounded-2xl p-2.5 sm:p-3 border border-[#e8e2d5] hover:border-[#c5a059] transition-colors">
              <label className="block text-[10px] sm:text-[11px] font-bold text-[#4a1525] uppercase tracking-wider mb-1 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-[#c5a059]" /> Event Type
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
            <div className="bg-[#faf8f5] rounded-2xl p-2.5 sm:p-3 border border-[#e8e2d5] hover:border-[#c5a059] transition-colors">
              <label className="block text-[10px] sm:text-[11px] font-bold text-[#4a1525] uppercase tracking-wider mb-1 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-[#c5a059]" /> City Location
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
            <div className="bg-[#faf8f5] rounded-2xl p-2.5 sm:p-3 border border-[#e8e2d5] hover:border-[#c5a059] transition-colors">
              <label className="block text-[10px] sm:text-[11px] font-bold text-[#4a1525] uppercase tracking-wider mb-1 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-[#c5a059]" /> Event Date
              </label>
              <input
                type="date"
                value={heroSearch.date}
                onChange={(e) => setHeroSearch({ ...heroSearch, date: e.target.value })}
                className="w-full bg-transparent font-semibold text-stone-800 text-sm focus:outline-none cursor-pointer py-0.5"
              />
            </div>

            {/* Field 4: Guest Count */}
            <div className="bg-[#faf8f5] rounded-2xl p-2.5 sm:p-3 border border-[#e8e2d5] hover:border-[#c5a059] transition-colors">
              <label className="block text-[10px] sm:text-[11px] font-bold text-[#4a1525] uppercase tracking-wider mb-1 flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-[#c5a059]" /> Guest Count
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
            <div className="bg-[#faf8f5] rounded-2xl p-2.5 sm:p-3 border border-[#e8e2d5] hover:border-[#c5a059] transition-colors">
              <label className="block text-[10px] sm:text-[11px] font-bold text-[#4a1525] uppercase tracking-wider mb-1 flex items-center gap-1.5">
                <DollarSign className="w-3.5 h-3.5 text-[#c5a059]" /> Target Budget
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

          {/* Primary & Secondary Action CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-[#f0eae1]">
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar w-full sm:w-auto text-xs text-[#78716c] py-1">
              <span className="font-semibold text-[#1c1917] whitespace-nowrap">Trending Categories:</span>
              <span className="bg-[#f2ede4] text-[#44403c] px-3 py-1 rounded-full whitespace-nowrap font-medium text-[11px]">Heritage Palaces</span>
              <span className="bg-[#f2ede4] text-[#44403c] px-3 py-1 rounded-full whitespace-nowrap font-medium text-[11px]">Awadhi Feasts</span>
              <span className="bg-[#f2ede4] text-[#44403c] px-3 py-1 rounded-full whitespace-nowrap font-medium text-[11px]">Floral Mandaps</span>
            </div>

            <div className="flex items-center gap-2.5 w-full sm:w-auto">
              <button
                onClick={onExploreVendors}
                className="flex-1 sm:flex-none px-5 sm:px-6 py-2.5 sm:py-3 rounded-full bg-[#f2ede4] hover:bg-[#e7e0d3] text-[#1c1917] font-semibold text-xs sm:text-sm transition-colors text-center border border-[#dfd7c8]"
              >
                Explore Vendors
              </button>
              <button
                onClick={onStartPlanning}
                className="flex-1 sm:flex-none px-6 sm:px-7 py-2.5 sm:py-3 rounded-full bg-[#4a1525] hover:bg-[#3b101d] text-[#f5ebd7] font-bold text-xs sm:text-sm shadow-lg flex items-center justify-center gap-2 border border-[#5c1d2e] active:scale-95 transition-all"
              >
                <span>Build My Event</span>
                <ArrowRight className="w-4 h-4 text-[#c5a059]" />
              </button>
            </div>
          </div>
        </div>

        {/* 5. TRUST SIGNALS & PROOF TILES */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 sm:gap-4 mt-8 sm:mt-10 max-w-4xl mx-auto text-left">
          {(heroData.stats || []).map((s, idx) => (
            <div key={idx} className="bg-white/10 backdrop-blur-md rounded-2xl p-3 sm:p-4 border border-white/15">
              <div className="font-serif text-xl sm:text-3xl font-bold text-[#e8d08d]">{s.value}</div>
              <div className="text-[10px] sm:text-xs text-[#e7e2d8] mt-0.5 font-medium">{s.label}</div>
            </div>
          ))}
        </div>

      </div>
    </section>
  )
}
