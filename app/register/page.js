'use client'

import React, { useState, useRef, Suspense } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import {
  ShieldCheck,
  Mail,
  Lock,
  User,
  Phone,
  ArrowRight,
  Sparkles,
  Building2,
  Camera,
  Upload,
  CheckCircle2,
  RefreshCw,
  AlertCircle,
  MapPin
} from 'lucide-react'
import { toast } from 'sonner'
import Navbar from '@/components/Navbar'
import FooterSection from '@/components/FooterSection'
import ErrorBoundary from '@/components/ErrorBoundary'

const VENDOR_CATEGORIES = [
  { value: 'venues', label: 'Venues / Heritage Palaces & Banquets' },
  { value: 'catering', label: 'Catering & Royal Feasts' },
  { value: 'decor', label: 'Decoration & Mandaps' },
  { value: 'photography', label: 'Photography & Cinema' },
  { value: 'makeup', label: 'Bridal Makeup & Styling' },
  { value: 'music', label: 'DJ, Live Music & Entertainment' },
  { value: 'outfits', label: 'Bridal & Groom Outfits' },
  { value: 'planners', label: 'Wedding & Event Planners' }
]

const POPULAR_CITIES = [
  'Lucknow',
  'Delhi NCR',
  'Jaipur',
  'Udaipur',
  'Bengaluru',
  'Hyderabad',
  'Mumbai',
  'Goa',
  'Chandigarh'
]

function compressImageFile(file, maxWidth = 900, maxHeight = 900, quality = 0.75) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      const img = new Image()
      img.onload = () => {
        let width = img.width
        let height = img.height

        if (width > maxWidth || height > maxHeight) {
          if (width > height) {
            height = Math.round((height * maxWidth) / width)
            width = maxWidth
          } else {
            width = Math.round((width * maxHeight) / height)
            height = maxHeight
          }
        }

        const canvas = document.createElement('canvas')
        canvas.width = width
        canvas.height = height
        const ctx = canvas.getContext('2d')
        ctx.drawImage(img, 0, 0, width, height)
        const compressedDataUrl = canvas.toDataURL('image/jpeg', quality)
        resolve(compressedDataUrl)
      }
      img.onerror = reject
      img.src = e.target.result
    }
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

function RegisterContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirectPath = searchParams.get('redirect') || '/dashboard'

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState('customer') // 'customer' | 'vendor'
  const [businessName, setBusinessName] = useState('')
  const [category, setCategory] = useState('venues')
  const [city, setCity] = useState('Lucknow')
  const [verificationPhoto, setVerificationPhoto] = useState(null)
  const [compressing, setCompressing] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [draft, setDraft] = useState(null)

  const cameraInputRef = useRef(null)
  const fileInputRef = useRef(null)

  React.useEffect(() => {
    try {
      const d = sessionStorage.getItem('vv_booking_draft')
      if (d) setDraft(JSON.parse(d))
    } catch (_) {}
  }, [])

  const handlePhotoSelect = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    try {
      setCompressing(true)
      const compressed = await compressImageFile(file)
      setVerificationPhoto(compressed)
      toast.success('On-site verification photo captured successfully!')
    } catch (err) {
      console.error(err)
      toast.error('Failed to process image. Please try again.')
    } finally {
      setCompressing(false)
    }
  }

  const handleRegister = async (e) => {
    e.preventDefault()
    if (role === 'vendor' && !verificationPhoto) {
      toast.error('कृपया वेरिफिकेशन के लिए अपने वेन्यू / प्रतिष्ठान के साथ फोटो अपलोड या क्लिक करें।')
      return
    }

    try {
      setSubmitting(true)
      const payload = {
        name,
        email,
        phone,
        password,
        role,
        ...(role === 'vendor' && {
          businessName: businessName.trim() || name,
          category,
          city,
          verificationSelfie: verificationPhoto
        })
      }

      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
      const data = await res.json()
      if (!res.ok) {
        toast.error(data.error || 'Registration failed.')
        return
      }

      if (data.token) {
        localStorage.setItem('vv_auth_token', data.token)
        localStorage.setItem('auth_token', data.token)
        localStorage.setItem('vv_token', data.token)
      }
      if (data.user) {
        localStorage.setItem('vv_current_user', JSON.stringify(data.user))
        localStorage.setItem('vv_user', JSON.stringify(data.user))
      }

      toast.success(
        role === 'vendor'
          ? `Vendor account created! Verification is pending review.`
          : `Account created! Welcome, ${name}.`
      )

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
      <div className={`w-full bg-white rounded-2xl border border-stone-200 shadow-xl p-6 sm:p-8 transition-all ${
        role === 'vendor' ? 'max-w-xl' : 'max-w-md'
      }`}>
        <div className="text-center mb-6">
          <span className="inline-flex items-center gap-1 bg-amber-100 text-amber-900 text-[11px] font-bold px-2.5 py-0.5 rounded-full uppercase">
            <Sparkles className="w-3 h-3 text-amber-700" /> Start Your Celebration
          </span>
          <h1 className="text-2xl font-serif font-bold text-stone-900 mt-2">
            {role === 'vendor' ? 'Register As Verified Partner' : 'Create Account'}
          </h1>
          <p className="text-xs text-stone-600 mt-1">
            {role === 'vendor'
              ? 'List your heritage venue, banquet, or luxury services with direct bookings.'
              : 'Book heritage palaces and connect directly with verified owners.'}
          </p>
        </div>

        {draft && (
          <div className="mb-5 p-3.5 bg-amber-50 border border-amber-300 rounded-xl flex items-start gap-2.5 text-xs text-amber-900">
            <Sparkles className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold">Pending Reservation Draft:</span>
              <p className="text-[11px] text-amber-800 mt-0.5">
                Create an account to complete your reservation for <strong>{draft.venueName}</strong> {draft.selectedDate ? `on ${draft.selectedDate}` : ''}.
              </p>
            </div>
          </div>
        )}

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

        <form onSubmit={handleRegister} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="text-xs font-semibold text-stone-700 block mb-1">
                {role === 'vendor' ? 'Owner / Manager Name' : 'Full Name'}
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
                <input
                  type="text"
                  required
                  placeholder="e.g. Vikramaditya Singh"
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
                  placeholder="owner@heritagepalace.in"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-stone-50 border border-stone-300 rounded-xl pl-9 pr-3 py-2.5 text-xs focus:outline-none focus:bg-white focus:ring-2 focus:ring-amber-500"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
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
          </div>

          {/* VENDOR-SPECIFIC DETAILS & MANDATORY ON-SITE VERIFICATION PHOTO */}
          {role === 'vendor' && (
            <div className="space-y-4 pt-2 border-t border-stone-200">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="text-xs font-semibold text-stone-700 block mb-1">
                    Business / Venue Name
                  </label>
                  <div className="relative">
                    <Building2 className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
                    <input
                      type="text"
                      required
                      placeholder="e.g. Royal Awadh Heritage Haveli"
                      value={businessName}
                      onChange={(e) => setBusinessName(e.target.value)}
                      className="w-full bg-stone-50 border border-stone-300 rounded-xl pl-9 pr-3 py-2.5 text-xs focus:outline-none focus:bg-white focus:ring-2 focus:ring-amber-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-stone-700 block mb-1">
                    Category
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3 py-2.5 text-xs focus:outline-none focus:bg-white focus:ring-2 focus:ring-amber-500"
                  >
                    {VENDOR_CATEGORIES.map(c => (
                      <option key={c.value} value={c.value}>{c.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-stone-700 block mb-1">
                  Primary Operating City
                </label>
                <div className="relative">
                  <MapPin className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
                  <select
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full bg-stone-50 border border-stone-300 rounded-xl pl-9 pr-3 py-2.5 text-xs focus:outline-none focus:bg-white focus:ring-2 focus:ring-amber-500"
                  >
                    {POPULAR_CITIES.map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* MANDATORY ON-SITE VERIFICATION PHOTO */}
              <div className="p-4 bg-gradient-to-br from-amber-50 to-orange-50/40 rounded-2xl border-2 border-amber-300/80 space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-amber-700 shrink-0" />
                    <div>
                      <h4 className="font-serif font-bold text-stone-900 text-sm">
                        On-Site Verification Photo (वेरिफिकेशन फोटो)
                      </h4>
                      <p className="text-[11px] text-stone-600 mt-0.5">
                        Mandatory KYC: कृपया अपने वेन्यू या प्रतिष्ठान के सामने खड़े होकर फोटो क्लिक करें ताकि एडमिन आपकी लोकेशन और ओनरशिप वेरीफाई कर सके।
                      </p>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-wider bg-rose-100 text-rose-800 px-2 py-0.5 rounded-full border border-rose-300 shrink-0">
                    Mandatory
                  </span>
                </div>

                {/* Hidden Native File & Camera Inputs */}
                <input
                  ref={cameraInputRef}
                  type="file"
                  accept="image/*"
                  capture="environment"
                  className="hidden"
                  onChange={handlePhotoSelect}
                />
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handlePhotoSelect}
                />

                {verificationPhoto ? (
                  <div className="p-3 bg-white rounded-xl border border-stone-200 flex flex-col sm:flex-row items-center gap-3">
                    <img
                      src={verificationPhoto}
                      alt="Verification on-site"
                      className="w-24 h-24 sm:w-28 sm:h-28 rounded-lg object-cover border border-amber-300 shadow-sm"
                    />
                    <div className="flex-1 text-center sm:text-left space-y-1.5">
                      <div className="flex items-center justify-center sm:justify-start gap-1 text-emerald-700 font-bold text-xs">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        <span>On-Site Photo Captured & Compressed</span>
                      </div>
                      <p className="text-[10px] text-stone-500">
                        Ready to submit with your partner registration. Admin team will audit this photo within 24 hours.
                      </p>
                      <div className="flex items-center justify-center sm:justify-start gap-2 pt-1">
                        <button
                          type="button"
                          onClick={() => cameraInputRef.current?.click()}
                          className="px-2.5 py-1 text-[11px] font-semibold bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-lg flex items-center gap-1"
                        >
                          <RefreshCw className="w-3 h-3" /> Re-take
                        </button>
                        <button
                          type="button"
                          onClick={() => setVerificationPhoto(null)}
                          className="px-2.5 py-1 text-[11px] font-semibold text-rose-600 hover:bg-rose-50 rounded-lg"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <button
                      type="button"
                      disabled={compressing}
                      onClick={() => cameraInputRef.current?.click()}
                      className="p-3.5 rounded-xl border-2 border-dashed border-amber-400 bg-white hover:bg-amber-50/70 transition-all flex items-center justify-center gap-2 cursor-pointer text-xs font-bold text-amber-900"
                    >
                      <Camera className="w-4 h-4 text-amber-700" />
                      <span>{compressing ? 'Processing...' : 'Click Live Camera Photo'}</span>
                    </button>

                    <button
                      type="button"
                      disabled={compressing}
                      onClick={() => fileInputRef.current?.click()}
                      className="p-3.5 rounded-xl border-2 border-dashed border-stone-300 bg-white hover:bg-stone-50 transition-all flex items-center justify-center gap-2 cursor-pointer text-xs font-bold text-stone-700"
                    >
                      <Upload className="w-4 h-4 text-stone-500" />
                      <span>Upload from Device</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={submitting || compressing}
            className="w-full bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-white font-semibold text-xs py-3 rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 mt-2"
          >
            {submitting ? 'Creating Account & Submitting...' : role === 'vendor' ? 'Submit Partner Application' : 'Create Account'}
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
