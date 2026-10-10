'use client'

import React, { useState, useEffect } from 'react'
import { Sparkles, Star, ShieldCheck, Heart, Award, ArrowUpRight } from 'lucide-react'
import { MaharajaSittingMascot, DancingCoupleMascot, RoyalElephantMascot } from './CartoonMascots'

const ROTATING_WORDS = [
  { text: 'ROYAL PALACES', color: 'from-[#00ff88] via-[#05f279] to-[#10b981]' },
  { text: 'SHAHI AWADHI FEASTS', color: 'from-[#f59e0b] via-[#fbbf24] to-[#d97706]' },
  { text: '4K CANDID CINEMA', color: 'from-[#38bdf8] via-[#0284c7] to-[#0369a1]' },
  { text: 'MANDAPS & MOGRA DECOR', color: 'from-[#f43f5e] via-[#fb7185] to-[#e11d48]' },
  { text: 'CELEBRITY HD BRIDAL GLAM', color: 'from-[#c084fc] via-[#a855f7] to-[#9333ea]' }
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
    <div className="w-full relative overflow-hidden py-14 sm:py-20 select-none bg-gradient-to-b from-[#050807] via-[#08120d] to-[#050807]">
      {/* Background Neon Glow Mesh */}
      <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-96 h-96 bg-[#00ff88]/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute top-1/2 right-1/4 -translate-y-1/2 w-96 h-96 bg-[#05f279]/10 rounded-full blur-[140px] pointer-events-none" />

      {/* 1. TOP INFINITE SLIDING MARQUEE (LEFTWARDS) */}
      <div className="relative w-full overflow-hidden border-y border-[#00ff88]/30 bg-[#07100b] py-3.5 mb-12 shadow-[0_0_20px_rgba(0,255,136,0.15)]">
        <div className="flex w-max animate-marquee-left">
          {[...Array(2)].map((_, i) => (
            <div key={i} className="flex items-center gap-8 text-xs sm:text-sm font-black tracking-widest text-[#00ff88] uppercase whitespace-nowrap px-4">
              <span className="flex items-center gap-2 text-white">
                <Sparkles className="w-4 h-4 text-[#00ff88]" />
                <span>VOWS &amp; VENUES</span>
              </span>
              <span className="text-stone-600 font-sans">•</span>
              <span className="text-stone-300">INDIA'S PREMIER WEDDING MARKETPLACE</span>
              <span className="text-stone-600 font-sans">•</span>
              <span className="px-2.5 py-0.5 rounded-full bg-[#00ff88] text-[#050807] font-black">100% DIRECT DATE LOCK</span>
              <span className="text-stone-600 font-sans">•</span>
              <span className="text-[#00ff88]">HERITAGE FORTS IN RAJASTHAN</span>
              <span className="text-stone-600 font-sans">•</span>
              <span className="text-stone-300">AUTHENTIC AWADHI BANQUETS</span>
              <span className="text-stone-600 font-sans">•</span>
              <span className="px-2.5 py-0.5 rounded-full bg-amber-400 text-[#050807] font-black">25% SPLIT ADVANCE BOOKING</span>
              <span className="text-stone-600 font-sans">•</span>
              <span className="text-[#00ff88]">CANDID 4K DRONE CINEMA</span>
              <span className="text-stone-600 font-sans">•</span>
              <span className="text-stone-300">GOVERNMENT VERIFIED SEALS</span>
            </div>
          ))}
        </div>
      </div>

      {/* 2. CENTER STAGE: GIANT TYPOGRAPHY WITH SITTING CARTOON MASCOT */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10 mb-12">
        {/* Animated Cartoon Elephant Mascot on Left */}
        <div className="hidden lg:block absolute left-8 top-1/2 -translate-y-1/2 z-20">
          <RoyalElephantMascot scale={1.2} />
          <div className="text-[10px] font-extrabold text-[#00ff88] uppercase tracking-wider mt-1 text-center bg-[#050807]/90 px-2 py-0.5 rounded-full border border-[#00ff88]/30">
            Shubh Gaja 🐘
          </div>
        </div>

        {/* Animated Cartoon Dancing Couple on Right */}
        <div className="hidden lg:block absolute right-8 top-1/2 -translate-y-1/2 z-20">
          <DancingCoupleMascot />
          <div className="text-[10px] font-extrabold text-amber-300 uppercase tracking-wider mt-1 text-center bg-[#050807]/90 px-2 py-0.5 rounded-full border border-amber-400/30">
            Shubh Jodi 💃🕺
          </div>
        </div>

        {/* THE ROYAL CARTOON MASCOT SITTING RIGHT ON TOP OF THE HEADLINE */}
        <div className="flex justify-center -mb-8 sm:-mb-10 relative z-30">
          <MaharajaSittingMascot scale={1.25} />
        </div>

        {/* GIANT DESIGN HEADLINE */}
        <div className="relative inline-block">
          <h2 className="font-serif text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-black text-white tracking-tight leading-[1.05] drop-shadow-2xl">
            VOWS &amp; VENUES
          </h2>
          <div className="text-xs sm:text-base font-extrabold tracking-[0.3em] uppercase text-[#00ff88] mt-2 drop-shadow-[0_0_15px_rgba(0,255,136,0.8)]">
            India's Most Trusted Royal Event Atelier
          </div>
        </div>

        {/* JUMBLING KINETIC WORD FLIPPER */}
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
          <span className="text-stone-300 font-bold text-sm sm:text-lg uppercase tracking-wider">
            Curating Extraordinary
          </span>
          <div 
            key={currentWord.text}
            className={`px-5 py-2 rounded-2xl bg-gradient-to-r ${currentWord.color} text-[#050807] font-black text-base sm:text-2xl shadow-[0_0_30px_rgba(0,255,136,0.5)] border-2 border-white/50 animate-pop-in tracking-wide`}
          >
            {currentWord.text}
          </div>
          <span className="text-stone-300 font-bold text-sm sm:text-lg uppercase tracking-wider">
            Without Stress
          </span>
        </div>

        {/* Quick CTA Button */}
        <div className="mt-7 flex justify-center">
          <button
            onClick={() => {
              if (onExplore) onExplore('all')
            }}
            className="btn-neon-green px-8 py-3 rounded-2xl font-black text-sm flex items-center gap-2 cursor-pointer shadow-[0_0_30px_rgba(0,255,136,0.6)]"
          >
            <span>Explore 38+ Verified Creators</span>
            <ArrowUpRight className="w-4 h-4 stroke-[3]" />
          </button>
        </div>
      </div>

      {/* 3. BOTTOM INFINITE SLIDING MARQUEE (RIGHTWARDS) */}
      <div className="relative w-full overflow-hidden border-y border-[#00ff88]/30 bg-[#07100b] py-3.5 shadow-[0_0_20px_rgba(0,255,136,0.15)]">
        <div className="flex w-max animate-marquee-right">
          {[...Array(2)].map((_, i) => (
            <div key={i} className="flex items-center gap-8 text-xs sm:text-sm font-black tracking-widest text-[#00ff88] uppercase whitespace-nowrap px-4">
              <span className="text-amber-300">★ 14,200+ CURATED CELEBRATIONS</span>
              <span className="text-stone-600 font-sans">•</span>
              <span className="text-white">LUCKNOW • JAIPUR • UDAIPUR • DELHI NCR</span>
              <span className="text-stone-600 font-sans">•</span>
              <span className="px-2.5 py-0.5 rounded-full bg-[#00ff88] text-[#050807] font-black">ZERO DOUBLE BOOKING SHIELD</span>
              <span className="text-stone-600 font-sans">•</span>
              <span className="text-stone-300">AWADHI GALOUTI KEBAB COUNTERS</span>
              <span className="text-stone-600 font-sans">•</span>
              <span className="text-[#00ff88]">LAKESIDE PALACE MANDAPS</span>
              <span className="text-stone-600 font-sans">•</span>
              <span className="text-white">CELEBRITY MAKEUP ARTISTS</span>
              <span className="text-stone-600 font-sans">•</span>
              <span className="px-2.5 py-0.5 rounded-full bg-rose-500 text-white font-black">4.95 / 5 RATED</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
