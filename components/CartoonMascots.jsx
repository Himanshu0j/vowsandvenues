'use client'

import React, { useState } from 'react'
import { Sparkles, Heart, MessageCircle, X } from 'lucide-react'

/**
 * 👑 MaharajaSittingMascot
 * An adorable cartoon Indian Royal Groom / Maharaja sitting comfortably on top of text,
 * with swinging dangling legs, animated waving hand, and blinking smiling face!
 */
export function MaharajaSittingMascot({ className = "", scale = 1 }) {
  return (
    <div 
      className={`inline-block select-none pointer-events-auto transition-transform hover:scale-110 cursor-pointer ${className}`}
      title="Raja Ji: Welcome to Vows & Venues!"
    >
      <div className="relative animate-mascot-bob">
        {/* Cartoon Speech Bubble on Hover or Floating */}
        <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-[#00ff88] text-[#050807] text-[10px] font-black px-2.5 py-1 rounded-full whitespace-nowrap shadow-[0_0_15px_rgba(0,255,136,0.8)] border border-white/40 flex items-center gap-1 z-30">
          <span>👑 Shubh Vivaah!</span>
          <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-[#00ff88] rotate-45" />
        </div>

        <svg 
          width={110 * scale} 
          height={120 * scale} 
          viewBox="0 0 110 120" 
          fill="none" 
          xmlns="http://www.w3.org/2000/svg"
          className="drop-shadow-[0_10px_20px_rgba(0,0,0,0.6)]"
        >
          {/* Shadow under character */}
          <ellipse cx="55" cy="114" rx="28" ry="5" fill="#000000" opacity="0.4" />

          {/* Dangling Legs (Swinging keyframes) */}
          {/* Left Leg */}
          <g className="animate-mascot-leg-left" style={{ transformOrigin: '42px 82px' }}>
            <rect x="36" y="82" width="12" height="26" rx="6" fill="#14241d" stroke="#00ff88" strokeWidth="2" />
            {/* Royal Jutti / Mojari Shoe (curled toe) */}
            <path d="M34 104 C34 104 38 108 48 108 C53 108 55 104 53 100 C50 102 42 102 34 104 Z" fill="#ffd700" stroke="#b45309" strokeWidth="1.5" />
            <circle cx="53" cy="101" r="1.5" fill="#ef4444" />
          </g>

          {/* Right Leg */}
          <g className="animate-mascot-leg-right" style={{ transformOrigin: '66px 82px' }}>
            <rect x="60" y="82" width="12" height="26" rx="6" fill="#14241d" stroke="#00ff88" strokeWidth="2" />
            {/* Royal Jutti / Mojari Shoe */}
            <path d="M58 104 C58 104 62 108 72 108 C77 108 79 104 77 100 C74 102 66 102 58 104 Z" fill="#ffd700" stroke="#b45309" strokeWidth="1.5" />
            <circle cx="77" cy="101" r="1.5" fill="#ef4444" />
          </g>

          {/* Torso / Royal Sherwani Jacket */}
          <path d="M32 50 C32 46 42 42 54 42 C66 42 76 46 76 50 L78 84 C78 86 72 88 54 88 C36 88 30 86 30 84 Z" fill="#0a1811" stroke="#00ff88" strokeWidth="2.5" />
          
          {/* Royal Emerald & Gold Button Placket */}
          <line x1="54" y1="44" x2="54" y2="86" stroke="#ffd700" strokeWidth="2.5" strokeDasharray="1 5" />
          <circle cx="54" cy="52" r="2" fill="#00ff88" />
          <circle cx="54" cy="62" r="2" fill="#ffd700" />
          <circle cx="54" cy="72" r="2" fill="#00ff88" />

          {/* Royal Pearl Necklace (Moti Mala) */}
          <path d="M40 48 Q54 66 68 48" stroke="#ffffff" strokeWidth="2.5" strokeDasharray="3 3" fill="none" />
          <circle cx="54" cy="58" r="3.5" fill="#00ff88" stroke="#ffd700" strokeWidth="1" />

          {/* Left Arm Resting on Knee */}
          <path d="M32 52 C26 56 22 68 28 74 C34 76 38 72 38 68 Z" fill="#0a1811" stroke="#00ff88" strokeWidth="2" />
          <circle cx="34" cy="72" r="4" fill="#fcd34d" />

          {/* Right Arm Waving Cheerful Hand */}
          <g className="animate-mascot-wave" style={{ transformOrigin: '76px 54px' }}>
            <path d="M74 52 C84 48 92 40 96 32 C99 35 96 42 88 52 Z" fill="#0a1811" stroke="#00ff88" strokeWidth="2" />
            {/* Hand */}
            <circle cx="97" cy="30" r="5.5" fill="#fcd34d" stroke="#d97706" strokeWidth="1" />
            {/* Sparkling Rose in Hand */}
            <circle cx="102" cy="24" r="4" fill="#ef4444" />
            <path d="M102 24 L106 18" stroke="#10b981" strokeWidth="1.5" />
            <circle cx="106" cy="18" r="1.5" fill="#00ff88" />
          </g>

          {/* Cute Round Face */}
          <circle cx="54" cy="32" r="18" fill="#fde68a" stroke="#d97706" strokeWidth="1.5" />

          {/* Blushing Cheeks */}
          <ellipse cx="43" cy="36" rx="3" ry="2" fill="#f43f5e" opacity="0.6" />
          <ellipse cx="65" cy="36" rx="3" ry="2" fill="#f43f5e" opacity="0.6" />

          {/* Big Smiling Cartoon Eyes */}
          <ellipse cx="46" cy="30" rx="2.5" ry="3.5" fill="#1e1b4b" />
          <circle cx="45" cy="29" r="1" fill="#ffffff" />
          
          <ellipse cx="62" cy="30" rx="2.5" ry="3.5" fill="#1e1b4b" />
          <circle cx="61" cy="29" r="1" fill="#ffffff" />

          {/* Happy Curved Eyebrows */}
          <path d="M42 24 Q46 21 50 24" stroke="#78350f" strokeWidth="1.5" fill="none" strokeLinecap="round" />
          <path d="M58 24 Q62 21 66 24" stroke="#78350f" strokeWidth="1.5" fill="none" strokeLinecap="round" />

          {/* Royal Twirled Mustache */}
          <path d="M43 38 C47 36 52 38 54 40 C56 38 61 36 65 38 C68 39 67 42 63 41 C58 40 55 42 54 43 C53 42 50 40 45 41 C41 42 40 39 43 38 Z" fill="#451a03" />

          {/* Cheerful Smile */}
          <path d="M50 41 Q54 46 58 41" stroke="#991b1b" strokeWidth="1.5" fill="none" strokeLinecap="round" />

          {/* Royal Emerald & Gold Turban (Safa / Pagdi) */}
          <path d="M34 26 C32 16 40 8 54 8 C68 8 76 16 74 26 C72 26 36 26 34 26 Z" fill="#047857" stroke="#00ff88" strokeWidth="2" />
          {/* Turban Folds / Swirls */}
          <path d="M38 24 Q54 14 70 24" stroke="#ffd700" strokeWidth="2" fill="none" />
          <path d="M42 18 Q54 10 66 18" stroke="#10b981" strokeWidth="1.5" fill="none" />
          <path d="M46 14 Q54 6 62 14" stroke="#ffd700" strokeWidth="1.5" fill="none" />

          {/* Sparkling Royal Kalgi Feather Jewel on Turban */}
          <g>
            <circle cx="54" cy="9" r="3.5" fill="#ffd700" stroke="#00ff88" strokeWidth="1.5" />
            <circle cx="54" cy="9" r="1.5" fill="#ef4444" />
            {/* Glowing Plume Feather */}
            <path d="M54 7 C51 -4 44 -8 40 -12 C48 -8 52 -2 54 7 Z" fill="#00ff88" opacity="0.9" />
            <path d="M54 7 C57 -4 64 -8 68 -12 C60 -8 56 -2 54 7 Z" fill="#ffd700" opacity="0.9" />
          </g>
        </svg>
      </div>
    </div>
  )
}

/**
 * 💃 DancingCoupleMascot
 * Cute cartoon wedding couple (Dulha & Dulhan) dancing with festive neon sparkles
 */
export function DancingCoupleMascot({ className = "" }) {
  return (
    <div className={`inline-flex items-center gap-2 select-none animate-mascot-bob ${className}`}>
      <div className="relative">
        <svg width="100" height="90" viewBox="0 0 100 90" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Groom (Left) */}
          <g transform="translate(10, 10)">
            <ellipse cx="25" cy="72" rx="14" ry="4" fill="#000000" opacity="0.3" />
            <rect x="18" y="38" width="14" height="30" rx="6" fill="#064e3b" stroke="#00ff88" strokeWidth="2" />
            <circle cx="25" cy="24" r="12" fill="#fde68a" stroke="#d97706" strokeWidth="1" />
            {/* Eyes & smile */}
            <circle cx="21" cy="22" r="1.5" fill="#1e1b4b" />
            <circle cx="27" cy="22" r="1.5" fill="#1e1b4b" />
            <path d="M21 28 Q24 32 27 28" stroke="#78350f" strokeWidth="1" fill="none" />
            {/* Turban */}
            <path d="M12 18 C10 10 18 4 25 4 C32 4 40 10 38 18 Z" fill="#047857" stroke="#ffd700" strokeWidth="1.5" />
            <circle cx="25" cy="4" r="2.5" fill="#ef4444" />
          </g>

          {/* Bride (Right) with Red & Gold Lehenga */}
          <g transform="translate(45, 10)">
            <ellipse cx="25" cy="72" rx="14" ry="4" fill="#000000" opacity="0.3" />
            {/* Flared Lehenga Skirt */}
            <path d="M18 42 L10 70 C10 72 40 72 40 70 L32 42 Z" fill="#991b1b" stroke="#ffd700" strokeWidth="2" />
            <line x1="12" y1="64" x2="38" y2="64" stroke="#00ff88" strokeWidth="1.5" strokeDasharray="2 2" />
            <circle cx="25" cy="24" r="11" fill="#fde68a" stroke="#d97706" strokeWidth="1" />
            {/* Eyes with bindi */}
            <circle cx="21" cy="22" r="1.5" fill="#1e1b4b" />
            <circle cx="27" cy="22" r="1.5" fill="#1e1b4b" />
            <circle cx="24" cy="18" r="1" fill="#ef4444" />
            <path d="M22 28 Q24 31 26 28" stroke="#991b1b" strokeWidth="1" fill="none" />
            {/* Dupatta & Maang Tikka */}
            <path d="M14 18 C14 10 36 10 36 18 L38 36 L12 36 Z" fill="#dc2626" opacity="0.8" stroke="#ffd700" strokeWidth="1" />
            <circle cx="24" cy="14" r="1.5" fill="#ffd700" />
          </g>

          {/* Floating Varmala Garlands & Sparkles */}
          <path d="M35 44 Q50 56 65 44" stroke="#00ff88" strokeWidth="2.5" strokeDasharray="3 3" fill="none" />
          <circle cx="50" cy="51" r="3" fill="#ef4444" />
          <circle cx="43" cy="48" r="2.5" fill="#ffd700" />
          <circle cx="57" cy="48" r="2.5" fill="#ffd700" />
        </svg>
      </div>
    </div>
  )
}

/**
 * 🐘 RoyalElephantMascot
 * Celebratory royal Indian elephant with festive floral headpiece and dholak
 */
export function RoyalElephantMascot({ className = "", scale = 1 }) {
  return (
    <div className={`inline-block select-none animate-mascot-bob ${className}`}>
      <svg width={85 * scale} height={85 * scale} viewBox="0 0 85 85" fill="none" xmlns="http://www.w3.org/2000/svg">
        <ellipse cx="42" cy="78" rx="28" ry="4" fill="#000000" opacity="0.4" />
        {/* Legs */}
        <rect x="22" y="56" width="10" height="20" rx="5" fill="#334155" stroke="#00ff88" strokeWidth="1.5" />
        <rect x="48" y="56" width="10" height="20" rx="5" fill="#334155" stroke="#00ff88" strokeWidth="1.5" />
        {/* Body */}
        <ellipse cx="38" cy="50" rx="22" ry="18" fill="#475569" stroke="#00ff88" strokeWidth="2" />
        {/* Decorative Royal Cloth (Jhool) */}
        <path d="M24 42 Q38 36 52 42 L50 56 Q38 60 26 56 Z" fill="#047857" stroke="#ffd700" strokeWidth="1.5" />
        <circle cx="38" cy="48" r="3" fill="#ef4444" />
        {/* Head */}
        <circle cx="56" cy="38" r="14" fill="#475569" stroke="#00ff88" strokeWidth="1.5" />
        {/* Big Smiling Eye */}
        <circle cx="60" cy="34" r="2.5" fill="#1e1b4b" />
        <circle cx="61" cy="33" r="1" fill="#ffffff" />
        {/* Big Flapping Ear */}
        <path d="M46 32 C40 28 36 42 46 48 Z" fill="#f472b6" opacity="0.8" stroke="#334155" strokeWidth="1.5" />
        {/* Trunk Raised Up Cheerfully */}
        <path d="M66 42 C72 44 78 38 78 30 C78 26 73 24 72 27" stroke="#475569" strokeWidth="6" strokeLinecap="round" fill="none" />
        <path d="M66 42 C72 44 78 38 78 30 C78 26 73 24 72 27" stroke="#00ff88" strokeWidth="1.5" fill="none" />
        {/* Flower in Trunk */}
        <circle cx="72" cy="24" r="3.5" fill="#ef4444" />
        <circle cx="72" cy="24" r="1.5" fill="#ffd700" />
        {/* Headpiece (Matha Patti) */}
        <path d="M50 28 Q56 24 64 28" stroke="#ffd700" strokeWidth="2.5" fill="none" />
        <circle cx="57" cy="26" r="2" fill="#ef4444" />
      </svg>
    </div>
  )
}

/**
 * 💬 InteractiveCornerConcierge
 * Fixed bottom-right corner mascot with live interactive assistance bubble
 */
export function InteractiveCornerConcierge({ onOpenConcierge }) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="fixed bottom-5 right-5 z-40 flex flex-col items-end pointer-events-auto">
      {/* Speech Box */}
      {isOpen && (
        <div className="mb-3 max-w-[260px] bg-[#0c1813] border-2 border-[#00ff88] rounded-2xl p-3.5 shadow-[0_0_30px_rgba(0,255,136,0.4)] text-white text-xs backdrop-blur-xl animate-pop-in relative">
          <button 
            onClick={() => setIsOpen(false)}
            className="absolute top-2 right-2 text-stone-400 hover:text-white"
          >
            <X className="w-3.5 h-3.5" />
          </button>
          <div className="flex items-center gap-1.5 text-[#00ff88] font-bold text-[11px] mb-1">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Raja Ji's Royal Concierge</span>
          </div>
          <p className="text-stone-300 text-[11px] leading-relaxed mb-2.5">
            Looking for authentic Awadhi catering or a heritage palace in Udaipur? I can assist you right now!
          </p>
          <button
            onClick={() => {
              setIsOpen(false)
              if (onOpenConcierge) onOpenConcierge()
            }}
            className="w-full btn-neon-green text-black font-extrabold text-[11px] py-1.5 rounded-lg flex items-center justify-center gap-1.5 shadow-md"
          >
            <MessageCircle className="w-3.5 h-3.5" />
            <span>Start Free Consultation</span>
          </button>
        </div>
      )}

      {/* Floating Mascot Avatar Pill */}
      <div 
        onClick={() => setIsOpen(!isOpen)}
        className="group flex items-center gap-2.5 bg-[#08120d] hover:bg-[#0c1c14] border-2 border-[#00ff88] px-3.5 py-2 rounded-full cursor-pointer shadow-[0_0_25px_rgba(0,255,136,0.4)] transition-all duration-300 hover:scale-105 active:scale-95"
      >
        <span className="relative flex h-3 w-3">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00ff88] opacity-75"></span>
          <span className="relative inline-flex rounded-full h-3 w-3 bg-[#00ff88]"></span>
        </span>
        <div className="text-left">
          <div className="text-[10px] font-bold uppercase tracking-wider text-[#00ff88] flex items-center gap-1">
            <span>Ask Raja Ji</span>
            <span className="text-xs">👑</span>
          </div>
          <div className="text-[11px] font-semibold text-white leading-none">Wedding Assistant</div>
        </div>
      </div>
    </div>
  )
}
