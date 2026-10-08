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

export default function EditorialCategories({ categories = [], onSelectCategory }) {
  return (
    <section className="py-12 sm:py-16 px-3.5 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 sm:mb-10">
        <div>
          <div className="text-[11px] uppercase font-bold tracking-[0.2em] text-[#4a1525] mb-1">
            Complete Event Architecture
          </div>
          <h2 className="font-serif text-2xl sm:text-3xl md:text-4xl font-bold text-[#1c1917]">
            Explore by Specialization
          </h2>
        </div>
        <button
          onClick={() => onSelectCategory('all')}
          className="text-xs font-bold text-[#4a1525] hover:underline flex items-center gap-1.5 mt-2 sm:mt-0"
        >
          <span>View All 11 Categories</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2.5 sm:gap-4">
        {categories.map((cat) => {
          const IconComponent = ICON_MAP[cat.slug] || Sparkles
          const catImg = getOptimizedImageUrl(cat.image, { width: 400, quality: 75 })
          return (
            <div
              key={cat.id || cat.slug}
              onClick={() => onSelectCategory(cat.slug)}
              className="group cursor-pointer rounded-2xl overflow-hidden bg-white border border-[#e8e2d5] hover:border-[#c5a059] shadow-sm hover:shadow-lg transition-all flex flex-col justify-between"
            >
              {/* Category Image with Subtle Zoom */}
              <div className="relative aspect-[4/3] w-full overflow-hidden bg-stone-100">
                <img
                  src={catImg}
                  alt={cat.name}
                  loading="lazy"
                  decoding="async"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                
                {/* Vendor Count Pill */}
                <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded-full bg-black/60 backdrop-blur-sm text-[10px] text-white font-medium">
                  {cat.vendorCount || 4}+ Verified
                </div>
              </div>

              {/* Title & Starting Price */}
              <div className="p-3">
                <div className="flex items-center gap-1.5 mb-1 text-[#4a1525]">
                  <IconComponent className="w-3.5 h-3.5" />
                  <span className="font-serif font-bold text-xs text-[#1c1917] truncate group-hover:text-[#4a1525] transition-colors">
                    {cat.name}
                  </span>
                </div>
                <div className="text-[11px] text-[#78716c]">
                  From <span className="font-semibold text-stone-900">₹{(cat.startingPrice || 1000).toLocaleString('en-IN')}</span>
                  {cat.unit && <span className="text-[10px] text-stone-400"> /{cat.unit.replace('per ', '')}</span>}
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}
