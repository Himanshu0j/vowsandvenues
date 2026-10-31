'use client'

import React, { useEffect } from 'react'
import { AlertOctagon, RefreshCw, Home } from 'lucide-react'

export default function GlobalError({ error, reset }) {
  useEffect(() => {
    // Automatically report unhandled page/route crash to error logging API
    try {
      const payload = {
        message: error?.message || 'Application rendering failure',
        stack: error?.stack || null,
        source: 'nextjs_page_boundary',
        severity: 'critical',
        path: typeof window !== 'undefined' ? window.location.pathname : '',
        metadata: { digest: error?.digest }
      }

      fetch('/api/system/errors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        keepalive: true
      }).catch(() => {})
    } catch (_) {}
  }, [error])

  return (
    <div className="min-h-screen bg-[#141210] text-stone-100 flex items-center justify-center p-6 selection:bg-[#c5a059] selection:text-stone-950">
      <div className="max-w-xl w-full bg-[#1c1917] border border-rose-900/60 rounded-3xl p-8 shadow-2xl text-center space-y-6">
        <div className="w-16 h-16 mx-auto rounded-2xl bg-rose-950/60 text-rose-400 flex items-center justify-center border border-rose-800/80 shadow-inner">
          <AlertOctagon className="w-8 h-8" />
        </div>
        
        <div className="space-y-2">
          <span className="text-[11px] font-mono uppercase tracking-widest font-bold text-rose-400 bg-rose-950/40 px-3 py-1 rounded-full border border-rose-800/40">
            System Alert • Automatically Logged
          </span>
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-white pt-2">
            Something went wrong
          </h2>
          <p className="text-xs text-stone-400 max-w-md mx-auto leading-relaxed">
            Our autonomous error telemetry has captured this incident and reported it directly to the system engineering log.
          </p>
        </div>

        {error?.message && (
          <div className="p-3 bg-stone-950/80 rounded-xl border border-stone-800 text-left font-mono text-[11px] text-rose-300 max-h-24 overflow-y-auto no-scrollbar">
            {error.message}
          </div>
        )}

        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            onClick={() => reset()}
            className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-[#c5a059] hover:bg-[#d8b26e] text-stone-950 font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-md cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Try Again
          </button>
          <a
            href="/"
            className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 font-medium text-xs flex items-center justify-center gap-2 border border-stone-700 transition-all cursor-pointer"
          >
            <Home className="w-3.5 h-3.5" />
            Return to Marketplace
          </a>
        </div>
      </div>
    </div>
  )
}
