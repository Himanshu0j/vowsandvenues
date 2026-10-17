'use client'

import React, { useState, useEffect, use } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  MapPin,
  Users,
  Star,
  ShieldCheck,
  Calendar,
  Clock,
  CheckCircle2,
  Phone,
  Mail,
  ChevronLeft,
  ChevronRight,
  Share2,
  Heart,
  Sparkles,
  ArrowRight,
  X,
  CreditCard,
  QrCode,
  Smartphone,
  Info,
  Check,
  AlertTriangle,
  Building2,
  Utensils,
  Camera,
  Music,
  ArrowLeft
} from 'lucide-react'
import { toast } from 'sonner'
import Navbar from '@/components/Navbar'
import FooterSection from '@/components/FooterSection'
import ErrorBoundary from '@/components/ErrorBoundary'

export default function VenueDetailPage({ params }) {
  // Unwrap params using React.use for Next.js 15
  const unwrappedParams = typeof params?.then === 'function' ? use(params) : params
  const venueId = unwrappedParams?.id

  const router = useRouter()

  const [venue, setVenue] = useState(null)
  const [reviews, setReviews] = useState([])
  const [availability, setAvailability] = useState({ blackoutDates: [], bookedDates: [] })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [activeImageIndex, setActiveImageIndex] = useState(0)

  // Guest count state
  const [guestCount, setGuestCount] = useState(400)

  // Booking Wizard Modal State
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false)
  const [selectedDate, setSelectedDate] = useState('')
  const [selectedSlot, setSelectedSlot] = useState('Full Day (7 AM - Next Day 7 AM)')
  const [customerName, setCustomerName] = useState('')
  const [customerEmail, setCustomerEmail] = useState('')
  const [customerPhone, setCustomerPhone] = useState('')
  const [specialInstructions, setSpecialInstructions] = useState('')
  const [paymentMode, setPaymentMode] = useState('UPI_QR') // 'UPI_QR' | 'GATEWAY'
  const [utrNumber, setUtrNumber] = useState('')
  const [bookingSubmitting, setBookingSubmitting] = useState(false)
  const [bookingSuccess, setBookingSuccess] = useState(null)

  // Meeting Modal State
  const [isMeetingModalOpen, setIsMeetingModalOpen] = useState(false)
  const [meetingDate, setMeetingDate] = useState('')
  const [meetingTime, setMeetingTime] = useState('14:00')
  const [meetingDuration, setMeetingDuration] = useState('15')
  const [meetingMessage, setMeetingMessage] = useState('')
  const [meetingSubmitting, setMeetingSubmitting] = useState(false)
  const [meetingSuccess, setMeetingSuccess] = useState(null)

  // Admin Payment Config State
  const [paymentConfig, setPaymentConfig] = useState(null)

  // Current calendar month for wizard
  const [calendarMonth, setCalendarMonth] = useState(new Date())

  // Fetch venue, reviews, and availability
  useEffect(() => {
    if (!venueId) return
    async function loadData() {
      try {
        setLoading(true)
        setError(null)

        // Fetch venue
        let res = await fetch(`/api/venues/${venueId}`)
        if (!res.ok) {
          res = await fetch(`/api/vendors/${venueId}`)
        }
        if (!res.ok) throw new Error('Venue not found')
        const venueData = await res.json()
        setVenue(venueData)
        setGuestCount(venueData.capacity || 400)

        // Fetch availability
        try {
          const availRes = await fetch(`/api/bookings/availability/${venueId}`)
          if (availRes.ok) {
            const availData = await availRes.json()
            setAvailability(availData)
          }
        } catch (_) {}

        // Fetch reviews
        try {
          const revRes = await fetch(`/api/venues/${venueId}/reviews`)
          if (revRes.ok) {
            const revData = await revRes.json()
            setReviews(Array.isArray(revData) ? revData : [])
          }
        } catch (_) {}

        // Fetch payment config
        try {
          const payRes = await fetch('/api/payments/config')
          if (payRes.ok) {
            const payData = await payRes.json()
            setPaymentConfig(payData)
          }
        } catch (_) {}

        // Check if customer profile in localStorage
        try {
          const storedUser = localStorage.getItem('vv_current_user')
          if (storedUser) {
            const u = JSON.parse(storedUser)
            if (u.name) setCustomerName(u.name)
            if (u.email) setCustomerEmail(u.email)
            if (u.phone) setCustomerPhone(u.phone)
          }
        } catch (_) {}

      } catch (err) {
        console.error('Error loading venue:', err)
        setError('Venue could not be loaded. Please return to catalog.')
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [venueId])

  // Advance percentage (5% as discovered in reference, or config)
  const advancePercent = 5
  const basePrice = Number(venue?.startingPrice || venue?.price || 130000)
  const tax = Math.round(basePrice * 0.18)
  const platformFee = 2500
  const estimatedTotal = basePrice + tax + platformFee
  const advancePayNow = Math.round(estimatedTotal * (advancePercent / 100))
  const remainingBalance = estimatedTotal - advancePayNow

  // Calendar calculations for wizard
  const daysInMonth = (year, month) => new Date(year, month + 1, 0).getDate()
  const firstDayOfMonth = (year, month) => new Date(year, month, 1).getDay()

  const currentYear = calendarMonth.getFullYear()
  const currentMonthIdx = calendarMonth.getMonth()
  const monthName = calendarMonth.toLocaleString('default', { month: 'long', year: 'numeric' })

  const isDateBooked = (dateStr) => {
    return (
      (availability.bookedDates || []).includes(dateStr) ||
      (availability.blackoutDates || []).includes(dateStr)
    )
  }

  // Handle Booking Submission
  const handleConfirmBooking = async (e) => {
    if (e) e.preventDefault()
    if (!selectedDate) {
      toast.error('Please select an OPEN celebration date on the calendar.')
      return
    }
    if (!customerName || !customerEmail || !customerPhone) {
      toast.error('Please fill in your name, email, and phone number.')
      return
    }

    try {
      setBookingSubmitting(true)
      const token = localStorage.getItem('vv_auth_token') || localStorage.getItem('auth_token')

      const bookingPayload = {
        venueId: venue.id,
        venueName: venue.name,
        city: venue.city,
        eventDate: selectedDate,
        timeSlot: selectedSlot,
        guestCount: Number(guestCount),
        userName: customerName,
        userEmail: customerEmail,
        userPhone: customerPhone,
        specialInstructions,
        advancePercent,
        advancePaid: advancePayNow,
        subtotal: basePrice,
        totalAmount: estimatedTotal,
        paymentMethod: paymentMode === 'UPI_QR' ? 'UPI' : 'GATEWAY',
        utrNumber: paymentMode === 'UPI_QR' ? utrNumber : null,
        items: [
          {
            vendorId: venue.id,
            name: `${venue.name} Exclusive Booking`,
            category: 'venues',
            price: basePrice
          }
        ]
      }

      const headers = { 'Content-Type': 'application/json' }
      if (token) headers['Authorization'] = `Bearer ${token}`

      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers,
        body: JSON.stringify(bookingPayload)
      })

      const data = await res.json()

      if (!res.ok) {
        if (res.status === 409) {
          toast.error(data.error || 'This date was just reserved by another couple. Please pick another date.')
        } else if (res.status === 401) {
          toast.info('Please sign in to confirm and record your booking in your dashboard.')
          router.push(`/login?redirect=/venues/${venue.id}`)
        } else {
          toast.error(data.error || 'Booking submission failed. Please try again.')
        }
        return
      }

      setBookingSuccess(data)
      toast.success(`Slot successfully reserved! Booking ID: ${data.bookingNumber || data.id}`)

    } catch (err) {
      console.error('Booking error:', err)
      toast.error('Network error during booking submission. Please try again.')
    } finally {
      setBookingSubmitting(false)
    }
  }

  // Handle Meeting Submission
  const handleRequestMeeting = async (e) => {
    if (e) e.preventDefault()
    if (!meetingDate) {
      toast.error('Please choose a preferred meeting date.')
      return
    }

    try {
      setMeetingSubmitting(true)
      const token = localStorage.getItem('vv_auth_token') || localStorage.getItem('auth_token')

      const headers = { 'Content-Type': 'application/json' }
      if (token) headers['Authorization'] = `Bearer ${token}`

      const res = await fetch('/api/meetings', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          venueId: venue.id,
          venueName: venue.name,
          date: meetingDate,
          time: meetingTime,
          durationMinutes: Number(meetingDuration),
          message: meetingMessage,
          customerName: customerName || 'Valued Customer',
          customerEmail: customerEmail || 'customer@example.com',
          customerPhone: customerPhone || '+91 9876543210'
        })
      })

      const data = await res.json()

      if (!res.ok) {
        if (res.status === 401) {
          toast.info('Please sign in to schedule a 1-to-1 consultation with the owner.')
          router.push(`/login?redirect=/venues/${venue.id}`)
        } else {
          toast.error(data.error || 'Could not schedule meeting.')
        }
        return
      }

      setMeetingSuccess(data)
      toast.success('Meeting request submitted to venue manager!')

    } catch (err) {
      console.error('Meeting error:', err)
      toast.error('Failed to submit meeting request.')
    } finally {
      setMeetingSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#faf7f2] flex flex-col justify-between">
        <Navbar />
        <div className="flex flex-col items-center justify-center py-32">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600 mb-4" />
          <p className="text-stone-600 font-serif text-sm">Loading Royal Palace Specifications...</p>
        </div>
        <FooterSection />
      </div>
    )
  }

  if (error || !venue) {
    return (
      <div className="min-h-screen bg-[#faf7f2] flex flex-col justify-between">
        <Navbar />
        <div className="max-w-xl mx-auto text-center py-32 px-4">
          <div className="w-14 h-14 rounded-full bg-red-100 text-red-700 flex items-center justify-center mx-auto mb-4">
            <X className="w-7 h-7" />
          </div>
          <h2 className="text-2xl font-serif font-bold text-stone-900 mb-2">Venue Not Found</h2>
          <p className="text-stone-600 text-sm mb-6">{error || 'This venue does not exist or has been archived.'}</p>
          <Link
            href="/venues"
            className="inline-flex items-center gap-2 bg-[#4a1525] text-amber-200 px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-[#5e1b2f] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Return to Venues Catalog
          </Link>
        </div>
        <FooterSection />
      </div>
    )
  }

  const images = Array.isArray(venue.images) && venue.images.length > 0 ? venue.images : [venue.image || 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3']
  const upiId = paymentConfig?.upiId || 'vowsandvenues@okhdfcbank'
  const payeeName = paymentConfig?.payeeName || 'Vows and Venues Private Limited'
  const upiQrString = `upi://pay?pa=${upiId}&pn=${encodeURIComponent(payeeName)}&am=${advancePayNow}&cu=INR&tn=Advance-${venue.id.slice(0, 8)}`
  const qrImageSrc = `https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=${encodeURIComponent(upiQrString)}`

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-[#faf7f2] text-stone-900 font-sans selection:bg-amber-200 selection:text-amber-900">
        <Navbar />

        {/* Breadcrumb Bar */}
        <div className="bg-white border-b border-stone-200 pt-24 pb-3 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto flex items-center justify-between text-xs text-stone-500">
            <div className="flex items-center gap-2 overflow-hidden">
              <Link href="/" className="hover:text-amber-700 transition-colors">Home</Link>
              <span>/</span>
              <Link href="/venues" className="hover:text-amber-700 transition-colors">Venues</Link>
              <span>/</span>
              <span className="text-stone-900 font-medium truncate">{venue.name}</span>
            </div>
            <Link
              href="/venues"
              className="inline-flex items-center gap-1.5 text-xs text-amber-800 hover:text-amber-900 font-medium shrink-0 ml-4"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> All Venues
            </Link>
          </div>
        </div>

        {/* Main Venue Profile Container */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-10">
          {/* Header Title Section */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="inline-flex items-center gap-1 bg-amber-100 text-amber-900 text-[11px] font-bold px-2.5 py-0.5 rounded-full border border-amber-300">
                  <ShieldCheck className="w-3.5 h-3.5 text-amber-600" /> Verified Palace
                </span>
                <span className="inline-flex items-center gap-1 text-xs font-bold text-stone-700">
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" /> {(venue.rating || 4.9).toFixed(1)} ({reviews.length || 18} reviews)
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-serif font-bold text-stone-900 tracking-tight">
                {venue.name}
              </h1>
              <div className="flex items-center gap-1.5 text-xs sm:text-sm text-stone-600 mt-1.5">
                <MapPin className="w-4 h-4 text-amber-600 shrink-0" />
                <span>{venue.address || `${venue.city}, Uttar Pradesh, India`}</span>
              </div>
            </div>

            <div className="flex items-center gap-2 self-start md:self-end">
              <button
                onClick={() => {
                  navigator.clipboard.writeText(window.location.href)
                  toast.success('Venue link copied to clipboard!')
                }}
                className="inline-flex items-center gap-1.5 bg-white border border-stone-300 hover:bg-stone-50 text-stone-700 text-xs font-medium px-3.5 py-2 rounded-xl shadow-xs transition-colors cursor-pointer"
              >
                <Share2 className="w-3.5 h-3.5" /> Share
              </button>
            </div>
          </div>

          {/* Photo Gallery Grid */}
          <div className="mb-10">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-3 rounded-2xl overflow-hidden shadow-lg border border-stone-200/80 bg-stone-100">
              {/* Main Large Image */}
              <div className="lg:col-span-3 relative h-72 sm:h-96 md:h-[460px] overflow-hidden group">
                <img
                  src={images[activeImageIndex]}
                  alt={venue.name}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-102"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-60" />
                <div className="absolute bottom-4 left-4 text-white text-xs font-medium bg-black/50 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/20">
                  Photo {activeImageIndex + 1} of {images.length}
                </div>
              </div>

              {/* Side Thumbnails */}
              <div className="hidden lg:flex flex-col gap-3 h-[460px]">
                {images.slice(0, 3).map((img, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setActiveImageIndex(idx)}
                    className={`relative flex-1 overflow-hidden rounded-xl border-2 transition-all cursor-pointer ${
                      activeImageIndex === idx ? 'border-amber-600 shadow-md ring-2 ring-amber-400' : 'border-transparent opacity-80 hover:opacity-100'
                    }`}
                  >
                    <img src={img} alt="Thumbnail" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            </div>

            {/* Mobile Thumbnails Scroll */}
            <div className="flex lg:hidden gap-2 mt-2 overflow-x-auto pb-2">
              {images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImageIndex(idx)}
                  className={`w-16 h-16 shrink-0 rounded-lg overflow-hidden border-2 transition-all cursor-pointer ${
                    activeImageIndex === idx ? 'border-amber-600 ring-2 ring-amber-400' : 'border-transparent opacity-75'
                  }`}
                >
                  <img src={img} alt="Thumbnail" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </div>

          {/* Two-Column Layout: Left Details, Right Sticky Booking Card */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 md:gap-10">
            {/* Left 2 Columns: Specifications, Description, Amenities */}
            <div className="lg:col-span-2 space-y-8">
              {/* About this Venue */}
              <section className="bg-white rounded-2xl p-6 sm:p-8 border border-stone-200 shadow-xs">
                <h2 className="text-xl font-serif font-bold text-stone-900 mb-4 pb-3 border-b border-stone-100">
                  About this venue
                </h2>
                <div className="prose prose-stone text-sm leading-relaxed text-stone-700 whitespace-pre-line font-light">
                  {venue.description || `${venue.name} is a premier luxury celebration sanctuary located in ${venue.city}, engineered to host grand royal weddings, sangeet galas, and receptions with up to ${venue.capacity || 400} guests. The estate features sprawling manicured banquet lawns, an air-conditioned royal ballroom, dedicated luxury suites for bride and groom families, and world-class hospitality infrastructure.`}
                </div>

                {/* Key Metric Highlights */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 pt-6 border-t border-stone-100">
                  <div className="bg-stone-50 p-3.5 rounded-xl border border-stone-200/60">
                    <div className="text-[11px] text-stone-500 font-semibold uppercase">Capacity</div>
                    <div className="text-base font-serif font-bold text-stone-900 mt-0.5">Up to {venue.capacity || 400}</div>
                  </div>
                  <div className="bg-stone-50 p-3.5 rounded-xl border border-stone-200/60">
                    <div className="text-[11px] text-stone-500 font-semibold uppercase">Pricing Basis</div>
                    <div className="text-base font-serif font-bold text-stone-900 mt-0.5">Per Day Slot</div>
                  </div>
                  <div className="bg-stone-50 p-3.5 rounded-xl border border-stone-200/60">
                    <div className="text-[11px] text-stone-500 font-semibold uppercase">Advance Required</div>
                    <div className="text-base font-serif font-bold text-amber-700 mt-0.5">Only 5%</div>
                  </div>
                  <div className="bg-stone-50 p-3.5 rounded-xl border border-stone-200/60">
                    <div className="text-[11px] text-stone-500 font-semibold uppercase">Balance Due</div>
                    <div className="text-base font-serif font-bold text-stone-900 mt-0.5">15 Days Before</div>
                  </div>
                </div>
              </section>

              {/* Amenities & Features */}
              <section className="bg-white rounded-2xl p-6 sm:p-8 border border-stone-200 shadow-xs">
                <h2 className="text-xl font-serif font-bold text-stone-900 mb-4 pb-3 border-b border-stone-100">
                  Amenities & features
                </h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3.5">
                  {(venue.amenities || [
                    'Air-Conditioned Royal Ballroom',
                    'Sprawling Celebration Lawn',
                    'Bridal Preparation Suites',
                    'Groom Family Rooms (8+)',
                    'Two-Track Concert Sound / DJ',
                    'Grand Mandap & Floral Decor',
                    'Valet Parking (200+ Cars)',
                    'Commercial Royal Kitchen',
                    'Full Power Backup Generator',
                    'Security & CCTV Surveillance'
                  ]).map((item, idx) => (
                    <div key={idx} className="flex items-center gap-2.5 text-xs sm:text-sm text-stone-700 font-medium">
                      <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0">
                        <Check className="w-3 h-3 stroke-[3]" />
                      </div>
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </section>

              {/* Catering Packages & Menus */}
              <section className="bg-white rounded-2xl p-6 sm:p-8 border border-stone-200 shadow-xs">
                <h2 className="text-xl font-serif font-bold text-stone-900 mb-2 pb-3 border-b border-stone-100">
                  Catering & Dining Options
                </h2>
                <p className="text-stone-600 text-xs mb-4">
                  Multi-cuisine royal feasts curated by master chefs with live chaat, tandoor, and dessert stations.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="border border-stone-200 rounded-xl p-4 bg-stone-50 hover:border-amber-400 transition-colors">
                    <span className="text-xs font-bold text-stone-500 uppercase tracking-wider">Silver Feast</span>
                    <div className="text-lg font-serif font-bold text-[#4a1525] mt-1">₹650 <span className="text-xs font-normal text-stone-600">/ plate</span></div>
                    <ul className="text-xs text-stone-600 mt-2.5 space-y-1">
                      <li>• 2 Welcome Drinks</li>
                      <li>• 3 Starters (Veg)</li>
                      <li>• 2 Main Curries + Dal</li>
                      <li>• Breads, Rice & 2 Desserts</li>
                    </ul>
                  </div>

                  <div className="border-2 border-amber-500 rounded-xl p-4 bg-amber-50/50 shadow-xs relative">
                    <span className="absolute -top-2.5 right-3 bg-amber-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">Most Popular</span>
                    <span className="text-xs font-bold text-amber-900 uppercase tracking-wider">Gold Royal</span>
                    <div className="text-lg font-serif font-bold text-[#4a1525] mt-1">₹800 <span className="text-xs font-normal text-stone-600">/ plate</span></div>
                    <ul className="text-xs text-stone-600 mt-2.5 space-y-1">
                      <li>• 4 Welcome Mocktails</li>
                      <li>• 5 Starters (Live Counter)</li>
                      <li>• 4 Royal Curries + Paneer</li>
                      <li>• Awadhi Biryani & 3 Desserts</li>
                    </ul>
                  </div>

                  <div className="border border-stone-200 rounded-xl p-4 bg-stone-50 hover:border-amber-400 transition-colors">
                    <span className="text-xs font-bold text-stone-500 uppercase tracking-wider">Platinum Maharaja</span>
                    <div className="text-lg font-serif font-bold text-[#4a1525] mt-1">₹1,100 <span className="text-xs font-normal text-stone-600">/ plate</span></div>
                    <ul className="text-xs text-stone-600 mt-2.5 space-y-1">
                      <li>• Unlimited Premium Mocktails</li>
                      <li>• 8 Gourmet Starters</li>
                      <li>• 6 Curries + Live Chaat Gali</li>
                      <li>• Kulfi Counter & 5 Desserts</li>
                    </ul>
                  </div>
                </div>
              </section>

              {/* Genuine Reviews Section */}
              <section className="bg-white rounded-2xl p-6 sm:p-8 border border-stone-200 shadow-xs">
                <div className="flex items-center justify-between mb-4 pb-3 border-b border-stone-100">
                  <h2 className="text-xl font-serif font-bold text-stone-900">
                    Couple & Family Reviews
                  </h2>
                  <span className="text-xs font-medium text-stone-500">{reviews.length} Verified Feedbacks</span>
                </div>

                {reviews.length === 0 ? (
                  <p className="text-stone-500 text-xs italic py-4">
                    No public reviews published yet for this sanctuary. All bookings are protected by Vows & Venues Escrow Guarantee.
                  </p>
                ) : (
                  <div className="space-y-4">
                    {reviews.map((r, i) => (
                      <div key={i} className="bg-stone-50 p-4 rounded-xl border border-stone-100">
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="font-semibold text-xs text-stone-900">{r.userName || r.author || 'Couple'}</span>
                          <div className="flex items-center text-amber-500 text-xs">
                            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                            <span className="ml-1 text-stone-700 font-bold">{r.rating || 5}</span>
                          </div>
                        </div>
                        <p className="text-stone-600 text-xs leading-relaxed font-light">{r.comment || r.text}</p>
                      </div>
                    ))}
                  </div>
                )}
              </section>
            </div>

            {/* Right Column: Sticky Booking Card (Exact Functional Reference Parity) */}
            <div className="lg:col-span-1">
              <div className="sticky top-28 bg-white rounded-2xl border-2 border-amber-600/30 shadow-xl p-6 overflow-hidden">
                {/* Gold Top Accent */}
                <div className="h-1.5 bg-gradient-to-r from-amber-500 via-amber-600 to-[#4a1525] -mx-6 -mt-6 mb-5" />

                {/* Estimated Total Header */}
                <div className="mb-4">
                  <div className="text-2xl sm:text-3xl font-serif font-bold text-[#4a1525]">
                    ₹{basePrice.toLocaleString('en-IN')}
                  </div>
                  <div className="text-xs text-stone-500 font-medium">estimated base per day</div>
                </div>

                {/* Number of Guests selector */}
                <div className="mb-5 pb-5 border-b border-stone-100">
                  <label className="text-xs font-semibold text-stone-700 mb-1.5 block">
                    Number of guests
                  </label>
                  <div className="flex items-center justify-between bg-stone-50 border border-stone-300 rounded-xl px-3.5 py-2.5">
                    <span className="text-sm font-bold text-stone-900">{guestCount}</span>
                    <span className="text-xs text-stone-500 font-medium">guests</span>
                  </div>
                </div>

                {/* Financial Breakdown (Transparent 5% Advance Calculation) */}
                <div className="space-y-2.5 text-xs text-stone-700 mb-6 bg-stone-50/70 p-3.5 rounded-xl border border-stone-200/80">
                  <div className="flex justify-between">
                    <span>Base Venue Rental</span>
                    <span className="font-medium">₹{basePrice.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between text-stone-500">
                    <span>GST (18%) + Safety Escrow</span>
                    <span>₹{(tax + platformFee).toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between text-stone-900 font-bold pt-2 border-t border-stone-200 text-sm">
                    <span>Estimated Total</span>
                    <span>₹{estimatedTotal.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between text-emerald-800 font-bold bg-emerald-50 p-2 rounded-lg border border-emerald-200">
                    <span>Pay now (5% advance)</span>
                    <span className="text-emerald-900">₹{advancePayNow.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between text-stone-600 text-[11px] pt-1">
                    <span>Remaining (due 15 days before event)</span>
                    <span className="font-semibold text-stone-800">₹{remainingBalance.toLocaleString('en-IN')}</span>
                  </div>
                </div>

                {/* How booking works (4 Steps) */}
                <div className="mb-6 bg-amber-50/60 p-3.5 rounded-xl border border-amber-200/70">
                  <div className="text-xs font-bold text-amber-900 mb-2.5 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-amber-700" /> How booking works
                  </div>
                  <ol className="text-xs space-y-2 text-stone-700">
                    <li className="flex items-start gap-2">
                      <span className="w-4 h-4 rounded-full bg-amber-600 text-white text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">1</span>
                      <span>Select your date & available time slot</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="w-4 h-4 rounded-full bg-amber-600 text-white text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">2</span>
                      <span>Pay only 5% to confirm reservation</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="w-4 h-4 rounded-full bg-amber-600 text-white text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">3</span>
                      <span>Slot gets reserved instantly in database</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="w-4 h-4 rounded-full bg-amber-600 text-white text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">4</span>
                      <span>Pay remaining 15 days before celebration</span>
                    </li>
                  </ol>
                </div>

                {/* Two Action Buttons: Pay 5% & Confirm Slot + Request a Meeting */}
                <div className="space-y-3">
                  <button
                    type="button"
                    onClick={() => {
                      setBookingSuccess(null)
                      setIsBookingModalOpen(true)
                    }}
                    className="w-full bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-white font-semibold text-sm py-3.5 px-4 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    Pay 5% & confirm slot
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setMeetingSuccess(null)
                      setIsMeetingModalOpen(true)
                    }}
                    className="w-full bg-stone-100 hover:bg-stone-200 text-stone-800 font-semibold text-xs py-2.5 px-4 rounded-xl border border-stone-300 transition-colors flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Phone className="w-3.5 h-3.5 text-amber-700" />
                    Request a meeting
                  </button>
                </div>

                {/* Trust Badge */}
                <div className="mt-5 pt-4 border-t border-stone-100 text-center">
                  <div className="text-[11px] text-stone-500 flex items-center justify-center gap-1.5 font-medium">
                    <ShieldCheck className="w-3.5 h-3.5 text-amber-600" />
                    Secure payments via Escrow & Razorpay / UPI
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ------------------------------------------------------------- */}
        {/* BOOKING WIZARD MODAL (Dates, Slot, Guest, Payment)             */}
        {/* ------------------------------------------------------------- */}
        {isBookingModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
            <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-stone-200 relative my-8">
              <button
                type="button"
                onClick={() => setIsBookingModalOpen(false)}
                className="absolute top-4 right-4 text-stone-400 hover:text-stone-700 p-1 rounded-full hover:bg-stone-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>

              {!bookingSuccess ? (
                <div>
                  <div className="mb-4">
                    <span className="text-[10px] font-bold text-amber-700 uppercase tracking-wider bg-amber-100 px-2 py-0.5 rounded-md">
                      Booking Wizard
                    </span>
                    <h3 className="text-xl font-serif font-bold text-stone-900 mt-1">
                      Book {venue.name}
                    </h3>
                    <p className="text-xs text-stone-600">Select your date, time slot, and pay 5% advance to lock your date.</p>
                  </div>

                  <form onSubmit={handleConfirmBooking} className="space-y-4">
                    {/* Month Availability Calendar */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <label className="text-xs font-semibold text-stone-800">
                          1. Select Celebration Date (Marked OPEN)
                        </label>
                        <span className="text-xs text-amber-800 font-bold">{monthName}</span>
                      </div>

                      {/* Mini Month Grid */}
                      <div className="border border-stone-200 rounded-xl p-3 bg-stone-50">
                        <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-bold text-stone-400 mb-1">
                          <span>SU</span><span>MO</span><span>TU</span><span>WE</span><span>TH</span><span>FR</span><span>SA</span>
                        </div>
                        <div className="grid grid-cols-7 gap-1">
                          {Array.from({ length: firstDayOfMonth(currentYear, currentMonthIdx) }).map((_, i) => (
                            <div key={`empty-${i}`} className="h-8" />
                          ))}
                          {Array.from({ length: daysInMonth(currentYear, currentMonthIdx) }).map((_, i) => {
                            const dayNum = i + 1
                            const dayPadded = String(dayNum).padStart(2, '0')
                            const monthPadded = String(currentMonthIdx + 1).padStart(2, '0')
                            const dateStr = `${currentYear}-${monthPadded}-${dayPadded}`
                            const isPast = new Date(dateStr) < new Date(new Date().setHours(0,0,0,0))
                            const booked = isDateBooked(dateStr)
                            const isSelected = selectedDate === dateStr

                            if (isPast || booked) {
                              return (
                                <div
                                  key={dateStr}
                                  className="h-9 rounded-lg flex flex-col items-center justify-center bg-stone-200/60 text-stone-400 text-xs cursor-not-allowed select-none"
                                >
                                  <span>{dayNum}</span>
                                  <span className="text-[8px] uppercase">{booked ? 'BOOKED' : 'PAST'}</span>
                                </div>
                              )
                            }

                            return (
                              <button
                                key={dateStr}
                                type="button"
                                onClick={() => setSelectedDate(dateStr)}
                                className={`h-9 rounded-lg flex flex-col items-center justify-center text-xs font-semibold transition-all cursor-pointer ${
                                  isSelected
                                    ? 'bg-[#4a1525] text-amber-200 shadow-md ring-2 ring-amber-400'
                                    : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-200'
                                }`}
                              >
                                <span>{dayNum}</span>
                                <span className="text-[8px] uppercase font-bold text-emerald-700">OPEN</span>
                              </button>
                            )
                          })}
                        </div>
                      </div>
                      {selectedDate && (
                        <div className="text-xs text-emerald-700 font-semibold mt-1.5 flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Selected Date: {selectedDate}
                        </div>
                      )}
                    </div>

                    {/* Time Slot Selection */}
                    <div>
                      <label className="text-xs font-semibold text-stone-800 mb-1.5 block">
                        2. Time Slot
                      </label>
                      <select
                        value={selectedSlot}
                        onChange={(e) => setSelectedSlot(e.target.value)}
                        className="w-full bg-white border border-stone-300 rounded-xl px-3 py-2 text-xs font-medium text-stone-800 focus:outline-none focus:ring-2 focus:ring-amber-500 cursor-pointer"
                      >
                        <option value="Full Day (7 AM - Next Day 7 AM)">Full Day (7 AM to next day 7 AM - Recommended for Weddings)</option>
                        <option value="Day Slot (7 AM - 4 PM)">Day Slot (7 AM to 4 PM - Mehendi / Haldi)</option>
                        <option value="Night Slot (5 PM - Next Morning)">Night Slot (5 PM onwards - Reception / Sangeet)</option>
                      </select>
                    </div>

                    {/* Customer Contact Information */}
                    <div>
                      <label className="text-xs font-semibold text-stone-800 mb-1.5 block">
                        3. Contact & Couple Details
                      </label>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <input
                          type="text"
                          required
                          placeholder="Full Name (e.g. Rahul Verma)"
                          value={customerName}
                          onChange={(e) => setCustomerName(e.target.value)}
                          className="w-full bg-stone-50 border border-stone-300 rounded-lg px-3 py-2 text-xs focus:outline-none focus:bg-white"
                        />
                        <input
                          type="tel"
                          required
                          placeholder="Phone Number (+91...)"
                          value={customerPhone}
                          onChange={(e) => setCustomerPhone(e.target.value)}
                          className="w-full bg-stone-50 border border-stone-300 rounded-lg px-3 py-2 text-xs focus:outline-none focus:bg-white"
                        />
                      </div>
                      <input
                        type="email"
                        required
                        placeholder="Email for booking voucher & invoice"
                        value={customerEmail}
                        onChange={(e) => setCustomerEmail(e.target.value)}
                        className="w-full bg-stone-50 border border-stone-300 rounded-lg px-3 py-2 text-xs focus:outline-none focus:bg-white mt-2"
                      />
                    </div>

                    {/* Payment Mode Selection (Direct UPI QR vs Gateway) */}
                    <div>
                      <label className="text-xs font-semibold text-stone-800 mb-1.5 block">
                        4. Payment Method for 5% Advance (₹{advancePayNow.toLocaleString('en-IN')})
                      </label>
                      <div className="grid grid-cols-2 gap-2 mb-2">
                        <button
                          type="button"
                          onClick={() => setPaymentMode('UPI_QR')}
                          className={`flex items-center gap-2 p-2.5 rounded-xl border text-xs font-medium cursor-pointer transition-all ${
                            paymentMode === 'UPI_QR'
                              ? 'border-amber-600 bg-amber-50 text-amber-900 font-bold'
                              : 'border-stone-200 bg-white text-stone-700'
                          }`}
                        >
                          <QrCode className="w-4 h-4 text-amber-700" />
                          <span>Direct UPI QR (0% Fee)</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setPaymentMode('GATEWAY')}
                          className={`flex items-center gap-2 p-2.5 rounded-xl border text-xs font-medium cursor-pointer transition-all ${
                            paymentMode === 'GATEWAY'
                              ? 'border-amber-600 bg-amber-50 text-amber-900 font-bold'
                              : 'border-stone-200 bg-white text-stone-700'
                          }`}
                        >
                          <CreditCard className="w-4 h-4 text-amber-700" />
                          <span>Online Cards / NetBanking</span>
                        </button>
                      </div>

                      {paymentMode === 'UPI_QR' && (
                        <div className="bg-stone-50 border border-stone-200 p-3 rounded-xl flex items-center gap-3">
                          <img
                            src={qrImageSrc}
                            alt="Scan UPI QR"
                            className="w-20 h-20 rounded-lg border border-stone-300 bg-white p-1 shrink-0"
                          />
                          <div className="text-[11px] text-stone-600 space-y-1">
                            <div className="font-semibold text-stone-900">Scan & Pay ₹{advancePayNow.toLocaleString('en-IN')}</div>
                            <div>UPI ID: <span className="font-mono text-stone-800 bg-stone-200 px-1 py-0.5 rounded">{upiId}</span></div>
                            <input
                              type="text"
                              placeholder="Enter 12-digit UTR reference after payment..."
                              value={utrNumber}
                              onChange={(e) => setUtrNumber(e.target.value)}
                              className="w-full bg-white border border-stone-300 rounded px-2 py-1 text-xs font-mono mt-1"
                            />
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Submit Button */}
                    <button
                      type="submit"
                      disabled={bookingSubmitting}
                      className="w-full bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-white font-semibold text-sm py-3 rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                    >
                      {bookingSubmitting ? (
                        <span>Reserving slot...</span>
                      ) : (
                        <>
                          <CheckCircle2 className="w-4 h-4" />
                          Pay ₹{advancePayNow.toLocaleString('en-IN')} & Confirm Slot
                        </>
                      )}
                    </button>
                  </form>
                </div>
              ) : (
                /* Booking Success State */
                <div className="text-center py-4">
                  <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto mb-3">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <h4 className="text-xl font-serif font-bold text-stone-900 mb-1">
                    Slot Reserved Successfully!
                  </h4>
                  <p className="text-xs text-stone-600 max-w-sm mx-auto mb-4">
                    Booking #{bookingSuccess.bookingNumber || bookingSuccess.id} for {selectedDate} has been confirmed.
                  </p>

                  <div className="bg-stone-50 border border-stone-200 rounded-xl p-4 text-xs text-left space-y-1.5 mb-5">
                    <div className="flex justify-between">
                      <span className="text-stone-500">Venue:</span>
                      <span className="font-semibold text-stone-800">{venue.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-stone-500">Celebration Date:</span>
                      <span className="font-semibold text-stone-800">{selectedDate}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-stone-500">Advance Paid:</span>
                      <span className="font-semibold text-emerald-800">₹{advancePayNow.toLocaleString('en-IN')}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-stone-500">Remaining Balance:</span>
                      <span className="font-semibold text-stone-800">₹{remainingBalance.toLocaleString('en-IN')} (Due 15 days before)</span>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Link
                      href="/dashboard"
                      className="flex-1 bg-[#4a1525] hover:bg-[#5e1b2f] text-amber-200 font-semibold text-xs py-2.5 rounded-xl shadow-sm text-center"
                    >
                      View in My Dashboard
                    </Link>
                    <button
                      type="button"
                      onClick={() => setIsBookingModalOpen(false)}
                      className="px-4 bg-stone-200 hover:bg-stone-300 text-stone-800 text-xs font-semibold rounded-xl"
                    >
                      Close
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ------------------------------------------------------------- */}
        {/* REQUEST A MEETING MODAL (1-to-1 Venue Owner Consultation)     */}
        {/* ------------------------------------------------------------- */}
        {isMeetingModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
            <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-stone-200 relative">
              <button
                type="button"
                onClick={() => setIsMeetingModalOpen(false)}
                className="absolute top-4 right-4 text-stone-400 hover:text-stone-700 p-1 rounded-full hover:bg-stone-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>

              {!meetingSuccess ? (
                <div>
                  <div className="mb-4">
                    <h3 className="text-xl font-serif font-bold text-stone-900">
                      Request 1-to-1 Meeting
                    </h3>
                    <p className="text-xs text-stone-600 mt-0.5">
                      Request a call or physical recce inspection with the manager of {venue.name}.
                    </p>
                  </div>

                  <form onSubmit={handleRequestMeeting} className="space-y-3.5">
                    <div>
                      <label className="text-xs font-semibold text-stone-700 mb-1 block">Preferred Date</label>
                      <input
                        type="date"
                        required
                        value={meetingDate}
                        onChange={(e) => setMeetingDate(e.target.value)}
                        className="w-full bg-stone-50 border border-stone-300 rounded-lg px-3 py-2 text-xs focus:outline-none focus:bg-white"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-xs font-semibold text-stone-700 mb-1 block">Time</label>
                        <input
                          type="time"
                          required
                          value={meetingTime}
                          onChange={(e) => setMeetingTime(e.target.value)}
                          className="w-full bg-stone-50 border border-stone-300 rounded-lg px-3 py-2 text-xs focus:outline-none focus:bg-white"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-stone-700 mb-1 block">Duration</label>
                        <select
                          value={meetingDuration}
                          onChange={(e) => setMeetingDuration(e.target.value)}
                          className="w-full bg-stone-50 border border-stone-300 rounded-lg px-3 py-2 text-xs focus:outline-none focus:bg-white cursor-pointer"
                        >
                          <option value="15">15 minutes</option>
                          <option value="30">30 minutes</option>
                          <option value="45">45 minutes</option>
                          <option value="60">60 minutes</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-stone-700 mb-1 block">Message / Requirements (Optional)</label>
                      <textarea
                        rows={3}
                        placeholder="Example: I want to discuss catering customization, mandap setup, and parking arrangements..."
                        value={meetingMessage}
                        onChange={(e) => setMeetingMessage(e.target.value)}
                        className="w-full bg-stone-50 border border-stone-300 rounded-lg px-3 py-2 text-xs focus:outline-none focus:bg-white"
                      />
                    </div>

                    <div className="flex gap-2 pt-2">
                      <button
                        type="button"
                        onClick={() => setIsMeetingModalOpen(false)}
                        className="flex-1 bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-semibold py-2.5 rounded-xl border border-stone-300"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={meetingSubmitting}
                        className="flex-1 bg-gradient-to-r from-[#4a1525] to-[#360e1b] hover:from-[#5d1a2f] hover:to-[#4a1525] text-amber-200 text-xs font-semibold py-2.5 rounded-xl shadow-md transition-all cursor-pointer disabled:opacity-50"
                      >
                        {meetingSubmitting ? 'Sending...' : 'Send Request'}
                      </button>
                    </div>
                  </form>
                </div>
              ) : (
                <div className="text-center py-4">
                  <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto mb-3">
                    <CheckCircle2 className="w-7 h-7" />
                  </div>
                  <h4 className="text-lg font-serif font-bold text-stone-900 mb-1">
                    Meeting Request Sent!
                  </h4>
                  <p className="text-xs text-stone-600 mb-4">
                    The venue manager of {venue.name} has been notified. You can track this consultation in your Customer Dashboard.
                  </p>
                  <div className="flex gap-2">
                    <Link
                      href="/dashboard"
                      className="flex-1 bg-[#4a1525] text-amber-200 text-xs font-semibold py-2.5 rounded-xl text-center"
                    >
                      View in Dashboard
                    </Link>
                    <button
                      type="button"
                      onClick={() => setIsMeetingModalOpen(false)}
                      className="px-4 bg-stone-200 text-stone-800 text-xs font-semibold rounded-xl"
                    >
                      Close
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        <FooterSection />
      </div>
    </ErrorBoundary>
  )
}
