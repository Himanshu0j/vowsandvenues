'use client'

import React from 'react'
import {
  Building2,
  Utensils,
  Sparkles,
  Palette,
  Shirt,
  Camera,
  Music,
  Gift,
  Flower2,
  MailOpen,
  CalendarDays,
  ArrowRight,
  Crown
} from 'lucide-react'
import { getOptimizedImageUrl } from '@/lib/imageUtils'
import TiltCard from './TiltCard'
import ScrollReveal, { TextLineReveal, ScrollStaggerContainer, ScrollStaggerItem } from './ScrollReveal'

const ICON_MAP = {
  venues: Building2,
  catering: Utensils,
  decor: Sparkles,
  makeup: Palette,
  outfits: Shirt,
  photography: Camera,
  music: Music,
  gifts: Gift,
  florists: Flower2,
  invitations: MailOpen,
  planners: CalendarDays
}

const CATEGORY_ATELIER_META = {
  venues: {
    badge: 'Heritage Palaces & Forts',
    subtext: 'Lake Pichola, Rambagh & Havelis'
  },
  catering: {
    badge: 'Awadhi & Royal Feasts',
    subtext: 'Shahi Dum Pukht & Live Counters'
  },
  decor: {
    badge: 'Mandaps & Scenography',
    subtext: 'Mogra Canopies & Crystal Glass'
  },
  makeup: {
    badge: 'Celebrity HD Bridal Glam',
    subtext: 'Airbrush Styling & Draping'
  },
  outfits: {
    badge: 'Couture Trousseau Rentals',
    subtext: 'Zardozi Lehengas & Sherwanis'
  },
  photography: {
    badge: '4K Cinema & Aerial Drone',
    subtext: 'Candid Memoirs & Teasers'
  },
  music: {
    badge: 'DJ Kabir & Royal Dhol',
    subtext: 'Punjabi Beats & Sufi Bands'
  },
  gifts: {
    badge: 'Artisanal Favors & Brass',
    subtext: 'Royal Dry Fruit Hampers'
  },
  florists: {
    badge: 'Fresh Exotic Florals',
    subtext: 'Fragrant Varmalas & Entryways'
  },
  invitations: {
    badge: 'Scrolls & 3D Video Invites',
    subtext: 'Velvet Box Suites & RSVP Portals'
  },
  planners: {
    badge: 'Royal Wedding Architects',
    subtext: 'Turnkey Day-Of Execution'
  }
}

