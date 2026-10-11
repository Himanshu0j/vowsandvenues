'use client'

import React from 'react'
import {
  MapPin,
  Star,
  ShieldCheck,
  Heart,
  Users,
  ArrowRight,
  Sparkles,
  Crown,
  Eye,
  CalendarDays,
  MessageSquare
} from 'lucide-react'
import { getOptimizedImageUrl } from '@/lib/imageUtils'
import TiltCard from './TiltCard'
import ScrollReveal, { TextLineReveal, ScrollStaggerContainer, ScrollStaggerItem } from './ScrollReveal'

export default function FeaturedVenuesEditorial({
  vendors = [],
  wishlistIds = [],
  onToggleFavorite,
  onSelectVendor,
  onAddToEvent,
  onNegotiate,
  onViewAll
}) {
  // Filter venues from the vendors list
  const venueVendors = vendors.filter(v => v.category === 'venues' || v.categorySlug === 'venues')
  
  // Use first venue as the Grand Hero Feature, next 3 as complementary
  const heroVenue = venueVendors[0] || vendors[0] || {
    id: 'v_royal_jagmandir',
    name: 'The Royal Jagmandir Island Palace & Lakeside Mandap',
    city: 'Udaipur',
    locality: 'Lake Pichola',
    category: 'Heritage Venues & Forts',
    startingPrice: 350000,
    priceUnit: 'day',
    guestCapacity: 800,
    rating: 4.98,
    reviewCount: 142,
    verified: true,
    heroImage: 'https://images.unsplash.com/photo-1519741497674-611481863552',
    description: 'Surrounded by the shimmering waters of Lake Pichola, offering private boat baraat access, centuries-old Mewari royal arches, and starlit open-air amphitheaters.'
  }

  const secondaryVenues = venueVendors.slice(1, 4).length > 0
    ? venueVendors.slice(1, 4)
    : vendors.slice(1, 4)

  const heroImgUrl = getOptimizedImageUrl(heroVenue.heroImage || heroVenue.image, { width: 1800, quality: 85 })
  const isHeroFavorite = wishlistIds.includes(heroVenue.id)

  return (
    <section className="py-16 sm:py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto select-none">
      
      {/* SECTION HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10 sm:mb-14 gap-4">
        <div>
          <ScrollReveal animation="fade-down" delay={0.05}>
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-champagne/15 border border-champagne/40 text-burgundy text-[11px] font-bold tracking-[0.2em] uppercase mb-2.5 shadow-2xs">
              <Crown className="w-3.5 h-3.5 text-champagne" />
              <span>Curated Heritage Portfolios</span>
              <span className="w-1.5 h-1.5 rounded-full bg-champagne animate-pulse" />
            </div>
          </ScrollReveal>

          <TextLineReveal
            lines={[
              'Distinguished Palaces',
              '& Sanctuaries.'
            ]}
            className="font-serif text-3xl sm:text-4xl md:text-5xl font-bold text-espresso tracking-tight"
            lineClassName="first:text-stone-900 last:italic last:font-normal last:text-burgundy"
            stagger={0.12}
          />

          <ScrollReveal animation="fade-up" delay={0.2}>
            <p className="text-xs sm:text-sm text-stone-600 mt-2 max-w-xl font-normal leading-relaxed">
              Hand-inspected royal citadels, lakeside island palaces, and manicured Mughal gardens with direct date-locking guarantees.
            </p>
          </ScrollReveal>
        </div>

        <ScrollReveal animation="fade-left" delay={0.25}>
          <button
            onClick={onViewAll}
            className="inline-flex items-center gap-2 text-xs font-bold text-burgundy hover:text-burgundy-dark transition-colors group cursor-pointer shrink-0"
          >
            <span className="underline underline-offset-4 decoration-champagne">View All Verified Venues ({venueVendors.length || vendors.length})</span>
            <ArrowRight className="w-4 h-4 text-champagne group-hover:translate-x-1 transition-transform" />
          </button>
        </ScrollReveal>
      </div>

      {/* EDITORIAL GRID: 1 EXPANSIVE HERO VENUE + 3 COMPLEMENTARY CARDS */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
        <ScrollReveal animation="fade-right" duration={0.85} className="lg:col-span-7">
          <TiltCard
            maxTilt={5}
            scale={1.01}
            className="rounded-3xl overflow-hidden bg-espresso text-white border-2 border-champagne/60 shadow-2xl min-h-[540px] h-full"
          >
          <div className="flex flex-col justify-between h-full relative group hover:border-champagne transition-all duration-700 min-h-[540px]">
            {/* 4K Background Photo */}
            <div 
              className="absolute inset-0 bg-cover bg-center transition-transform duration-1000 group-hover:scale-105"
              style={{ backgroundImage: `url('${heroImgUrl}')` }}
            />
          
          {/* Multi-tier Editorial Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#14060b]/95 via-[#14060b]/35 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#14060b]/70 via-transparent to-transparent" />
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-transparent via-champagne to-transparent opacity-90" />

          {/* TOP PILLS */}
          <div className="relative z-10 p-6 sm:p-8 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="px-3.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-burgundy text-amber-200 border border-champagne/40 shadow-md">
                Signature Royal Feature
              </span>
              {heroVenue.verified && (
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-[10px] font-semibold bg-black/60 backdrop-blur-md text-amber-200 border border-white/20">
                  <ShieldCheck className="w-3.5 h-3.5 text-champagne" />
                  <span>Government Licensed</span>
                </span>
              )}
            </div>

            <button
              onClick={(e) => {
                e.stopPropagation()
                onToggleFavorite(heroVenue.id)
              }}
              title={isHeroFavorite ? "Remove from Saved" : "Save to Favorites"}
              className="w-10 h-10 rounded-full bg-black/50 backdrop-blur-md border border-white/20 flex items-center justify-center text-white hover:text-rose-400 hover:scale-110 active:scale-95 transition-all shadow-md cursor-pointer"
            >
              <Heart className={`w-4 h-4 ${isHeroFavorite ? 'fill-rose-500 text-rose-500 scale-110' : ''}`} />
            </button>
          </div>

          {/* BOTTOM CONTENT OVERLAY */}
          <div className="relative z-10 p-6 sm:p-8 sm:pt-0">
            <div className="flex items-center gap-2 text-xs font-bold text-champagne uppercase tracking-widest mb-2">
              <MapPin className="w-3.5 h-3.5 text-champagne" />
              <span>{heroVenue.locality ? `${heroVenue.locality}, ${heroVenue.city}` : heroVenue.city}</span>
              <span className="text-stone-400">•</span>
              <span className="flex items-center gap-1 text-amber-200">
                <Star className="w-3.5 h-3.5 fill-champagne text-champagne" />
                <span>{heroVenue.rating ? heroVenue.rating.toFixed(1) : '4.98'}</span>
                <span className="text-stone-300 font-normal">({heroVenue.reviewCount || 140} reviews)</span>
              </span>
            </div>

            <h3 
              onClick={() => onSelectVendor(heroVenue)}
              className="font-serif text-2xl sm:text-3xl md:text-4xl font-bold text-white leading-tight mb-3 hover:text-champagne transition-colors cursor-pointer drop-shadow-md"
            >
              {heroVenue.name}
            </h3>

            <p className="text-xs sm:text-sm text-stone-200 leading-relaxed line-clamp-2 sm:line-clamp-none mb-6 font-light">
              {heroVenue.description || 'Surrounded by shimmering waters with authentic royal Mewari architecture, private boat access, and illuminated courtyards.'}
            </p>

            <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-white/15">
              <div className="flex items-center gap-4">
                <div className="bg-black/60 border border-champagne/40 px-4 py-2 rounded-xl backdrop-blur-md">
                  <div className="text-[9.5px] uppercase font-bold text-stone-300 tracking-wider">Starting Rate</div>
                  <div className="text-sm sm:text-base font-bold text-champagne font-serif">
                    ₹{(heroVenue.startingPrice || 350000).toLocaleString('en-IN')}
                    <span className="text-xs font-sans text-stone-300 font-normal"> / {heroVenue.priceUnit || 'day'}</span>
                  </div>
                </div>

                {heroVenue.guestCapacity && (
                  <div className="hidden sm:flex items-center gap-1.5 text-xs text-amber-100 bg-black/40 px-3 py-2 rounded-xl border border-white/10">
                    <Users className="w-4 h-4 text-champagne" />
                    <span>Up to {heroVenue.guestCapacity} Guests</span>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2">
                {onNegotiate && (
                  <button
                    onClick={() => onNegotiate(heroVenue)}
                    className="p-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-champagne border border-champagne/40 backdrop-blur-md transition-all hover:scale-105 active:scale-95 cursor-pointer"
                    title="Live Concierge Chat"
                  >
                    <MessageSquare className="w-4 h-4" />
                  </button>
                )}
                <button
                  onClick={() => onSelectVendor(heroVenue)}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-burgundy to-burgundy-dark hover:brightness-110 text-amber-100 font-bold text-xs flex items-center gap-2 shadow-lg transition-all hover:scale-105 active:scale-95 cursor-pointer border border-champagne/30"
                >
                  <span>View Palace Details</span>
                  <ArrowRight className="w-4 h-4 text-champagne" />
                </button>
              </div>
            </div>
          </div>
          </div>
        </TiltCard>
      </ScrollReveal>

        {/* ============================================================== */}
        {/* 2. COMPLEMENTARY VENUE CARDS (Takes 5 of 12 columns on Desktop)*/}
        {/* ============================================================== */}
        <ScrollStaggerContainer staggerDelay={0.09} className="lg:col-span-5 flex flex-col justify-between gap-4">
          {secondaryVenues.map((v) => {
            const vImg = getOptimizedImageUrl(v.heroImage || v.image, { width: 800, quality: 75 })
            const isFav = wishlistIds.includes(v.id)

            return (
              <ScrollStaggerItem key={v.id} yOffset={24}>
                <TiltCard
                key={v.id}
                maxTilt={6}
                scale={1.01}
                className="rounded-2xl overflow-hidden bg-gradient-to-br from-[#fffdfa] via-[#faf6ee] to-[#f4ebe1] border border-[#e2d5c3] hover:border-champagne shadow-sm hover:shadow-xl transition-all duration-400"
              >
                <div
                  onClick={() => onSelectVendor(v)}
                  className="group cursor-pointer p-4 flex flex-col sm:flex-row gap-4 relative overflow-hidden h-full"
                >
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-burgundy via-champagne to-burgundy opacity-0 group-hover:opacity-100 transition-opacity" />

                {/* Thumbnail */}
                <div className="w-full sm:w-40 h-36 rounded-xl overflow-hidden relative shrink-0 bg-stone-100">
                  <img
                    src={vImg}
                    alt={v.name}
                    loading="eager"
                    decoding="async"
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  
                  {v.verified && (
                    <span className="absolute top-2 left-2 px-2 py-0.5 rounded text-[8.5px] font-bold bg-emerald-950/80 backdrop-blur-md text-emerald-200 border border-emerald-400/40">
                      Verified
                    </span>
                  )}

                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      onToggleFavorite(v.id)
                    }}
                    title="Bookmark"
                    className="absolute top-2 right-2 w-7 h-7 rounded-full bg-white/90 backdrop-blur-md flex items-center justify-center text-stone-700 hover:text-rose-500 transition-colors shadow-xs"
                  >
                    <Heart className={`w-3.5 h-3.5 ${isFav ? 'fill-rose-500 text-rose-500' : ''}`} />
                  </button>

                  <div className="absolute bottom-1.5 left-2 right-2 flex items-center justify-between text-white text-[10px] font-semibold">
                    <span className="flex items-center gap-1 text-champagne">
                      <Star className="w-3 h-3 fill-champagne" /> {v.rating ? v.rating.toFixed(1) : '4.9'}
                    </span>
                    {v.guestCapacity && (
                      <span className="truncate">{v.guestCapacity} guests</span>
                    )}
                  </div>
                </div>

                {/* Details */}
                <div className="flex-1 min-w-0 flex flex-col justify-between">
                  <div>
                    <div className="text-[10px] font-bold text-stone-500 uppercase tracking-wider flex items-center gap-1 mb-1">
                      <MapPin className="w-3 h-3 text-burgundy" />
                      <span className="truncate">{v.locality ? `${v.locality}, ${v.city}` : v.city}</span>
                    </div>

                    <h4 className="font-serif font-bold text-sm sm:text-base text-espresso group-hover:text-burgundy transition-colors line-clamp-1 mb-1">
                      {v.name}
                    </h4>

                    <p className="text-[11px] text-stone-600 line-clamp-2 font-normal leading-relaxed mb-2">
                      {v.description || 'Exclusive luxury celebration setting with full catering and decor capabilities.'}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-[#e2d5c3] flex items-center justify-between">
                    <div>
                      <span className="text-[9.5px] text-stone-400 uppercase font-semibold block">From</span>
                      <span className="font-serif font-bold text-xs sm:text-sm text-burgundy">
                        ₹{(v.startingPrice || 250000).toLocaleString('en-IN')}
                        <span className="text-[9.5px] font-sans text-stone-500 font-normal"> / {v.priceUnit || 'event'}</span>
                      </span>
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        onSelectVendor(v)
                      }}
                      className="px-3 py-1 rounded-lg bg-burgundy hover:bg-burgundy-dark text-amber-200 text-[11px] font-bold flex items-center gap-1 transition-all shadow-2xs"
                    >
                      <span>Explore</span>
                      <ArrowRight className="w-3 h-3 text-champagne" />
                    </button>
                  </div>
                </div>
              </div>
              </TiltCard>
            </ScrollStaggerItem>
            )
          })}
        </ScrollStaggerContainer>

      </div>
    </section>
  )
}
