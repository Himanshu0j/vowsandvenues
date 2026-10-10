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
  venues: {
    badge: 'Heritage & Forts',
    tagColor: 'bg-emerald-900/90 text-emerald-200 border-emerald-400/50',
    cardBg: 'bg-gradient-to-br from-[#ecfdf5] via-[#f7fef9] to-[#d1fae5]',
    cardBorder: 'border-emerald-300 hover:border-emerald-500',
    iconBg: 'bg-emerald-200/80 text-emerald-900',
    priceText: 'text-emerald-950'
  },
  catering: {
    badge: 'Awadhi & Feasts',
    tagColor: 'bg-orange-900/90 text-orange-200 border-orange-400/50',
    cardBg: 'bg-gradient-to-br from-[#fff7ed] via-[#fffaf5] to-[#fed7aa]',
    cardBorder: 'border-orange-300 hover:border-orange-500',
    iconBg: 'bg-orange-200/80 text-orange-900',
    priceText: 'text-orange-950'
  },
  decor: {
    badge: 'Mandaps & Lights',
    tagColor: 'bg-rose-900/90 text-rose-200 border-rose-400/50',
    cardBg: 'bg-gradient-to-br from-[#fff1f2] via-[#fff7f8] to-[#fecdd3]',
    cardBorder: 'border-rose-300 hover:border-rose-500',
    iconBg: 'bg-rose-200/80 text-rose-900',
    priceText: 'text-rose-950'
  },
  makeup: {
    badge: 'HD Bridal Glam',
    tagColor: 'bg-fuchsia-900/90 text-fuchsia-200 border-fuchsia-400/50',
    cardBg: 'bg-gradient-to-br from-[#fdf4ff] via-[#fcf7fd] to-[#f5d0fe]',
    cardBorder: 'border-fuchsia-300 hover:border-fuchsia-500',
    iconBg: 'bg-fuchsia-200/80 text-fuchsia-900',
    priceText: 'text-fuchsia-950'
  },
  outfits: {
    badge: 'Couture Rentals',
    tagColor: 'bg-indigo-900/90 text-indigo-200 border-indigo-400/50',
    cardBg: 'bg-gradient-to-br from-[#eef2ff] via-[#f8f9ff] to-[#c7d2fe]',
    cardBorder: 'border-indigo-300 hover:border-indigo-500',
    iconBg: 'bg-indigo-200/80 text-indigo-900',
    priceText: 'text-indigo-950'
  },
  photography: {
    badge: '4K Cinema Films',
    tagColor: 'bg-sky-900/90 text-sky-200 border-sky-400/50',
    cardBg: 'bg-gradient-to-br from-[#f0f9ff] via-[#f7fbff] to-[#bae6fd]',
    cardBorder: 'border-sky-300 hover:border-sky-500',
    iconBg: 'bg-sky-200/80 text-sky-900',
    priceText: 'text-sky-950'
  },
  music: {
    badge: 'DJ & Dhol Beats',
    tagColor: 'bg-purple-900/90 text-purple-200 border-purple-400/50',
    cardBg: 'bg-gradient-to-br from-[#faf5ff] via-[#fdfbfe] to-[#e9d5ff]',
    cardBorder: 'border-purple-300 hover:border-purple-500',
    iconBg: 'bg-purple-200/80 text-purple-900',
    priceText: 'text-purple-950'
  },
  gifts: {
    badge: 'Luxury Favors',
    tagColor: 'bg-teal-900/90 text-teal-200 border-teal-400/50',
    cardBg: 'bg-gradient-to-br from-[#f0fdfa] via-[#f7fefd] to-[#99f6e4]',
    cardBorder: 'border-teal-300 hover:border-teal-500',
    iconBg: 'bg-teal-200/80 text-teal-900',
    priceText: 'text-teal-950'
  },
  florists: {
    badge: 'Fresh Garlands',
    tagColor: 'bg-red-900/90 text-red-200 border-red-400/50',
    cardBg: 'bg-gradient-to-br from-[#fef2f2] via-[#fff8f8] to-[#fecaca]',
    cardBorder: 'border-red-300 hover:border-red-600',
    iconBg: 'bg-red-200/80 text-red-900',
    priceText: 'text-red-950'
  },
  invitations: {
    badge: 'Bespoke E-Cards',
    tagColor: 'bg-amber-900/90 text-amber-200 border-amber-400/50',
    cardBg: 'bg-gradient-to-br from-[#fefce8] via-[#fffef7] to-[#fef08a]',
    cardBorder: 'border-amber-300 hover:border-amber-500',
    iconBg: 'bg-amber-200/80 text-amber-900',
    priceText: 'text-amber-950'
  },
  planners: {
    badge: 'Full Concierge',
    tagColor: 'bg-cyan-900/90 text-cyan-200 border-cyan-400/50',
    cardBg: 'bg-gradient-to-br from-[#ecfeff] via-[#f5feff] to-[#a5f3fc]',
    cardBorder: 'border-cyan-300 hover:border-cyan-500',
    iconBg: 'bg-cyan-200/80 text-cyan-900',
    priceText: 'text-cyan-950'
  }
}