export default function EditorialCategories({ categories = [], onSelectCategory, cmsContent }) {
  const dynamicCategoryImages = cmsContent?.categoryImages || {}

  return (
    <section className="py-16 sm:py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto select-none">
      
      {/* SECTION HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10 sm:mb-12 gap-4">
        <div>
          <ScrollReveal animation="fade-down" delay={0.05}>
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-champagne/15 border border-champagne/40 text-burgundy text-[11px] font-bold tracking-[0.2em] uppercase mb-3 shadow-2xs">
              <Crown className="w-3.5 h-3.5 text-champagne" />
              <span>The Royal Atelier Spectrum</span>
            </div>
          </ScrollReveal>

          <TextLineReveal
            lines={[
              'Explore by',
              'Celebration Craft.'
            ]}
            className="font-serif text-3xl sm:text-4xl md:text-5xl font-bold text-espresso tracking-tight"
            lineClassName="first:text-stone-900 last:italic last:font-normal last:text-burgundy"
            stagger={0.12}
          />

          <ScrollReveal animation="fade-up" delay={0.2}>
            <p className="text-xs sm:text-sm text-stone-600 mt-2 max-w-xl font-normal leading-relaxed">
              Curated across 11 distinguished categories with verified physical inspections and certified rate sheets.
            </p>
          </ScrollReveal>
        </div>
        
        <ScrollReveal animation="fade-left" delay={0.25}>
          <button
            onClick={() => onSelectCategory('all')}
            className="text-xs font-bold text-burgundy hover:text-burgundy-dark flex items-center gap-1.5 transition-colors group cursor-pointer"
          >
            <span className="underline underline-offset-4 decoration-champagne">View Complete Directory</span>
            <ArrowRight className="w-4 h-4 text-champagne group-hover:translate-x-1 transition-transform" />
          </button>
        </ScrollReveal>
      </div>

      {/* 11 HIGH-FASHION EDITORIAL CATEGORY CARDS WITH SCROLL STAGGER */}
      <ScrollStaggerContainer
        staggerDelay={0.06}
        className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4.5"
      >
        {categories.map((cat, idx) => {
          const IconComponent = ICON_MAP[cat.slug] || Sparkles
          const meta = CATEGORY_ATELIER_META[cat.slug] || { 
            badge: 'Verified Craft',
            subtext: 'Curated Wedding Masters'
          }
          const rawImg = dynamicCategoryImages[cat.slug] || cat.image || 'https://images.unsplash.com/photo-1587271407850-8d438ca9fdf2'
          const catImg = getOptimizedImageUrl(rawImg, { width: 600, quality: 85 })

          return (
            <ScrollStaggerItem key={cat.id || cat.slug} yOffset={28}>
              <TiltCard
                maxTilt={7}
                scale={1.02}
                className="rounded-2xl sm:rounded-3xl overflow-hidden bg-white border border-[#e8dfcf] hover:border-champagne shadow-sm hover:shadow-2xl transition-all duration-500 cursor-pointer flex flex-col justify-between h-full"
              >
                <div
                  onClick={() => onSelectCategory(cat.slug)}
                  className="group flex flex-col justify-between h-full"
                >
                  {/* Category Portrait Image (Taller 4:5 Aspect Ratio for Rich Drama) */}
                  <div className="relative aspect-[4/5] w-full overflow-hidden bg-stone-900">
                    <img
                      src={catImg}
                      alt={cat.name}
                      loading="eager"
                      decoding="async"
                      className="w-full h-full object-cover group-hover:scale-112 transition-transform duration-700 ease-out"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#14060b]/90 via-[#14060b]/35 to-transparent" />
                    
                    {/* Floating Top Badge */}
                    <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between">
                      <div className="w-7 h-7 rounded-xl bg-black/50 backdrop-blur-md text-amber-300 border border-amber-300/30 flex items-center justify-center shadow-xs">
                        <IconComponent className="w-3.5 h-3.5" />
                      </div>
                      <span className="px-2 py-0.5 rounded-full text-[9px] font-bold tracking-wider uppercase backdrop-blur-md bg-stone-950/70 text-amber-200 border border-white/20">
                        {cat.vendorCount || 4}+ Verified
                      </span>
                    </div>

                    {/* Bottom Overlay Title & Subtext */}
                    <div className="absolute bottom-2.5 left-2.5 right-2.5 text-white">
                      <span className="text-[9px] uppercase font-bold text-champagne tracking-wider block truncate">
                        {meta.badge}
                      </span>
                      <h3 className="font-serif font-bold text-sm sm:text-base text-white truncate group-hover:text-amber-200 transition-colors">
                        {cat.name}
                      </h3>
                    </div>
                  </div>

                  {/* Card Footer: Starting Price in Warm Ivory Bar */}
                  <div className="p-3 bg-gradient-to-b from-[#fffdfa] to-[#faf6ee] border-t border-[#f0e6d6] flex items-center justify-between">
                    <div>
                      <span className="text-[9px] text-stone-400 uppercase tracking-wider font-semibold block">Starts at</span>
                      <span className="font-serif font-bold text-burgundy text-xs sm:text-sm">
                        ₹{(cat.startingPrice || 1000).toLocaleString('en-IN')}
                      </span>
                    </div>
                    <span className="w-6 h-6 rounded-full bg-amber-100/80 group-hover:bg-burgundy text-burgundy group-hover:text-amber-200 flex items-center justify-center transition-colors text-xs font-bold">
                      &rarr;
                    </span>
                  </div>
                </div>
              </TiltCard>
            </ScrollStaggerItem>
          )
        })}
      </ScrollStaggerContainer>
    </section>
  )
}
