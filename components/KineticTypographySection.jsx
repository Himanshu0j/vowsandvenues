'use client'

import React, { useState, useEffect } from 'react'
import { Sparkles, Star, ShieldCheck, Heart, Award, ArrowUpRight, Crown, Gem, CheckCircle2 } from 'lucide-react'

const ROTATING_HIGHLIGHTS = [
  { title: 'ROYAL PALACES', location: 'Udaipur & Jaipur Citadels', color: 'from-[#4a1525] to-[#20050d]' },
  { title: 'SHAHI AWADHI FEASTS', location: 'Lucknow Dum Pukht Banquets', color: 'from-[#7c2d12] to-[#431407]' },
  { title: '4K CANDID CINEMA', location: 'Drone Aerial Storytellers', color: 'from-[#1e1b4b] to-[#0f172a]' },
  { title: 'MOGRA MANDAP DECOR', location: 'Artisanal Fresh Florals', color: 'from-[#064e3b] to-[#022c22]' },
  { title: 'CELEBRITY BRIDAL GLAM', location: 'HD Airbrush Artists', color: 'from-[#581c87] to-[#3b0764]' }
]

const ATELIER_PILLARS = [
  {
    icon: '🏰',
    title: 'Heritage Forts & Palaces',
    description: 'Exclusive dates across Lake Pichola island palaces, sandstone citadels, and royal havelis with direct booking guarantee.',
    badge: '100% Direct Lock'
  },
  {
    icon: '🍲',
    title: 'Shahi Awadhi Dawat',
    description: 'Centuries-old slow-cooked Dum Pukht biryanis, melt-in-mouth Galouti kebabs on Sheermal, and fragrant dessert counters.',
    badge: 'Heritage Masterchefs'
  },
  {
    icon: '📸',
    title: 'Candid 4K Cinematography',
    description: 'Pre-wedding aerial drone teasers, multi-camera 4K live feeds, and prompt 7-day highlight reels for families.',
    badge: 'Vogue-Style Edits'
  },
  {
    icon: '🌸',
    title: 'Artisanal Floral Mandaps',
    description: '100% fresh fragrant mogra cascades, antique brass diya pillars, pastel hydrangeas, and crystal candle chandeliers.',
    badge: 'Artisan Crafted'
  }
]

