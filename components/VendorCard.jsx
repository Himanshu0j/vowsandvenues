'use client'

import React from 'react'
import {
  MapPin,
  Star,
  ShieldCheck,
  Heart,
  Users,
  CheckCircle2,
  ArrowRight
} from 'lucide-react'
import { getOptimizedImageUrl } from '@/lib/imageUtils'

export default function VendorCard({
  vendor,
  isFavorite = false,
  onToggleFavorite,
  onSelectVendor,
  onAddToEvent
}) {
  const imageUrl = getOptimizedImageUrl(vendor.heroImage || vendor.image, { width: 600, quality: 75 })

  return (
    <div className="group rounded-3xl overflow-hidden bg-white border border-[#e8e2d5] hover:border-[#c5a059] shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between">
      {/* 1. PHOTOGRAPHY WRAPPER */}
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-stone-100 cursor-pointer" onClick={() => onSelectVendor(vendor)}>
        <img
          src={imageUrl}
          alt={vendor.name}
          loading="lazy"
          decoding="async"
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-80" />

        {/* TOP BADGES */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
          {/* Category Tag */}
          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-black/60 backdrop-blur-md text-[#f5ebd7] border border-white/10">
            {vendor.categoryName || vendor.category}
          </span>

          {/* Bookmark / Favorite Heart */}
          <button
            onClick={(e) => {
              e.stopPropagation()
              onToggleFavorite(vendor.id)
            }}
            title={isFavorite ? "Remove from Saved" : "Save to Favorites"}
            className="w-8 h-8 rounded-full bg-white/90 backdrop-blur-md flex items-center justify-center text-stone-700 hover:text-rose-600 transition-colors shadow-sm"
          >
            <Heart className={`w-4 h-4 ${isFavorite ? 'fill-rose-500 text-rose-500' : ''}`} />
          </button>
        </div>

        {/* BOTTOM METRICS OVERLAY */}
        <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-white text-xs">
          <div className="flex items-center gap-1.5">
            <div className="flex items-center gap-1 bg-black/60 backdrop-blur-sm px-2 py-0.5 rounded-full text-[11px] font-bold text-amber-300">
              <Star className="w-3 h-3 fill-amber-300 text-amber-300" />
              <span>{vendor.rating ? vendor.rating.toFixed(1) : '4.9'}</span>
              <span className="text-white/60 font-normal">({vendor.reviewCount || 12})</span>
            </div>
          </div>

          {vendor.guestCapacity && (
            <div className="flex items-center gap-1 bg-black/60 backdrop-blur-sm px-2 py-0.5 rounded-full text-[10px] text-stone-200">
              <Users className="w-3 h-3 text-[#c5a059]" />
              <span>Up to {vendor.guestCapacity} guests</span>
            </div>
          )}
        </div>
      </div>

      {/* 2. CARD CONTENT BODY */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between">
        <div>
          {/* Verified Badge & Location */}
          <div className="flex items-center justify-between gap-2 mb-1.5 text-xs">
            <div className="flex items-center gap-1 text-[#78716c] truncate">
              <MapPin className="w-3.5 h-3.5 text-[#4a1525] shrink-0" />
              <span className="truncate">{vendor.locality ? `${vendor.locality}, ${vendor.city}` : vendor.city}</span>
            </div>
            
            {vendor.verified && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 text-[10px] font-bold border border-emerald-200 shrink-0">
                <ShieldCheck className="w-3 h-3 text-emerald-600" /> Verified
              </span>
            )}
          </div>

          {/* Vendor Name */}
          <h3 
            onClick={() => onSelectVendor(vendor)}
            className="font-serif font-bold text-base sm:text-lg text-[#1c1917] group-hover:text-[#4a1525] transition-colors cursor-pointer mb-2 line-clamp-1"
          >
            {vendor.name}
          </h3>

          {/* Amenities or Highlights */}
          {vendor.amenities && vendor.amenities.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-3">
              {vendor.amenities.slice(0, 3).map((am, i) => (
                <span key={i} className="text-[10px] text-[#78716c] bg-[#faf8f5] px-2 py-0.5 rounded-md border border-[#e8e2d5]">
                  {am}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* 3. PRICING & ACTIONS */}
        <div className="pt-3 border-t border-[#f2ede4] flex items-center justify-between mt-2">
          <div>
            <div className="text-[10px] uppercase font-bold text-[#78716c] tracking-wider">
              Starting From
            </div>
            <div className="font-serif font-bold text-base sm:text-lg text-[#1c1917]">
              ₹{(vendor.startingPrice || 25000).toLocaleString('en-IN')}
              <span className="text-[11px] font-sans font-normal text-stone-500">
                {' '}/{vendor.priceUnit || 'event'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => onSelectVendor(vendor)}
              className="px-3.5 py-1.5 rounded-full bg-[#f2ede4] hover:bg-[#eae3d7] text-[#1c1917] text-xs font-semibold transition-colors border border-[#dfd7c8]"
            >
              Details
            </button>
            <button
              onClick={() => onAddToEvent(vendor)}
              className="px-3.5 py-1.5 rounded-full bg-[#4a1525] hover:bg-[#3d111e] text-[#f5ebd7] text-xs font-semibold transition-colors shadow-sm"
            >
              Add to Plan
            </button>
          </div>
        </div>

      </div>
    </div>
  )
}
