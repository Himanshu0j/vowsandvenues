'use client'

import React, { useRef } from 'react'
import {
  Crown,
  MapPin,
  CalendarDays,
  ShieldCheck,
  Star,
  Users,
  ArrowRight,
  Eye,
  Sparkles
} from 'lucide-react'
import { getOptimizedImageUrl } from '@/lib/imageUtils'
import TiltCard from './TiltCard'

export default function RoyalVenueRevealSection({
  onSelectVenue,
  onCheckAvailability,
  onExploreVenues
}) {
  const palaceImg = getOptimizedImageUrl(
    'https://images.unsplash.com/photo-1587271407850-8d438ca9fdf2',
    { width: 2200, quality: 85 }
  )

  return (
    <section className="py-20 sm:py-28 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto select-none overflow-hidden">
      
      {/* SECTION HEADER */}
      <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-champagne/15 border border-champagne/40 text-burgundy text-[11px] font-bold tracking-[0.22em] uppercase mb-3 shadow-2xs">
          <Crown className="w-3.5 h-3.5 text-champagne" />
          <span>Scene II · The Royal Heritage Reveal</span>
        </div>
        <h2 className="font-serif text-3xl sm:text-5xl md:text-6xl font-bold text-espresso tracking-tight leading-[1.12]">
          Step into Majestic <br className="hidden sm:inline" />
          <span className="italic font-normal text-burgundy font-serif">Living Royalty</span>
        </h2>
        <p className="text-xs sm:text-sm text-stone-600 mt-3 font-normal leading-relaxed max-w-xl mx-auto">
          Immerse your celebration within sandstone ramparts, carved jharokhas, and starlit Mewari courtyards hand-preserved for generations.
        </p>
      </div>

      {/* EXPANSIVE 3D TILT PALACE HERO FRAME */}
      <TiltCard
        maxTilt={6}
        scale={1.01}
        className="rounded-3xl sm:rounded-[2.5rem] overflow-hidden bg-espresso border-2 border-champagne/70 shadow-[0_30px_90px_rgba(30,10,20,0.25)] relative group text-white min-h-[520px] sm:min-h-[580px] flex flex-col justify-between"
      >
        {/* Full-Bleed 4K Heritage Photography */}
        <div
          className="absolute inset-0 bg-cover bg-center transition-transform duration-1000 group-hover:scale-106"
          style={{ backgroundImage: `url('${palaceImg}')` }}
        />

        {/* Cinematic Scrim & Ambient Glow */}
        <div className="absolute inset-0 bg-gradient-to-t from-espresso/95 via-espresso/35 to-black/30" />
        <div className="absolute inset-0 bg-gradient-to-r from-espresso/80 via-transparent to-espresso/60" />

        {/* Top Gold Foil Accent Bar */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-burgundy via-champagne to-burgundy" />

        {/* Top Floating Glass Badges */}
        <div className="relative z-10 p-6 sm:p-10 flex flex-wrap items-center justify-between gap-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-black/60 backdrop-blur-md border border-amber-300/40 text-amber-200 text-xs font-semibold shadow-md">
            <Sparkles className="w-3.5 h-3.5 text-champagne" />
            <span>Featured Sanctuary of the Month</span>
          </div>

          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-black/60 backdrop-blur-md border border-white/20 text-stone-200 text-xs font-medium">
            <MapPin className="w-3.5 h-3.5 text-champagne" />
            <span>Rambagh Citadel &amp; Mughal Gardens · Jaipur</span>
          </div>
        </div>

        {/* Bottom Editorial Content & Key Features */}
        <div className="relative z-10 p-6 sm:p-10 flex flex-col lg:flex-row items-end justify-between gap-8">
          
          <div className="max-w-2xl space-y-3">
            <div className="flex items-center gap-3 text-xs text-amber-200 font-semibold">
              <span className="flex items-center gap-1">
                <Star className="w-4 h-4 fill-champagne text-champagne" />
                <span className="font-bold text-white text-sm">4.99 / 5</span>
                <span className="text-stone-300">(186 Royal Reviews)</span>
              </span>
              <span className="text-stone-400">•</span>
              <span className="flex items-center gap-1">
                <Users className="w-3.5 h-3.5 text-champagne" />
                <span>Up to 1,200 Guests</span>
              </span>
              <span className="text-stone-400">•</span>
              <span className="text-emerald-400 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Verified Heritage Citadel</span>
              </span>
            </div>

            <h3 className="font-serif text-2xl sm:text-4xl lg:text-5xl font-bold text-white tracking-tight leading-tight">
              Rambagh Heritage Citadel &amp; Mughal Courtyards
            </h3>

            <p className="text-xs sm:text-sm text-stone-200 font-light leading-relaxed max-w-xl">
              Authentic Mewari sandstone arches, central marble fountain pavilions, private vintage car baraat pathway, and starlit open-air amphitheater with royal Awadhi dawat banquets.
            </p>

            {/* Inclusions Pill Bar */}
            <div className="flex flex-wrap items-center gap-2 pt-2">
              <span className="px-3 py-1 rounded-full text-[10px] font-semibold bg-white/10 backdrop-blur-md border border-white/15 text-amber-100">
                🏰 3 Imperial Courtyards
              </span>
              <span className="px-3 py-1 rounded-full text-[10px] font-semibold bg-white/10 backdrop-blur-md border border-white/15 text-amber-100">
                👑 24 Royal Guest Suites
              </span>
              <span className="px-3 py-1 rounded-full text-[10px] font-semibold bg-white/10 backdrop-blur-md border border-white/15 text-amber-100">
                🌸 Fresh Mogra Mandap Included
              </span>
              <span className="px-3 py-1 rounded-full text-[10px] font-semibold bg-white/10 backdrop-blur-md border border-white/15 text-amber-100">
                🍲 Awadhi Shahi Dawat Certified
              </span>
            </div>
          </div>

          {/* Pricing & CTAs Box */}
          <div className="w-full lg:w-auto shrink-0 bg-stone-950/80 backdrop-blur-xl rounded-2xl p-5 sm:p-6 border border-amber-300/40 shadow-2xl space-y-4">
            <div>
              <div className="text-[10px] uppercase font-bold text-stone-400 tracking-wider">
                Exclusivity Package Rate
              </div>
              <div className="flex items-baseline gap-2 mt-0.5">
                <span className="font-serif font-bold text-2xl sm:text-3xl text-amber-300">
                  ₹2,80,000
                </span>
                <span className="text-xs text-stone-300">/ full day</span>
              </div>
              <div className="text-[10px] text-emerald-400 font-medium flex items-center gap-1 mt-1">
                <ShieldCheck className="w-3 h-3" />
                <span>25% Advance Lock · Zero Markups</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row lg:flex-col gap-2">
              <button
                onClick={onCheckAvailability}
                className="w-full px-6 py-3 rounded-xl bg-gradient-to-r from-[#e6ca65] via-[#ffd700] to-[#c5a059] hover:brightness-110 text-stone-950 font-bold text-xs uppercase tracking-wider transition-all shadow-lg active:scale-95 cursor-pointer text-center flex items-center justify-center gap-2"
              >
                <CalendarDays className="w-3.5 h-3.5 text-stone-900" />
                <span>Check Date Availability</span>
              </button>

              <button
                onClick={onExploreVenues}
                className="w-full px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-xs tracking-wider border border-white/20 transition-all active:scale-95 cursor-pointer text-center flex items-center justify-center gap-1.5"
              >
                <span>View Full Palace Roster</span>
                <ArrowRight className="w-3.5 h-3.5 text-amber-300" />
              </button>
            </div>
          </div>

        </div>
      </TiltCard>

    </section>
  )
}
