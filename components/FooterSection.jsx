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
  CalendarDays,
  ArrowUp
} from 'lucide-react'
import { RoyalElephantMascot } from './CartoonMascots'

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

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <footer className="bg-[#030605] text-white pt-16 pb-12 border-t border-[#00ff88]/30 relative select-none">
      {/* Decorative top Neon Green hairline */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#00ff88] to-transparent opacity-80 animate-pulse" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        
        {/* 1. TOP BRAND STORY & CONCIERGE CALLOUT */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pb-12 border-b border-[#00ff88]/20">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-[#0c2217] via-[#081710] to-[#040b07] text-[#00ff88] flex items-center justify-center border-2 border-[#00ff88]/60 font-serif font-black text-xl shadow-[0_0_15px_rgba(0,255,136,0.4)]">
                V
              </div>
              <div>
                <span className="font-serif text-2xl font-black tracking-tight text-white flex items-center gap-1.5">
                  <span>Vows &amp; Venues</span>
                  <span className="w-2 h-2 rounded-full bg-[#00ff88] shadow-[0_0_8px_#00ff88]"></span>
                </span>
                <div className="text-[9px] uppercase tracking-[0.25em] text-[#00ff88] font-black">
                  India's Premier Royal Wedding Atelier
                </div>
              </div>
            </div>
            <p className="text-xs text-stone-300 leading-relaxed max-w-sm font-light">
              An all-in-one unified marketplace designed to connect discerning families with India's most extraordinary heritage venues, royal Awadhi banquets, floral mandaps, and celebrity stylists.
            </p>

            <div className="pt-2">
              <RoyalElephantMascot scale={0.9} />
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="font-serif font-bold text-base text-[#00ff88] flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#00ff88]" />
              <span>Royal Concierge &amp; Desk</span>
            </h4>
            <div className="space-y-2.5 text-xs text-stone-300">
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-[#00ff88]" />
                <span className="font-bold text-white">{contact.phone}</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-[#00ff88]" />
                <span>{contact.email}</span>
              </div>
              <div className="text-stone-400 text-[11px] pt-1 leading-relaxed">
                {contact.hours}<br />
                {contact.address}
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="font-serif font-bold text-base text-[#00ff88] flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[#00ff88]" />
              <span>The Vows &amp; Venues Guarantee</span>
            </h4>
            <div className="space-y-2 text-xs text-stone-300 font-light">
              <div className="flex items-start gap-2">
                <ShieldCheck className="w-4 h-4 text-[#00ff88] shrink-0 mt-0.5" />
                <span>100% Verified Vendor Audits with physical venue inspections</span>
              </div>
              <div className="flex items-start gap-2">
                <Award className="w-4 h-4 text-[#00ff88] shrink-0 mt-0.5" />
                <span>Zero Double-Booking Shield with instant date lock</span>
              </div>
              <div className="flex items-start gap-2">
                <CalendarDays className="w-4 h-4 text-[#00ff88] shrink-0 mt-0.5" />
                <span>Transparent 25% Advance split booking across all services</span>
              </div>
            </div>
          </div>
        </div>

        {/* 2. CITIES & CATEGORIES DIRECTORY */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-xs">
          <div>
            <h5 className="font-serif font-bold text-sm text-[#00ff88] mb-3">Celebration Destinations</h5>
            <ul className="space-y-2 text-stone-300">
              {cities.filter(c => c !== 'All Cities').map(c => (
                <li key={c}>
                  <button
                    onClick={() => onSelectCity && onSelectCity(c)}
                    className="hover:text-[#00ff88] transition-colors cursor-pointer text-left"
                  >
                    Weddings in {c}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h5 className="font-serif font-bold text-sm text-[#00ff88] mb-3">Top Services</h5>
            <ul className="space-y-2 text-stone-300">
              {categories.slice(0, 6).map(cat => (
                <li key={cat.slug}>
                  <button
                    onClick={() => onSelectCategory && onSelectCategory(cat.slug)}
                    className="hover:text-[#00ff88] transition-colors cursor-pointer text-left capitalize"
                  >
                    {cat.name}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h5 className="font-serif font-bold text-sm text-[#00ff88] mb-3">More Specializations</h5>
            <ul className="space-y-2 text-stone-300">
              {categories.slice(6, 11).map(cat => (
                <li key={cat.slug}>
                  <button
                    onClick={() => onSelectCategory && onSelectCategory(cat.slug)}
                    className="hover:text-[#00ff88] transition-colors cursor-pointer text-left capitalize"
                  >
                    {cat.name}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-3">
            <h5 className="font-serif font-bold text-sm text-[#00ff88] mb-3">Platform Governance</h5>
            <div className="text-xs text-stone-300 space-y-2">
              <a href="/admin" className="block text-[#00ff88] hover:underline font-bold">
                Admin Management Portal &rarr;
              </a>
              <a href="/vendor" className="block text-stone-300 hover:text-[#00ff88]">
                Vendor Partner Login &rarr;
              </a>
              <a href="/api/health" className="block text-stone-400 hover:text-stone-200">
                System Diagnostics &amp; Health &rarr;
              </a>
              <a href="/sitemap.xml" className="block text-stone-400 hover:text-stone-200">
                Dynamic XML Sitemap &rarr;
              </a>
            </div>
          </div>
        </div>

        {/* 3. BOTTOM COPYRIGHT & BACK TO TOP */}
        <div className="pt-8 border-t border-[#00ff88]/20 flex flex-col sm:flex-row items-center justify-between text-xs text-stone-400 gap-4">
          <div className="flex items-center gap-2">
            <span>&copy; {new Date().getFullYear()} Vows &amp; Venues Technologies Pvt. Ltd.</span>
            <span className="text-stone-600">•</span>
            <span className="text-[#00ff88] font-bold">Crafted for Luxury Indian Celebrations</span>
          </div>

          <button
            onClick={scrollToTop}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#091510] border border-[#00ff88]/40 text-[#00ff88] hover:border-[#00ff88] hover:bg-[#00ff88]/10 transition-all cursor-pointer shadow-xs active:scale-95"
          >
            <span>Back to Top</span>
            <ArrowUp className="w-3.5 h-3.5" />
          </button>
        </div>

      </div>
    </footer>
  )
}
