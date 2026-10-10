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
  Sparkles,
  MessageSquare
} from 'lucide-react'
import { getOptimizedImageUrl } from '@/lib/imageUtils'

export default function VendorCard({
  vendor,
  isFavorite = false,
  onToggleFavorite,
  onSelectVendor,
  onAddToEvent,
  onNegotiate
}) {
  const imageUrl = getOptimizedImageUrl(vendor.heroImage || vendor.image, { width: 600, quality: 75 })

  return (
    <div className="card-3d-wrap group relative rounded-3xl overflow-hidden bg-gradient-to-b from-[#fffefd] via-[#fdfbf7] to-[#f8f2e7] border-2 border-[#decfaa] hover:border-amber-500 shadow-[0_4px_20px_rgba(74,21,37,0.06)] hover:shadow-[0_20px_50px_rgba(74,21,37,0.18)] transition-all duration-500 hover:-translate-y-2 flex flex-col justify-between">
      {/* Top celebratory accent shimmer line on card */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#c5a059] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-10" />

      {/* 1. PHOTOGRAPHY WRAPPER */}
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-stone-100 cursor-pointer" onClick={() => onSelectVendor(vendor)}>
        <img
          src={imageUrl}
          alt={vendor.name}
          loading="eager"
          decoding="async"
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
        />
        {/* Multi-layered cinematic gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />
        
        {/* Shimmer sweep effect on card hover */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/15 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out pointer-events-none" />

        {/* TOP BADGES */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between z-10">
          {/* Category Tag */}
          <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-black/60 backdrop-blur-md text-[#f5ebd7] border border-amber-300/30 shadow-sm flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
            {vendor.categoryName || vendor.category}
          </span>

          {/* Bookmark / Favorite Heart */}
          <button
            onClick={(e) => {
              e.stopPropagation()
              onToggleFavorite(vendor.id)
            }}
            title={isFavorite ? "Remove from Saved" : "Save to Favorites"}
            className="w-8 h-8 rounded-full bg-white/95 backdrop-blur-md flex items-center justify-center text-stone-700 hover:text-rose-600 transition-all shadow-md hover:scale-110 active:scale-90"
          >
            <Heart className={`w-4 h-4 transition-transform ${isFavorite ? 'fill-rose-500 text-rose-500 scale-110' : ''}`} />
          </button>
        </div>

        {/* BOTTOM METRICS OVERLAY */}
        <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-white text-xs z-10">
          <div className="flex items-center gap-1.5">
            <div className="flex items-center gap-1 bg-black/70 backdrop-blur-md px-2.5 py-0.5 rounded-full text-[11px] font-bold text-amber-300 border border-amber-400/20 shadow-sm">
              <Star className="w-3.5 h-3.5 fill-amber-300 text-amber-300" />
              <span>{vendor.rating ? vendor.rating.toFixed(1) : '4.9'}</span>
              <span className="text-white/60 font-normal">({vendor.reviewCount || 12})</span>
            </div>
          </div>

          {vendor.guestCapacity && (
            <div className="flex items-center gap-1 bg-black/70 backdrop-blur-md px-2.5 py-0.5 rounded-full text-[10px] font-medium text-amber-100 border border-white/10">
              <Users className="w-3 h-3 text-amber-300" />
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
            <div className="flex items-center gap-1 text-stone-600 truncate font-semibold">
              <MapPin className="w-3.5 h-3.5 text-[#4a1525] shrink-0" />
              <span className="truncate">{vendor.locality ? `${vendor.locality}, ${vendor.city}` : vendor.city}</span>
            </div>
            
            {vendor.verified && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-900 text-[10px] font-bold border border-emerald-300 shadow-xs shrink-0">
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
                <span key={i} className="text-[10px] text-amber-950 bg-amber-100/80 hover:bg-amber-200/80 px-2 py-0.5 rounded-md border border-amber-300/60 transition-colors font-medium">
                  {am}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* 3. PRICING & ACTIONS */}
        <div className="pt-3 border-t border-[#ebdcc9] flex items-center justify-between mt-2">
          <div>
            <div className="text-[9.5px] uppercase font-bold text-amber-900 bg-amber-100/90 px-2 py-0.5 rounded-md border border-amber-300/60 inline-block mb-1">
              Starting From
            </div>
            <div className="font-serif font-bold text-base sm:text-lg text-emerald-950">
              ₹{(vendor.startingPrice || 25000).toLocaleString('en-IN')}
              <span className="text-[11px] font-sans font-normal text-stone-600">
                {' '}/{vendor.priceUnit || 'event'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={(e) => {
                e.stopPropagation()
                if (onNegotiate) onNegotiate(vendor)
              }}
              className="px-2.5 py-1.5 rounded-full bg-gradient-to-r from-amber-500/15 to-amber-600/25 hover:from-amber-500/30 hover:to-amber-600/40 text-amber-950 text-xs font-bold transition-all border border-amber-400/60 hover:shadow-xs flex items-center gap-1"
              title="Think the price is high? Negotiate live with Admin"
            >
              <MessageSquare className="w-3.5 h-3.5 text-amber-700" />
              <span>Negotiate</span>
            </button>
            <button
              onClick={() => onSelectVendor(vendor)}
              className="px-3 py-1.5 rounded-full bg-amber-100/90 hover:bg-amber-200 text-stone-900 text-xs font-bold transition-all border border-amber-300/80 hover:shadow-xs"
            >
              Details
            </button>
            <button
              onClick={() => onAddToEvent(vendor)}
              className="btn-3d-wine px-3.5 py-1.5 rounded-full bg-gradient-to-r from-[#4a1525] to-[#6d1e35] hover:from-[#3a101d] hover:to-[#581729] text-[#f5ebd7] text-xs font-bold transition-all shadow-md flex items-center gap-1 hover:scale-105 active:scale-95"
            >
              <span>Add to Plan</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  )
}

