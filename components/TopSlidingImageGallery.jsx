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
      {/* SECTION HEADER WITH NEON BADGE & CARTOON AVATAR */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-5 gap-3">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#00ff88]/10 border border-[#00ff88]/40 text-[#00ff88] text-xs font-black tracking-widest uppercase mb-2 shadow-[0_0_15px_rgba(0,255,136,0.3)]">
            <Sparkles className="w-3.5 h-3.5 text-[#00ff88] animate-spin" style={{ animationDuration: '6s' }} />
            <span>3D Interactive Venue Gallery</span>
            <span className="w-1.5 h-1.5 rounded-full bg-[#00ff88] animate-ping" />
          </div>
          <h2 className="font-serif text-2xl sm:text-3xl md:text-4xl font-black text-white tracking-tight flex items-center gap-2">
            <span>Signature Luxury Showcases</span>
            <span className="text-[#00ff88] drop-shadow-[0_0_12px_rgba(0,255,136,0.8)] font-sans text-xl">✦</span>
          </h2>
        </div>

        {/* Carousel controls & Slide Counter */}
        <div className="flex items-center gap-3">
          <div className="text-xs font-mono font-bold text-stone-400">
            <span className="text-[#00ff88] text-sm">{String(currentIndex + 1).padStart(2, '0')}</span> / {String(GALLERY_SLIDES.length).padStart(2, '0')}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrev}
              aria-label="Previous Slide"
              className="w-10 h-10 rounded-xl bg-[#0e1713] border border-[#00ff88]/40 hover:border-[#00ff88] text-white hover:text-[#00ff88] flex items-center justify-center transition-all duration-300 shadow-[0_0_15px_rgba(0,0,0,0.6)] hover:shadow-[0_0_20px_rgba(0,255,136,0.4)] hover:scale-105 active:scale-95 cursor-pointer"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={handleNext}
              aria-label="Next Slide"
              className="w-10 h-10 rounded-xl bg-[#0e1713] border border-[#00ff88]/40 hover:border-[#00ff88] text-white hover:text-[#00ff88] flex items-center justify-center transition-all duration-300 shadow-[0_0_15px_rgba(0,0,0,0.6)] hover:shadow-[0_0_20px_rgba(0,255,136,0.4)] hover:scale-105 active:scale-95 cursor-pointer"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* MAIN 3D SHOWCASE CARD */}
      <div className="relative rounded-3xl overflow-hidden border-2 border-[#00ff88]/40 hover:border-[#00ff88] bg-[#070e0a] shadow-[0_0_40px_rgba(0,255,136,0.25)] transition-all duration-700 min-h-[420px] sm:min-h-[480px] lg:min-h-[520px] flex flex-col justify-end">
        {/* Background Photo with smooth fade & scale */}
        <div 
          key={currentSlide.id}
          className="absolute inset-0 bg-cover bg-center transition-all duration-1000 ease-out transform scale-105 hover:scale-110"
          style={{ backgroundImage: `url('${optimizedImg}')` }}
        />

        {/* Multi-tier Cyber Obsidian Gradients */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#050807] via-[#050807]/75 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#050807]/90 via-[#050807]/40 to-transparent" />

        {/* Neon Green Scanline Sheen */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#00ff88] to-transparent opacity-80 animate-pulse" />

        {/* TOP FLOATING PILLS */}
        <div className="absolute top-4 left-4 right-4 flex items-center justify-between z-10 pointer-events-none">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-[#00ff88] text-[#050807] shadow-[0_0_15px_rgba(0,255,136,0.8)] border border-white/40">
              {currentSlide.tag}
            </span>
            <span className="hidden sm:inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-[#050807]/80 backdrop-blur-md text-white border border-[#00ff88]/30">
              <ShieldCheck className="w-3.5 h-3.5 text-[#00ff88]" />
              <span>Government Verified</span>
            </span>
          </div>

          <div className="flex items-center gap-1.5 bg-[#050807]/90 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold text-white border border-amber-400/40 shadow-md">
            <Star className="w-3.5 h-3.5 fill-amber-300 text-amber-300" />
            <span>{currentSlide.rating}</span>
            <span className="text-stone-400 font-normal">({currentSlide.reviews})</span>
          </div>
        </div>

        {/* BOTTOM CONTENT OVERLAY */}
        <div className="relative z-10 p-6 sm:p-8 md:p-10 max-w-3xl">
          <div className="flex items-center gap-2 text-xs font-bold text-[#00ff88] uppercase tracking-widest mb-2">
            <MapPin className="w-3.5 h-3.5 text-[#00ff88]" />
            <span>{currentSlide.city}</span>
            <span className="text-stone-500">•</span>
            <span>{currentSlide.category}</span>
          </div>

          <h3 className="font-serif text-2xl sm:text-3xl md:text-4xl font-bold text-white leading-tight mb-3 drop-shadow-md">
            {currentSlide.title}
          </h3>

          <p className="text-xs sm:text-sm text-stone-300 leading-relaxed line-clamp-2 sm:line-clamp-none mb-5 font-light">
            {currentSlide.description}
          </p>

          <div className="flex flex-wrap items-center gap-4">
            <div className="bg-[#0e1713]/90 border border-[#00ff88]/30 px-4 py-2 rounded-xl backdrop-blur-md">
              <div className="text-[10px] uppercase font-bold text-stone-400">Indicative Pricing</div>
              <div className="text-sm sm:text-base font-black text-[#00ff88]">{currentSlide.price}</div>
            </div>

            <button
              onClick={() => {
                if (onExploreCategory) onExploreCategory('venues')
              }}
              className="btn-neon-green px-5 py-2.5 rounded-xl text-xs sm:text-sm font-black flex items-center gap-2 cursor-pointer shadow-[0_0_20px_rgba(0,255,136,0.6)]"
            >
              <span>Reserve Celebration Date</span>
              <ArrowRight className="w-4 h-4" />
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
                ? 'border-[#00ff88] shadow-[0_0_20px_rgba(0,255,136,0.7)] scale-[1.03]' 
                : 'border-[#1a2d24] opacity-50 hover:opacity-100 hover:border-[#00ff88]/60'
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
              <div className="absolute top-1 right-1 w-2 h-2 rounded-full bg-[#00ff88] shadow-[0_0_8px_#00ff88]" />
            )}
          </button>
        ))}
      </div>
    </div>
  )
}
