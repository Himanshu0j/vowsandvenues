'use client'

import React from 'react'
import {
  Crown,
  MapPin,
  CalendarDays,
  ShieldCheck,
  Star,
  Users,
  ArrowRight,
  Sparkles
} from 'lucide-react'
import { getOptimizedImageUrl } from '@/lib/imageUtils'
import ScrollReveal, { TextLineReveal, ImageReveal } from './ScrollReveal'

export default function RoyalVenueRevealSection({
  onSelectVenue,
  onCheckAvailability,
  onExploreVenues
}) {
  const palaceImg = getOptimizedImageUrl(
    'https://images.unsplash.com/photo-1587271407850-8d438ca9fdf2',
    { width: 1800, quality: 85 }
  )

  return (
    <section className="py-20 sm:py-28 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto select-none overflow-hidden">
      
      {/* SECTION TOP OVERLINE & LINE-REVEAL HEADING */}
      <div className="text-center max-w-3xl mx-auto mb-14 sm:mb-20">
        <ScrollReveal animation="fade-down" delay={0.05}>
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-champagne/15 border border-champagne/40 text-burgundy text-[11px] font-bold tracking-[0.22em] uppercase mb-4 shadow-2xs">
            <Crown className="w-3.5 h-3.5 text-champagne" />
            <span>Scene II · The Royal Heritage Reveal</span>
          </div>
        </ScrollReveal>

        <TextLineReveal
          lines={[
            'Step into Majestic',
            'Living Royalty.'
          ]}
          className="font-serif text-3xl sm:text-5xl md:text-6xl font-bold text-espresso tracking-tight leading-[1.12]"
          lineClassName="first:text-stone-900 last:italic last:font-normal last:text-burgundy"
          stagger={0.14}
        />

        <ScrollReveal animation="fade-up" delay={0.25}>
          <p className="text-xs sm:text-sm md:text-base text-stone-600 mt-4 font-normal leading-relaxed max-w-xl mx-auto">
            Immerse your celebration within sandstone ramparts, carved jharokhas, and starlit Mewari courtyards hand-preserved for generations.
          </p>
        </ScrollReveal>
      </div>

      {/* EDITORIAL 2-COLUMN SPLIT SHOWCASE (MATCHING REFERENCE DESIGN) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
        
        {/* LEFT COLUMN: LARGE VENUE PHOTOGRAPHY WITH SMOOTH SCALE & FLOATING QUOTE */}
        <div className="lg:col-span-7">
          <ImageReveal
            src={palaceImg}
            alt="Rambagh Citadel & Mughal Gardens"
            className="rounded-3xl sm:rounded-[2.5rem] border-2 border-champagne/60 shadow-[0_25px_70px_rgba(30,10,20,0.18)] min-h-[420px] sm:min-h-[520px] aspect-[4/3] lg:aspect-[5/6]"
            imgClassName="transition-transform duration-1000 hover:scale-105"
          >
            {/* Top Floating Badge */}
            <div className="absolute top-4 left-4 sm:top-6 sm:left-6 flex flex-wrap items-center gap-2 z-10">
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/60 backdrop-blur-md border border-amber-300/40 text-amber-200 text-xs font-semibold shadow-md">
                <Sparkles className="w-3.5 h-3.5 text-champagne" />
                <span>Featured Sanctuary</span>
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/60 backdrop-blur-md border border-white/20 text-stone-200 text-xs font-medium">
                <MapPin className="w-3.5 h-3.5 text-champagne" />
                <span>Jaipur, Rajasthan</span>
              </span>
            </div>

            {/* Subtle Gradient Scrim at Bottom */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-transparent pointer-events-none" />

            {/* Overlaid Floating Testimonial Quote Card (Mirroring Reference Design) */}
            <div className="absolute bottom-4 left-4 right-4 sm:bottom-6 sm:left-6 sm:right-6 bg-stone-950/85 backdrop-blur-xl border border-amber-300/35 rounded-2xl p-4 sm:p-5 text-white z-10 shadow-2xl">
              <p className="font-serif italic text-xs sm:text-sm text-amber-100/95 leading-relaxed">
                &ldquo;The carved Mewari sandstone courtyards at twilight are completely unmatched in royal splendor. Our guests still talk about the baraat procession.&rdquo;
              </p>
              <div className="flex items-center justify-between mt-3 pt-3 border-t border-white/10 text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-amber-400 to-amber-200 text-stone-900 font-bold flex items-center justify-center text-[10px]">
                    AK
                  </div>
                  <div>
                    <span className="font-semibold text-white text-[11px] sm:text-xs">Aanya &amp; Kabir Kapoor</span>
                    <span className="text-stone-400 text-[10px] ml-1.5">Wedding · Feb 2026</span>
                  </div>
                </div>
                <div className="flex items-center gap-1 text-amber-300 text-xs">
                  <Star className="w-3.5 h-3.5 fill-amber-300" />
                  <span className="font-bold">4.99</span>
                </div>
              </div>
            </div>
          </ImageReveal>
        </div>

        {/* RIGHT COLUMN: EDITORIAL STORY, STATS GRID & BOOKING ACTION */}
        <div className="lg:col-span-5 space-y-6">
          
          <ScrollReveal animation="fade-left" delay={0.1}>
            <div className="text-[11px] uppercase font-bold tracking-[0.25em] text-champagne flex items-center gap-2">
              <span className="w-6 h-0.5 bg-champagne" />
              <span>THE HERITAGE CITADEL</span>
            </div>

            <h3 className="font-serif text-2xl sm:text-4xl text-stone-900 font-bold tracking-tight mt-2 leading-[1.2]">
              A celebration <br />
              <span className="italic font-normal text-burgundy">bathed in regal light.</span>
            </h3>

            <p className="text-xs sm:text-sm text-stone-600 font-normal leading-relaxed mt-4">
              The Rambagh Citadel dates back generations, with original hand-carved Mewari jharokhas, central fountain courtyards, and vaulted stone terraces that carry the music of live shehnai ensembles with extraordinary warmth.
            </p>
          </ScrollReveal>

          {/* LUXURY ESTATE DETAIL STATS GRID (REFERENCE-MATCHED) */}
          <ScrollReveal animation="fade-up" delay={0.2}>
            <div className="bg-[#faf6ee] rounded-2xl sm:rounded-3xl p-5 sm:p-6 border border-[#e8ded0] space-y-4">
              <div className="text-[10px] font-bold tracking-[0.2em] uppercase text-stone-500">
                Sanctuary Specifications
              </div>

              <div className="grid grid-cols-2 gap-4 pt-1 border-t border-stone-200/80">
                <div>
                  <div className="font-serif text-2xl sm:text-3xl font-bold text-burgundy">1,200</div>
                  <div className="text-[10px] uppercase font-bold text-stone-500 tracking-wider mt-0.5">Max Guests</div>
                </div>
                <div>
                  <div className="font-serif text-2xl sm:text-3xl font-bold text-burgundy">Sole</div>
                  <div className="text-[10px] uppercase font-bold text-stone-500 tracking-wider mt-0.5">Use Policy</div>
                </div>
                <div>
                  <div className="font-serif text-2xl sm:text-3xl font-bold text-burgundy">3</div>
                  <div className="text-[10px] uppercase font-bold text-stone-500 tracking-wider mt-0.5">Courtyards</div>
                </div>
                <div>
                  <div className="font-serif text-2xl sm:text-3xl font-bold text-burgundy">1842</div>
                  <div className="text-[10px] uppercase font-bold text-stone-500 tracking-wider mt-0.5">Established</div>
                </div>
              </div>

              <p className="text-[11px] text-stone-500 italic pt-2 border-t border-stone-200/60 leading-normal">
                Available on an exclusive-use basis only. Your wedding, your private citadel, your day entirely.
              </p>
            </div>
          </ScrollReveal>

          {/* PRICING & CTAS */}
          <ScrollReveal animation="fade-up" delay={0.3}>
            <div className="bg-white rounded-2xl p-5 border border-stone-200 shadow-sm space-y-3">
              <div className="flex items-baseline justify-between">
                <div>
                  <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider block">Exclusivity Rate</span>
                  <div className="flex items-baseline gap-1.5 mt-0.5">
                    <span className="font-serif font-bold text-2xl sm:text-3xl text-burgundy">₹2,80,000</span>
                    <span className="text-xs text-stone-500">/ full day</span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                    <span>25% Advance Lock</span>
                  </span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-2.5 pt-1">
                <button
                  onClick={onCheckAvailability}
                  className="flex-1 px-5 py-3 rounded-xl bg-gradient-to-r from-[#e6ca65] via-[#ffd700] to-[#c5a059] hover:brightness-105 text-stone-950 font-bold text-xs uppercase tracking-wider transition-all shadow-md active:scale-95 cursor-pointer text-center flex items-center justify-center gap-2"
                >
                  <CalendarDays className="w-4 h-4 text-stone-900" />
                  <span>Check Availability</span>
                </button>

                <button
                  onClick={onExploreVenues}
                  className="flex-1 px-4 py-3 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 font-semibold text-xs tracking-wider border border-stone-300 transition-all active:scale-95 cursor-pointer text-center flex items-center justify-center gap-1.5"
                >
                  <span>Explore Sanctuaries</span>
                  <ArrowRight className="w-3.5 h-3.5 text-burgundy" />
                </button>
              </div>
            </div>
          </ScrollReveal>

        </div>

      </div>

    </section>
  )
}
