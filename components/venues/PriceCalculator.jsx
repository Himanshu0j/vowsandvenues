'use client'

import React from 'react'

/**
 * Defensive VenuePriceCalculator component
 * Safe calculation of venue pricing tier, guest capacity, and taxes with zero undefined property errors
 */
export default function VenuePriceCalculator({
  venue = {},
  guestCount = 400,
  advancePercent = 25,
  onPriceCalculated
}) {
  const safePricingTier = venue?.venuePricingTier || venue?.pricingTier || 'standard'
  const basePrice = Number(venue?.startingPrice || venue?.price || 130000)
  const vegPlate = Number(venue?.vegPlate || 1800)
  const nonVegPlate = Number(venue?.nonVegPlate || 2200)
  const tax = Math.round(basePrice * 0.18)
  const platformFee = 2500
  const estimatedTotal = basePrice + tax + platformFee
  const advanceAmount = Math.round(estimatedTotal * (advancePercent / 100))

  return (
    <div className="p-4 rounded-2xl bg-stone-900 border border-stone-800 text-stone-200 text-xs space-y-2">
      <div className="flex justify-between font-bold">
        <span>Pricing Tier ({safePricingTier})</span>
        <span>₹{basePrice.toLocaleString('en-IN')}</span>
      </div>
      <div className="flex justify-between text-stone-400">
        <span>Estimated Taxes (18% GST)</span>
        <span>₹{tax.toLocaleString('en-IN')}</span>
      </div>
      <div className="flex justify-between font-bold text-white pt-2 border-t border-stone-800">
        <span>Total Estimated</span>
        <span>₹{estimatedTotal.toLocaleString('en-IN')}</span>
      </div>
    </div>
  )
}
