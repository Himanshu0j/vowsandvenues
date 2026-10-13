'use client'

import React, { useState } from 'react'
import {
  Sparkles,
  Bot,
  Send,
  Building2,
  Calendar,
  DollarSign,
  Users,
  MapPin,
  CheckCircle2,
  X,
  ArrowRight,
  Share2,
  Phone,
  Layers,
  Crown
} from 'lucide-react'
import { toast } from 'sonner'

export const QUICK_PROMPTS = [
  {
    title: 'Udaipur Lakeside 3-Day Wedding',
    prompt: 'Plan a 3-Day Lakefront Wedding in Udaipur for 350 guests under ₹45 Lakhs with boat baraat.'
  },
  {
    title: 'Jaipur Grand Citadel & Sufi Night',
    prompt: 'Grand Heritage Palace wedding in Jaipur for 400 guests with royal elephant procession and Sufi night under ₹60 Lakhs.'
  },
  {
    title: 'Intimate Jodhpur Fort Ceremony',
    prompt: 'Intimate Fort wedding in Jodhpur for 150 guests under ₹25 Lakhs with traditional Mewari feast.'
  },
  {
    title: 'Goa Coastal Sundowner Wedding',
    prompt: 'Beachfront luxury wedding in Goa for 200 guests with live seafood grills and sunset mandap under ₹35 Lakhs.'
  }
]

export const CURATED_PLANS = {
  udaipur: {
    title: 'The Royal Lake Pichola 3-Day Odyssey',
    city: 'Udaipur, Rajasthan',
    muhuratMatch: '14 Dec 2026 (Dev Uthani Winter Saaya)',
    guests: 350,
    budgetTotal: 4250000,
    venue: {
      name: 'The Royal Lake Palace & Courtyards',
      price: 2100000,
      image: 'https://images.unsplash.com/photo-1545232979-fbf675432098?auto=format&fit=crop&w=600&q=80',
      highlights: 'Private boat jetty for 25-boat baraat, starlit Mewari courtyards, 400 pax capacity'
    },
    decor: {
      name: 'Gulmohar Artisanal Mogra & Water Floating Mandap',
      price: 750000,
      highlights: 'Over 15,000 fresh marigold & mogra strands illuminated by brass floating diyas'
    },
    catering: {
      name: 'Mewari Royal Thali & Live Charcoal Kebabs',
      price: 900000,
      highlights: '4 Royal meals: Sangeet chaat bazaar, Sufi Nizami dastarkhwan, post-phera feast'
    },
    cinema: {
      name: 'Drishti 4K Aerial Drone & Cinematic Memoirs',
      price: 500000,
      highlights: 'Full 3-day multi-camera crew, live streaming for global family, 4K teaser film'
    }
  },
  jaipur: {
    title: 'The Rambagh Citadel Imperial Extravaganza',
    city: 'Jaipur, Rajasthan',
    muhuratMatch: '21 Dec 2026 (Winter Solstice Vivah)',
    guests: 400,
    budgetTotal: 5800000,
    venue: {
      name: 'Rambagh Citadel & Mughal Gardens',
      price: 2800000,
      image: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=600&q=80',
      highlights: 'Carved sandstone jharokhas, 1200 pax lawn capacity, vintage carriage baraat pathway'
    },
    decor: {
      name: 'Rajwada Velvet & Brass Diya Royal Pavilion',
      price: 1100000,
      highlights: 'Regal maroon velvet drapes, cascading jasmine chandeliers, antique brass urns'
    },
    catering: {
      name: 'Gourmet Rajasthani Royal & Pan-Asian Grazing Tables',
      price: 1250000,
      highlights: 'Dal Baati Churma royal station, live tandoor courtyard, artisanal dessert gallery'
    },
    cinema: {
      name: 'Stories Style High-Fashion Wedding Cinema',
      price: 650000,
      highlights: 'Editorial photography, 4K slow-motion reel cuts, full-length feature documentary'
    }
  },
  default: {
    title: 'Bespoke Royal Heritage Celebration',
    city: 'Rajasthan / North India',
    muhuratMatch: '18 Nov 2026 (Dev Uthani Ekadashi)',
    guests: 250,
    budgetTotal: 2400000,
    venue: {
      name: 'The Royal Nawabi Palace & Lawns',
      price: 1200000,
      image: 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=600&q=80',
      highlights: 'Sheesh Mahal banquet hall, manicured lawn with fountain stage, valet parking'
    },
    decor: {
      name: 'Artisanal Floral Atelier & Candlelit Pergola',
      price: 450000,
      highlights: 'White tuberoses, gold mirror pillars, warm fairy light canopies'
    },
    catering: {
      name: 'Nizami Awadhi Dum Pukht Feast',
      price: 500000,
      highlights: 'Galawati kebabs, fragrant biryani, live roomali roti counter, saffron shahi tukda'
    },
    cinema: {
      name: 'Royal Heritage Photography & Video',
      price: 250000,
      highlights: 'Traditional + candid photographers, teaser reel, leather-bound luxury album'
    }
  }
}

