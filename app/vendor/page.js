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
      <header className="sticky top-0 z-40 bg-[#1c1917] text-white border-b border-stone-800 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 text-stone-950 flex items-center justify-center font-serif text-lg font-bold shadow">
              V
            </div>
            <div>
              <span className="font-serif text-base font-bold tracking-tight">Vows &amp; Venues</span>
              <span className="block text-[10px] text-amber-400 font-mono uppercase tracking-widest font-semibold">
                Vendor Partner Portal
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="text-xs text-stone-300 hover:text-white px-3 py-1.5 rounded-lg hover:bg-stone-800 transition-colors flex items-center gap-1.5 font-medium"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Marketplace</span>
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
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
