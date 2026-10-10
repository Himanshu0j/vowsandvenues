'use client'

import React, { useState, useEffect, useRef } from 'react'
import {
  Sparkles,
  MapPin,
  ChevronLeft,
  ChevronRight,
  Star,
  ShieldCheck,
  Calendar,
  ArrowRight,
  Eye,
  CheckCircle2
} from 'lucide-react'
import { getOptimizedImageUrl } from '@/lib/imageUtils'

const GALLERY_SLIDES = [
  {
    id: 'slide_1',
    title: 'The Royal Jagmandir Island Palace & Lakeside Mandap',
    city: 'Udaipur, Rajasthan',
    category: 'Heritage Venues & Forts',
    rating: 4.98,
    reviews: 142,
    price: '₹3,50,000 / day',
    tag: 'Signature Palace',
    image: 'https://images.unsplash.com/photo-1519741497674-611481863552',
    description: 'Surrounded by shimmering waters of Lake Pichola with authentic Mewari royal architecture, private boat baraat access, and illuminated marble courtyards.'
  },
  {
    id: 'slide_2',
    title: 'Rambagh Heritage Citadel & Mughal Gardens',
    city: 'Jaipur, Rajasthan',
    category: 'Royal Palaces & Lawns',
    rating: 4.96,
    reviews: 188,
    price: '₹2,80,000 / day',
    tag: 'Celebrity Choice',
    image: 'https://images.unsplash.com/photo-1587271407850-8d438ca9fdf2',
    description: 'Grand sandstone arches, manicured peacocks lawns, royal elephant processions, and open-air starlit reception amphitheaters.'
  },
  {
    id: 'slide_3',
    title: 'Grand Shahi Awadhi Dawat & Royal Feast Banquet',
    city: 'Lucknow, Uttar Pradesh',
    category: 'Royal Catering & Feasts',
    rating: 4.99,
    reviews: 260,
    price: '₹1,850 / plate',
    tag: 'Awadhi Heritage',
    image: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5',
    description: 'Centuries-old slow-cooked Dum Pukht biryanis, melt-in-mouth Galouti kebabs on Sheermal, and fragrant Shahi Tukda live dessert counters.'
  },
  {
    id: 'slide_4',
    title: 'Cinematic 4K Concert Stage & Starlit Sangeet Arena',
    city: 'Delhi NCR',
    category: 'Sound, Stage & FX',
    rating: 4.95,
    reviews: 94,
    price: '₹1,20,000 / night',
    tag: 'Ultra-High Energy',
    image: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30',
    description: 'Curved LED walls, holographic visualizers, high-altitude pyro sparks, and top Bollywood celebrity DJ consoles.'
  },
  {
    id: 'slide_5',
    title: 'Aura of Mogra: 100% Fresh Floral Mandap & Decor',
    city: 'Pan-India Delivery',
    category: 'Luxury Decor & Styling',
    rating: 4.97,
    reviews: 112,
    price: '₹95,000 onwards',
    tag: 'Artisanal Florals',
    image: 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622',
    description: 'Handcrafted fragrant mogra cascades, antique brass diya pillars, baby pink hydrangeas, and crystal candle chandeliers.'
  }
]