export default function RajshreeAIConcierge({ onOpenNegotiation, onOpenRecce }) {
  const [isOpen, setIsOpen] = useState(false)
  const [inputText, setInputText] = useState('')
  const [isThinking, setIsThinking] = useState(false)
  const [generatedPlan, setGeneratedPlan] = useState(null)

  const handleGenerate = (query) => {
    const text = query || inputText
    if (!text.trim()) return

    setIsThinking(true)
    setGeneratedPlan(null)

    setTimeout(() => {
      const lower = text.toLowerCase()
      let plan = CURATED_PLANS.default
      if (lower.includes('udaipur') || lower.includes('lake') || lower.includes('water')) {
        plan = CURATED_PLANS.udaipur
      } else if (lower.includes('jaipur') || lower.includes('citadel') || lower.includes('rambagh')) {
        plan = CURATED_PLANS.jaipur
      }

      setGeneratedPlan(plan)
      setIsThinking(false)
      toast.success('Rajshree AI has curated your royal wedding plan!')
    }, 1200)
  }

  const sharePlanWhatsApp = () => {
    if (!generatedPlan) return
    const msg = encodeURIComponent(
      `Namaste! ✨ Here is our AI-Curated Royal Wedding Plan from Vows & Venues:\n\n` +
      `👑 Plan: *${generatedPlan.title}*\n` +
      `📍 City: ${generatedPlan.city}\n` +
      `📅 Shubh Muhurat Date: ${generatedPlan.muhuratMatch}\n` +
      `👥 Guests: ~${generatedPlan.guests} pax\n\n` +
      `🏰 Palace Venue: ${generatedPlan.venue.name} (₹${(generatedPlan.venue.price / 100000).toFixed(1)}L)\n` +
      `🌸 Decor: ${generatedPlan.decor.name} (₹${(generatedPlan.decor.price / 100000).toFixed(1)}L)\n` +
      `🍽️ Feast: ${generatedPlan.catering.name} (₹${(generatedPlan.catering.price / 100000).toFixed(1)}L)\n` +
      `📸 Cinema: ${generatedPlan.cinema.name} (₹${(generatedPlan.cinema.price / 100000).toFixed(1)}L)\n\n` +
      `*Total Estimated Package: ₹${(generatedPlan.budgetTotal / 100000).toFixed(2)} Lakhs*\n\n` +
      `Explore & book on: https://vowsandvenues-staging.onrender.com/`
    )
    window.open(`https://wa.me/?text=${msg}`, '_blank')
  }

  return (
    <>
      {/* Floating Gold Pill / Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-20 left-4 sm:bottom-6 sm:left-6 z-40 group flex items-center gap-2 px-4 py-2.5 rounded-full bg-gradient-to-r from-stone-900 via-burgundy to-stone-950 text-amber-200 border-2 border-amber-300/60 shadow-[0_10px_35px_rgba(74,21,37,0.4)] hover:scale-105 active:scale-95 transition-all"
        title="Ask Rajshree AI — Royal Wedding Matchmaker"
      >
        <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-amber-400 to-amber-200 text-stone-900 flex items-center justify-center font-bold text-xs shadow shrink-0">
          <Sparkles className="w-3.5 h-3.5 text-stone-950 animate-spin" style={{ animationDuration: '6s' }} />
        </div>
        <div className="text-left">
          <span className="block text-[11px] font-bold tracking-wide text-white leading-tight">
            Rajshree AI Concierge
          </span>
          <span className="block text-[9px] text-amber-300 uppercase tracking-widest font-mono font-bold">
            Smart Matchmaker
          </span>
        </div>
      </button>

      {/* AI DRAWER MODAL */}
      {isOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 shadow-2xl border border-stone-200 max-h-[92vh] flex flex-col animate-in fade-in zoom-in-95 duration-200 text-stone-900">
            
            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b border-stone-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-burgundy via-stone-900 to-black text-amber-300 flex items-center justify-center border border-amber-300/40 shadow">
                  <Crown className="w-5 h-5 text-amber-300" />
                </div>
                <div>
                  <h3 className="font-serif font-bold text-lg text-stone-900 flex items-center gap-1.5">
                    <span>Rajshree AI Concierge</span>
                    <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 text-[10px] font-bold uppercase tracking-wider">
                      Royal Matchmaker
                    </span>
                  </h3>
                  <p className="text-xs text-stone-500">
                    Tell me your dream vision, budget, and guest count. I will curate matching palaces and vendor packages.
                  </p>
                </div>
              </div>

              <button
                onClick={() => setIsOpen(false)}
                className="w-8 h-8 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-600 flex items-center justify-center font-bold text-xs transition-colors"
              >
                ✕
              </button>
            </div>

            {/* Scrollable Content Body */}
            <div className="flex-1 overflow-y-auto py-4 space-y-5">
              
              {/* Quick Prompts Carousel */}
              <div>
                <span className="text-[11px] font-bold text-stone-400 uppercase tracking-wider block mb-2">
                  Curated Inspiration Prompts:
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  {QUICK_PROMPTS.map((qp, i) => (
                    <button
                      key={i}
                      onClick={() => {
                        setInputText(qp.prompt)
                        handleGenerate(qp.prompt)
                      }}
                      className="text-left p-3 rounded-2xl border border-stone-200 bg-stone-50 hover:bg-amber-50 hover:border-amber-300 transition-all group"
                    >
                      <span className="font-bold text-stone-800 group-hover:text-amber-900 block mb-0.5">
                        {qp.title}
                      </span>
                      <p className="text-[11px] text-stone-500 line-clamp-2">
                        {qp.prompt}
                      </p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Chat Input Bar */}
              <div className="bg-stone-50 p-3 rounded-2xl border border-stone-200 flex items-center gap-2">
                <input
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') handleGenerate() }}
                  placeholder="e.g. 3-day wedding in Jaipur for 400 guests under ₹50L with Sufi music..."
                  className="w-full bg-transparent text-xs text-stone-800 placeholder-stone-400 focus:outline-none px-2"
                />
                <button
                  onClick={() => handleGenerate()}
                  disabled={isThinking || !inputText.trim()}
                  className="px-4 py-2 rounded-xl bg-stone-900 hover:bg-black text-white font-bold text-xs flex items-center gap-1.5 shadow disabled:opacity-50 shrink-0"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                  <span>Curate Plan</span>
                </button>
              </div>

              {/* Thinking State */}
              {isThinking && (
                <div className="p-8 text-center space-y-3">
                  <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center mx-auto animate-bounce">
                    <Crown className="w-6 h-6 text-amber-600" />
                  </div>
                  <h4 className="font-serif font-bold text-stone-800">Analyzing Heritage Venues &amp; Pricing Inventories...</h4>
                  <p className="text-xs text-stone-500 max-w-sm mx-auto">
                    Rajshree AI is matching palace availability, estimating per-plate catering math, and aligning with auspicious Muhurat dates.
                  </p>
                </div>
              )}

              {/* Generated Wedding Plan Card */}
              {generatedPlan && !isThinking && (
                <div className="bg-gradient-to-br from-stone-950 via-stone-900 to-burgundy text-white rounded-3xl p-6 border border-champagne/40 shadow-xl space-y-5 animate-in fade-in duration-300">
                  
                  {/* Plan Top Header */}
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-4 border-b border-white/10">
                    <div>
                      <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-champagne/20 text-champagne border border-champagne/30 uppercase tracking-wider">
                        Rajshree Verified Curated Proposal
                      </span>
                      <h4 className="font-serif text-xl sm:text-2xl font-bold text-white mt-1">
                        {generatedPlan.title}
                      </h4>
                      <div className="flex flex-wrap items-center gap-3 text-xs text-stone-300 mt-1">
                        <span>📍 {generatedPlan.city}</span>
                        <span>👥 ~{generatedPlan.guests} Guests</span>
                        <span>📅 Muhurat: <strong>{generatedPlan.muhuratMatch}</strong></span>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-[10px] text-stone-400 uppercase tracking-widest block font-medium">Estimated Package</span>
                      <span className="font-serif text-2xl font-bold text-champagne">
                        ₹{(generatedPlan.budgetTotal / 100000).toFixed(2)} Lakhs
                      </span>
                    </div>
                  </div>

                  {/* Curated Package Elements */}
                  <div className="space-y-3 text-xs">
                    {/* Venue */}
                    <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <img src={generatedPlan.venue.image} alt="palace" className="w-14 h-14 rounded-xl object-cover shrink-0" />
                        <div>
                          <span className="text-[10px] font-bold text-champagne uppercase block">Palace Venue</span>
                          <span className="font-serif font-bold text-sm text-white">{generatedPlan.venue.name}</span>
                          <p className="text-[11px] text-stone-300 mt-0.5">{generatedPlan.venue.highlights}</p>
                        </div>
                      </div>
                      <span className="font-serif font-bold text-amber-200 text-sm shrink-0">
                        ₹{(generatedPlan.venue.price / 100000).toFixed(1)}L
                      </span>
                    </div>

                    {/* Decor */}
                    <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between gap-3">
                      <div>
                        <span className="text-[10px] font-bold text-champagne uppercase block">Floral &amp; Stage Decor</span>
                        <span className="font-serif font-bold text-sm text-white">{generatedPlan.decor.name}</span>
                        <p className="text-[11px] text-stone-300 mt-0.5">{generatedPlan.decor.highlights}</p>
                      </div>
                      <span className="font-serif font-bold text-amber-200 text-sm shrink-0">
                        ₹{(generatedPlan.decor.price / 100000).toFixed(1)}L
                      </span>
                    </div>

                    {/* Catering */}
                    <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between gap-3">
                      <div>
                        <span className="text-[10px] font-bold text-champagne uppercase block">Royal Banquet Feasts</span>
                        <span className="font-serif font-bold text-sm text-white">{generatedPlan.catering.name}</span>
                        <p className="text-[11px] text-stone-300 mt-0.5">{generatedPlan.catering.highlights}</p>
                      </div>
                      <span className="font-serif font-bold text-amber-200 text-sm shrink-0">
                        ₹{(generatedPlan.catering.price / 100000).toFixed(1)}L
                      </span>
                    </div>

                    {/* Cinema */}
                    <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between gap-3">
                      <div>
                        <span className="text-[10px] font-bold text-champagne uppercase block">4K Cinematography &amp; Drone</span>
                        <span className="font-serif font-bold text-sm text-white">{generatedPlan.cinema.name}</span>
                        <p className="text-[11px] text-stone-300 mt-0.5">{generatedPlan.cinema.highlights}</p>
                      </div>
                      <span className="font-serif font-bold text-amber-200 text-sm shrink-0">
                        ₹{(generatedPlan.cinema.price / 100000).toFixed(1)}L
                      </span>
                    </div>
                  </div>

                  {/* Actions Bar */}
                  <div className="pt-4 border-t border-white/10 flex flex-wrap items-center justify-between gap-3">
                    <button
                      onClick={sharePlanWhatsApp}
                      className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 shadow transition-colors"
                    >
                      <Share2 className="w-3.5 h-3.5" />
                      <span>Share Plan on WhatsApp</span>
                    </button>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          setIsOpen(false)
                          if (onOpenNegotiation) onOpenNegotiation()
                          toast.success('Negotiation room opened with Rajshree plan!')
                        }}
                        className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-champagne to-amber-400 text-stone-900 font-bold text-xs shadow hover:brightness-105 transition-all"
                      >
                        Negotiate Package Rate →
                      </button>
                    </div>
                  </div>

                </div>
              )}

            </div>
          </div>
        </div>
      )}
    </>
  )
}
