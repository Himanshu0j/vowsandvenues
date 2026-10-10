'use client'

import React, { useState, useEffect } from 'react'
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
  Clock,
  Star,
  Search
} from 'lucide-react'
import { getOptimizedImageUrl } from '@/lib/imageUtils'
import { MaharajaSittingMascot } from './CartoonMascots'

const DYNAMIC_HIGHLIGHTS = [
  'ALL IN ONE ROYAL PLACE',
  'HERITAGE FORTS & PALACES',
  'AUTHENTIC SHAHI AWADHI FEASTS',
  'CANDID 4K DRONE FILMS',
  'ROYAL FLORAL MANDAP DECOR'
]

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
  const [highlightIdx, setHighlightIdx] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => {
      setHighlightIdx(prev => (prev + 1) % DYNAMIC_HIGHLIGHTS.length)
    }, 2800)
    return () => clearInterval(timer)
  }, [])

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
    <section className="relative min-h-[620px] sm:min-h-[700px] lg:min-h-[760px] flex items-center justify-center overflow-hidden py-12 sm:py-20 px-3.5 sm:px-6 lg:px-8 bg-[#050807]">
      {/* 1. CINEMATIC BACKGROUND PHOTOGRAPHY */}
      <div 
        className="absolute inset-0 bg-cover bg-center transition-all duration-700 opacity-35 scale-105"
        style={{ backgroundImage: `url('${optimizedHeroBg}')` }}
      />

      {/* 2. CYBER-LUXURY OBSIDIAN & NEON GREEN GRADIENTS */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#050807] via-[#07130d]/85 to-[#050807]/90" />
      <div className="absolute inset-0 bg-radial from-transparent via-[#050807]/60 to-[#050807] pointer-events-none" />

      {/* Ambient Animated Neon Green Light Orbs */}
      <div className="absolute top-1/4 left-1/5 w-72 h-72 sm:w-96 sm:h-96 bg-[#00ff88]/15 rounded-full blur-[100px] pointer-events-none animate-pulse" />
      <div className="absolute bottom-1/4 right-1/5 w-80 h-80 sm:w-96 sm:h-96 bg-[#05f279]/15 rounded-full blur-[120px] pointer-events-none" />

      {/* 3D FLOATING CELEBRATION BADGES (Desktop) */}
      <div className="hidden xl:flex absolute left-6 2xl:left-12 top-1/2 -translate-y-1/2 flex-col gap-4 z-20 animate-float-slow pointer-events-none">
        <div className="bg-[#0b1812]/90 p-4 rounded-2xl shadow-[0_10px_30px_rgba(0,0,0,0.8)] border border-[#00ff88]/40 text-left max-w-[230px] backdrop-blur-xl">
          <div className="flex items-center gap-2.5 mb-2">
            <span className="w-8 h-8 rounded-xl bg-[#00ff88] text-[#050807] flex items-center justify-center text-base shadow-[0_0_12px_rgba(0,255,136,0.8)] font-black">🏰</span>
            <div>
              <div className="text-[10px] font-black text-[#00ff88] uppercase tracking-wider">Royal Venues</div>
              <div className="text-xs font-serif font-bold text-white">Udaipur &amp; Jaipur</div>
            </div>
          </div>
          <p className="text-[10.5px] text-stone-300 font-light leading-snug">Heritage Palaces, Forts &amp; Boutique Banquet Resorts</p>
          <div className="mt-2.5 pt-2 border-t border-[#00ff88]/20 text-[10px] font-bold text-[#00ff88] flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#00ff88] shadow-[0_0_6px_#00ff88] animate-ping"></span> 
            <span>100% Direct Date Lock</span>
          </div>
        </div>

        <div className="bg-[#0b1812]/90 p-3.5 rounded-2xl shadow-[0_10px_30px_rgba(0,0,0,0.8)] border border-amber-400/40 text-left max-w-[220px] backdrop-blur-xl">
          <div className="flex items-center gap-2">
            <span className="text-lg">🍲</span>
            <span className="text-xs font-serif font-bold text-amber-300">Shahi Awadhi Feasts</span>
          </div>
          <p className="text-[10px] text-stone-300 mt-1">Live Galouti Kebabs &amp; Dum Pukht</p>
        </div>
      </div>

      <div className="hidden xl:flex absolute right-6 2xl:right-12 top-1/2 -translate-y-1/2 flex-col gap-4 z-20 animate-float-reverse pointer-events-none">
        <div className="bg-[#0b1812]/90 p-4 rounded-2xl shadow-[0_10px_30px_rgba(0,0,0,0.8)] border border-[#00ff88]/40 text-left max-w-[230px] backdrop-blur-xl">
          <div className="flex items-center gap-2.5 mb-2">
            <span className="w-8 h-8 rounded-xl bg-[#00ff88] text-[#050807] flex items-center justify-center text-base shadow-[0_0_12px_rgba(0,255,136,0.8)] font-black">💍</span>
            <div>
              <div className="text-[10px] font-black text-[#00ff88] uppercase tracking-wider">14,200+ Celebrations</div>
              <div className="text-xs font-serif font-bold text-white">Curated Across India</div>
            </div>
          </div>
          <div className="flex items-center gap-1.5 mt-1">
            <div className="flex text-amber-400 text-xs">★★★★★</div>
            <span className="text-[10.5px] text-white font-bold">4.95 / 5 Rating</span>
          </div>
          <div className="mt-2.5 pt-2 border-t border-[#00ff88]/20 text-[10px] font-bold text-amber-300 flex items-center gap-1">
            <span>🛡️</span> Government Verified Seals
          </div>
        </div>

        <div className="bg-[#0b1812]/90 p-3.5 rounded-2xl shadow-[0_10px_30px_rgba(0,0,0,0.8)] border border-[#00ff88]/40 text-left max-w-[220px] backdrop-blur-xl">
          <div className="flex items-center gap-2">
            <span className="text-lg">📸</span>
            <span className="text-xs font-serif font-bold text-[#00ff88]">4K Cinema &amp; Drones</span>
          </div>
          <p className="text-[10px] text-stone-300 mt-1">Candid Master Storytellers</p>
        </div>
      </div>

      {/* 3. HERO CONTENT WRAPPER */}
      <div className="relative max-w-5xl mx-auto w-full text-center z-10">
        
        {/* Editorial Eyebrow Tag with Sliding Animation */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#00ff88]/10 border border-[#00ff88]/50 text-[#00ff88] text-xs sm:text-[13px] font-black mb-3 sm:mb-4 tracking-widest uppercase backdrop-blur-md shadow-[0_0_20px_rgba(0,255,136,0.3)]">
          <Sparkles className="w-3.5 h-3.5 text-[#00ff88] shrink-0 animate-spin" style={{ animationDuration: '6s' }} />
          <span className="truncate max-w-[280px] sm:max-w-none">{heroData.badge || "India's Premier Luxury Wedding & Event Concierge"}</span>
          <span className="w-1.5 h-1.5 rounded-full bg-[#00ff88] animate-ping shrink-0" />
        </div>

        {/* CARTOON MAHARAJA SITTING DIRECTLY ON TOP OF HEADLINE */}
        <div className="flex justify-center -mb-6 sm:-mb-8 relative z-30 pointer-events-auto">
          <MaharajaSittingMascot scale={1.2} />
        </div>

        {/* Master Headline with 3D Depth & Kinetic Word Switcher */}
        <h1 className="font-serif text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-black tracking-tight text-white mb-4 sm:mb-6 leading-[1.15] drop-shadow-2xl">
          Plan Your Royal Celebration, <br className="hidden sm:inline" />
          <span 
            key={highlightIdx}
            className="inline-block text-[#00ff88] font-black drop-shadow-[0_0_25px_rgba(0,255,136,0.85)] animate-pop-in"
          >
            {DYNAMIC_HIGHLIGHTS[highlightIdx]}
          </span>
        </h1>

        {/* Subtitle */}
        <p className="max-w-2xl mx-auto text-sm sm:text-base md:text-lg text-stone-300 font-light mb-8 sm:mb-10 leading-relaxed drop-shadow px-2">
          {heroData.subheadline}
        </p>

        {/* 4. CYBER-LUXURY 3D MULTI-FIELD DISCOVERY SEARCH BOX */}
        <div className="bg-[#091510]/95 backdrop-blur-2xl rounded-3xl p-4 sm:p-7 shadow-[0_20px_60px_rgba(0,0,0,0.9),0_0_30px_rgba(0,255,136,0.18)] border-2 border-[#00ff88]/40 ring-4 ring-[#00ff88]/15 text-white text-left max-w-4xl mx-auto transition-all card-3d-hover">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2.5 sm:gap-3 mb-4">
            
            {/* Field 1: Event Type */}
            <div className="bg-[#0e2119] rounded-2xl p-2.5 sm:p-3 border border-[#00ff88]/30 hover:border-[#00ff88] transition-all shadow-xs">
              <label className="block text-[10px] sm:text-[11px] font-black text-[#00ff88] uppercase tracking-wider mb-1 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#00ff88] shadow-[0_0_6px_#00ff88]"></span> Event Type
              </label>
              <select
                value={heroSearch.eventType}
                onChange={(e) => setHeroSearch({ ...heroSearch, eventType: e.target.value })}
                className="w-full bg-transparent font-bold text-white text-sm focus:outline-none cursor-pointer py-1"
              >
                {eventTypes.map(t => (
                  <option key={t.id} value={t.name} className="bg-[#050807] text-white">{t.icon} {t.name}</option>
                ))}
              </select>
            </div>

            {/* Field 2: Location */}
            <div className="bg-[#0e2119] rounded-2xl p-2.5 sm:p-3 border border-[#00ff88]/30 hover:border-[#00ff88] transition-all shadow-xs">
              <label className="block text-[10px] sm:text-[11px] font-black text-[#00ff88] uppercase tracking-wider mb-1 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#00ff88] shadow-[0_0_6px_#00ff88]"></span> City Location
              </label>
              <select
                value={heroSearch.city}
                onChange={(e) => {
                  setHeroSearch({ ...heroSearch, city: e.target.value })
                  setSelectedCity(e.target.value)
                }}
                className="w-full bg-transparent font-bold text-white text-sm focus:outline-none cursor-pointer py-1"
              >
                {cities.filter(c => c !== 'All Cities').map(c => (
                  <option key={c} value={c} className="bg-[#050807] text-white">{c}</option>
                ))}
              </select>
            </div>

            {/* Field 3: Event Date */}
            <div className="bg-[#0e2119] rounded-2xl p-2.5 sm:p-3 border border-[#00ff88]/30 hover:border-[#00ff88] transition-all shadow-xs">
              <label className="block text-[10px] sm:text-[11px] font-black text-[#00ff88] uppercase tracking-wider mb-1 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#00ff88] shadow-[0_0_6px_#00ff88]"></span> Event Date
              </label>
              <input
                type="date"
                value={heroSearch.date}
                onChange={(e) => setHeroSearch({ ...heroSearch, date: e.target.value })}
                className="w-full bg-transparent font-bold text-white text-sm focus:outline-none cursor-pointer py-0.5"
              />
            </div>

            {/* Field 4: Guest Count */}
            <div className="bg-[#0e2119] rounded-2xl p-2.5 sm:p-3 border border-[#00ff88]/30 hover:border-[#00ff88] transition-all shadow-xs">
              <label className="block text-[10px] sm:text-[11px] font-black text-[#00ff88] uppercase tracking-wider mb-1 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#00ff88] shadow-[0_0_6px_#00ff88]"></span> Guest Count
              </label>
              <select
                value={heroSearch.guests}
                onChange={(e) => setHeroSearch({ ...heroSearch, guests: e.target.value })}
                className="w-full bg-transparent font-bold text-white text-sm focus:outline-none cursor-pointer py-1"
              >
                <option value="50" className="bg-[#050807] text-white">50 – 100 Guests (Intimate)</option>
                <option value="250" className="bg-[#050807] text-white">200 – 350 Guests (Grand)</option>
                <option value="500" className="bg-[#050807] text-white">500 – 800 Guests (Royal)</option>
                <option value="1200" className="bg-[#050807] text-white">1000+ Guests (Extravaganza)</option>
              </select>
            </div>

            {/* Field 5: Target Budget */}
            <div className="bg-[#0e2119] rounded-2xl p-2.5 sm:p-3 border border-[#00ff88]/30 hover:border-[#00ff88] transition-all shadow-xs">
              <label className="block text-[10px] sm:text-[11px] font-black text-[#00ff88] uppercase tracking-wider mb-1 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#00ff88] shadow-[0_0_6px_#00ff88]"></span> Target Budget
              </label>
              <select
                value={heroSearch.budget}
                onChange={(e) => setHeroSearch({ ...heroSearch, budget: e.target.value })}
                className="w-full bg-transparent font-bold text-white text-sm focus:outline-none cursor-pointer py-1"
              >
                <option value="100000" className="bg-[#050807] text-white">₹1,00,000 (Pocket Friendly)</option>
                <option value="250000" className="bg-[#050807] text-white">₹2,50,000 (Celebration)</option>
                <option value="500000" className="bg-[#050807] text-white">₹5,00,000 (Premium Wedding)</option>
                <option value="1200000" className="bg-[#050807] text-white">₹12,00,000+ (Royal Palace)</option>
              </select>
            </div>
          </div>

          {/* Primary & Secondary Action CTAs with Neon Chips */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3.5 border-t border-[#00ff88]/20">
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar w-full sm:w-auto text-xs py-1">
              <span className="font-black text-[#00ff88] whitespace-nowrap text-[11px] uppercase tracking-wider">Trending:</span>
              <span className="bg-[#00ff88]/15 text-[#00ff88] border border-[#00ff88]/40 px-3 py-1 rounded-full whitespace-nowrap font-bold text-[11px] flex items-center gap-1 shadow-sm">
                🏰 Heritage Palaces
              </span>
              <span className="bg-amber-400/15 text-amber-300 border border-amber-400/40 px-3 py-1 rounded-full whitespace-nowrap font-bold text-[11px] flex items-center gap-1 shadow-sm">
                🍲 Awadhi Feasts
              </span>
              <span className="bg-[#00ff88]/15 text-[#00ff88] border border-[#00ff88]/40 px-3 py-1 rounded-full whitespace-nowrap font-bold text-[11px] flex items-center gap-1 shadow-sm">
                📸 4K Cinematography
              </span>
            </div>

            <div className="flex items-center gap-2.5 w-full sm:w-auto">
              <button
                onClick={onStartPlanning}
                className="btn-neon-outline flex-1 sm:flex-none px-4 py-2.5 rounded-xl text-xs font-black cursor-pointer text-center"
              >
                Plan 5-Service Event
              </button>
              <button
                onClick={onExploreVendors}
                className="btn-neon-green flex-1 sm:flex-none px-5 py-2.5 rounded-xl text-xs font-black flex items-center justify-center gap-2 cursor-pointer shadow-[0_0_20px_rgba(0,255,136,0.6)]"
              >
                <Search className="w-4 h-4 stroke-[3]" />
                <span>Find Creators</span>
              </button>
            </div>
          </div>
        </div>

        {/* 5. LIVE STATS STRIP WITH NEON GLOW */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mt-8 sm:mt-10 max-w-4xl mx-auto">
          {heroData.stats.map((stat, idx) => (
            <div 
              key={idx}
              className="bg-[#091510]/80 backdrop-blur-md rounded-2xl p-3 sm:p-4 border border-[#00ff88]/30 shadow-[0_10px_25px_rgba(0,0,0,0.5)] text-center transition-all hover:border-[#00ff88] hover:scale-105"
            >
              <div className="text-xl sm:text-2xl md:text-3xl font-black text-[#00ff88] drop-shadow-[0_0_10px_rgba(0,255,136,0.7)]">
                {stat.value}
              </div>
              <div className="text-[10px] sm:text-xs font-bold text-stone-300 mt-1 uppercase tracking-wider">
                {stat.label}
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  )
}
