'use client'

import React, { useState, useEffect, useRef } from 'react'
import { Star, ChevronLeft, ChevronRight, Quote, ShieldCheck, Sparkles, MapPin, Calendar } from 'lucide-react'
import { getOptimizedImageUrl } from '@/lib/imageUtils'

const INDIAN_REVIEWS = [
  {
    id: 'rev_1',
    clientNames: 'Aanya & Kabir Kapoor',
    parentsTitle: 'The Kapoor & Singhania Families',
    city: 'Udaipur, Rajasthan',
    venue: 'Jagmandir Island Palace',
    event: '3-Day Royal Destination Wedding',
    date: 'February 2026',
    rating: 5,
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb',
    quote:
      'Planning a 650-guest destination wedding in Udaipur felt overwhelming until we partnered with Vows & Venues. From the private boat baraat across Lake Pichola to the traditional Mewari floral mandap, every single vendor executed with royal precision. Our parents did not have to make a single stressful phone call on the wedding day!',
    highlight: '650+ Guests Managed Flawlessly'
  },
  {
    id: 'rev_2',
    clientNames: 'Meera & Devendra Trivedi',
    parentsTitle: 'Trivedi Parivaar',
    city: 'Lucknow, Uttar Pradesh',
    venue: 'The Grand Shahi Awadhi Banquet',
    event: 'Traditional Awadhi Nikah & Reception',
    date: 'January 2026',
    rating: 5,
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d',
    quote:
      'Our family’s biggest priority was authentic royal Awadhi dawat. The slow-cooked Dum Pukht biryani, melt-in-mouth Galouti kebabs on Sheermal, and fragrant Shahi Tukda counters were praised by every single elder in our khandaan. The 25% milestone split payment gave us absolute financial clarity.',
    highlight: 'Authentic Shahi Awadhi Feast'
  },
  {
    id: 'rev_3',
    clientNames: 'Priya & Rohan Singhania',
    parentsTitle: 'Singhania & Goenka Celebrations',
    city: 'Delhi NCR',
    venue: 'Grand Aerocity Convention Lawns',
    event: 'High-Energy Sangeet & Reception',
    date: 'December 2025',
    rating: 5,
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9',
    quote:
      'The concert-grade sound, 4K curved LED walls, and celebrity DJ console for our 800-guest Sangeet were unbelievable. The platform’s verified vendor seal meant zero double-booking panic. We received our 4K cinematic teaser video within 7 days, capturing every tear and dance step perfectly!',
    highlight: 'Concert Sound & 4K Teaser in 7 Days'
  },
  {
    id: 'rev_4',
    clientNames: 'Tanvi & Siddharth Mehta',
    parentsTitle: 'The Mehta Family',
    city: 'Jaipur, Rajasthan',
    venue: 'Rambagh Heritage Citadel & Lawns',
    event: 'Heritage Royal Vivaah',
    date: 'November 2025',
    rating: 5,
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2',
    quote:
      'Finding verified heritage fort decorators with authentic antique brass diyas and fresh mogra cascades was seamless. The transparent pricing and zero hidden markups saved us easily ₹4,50,000 compared to unverified market brokers. Truly India’s premier luxury wedding atelier.',
    highlight: 'Saved ₹4.5L with Direct Pricing'
  },
  {
    id: 'rev_5',
    clientNames: 'Dr. Rhea & Arjun Verma',
    parentsTitle: 'Verma & Saxena Families',
    city: 'Bengaluru, Karnataka',
    venue: 'Palace Grounds Regal Lawns',
    event: 'Sundowner Mehendi & Grand Reception',
    date: 'October 2025',
    rating: 5,
    avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d',
    quote:
      'From customized live Sufi musicians at our sunset lawn mehendi to bespoke bridal entry pyro effects, every single minute was magical. The concierge desk even assisted our outstation guests with hotel coordination. Highest possible recommendation!',
    highlight: 'Bespoke Live Sufi & Concierge'
  }
]

