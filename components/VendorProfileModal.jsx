'use client'

import React, { useState } from 'react'
import {
  X,
  MapPin,
  Star,
  ShieldCheck,
  Heart,
  Users,
  CheckCircle2,
  Calendar,
  Phone,
  Mail,
  ChevronRight,
  Sparkles,
  Layers,
  MessageSquare,
  HelpCircle
} from 'lucide-react'
import { getOptimizedImageUrl } from '@/lib/imageUtils'

export default function VendorProfileModal({
  vendor,
  onClose,
  isFavorite,
  onToggleFavorite,
  onBookNow,
  onRequestQuote
}) {
  const [activeTab, setActiveTab] = useState('overview') // 'overview' | 'packages' | 'gallery' | 'reviews'
  const [selectedGalleryImg, setSelectedGalleryImg] = useState(null)

  if (!vendor) return null

  const galleryImages = [
    vendor.heroImage || vendor.image,
    ...(vendor.gallery || [])
  ].filter(Boolean)

  const activeImage = selectedGalleryImg || galleryImages[0]
  const optimizedActiveImg = getOptimizedImageUrl(activeImage, { width: 1100, quality: 80 })

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/70 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 md:p-6 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-5xl w-full max-h-[92vh] overflow-y-auto shadow-2xl border border-[#e8e2d5] relative flex flex-col">
        
        {/* CLOSE BUTTON */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 sm:top-4 sm:right-4 z-20 w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-black/60 hover:bg-black/80 text-white flex items-center justify-center backdrop-blur-md transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* 1. EDITORIAL HERO PHOTO BANNER & THUMBNAILS */}
        <div className="relative aspect-[16/9] sm:aspect-[21/9] w-full overflow-hidden bg-stone-900 shrink-0">
          <img
            src={optimizedActiveImg}
            alt={vendor.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

          {/* Overlaid Title and Info */}
          <div className="absolute bottom-4 left-4 right-4 sm:bottom-6 sm:left-6 sm:right-6 text-white flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-black/60 backdrop-blur-md text-[#f5ebd7] border border-white/10">
                  {vendor.categoryName || vendor.category}
                </span>
                {vendor.verified && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-500/80 backdrop-blur-md text-white text-[10px] font-bold border border-emerald-400/30">
                    <ShieldCheck className="w-3.5 h-3.5" /> Verified Creator
                  </span>
                )}
              </div>

              <h2 className="font-serif text-2xl sm:text-3xl md:text-4xl font-bold leading-tight">
                {vendor.name}
              </h2>

              <div className="flex items-center gap-3 text-xs sm:text-sm text-stone-200 mt-1">
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-[#c5a059]" />
                  {vendor.locality ? `${vendor.locality}, ${vendor.city}` : vendor.city}
                </span>
                <span>•</span>
                <span className="flex items-center gap-1 text-amber-300 font-bold">
                  <Star className="w-3.5 h-3.5 fill-amber-300" />
                  {vendor.rating ? vendor.rating.toFixed(1) : '4.9'} ({vendor.reviewCount || 12} reviews)
                </span>
              </div>
            </div>

            {/* Starting Price and Quick CTAs */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => onToggleFavorite(vendor.id)}
                className={`p-3 rounded-full backdrop-blur-md border ${
                  isFavorite ? 'bg-rose-500/90 text-white border-rose-400' : 'bg-black/60 text-white border-white/20'
                }`}
              >
                <Heart className={`w-4 h-4 ${isFavorite ? 'fill-current' : ''}`} />
              </button>

              <button
                onClick={() => onRequestQuote(vendor)}
                className="px-4 py-2.5 rounded-full bg-white/90 hover:bg-white text-[#1c1917] font-semibold text-xs transition-colors backdrop-blur-md"
              >
                Request Quote
              </button>

              <button
                onClick={() => onBookNow(vendor)}
                className="px-5 py-2.5 rounded-full bg-[#4a1525] hover:bg-[#3d111e] text-[#f5ebd7] font-bold text-xs shadow-lg transition-colors border border-[#5c1d2e]"
              >
                Book with 25% Advance
              </button>
            </div>
          </div>
        </div>

        {/* 2. GALLERY THUMBNAIL STRIP */}
        {galleryImages.length > 1 && (
          <div className="flex gap-2 p-3 bg-[#faf8f5] border-b border-[#e8e2d5] overflow-x-auto no-scrollbar">
            {galleryImages.map((img, i) => (
              <button
                key={i}
                onClick={() => setSelectedGalleryImg(img)}
                className={`w-16 h-12 rounded-xl overflow-hidden shrink-0 border-2 transition-all ${
                  activeImage === img ? 'border-[#4a1525] scale-105' : 'border-transparent opacity-70 hover:opacity-100'
                }`}
              >
                <img
                  src={getOptimizedImageUrl(img, { width: 200, quality: 70 })}
                  alt="thumb"
                  loading="lazy"
                  decoding="async"
                  className="w-full h-full object-cover"
                />
              </button>
            ))}
          </div>
        )}

        {/* 3. SUB-NAV TABS */}
        <div className="flex items-center gap-2 px-4 sm:px-6 pt-4 border-b border-[#e8e2d5] text-xs font-semibold overflow-x-auto no-scrollbar whitespace-nowrap">
          <button
            onClick={() => setActiveTab('overview')}
            className={`pb-3 px-2 border-b-2 transition-colors ${
              activeTab === 'overview' ? 'border-[#4a1525] text-[#4a1525]' : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            Overview &amp; Amenities
          </button>
          <button
            onClick={() => setActiveTab('packages')}
            className={`pb-3 px-2 border-b-2 transition-colors ${
              activeTab === 'packages' ? 'border-[#4a1525] text-[#4a1525]' : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            Packages &amp; Menu ({vendor.packages?.length || 0})
          </button>
          <button
            onClick={() => setActiveTab('gallery')}
            className={`pb-3 px-2 border-b-2 transition-colors ${
              activeTab === 'gallery' ? 'border-[#4a1525] text-[#4a1525]' : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            Photo Portfolio ({galleryImages.length})
          </button>
          <button
            onClick={() => setActiveTab('reviews')}
            className={`pb-3 px-2 border-b-2 transition-colors ${
              activeTab === 'reviews' ? 'border-[#4a1525] text-[#4a1525]' : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            Client Reviews ({vendor.reviewCount || 12})
          </button>
        </div>

        {/* 4. TAB CONTENTS */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {/* TAB: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div>
                <h3 className="font-serif font-bold text-lg text-[#1c1917] mb-2">About This Creator</h3>
                <p className="text-sm text-[#78716c] leading-relaxed">
                  {vendor.description || `${vendor.name} is one of ${vendor.city}'s most celebrated ${vendor.categoryName || vendor.category} specialists, known for bespoke craftsmanship, unmatched professionalism, and flawless execution for royal Indian weddings and grand celebrations.`}
                </p>
              </div>

              {/* AMENITIES & FEATURES */}
              {vendor.amenities && vendor.amenities.length > 0 && (
                <div>
                  <h3 className="font-serif font-bold text-base text-[#1c1917] mb-3">Amenities &amp; Features</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                    {vendor.amenities.map((am, i) => (
                      <div key={i} className="flex items-center gap-2 text-xs text-[#44403c] bg-[#faf8f5] p-2.5 rounded-xl border border-[#e8e2d5]">
                        <CheckCircle2 className="w-4 h-4 text-[#c5a059] shrink-0" />
                        <span>{am}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* CAPACITY & SPECIFICATIONS */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-stone-100">
                <div className="bg-[#faf8f5] p-4 rounded-2xl border border-[#e8e2d5]">
                  <div className="text-[11px] font-bold uppercase tracking-wider text-stone-500">Starting Price</div>
                  <div className="font-serif text-xl font-bold text-[#1c1917] mt-1">
                    ₹{(vendor.startingPrice || 25000).toLocaleString('en-IN')}
                  </div>
                  <div className="text-[11px] text-stone-400">per {vendor.priceUnit || 'event'}</div>
                </div>

                <div className="bg-[#faf8f5] p-4 rounded-2xl border border-[#e8e2d5]">
                  <div className="text-[11px] font-bold uppercase tracking-wider text-stone-500">Guest Capacity</div>
                  <div className="font-serif text-xl font-bold text-[#1c1917] mt-1">
                    {vendor.guestCapacity ? `Up to ${vendor.guestCapacity}` : 'Flexible'}
                  </div>
                  <div className="text-[11px] text-stone-400">Indoor &amp; Outdoor Lawn</div>
                </div>

                <div className="bg-[#faf8f5] p-4 rounded-2xl border border-[#e8e2d5]">
                  <div className="text-[11px] font-bold uppercase tracking-wider text-stone-500">Booking Terms</div>
                  <div className="font-serif text-xl font-bold text-emerald-800 mt-1">
                    25% Advance
                  </div>
                  <div className="text-[11px] text-stone-400">Zero hidden fees guarantee</div>
                </div>
              </div>
            </div>
          )}

          {/* TAB: PACKAGES */}
          {activeTab === 'packages' && (
            <div className="space-y-4">
              <h3 className="font-serif font-bold text-lg text-[#1c1917]">Service Packages</h3>
              {(!vendor.packages || vendor.packages.length === 0) ? (
                <div className="text-center py-10 text-xs text-stone-400 bg-stone-50 rounded-2xl">
                  Custom quotes available upon request
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {vendor.packages.map((pkg, i) => (
                    <div key={pkg.id || i} className="p-5 rounded-2xl bg-[#faf8f5] border border-[#e8e2d5] flex flex-col justify-between">
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-serif font-bold text-base text-[#1c1917]">{pkg.name}</h4>
                          <span className="font-serif font-bold text-base text-[#4a1525]">
                            ₹{pkg.price?.toLocaleString('en-IN')}
                          </span>
                        </div>
                        {pkg.description && (
                          <p className="text-xs text-stone-600 mb-3">{pkg.description}</p>
                        )}
                        {pkg.includes && (
                          <div className="space-y-1.5 mb-4">
                            {(Array.isArray(pkg.includes) ? pkg.includes : String(pkg.includes).split(',')).map((inc, j) => (
                              <div key={j} className="text-xs text-stone-600 flex items-center gap-2">
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                                <span>{inc.trim()}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                      <button
                        onClick={() => onBookNow({ ...vendor, selectedPackage: pkg })}
                        className="w-full py-2.5 rounded-xl bg-[#4a1525] text-[#f5ebd7] text-xs font-bold hover:bg-[#3d111e] transition-colors"
                      >
                        Select This Package
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB: GALLERY */}
          {activeTab === 'gallery' && (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {galleryImages.map((img, i) => (
                <div
                  key={i}
                  onClick={() => setSelectedGalleryImg(img)}
                  className="aspect-[4/3] rounded-2xl overflow-hidden cursor-pointer group bg-stone-100"
                >
                  <img
                    src={getOptimizedImageUrl(img, { width: 600, quality: 75 })}
                    alt="gallery"
                    loading="lazy"
                    decoding="async"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
              ))}
            </div>
          )}

          {/* TAB: REVIEWS */}
          {activeTab === 'reviews' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-serif font-bold text-lg text-[#1c1917]">Customer Testimonials</h3>
                <span className="text-xs text-stone-500">Verified Client Feedback</span>
              </div>
              <div className="space-y-3">
                <div className="p-4 rounded-2xl bg-[#faf8f5] border border-[#e8e2d5]">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-bold text-xs text-stone-900">Dr. Sunita &amp; Rajesh Goyal</span>
                    <span className="flex items-center text-amber-500 text-xs">★★★★★</span>
                  </div>
                  <p className="text-xs text-stone-600 leading-relaxed">
                    "Executed our daughter's wedding flawlessly. The decor and coordination exceeded every expectation. All our guests were amazed."
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  )
}
