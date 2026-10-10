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
  },
  {
    id: 'slide_6',
    title: 'Grand Rajnigandha & Marigold Royal Mandap Stage',
    city: 'Delhi NCR & Pan-India',
    category: '4K Wedding Stage & Backdrops',
    rating: 4.98,
    reviews: 135,
    price: '₹1,50,000 onwards',
    tag: '4K Royal Stage',
    image: 'https://images.unsplash.com/photo-1583939003579-730e3918a45a',
    description: 'Majestic floral amphitheater with thousands of fresh marigold garlands, cascading rajnigandha, traditional copper kalash pillars, and illuminated royal entry aisle.'
  }
]

export default function TopSlidingImageGallery({ slides, onExploreCategory, onSelectCity }) {
  const activeSlides = (slides && slides.length > 0) ? slides : GALLERY_SLIDES
  const [currentIndex, setCurrentIndex] = useState(0)
  const [progress, setProgress] = useState(0)
  const [isPaused, setIsPaused] = useState(false)
  const [touchStartX, setTouchStartX] = useState(null)
  const SLIDE_DURATION = 4000
  const STEP_INTERVAL = 50

  // Reset index if slides count changes
  useEffect(() => {
    if (currentIndex >= activeSlides.length) {
      setCurrentIndex(0)
    }
  }, [activeSlides.length, currentIndex])

  // Continuous Auto-sliding timer with smooth progress bar
  useEffect(() => {
    if (isPaused || activeSlides.length <= 1) return

    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          setCurrentIndex((cur) => (cur + 1) % activeSlides.length)
          return 0
        }
        return prev + (STEP_INTERVAL / SLIDE_DURATION) * 100
      })
    }, STEP_INTERVAL)

    return () => clearInterval(interval)
  }, [isPaused, activeSlides.length])

  const handlePrev = () => {
    setProgress(0)
    setCurrentIndex((prev) => (prev - 1 + activeSlides.length) % activeSlides.length)
  }

  const handleNext = () => {
    setProgress(0)
    setCurrentIndex((prev) => (prev + 1) % activeSlides.length)
  }

  const handleSelectSlide = (idx) => {
    setProgress(0)
    setCurrentIndex(idx)
  }

  // Touch Swipe handlers for mobile
  const handleTouchStart = (e) => {
    setTouchStartX(e.touches[0].clientX)
  }

  const handleTouchEnd = (e) => {
    if (touchStartX === null) return
    const touchEndX = e.changedTouches[0].clientX
    const diff = touchStartX - touchEndX
    if (diff > 50) {
      handleNext()
    } else if (diff < -50) {
      handlePrev()
    }
    setTouchStartX(null)
  }

  return (
    <div className="relative w-full max-w-7xl mx-auto my-8 px-4 sm:px-6 lg:px-8 select-none">
      {/* SECTION HEADER WITH ROYAL BADGE & CONTROLS */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-5 gap-3">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gradient-to-r from-amber-100 to-amber-200 border border-amber-300 text-[#4a1525] text-xs font-bold tracking-widest uppercase mb-2 shadow-xs">
            <Sparkles className="w-3.5 h-3.5 text-amber-700 animate-spin" style={{ animationDuration: '6s' }} />
            <span>3D Interactive Venue Gallery</span>
            <span className="w-1.5 h-1.5 rounded-full bg-amber-600 animate-ping" />
          </div>
          <h2 className="font-serif text-2xl sm:text-3xl md:text-4xl font-bold text-[#1c1917] tracking-tight flex items-center gap-2">
            <span>Signature Luxury Showcases</span>
            <span className="text-amber-500 font-sans text-xl">✦</span>
          </h2>
        </div>

        {/* Carousel controls, Auto-slide Progress Bar & Slide Counter */}
        <div className="flex items-center gap-3">
          {/* Animated Auto-Slide Indicator & Progress */}
          <div 
            onClick={() => setIsPaused(!isPaused)}
            title={isPaused ? "Click to resume auto-slide" : "Auto-sliding active (Click to pause)"}
            className="flex items-center gap-2 bg-stone-50 hover:bg-amber-50/80 px-3 py-1.5 rounded-full border border-stone-200 hover:border-amber-300 transition-colors cursor-pointer shadow-2xs"
          >
            <div className="w-14 sm:w-20 h-1.5 bg-stone-200 rounded-full overflow-hidden">
              <div 
                className={`h-full bg-gradient-to-r from-amber-500 to-[#4a1525] rounded-full transition-all duration-75 ${isPaused ? 'opacity-40' : ''}`}
                style={{ width: `${progress}%` }}
              />
            </div>
            <span className="text-[10px] font-bold text-stone-700 uppercase tracking-wider flex items-center gap-1">
              <span className={`w-1.5 h-1.5 rounded-full ${isPaused ? 'bg-amber-400' : 'bg-emerald-500 animate-pulse'}`} />
              <span className="hidden sm:inline">{isPaused ? 'Paused' : 'Auto Slide'}</span>
            </span>
          </div>

          <div className="text-xs font-mono font-bold text-stone-500">
            <span className="text-[#4a1525] text-sm font-bold">{String(currentIndex + 1).padStart(2, '0')}</span> / {String(activeSlides.length).padStart(2, '0')}
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={handlePrev}
              aria-label="Previous Slide"
              className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-white border border-amber-300 hover:border-amber-500 text-[#4a1525] hover:bg-amber-50 flex items-center justify-center transition-all duration-300 shadow-xs hover:scale-105 active:scale-95 cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
            <button
              onClick={handleNext}
              aria-label="Next Slide"
              className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-white border border-amber-300 hover:border-amber-500 text-[#4a1525] hover:bg-amber-50 flex items-center justify-center transition-all duration-300 shadow-xs hover:scale-105 active:scale-95 cursor-pointer"
            >
              <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* MAIN 3D SHOWCASE CARD WITH HORIZONTAL SLIDING TRACK */}
      <div 
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        className="relative rounded-3xl overflow-hidden border-2 border-amber-400/80 hover:border-amber-500 bg-[#1c0d12] shadow-[0_20px_50px_rgba(74,21,37,0.22)] min-h-[440px] sm:min-h-[500px] lg:min-h-[540px]"
      >
        {/* Horizontal sliding track */}
        <div 
          className="flex w-full h-full transition-transform duration-700 ease-out"
          style={{ transform: `translateX(-${currentIndex * 100}%)` }}
        >
          {activeSlides.map((slide, idx) => {
            const optimizedImg = getOptimizedImageUrl(slide.image || GALLERY_SLIDES[0].image, { width: 2000, quality: 85 })
            return (
              <div 
                key={slide.id || idx}
                className="w-full shrink-0 relative min-h-[440px] sm:min-h-[500px] lg:min-h-[540px] flex flex-col justify-end p-6 sm:p-8 md:p-10 select-none overflow-hidden"
              >
                {/* Background Photo */}
                <div 
                  className="absolute inset-0 bg-cover bg-center transition-transform duration-1000 transform scale-105"
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
                      {slide.tag || 'Signature Showcase'}
                    </span>
                    <span className="hidden sm:inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-black/60 backdrop-blur-md text-amber-200 border border-amber-300/30">
                      <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
                      <span>Government Verified</span>
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5 bg-black/70 backdrop-blur-md px-3.5 py-1 rounded-full text-xs font-bold text-white border border-amber-400/50 shadow-md">
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    <span>{slide.rating || 4.98}</span>
                    <span className="text-stone-300 font-normal">({slide.reviews || 120})</span>
                  </div>
                </div>

                {/* BOTTOM CONTENT OVERLAY */}
                <div className="relative z-10 max-w-3xl">
                  <div className="flex items-center gap-2 text-xs font-bold text-amber-300 uppercase tracking-widest mb-2">
                    <MapPin className="w-3.5 h-3.5 text-amber-400" />
                    <span>{slide.city}</span>
                    <span className="text-amber-200/60">•</span>
                    <span>{slide.category}</span>
                  </div>

                  <h3 className="font-serif text-2xl sm:text-3xl md:text-4xl font-bold text-white leading-tight mb-3 drop-shadow-md">
                    {slide.title}
                  </h3>

                  <p className="text-xs sm:text-sm text-stone-200 leading-relaxed line-clamp-2 sm:line-clamp-none mb-5 font-light">
                    {slide.description}
                  </p>

                  <div className="flex flex-wrap items-center gap-4">
                    <div className="bg-black/60 border border-amber-400/40 px-4 py-2 rounded-xl backdrop-blur-md">
                      <div className="text-[10px] uppercase font-bold text-stone-300">Indicative Pricing</div>
                      <div className="text-sm sm:text-base font-bold text-amber-300">{slide.price}</div>
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
            )
          })}
        </div>
      </div>

      {/* THUMBNAIL STRIP BELOW SHOWCASE */}
      <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 sm:gap-3 mt-3">
        {activeSlides.map((slide, idx) => (
          <button
            key={slide.id || idx}
            onClick={() => handleSelectSlide(idx)}
            className={`relative rounded-xl overflow-hidden h-14 sm:h-20 border-2 transition-all duration-300 cursor-pointer ${
              currentIndex === idx 
                ? 'border-amber-500 shadow-md scale-[1.03] ring-2 ring-amber-400/50' 
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
