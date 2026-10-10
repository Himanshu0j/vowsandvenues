'use client'

import React from 'react'
import {
  MapPin,
  Star,
  ShieldCheck,
  Heart,
  Users,
  CheckCircle2,
  ArrowRight,
  Sparkles
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
    <div className="card-3d-wrap group relative rounded-3xl overflow-hidden bg-gradient-to-b from-[#0b1712] via-[#08120d] to-[#050807] border-2 border-[#00ff88]/30 hover:border-[#00ff88] shadow-[0_10px_30px_rgba(0,0,0,0.8)] hover:shadow-[0_20px_50px_rgba(0,0,0,0.9),0_0_30px_rgba(0,255,136,0.25)] transition-all duration-500 hover:-translate-y-2 flex flex-col justify-between select-none">
      {/* Top celebratory accent shimmer line on card */}
      <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-transparent via-[#00ff88] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-10" />

      {/* 1. PHOTOGRAPHY WRAPPER */}
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-[#050807] cursor-pointer" onClick={() => onSelectVendor(vendor)}>
        <img
          src={imageUrl}
          alt={vendor.name}
          loading="lazy"
          decoding="async"
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
        />
        {/* Multi-layered cinematic gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#050807] via-black/30 to-transparent" />
        
        {/* Shimmer sweep effect on card hover */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#00ff88]/15 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out pointer-events-none" />

        {/* TOP BADGES */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between z-10">
          {/* Category Tag */}
          <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-[#050807]/85 backdrop-blur-md text-[#00ff88] border border-[#00ff88]/40 shadow-sm flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#00ff88] shadow-[0_0_6px_#00ff88]"></span>
            {vendor.categoryName || vendor.category}
          </span>

          {/* Bookmark / Favorite Heart */}
          <button
            onClick={(e) => {
              e.stopPropagation()
              onToggleFavorite(vendor.id)
            }}
            title={isFavorite ? "Remove from Saved" : "Save to Favorites"}
            className="w-8 h-8 rounded-full bg-[#050807]/85 backdrop-blur-md flex items-center justify-center text-stone-300 hover:text-[#00ff88] transition-all shadow-md hover:scale-110 active:scale-90 border border-[#00ff88]/30 cursor-pointer"
          >
            <Heart className={`w-4 h-4 transition-transform ${isFavorite ? 'fill-[#00ff88] text-[#00ff88] scale-110' : ''}`} />
          </button>
        </div>

        {/* BOTTOM METRICS OVERLAY */}
        <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-white text-xs z-10">
          <div className="flex items-center gap-1.5">
            <div className="flex items-center gap-1 bg-[#050807]/90 backdrop-blur-md px-2.5 py-0.5 rounded-full text-[11px] font-bold text-amber-300 border border-amber-400/40 shadow-sm">
              <Star className="w-3.5 h-3.5 fill-amber-300 text-amber-300" />
              <span>{vendor.rating ? vendor.rating.toFixed(1) : '4.9'}</span>
              <span className="text-stone-400 font-normal">({vendor.reviewCount || 12})</span>
            </div>
          </div>

          {vendor.guestCapacity && (
            <div className="flex items-center gap-1 bg-[#050807]/90 backdrop-blur-md px-2.5 py-0.5 rounded-full text-[10px] font-semibold text-stone-300 border border-[#00ff88]/20">
              <Users className="w-3 h-3 text-[#00ff88]" />
              <span>Up to {vendor.guestCapacity} guests</span>
            </div>
          )}
        </div>
      </div>

      {/* 2. CARD CONTENT BODY */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between bg-gradient-to-b from-[#091510] to-[#050807]">
        <div>
          {/* Verified Badge & Location */}
          <div className="flex items-center justify-between gap-2 mb-1.5 text-xs">
            <div className="flex items-center gap-1 text-stone-300 truncate font-semibold">
              <MapPin className="w-3.5 h-3.5 text-[#00ff88] shrink-0" />
              <span className="truncate">{vendor.locality ? `${vendor.locality}, ${vendor.city}` : vendor.city}</span>
            </div>
            
            {vendor.verified && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#00ff88]/20 text-[#00ff88] text-[10px] font-black border border-[#00ff88]/40 shadow-xs shrink-0">
                <ShieldCheck className="w-3 h-3 text-[#00ff88]" /> Verified
              </span>
            )}
          </div>

          {/* Vendor Name */}
          <h3 
            onClick={() => onSelectVendor(vendor)}
            className="font-serif font-bold text-base sm:text-lg text-white group-hover:text-[#00ff88] transition-colors cursor-pointer mb-2 line-clamp-1 drop-shadow-sm"
          >
            {vendor.name}
          </h3>

          {/* Amenities or Highlights */}
          {vendor.amenities && vendor.amenities.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-3">
              {vendor.amenities.slice(0, 3).map((am, i) => (
                <span key={i} className="text-[10px] text-[#00ff88] bg-[#0e2119] px-2 py-0.5 rounded-md border border-[#00ff88]/30 transition-colors font-medium">
                  {am}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* 3. PRICING & ACTIONS */}
        <div className="pt-3 border-t border-[#00ff88]/20 flex items-center justify-between mt-2">
          <div>
            <div className="text-[9.5px] uppercase font-black text-[#00ff88] bg-[#00ff88]/15 px-2 py-0.5 rounded-md border border-[#00ff88]/30 inline-block mb-1">
              Starting From
            </div>
            <div className="font-serif font-black text-base sm:text-lg text-white">
              <span className="text-[#00ff88] drop-shadow-[0_0_8px_rgba(0,255,136,0.6)]">₹{(vendor.startingPrice || 25000).toLocaleString('en-IN')}</span>
              <span className="text-[11px] font-sans font-normal text-stone-400">
                {' '}/{vendor.priceUnit || 'event'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onSelectVendor(vendor)}
              className="px-3.5 py-1.5 rounded-full bg-[#0e2119] hover:bg-[#00ff88]/20 text-stone-200 hover:text-[#00ff88] text-xs font-bold transition-all border border-[#00ff88]/30 cursor-pointer"
            >
              Details
            </button>
            <button
              onClick={() => onAddToEvent(vendor)}
              className="btn-neon-green px-4 py-1.5 rounded-full text-xs font-black transition-all shadow-[0_0_15px_rgba(0,255,136,0.5)] flex items-center gap-1 hover:scale-105 active:scale-95 cursor-pointer"
            >
              <span>Add to Plan</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  )
}