export default function SlidingReviewsSection() {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isAutoPlaying, setIsAutoPlaying] = useState(true)
  const timerRef = useRef(null)

  // Auto sliding every 4.8 seconds
  useEffect(() => {
    if (!isAutoPlaying) return

    timerRef.current = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % INDIAN_REVIEWS.length)
    }, 4800)

    return () => clearInterval(timerRef.current)
  }, [isAutoPlaying])

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + INDIAN_REVIEWS.length) % INDIAN_REVIEWS.length)
  }

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % INDIAN_REVIEWS.length)
  }

  const currentReview = INDIAN_REVIEWS[currentIndex]

  return (
    <section 
      className="py-16 sm:py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-[#e8e2d5] select-none"
      onMouseEnter={() => setIsAutoPlaying(false)}
      onMouseLeave={() => setIsAutoPlaying(true)}
    >
      {/* SECTION HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10 sm:mb-14 gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gradient-to-r from-amber-100 to-amber-200 border border-amber-300 text-[#4a1525] text-xs font-bold tracking-widest uppercase mb-2 shadow-xs">
            <Sparkles className="w-3.5 h-3.5 text-amber-700" />
            <span>Client Memoirs &amp; Celebrations</span>
          </div>
          <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl font-bold text-[#1c1917] tracking-tight">
            Celebrated by India’s Discerning Families
          </h2>
          <p className="text-xs sm:text-sm text-[#78716c] mt-2 max-w-xl">
            Real experiences from grand multi-day weddings planned effortlessly through Vows &amp; Venues across Rajasthan, Lucknow, and Pan-India.
          </p>
        </div>

        {/* SLIDER NAVIGATION CONTROLS */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="text-xs font-mono font-bold text-stone-500">
            <span className="text-[#4a1525] text-sm font-bold">{String(currentIndex + 1).padStart(2, '0')}</span> / {String(INDIAN_REVIEWS.length).padStart(2, '0')}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrev}
              aria-label="Previous Review"
              className="w-10 h-10 rounded-xl bg-white border border-amber-300 hover:border-amber-500 text-[#4a1525] hover:bg-amber-50 flex items-center justify-center transition-all duration-300 shadow-sm hover:scale-105 active:scale-95 cursor-pointer"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={handleNext}
              aria-label="Next Review"
              className="w-10 h-10 rounded-xl bg-white border border-amber-300 hover:border-amber-500 text-[#4a1525] hover:bg-amber-50 flex items-center justify-center transition-all duration-300 shadow-sm hover:scale-105 active:scale-95 cursor-pointer"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* HERO SLIDING TESTIMONIAL FEATURE CARD */}
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-[#fffdfa] via-[#fcf8f0] to-[#f7efe0] border-2 border-amber-300/80 shadow-[0_16px_45px_rgba(74,21,37,0.08)] p-7 sm:p-10 lg:p-12 transition-all duration-700">
        {/* Subtle decorative gold filigree top accent */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#4a1525] via-amber-400 via-amber-500 to-[#4a1525]" />
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          
          {/* LEFT: Client Avatar & Wedding Credentials */}
          <div className="lg:col-span-4 flex flex-col items-center lg:items-start text-center lg:text-left border-b lg:border-b-0 lg:border-r border-amber-200/80 pb-6 lg:pb-0 lg:pr-8">
            <div className="relative mb-4">
              <img
                src={getOptimizedImageUrl(currentReview.avatar, { width: 180, quality: 80 })}
                alt={currentReview.clientNames}
                className="w-20 h-20 sm:w-24 sm:h-24 rounded-full object-cover border-4 border-amber-300 shadow-md transition-transform duration-500 hover:scale-105"
              />
              <span className="absolute -bottom-1 -right-1 bg-gradient-to-r from-amber-400 to-amber-500 text-stone-950 p-1.5 rounded-full shadow-md" title="Verified Indian Wedding">
                <ShieldCheck className="w-4 h-4 text-stone-950" />
              </span>
            </div>

            <h3 className="font-serif text-xl sm:text-2xl font-bold text-[#1c1917]">
              {currentReview.clientNames}
            </h3>
            
            <p className="text-xs font-semibold text-[#4a1525] mt-0.5">
              {currentReview.parentsTitle}
            </p>

            <div className="mt-3.5 space-y-1.5 text-xs text-stone-600 font-medium">
              <div className="flex items-center gap-1.5 justify-center lg:justify-start">
                <MapPin className="w-3.5 h-3.5 text-amber-700 shrink-0" />
                <span>{currentReview.venue}, {currentReview.city.split(',')[0]}</span>
              </div>
              <div className="flex items-center gap-1.5 justify-center lg:justify-start text-stone-500">
                <Calendar className="w-3.5 h-3.5 text-amber-700 shrink-0" />
                <span>{currentReview.event} &bull; {currentReview.date}</span>
              </div>
            </div>

            <div className="mt-4 px-3 py-1 rounded-full bg-emerald-100/80 border border-emerald-300 text-emerald-900 text-[11px] font-bold">
              ✓ {currentReview.highlight}
            </div>
          </div>

          {/* RIGHT: Authentic Review Quote & Experience */}
          <div className="lg:col-span-8 flex flex-col justify-between">
            <div>
              {/* Star Rating Badge */}
              <div className="flex items-center gap-2 mb-4">
                <div className="flex items-center gap-1 text-amber-500 bg-amber-100/90 px-3 py-1 rounded-full border border-amber-300/80 shadow-xs">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <span className="text-xs font-bold text-stone-700 uppercase tracking-wider">
                  5.0 / 5 Verified Family Review
                </span>
              </div>

              {/* Heartfelt Quote */}
              <div className="relative">
                <Quote className="w-10 h-10 text-amber-300/40 absolute -top-4 -left-3 -z-0 pointer-events-none rotate-180" />
                <p className="font-serif italic text-base sm:text-lg lg:text-xl text-stone-800 leading-relaxed font-normal relative z-10">
                  &ldquo;{currentReview.quote}&rdquo;
                </p>
              </div>
            </div>

            {/* Bottom Proof Strip */}
            <div className="mt-8 pt-5 border-t border-amber-200/80 flex flex-wrap items-center justify-between gap-3 text-xs text-stone-500">
              <span className="flex items-center gap-1.5 text-stone-700 font-semibold">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Zero Double Booking Shield Guaranteed</span>
              </span>
              <span className="text-[11px] text-stone-500">
                Direct date locked via Vows &amp; Venues Milestone Portal
              </span>
            </div>
          </div>

        </div>
      </div>

      {/* THUMBNAIL PAGINATION STRIP (Click to Jump) */}
      <div className="flex items-center justify-center gap-2 mt-6">
        {INDIAN_REVIEWS.map((review, idx) => (
          <button
            key={review.id}
            onClick={() => setCurrentIndex(idx)}
            aria-label={`Jump to review by ${review.clientNames}`}
            className={`transition-all duration-300 rounded-full cursor-pointer ${
              currentIndex === idx
                ? 'w-8 h-2.5 bg-[#4a1525]'
                : 'w-2.5 h-2.5 bg-amber-300/80 hover:bg-amber-400'
            }`}
          />
        ))}
      </div>
    </section>
  )
}