export default function EditorialCategories({ categories = [], onSelectCategory }) {
  return (
    <section className="py-12 sm:py-16 px-3.5 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 sm:mb-10">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-gradient-to-r from-amber-200 to-amber-300 text-amber-950 border border-amber-400 text-[11px] uppercase font-bold tracking-[0.2em] mb-2 shadow-sm">
            <Sparkles className="w-3.5 h-3.5 text-amber-700" /> Complete Celebration Spectrum
          </div>
          <h2 className="font-serif text-2xl sm:text-3xl md:text-4xl font-bold text-stone-900">
            Explore by Specialization
          </h2>
        </div>
        <button
          onClick={() => onSelectCategory('all')}
          className="text-xs font-bold text-[#4a1525] hover:text-[#781f3a] flex items-center gap-1.5 mt-2 sm:mt-0 transition-colors group"
        >
          <span className="underline underline-offset-4 decoration-amber-500">View All 11 Verified Categories</span>
          <ArrowRight className="w-4 h-4 text-amber-600 group-hover:translate-x-1 transition-transform" />
        </button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4.5">
        {categories.map((cat) => {
          const IconComponent = ICON_MAP[cat.slug] || Sparkles
          const theme = CATEGORY_THEME[cat.slug] || { 
            badge: 'Featured', 
            tagColor: 'bg-stone-900/80 text-stone-200 border-stone-500/40', 
            cardBg: 'bg-gradient-to-br from-amber-50 to-orange-50',
            cardBorder: 'border-amber-300',
            iconBg: 'bg-amber-100 text-amber-800',
            priceText: 'text-stone-900'
          }
          const catImg = getOptimizedImageUrl(cat.image, { width: 400, quality: 75 })

          return (
            <div
              key={cat.id || cat.slug}
              onClick={() => onSelectCategory(cat.slug)}
              className={`group cursor-pointer rounded-2xl overflow-hidden ${theme.cardBg} border-2 ${theme.cardBorder} shadow-sm hover:shadow-2xl transition-all duration-300 flex flex-col justify-between card-3d-hover`}
            >
              {/* Category Image with Subtle Zoom & Color Gradient */}
              <div className="relative aspect-[4/3] w-full overflow-hidden bg-stone-100">
                <img
                  src={catImg}
                  alt={cat.name}
                  loading="lazy"
                  decoding="async"
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />
                
                {/* Floating Top Tag */}
                <div className="absolute top-2 left-2">
                  <span className={`px-2 py-0.5 rounded-md text-[9px] font-bold tracking-wider uppercase backdrop-blur-md border ${theme.tagColor}`}>
                    {theme.badge}
                  </span>
                </div>

                {/* Vendor Count Pill */}
                <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded-full bg-black/70 backdrop-blur-md text-[10px] text-amber-200 font-semibold border border-white/10 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                  {cat.vendorCount || 4}+ Verified
                </div>
              </div>

              {/* Title & Starting Price */}
              <div className="p-3">
                <div className="flex items-center gap-1.5 mb-1.5">
                  <div className={`w-6 h-6 rounded-lg ${theme.iconBg} flex items-center justify-center transition-colors shadow-xs`}>
                    <IconComponent className="w-3.5 h-3.5" />
                  </div>
                  <span className="font-serif font-bold text-xs text-stone-900 truncate group-hover:text-[#4a1525] transition-colors">
                    {cat.name}
                  </span>
                </div>
                <div className="text-[11px] text-stone-700 flex items-baseline gap-1 font-medium">
                  <span>From</span>
                  <span className={`font-bold ${theme.priceText} text-xs`}>₹{(cat.startingPrice || 1000).toLocaleString('en-IN')}</span>
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
