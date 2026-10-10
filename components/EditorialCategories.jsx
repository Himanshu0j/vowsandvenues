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

const CATEGORY_THEME = {
  venues: { badge: 'Heritage & Forts' },
  catering: { badge: 'Awadhi & Feasts' },
  decor: { badge: 'Mandaps & Lights' },
  makeup: { badge: 'HD Bridal Glam' },
  outfits: { badge: 'Couture Rentals' },
  photography: { badge: '4K Cinema Films' },
  music: { badge: 'DJ & Dhol Beats' },
  gifts: { badge: 'Luxury Favors' },
  florists: { badge: 'Fresh Garlands' },
  invitations: { badge: 'Bespoke E-Cards' },
  planners: { badge: 'Full Concierge' }
}

export default function EditorialCategories({ categories = [], onSelectCategory }) {
  return (
    <section className="py-14 sm:py-18 px-3.5 sm:px-6 lg:px-8 max-w-7xl mx-auto select-none">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 sm:mb-10 gap-3">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#00ff88]/10 border border-[#00ff88]/40 text-[#00ff88] text-xs font-black tracking-widest uppercase mb-2 shadow-[0_0_12px_rgba(0,255,136,0.3)]">
            <Sparkles className="w-3.5 h-3.5 text-[#00ff88]" />
            <span>Complete Celebration Spectrum</span>
          </div>
          <h2 className="font-serif text-2xl sm:text-3xl md:text-4xl font-black text-white tracking-tight flex items-center gap-2">
            <span>Explore by Specialization</span>
            <span className="text-[#00ff88]">✦</span>
          </h2>
        </div>
        <button
          onClick={() => onSelectCategory('all')}
          className="text-xs font-black text-[#00ff88] hover:text-[#05f279] flex items-center gap-1.5 mt-2 sm:mt-0 transition-colors group cursor-pointer"
        >
          <span className="underline underline-offset-4 decoration-[#00ff88]">View All 11 Verified Categories</span>
          <ArrowRight className="w-4 h-4 text-[#00ff88] group-hover:translate-x-1 transition-transform" />
        </button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3.5 sm:gap-4.5">
        {categories.map((cat) => {
          const IconComponent = ICON_MAP[cat.slug] || Sparkles
          const theme = CATEGORY_THEME[cat.slug] || { badge: 'Featured' }
          const catImg = getOptimizedImageUrl(cat.image, { width: 400, quality: 75 })

          return (
            <div
              key={cat.id || cat.slug}
              onClick={() => onSelectCategory(cat.slug)}
              className="group cursor-pointer rounded-2xl overflow-hidden bg-[#091510] border-2 border-[#00ff88]/30 hover:border-[#00ff88] shadow-[0_10px_30px_rgba(0,0,0,0.8)] hover:shadow-[0_15px_40px_rgba(0,255,136,0.35)] transition-all duration-300 hover:-translate-y-1.5 flex flex-col justify-between card-3d-hover relative"
            >
              {/* Category Image with Subtle Zoom & Color Gradient */}
              <div className="relative aspect-[4/3] w-full overflow-hidden bg-[#050807]">
                <img
                  src={catImg}
                  alt={cat.name}
                  loading="lazy"
                  decoding="async"
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#091510] via-black/40 to-transparent" />
                
                {/* Floating Top Tag */}
                <div className="absolute top-2 left-2">
                  <span className="px-2 py-0.5 rounded-md text-[9px] font-black tracking-wider uppercase bg-[#00ff88]/20 text-[#00ff88] border border-[#00ff88]/50 backdrop-blur-md">
                    {theme.badge}
                  </span>
                </div>

                {/* Vendor Count Pill */}
                <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded-full bg-[#050807]/90 backdrop-blur-md text-[10px] text-[#00ff88] font-bold border border-[#00ff88]/30 flex items-center gap-1 shadow-sm">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#00ff88] shadow-[0_0_6px_#00ff88]"></span>
                  {cat.vendorCount || 4}+ Verified
                </div>
              </div>

              {/* Title & Starting Price */}
              <div className="p-3 bg-[#091510]">
                <div className="flex items-center gap-1.5 mb-1.5">
                  <div className="w-6 h-6 rounded-lg bg-[#00ff88]/20 text-[#00ff88] border border-[#00ff88]/40 flex items-center justify-center transition-colors shadow-xs">
                    <IconComponent className="w-3.5 h-3.5" />
                  </div>
                  <span className="font-serif font-bold text-xs text-white truncate group-hover:text-[#00ff88] transition-colors">
                    {cat.name}
                  </span>
                </div>
                <div className="text-[11px] text-stone-300 flex items-baseline gap-1 font-medium">
                  <span>From</span>
                  <span className="font-black text-[#00ff88] text-xs">₹{(cat.startingPrice || 1000).toLocaleString('en-IN')}</span>
                  {cat.unit && <span className="text-[9.5px] text-stone-400 truncate">/{cat.unit.replace('per ', '')}</span>}
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}