export default function TopSlidingImageGallery({ onExploreCategory, onSelectCity }) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isAutoPlaying, setIsAutoPlaying] = useState(true)
  const timerRef = useRef(null)

  // Auto sliding timer
  useEffect(() => {
    if (!isAutoPlaying) return

    timerRef.current = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % GALLERY_SLIDES.length)
    }, 4200)

    return () => clearInterval(timerRef.current)
  }, [isAutoPlaying])

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + GALLERY_SLIDES.length) % GALLERY_SLIDES.length)
  }

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % GALLERY_SLIDES.length)
  }

  const currentSlide = GALLERY_SLIDES[currentIndex]
  const optimizedImg = getOptimizedImageUrl(currentSlide.image, { width: 1200, quality: 80 })

  return (
    <div 
      className="relative w-full max-w-7xl mx-auto my-8 px-4 sm:px-6 lg:px-8 select-none"
      onMouseEnter={() => setIsAutoPlaying(false)}
      onMouseLeave={() => setIsAutoPlaying(true)}
    >
      {/* SECTION HEADER WITH ROYAL BADGE & CARTOON AVATAR */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-5 gap-3">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gradient-to-r from-amber-100 to-amber-200 border border-amber-300 text-[#4a1525] text-xs font-bold tracking-widest uppercase mb-2 shadow-sm">
            <Sparkles className="w-3.5 h-3.5 text-amber-700 animate-spin" style={{ animationDuration: '6s' }} />
            <span>3D Interactive Venue Gallery</span>
            <span className="w-1.5 h-1.5 rounded-full bg-amber-600 animate-ping" />
          </div>
          <h2 className="font-serif text-2xl sm:text-3xl md:text-4xl font-bold text-[#1c1917] tracking-tight flex items-center gap-2">
            <span>Signature Luxury Showcases</span>
            <span className="text-amber-500 font-sans text-xl">✦</span>
          </h2>
        </div>

        {/* Carousel controls & Slide Counter */}
        <div className="flex items-center gap-3">
          <div className="text-xs font-mono font-bold text-stone-500">
            <span className="text-[#4a1525] text-sm">{String(currentIndex + 1).padStart(2, '0')}</span> / {String(GALLERY_SLIDES.length).padStart(2, '0')}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrev}
              aria-label="Previous Slide"
              className="w-10 h-10 rounded-xl bg-white border border-amber-300 hover:border-amber-500 text-[#4a1525] hover:bg-amber-50 flex items-center justify-center transition-all duration-300 shadow-sm hover:scale-105 active:scale-95 cursor-pointer"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={handleNext}
              aria-label="Next Slide"
              className="w-10 h-10 rounded-xl bg-white border border-amber-300 hover:border-amber-500 text-[#4a1525] hover:bg-amber-50 flex items-center justify-center transition-all duration-300 shadow-sm hover:scale-105 active:scale-95 cursor-pointer"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* MAIN 3D SHOWCASE CARD */}
      <div className="relative rounded-3xl overflow-hidden border-2 border-amber-400/80 hover:border-amber-500 bg-[#1c0d12] shadow-[0_20px_50px_rgba(74,21,37,0.22)] transition-all duration-700 min-h-[420px] sm:min-h-[480px] lg:min-h-[520px] flex flex-col justify-end">
        {/* Background Photo with smooth fade & scale */}
        <div 
          key={currentSlide.id}
          className="absolute inset-0 bg-cover bg-center transition-all duration-1000 ease-out transform scale-105 hover:scale-110"
          style={{ backgroundImage: `url('${optimizedImg}')` }}
        />

        {/* Multi-tier Royal Wine Gradients */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#1b050d] via-[#2d0916]/80 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#1b050d]/90 via-[#1b050d]/40 to-transparent" />

        {/* Gold Accent Sheen */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-transparent via-amber-400 to-transparent opacity-90" />

        {/* TOP FLOATING PILLS */}
        <div className="absolute top-4 left-4 right-4 flex items-center justify-between z-10 pointer-events-none">
          <div className="flex items-center gap-2">
            <span className="px-3.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-gradient-to-r from-amber-400 to-amber-500 text-stone-950 shadow-md border border-amber-300/40">
              {currentSlide.tag}
            </span>
            <span className="hidden sm:inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-black/60 backdrop-blur-md text-amber-200 border border-amber-300/30">
              <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
              <span>Government Verified</span>
            </span>
          </div>

          <div className="flex items-center gap-1.5 bg-black/70 backdrop-blur-md px-3.5 py-1 rounded-full text-xs font-bold text-white border border-amber-400/50 shadow-md">
            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
            <span>{currentSlide.rating}</span>
            <span className="text-stone-300 font-normal">({currentSlide.reviews})</span>
          </div>
        </div>

        {/* BOTTOM CONTENT OVERLAY */}
        <div className="relative z-10 p-6 sm:p-8 md:p-10 max-w-3xl">
          <div className="flex items-center gap-2 text-xs font-bold text-amber-300 uppercase tracking-widest mb-2">
            <MapPin className="w-3.5 h-3.5 text-amber-400" />
            <span>{currentSlide.city}</span>
            <span className="text-amber-200/60">•</span>
            <span>{currentSlide.category}</span>
          </div>

          <h3 className="font-serif text-2xl sm:text-3xl md:text-4xl font-bold text-white leading-tight mb-3 drop-shadow-md">
            {currentSlide.title}
          </h3>

          <p className="text-xs sm:text-sm text-stone-200 leading-relaxed line-clamp-2 sm:line-clamp-none mb-5 font-light">
            {currentSlide.description}
          </p>

          <div className="flex flex-wrap items-center gap-4">
            <div className="bg-black/60 border border-amber-400/40 px-4 py-2 rounded-xl backdrop-blur-md">
              <div className="text-[10px] uppercase font-bold text-stone-300">Indicative Pricing</div>
              <div className="text-sm sm:text-base font-bold text-amber-300">{currentSlide.price}</div>
            </div>

            <button
              onClick={() => {
                if (onExploreCategory) onExploreCategory('venues')
              }}
              className="btn-3d-wine px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-amber-100 flex items-center gap-2 cursor-pointer shadow-lg hover:brightness-110 active:scale-95"
            >
              <span>Reserve Celebration Date</span>
              <ArrowRight className="w-4 h-4 text-amber-300" />
            </button>
          </div>
        </div>
      </div>

      {/* THUMBNAIL STRIP BELOW SHOWCASE */}
      <div className="grid grid-cols-5 gap-2 sm:gap-3 mt-3">
        {GALLERY_SLIDES.map((slide, idx) => (
          <button
            key={slide.id}
            onClick={() => setCurrentIndex(idx)}
            className={`relative rounded-xl overflow-hidden h-14 sm:h-20 border-2 transition-all duration-300 cursor-pointer ${
              currentIndex === idx 
                ? 'border-amber-500 shadow-md scale-[1.03]' 
                : 'border-amber-200/80 opacity-60 hover:opacity-100 hover:border-amber-400'
            }`}
          >
            <img 
              src={getOptimizedImageUrl(slide.image, { width: 250, quality: 65 })} 
              alt={slide.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
            <div className="absolute bottom-1 left-1.5 right-1.5 text-left text-[9px] font-bold text-white truncate hidden sm:block">
              {slide.city.split(',')[0]}
            </div>
            {currentIndex === idx && (
              <div className="absolute top-1 right-1 w-2 h-2 rounded-full bg-amber-400 shadow-xs" />
            )}
          </button>
        ))}
      </div>
    </div>
  )
}
