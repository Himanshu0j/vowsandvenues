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
  const [draft, setDraft] = useState(null)

  React.useEffect(() => {
    try {
      const d = sessionStorage.getItem('vv_booking_draft')
      if (d) setDraft(JSON.parse(d))
    } catch (_) {}
  }, [])

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

  const exchangeGoogleCredential = async (credential) => {
    try {
      setSubmitting(true)
      const res = await fetch('/api/auth/google', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ credential, role: 'customer' })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data?.error || 'Google sign-in failed')
      if (data.token) {
        localStorage.setItem('vv_auth_token', data.token)
        localStorage.setItem('auth_token', data.token)
        localStorage.setItem('vv_token', data.token)
      }
      if (data.user) {
        localStorage.setItem('vv_current_user', JSON.stringify(data.user))
        localStorage.setItem('vv_user', JSON.stringify(data.user))
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
      toast.error(err.message || 'Google sign-in failed')
    } finally {
      setSubmitting(false)
    }
  }

  const handleGoogleLogin = async () => {
    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || '833576938813-6rqpe3vsep88q7ktpin19kjba9v6mm0e.apps.googleusercontent.com'
    try {
      await new Promise((resolve, reject) => {
        if (typeof window === 'undefined') return reject(new Error('no window'))
        if (window.google?.accounts?.id) return resolve()
        const existing = document.getElementById('vv-gis-script')
        if (existing) { existing.addEventListener('load', () => resolve()); return }
        const s = document.createElement('script')
        s.id = 'vv-gis-script'
        s.src = 'https://accounts.google.com/gsi/client'
        s.async = true; s.defer = true
        s.onload = () => resolve()
        s.onerror = () => reject(new Error('Failed to load Google sign-in'))
        document.head.appendChild(s)
      })

      window.google.accounts.id.initialize({
        client_id: clientId,
        callback: (resp) => {
          if (resp?.credential) exchangeGoogleCredential(resp.credential)
          else toast.error('Google did not return a credential')
        },
        auto_select: false,
        ux_mode: 'popup'
      })
      window.google.accounts.id.prompt()
    } catch (err) {
      toast.error(err.message || 'Google sign-in failed')
    }
  }

  React.useEffect(() => {
    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || '833576938813-6rqpe3vsep88q7ktpin19kjba9v6mm0e.apps.googleusercontent.com'
    if (!clientId) return
    let cancelled = false
    const initGis = () => {
      if (cancelled || !window.google?.accounts?.id) return
      try {
        window.google.accounts.id.initialize({
          client_id: clientId,
          callback: (resp) => {
            if (resp?.credential) exchangeGoogleCredential(resp.credential)
            else toast.error('Google did not return a credential')
          },
          auto_select: false,
          ux_mode: 'popup'
        })
        const container = document.getElementById('login-google-btn-container')
        if (container) {
          container.innerHTML = ''
          window.google.accounts.id.renderButton(container, {
            theme: 'outline',
            size: 'large',
            width: 380,
            text: 'continue_with',
            shape: 'rectangular',
            logo_alignment: 'left'
          })
        }
      } catch (_) {}
    }
    if (window.google?.accounts?.id) {
      setTimeout(initGis, 60)
    } else {
      const s = document.createElement('script')
      s.id = 'vv-gis-script'
      s.src = 'https://accounts.google.com/gsi/client'
      s.async = true; s.defer = true
      s.onload = () => setTimeout(initGis, 60)
      document.head.appendChild(s)
    }
    return () => { cancelled = true }
  }, [])

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

        {draft && (
          <div className="mb-5 p-3.5 bg-amber-50 border border-amber-300 rounded-xl flex items-start gap-2.5 text-xs text-amber-900">
            <Sparkles className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold">Pending Reservation Draft:</span>
              <p className="text-[11px] text-amber-800 mt-0.5">
                Sign in to complete your reservation for <strong>{draft.venueName}</strong> {draft.selectedDate ? `on ${draft.selectedDate}` : ''}.
              </p>
            </div>
          </div>
        )}

        {/* Google Sign In */}
        <div id="login-google-btn-container" className="mb-4 flex items-center justify-center min-h-[44px]">
          <button
            type="button"
            disabled={submitting}
            onClick={handleGoogleLogin}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-stone-200 hover:border-amber-400 hover:bg-stone-50 text-stone-800 font-semibold text-xs transition-all disabled:opacity-50"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Continue with Google
          </button>
        </div>

        <div className="flex items-center gap-3 my-4">
          <div className="flex-1 h-px bg-stone-200"></div>
          <span className="text-[10px] font-semibold text-stone-500 uppercase tracking-widest">or with email</span>
          <div className="flex-1 h-px bg-stone-200"></div>
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
