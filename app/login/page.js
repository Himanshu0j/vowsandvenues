'use client'

import React, { useState, Suspense } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { ShieldCheck, Mail, Lock, ArrowRight, Sparkles, Building2, User } from 'lucide-react'
import { toast } from 'sonner'
import Navbar from '@/components/Navbar'
import FooterSection from '@/components/FooterSection'
import ErrorBoundary from '@/components/ErrorBoundary'

function LoginContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirectPath = searchParams.get('redirect') || '/dashboard'

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const handleLogin = async (e) => {
    e.preventDefault()
    try {
      setSubmitting(true)
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      })
      const data = await res.json()
      if (!res.ok) {
        toast.error(data.error || 'Invalid email or password.')
        return
      }

      if (data.token) {
        localStorage.setItem('vv_auth_token', data.token)
        localStorage.setItem('auth_token', data.token)
      }
      if (data.user) {
        localStorage.setItem('vv_current_user', JSON.stringify(data.user))
      }

      toast.success(`Welcome back, ${data.user?.name || 'Customer'}!`)
      if (data.user?.role === 'admin' || data.user?.role === 'super_admin') {
        router.push('/admin')
      } else if (data.user?.role === 'vendor') {
        router.push('/vendor')
      } else {
        router.push(redirectPath)
      }
    } catch (err) {
      console.error('Login error:', err)
      toast.error('Network error during login.')
    } finally {
      setSubmitting(false)
    }
  }

  const fillCustomerDemo = () => {
    setEmail('devika.wedding@example.com')
    setPassword('Customer2026!')
  }

  const fillAdminDemo = () => {
    setEmail('admin@vowsandvenues.com')
    setPassword('RoyalAdmin2026!')
  }

  return (
    <div className="flex-1 flex items-center justify-center pt-28 pb-16 px-4 sm:px-6">
      <div className="max-w-md w-full bg-white rounded-2xl border border-stone-200 shadow-xl p-8">
        <div className="text-center mb-6">
          <span className="inline-flex items-center gap-1 bg-amber-100 text-amber-900 text-[11px] font-bold px-2.5 py-0.5 rounded-full uppercase">
            <Sparkles className="w-3 h-3 text-amber-700" /> Vows & Venues Account
          </span>
          <h1 className="text-2xl font-serif font-bold text-stone-900 mt-2">Sign In</h1>
          <p className="text-xs text-stone-600 mt-1">Access your bookings, invoices, and royal venue consultations.</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-stone-700 block mb-1">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
              <input
                type="email"
                required
                placeholder="m@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-stone-50 border border-stone-300 rounded-xl pl-9 pr-3 py-2.5 text-xs focus:outline-none focus:bg-white focus:ring-2 focus:ring-amber-500"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-semibold text-stone-700">Password</label>
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-stone-50 border border-stone-300 rounded-xl pl-9 pr-3 py-2.5 text-xs focus:outline-none focus:bg-white focus:ring-2 focus:ring-amber-500"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-white font-semibold text-xs py-3 rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {submitting ? 'Authenticating...' : 'Sign In'}
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </form>

        {/* Quick Demo Autofill helper */}
        <div className="mt-6 pt-5 border-t border-stone-100">
          <span className="text-[11px] font-semibold text-stone-500 block text-center mb-2">Quick Staging Demo Fill</span>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={fillCustomerDemo}
              className="bg-stone-50 hover:bg-stone-100 border border-stone-200 text-stone-700 text-[11px] font-semibold py-1.5 px-2 rounded-lg"
            >
              Customer Demo
            </button>
            <button
              type="button"
              onClick={fillAdminDemo}
              className="bg-stone-50 hover:bg-stone-100 border border-stone-200 text-stone-700 text-[11px] font-semibold py-1.5 px-2 rounded-lg"
            >
              Admin Demo
            </button>
          </div>
        </div>

        <div className="text-center mt-6 text-xs text-stone-600">
          Don't have an account?{' '}
          <Link href={`/register?redirect=${encodeURIComponent(redirectPath)}`} className="text-amber-800 font-bold hover:underline">
            Create Account
          </Link>
        </div>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-[#faf7f2] flex flex-col justify-between text-stone-900">
        <Navbar />
        <Suspense fallback={
          <div className="flex-1 flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-600" />
          </div>
        }>
          <LoginContent />
        </Suspense>
        <FooterSection />
      </div>
    </ErrorBoundary>
  )
}
