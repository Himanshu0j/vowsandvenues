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
  ArrowRight
} from 'lucide-react'
import { getOptimizedImageUrl } from '@/lib/imageUtils'

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
    badge: 'Heritage & Forts',
    subtext: 'Royal Citadels & Havelis'
  },
  catering: {
    badge: 'Awadhi & Feasts',
    subtext: 'Shahi Dum Pukht Banquets'
  },
  decor: {
    badge: 'Mandaps & Lights',
    subtext: 'Fragrant Mogra & Crystal'
  },
  makeup: {
    badge: 'HD Bridal Glam',
    subtext: 'Celebrity Airbrush Artists'
  },
  outfits: {
    badge: 'Couture Rentals',
    subtext: 'Royal Lehengas & Sherwanis'
  },
  photography: {
    badge: '4K Cinema Films',
    subtext: 'Aerial Drone Storytellers'
  },
  music: {
    badge: 'DJ & Dhol Beats',
    subtext: 'Bollywood & Sufi Ensembles'
  },
  gifts: {
    badge: 'Luxury Favors',
    subtext: 'Brassware & Artisanal Boxes'
  },
  florists: {
    badge: 'Fresh Garlands',
    subtext: 'Varmalas & Rose Entryways'
  },
  invitations: {
    badge: 'Bespoke E-Cards',
    subtext: 'Velvet Box & Video Invites'
  },
  planners: {
    badge: 'Full Concierge',
    subtext: 'End-to-End Orchestration'
  }
}

export default function EditorialCategories({ categories = [], onSelectCategory, cmsContent }) {
  const dynamicCategoryImages = cmsContent?.categoryImages || {}

  return (
    <section className="py-12 sm:py-16 px-3.5 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 sm:mb-10">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-gradient-to-r from-amber-100 via-amber-200 to-amber-100 text-[#4a1525] border border-amber-300 text-[11px] uppercase font-bold tracking-[0.2em] mb-2 shadow-xs">
            <span>⚜</span> Complete Celebration Spectrum
          </div>
          <h2 className="font-serif text-2xl sm:text-3xl md:text-4xl font-bold text-[#1c1917] tracking-tight">
            Explore by Royal Specialization
          </h2>
        </div>
        <button
          onClick={() => onSelectCategory('all')}
          className="text-xs font-bold text-[#4a1525] hover:text-[#781f3a] flex items-center gap-1.5 mt-2 sm:mt-0 transition-colors group cursor-pointer"
        >
          <span className="underline underline-offset-4 decoration-amber-500">View All 11 Verified Categories</span>
          <ArrowRight className="w-4 h-4 text-amber-600 group-hover:translate-x-1 transition-transform" />
        </button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4.5">
        {categories.map((cat, idx) => {
          const IconComponent = ICON_MAP[cat.slug] || Sparkles
          const meta = CATEGORY_ATELIER_META[cat.slug] || { 
            badge: 'Verified Specialization',
            subtext: 'Curated Wedding Masters'
          }
          const rawImg = dynamicCategoryImages[cat.slug] || cat.image
          const catImg = getOptimizedImageUrl(rawImg, { width: 450, quality: 80 })

          return (
            <div
              key={cat.id || cat.slug}
              onClick={() => onSelectCategory(cat.slug)}
              className="group cursor-pointer rounded-2xl overflow-hidden bg-[#fffdfa] border border-[#e8dfcf] hover:border-[#c5a059] shadow-sm hover:shadow-xl transition-all duration-400 flex flex-col justify-between hover:-translate-y-1 relative"
            >
              {/* Category Image with Subtle Zoom & Film Grain Gradient */}
              <div className="relative aspect-[4/3] w-full overflow-hidden bg-stone-100">
                <img
                  src={catImg}
                  alt={cat.name}
                  loading="lazy"
                  decoding="async"
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#1b050d]/85 via-black/25 to-transparent" />
                
                {/* Floating Heritage Badge */}
                <div className="absolute top-2 left-2">
                  <span className="px-2 py-0.5 rounded-md text-[9px] font-bold tracking-wider uppercase backdrop-blur-md bg-[#4a1525]/90 text-amber-200 border border-amber-400/40 shadow-xs">
                    {meta.badge}
                  </span>
                </div>

                {/* Verified Count Pill */}
                <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded-full bg-stone-950/80 backdrop-blur-md text-[10px] text-amber-300 font-semibold border border-amber-400/30 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  {cat.vendorCount || 4}+ Verified
                </div>
              </div>

              {/* Title & Starting Price in Regal Alabaster Card */}
              <div className="p-3 bg-gradient-to-b from-[#fffdfa] to-[#faf6ee]">
                <div className="flex items-center gap-1.5 mb-1">
                  <div className="w-6 h-6 rounded-lg bg-amber-100/90 text-[#4a1525] border border-amber-300/60 flex items-center justify-center shrink-0 shadow-xs group-hover:bg-[#4a1525] group-hover:text-amber-200 transition-colors">
                    <IconComponent className="w-3.5 h-3.5" />
                  </div>
                  <span className="font-serif font-bold text-xs text-stone-900 truncate group-hover:text-[#4a1525] transition-colors">
                    {cat.name}
                  </span>
                </div>
                <div className="text-[11px] text-stone-600 flex items-baseline gap-1 font-medium">
                  <span className="text-[10px] text-stone-400 uppercase tracking-wider font-semibold">From</span>
                  <span className="font-serif font-bold text-[#4a1525] text-xs">₹{(cat.startingPrice || 1000).toLocaleString('en-IN')}</span>
                  {cat.unit && <span className="text-[9.5px] text-stone-500 truncate">/{cat.unit.replace('per ', '')}</span>}
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}
