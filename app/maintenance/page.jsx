'use client'

import React, { useState } from 'react'
import { Wrench, Sparkles, Clock, ShieldCheck, RefreshCw, Mail } from 'lucide-react'

export default function MaintenancePage() {
  const [reloading, setReloading] = useState(false)

  const handleReload = () => {
    setReloading(true)
    setTimeout(() => {
      window.location.reload()
    }, 600)
  }

  return (
    <div className="min-h-screen bg-[#0f0e0d] text-stone-100 flex flex-col justify-between selection:bg-amber-700 selection:text-amber-100 relative overflow-hidden font-sans">
      {/* Ambient Royal Gold Glow Background */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-tr from-amber-600/10 via-amber-500/5 to-transparent rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-amber-700/10 rounded-full blur-3xl pointer-events-none" />

      {/* Top Header */}
      <header className="relative z-10 w-full max-w-6xl mx-auto px-6 py-8 flex items-center justify-between border-b border-stone-800/60">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 via-amber-600 to-amber-800 flex items-center justify-center text-stone-950 font-serif font-black text-xl shadow-lg shadow-amber-900/30">
            V
          </div>
          <div>
            <h1 className="font-serif font-bold text-lg tracking-wide text-stone-100">
              Vows &amp; Venues
            </h1>
            <p className="text-[10px] tracking-widest uppercase text-amber-400/80 font-medium">
              Luxury Indian Event Marketplace
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-stone-900/80 border border-stone-800 text-stone-400 text-xs">
          <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
          <span>System Maintenance</span>
        </div>
      </header>

      {/* Main Content Card */}
      <main className="relative z-10 max-w-3xl mx-auto px-6 py-12 sm:py-16 text-center my-auto">
        {/* Status Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs font-semibold tracking-wide uppercase mb-6 shadow-sm">
          <Wrench className="w-3.5 h-3.5 text-amber-400" />
          <span>Scheduled Platform Maintenance</span>
        </div>

        {/* Headline */}
        <h2 className="font-serif text-3xl sm:text-5xl font-bold tracking-tight text-white mb-6 leading-tight">
          Website is Currently <br className="hidden sm:inline" />
          <span className="bg-gradient-to-r from-amber-200 via-amber-400 to-amber-600 bg-clip-text text-transparent">
            Under Maintenance
          </span>
        </h2>

        {/* Narrative Description */}
        <p className="text-stone-400 text-sm sm:text-base leading-relaxed max-w-2xl mx-auto mb-10">
          We are currently carrying out scheduled system optimizations and performance upgrades 
          to ensure our luxury venue matchmaking and celebration concierge services remain world-class.
          Our services will be restored shortly.
        </p>

        {/* Operational Highlights Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-left max-w-2xl mx-auto mb-10">
          <div className="p-4 rounded-2xl bg-stone-900/60 border border-stone-800/80 backdrop-blur-sm">
            <div className="flex items-center gap-2 text-amber-400 mb-2">
              <Clock className="w-4 h-4" />
              <span className="text-xs font-bold uppercase tracking-wider text-stone-300">Estimated Time</span>
            </div>
            <p className="text-xs text-stone-400 leading-normal">
              Routine updates are actively in progress. Service will resume shortly.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-stone-900/60 border border-stone-800/80 backdrop-blur-sm">
            <div className="flex items-center gap-2 text-emerald-400 mb-2">
              <ShieldCheck className="w-4 h-4" />
              <span className="text-xs font-bold uppercase tracking-wider text-stone-300">Data Integrity</span>
            </div>
            <p className="text-xs text-stone-400 leading-normal">
              All client bookings, venue profiles, and guest records are 100% secure.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-stone-900/60 border border-stone-800/80 backdrop-blur-sm">
            <div className="flex items-center gap-2 text-amber-400 mb-2">
              <Sparkles className="w-4 h-4" />
              <span className="text-xs font-bold uppercase tracking-wider text-stone-300">Enhancements</span>
            </div>
            <p className="text-xs text-stone-400 leading-normal">
              Upgrading speed, real-time concierge chat, and booking workflows.
            </p>
          </div>
        </div>

        {/* Actions & Contact */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <button
            onClick={handleReload}
            disabled={reloading}
            className="w-full sm:w-auto px-6 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-700 hover:from-amber-600 hover:to-amber-800 text-stone-950 font-bold text-xs uppercase tracking-wider shadow-lg shadow-amber-900/30 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
          >
            <RefreshCw className={`w-4 h-4 ${reloading ? 'animate-spin' : ''}`} />
            <span>{reloading ? 'Checking Status...' : 'Check Status / Refresh'}</span>
          </button>

          <a
            href="mailto:support@vowsandvenues.in"
            className="w-full sm:w-auto px-6 py-3 rounded-xl bg-stone-900 hover:bg-stone-800 text-stone-300 border border-stone-800 font-semibold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <Mail className="w-4 h-4 text-amber-400" />
            <span>Contact Support Desk</span>
          </a>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 w-full max-w-6xl mx-auto px-6 py-6 border-t border-stone-800/60 flex flex-col sm:flex-row items-center justify-between gap-3 text-stone-500 text-xs">
        <div>
          &copy; {new Date().getFullYear()} Vows &amp; Venues Technologies Pvt. Ltd. All rights reserved.
        </div>
        <div className="flex items-center gap-4 text-stone-400">
          <span>Escrow Protected</span>
          <span>&bull;</span>
          <span>Verified Concierge</span>
          <span>&bull;</span>
          <span>Status: 503 Maintenance</span>
        </div>
      </footer>
    </div>
  )
}
