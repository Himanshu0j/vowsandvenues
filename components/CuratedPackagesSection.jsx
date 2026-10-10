'use client'

import React from 'react'
import {
  Sparkles,
  Check,
  ArrowRight,
  ShieldCheck,
  Users,
  CalendarDays,
  Crown,
  Layers,
  Wand2
} from 'lucide-react'
import { getOptimizedImageUrl } from '@/lib/imageUtils'

const DEFAULT_PACKAGES = [
  {
    id: 'pkg_basic_celebration',
    title: 'Basic Celebration Package',
    subtitle: 'Ideal for intimate birthdays, anniversaries, and roka ceremonies (up to 75 guests)',
    eventType: 'Intimate Soiree',
    price: 75000,
    originalPrice: 90000,
    badge: 'Best Value',
    popular: false,
    bannerImage: 'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA1MDV8MHwxfHNlYXJjaHwzfHxiaXJ0aGRheSUyMGNlbGVicmF0aW9ufGVufDB8fHx8MTc4ODkzNzIzOHww&ixlib=rb-4.1.0&q=85',
    highlights: [
      'Fairy Light Backdrop Decor',
      'Pro DJ & Sound (3 hrs)',
      'Candid Photo & Video (1 Pro)',
      'Digital 3D E-Invite Suite'
    ]
  },
  {
    id: 'pkg_premium_celebration',
    title: 'Premium Celebration & Sangeet',
    subtitle: 'Comprehensive package for engagements, grand sangeet, and 200-guest receptions',
    eventType: 'Engagement & Sangeet',
    price: 165000,
    originalPrice: 195000,
    badge: 'Most Popular',
    popular: true,
    bannerImage: 'https://images.unsplash.com/photo-1587012521796-6359d3678f2a?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NTYxOTB8MHwxfHNlYXJjaHwxfHxzYW5nZWV0fGVufDB8fHx8MTc4ODkzNzIzOXww&ixlib=rb-4.1.0&q=85',
    highlights: [
      'Floral Mandap & Stage (30ft)',
      'Awadhi Feast (100 Pax Starter)',
      'Bridal HD Glam Look',
      'Candid Cinema + Drone Shoot',
      'DJ Kabir + Punjabi Dhol'
    ]
  },
  {
    id: 'pkg_luxury_royal_wedding',
    title: 'Luxury Royal Indian Wedding',
    subtitle: 'The all-inclusive royal wedding extravaganza covering all 11 categories for 350+ guests',
    eventType: 'Royal Wedding Extravaganza',
    price: 495000,
    originalPrice: 580000,
    badge: 'All-Inclusive Royalty',
    popular: true,
    bannerImage: 'https://images.unsplash.com/photo-1587271407850-8d438ca9fdf2',
    highlights: [
      'Palace Banquet & Lawn Exclusivity',
      'Imperial 4-Pillar Floral Mandap',
      'Royal Shahi 4-Course Multi-Cuisine Feast',
      'Full Cinema Crew + 4K Drone Coverage',
      'Full Day Royal Wedding Planner Coordination'
    ]
  }
]

