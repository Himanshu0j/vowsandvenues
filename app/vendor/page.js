'use client'

import React from 'react'
import Link from 'next/link'
import { Building2, ExternalLink, Sparkles, ArrowLeft } from 'lucide-react'
import VendorPartnerSuite from '@/components/vendor/VendorPartnerSuite'
import ErrorBoundary from '@/components/ErrorBoundary'

export default function StandaloneVendorPortalPage() {
  return (
    <div className="min-h-screen bg-[#fcf8f2] text-stone-900">
      {/* Top Navigation */}
      <header className="sticky top-0 z-40 bg-[#1c1917] text-white border-b border-stone-800 shadow-md overflow-hidden">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-2 overflow-hidden">
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 text-stone-950 flex items-center justify-center font-serif text-base sm:text-lg font-bold shadow shrink-0">
              V
            </div>
            <div className="min-w-0">
              <span className="font-serif text-sm sm:text-base font-bold tracking-tight block truncate">Vows &amp; Venues</span>
              <span className="block text-[9px] sm:text-[10px] text-amber-400 font-mono uppercase tracking-widest font-semibold truncate">
                Vendor Partner Portal
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Link
              href="/"
              className="text-xs text-stone-300 hover:text-white px-2.5 sm:px-3 py-1.5 rounded-lg hover:bg-stone-800 transition-colors flex items-center gap-1 font-medium whitespace-nowrap"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Back to Marketplace</span>
              <span className="sm:hidden text-[11px]">Marketplace</span>
            </Link>

            <Link
              href="/admin"
              className="hidden sm:flex text-xs text-amber-300 hover:text-amber-200 px-3 py-1.5 rounded-lg bg-stone-900 border border-stone-800 transition-colors items-center gap-1 font-semibold"
            >
              <span>Admin Console</span>
              <ExternalLink className="w-3 h-3" />
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-6 sm:py-8 overflow-x-hidden">
        <ErrorBoundary fallbackTitle="Vendor Partner Suite">
          <VendorPartnerSuite />
        </ErrorBoundary>
      </main>

      {/* Footer */}
      <footer className="border-t border-stone-200 py-6 text-center text-xs text-stone-500 bg-white mt-12">
        Vows &amp; Venues Partner Ecosystem • Verified Luxury Event Vendors &amp; Heritage Estates
      </footer>
    </div>
  )
}
