'use client'

import React from 'react'
import Link from 'next/link'
import { Check, Sparkles, ShieldCheck, CreditCard, ArrowRight, Building2, HelpCircle } from 'lucide-react'
import Navbar from '@/components/Navbar'
import FooterSection from '@/components/FooterSection'
import ErrorBoundary from '@/components/ErrorBoundary'

export default function PricingPage() {
  const tiers = [
    {
      name: 'Intimate Banquet & Lawns',
      guestRange: 'Up to 250 Guests',
      price: '₹75,000 - ₹2,50,000',
      period: 'per celebration',
      desc: 'Ideal for Roka, Sangeet, Mehendi, and boutique wedding soirees with full air-conditioned banquet halls.',
      features: [
        'Full AC Banquet + Dining Lawn',
        'Bridal Preparation Suites (2)',
        'DJ & Two-Track Sound System',
        'Standard Mandap & Stage Decor',
        '5% Token Advance Booking',
        'Escrow Protection Guarantee'
      ],
      popular: false
    },
    {
      name: 'Heritage Palace & Grand Lawns',
      guestRange: '300 to 800 Guests',
      price: '₹3,50,000 - ₹12,00,000',
      period: 'per celebration',
      desc: 'Our most popular tier. Grand royal courtyards, heritage suites, manicured lawns, and full day exclusivity.',
      features: [
        'Full Day Exclusivity (7 AM - 7 AM)',
        'Sprawling Grand Wedding Lawn',
        '8+ Deluxe Rooms for Baratis',
        'Royal Mandap + Fairy Light Canopy',
        'Valet Parking for 200+ Cars',
        'Direct 1-to-1 Venue Recce Meeting',
        '5% Token Advance Booking'
      ],
      popular: true
    },
    {
      name: 'Maharaja Destination Citadel',
      guestRange: '800 to 2,000+ Guests',
      price: '₹15,00,000+',
      period: 'per event slot',
      desc: 'Lakeside palaces, royal citadels, and historic forts in Udaipur, Jaipur, and Varanasi for mega luxury weddings.',
      features: [
        'Multi-Day Royal Palace Access',
        '25+ Luxury Heritage Suites',
        'Live Shehnai & Folk Artist Welcome',
        'Multi-Cuisine Royal Feasts',
        'Dedicated Vows & Venues Concierge',
        'Private Escrow Milestone Releases'
      ],
      popular: false
    }
  ]

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-[#faf7f2] flex flex-col justify-between text-stone-900">
        <Navbar />

        <div className="pt-28 pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto flex-1 w-full">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 text-amber-900 text-xs font-bold uppercase tracking-wider mb-3">
              <Sparkles className="w-3.5 h-3.5 text-amber-700" /> Transparent Pricing
            </span>
            <h1 className="text-3xl sm:text-5xl font-serif font-bold text-stone-900">
              Clear, Upfront Palace Pricing
            </h1>
            <p className="text-stone-600 text-sm sm:text-base mt-3 font-light leading-relaxed">
              No hidden broker fees or inflated commissions. Lock your dates with only 5% token advance and pay the rest 15 days before the event.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-16">
            {tiers.map((t, idx) => (
              <div
                key={idx}
                className={`rounded-3xl p-8 bg-white border flex flex-col justify-between relative shadow-sm hover:shadow-xl transition-all ${
                  t.popular ? 'border-amber-600 ring-2 ring-amber-500/30 -translate-y-1' : 'border-stone-200'
                }`}
              >
                {t.popular && (
                  <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-amber-600 text-white text-[11px] font-bold px-3 py-1 rounded-full uppercase tracking-wider shadow-sm">
                    Most Popular Choice
                  </span>
                )}
                <div>
                  <h3 className="font-serif font-bold text-xl text-stone-900 mb-1">{t.name}</h3>
                  <div className="text-xs text-amber-800 font-semibold mb-3">{t.guestRange}</div>
                  <p className="text-xs text-stone-600 leading-relaxed font-light mb-6">{t.desc}</p>

                  <div className="mb-6 pb-6 border-b border-stone-100">
                    <div className="text-2xl sm:text-3xl font-serif font-bold text-[#4a1525]">{t.price}</div>
                    <div className="text-xs text-stone-500">{t.period}</div>
                  </div>

                  <div className="space-y-3 mb-8">
                    <span className="text-xs font-semibold text-stone-900 block">Package Inclusions:</span>
                    {t.features.map((f, i) => (
                      <div key={i} className="flex items-center gap-2.5 text-xs text-stone-700">
                        <div className="w-4 h-4 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0">
                          <Check className="w-2.5 h-2.5 stroke-[3]" />
                        </div>
                        <span>{f}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <Link
                  href="/venues"
                  className={`w-full py-3 px-4 rounded-xl text-xs font-bold text-center transition-all ${
                    t.popular
                      ? 'bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-white shadow-md'
                      : 'bg-stone-100 hover:bg-stone-200 text-stone-800'
                  }`}
                >
                  Explore Matching Venues
                </Link>
              </div>
            ))}
          </div>

          {/* Pricing FAQ Section */}
          <div className="bg-white rounded-2xl border border-stone-200 p-8 max-w-3xl mx-auto shadow-xs">
            <h3 className="font-serif font-bold text-xl text-stone-900 mb-4 pb-3 border-b border-stone-100">
              Frequently Asked Financial Questions
            </h3>
            <div className="space-y-4 text-xs">
              <div>
                <h4 className="font-semibold text-stone-900 mb-1">How much advance do I have to pay?</h4>
                <p className="text-stone-600 font-light leading-relaxed">
                  Only 5% of the estimated total is required at the time of online slot reservation. The remaining 95% is due 15 days before your celebration.
                </p>
              </div>
              <div>
                <h4 className="font-semibold text-stone-900 mb-1">Are there any payment gateway charges?</h4>
                <p className="text-stone-600 font-light leading-relaxed">
                  We support 0% fee Direct UPI QR scanning. If you choose credit card or net banking via Razorpay, standard banking gateway interchange fees apply.
                </p>
              </div>
              <div>
                <h4 className="font-semibold text-stone-900 mb-1">Can I schedule a physical inspection before paying?</h4>
                <p className="text-stone-600 font-light leading-relaxed">
                  Yes! Click "Request a meeting" on any venue page to book a 1-to-1 video consultation or an on-site palace inspection with the estate coordinator.
                </p>
              </div>
            </div>
          </div>
        </div>

        <FooterSection />
      </div>
    </ErrorBoundary>
  )
}
