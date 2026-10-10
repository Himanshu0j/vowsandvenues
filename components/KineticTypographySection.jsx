'use client'

import React, { useState, useEffect } from 'react'
import { Sparkles, Star, ShieldCheck, Heart, Award, ArrowUpRight } from 'lucide-react'
import { MaharajaSittingMascot, DancingCoupleMascot, RoyalElephantMascot } from './CartoonMascots'

const ROTATING_WORDS = [
  { text: 'ROYAL PALACES', color: 'from-amber-400 via-amber-500 to-amber-600 text-stone-950' },
  { text: 'SHAHI AWADHI FEASTS', color: 'from-rose-500 via-rose-600 to-rose-700 text-white' },
  { text: '4K CANDID CINEMA', color: 'from-indigo-500 via-indigo-600 to-indigo-700 text-white' },
  { text: 'MANDAPS & MOGRA DECOR', color: 'from-emerald-600 via-emerald-700 to-emerald-800 text-white' },
  { text: 'CELEBRITY HD BRIDAL GLAM', color: 'from-purple-600 via-fuchsia-600 to-pink-600 text-white' }
]

export default function KineticTypographySection({ onExplore }) {
  const [activeWordIndex, setActiveWordIndex] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveWordIndex((prev) => (prev + 1) % ROTATING_WORDS.length)
    }, 2800)
    return () => clearInterval(interval)
  }, [])

  const currentWord = ROTATING_WORDS[activeWordIndex]

  return (
    <div className="w-full relative overflow-hidden py-14 sm:py-20 select-none bg-gradient-to-b from-[#fcfbf9] via-[#f7f0e3] to-[#fcfbf9]">
      {/* Background Soft Glow Orbs */}
      <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-96 h-96 bg-amber-300/15 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute top-1/2 right-1/4 -translate-y-1/2 w-96 h-96 bg-rose-300/15 rounded-full blur-[140px] pointer-events-none" />

      {/* 1. TOP INFINITE SLIDING MARQUEE (LEFTWARDS) */}
      <div className="relative w-full overflow-hidden border-y border-amber-400/50 bg-gradient-to-r from-[#3b0d1b] via-[#4a1525] to-[#3b0d1b] py-3.5 mb-12 shadow-md">
        <div className="flex w-max animate-marquee-left">
          {[...Array(2)].map((_, i) => (
            <div key={i} className="flex items-center gap-8 text-xs sm:text-sm font-bold tracking-widest text-amber-200 uppercase whitespace-nowrap px-4">
              <span className="flex items-center gap-2 text-white font-extrabold">
                <Sparkles className="w-4 h-4 text-amber-300" />
                <span>VOWS &amp; VENUES</span>
              </span>
              <span className="text-amber-400/40 font-sans">•</span>
              <span className="text-amber-100/90">INDIA'S PREMIER WEDDING MARKETPLACE</span>
              <span className="text-amber-400/40 font-sans">•</span>
              <span className="px-2.5 py-0.5 rounded-full bg-gradient-to-r from-amber-400 to-amber-500 text-stone-950 font-black">100% DIRECT DATE LOCK</span>
              <span className="text-amber-400/40 font-sans">•</span>
              <span className="text-amber-300">HERITAGE FORTS IN RAJASTHAN</span>
              <span className="text-amber-400/40 font-sans">•</span>
              <span className="text-amber-100/90">AUTHENTIC AWADHI BANQUETS</span>
              <span className="text-amber-400/40 font-sans">•</span>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500 text-white font-black">25% SPLIT ADVANCE BOOKING</span>
              <span className="text-amber-400/40 font-sans">•</span>
              <span className="text-amber-300">CANDID 4K DRONE CINEMA</span>
              <span className="text-amber-400/40 font-sans">•</span>
              <span className="text-amber-100/90">GOVERNMENT VERIFIED SEALS</span>
            </div>
          ))}
        </div>
      </div>

      {/* 2. CENTER STAGE: GIANT TYPOGRAPHY WITH SITTING CARTOON MASCOT */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10 mb-12">
        {/* Animated Cartoon Elephant Mascot on Left */}
        <div className="hidden lg:block absolute left-8 top-1/2 -translate-y-1/2 z-20">
          <RoyalElephantMascot scale={1.2} />
          <div className="text-[10px] font-extrabold text-[#4a1525] uppercase tracking-wider mt-1 text-center bg-amber-100/90 px-2 py-0.5 rounded-full border border-amber-300 shadow-sm">
            Shubh Gaja 🐘
          </div>
        </div>

        {/* Animated Cartoon Dancing Couple on Right */}
        <div className="hidden lg:block absolute right-8 top-1/2 -translate-y-1/2 z-20">
          <DancingCoupleMascot />
          <div className="text-[10px] font-extrabold text-[#4a1525] uppercase tracking-wider mt-1 text-center bg-amber-100/90 px-2 py-0.5 rounded-full border border-amber-300 shadow-sm">
            Shubh Jodi 💃🕺
          </div>
        </div>

        {/* THE ROYAL CARTOON MASCOT SITTING RIGHT ON TOP OF THE HEADLINE */}
        <div className="flex justify-center -mb-8 sm:-mb-10 relative z-30">
          <MaharajaSittingMascot scale={1.25} />
        </div>

        {/* GIANT DESIGN HEADLINE */}
        <div className="relative inline-block">
          <h2 className="font-serif text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-black text-[#1c1917] tracking-tight leading-[1.05] drop-shadow-sm">
            VOWS &amp; VENUES
          </h2>
          <div className="text-xs sm:text-base font-bold tracking-[0.25em] uppercase text-[#4a1525] mt-2">
            India's Most Trusted Royal Event Atelier
          </div>
        </div>

        {/* JUMBLING KINETIC WORD FLIPPER */}
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
          <span className="text-stone-700 font-bold text-sm sm:text-lg uppercase tracking-wider">
            Curating Extraordinary
          </span>
          <div 
            key={currentWord.text}
            className={`px-5 py-2 rounded-2xl bg-gradient-to-r ${currentWord.color} font-black text-base sm:text-2xl shadow-lg border border-amber-300/40 animate-pop-in tracking-wide`}
          >
            {currentWord.text}
          </div>
          <span className="text-stone-700 font-bold text-sm sm:text-lg uppercase tracking-wider">
            Without Stress
          </span>
        </div>

        {/* Quick CTA Button */}
        <div className="mt-7 flex justify-center">
          <button
            onClick={() => {
              if (onExplore) onExplore('all')
            }}
            className="btn-3d-wine px-8 py-3 rounded-2xl font-bold text-amber-100 text-sm flex items-center gap-2 cursor-pointer shadow-lg hover:brightness-110 active:scale-95"
          >
            <span>Explore 38+ Verified Creators</span>
            <ArrowUpRight className="w-4 h-4 text-amber-300 stroke-[3]" />
          </button>
        </div>
      </div>

      {/* 3. BOTTOM INFINITE SLIDING MARQUEE (RIGHTWARDS) */}
      <div className="relative w-full overflow-hidden border-y border-amber-400/50 bg-gradient-to-r from-[#3b0d1b] via-[#4a1525] to-[#3b0d1b] py-3.5 shadow-md">
        <div className="flex w-max animate-marquee-right">
          {[...Array(2)].map((_, i) => (
            <div key={i} className="flex items-center gap-8 text-xs sm:text-sm font-bold tracking-widest text-amber-200 uppercase whitespace-nowrap px-4">
              <span className="text-amber-300 font-extrabold">★ 14,200+ CURATED CELEBRATIONS</span>
              <span className="text-amber-400/40 font-sans">•</span>
              <span className="text-white">LUCKNOW • JAIPUR • UDAIPUR • DELHI NCR</span>
              <span className="text-amber-400/40 font-sans">•</span>
              <span className="px-2.5 py-0.5 rounded-full bg-gradient-to-r from-amber-400 to-amber-500 text-stone-950 font-black">ZERO DOUBLE BOOKING SHIELD</span>
              <span className="text-amber-400/40 font-sans">•</span>
              <span className="text-amber-100/90">AWADHI GALOUTI KEBAB COUNTERS</span>
              <span className="text-amber-400/40 font-sans">•</span>
              <span className="text-amber-300">LAKESIDE PALACE MANDAPS</span>
              <span className="text-amber-400/40 font-sans">•</span>
              <span className="text-white">CELEBRITY MAKEUP ARTISTS</span>
              <span className="text-amber-400/40 font-sans">•</span>
              <span className="px-2.5 py-0.5 rounded-full bg-rose-500 text-white font-black">4.95 / 5 RATED</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
