'use client'

import React from 'react'

export default function SuspendedPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-5 bg-[#f1f3f6] text-[#202938] font-sans">
      <div className="w-full max-w-[480px] bg-white p-7 sm:p-11 rounded-2xl text-center shadow-[0_10px_40px_rgba(0,0,0,0.06)] border border-stone-200/60">
        <div className="w-[75px] h-[75px] mx-auto mb-6 bg-[#fff3e0] rounded-full flex items-center justify-center text-[35px]">
          🖥️
        </div>

        <h1 className="text-2xl sm:text-[28px] font-bold text-[#202938] mb-3">
          Website Suspended
        </h1>

        <p className="text-[#64748b] text-[15px] leading-relaxed">
          This website has been temporarily suspended.
        </p>

        <div className="h-[1px] bg-[#e5e7eb] my-6" />

        <p className="text-sm text-[#475569] leading-relaxed">
          The hosting service for this website is currently suspended. Please contact the hosting provider or website administrator for further assistance.
        </p>

        <div className="bg-[#f8fafc] rounded-[10px] p-[18px] mt-6 text-left border border-slate-100">
          <div className="text-[11px] text-[#64748b] font-bold tracking-wider mb-2.5 uppercase">
            WEBSITE STATUS
          </div>

          <div className="flex items-center">
            <span className="inline-block bg-[#fff0d9] text-[#b45309] px-3 py-1.5 rounded-full text-xs font-bold">
              ● Suspended
            </span>
            <span className="text-xs text-[#64748b] ml-2">
              Temporarily unavailable
            </span>
          </div>
        </div>

        <div className="mt-7 text-xs text-[#94a3b8] leading-relaxed">
          If you are the website owner, please contact your hosting provider.
          <br /><br />
          Hosting Service Notice
        </div>
      </div>
    </div>
  )
}
