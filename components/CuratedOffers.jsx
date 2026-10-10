'use client'

import React, { useState, useEffect, useRef } from 'react'
import { Sparkles, Tag, ArrowRight, Check, Copy, ChevronLeft, ChevronRight } from 'lucide-react'
import { toast } from 'sonner'

export default function CuratedOffers({ offers = [], onSelectOffer }) {
  const [copiedCode, setCopiedCode] = useState(null)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [progress, setProgress] = useState(0)
  const [isPaused, setIsPaused] = useState(false)
  const [touchStartX, setTouchStartX] = useState(null)
  const SLIDE_DURATION = 3800
  const STEP_INTERVAL = 50

  const handleCopy = (code) => {
    navigator.clipboard?.writeText(code)
    setCopiedCode(code)
    toast.success(`Promo code "${code}" copied to clipboard!`)
    setTimeout(() => setCopiedCode(null), 3000)
  }

  // Auto-sliding timer with smooth progress bar
  useEffect(() => {
    if (!offers || offers.length <= 1 || isPaused) return

    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          setCurrentIndex((cur) => (cur + 1) % offers.length)
          return 0
        }
        return prev + (STEP_INTERVAL / SLIDE_DURATION) * 100
      })
    }, STEP_INTERVAL)

    return () => clearInterval(interval)
  }, [offers.length, isPaused])

  const handlePrev = () => {
    setProgress(0)
    setCurrentIndex((prev) => (prev - 1 + offers.length) % offers.length)
  }

  const handleNext = () => {
    setProgress(0)
    setCurrentIndex((prev) => (prev + 1) % offers.length)
  }

  const handleSelectOffer = (idx) => {
    setProgress(0)
    setCurrentIndex(idx)
  }

  // Mobile Touch Swipe
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

  if (!offers || offers.length === 0) return null

  // For infinite looping sliding track
  const loopOffers = [...offers, ...offers, ...offers]

  return (
    <section className="py-12 sm:py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto select-none">
      {/* SECTION HEADER WITH CONTROLS & AUTO-SLIDE PROGRESS */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 sm:mb-10 gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-amber-100 via-amber-200 to-amber-100 border border-amber-300 text-[#4a1525] text-[10px] font-bold tracking-[0.2em] uppercase mb-2 shadow-xs">
            <Sparkles className="w-3.5 h-3.5 text-amber-700" />
            <span>Exclusive Privileges · Auto-Sliding</span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          </div>
          <h2 className="font-serif text-2xl sm:text-3xl md:text-4xl font-bold text-[#1c1917] tracking-tight">
            Seasonal Celebration Offers
          </h2>
          <p className="text-xs text-stone-600 max-w-md mt-1.5">
            Handcrafted incentives for multi-vendor booking, cinematography, and couture bridal styling.
          </p>
        </div>

        {/* Carousel controls, Auto-slide Progress Bar & Slide Counter */}
        <div className="flex items-center gap-3 shrink-0">
          {/* Animated Auto-Slide Progress Pill */}
          <div 
            onClick={() => setIsPaused(!isPaused)}
            title={isPaused ? "Click to resume auto-slide" : "Auto-sliding active (Click to pause)"}
            className="flex items-center gap-2 bg-stone-50 hover:bg-amber-50/80 px-3 py-1.5 rounded-full border border-stone-200 hover:border-amber-300 transition-colors cursor-pointer shadow-2xs"
          >
            <div className="w-12 sm:w-16 h-1.5 bg-stone-200 rounded-full overflow-hidden">
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
            <span className="text-[#4a1525] text-sm font-bold">{String(currentIndex + 1).padStart(2, '0')}</span> / {String(offers.length).padStart(2, '0')}
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={handlePrev}
              aria-label="Previous Offer"
              className="w-9 h-9 rounded-xl bg-white border border-amber-300 hover:border-amber-500 text-[#4a1525] hover:bg-amber-50 flex items-center justify-center transition-all duration-300 shadow-xs hover:scale-105 active:scale-95 cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={handleNext}
              aria-label="Next Offer"
              className="w-9 h-9 rounded-xl bg-white border border-amber-300 hover:border-amber-500 text-[#4a1525] hover:bg-amber-50 flex items-center justify-center transition-all duration-300 shadow-xs hover:scale-105 active:scale-95 cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* AUTO-SLIDING CAROUSEL TRACK */}
      <div 
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        className="relative overflow-hidden py-2"
      >
        <div 
          className="flex transition-transform duration-700 ease-out"
          style={{ 
            transform: `translateX(-${currentIndex * 100}%)`,
          }}
        >
          {/* Mobile: 1 card per slide (100% width) */}
          {offers.map((offer, idx) => {
            const isFeatured = currentIndex === idx
            return (
              <div
                key={offer.id || offer.code || idx}
                className="w-full shrink-0 md:hidden px-1"
              >
                <div className={`bg-gradient-to-br from-[#fffdfa] via-[#faf6ee] to-[#f4ebe1] rounded-2xl p-6 border transition-all duration-400 flex flex-col justify-between relative overflow-hidden shadow-sm hover:shadow-xl ${
                  isFeatured ? 'border-[#c5a059] ring-2 ring-[#c5a059]/40' : 'border-[#e2d5c3]'
                }`}>
                  <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#4a1525] via-[#c5a059] to-[#4a1525]" />
                  <div className="absolute -bottom-4 -right-4 text-[#c5a059]/10 text-7xl font-serif pointer-events-none select-none">
                    ⚜
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#4a1525] text-amber-200 border border-amber-400/40 shadow-xs flex items-center gap-1.5">
                        <Sparkles className="w-3 h-3 text-amber-300" />
                        {offer.badge || "Signature Privilege"}
                      </span>
                      <span className="font-serif font-bold text-xl text-[#4a1525] tracking-tight">
                        {offer.discount}
                      </span>
                    </div>

                    <h3 className="font-serif font-bold text-lg text-[#1c1917] mb-2">
                      {offer.title}
                    </h3>
                    <p className="text-xs text-stone-600 leading-relaxed mb-6 font-normal">
                      {offer.desc || offer.description}
                    </p>
                  </div>

                  <div className="pt-4 border-t border-dashed border-[#c5a059]/40 flex items-center justify-between relative">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-stone-900 bg-amber-50/90 px-3 py-1.5 rounded-lg border border-amber-300/80 shadow-xs flex items-center gap-1.5">
                        <Tag className="w-3 h-3 text-[#c5a059]" />
                        {offer.code}
                      </span>
                      <button
                        onClick={() => handleCopy(offer.code)}
                        title="Copy code"
                        className="p-1.5 rounded-lg bg-white hover:bg-amber-100 text-stone-600 hover:text-[#4a1525] border border-stone-200 transition-colors shadow-xs active:scale-90 cursor-pointer"
                      >
                        {copiedCode === offer.code ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>

                    <button
                      onClick={() => onSelectOffer && onSelectOffer(offer)}
                      className="px-3.5 py-1.5 rounded-full bg-[#4a1525] hover:bg-[#340b17] text-amber-200 text-xs font-bold flex items-center gap-1 transition-all active:scale-95 shadow-sm cursor-pointer"
                    >
                      <span>Apply Code</span>
                      <ArrowRight className="w-3 h-3 text-amber-300" />
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Desktop & Tablet: Auto-sliding 3-card track */}
        <div 
          className="hidden md:flex transition-transform duration-700 ease-out"
          style={{ 
            transform: `translateX(-${(currentIndex % offers.length) * 33.333}%)`,
          }}
        >
          {loopOffers.map((offer, idx) => {
            const isFeatured = (idx % offers.length) === currentIndex
            return (
              <div
                key={`${offer.id || offer.code}-${idx}`}
                className="w-1/3 shrink-0 px-2.5"
              >
                <div className={`bg-gradient-to-br from-[#fffdfa] via-[#faf6ee] to-[#f4ebe1] rounded-2xl p-6 border transition-all duration-500 flex flex-col justify-between relative overflow-hidden group hover:-translate-y-1 h-full min-h-[250px] ${
                  isFeatured 
                    ? 'border-[#c5a059] shadow-xl ring-2 ring-[#c5a059]/40 scale-[1.02]' 
                    : 'border-[#e2d5c3] shadow-sm hover:border-[#c5a059] opacity-90 hover:opacity-100'
                }`}>
                  <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#4a1525] via-[#c5a059] to-[#4a1525]" />
                  <div className="absolute -bottom-4 -right-4 text-[#c5a059]/10 text-7xl font-serif pointer-events-none select-none">
                    ⚜
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#4a1525] text-amber-200 border border-amber-400/40 shadow-xs flex items-center gap-1.5">
                        <Sparkles className="w-3 h-3 text-amber-300" />
                        {offer.badge || "Signature Privilege"}
                      </span>
                      <span className="font-serif font-bold text-xl text-[#4a1525] tracking-tight">
                        {offer.discount}
                      </span>
                    </div>

                    <h3 className="font-serif font-bold text-lg text-[#1c1917] mb-2 group-hover:text-[#4a1525] transition-colors">
                      {offer.title}
                    </h3>
                    <p className="text-xs text-stone-600 leading-relaxed mb-6 font-normal">
                      {offer.desc || offer.description}
                    </p>
                  </div>

                  <div className="pt-4 border-t border-dashed border-[#c5a059]/40 flex items-center justify-between relative">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-stone-900 bg-amber-50/90 px-3 py-1.5 rounded-lg border border-amber-300/80 shadow-xs flex items-center gap-1.5">
                        <Tag className="w-3 h-3 text-[#c5a059]" />
                        {offer.code}
                      </span>
                      <button
                        onClick={() => handleCopy(offer.code)}
                        title="Copy code"
                        className="p-1.5 rounded-lg bg-white hover:bg-amber-100 text-stone-600 hover:text-[#4a1525] border border-stone-200 transition-colors shadow-xs active:scale-90 cursor-pointer"
                      >
                        {copiedCode === offer.code ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>

                    <button
                      onClick={() => onSelectOffer && onSelectOffer(offer)}
                      className="px-3.5 py-1.5 rounded-full bg-[#4a1525] hover:bg-[#340b17] text-amber-200 text-xs font-bold flex items-center gap-1 transition-all active:scale-95 shadow-sm cursor-pointer"
                    >
                      <span>Apply Code</span>
                      <ArrowRight className="w-3 h-3 text-amber-300" />
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* DOT INDICATORS BELOW CAROUSEL */}
      <div className="flex items-center justify-center gap-2 mt-6">
        {offers.map((_, idx) => (
          <button
            key={idx}
            onClick={() => handleSelectOffer(idx)}
            aria-label={`Jump to offer ${idx + 1}`}
            className={`transition-all duration-300 rounded-full cursor-pointer ${
              currentIndex === idx
                ? 'w-7 h-2 bg-gradient-to-r from-amber-500 to-[#4a1525] shadow-xs'
                : 'w-2 h-2 bg-stone-300 hover:bg-amber-400'
            }`}
          />
        ))}
      </div>
    </section>
  )
}
