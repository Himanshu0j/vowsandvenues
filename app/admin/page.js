'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function AdminRedirectPage() {
  const router = useRouter()

  useEffect(() => {
    router.replace('/?tab=admin_portal')
  }, [router])

  return (
    <div className="min-h-screen bg-[#fcf8f2] flex flex-col items-center justify-center p-6 text-center">
      <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#4a1525] to-[#20050e] text-[#c5a059] flex items-center justify-center font-serif text-2xl font-bold shadow-xl border border-amber-300/40 mb-4 animate-bounce">
        V
      </div>
      <h1 className="font-serif text-2xl font-bold text-[#1c1917] mb-2">Opening Admin Operations Console...</h1>
      <p className="text-xs text-[#78716c] max-w-sm">
        Redirecting you to the Vows &amp; Venues Operations Admin Suite.
      </p>
    </div>
  )
}
