'use client'

import React from 'react'
import {
  Sparkles,
  MapPin,
  Phone,
  Mail,
  ShieldCheck,
  Award,
  Heart,
  CalendarDays
} from 'lucide-react'

export default function FooterSection({
  onSelectCategory,
  onSelectCity,
  cities = [],
  categories = [],
  contactInfo
}) {
  const contact = contactInfo || {
    phone: "+91 98765 43210",
    email: "concierge@vowsandvenues.in",
    hours: "Monday – Sunday, 9:00 AM – 9:00 PM IST",
    address: "DLF Cyber City, Tower B, Gurugram / Hazratganj, Lucknow"
  }

  return (
    <footer className="bg-gradient-to-b from-[#1c1917] via-[#161413] to-[#0f0e0d] text-white pt-16 pb-12 border-t border-amber-900/30 relative">
      {/* Decorative top gold hairline */}
      <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-[#c5a059] to-transparent opacity-60" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        
        {/* 1. TOP BRAND STORY & CONCIERGE CALLOUT */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pb-12 border-b border-stone-800/80">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-[#4a1525] via-[#350c18] to-[#20050d] text-[#c5a059] flex items-center justify-center border border-[#c5a059]/50 font-serif font-bold text-xl shadow-lg ring-2 ring-amber-400/20">
                V
              </div>
              <div>
                <span className="font-serif text-2xl font-bold tracking-tight text-white flex items-center gap-1.5">
                  <span>Vows &amp; Venues</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-[#c5a059]"></span>
                </span>
                <div className="text-[9px] uppercase tracking-[0.22em] text-[#c5a059] font-bold">
                  India's Premier Wedding Atelier
                </div>
              </div>
            </div>
            <p className="text-xs text-stone-400 leading-relaxed max-w-sm">
              An all-in-one unified marketplace designed to connect discerning families with India's most extraordinary venues, royal banquet feasts, artisanal decors, and celebrity stylists.
            </p>
          </div>

          <div className="space-y-3">
            <h4 className="font-serif font-bold text-base text-[#e8d08d]">
              Concierge Desk &amp; Inquiries
            </h4>
            <div className="space-y-2 text-xs text-stone-300">
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-[#c5a059]" />
                <span className="font-semibold">{contact.phone}</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-[#c5a059]" />
                <span>{contact.email}</span>
              </div>
              <div className="text-stone-400 text-[11px] pt-1">
                {contact.hours}
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="font-serif font-bold text-base text-[#e8d08d]">
              The Vows &amp; Venues Guarantee
            </h4>
            <div className="space-y-2 text-xs text-stone-400">
              <div className="flex items-start gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>100% Verified Vendor Audits with physical site checks</span>
              </div>
              <div className="flex items-start gap-2">
                <Award className="w-4 h-4 text-[#c5a059] shrink-0 mt-0.5" />
                <span>Zero Hidden Commissions &amp; Direct Price Match</span>
              </div>
              <div className="flex items-start gap-2">
                <CalendarDays className="w-4 h-4 text-[#c5a059] shrink-0 mt-0.5" />
                <span>Secure 25% Advance split booking with date hold</span>
              </div>
            </div>
          </div>
        </div>

        {/* 2. CITIES & CATEGORIES DIRECTORY */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-xs">
          <div>
            <h5 className="font-serif font-bold text-sm text-[#e8d08d] mb-3">Celebration Destinations</h5>
            <ul className="space-y-2 text-stone-400">
              {cities.filter(c => c !== 'All Cities').map(c => (
                <li key={c}>
                  <button
                    onClick={() => onSelectCity && onSelectCity(c)}
                    className="hover:text-white transition-colors cursor-pointer text-left"
                  >
                    Weddings in {c}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h5 className="font-serif font-bold text-sm text-[#e8d08d] mb-3">Service Specializations</h5>
            <ul className="space-y-2 text-stone-400">
              {categories.slice(0, 6).map(c => (
                <li key={c.slug}>
                  <button
                    onClick={() => onSelectCategory && onSelectCategory(c.slug)}
                    className="hover:text-white transition-colors cursor-pointer text-left"
                  >
                    {c.name}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h5 className="font-serif font-bold text-sm text-[#e8d08d] mb-3">More Specializations</h5>
            <ul className="space-y-2 text-stone-400">
              {categories.slice(6).map(c => (
                <li key={c.slug}>
                  <button
                    onClick={() => onSelectCategory && onSelectCategory(c.slug)}
                    className="hover:text-white transition-colors cursor-pointer text-left"
                  >
                    {c.name}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h5 className="font-serif font-bold text-sm text-[#e8d08d] mb-3">Atelier Portals</h5>
            <ul className="space-y-2 text-stone-400">
              <li><span className="hover:text-white cursor-pointer">About Our Story</span></li>
              <li><span className="hover:text-white cursor-pointer">For Vendor Partners</span></li>
              <li><span className="hover:text-white cursor-pointer">Wedding Concierge Advisory</span></li>
              <li><span className="hover:text-white cursor-pointer">Cancellation &amp; Refund Policy</span></li>
              <li><span className="hover:text-white cursor-pointer">Privacy &amp; Data Security</span></li>
              <li><span className="hover:text-white cursor-pointer">Terms of Service</span></li>
            </ul>
          </div>
        </div>

        {/* 3. COPYRIGHT BOTTOM BAR */}
        <div className="pt-8 border-t border-stone-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-stone-500">
          <div>
            © 2026 Vows &amp; Venues (vowsandvenues.in). All rights reserved. Handcrafted for Indian celebrations.
          </div>
          <div className="flex items-center gap-6">
            <span>Security Protected · 256-bit SSL</span>
            <span>Made with devotion for Indian weddings</span>
          </div>
        </div>

      </div>
    </footer>
  )
}