export default function CuratedPackagesSection({
  packages = [],
  onSelectPackage,
  onCustomizePackage,
  onBookPackage
}) {
  const displayPackages = packages && packages.length > 0 ? packages : DEFAULT_PACKAGES

  return (
    <section className="py-16 sm:py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto select-none border-t border-[#e8dfcf]">
      
      {/* SECTION HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10 sm:mb-14 gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-champagne/15 border border-champagne/40 text-burgundy text-[11px] font-bold tracking-[0.2em] uppercase mb-2.5 shadow-2xs">
            <Crown className="w-3.5 h-3.5 text-champagne" />
            <span>Complete Celebration Ensembles</span>
          </div>
          <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl font-bold text-espresso tracking-tight">
            Curated All-Inclusive Event Packages
          </h2>
          <p className="text-xs sm:text-sm text-stone-600 mt-2 max-w-xl font-normal leading-relaxed">
            Coordinated multi-vendor ensembles combining luxury venues, royal catering feasts, fragrant floral mandaps, and 4K cinema.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-semibold text-stone-600 bg-white px-4 py-2 rounded-full border border-stone-200 shadow-2xs">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>Save up to 18% with Bundled Multi-Vendor Rates</span>
        </div>
      </div>

      {/* PACKAGES COMPARISON CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch">
        {displayPackages.map((pkg, idx) => {
          const isFeatured = pkg.popular || idx === 0
          const bannerImg = getOptimizedImageUrl(pkg.bannerImage || pkg.image || 'https://images.unsplash.com/photo-1587271407850-8d438ca9fdf2', { width: 800, quality: 75 })

          return (
            <div
              key={pkg.id || idx}
              className={`rounded-3xl overflow-hidden flex flex-col justify-between transition-all duration-500 hover:-translate-y-1.5 relative ${
                isFeatured
                  ? 'bg-gradient-to-b from-[#fffefc] via-[#fbf7ee] to-[#f4ebe0] border-2 border-champagne shadow-xl ring-2 ring-champagne/20'
                  : 'bg-gradient-to-b from-white to-[#faf6ee] border border-[#e2d5c3] shadow-sm hover:border-champagne hover:shadow-lg'
              }`}
            >
              {/* Top Accent Shimmer Line */}
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-burgundy via-champagne to-burgundy" />

              {/* CARD TOP BANNER PHOTO */}
              <div className="relative aspect-[16/9] w-full overflow-hidden bg-stone-900">
                <img
                  src={bannerImg}
                  alt={pkg.title}
                  loading="eager"
                  decoding="async"
                  className="w-full h-full object-cover transition-transform duration-700 hover:scale-108"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-transparent" />

                {/* Popular / Feature Pill */}
                <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
                  <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider shadow-sm ${
                    isFeatured 
                      ? 'bg-burgundy text-amber-200 border border-champagne/50' 
                      : 'bg-black/70 backdrop-blur-md text-amber-200 border border-white/20'
                  }`}>
                    {pkg.badge || (isFeatured ? 'Most Popular Ensembles' : 'Handcrafted Ensemble')}
                  </span>

                  {pkg.originalPrice && pkg.originalPrice > pkg.price && (
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-600 text-white shadow-xs">
                      Save ₹{((pkg.originalPrice - pkg.price) / 1000).toFixed(0)}k
                    </span>
                  )}
                </div>

                {/* Bottom title on photo */}
                <div className="absolute bottom-3 left-3 right-3 text-white">
                  <span className="text-[10px] uppercase font-bold text-champagne tracking-wider block">
                    {pkg.eventType || 'Royal Celebration'}
                  </span>
                  <h3 className="font-serif font-bold text-lg sm:text-xl text-white line-clamp-1">
                    {pkg.title}
                  </h3>
                </div>
              </div>

              {/* CARD BODY */}
              <div className="p-5 sm:p-6 flex-1 flex flex-col justify-between">
                <div>
                  <p className="text-xs text-stone-600 font-normal leading-relaxed mb-4">
                    {pkg.subtitle || 'End-to-end coordinated ensemble including venue exclusivity, feasts, decor, and photography.'}
                  </p>

                  {/* Pricing Box */}
                  <div className="p-3.5 rounded-2xl bg-amber-50/70 border border-champagne/40 mb-5">
                    <div className="text-[10px] uppercase font-bold text-stone-500 tracking-wider">All-Inclusive Bundle Rate</div>
                    <div className="flex items-baseline gap-2 mt-0.5">
                      <span className="font-serif font-bold text-2xl text-burgundy">
                        ₹{(pkg.price || 150000).toLocaleString('en-IN')}
                      </span>
                      {pkg.originalPrice && pkg.originalPrice > pkg.price && (
                        <span className="text-xs text-stone-400 line-through">
                          ₹{pkg.originalPrice.toLocaleString('en-IN')}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Highlights / Included Services */}
                  <div className="space-y-2 mb-6">
                    <div className="text-[11px] font-bold text-stone-700 uppercase tracking-wider">Included Services:</div>
                    {(pkg.highlights || [
                      'Heritage Venue Exclusive Day Access',
                      'Royal Feast Banquet Buffet (500+ Plates)',
                      'Full Fragrant Mogra & Mandap Decor',
                      'Candid 4K Cinema & Drone Coverage',
                      'Sound, Starlight Lighting & Sangeet Stage'
                    ]).slice(0, 5).map((hl, hIdx) => (
                      <div key={hIdx} className="flex items-start gap-2 text-xs text-stone-700">
                        <div className="w-4 h-4 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0 mt-0.5">
                          <Check className="w-2.5 h-2.5 text-emerald-700" />
                        </div>
                        <span className="leading-snug">{hl}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* CTAs */}
                <div className="pt-4 border-t border-[#e2d5c3] flex flex-col sm:flex-row gap-2.5">
                  <button
                    onClick={() => onCustomizePackage && onCustomizePackage(pkg)}
                    className="flex-1 py-2.5 px-3 rounded-xl bg-white hover:bg-amber-50 text-stone-800 border border-stone-300 hover:border-champagne text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-2xs"
                  >
                    <Wand2 className="w-3.5 h-3.5 text-burgundy" />
                    <span>Customize in Builder</span>
                  </button>

                  <button
                    onClick={() => onBookPackage ? onBookPackage(pkg) : onSelectPackage(pkg)}
                    className="flex-1 py-2.5 px-3 rounded-xl bg-burgundy hover:bg-burgundy-dark text-amber-200 text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-md"
                  >
                    <span>Direct Date Lock</span>
                    <ArrowRight className="w-3.5 h-3.5 text-champagne" />
                  </button>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}
