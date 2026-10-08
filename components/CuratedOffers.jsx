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
        <p className="text-xs text-[#78716c] max-w-md mt-2 sm:mt-0">
          Handcrafted incentives for multi-vendor booking, cinematography, and couture bridal styling.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {offers.map((offer) => (
          <div
            key={offer.id || offer.code}
            className="bg-white rounded-2xl p-6 border border-[#e8e2d5] shadow-sm hover:shadow-md transition-all flex flex-col justify-between relative overflow-hidden group"
          >
            {/* Top gold accent line */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#4a1525] via-[#c5a059] to-[#4a1525]" />

            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#ebd8de] text-[#4a1525]">
                  {offer.badge || "Signature Privilege"}
                </span>
                <span className="font-serif font-bold text-lg text-[#4a1525]">
                  {offer.discount}
                </span>
              </div>

              <h3 className="font-serif font-bold text-base text-[#1c1917] mb-2">
                {offer.title}
              </h3>
              <p className="text-xs text-[#78716c] leading-relaxed mb-6">
                {offer.desc || offer.description}
              </p>
            </div>

            <div className="pt-4 border-t border-[#f5f2eb] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-bold text-[#1c1917] bg-[#f5f2eb] px-2.5 py-1 rounded border border-[#dfd7c8]">
                  {offer.code}
                </span>
                <button
                  onClick={() => handleCopy(offer.code)}
                  title="Copy code"
                  className="p-1 text-[#78716c] hover:text-[#4a1525] transition-colors"
                >
                  {copiedCode === offer.code ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>

              <button
                onClick={() => onSelectOffer && onSelectOffer(offer)}
                className="text-xs font-bold text-[#4a1525] hover:text-[#3d111e] flex items-center gap-1 transition-colors"
              >
                <span>Apply in Plan</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
