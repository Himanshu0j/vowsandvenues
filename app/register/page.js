'use client'

import React, { useState, Suspense } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { ShieldCheck, Mail, Lock, User, Phone, ArrowRight, Sparkles, Building2 } from 'lucide-react'
import { toast } from 'sonner'
import Navbar from '@/components/Navbar'
import FooterSection from '@/components/FooterSection'
import ErrorBoundary from '@/components/ErrorBoundary'

function RegisterContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirectPath = searchParams.get('redirect') || '/dashboard'

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState('customer') // 'customer' | 'vendor'
  const [submitting, setSubmitting] = useState(false)

  const handleRegister = async (e) => {
    e.preventDefault()
    try {
      setSubmitting(true)
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, phone, password, role })
      })
      const data = await res.json()
      if (!res.ok) {
        toast.error(data.error || 'Registration failed.')
        return
      }

      if (data.token) {
        localStorage.setItem('vv_auth_token', data.token)
        localStorage.setItem('auth_token', data.token)
      }
      if (data.user) {
        localStorage.setItem('vv_current_user', JSON.stringify(data.user))
      }

      toast.success(`Account created! Welcome, ${name}.`)
      if (role === 'vendor') {
        router.push('/vendor')
      } else {
        router.push(redirectPath)
      }
    } catch (err) {
      console.error('Registration error:', err)
      toast.error('Network error during registration.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="flex-1 flex items-center justify-center pt-28 pb-16 px-4 sm:px-6">
      <div className="max-w-md w-full bg-white rounded-2xl border border-stone-200 shadow-xl p-8">
        <div className="text-center mb-6">
          <span className="inline-flex items-center gap-1 bg-amber-100 text-amber-900 text-[11px] font-bold px-2.5 py-0.5 rounded-full uppercase">
            <Sparkles className="w-3 h-3 text-amber-700" /> Start Your Celebration
          </span>
          <h1 className="text-2xl font-serif font-bold text-stone-900 mt-2">Create Account</h1>
          <p className="text-xs text-stone-600 mt-1">Book heritage palaces and connect directly with verified owners.</p>
        </div>

        {/* Role selector */}
        <div className="grid grid-cols-2 gap-2 mb-5 p-1 bg-stone-100 rounded-xl">
          <button
            type="button"
            onClick={() => setRole('customer')}
            className={`py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
              role === 'customer'
                ? 'bg-white text-stone-900 shadow-xs'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            Couple / Customer
          </button>
          <button
            type="button"
            onClick={() => setRole('vendor')}
            className={`py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
              role === 'vendor'
                ? 'bg-white text-stone-900 shadow-xs'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            Palace / Vendor Owner
          </button>
        </div>

        <form onSubmit={handleRegister} className="space-y-3.5">
          <div>
            <label className="text-xs font-semibold text-stone-700 block mb-1">Full Name</label>
            <div className="relative">
              <User className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
              <input
                type="text"
                required
                placeholder="John Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-stone-50 border border-stone-300 rounded-xl pl-9 pr-3 py-2.5 text-xs focus:outline-none focus:bg-white focus:ring-2 focus:ring-amber-500"
              />
            </div>
          </div>

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
            <label className="text-xs font-semibold text-stone-700 block mb-1">Phone Number</label>
            <div className="relative">
              <Phone className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
              <input
                type="tel"
                required
                placeholder="+91 9876543210"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full bg-stone-50 border border-stone-300 rounded-xl pl-9 pr-3 py-2.5 text-xs focus:outline-none focus:bg-white focus:ring-2 focus:ring-amber-500"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-stone-700 block mb-1">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
              <input
                type="password"
                required
                placeholder="Minimum 6 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-stone-50 border border-stone-300 rounded-xl pl-9 pr-3 py-2.5 text-xs focus:outline-none focus:bg-white focus:ring-2 focus:ring-amber-500"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-white font-semibold text-xs py-3 rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 mt-2"
          >
            {submitting ? 'Creating Account...' : 'Create Account'}
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </form>

        <div className="text-center mt-6 text-xs text-stone-600">
          Already have an account?{' '}
          <Link href={`/login?redirect=${encodeURIComponent(redirectPath)}`} className="text-amber-800 font-bold hover:underline">
            Sign In
          </Link>
        </div>
      </div>
    </div>
  )
}

export default function RegisterPage() {
  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-[#faf7f2] flex flex-col justify-between text-stone-900">
        <Navbar />
        <Suspense fallback={
          <div className="flex-1 flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-600" />
          </div>
        }>
          <RegisterContent />
        </Suspense>
        <FooterSection />
      </div>
    </ErrorBoundary>
  )
}
