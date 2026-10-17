'use client'

import React from 'react'
import Link from 'next/link'
import { Sparkles, Calendar, ShieldCheck, CreditCard, Users, ArrowRight, Building2, Phone } from 'lucide-react'
import Navbar from '@/components/Navbar'
import FooterSection from '@/components/FooterSection'
import ErrorBoundary from '@/components/ErrorBoundary'

export default function HowItWorksPage() {
  const steps = [
    {
      num: '01',
      title: 'Discover Royal Sanctuaries',
      desc: 'Browse our verified catalog of heritage palaces, luxury banquet lawns, and waterfront resorts with transparent starting prices and guest capacities.',
      icon: Building2
    },
    {
      num: '02',
      title: 'Check Live Date Availability',
      desc: 'View real-time calendar availability. Filter auspicious Shubh Muhurat dates marked OPEN with instant slot reservations.',
      icon: Calendar
    },
    {
      num: '03',
      title: 'Pay Only 5% Advance',
      desc: 'Lock your celebration slot with a token 5% advance payment via Direct UPI QR (0% fees) or Razorpay sandbox gateway.',
      icon: CreditCard
    },
    {
      num: '04',
      title: 'Balance 15 Days Before Event',
      desc: 'Pay your remaining balance securely 15 days before your wedding. All payments are held in our Escrow Trust until verified completion.',
      icon: ShieldCheck
    }
  ]

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-[#faf7f2] flex flex-col justify-between text-stone-900">
        <Navbar />

        <div className="pt-28 pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto flex-1 w-full">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 text-amber-900 text-xs font-bold uppercase tracking-wider mb-3">
              <Sparkles className="w-3.5 h-3.5 text-amber-700" /> Transparent Wedding Booking
            </span>
            <h1 className="text-3xl sm:text-5xl font-serif font-bold text-stone-900">
              How Vows & Venues Works
            </h1>
            <p className="text-stone-600 text-sm sm:text-base mt-3 font-light leading-relaxed">
              We eliminated the chaos of opaque palace negotiations, middleman broker commissions, and double-booking risks.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
            {steps.map((s, idx) => {
              const Icon = s.icon
              return (
                <div key={idx} className="bg-white rounded-2xl p-6 border border-stone-200 shadow-xs flex flex-col justify-between relative overflow-hidden group hover:shadow-lg transition-all">
                  <div className="text-4xl font-serif font-bold text-amber-600/20 absolute -top-1 right-3 select-none">
                    {s.num}
                  </div>
                  <div>
                    <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-800 flex items-center justify-center mb-5 group-hover:bg-[#4a1525] group-hover:text-amber-200 transition-colors">
                      <Icon className="w-6 h-6" />
                    </div>
                    <h3 className="font-serif font-bold text-lg text-stone-900 mb-2">{s.title}</h3>
                    <p className="text-stone-600 text-xs leading-relaxed font-light">{s.desc}</p>
                  </div>
                  <div className="mt-6 pt-4 border-t border-stone-100 text-[11px] font-semibold text-amber-800">
                    Step {s.num} of 4
                  </div>
                </div>
              )
            })}
          </div>

          {/* CTA Box */}
          <div className="bg-gradient-to-r from-[#4a1525] to-[#2a0b14] rounded-3xl p-8 sm:p-12 text-white shadow-xl text-center max-w-4xl mx-auto">
            <h2 className="text-2xl sm:text-3xl font-serif font-bold text-amber-50 mb-3">
              Ready to Book Your Royal Wedding Venue?
            </h2>
            <p className="text-stone-300 text-xs sm:text-sm max-w-xl mx-auto mb-6 font-light">
              Explore 40+ palaces and banquets across Lucknow, Varanasi, Jaipur, and Udaipur with instant availability checks.
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <Link
                href="/venues"
                className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-stone-950 font-bold text-xs sm:text-sm px-6 py-3 rounded-xl shadow-lg transition-all"
              >
                Browse All Venues
              </Link>
              <Link
                href="/dashboard"
                className="bg-white/10 hover:bg-white/20 text-white font-semibold text-xs sm:text-sm px-6 py-3 rounded-xl border border-white/20 transition-all"
              >
                View My Dashboard
              </Link>
            </div>
          </div>
        </div>

        <FooterSection />
      </div>
    </ErrorBoundary>
  )
}
