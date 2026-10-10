'use client'

import React, { useState } from 'react'
import { Sparkles, Tag, ArrowRight, Check, Copy } from 'lucide-react'
import { toast } from 'sonner'

export default function CuratedOffers({ offers = [], onSelectOffer }) {
  const [copiedCode, setCopiedCode] = useState(null)

  const handleCopy = (code) => {
    navigator.clipboard?.writeText(code)
    setCopiedCode(code)
    toast.success(`Promo code "${code}" copied to clipboard!`)
    setTimeout(() => setCopiedCode(null), 3000)
  }

  if (!offers || offers.length === 0) return null

  return (
    <section className="py-14 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto select-none">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-3">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#00ff88]/10 border border-[#00ff88]/40 text-[#00ff88] text-xs font-black tracking-widest uppercase mb-2 shadow-[0_0_12px_rgba(0,255,136,0.3)]">
            <Sparkles className="w-3.5 h-3.5 text-[#00ff88]" />
            <span>Exclusive Privileges</span>
          </div>
          <h2 className="font-serif text-2xl sm:text-3xl md:text-4xl font-black text-white tracking-tight flex items-center gap-2">
            <span>Seasonal Celebration Offers</span>
            <span className="text-[#00ff88]">✦</span>
          </h2>
        </div>
        <p className="text-xs sm:text-sm text-stone-300 max-w-md mt-2 sm:mt-0 font-light leading-relaxed">
          Direct platform incentives for multi-vendor bookings, royal catering, and 4K cinematography.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {offers.map((offer, idx) => {
          return (
            <div
              key={offer.id || offer.code}
              className="bg-[#091510] rounded-3xl p-6 border-2 border-[#00ff88]/30 hover:border-[#00ff88] shadow-[0_10px_35px_rgba(0,0,0,0.8)] hover:shadow-[0_15px_45px_rgba(0,255,136,0.3)] transition-all duration-500 hover:-translate-y-2 flex flex-col justify-between relative overflow-hidden group card-3d-hover"
            >
              {/* Top Neon Green Accent Line */}
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-transparent via-[#00ff88] to-transparent opacity-80 group-hover:opacity-100 transition-opacity" />

              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-[#00ff88]/20 text-[#00ff88] border border-[#00ff88]/50 shadow-[0_0_10px_rgba(0,255,136,0.3)] flex items-center gap-1.5">
                    <Sparkles className="w-3 h-3 text-[#00ff88]" />
                    {offer.badge || "Signature Privilege"}
                  </span>
                  <span className="font-serif font-black text-xl text-[#00ff88] drop-shadow-[0_0_10px_rgba(0,255,136,0.8)]">
                    {offer.discount}
                  </span>
                </div>

                <h3 className="font-serif font-bold text-lg text-white mb-2 group-hover:text-[#00ff88] transition-colors">
                  {offer.title}
                </h3>
                <p className="text-xs text-stone-300 leading-relaxed mb-6 font-light">
                  {offer.desc || offer.description}
                </p>
              </div>

              <div className="pt-4 border-t border-[#00ff88]/20 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-black text-white bg-[#0e2219] px-3 py-1.5 rounded-xl border border-[#00ff88]/40 shadow-xs flex items-center gap-1.5">
                    <Tag className="w-3.5 h-3.5 text-[#00ff88]" />
                    {offer.code}
                  </span>
                  <button
                    onClick={() => handleCopy(offer.code)}
                    title="Copy code"
                    className="p-1.5 rounded-xl bg-[#0e2219] hover:bg-[#00ff88]/20 text-[#00ff88] transition-all shadow-sm active:scale-90 border border-[#00ff88]/30 cursor-pointer"
                  >
                    {copiedCode === offer.code ? <Check className="w-3.5 h-3.5 text-white" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>

                <button
                  onClick={() => onSelectOffer && onSelectOffer(offer)}
                  className="btn-neon-green px-4 py-2 rounded-xl text-xs font-black flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer shadow-[0_0_15px_rgba(0,255,136,0.5)]"
                >
                  <span>Apply Code</span>
                  <ArrowRight className="w-3.5 h-3.5 stroke-[3]" />
                </button>
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}