export default function KineticTypographySection({ onExplore }) {
  const [activeHighlightIndex, setActiveHighlightIndex] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveHighlightIndex((prev) => (prev + 1) % ROTATING_HIGHLIGHTS.length)
    }, 3200)
    return () => clearInterval(interval)
  }, [])

  const currentHighlight = ROTATING_HIGHLIGHTS[activeHighlightIndex]

  return (
    <section className="w-full relative overflow-hidden py-16 sm:py-24 select-none bg-gradient-to-b from-[#fdfbf7] via-[#f7f0e3] to-[#fdfbf7] border-y border-[#e8dfcf]">
      
      {/* 1. TOP ELEGANT MARQUEE (LEFTWARDS) */}
      <div className="relative w-full overflow-hidden border-y border-amber-300/80 bg-gradient-to-r from-[#3b0d1b] via-[#4a1525] to-[#3b0d1b] py-3 shadow-md mb-14">
        <div className="flex w-max animate-marquee-left">
          {[...Array(2)].map((_, i) => (
            <div key={i} className="flex items-center gap-8 text-xs sm:text-sm font-bold tracking-widest text-amber-200 uppercase whitespace-nowrap px-4">
              <span className="flex items-center gap-2 text-white font-extrabold">
                <Crown className="w-4 h-4 text-amber-300" />
                <span>VOWS &amp; VENUES</span>
              </span>
              <span className="text-amber-400/40 font-sans">•</span>
              <span className="text-amber-100/90">INDIA&apos;S PREMIER WEDDING ATELIER</span>
              <span className="text-amber-400/40 font-sans">•</span>
              <span className="px-2.5 py-0.5 rounded-full bg-gradient-to-r from-amber-400 to-amber-500 text-stone-950 font-black">100% DIRECT DATE LOCK</span>
              <span className="text-amber-400/40 font-sans">•</span>
              <span className="text-amber-300">HERITAGE FORTS IN RAJASTHAN</span>
              <span className="text-amber-400/40 font-sans">•</span>
              <span className="text-amber-100/90">AUTHENTIC AWADHI BANQUETS</span>
              <span className="text-amber-400/40 font-sans">•</span>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-600 text-white font-bold">25% SPLIT ADVANCE BOOKING</span>
              <span className="text-amber-400/40 font-sans">•</span>
              <span className="text-amber-300">CANDID 4K DRONE CINEMA</span>
              <span className="text-amber-400/40 font-sans">•</span>
              <span className="text-amber-100/90">GOVERNMENT VERIFIED SEALS</span>
            </div>
          ))}
        </div>
      </div>

      {/* 2. CENTER STAGE: ULTRA-PREMIUM ROYAL ATELIER STATEMENT */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10 mb-16">
        
        {/* Royal Crest Monogram */}
        <div className="inline-flex items-center justify-center gap-3 mb-4">
          <div className="h-px w-12 sm:w-20 bg-gradient-to-r from-transparent to-amber-400" />
          <span className="text-amber-600 text-sm sm:text-base tracking-[0.3em] font-serif uppercase font-bold flex items-center gap-1.5">
            <span>⚜</span>
            <span>Bespoke Indian Celebrations</span>
            <span>⚜</span>
          </span>
          <div className="h-px w-12 sm:w-20 bg-gradient-to-l from-transparent to-amber-400" />
        </div>

        {/* Master Serif Headline */}
        <h2 className="font-serif text-3xl sm:text-5xl md:text-6xl font-bold text-[#1c1917] tracking-tight leading-[1.1] max-w-4xl mx-auto">
          The Royal Atelier for Discerning Weddings
        </h2>

        {/* Subtitle */}
        <p className="max-w-2xl mx-auto text-xs sm:text-sm md:text-base text-stone-600 mt-3 font-normal leading-relaxed">
          From Udaipur’s shimmering island palaces to Lucknow’s grand Awadhi banquets, discover verified wedding masters handpicked for their heritage and excellence.
        </p>

        {/* Dynamic Rotating Specialty Pill */}
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
          <span className="text-xs sm:text-sm font-bold text-stone-500 uppercase tracking-wider">
            Signature Experience:
          </span>
          <div 
            key={currentHighlight.title}
            className={`px-5 py-2 rounded-2xl bg-gradient-to-r ${currentHighlight.color} text-amber-200 font-serif font-bold text-sm sm:text-lg shadow-md border border-amber-400/40 animate-pop-in tracking-wide flex items-center gap-2`}
          >
            <Sparkles className="w-4 h-4 text-amber-300" />
            <span>{currentHighlight.title}</span>
            <span className="text-xs font-sans text-stone-300 font-normal">({currentHighlight.location})</span>
          </div>
        </div>

        {/* 4 ELEGANT PILLARS GRID */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mt-12 text-left">
          {ATELIER_PILLARS.map((pillar, idx) => (
            <div
              key={idx}
              className="bg-gradient-to-br from-[#fffdfa] via-[#fcf8f0] to-[#f8f1e3] p-6 rounded-2xl border border-amber-300/80 hover:border-amber-500 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-2xl">{pillar.icon}</span>
                  <span className="text-[10px] uppercase font-bold text-[#4a1525] bg-amber-100/90 px-2.5 py-0.5 rounded-full border border-amber-300/70">
                    {pillar.badge}
                  </span>
                </div>
                <h3 className="font-serif text-base font-bold text-[#1c1917] mb-1.5">
                  {pillar.title}
                </h3>
                <p className="text-xs text-stone-600 leading-relaxed font-normal">
                  {pillar.description}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-amber-200/60 flex items-center justify-between text-[11px] font-semibold text-[#4a1525]">
                <span>Verified Quality Seal</span>
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              </div>
            </div>
          ))}
        </div>

        {/* Directory CTA */}
        <div className="mt-10 flex justify-center">
          <button
            onClick={() => {
              if (onExplore) onExplore('all')
            }}
            className="btn-3d-wine px-8 py-3.5 rounded-2xl font-bold text-amber-100 text-xs sm:text-sm uppercase tracking-wider flex items-center gap-2 cursor-pointer shadow-lg hover:brightness-110 active:scale-95"
          >
            <span>Explore All 38+ Verified Creators</span>
            <ArrowUpRight className="w-4 h-4 text-amber-300 stroke-[3]" />
          </button>
        </div>
      </div>

      {/* 3. BOTTOM ELEGANT MARQUEE (RIGHTWARDS) */}
      <div className="relative w-full overflow-hidden border-y border-amber-300/80 bg-gradient-to-r from-[#3b0d1b] via-[#4a1525] to-[#3b0d1b] py-3 shadow-md">
        <div className="flex w-max animate-marquee-right">
          {[...Array(2)].map((_, i) => (
            <div key={i} className="flex items-center gap-8 text-xs sm:text-sm font-bold tracking-widest text-amber-200 uppercase whitespace-nowrap px-4">
              <span className="text-amber-300 font-extrabold">★ 14,200+ CURATED CELEBRATIONS</span>
              <span className="text-amber-400/40 font-sans">•</span>
              <span className="text-white">LUCKNOW • JAIPUR • UDAIPUR • DELHI NCR • MUMBAI</span>
              <span className="text-amber-400/40 font-sans">•</span>
              <span className="px-2.5 py-0.5 rounded-full bg-gradient-to-r from-amber-400 to-amber-500 text-stone-950 font-black">ZERO DOUBLE BOOKING SHIELD</span>
              <span className="text-amber-400/40 font-sans">•</span>
              <span className="text-amber-100/90">AWADHI GALOUTI KEBAB COUNTERS</span>
              <span className="text-amber-400/40 font-sans">•</span>
              <span className="text-amber-300">LAKESIDE PALACE MANDAPS</span>
              <span className="text-amber-400/40 font-sans">•</span>
              <span className="text-white">CELEBRITY MAKEUP ARTISTS</span>
              <span className="text-amber-400/40 font-sans">•</span>
              <span className="px-2.5 py-0.5 rounded-full bg-rose-600 text-white font-bold">4.95 / 5 CLIENT SATISFACTION</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
