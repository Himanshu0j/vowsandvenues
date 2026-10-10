'use client'

import React, { useState } from 'react'
import {
  Sparkles,
  MapPin,
  Camera,
  Eye,
  X,
  ExternalLink,
  Crown,
  Heart,
  ArrowUpRight
} from 'lucide-react'
import { INSPIRATION_GALLERY_ITEMS } from '@/lib/imageAssetLibrary'
import { getOptimizedImageUrl } from '@/lib/imageUtils'

const GALLERY_CATEGORIES = [
  'All Visuals',
  'Palaces & Forts',
  'Mandaps & Florals',
  'Catering & Feasts',
  'Couture & Details'
]

export default function WeddingInspirationGallery({ onExploreCategory }) {
  const [activeCategory, setActiveCategory] = useState('All Visuals')
  const [activeModalItem, setActiveModalItem] = useState(null)

  const filteredItems = activeCategory === 'All Visuals'
    ? INSPIRATION_GALLERY_ITEMS
    : INSPIRATION_GALLERY_ITEMS.filter(item => item.category === activeCategory)

  return (
    <section className="py-16 sm:py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto select-none border-t border-[#e8dfcf]">
      
      {/* SECTION HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 sm:mb-12 gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-champagne/15 border border-champagne/40 text-burgundy text-[11px] font-bold tracking-[0.2em] uppercase mb-2.5 shadow-2xs">
            <Camera className="w-3.5 h-3.5 text-champagne" />
            <span>The Wedding Gazette · Editorial Memoirs</span>
          </div>
          <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl font-bold text-espresso tracking-tight">
            Curated Inspiration Gallery
          </h2>
          <p className="text-xs sm:text-sm text-stone-600 mt-2 max-w-xl font-normal leading-relaxed">
            High-fashion editorial captures from Lake Pichola island processions to centuries-old Awadhi banquet banqueting.
          </p>
        </div>

        {/* CATEGORY FILTER PILLS */}
        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
          {GALLERY_CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                activeCategory === cat
                  ? 'bg-burgundy text-amber-200 border border-champagne/50 shadow-sm'
                  : 'bg-white hover:bg-[#faf4e8] text-stone-700 border border-stone-200 hover:border-champagne'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* EDITORIAL MASONRY / COLLAGE GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
        {filteredItems.map((item, idx) => {
          const imgUrl = getOptimizedImageUrl(item.image, { width: 1200, quality: 80 })
          
          // Magazine layout: varying heights
          const aspectClass = item.aspect === 'tall'
            ? 'aspect-[3/4] sm:row-span-2'
            : item.aspect === 'wide'
            ? 'aspect-[16/10]'
            : 'aspect-square'

          return (
            <div
              key={item.id || idx}
              onClick={() => setActiveModalItem(item)}
              className={`group relative rounded-3xl overflow-hidden bg-espresso shadow-sm hover:shadow-2xl transition-all duration-500 hover:-translate-y-1 cursor-pointer border border-[#e2d5c3] hover:border-champagne ${aspectClass}`}
            >
              {/* Photo */}
              <img
                src={imgUrl}
                alt={item.title}
                loading="eager"
                decoding="async"
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-108"
              />

              {/* Film Grain Dark Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-espresso via-espresso/30 to-transparent opacity-85 group-hover:opacity-95 transition-opacity" />

              {/* Top Tag */}
              <div className="absolute top-3.5 left-3.5 right-3.5 flex items-center justify-between z-10">
                <span className="px-3 py-1 rounded-full text-[9.5px] font-bold uppercase tracking-wider bg-black/60 backdrop-blur-md text-amber-200 border border-champagne/30">
                  {item.category}
                </span>

                <div className="w-8 h-8 rounded-full bg-black/40 backdrop-blur-md text-white/80 group-hover:text-champagne group-hover:bg-black/70 flex items-center justify-center transition-all">
                  <Eye className="w-4 h-4" />
                </div>
              </div>

              {/* Bottom Caption Overlay */}
              <div className="absolute bottom-0 left-0 right-0 p-5 sm:p-6 z-10">
                <div className="flex items-center gap-1.5 text-[10.5px] font-bold text-champagne uppercase tracking-widest mb-1">
                  <MapPin className="w-3 h-3 text-champagne" />
                  <span>{item.city}</span>
                </div>

                <h3 className="font-serif font-bold text-lg sm:text-xl text-white group-hover:text-champagne transition-colors leading-snug mb-1.5 drop-shadow">
                  {item.title}
                </h3>

                <p className="text-xs text-stone-300 font-light line-clamp-2 leading-relaxed">
                  {item.caption}
                </p>

                <div className="mt-3 pt-3 border-t border-white/15 flex items-center justify-between text-[11px] text-stone-400">
                  <span>Photo: <strong className="text-amber-100">{item.photographer}</strong></span>
                  <span className="text-champagne flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                    Inspect Story <ArrowUpRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* FULLSCREEN LIGHTBOX INSPECTION MODAL */}
      {activeModalItem && (
        <div 
          onClick={() => setActiveModalItem(null)}
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 sm:p-8 animate-in fade-in"
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="relative max-w-4xl w-full bg-espresso rounded-3xl overflow-hidden border-2 border-champagne shadow-2xl flex flex-col md:flex-row"
          >
            {/* Close Button */}
            <button
              onClick={() => setActiveModalItem(null)}
              className="absolute top-4 right-4 z-20 w-9 h-9 rounded-full bg-black/70 text-white hover:text-rose-400 flex items-center justify-center transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Modal Photo */}
            <div className="md:w-3/5 relative aspect-square sm:aspect-auto sm:min-h-[480px] bg-stone-900">
              <img
                src={getOptimizedImageUrl(activeModalItem.image, { width: 1600, quality: 90 })}
                alt={activeModalItem.title}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Modal Details */}
            <div className="md:w-2/5 p-6 sm:p-8 flex flex-col justify-between text-white">
              <div>
                <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-burgundy text-amber-200 border border-champagne/40 inline-block mb-3">
                  {activeModalItem.category}
                </span>

                <div className="flex items-center gap-1.5 text-xs text-champagne font-bold uppercase tracking-wider mb-2">
                  <MapPin className="w-3.5 h-3.5" />
                  <span>{activeModalItem.city}</span>
                </div>

                <h3 className="font-serif font-bold text-2xl text-white mb-3 leading-snug">
                  {activeModalItem.title}
                </h3>

                <p className="text-xs sm:text-sm text-stone-300 leading-relaxed font-light mb-6">
                  {activeModalItem.caption}
                </p>

                <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 text-xs text-stone-400 space-y-1">
                  <div>Curated Source: <strong className="text-white">4K Editorial Archive</strong></div>
                  <div>Art Direction: <strong className="text-champagne">{activeModalItem.photographer}</strong></div>
                  <div>Direct Booking Lock: <strong className="text-emerald-400">Available via Vows &amp; Venues</strong></div>
                </div>
              </div>

              <div className="pt-6 border-t border-white/15 mt-6 flex gap-3">
                <button
                  onClick={() => {
                    const catSlug = activeModalItem.category.toLowerCase().includes('mandap')
                      ? 'decor'
                      : activeModalItem.category.toLowerCase().includes('cater')
                      ? 'catering'
                      : activeModalItem.category.toLowerCase().includes('couture')
                      ? 'outfits'
                      : 'venues'
                    setActiveModalItem(null)
                    if (onExploreCategory) onExploreCategory(catSlug)
                  }}
                  className="flex-1 py-3 rounded-xl bg-gradient-to-r from-burgundy to-burgundy-dark hover:brightness-110 text-amber-100 font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md"
                >
                  <span>Explore Related Vendors</span>
                  <ArrowUpRight className="w-4 h-4 text-champagne" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  )
}
