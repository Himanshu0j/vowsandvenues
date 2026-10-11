'use client'

import React from 'react'
import {
  ShieldCheck,
  Lock,
  CalendarOff,
  MessageSquare,
  Sparkles,
  Crown,
  FileCheck2,
  RefreshCw,
  PhoneCall
} from 'lucide-react'
import ScrollReveal, { TextLineReveal, ScrollStaggerContainer, ScrollStaggerItem } from './ScrollReveal'

export default function TrustAndConfidenceSection() {
  const PILLARS = [
    {
      icon: ShieldCheck,
      badge: 'Physical Inspection & Licenses',
      title: '100% Verified Partners',
      description: 'Every palace, caterer, and cinematographer is verified in-person with valid GST, FSSAI catering certifications, and verified customer benchmarks.'
    },
    {
      icon: Lock,
      badge: 'Protected Milestone Escrow',
      title: '25% Advance Lock & Safe Split',
      description: 'Reserve dates with a 25% advance. Remaining funds stay protected in our milestone system, released to vendors only upon documented event delivery.'
    },
    {
      icon: CalendarOff,
      badge: 'Zero Double-Booking Guarantee',
      title: 'Real-Time Date Collision Shield',
      description: 'Our proprietary multi-vendor calendar locks dates across palace teams and crews instantaneously, preventing conflicting dates and vendor ghosting.'
    },
    {
      icon: MessageSquare,
      badge: 'Dedicated Royal Desk',
      title: '24/7 Concierge & Price Negotiation',
      description: 'Need customized multi-vendor rates? Our live concierge desk coordinates direct counter-offers and bespoke discounts with vendors in real time.'
    }
  ]

  const POLICIES = [
    { label: 'Booking Confirmation', value: 'Instant via OTP & Email voucher with legal contract' },
    { label: 'Vendor Cancellation Protection', value: '100% Full Refund + Immediate Verified Replacement' },
    { label: 'Customer Rescheduling', value: 'Free date shift up to 30 days prior to celebration' },
    { label: 'Payment Methods', value: 'UPI, Net Banking, Credit/Debit Cards & Wire Transfers' }
  ]

  return (
    <section className="py-16 sm:py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto select-none border-t border-[#e8dfcf]">
      {/* HEADER */}
      <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
        <ScrollReveal animation="fade-down" delay={0.05}>
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-champagne/15 border border-champagne/40 text-burgundy text-[11px] font-bold tracking-[0.2em] uppercase mb-3 shadow-2xs">
            <Crown className="w-3.5 h-3.5 text-champagne" />
            <span>Platform Standards &amp; Client Protection</span>
          </div>
        </ScrollReveal>

        <TextLineReveal
          lines={[
            'Celebration Confidence',
            '& Guarantees.'
          ]}
          className="font-serif text-3xl sm:text-4xl md:text-5xl font-bold text-espresso tracking-tight"
          lineClassName="first:text-stone-900 last:italic last:font-normal last:text-burgundy"
          stagger={0.12}
        />

        <ScrollReveal animation="fade-up" delay={0.2}>
          <p className="text-xs sm:text-sm md:text-base text-stone-600 mt-3 font-normal leading-relaxed">
            Planning an Indian wedding involves family pride and substantial investment. We ensure institutional transparency and total peace of mind at every milestone.
          </p>
        </ScrollReveal>
      </div>

      {/* 4 EDITORIAL PILLARS WITH SCROLL STAGGER */}
      <ScrollStaggerContainer staggerDelay={0.09} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-12">
        {PILLARS.map((p, idx) => {
          const Icon = p.icon
          return (
            <ScrollStaggerItem key={idx} yOffset={25}>
              <div
                className="p-6 rounded-3xl bg-gradient-to-b from-[#fffefc] via-[#faf6ee] to-[#f4ebe1] border border-[#e2d5c3] hover:border-champagne shadow-sm hover:shadow-xl transition-all duration-400 flex flex-col justify-between group hover:-translate-y-1 relative overflow-hidden h-full"
              >
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-burgundy via-champagne to-burgundy opacity-0 group-hover:opacity-100 transition-opacity" />

                <div>
                  <div className="w-12 h-12 rounded-2xl bg-burgundy/10 text-burgundy border border-burgundy/20 flex items-center justify-center mb-4 group-hover:bg-burgundy group-hover:text-amber-200 transition-colors shadow-xs">
                    <Icon className="w-6 h-6" />
                  </div>

                  <span className="text-[10px] font-bold uppercase tracking-wider text-burgundy block mb-1">
                    {p.badge}
                  </span>

                  <h3 className="font-serif font-bold text-lg text-espresso mb-2.5">
                    {p.title}
                  </h3>

                  <p className="text-xs text-stone-600 leading-relaxed font-normal">
                    {p.description}
                  </p>
                </div>
              </div>
            </ScrollStaggerItem>
          )
        })}
      </ScrollStaggerContainer>

      {/* OPERATIONAL POLICIES STRIP */}
      <ScrollReveal animation="zoom-in" duration={0.85}>
        <div className="bg-espresso text-white rounded-3xl p-6 sm:p-10 border-2 border-champagne/60 shadow-2xl relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-espresso via-espresso/90 to-[#3A2E2C]" />
          <div className="absolute top-0 right-0 w-96 h-96 bg-champagne/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 divide-y sm:divide-y-0 sm:divide-x divide-white/10">
            {POLICIES.map((pol, i) => (
              <div key={i} className={`pt-4 sm:pt-0 ${i !== 0 ? 'sm:pl-6' : ''}`}>
                <div className="text-[11px] uppercase font-bold text-champagne tracking-wider mb-1 flex items-center gap-1.5">
                  <FileCheck2 className="w-3.5 h-3.5 text-champagne" />
                  <span>{pol.label}</span>
                </div>
                <div className="text-xs sm:text-sm text-stone-200 font-light leading-relaxed">
                  {pol.value}
                </div>
              </div>
            ))}
          </div>
        </div>
      </ScrollReveal>
    </section>
  )
}
