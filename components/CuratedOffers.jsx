'use client'

import React from 'react'
import { Sparkles, Tag, ArrowRight, Check, Copy } from 'lucide-react'
import { toast } from 'sonner'

export default function CuratedOffers({ offers = [], onSelectOffer }) {
  const [copiedCode, setCopiedCode] = React.useState(null)

  const handleCopy = (code) => {
    navigator.clipboard?.writeText(code)
    setCopiedCode(code)
    toast.success(`Promo code "${code}" copied to clipboard!`)
    setTimeout(() => setCopiedCode(null), 3000)
  }

  if (!offers || offers.length === 0) return null

  return (
    <section className="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8">
        <div>
          <div className="text-[11px] uppercase font-bold tracking-[0.2em] text-[#4a1525] mb-1">
            Exclusive Privileges
          </div>
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#1c1917]">
            Seasonal Celebration Offers
          </h2>
        </div>
        <p className="text-xs text-stone-600 max-w-md mt-2 sm:mt-0">
          Handcrafted incentives for multi-vendor booking, cinematography, and couture bridal styling.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {offers.map((offer, idx) => {
          return (
            <div
              key={offer.id || offer.code}
              className="bg-gradient-to-br from-[#fffdfa] via-[#faf6ee] to-[#f4ebe1] rounded-2xl p-6 border border-[#e2d5c3] hover:border-[#c5a059] shadow-sm hover:shadow-xl transition-all duration-400 flex flex-col justify-between relative overflow-hidden group hover:-translate-y-1"
            >
              {/* Top gold accent line with shimmer */}
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#4a1525] via-[#c5a059] to-[#4a1525]" />

              {/* Royal watermark crest in corner */}
              <div className="absolute -bottom-4 -right-4 text-[#c5a059]/10 text-7xl font-serif pointer-events-none select-none">
                ⚜
              </div>

              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#4a1525] text-amber-200 border border-amber-400/40 shadow-xs flex items-center gap-1.5">
                    <Sparkles className="w-3 h-3 text-amber-300" />
                    {offer.badge || "Signature Privilege"}
                  </span>
                  <span className="font-serif font-bold text-xl text-[#4a1525] tracking-tight">
                    {offer.discount}
                  </span>
                </div>

                <h3 className="font-serif font-bold text-lg text-[#1c1917] mb-2 group-hover:text-[#4a1525] transition-colors">
                  {offer.title}
                </h3>
                <p className="text-xs text-stone-600 leading-relaxed mb-6 font-normal">
                  {offer.desc || offer.description}
                </p>
              </div>

              {/* Perforated voucher cut-line */}
              <div className="pt-4 border-t border-dashed border-[#c5a059]/40 flex items-center justify-between relative">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold text-stone-900 bg-amber-50/90 px-3 py-1.5 rounded-lg border border-amber-300/80 shadow-xs flex items-center gap-1.5">
                    <Tag className="w-3 h-3 text-[#c5a059]" />
                    {offer.code}
                  </span>
                  <button
                    onClick={() => handleCopy(offer.code)}
                    title="Copy code"
                    className="p-1.5 rounded-lg bg-white hover:bg-amber-100 text-stone-600 hover:text-[#4a1525] border border-stone-200 transition-colors shadow-xs active:scale-90 cursor-pointer"
                  >
                    {copiedCode === offer.code ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>

                <button
                  onClick={() => onSelectOffer && onSelectOffer(offer)}
                  className="px-3.5 py-1.5 rounded-full bg-[#4a1525] hover:bg-[#340b17] text-amber-200 text-xs font-bold flex items-center gap-1 transition-all active:scale-95 shadow-sm cursor-pointer"
                >
                  <span>Apply Code</span>
                  <ArrowRight className="w-3 h-3 text-amber-300" />
                </button>
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}
