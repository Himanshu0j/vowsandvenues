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
          const cardThemes = [
            { bg: "bg-gradient-to-br from-amber-50/80 via-white to-rose-50/50", border: "border-amber-300 hover:border-amber-500", badgeBg: "bg-gradient-to-r from-amber-500 to-amber-700 text-white", accentText: "text-amber-800" },
            { bg: "bg-gradient-to-br from-emerald-50/80 via-white to-amber-50/50", border: "border-emerald-300 hover:border-emerald-500", badgeBg: "bg-gradient-to-r from-emerald-600 to-teal-700 text-white", accentText: "text-emerald-800" },
            { bg: "bg-gradient-to-br from-rose-50/80 via-white to-purple-50/50", border: "border-rose-300 hover:border-rose-500", badgeBg: "bg-gradient-to-r from-rose-600 to-pink-700 text-white", accentText: "text-rose-800" }
          ]
          const theme = cardThemes[idx % 3]

          return (
            <div
              key={offer.id || offer.code}
              className={`${theme.bg} rounded-2xl p-6 border-2 ${theme.border} shadow-sm hover:shadow-2xl transition-all duration-300 flex flex-col justify-between relative overflow-hidden group card-3d-hover`}
            >
              {/* Top gold accent line with shimmer */}
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#4a1525] via-amber-400 to-[#4a1525]" />

              <div>
                <div className="flex items-center justify-between mb-3.5">
                  <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${theme.badgeBg} shadow-sm flex items-center gap-1`}>
                    <Sparkles className="w-3 h-3 text-amber-200" />
                    {offer.badge || "Signature Privilege"}
                  </span>
                  <span className={`font-serif font-bold text-xl ${theme.accentText}`}>
                    {offer.discount}
                  </span>
                </div>

                <h3 className="font-serif font-bold text-lg text-stone-900 mb-2 group-hover:text-[#4a1525] transition-colors">
                  {offer.title}
                </h3>
                <p className="text-xs text-stone-600 leading-relaxed mb-6">
                  {offer.desc || offer.description}
                </p>
              </div>

              <div className="pt-4 border-t border-stone-200/80 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold text-stone-900 bg-white px-3 py-1.5 rounded-lg border border-amber-300/80 shadow-inner flex items-center gap-1.5">
                    <Tag className="w-3 h-3 text-amber-600" />
                    {offer.code}
                  </span>
                  <button
                    onClick={() => handleCopy(offer.code)}
                    title="Copy code"
                    className="p-1.5 rounded-lg bg-stone-100 hover:bg-amber-100 text-stone-700 hover:text-amber-900 transition-colors shadow-sm active:scale-90"
                  >
                    {copiedCode === offer.code ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>

                <button
                  onClick={() => onSelectOffer && onSelectOffer(offer)}
                  className="px-3 py-1.5 rounded-full btn-3d-gold text-stone-900 text-xs font-bold flex items-center gap-1 transition-all active:scale-95"
                >
                  <span>Apply Code</span>
                  <ArrowRight className="w-3 h-3 text-stone-900" />
                </button>
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}
