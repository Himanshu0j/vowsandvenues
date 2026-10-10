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

      {/* 2. ELEGANT EDITORIAL OVERLAYS (Rich Royal Emerald & Dark Wine Vignette) */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#0e0c0a] via-[#1a1412]/80 to-[#10241b]/70" />
      <div className="absolute inset-0 bg-radial from-transparent via-[#0e0c0a]/40 to-[#0e0c0a]/85 pointer-events-none" />

      {/* 3D FLOATING CELEBRATION BADGES (Desktop) */}
      <div className="hidden xl:flex absolute left-6 2xl:left-12 top-1/2 -translate-y-1/2 flex-col gap-4 z-20 animate-float-slow pointer-events-none">
        <div className="royal-glass-dark p-4 rounded-2xl shadow-2xl border border-amber-400/30 text-left max-w-[220px] backdrop-blur-md">
          <div className="flex items-center gap-2.5 mb-2">
            <span className="w-8 h-8 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 text-stone-900 flex items-center justify-center text-base shadow-md font-bold">🏰</span>
            <div>
              <div className="text-[10px] font-bold text-amber-300 uppercase tracking-wider">Royal Venues</div>
              <div className="text-xs font-serif font-bold text-white">Udaipur &amp; Jaipur</div>
            </div>
          </div>
          <p className="text-[10.5px] text-stone-300 font-light leading-snug">Heritage Palaces, Forts &amp; Boutique Banquet Resorsts</p>
          <div className="mt-2.5 pt-2 border-t border-white/10 text-[10px] font-semibold text-emerald-400 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span> 100% Direct Date Lock
          </div>
        </div>

        <div className="royal-glass-dark p-3.5 rounded-2xl shadow-xl border border-rose-400/30 text-left max-w-[210px] backdrop-blur-md">
          <div className="flex items-center gap-2">
            <span className="text-lg">🍲</span>
            <span className="text-xs font-serif font-bold text-amber-200">Shahi Awadhi Feasts</span>
          </div>
          <p className="text-[10px] text-stone-300 mt-1">Live Chaat &amp; Galouti Counters</p>
        </div>
      </div>

      <div className="hidden xl:flex absolute right-6 2xl:right-12 top-1/2 -translate-y-1/2 flex-col gap-4 z-20 animate-float-reverse pointer-events-none">
        <div className="royal-glass-dark p-4 rounded-2xl shadow-2xl border border-amber-400/30 text-left max-w-[220px] backdrop-blur-md">
          <div className="flex items-center gap-2.5 mb-2">
            <span className="w-8 h-8 rounded-xl bg-gradient-to-br from-rose-500 to-pink-600 text-white flex items-center justify-center text-base shadow-md font-bold">💍</span>
            <div>
              <div className="text-[10px] font-bold text-amber-300 uppercase tracking-wider">14,200+ Celebrations</div>
              <div className="text-xs font-serif font-bold text-white">Curated in India</div>
            </div>
          </div>
          <div className="flex items-center gap-1.5 mt-1">
            <div className="flex text-amber-400 text-xs">★★★★★</div>
            <span className="text-[10.5px] text-white font-bold">4.95 / 5 Rating</span>
          </div>
          <div className="mt-2.5 pt-2 border-t border-white/10 text-[10px] font-semibold text-amber-300 flex items-center gap-1">
            <span>🛡️</span> Verified Quality Creators
          </div>
        </div>

        <div className="royal-glass-dark p-3.5 rounded-2xl shadow-xl border border-indigo-400/30 text-left max-w-[210px] backdrop-blur-md">
          <div className="flex items-center gap-2">
            <span className="text-lg">📸</span>
            <span className="text-xs font-serif font-bold text-amber-200">4K Drone &amp; Cinema</span>
          </div>
          <p className="text-[10px] text-stone-300 mt-1">Candid Master Storytellers</p>
        </div>
      </div>

      {/* 3. HERO CONTENT WRAPPER */}
      <div className="relative max-w-5xl mx-auto w-full text-center z-10">
        
        {/* Editorial Eyebrow Tag */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-amber-950/60 via-[#4a1525]/70 to-amber-950/60 border border-amber-400/40 text-amber-200 text-xs sm:text-[13px] font-medium mb-4 sm:mb-6 tracking-wide backdrop-blur-md shadow-lg animate-pulse-glow">
          <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0" />
          <span className="truncate max-w-[280px] sm:max-w-none">{heroData.badge || "India's Premier Luxury Wedding & Event Concierge"}</span>
        </div>

        {/* Master Headline */}
        <h1 className="font-serif text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight text-white mb-4 sm:mb-6 leading-[1.15] drop-shadow-md">
          Plan Your Perfect Celebration, <br className="hidden sm:inline" />
          <span className="gold-shimmer italic font-normal">All in One Place</span>
        </h1>

        {/* Subtitle */}
        <p className="max-w-2xl mx-auto text-sm sm:text-base md:text-lg text-amber-100/90 font-light mb-8 sm:mb-10 leading-relaxed drop-shadow px-2">
          {heroData.subheadline}
        </p>

        {/* 4. LUXURY 3D MULTI-FIELD DISCOVERY SEARCH BOX */}
        <div className="bg-gradient-to-br from-[#fffdf9]/95 via-[#fefaf2]/95 to-[#faf2e4]/95 backdrop-blur-xl rounded-3xl p-4 sm:p-7 shadow-[0_25px_60px_rgba(0,0,0,0.35)] border-2 border-amber-400/80 ring-4 ring-amber-400/20 text-stone-900 text-left max-w-4xl mx-auto transition-all card-3d-hover">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2.5 sm:gap-3 mb-4">
            
            {/* Field 1: Event Type */}
            <div className="bg-gradient-to-br from-rose-50 to-pink-100/60 rounded-2xl p-2.5 sm:p-3 border-2 border-rose-200 hover:border-rose-400 transition-all shadow-xs">
              <label className="block text-[10px] sm:text-[11px] font-bold text-[#4a1525] uppercase tracking-wider mb-1 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-rose-500"></span> Event Type
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
            <div className="bg-gradient-to-br from-amber-50 to-yellow-100/60 rounded-2xl p-2.5 sm:p-3 border-2 border-amber-200 hover:border-amber-400 transition-all shadow-xs">
              <label className="block text-[10px] sm:text-[11px] font-bold text-[#4a1525] uppercase tracking-wider mb-1 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-amber-500"></span> City Location
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
            <div className="bg-gradient-to-br from-emerald-50 to-teal-100/60 rounded-2xl p-2.5 sm:p-3 border-2 border-emerald-200 hover:border-emerald-400 transition-all shadow-xs">
              <label className="block text-[10px] sm:text-[11px] font-bold text-[#4a1525] uppercase tracking-wider mb-1 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span> Event Date
              </label>
              <input
                type="date"
                value={heroSearch.date}
                onChange={(e) => setHeroSearch({ ...heroSearch, date: e.target.value })}
                className="w-full bg-transparent font-semibold text-stone-800 text-sm focus:outline-none cursor-pointer py-0.5"
              />
            </div>

            {/* Field 4: Guest Count */}
            <div className="bg-gradient-to-br from-sky-50 to-blue-100/60 rounded-2xl p-2.5 sm:p-3 border-2 border-sky-200 hover:border-sky-400 transition-all shadow-xs">
              <label className="block text-[10px] sm:text-[11px] font-bold text-[#4a1525] uppercase tracking-wider mb-1 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-blue-500"></span> Guest Count
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
            <div className="bg-gradient-to-br from-purple-50 to-fuchsia-100/60 rounded-2xl p-2.5 sm:p-3 border-2 border-purple-200 hover:border-purple-400 transition-all shadow-xs">
              <label className="block text-[10px] sm:text-[11px] font-bold text-[#4a1525] uppercase tracking-wider mb-1 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-purple-500"></span> Target Budget
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

          {/* Primary & Secondary Action CTAs with Colorful Chips */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3.5 border-t border-stone-200">
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar w-full sm:w-auto text-xs py-1">
              <span className="font-bold text-stone-900 whitespace-nowrap text-[11px] uppercase tracking-wider">Trending:</span>
              <span className="bg-amber-100 text-amber-900 border border-amber-300 px-3 py-1 rounded-full whitespace-nowrap font-semibold text-[11px] flex items-center gap-1 shadow-sm">
                🏰 Heritage Palaces
              </span>
              <span className="bg-orange-100 text-orange-900 border border-orange-300 px-3 py-1 rounded-full whitespace-nowrap font-semibold text-[11px] flex items-center gap-1 shadow-sm">
                🍲 Awadhi Feasts
              </span>
              <span className="bg-rose-100 text-rose-900 border border-rose-300 px-3 py-1 rounded-full whitespace-nowrap font-semibold text-[11px] flex items-center gap-1 shadow-sm">
                🌸 Floral Mandaps
              </span>
              <span className="bg-sky-100 text-sky-900 border border-sky-300 px-3 py-1 rounded-full whitespace-nowrap font-semibold text-[11px] flex items-center gap-1 shadow-sm">
                📸 Candid Cinema
              </span>
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              <button
                onClick={onExploreVendors}
                className="flex-1 sm:flex-none px-5 sm:px-6 py-2.5 sm:py-3 rounded-full bg-white hover:bg-stone-50 text-stone-800 font-bold text-xs sm:text-sm transition-all text-center border-2 border-stone-300 hover:border-amber-500 shadow-sm active:scale-95"
              >
                Explore All Creators
              </button>
              <button
                onClick={onStartPlanning}
                className="flex-1 sm:flex-none px-6 sm:px-8 py-2.5 sm:py-3 rounded-full btn-3d-wine text-amber-100 font-bold text-xs sm:text-sm flex items-center justify-center gap-2 active:scale-95"
              >
                <span>Build My Event</span>
                <ArrowRight className="w-4 h-4 text-amber-300" />
              </button>
            </div>
          </div>
        </div>

        {/* 5. 3D TRUST SIGNALS & PROOF TILES */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mt-8 sm:mt-10 max-w-4xl mx-auto text-left">
          {(heroData.stats || []).map((s, idx) => (
            <div 
              key={idx} 
              className="royal-glass-dark rounded-2xl p-3.5 sm:p-4 border border-amber-400/25 shadow-xl hover:-translate-y-1 transition-transform duration-300"
            >
              <div className="font-serif text-2xl sm:text-3xl font-bold gold-shimmer">{s.value}</div>
              <div className="text-[11px] sm:text-xs text-amber-100/90 mt-0.5 font-medium">{s.label}</div>
            </div>
          ))}
        </div>

      </div>
    </section>
  )
}
