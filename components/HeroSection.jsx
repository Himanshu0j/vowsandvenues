'use client'

import React from 'react'
import {
  MapPin,
  Calendar,
  Users,
  Search,
  ArrowRight,
  Sparkles,
  Building2
} from 'lucide-react'
import { getOptimizedImageUrl } from '@/lib/imageUtils'
import { motion } from 'framer-motion'
import { luxuryEasing } from './ScrollReveal'

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
    headline: "Where Timeless Heritage Meets Unforgettable Celebrations",
    subheadline: "From illuminated island palaces in Udaipur to authentic Awadhi banquets in Lucknow — discover and book India's most distinguished verified event creators.",
    badge: "The Royal Wedding & Celebration Concierge",
    heroImage: "https://images.unsplash.com/photo-1519741497674-611481863552",
    locationTag: "Lake Pichola, Udaipur"
  }

  // Authentic 4K Photography (sharp, natural, un-blurred)
  const backdrop4K = getOptimizedImageUrl(
    heroData.heroImage || 'https://images.unsplash.com/photo-1519741497674-611481863552',
    { width: 2560, quality: 85 }
  )

  return (
    <div className="relative w-full overflow-hidden bg-stone-950">
      
      {/* ============================================================== */}
      {/* 1. EDITORIAL FULL-BLEED HERO VIEWPORT                           */}
      {/* Clean architectural framing with authentic photography         */}
      {/* ============================================================== */}
      <section className="relative min-h-[78vh] sm:min-h-[82vh] lg:min-h-[86vh] flex flex-col justify-between pt-6 sm:pt-10 pb-8 sm:pb-12 px-4 sm:px-6 lg:px-8 select-none">
        
        {/* Authentic High-Resolution Photography (No artificial blur, natural lighting) */}
        <div 
          className="absolute inset-0 bg-cover bg-center transition-transform duration-1000 ease-out scale-100 pointer-events-none"
          style={{ 
            backgroundImage: `url('${backdrop4K}')`,
            backgroundPosition: 'center 45%'
          }}
        />

        {/* Refined Photographic Scrim: deep warm espresso/wine gradient for pristine text contrast */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#14080D]/95 via-[#180A12]/50 to-black/35 pointer-events-none" />
        <div className="absolute inset-0 bg-radial-at-c from-transparent via-[#14080D]/20 to-[#14080D]/75 pointer-events-none" />

        {/* Fine Antique Gold Header Accent Line */}
        <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[#C5A059]/40 to-transparent" />

        {/* SUBTLE TOP OVERLINE / LOCATION IDENTIFIER */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: luxuryEasing }}
          className="relative z-20 max-w-5xl mx-auto w-full flex items-center justify-between text-white/90"
        >
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-black/40 backdrop-blur-md border border-white/15 text-amber-200/90 text-[11px] font-medium tracking-[0.2em] uppercase shadow-sm">
            <span className="w-1.5 h-1.5 rounded-full bg-[#C5A059]" />
            <span>{heroData.badge || "Curated Heritage Venues & Masters"}</span>
          </div>

          <div className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/40 backdrop-blur-md border border-white/15 text-stone-300 text-[11px] font-light shadow-sm">
            <MapPin className="w-3.5 h-3.5 text-[#C5A059]" />
            <span>{heroData.locationTag || "Lake Pichola · Udaipur"}</span>
          </div>
        </motion.div>

        {/* EDITORIAL HEADLINE, SUBHEADING & PRIMARY ACTIONS */}
        <div className="relative max-w-4xl mx-auto w-full text-center z-20 my-auto py-6 sm:py-8">
          
          {/* Main Editorial Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.75, ease: luxuryEasing }}
            className="font-serif text-3xl sm:text-5xl md:text-6xl font-normal tracking-tight text-white mb-4 leading-[1.14]"
          >
            Where Timeless Royalty Meets{' '}
            <span className="italic font-normal text-amber-100">
              Distinguished Celebrations
            </span>
          </motion.h1>

          {/* Graceful Editorial Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.15, ease: luxuryEasing }}
            className="max-w-2xl mx-auto text-xs sm:text-sm md:text-base text-stone-200/90 font-light mb-6 sm:mb-8 leading-relaxed px-2"
          >
            {heroData.subheadline || "From illuminated island palaces in Udaipur to authentic Awadhi banquets in Lucknow — discover and book India's most distinguished verified event creators."}
          </motion.p>

          {/* Direct, Refined Action CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, delay: 0.25, ease: luxuryEasing }}
            className="flex flex-wrap items-center justify-center gap-3 sm:gap-4"
          >
            <button
              type="button"
              onClick={onExploreVendors}
              className="px-6 py-2.5 sm:py-3 rounded-full bg-[#C5A059] hover:bg-[#B89047] text-[#1A0B13] font-semibold text-xs sm:text-sm flex items-center gap-2 shadow-lg transition-all active:scale-95 cursor-pointer"
            >
              <span>Explore Venues</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={onStartPlanning}
              className="px-5 py-2.5 sm:py-3 rounded-full bg-white/10 hover:bg-white/20 text-white font-medium text-xs sm:text-sm backdrop-blur-md border border-white/25 transition-all active:scale-95 cursor-pointer"
            >
              <span>Plan Your Event</span>
            </button>
          </motion.div>
        </div>

        {/* ============================================================== */}
        {/* 2. REFINED DOCKED DISCOVERY CONSOLE                            */}
        {/* Understated luxury, high contrast, seamless usability          */}
        {/* ============================================================== */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.75, delay: 0.35, ease: luxuryEasing }}
          className="relative z-20 max-w-4xl mx-auto w-full pt-2"
        >
          {/* Main Discovery Bar Card */}
          <div className="bg-white/95 sm:bg-white/98 backdrop-blur-xl rounded-2xl sm:rounded-full p-2 sm:p-2.5 shadow-[0_20px_50px_rgba(20,8,13,0.3)] border border-stone-200/90 text-stone-900 transition-all">
            
            {/* Desktop: Horizontal 3-Segment Pill + Search Button */}
            <div className="hidden sm:flex items-center justify-between gap-2">
              
              {/* Segment 1: Celebration Type */}
              <div className="flex-1 px-4 py-1.5 border-r border-stone-200/80 min-w-0">
                <label className="block text-[10px] font-bold text-[#6E2338] uppercase tracking-wider mb-0.5">
                  Celebration
                </label>
                <select
                  value={heroSearch.eventType}
                  onChange={(e) => setHeroSearch({ ...heroSearch, eventType: e.target.value })}
                  className="w-full bg-transparent font-medium text-stone-900 text-xs sm:text-sm focus:outline-none cursor-pointer truncate pr-1"
                >
                  {eventTypes.map(t => (
                    <option key={t.id} value={t.name}>{t.name}</option>
                  ))}
                </select>
              </div>

              {/* Segment 2: Destination City */}
              <div className="flex-1 px-4 py-1.5 border-r border-stone-200/80 min-w-0">
                <label className="block text-[10px] font-bold text-[#6E2338] uppercase tracking-wider mb-0.5">
                  Destination
                </label>
                <select
                  value={heroSearch.city}
                  onChange={(e) => {
                    setHeroSearch({ ...heroSearch, city: e.target.value })
                    setSelectedCity(e.target.value)
                  }}
                  className="w-full bg-transparent font-medium text-stone-900 text-xs sm:text-sm focus:outline-none cursor-pointer truncate pr-1"
                >
                  {cities.filter(c => c !== 'All Cities').map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              {/* Segment 3: Guests & Scale */}
              <div className="flex-1 px-4 py-1.5 min-w-0">
                <label className="block text-[10px] font-bold text-[#6E2338] uppercase tracking-wider mb-0.5">
                  Scale &amp; Guests
                </label>
                <select
                  value={heroSearch.guests}
                  onChange={(e) => setHeroSearch({ ...heroSearch, guests: e.target.value })}
                  className="w-full bg-transparent font-medium text-stone-900 text-xs sm:text-sm focus:outline-none cursor-pointer truncate pr-1"
                >
                  <option value="50">50 – 100 Guests (Intimate)</option>
                  <option value="250">200 – 350 Guests (Grand)</option>
                  <option value="500">500 – 800 Guests (Royal)</option>
                  <option value="1200">1000+ Guests (Extravaganza)</option>
                </select>
              </div>

              {/* Segment 4: Search Action Button */}
              <button
                type="button"
                onClick={onExploreVendors}
                className="px-6 py-3 rounded-full bg-[#2D0B16] hover:bg-[#3D101E] text-amber-100 font-semibold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md transition-all active:scale-95 shrink-0 cursor-pointer"
              >
                <Search className="w-4 h-4 text-[#C5A059]" />
                <span>Search Venues</span>
              </button>

            </div>

            {/* Mobile: Clean Stacked Form with 44px min touch targets */}
            <div className="sm:hidden space-y-2 p-1">
              <div className="bg-stone-50 rounded-xl p-2.5 border border-stone-200">
                <label className="block text-[10px] font-bold text-[#6E2338] uppercase tracking-wider mb-0.5">
                  Celebration
                </label>
                <select
                  value={heroSearch.eventType}
                  onChange={(e) => setHeroSearch({ ...heroSearch, eventType: e.target.value })}
                  className="w-full bg-transparent font-medium text-stone-900 text-xs focus:outline-none cursor-pointer"
                >
                  {eventTypes.map(t => (
                    <option key={t.id} value={t.name}>{t.name}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="bg-stone-50 rounded-xl p-2.5 border border-stone-200">
                  <label className="block text-[10px] font-bold text-[#6E2338] uppercase tracking-wider mb-0.5">
                    Destination
                  </label>
                  <select
                    value={heroSearch.city}
                    onChange={(e) => {
                      setHeroSearch({ ...heroSearch, city: e.target.value })
                      setSelectedCity(e.target.value)
                    }}
                    className="w-full bg-transparent font-medium text-stone-900 text-xs focus:outline-none cursor-pointer"
                  >
                    {cities.filter(c => c !== 'All Cities').map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div className="bg-stone-50 rounded-xl p-2.5 border border-stone-200">
                  <label className="block text-[10px] font-bold text-[#6E2338] uppercase tracking-wider mb-0.5">
                    Guests
                  </label>
                  <select
                    value={heroSearch.guests}
                    onChange={(e) => setHeroSearch({ ...heroSearch, guests: e.target.value })}
                    className="w-full bg-transparent font-medium text-stone-900 text-xs focus:outline-none cursor-pointer"
                  >
                    <option value="50">50–100</option>
                    <option value="250">200–350</option>
                    <option value="500">500–800</option>
                    <option value="1200">1000+</option>
                  </select>
                </div>
              </div>

              <button
                type="button"
                onClick={onExploreVendors}
                className="w-full py-3 rounded-xl bg-[#2D0B16] hover:bg-[#3D101E] text-amber-100 font-semibold text-xs flex items-center justify-center gap-2 shadow-md transition-all active:scale-95 cursor-pointer mt-1"
              >
                <Search className="w-3.5 h-3.5 text-[#C5A059]" />
                <span>Search Venues</span>
              </button>
            </div>

          </div>

          {/* Understated Curated Quick Links */}
          <div className="flex items-center justify-center gap-2 sm:gap-3 mt-3 text-[11px] text-stone-300 overflow-x-auto no-scrollbar py-0.5 px-2">
            <span className="font-medium text-amber-200/90 whitespace-nowrap">Curated:</span>
            <button
              type="button"
              onClick={() => {
                setHeroSearch({ ...heroSearch, eventType: 'Wedding' })
                onExploreVendors()
              }}
              className="text-stone-300 hover:text-white transition-colors cursor-pointer whitespace-nowrap"
            >
              Heritage Palaces
            </button>
            <span className="text-stone-500">·</span>
            <button
              type="button"
              onClick={() => {
                setHeroSearch({ ...heroSearch, eventType: 'Wedding' })
                onExploreVendors()
              }}
              className="text-stone-300 hover:text-white transition-colors cursor-pointer whitespace-nowrap"
            >
              Awadhi Feasts
            </button>
            <span className="text-stone-500">·</span>
            <button
              type="button"
              onClick={() => {
                setHeroSearch({ ...heroSearch, eventType: 'Sangeet' })
                onExploreVendors()
              }}
              className="text-stone-300 hover:text-white transition-colors cursor-pointer whitespace-nowrap"
            >
              Floral Mandaps
            </button>
            <span className="text-stone-500">·</span>
            <button
              type="button"
              onClick={() => {
                setHeroSearch({ ...heroSearch, eventType: 'Wedding' })
                onExploreVendors()
              }}
              className="text-stone-300 hover:text-white transition-colors cursor-pointer whitespace-nowrap"
            >
              Candid Cinema
            </button>
          </div>
        </motion.div>

      </section>

    </div>
  )
}
