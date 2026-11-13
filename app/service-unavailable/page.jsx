'use client'

import React, { useState } from 'react'
import { ServerCrash, RefreshCw, Mail, ShieldCheck } from 'lucide-react'

export default function ServiceUnavailablePage() {
  const [checking, setChecking] = useState(false)

  const handleRefresh = () => {
    setChecking(true)
    setTimeout(() => {
      window.location.reload()
    }, 700)
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 sm:p-6 bg-[#0f0e0d] text-stone-100 font-sans selection:bg-amber-800 selection:text-amber-100 relative overflow-hidden">
      {/* Subtle Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-amber-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 w-full max-w-lg bg-stone-900/90 border border-stone-800 p-8 sm:p-12 rounded-3xl text-center shadow-2xl backdrop-blur-md">
        {/* Monogram / Icon */}
        <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-amber-500/20 to-amber-700/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
          <ServerCrash className="w-8 h-8" />
        </div>

        {/* Status Code Pill */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-stone-800 border border-stone-700/80 text-amber-400 text-xs font-semibold uppercase tracking-wider mb-4">
          <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
          <span>HTTP 503 &bull; Service Unavailable</span>
        </div>

        {/* Main Title */}
        <h1 className="font-serif text-2xl sm:text-3xl font-bold text-white mb-3 tracking-tight">
          Service Temporarily Unavailable
        </h1>

        {/* Description */}
        <p className="text-stone-400 text-sm leading-relaxed mb-6">
          The service is temporarily unavailable due to scheduled server maintenance or capacity updates. 
          Our engineering team is actively working to restore standard operations as quickly as possible.
        </p>

        {/* Reassurance Box */}
        <div className="p-4 rounded-xl bg-stone-950/60 border border-stone-800/80 text-left text-xs text-stone-400 space-y-1.5 mb-8">
          <div className="flex items-center gap-2 text-stone-300 font-semibold">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Platform Status &amp; Integrity</span>
          </div>
          <p className="pl-6 text-[11px] text-stone-500 leading-normal">
            All user data, event records, and scheduled bookings remain fully secure. Please try reloading in a few minutes.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            onClick={handleRefresh}
            disabled={checking}
            className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-white font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-lg shadow-amber-950/40 cursor-pointer disabled:opacity-60"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${checking ? 'animate-spin' : ''}`} />
            <span>{checking ? 'Checking Status...' : 'Try Again'}</span>
          </button>

          <a
            href="mailto:support@vowsandvenues.in"
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-stone-800 hover:bg-stone-700/80 text-stone-300 text-xs font-semibold transition-all flex items-center justify-center gap-2 border border-stone-700 cursor-pointer"
          >
            <Mail className="w-3.5 h-3.5 text-stone-400" />
            <span>Contact Support</span>
          </a>
        </div>

        {/* Subtle Footer Note */}
        <div className="mt-8 pt-6 border-t border-stone-800/60 text-[11px] text-stone-500">
          Vows &amp; Venues Infrastructure Operations &bull; Reference: 503-MAINT
        </div>
      </div>
    </div>
  )
}
