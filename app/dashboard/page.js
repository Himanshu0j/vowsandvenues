'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  FileText,
  Download,
  RefreshCw,
  Phone,
  Mail,
  User,
  ArrowRight,
  LogOut,
  Sparkles,
  Building2,
  XCircle,
  CreditCard,
  MessageSquare
} from 'lucide-react'
import { toast } from 'sonner'
import Navbar from '@/components/Navbar'
import FooterSection from '@/components/FooterSection'
import ErrorBoundary from '@/components/ErrorBoundary'

export default function CustomerDashboardPage() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState('bookings') // 'bookings' | 'meetings' | 'profile'
  const [user, setUser] = useState(null)
  const [bookings, setBookings] = useState([])
  const [meetings, setMeetings] = useState([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  // Profile Form state
  const [profileName, setProfileName] = useState('')
  const [profilePhone, setProfilePhone] = useState('')
  const [profileCity, setProfileCity] = useState('Lucknow')

  const loadDashboardData = async (isManualRefresh = false) => {
    try {
      if (isManualRefresh) setRefreshing(true)
      else setLoading(true)

      const token = localStorage.getItem('vv_auth_token') || localStorage.getItem('auth_token')
      const storedUser = localStorage.getItem('vv_current_user')

      let currentUser = storedUser ? JSON.parse(storedUser) : null

      // Fetch user profile from /api/auth/me if token exists
      if (token) {
        try {
          const meRes = await fetch('/api/auth/me', {
            headers: { Authorization: `Bearer ${token}` }
          })
          if (meRes.ok) {
            const meData = await meRes.json()
            currentUser = meData.user || meData
            setUser(currentUser)
            setProfileName(currentUser.name || '')
            setProfilePhone(currentUser.phone || '')
          }
        } catch (_) {}
      } else {
        // Fallback demo user if not logged in
        if (!currentUser) {
          currentUser = {
            id: 'c_demo_couple',
            name: 'Devika Sharma',
            email: 'devika.wedding@example.com',
            phone: '+91 98765 01234',
            role: 'customer'
          }
        }
      }

      setUser(currentUser)
      setProfileName(currentUser?.name || 'Devika Sharma')
      setProfilePhone(currentUser?.phone || '+91 98765 01234')

      const headers = { 'Content-Type': 'application/json' }
      if (token) headers['Authorization'] = `Bearer ${token}`

      // Fetch Bookings
      try {
        const bookingsRes = await fetch('/api/bookings', { headers })
        if (bookingsRes.ok) {
          const bData = await bookingsRes.json()
          setBookings(Array.isArray(bData) ? bData : [])
        }
      } catch (err) {
        console.error('Error fetching bookings:', err)
      }

      // Fetch Meetings
      try {
        const meetingsRes = await fetch('/api/meetings/my', { headers })
        if (meetingsRes.ok) {
          const mData = await meetingsRes.json()
          setMeetings(Array.isArray(mData) ? mData : [])
        }
      } catch (err) {
        console.error('Error fetching meetings:', err)
      }

      if (isManualRefresh) {
        toast.success('Dashboard refreshed successfully!')
      }

    } catch (err) {
      console.error('Error loading dashboard:', err)
      toast.error('Could not refresh dashboard data.')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    loadDashboardData()
  }, [])

  const handleLogout = () => {
    localStorage.removeItem('vv_auth_token')
    localStorage.removeItem('auth_token')
    localStorage.removeItem('vv_current_user')
    toast.info('Signed out of customer account.')
    router.push('/')
  }

  const handleSaveProfile = (e) => {
    e.preventDefault()
    const updated = {
      ...user,
      name: profileName,
      phone: profilePhone,
      city: profileCity
    }
    setUser(updated)
    localStorage.setItem('vv_current_user', JSON.stringify(updated))
    toast.success('Profile preferences updated successfully!')
  }

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-[#faf7f2] text-stone-900 font-sans selection:bg-amber-200 selection:text-amber-900 flex flex-col justify-between">
        <Navbar />

        {/* Dashboard Header Bar */}
        <div className="bg-gradient-to-r from-[#3b0f1c] via-[#4a1525] to-[#2a0b14] text-white pt-28 pb-10 px-4 sm:px-6 lg:px-8 border-b border-amber-900/30">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-400/30 text-amber-300 text-xs font-semibold uppercase tracking-wider mb-2">
                <ShieldCheck className="w-3.5 h-3.5" /> Customer Account Portal
              </div>
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-serif font-bold text-amber-50">
                Welcome, {user?.name || 'Devika Sharma'}
              </h1>
              <p className="text-stone-300 text-xs sm:text-sm mt-1 font-light">
                Manage your confirmed palace bookings, milestone payments, and 1-to-1 venue owner consultations.
              </p>
            </div>

            <div className="flex items-center gap-2.5 self-start sm:self-auto">
              <button
                type="button"
                onClick={() => loadDashboardData(true)}
                disabled={refreshing}
                className="inline-flex items-center gap-1.5 bg-white/10 hover:bg-white/20 text-white text-xs font-semibold px-3.5 py-2 rounded-xl border border-white/20 transition-colors cursor-pointer"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
                <span>Refresh</span>
              </button>
              <button
                type="button"
                onClick={handleLogout}
                className="inline-flex items-center gap-1.5 bg-red-900/40 hover:bg-red-900/60 text-red-200 text-xs font-semibold px-3.5 py-2 rounded-xl border border-red-700/30 transition-colors cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        </div>

        {/* Navigation Tabs Bar */}
        <div className="bg-white border-b border-stone-200 sticky top-16 z-20 shadow-xs">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
            <div className="flex gap-2 sm:gap-6 overflow-x-auto py-2">
              <button
                type="button"
                onClick={() => setActiveTab('bookings')}
                className={`py-2 px-3 text-xs sm:text-sm font-semibold rounded-lg transition-all cursor-pointer flex items-center gap-2 shrink-0 ${
                  activeTab === 'bookings'
                    ? 'bg-[#4a1525] text-amber-200 shadow-xs'
                    : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
                }`}
              >
                <Building2 className="w-4 h-4" />
                <span>My Bookings</span>
                <span className="text-[10px] bg-amber-500/20 text-amber-900 px-1.5 py-0.2 rounded-full font-bold ml-1">
                  {bookings.length}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('meetings')}
                className={`py-2 px-3 text-xs sm:text-sm font-semibold rounded-lg transition-all cursor-pointer flex items-center gap-2 shrink-0 ${
                  activeTab === 'meetings'
                    ? 'bg-[#4a1525] text-amber-200 shadow-xs'
                    : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
                }`}
              >
                <Phone className="w-4 h-4" />
                <span>My Meetings</span>
                <span className="text-[10px] bg-amber-500/20 text-amber-900 px-1.5 py-0.2 rounded-full font-bold ml-1">
                  {meetings.length}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('profile')}
                className={`py-2 px-3 text-xs sm:text-sm font-semibold rounded-lg transition-all cursor-pointer flex items-center gap-2 shrink-0 ${
                  activeTab === 'profile'
                    ? 'bg-[#4a1525] text-amber-200 shadow-xs'
                    : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
                }`}
              >
                <User className="w-4 h-4" />
                <span>Profile & Preferences</span>
              </button>
            </div>

            <Link
              href="/venues"
              className="hidden sm:inline-flex items-center gap-1.5 text-xs text-amber-800 font-semibold hover:underline"
            >
              Browse More Venues <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Dashboard Main Content Body */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 flex-1 w-full">
          {/* TAB 1: BOOKINGS */}
          {activeTab === 'bookings' && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl font-serif font-bold text-stone-900">My Bookings</h2>
                  <p className="text-stone-600 text-xs">Official reservations secured with token advance payments.</p>
                </div>
              </div>

              {loading ? (
                <div className="text-center py-20">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-600 mx-auto mb-3" />
                  <p className="text-xs text-stone-500">Loading your celebration reservations...</p>
                </div>
              ) : bookings.length === 0 ? (
                <div className="bg-white rounded-2xl border border-stone-200 p-12 text-center shadow-xs">
                  <div className="w-14 h-14 rounded-full bg-amber-50 text-amber-800 flex items-center justify-center mx-auto mb-4">
                    <Building2 className="w-7 h-7" />
                  </div>
                  <h3 className="text-lg font-serif font-bold text-stone-900 mb-2">No PAID + CONFIRMED bookings yet</h3>
                  <p className="text-stone-600 text-xs max-w-md mx-auto mb-6">
                    You have not confirmed any palace or wedding sanctuary bookings yet. Browse our verified heritage collection and pay only 5% to lock your date.
                  </p>
                  <Link
                    href="/venues"
                    className="inline-flex items-center gap-2 bg-gradient-to-r from-[#4a1525] to-[#360e1b] text-amber-200 font-semibold text-xs px-5 py-2.5 rounded-xl shadow-md hover:shadow-lg transition-all"
                  >
                    Explore Venues Catalog <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              ) : (
                <div className="space-y-6">
                  {bookings.map((b) => {
                    const isPaidFull = b.bookingStatus === 'confirmed' && b.paymentStatus === 'paid'
                    const isAdvance = b.paymentStatus === 'advance_paid' || (b.advancePaid && b.advancePaid < b.totalAmount)
                    const isPending = b.bookingStatus === 'pending_verification'

                    return (
                      <div
                        key={b.id}
                        className="bg-white rounded-2xl border border-stone-200/90 shadow-sm hover:shadow-md transition-shadow overflow-hidden"
                      >
                        {/* Booking Card Header */}
                        <div className="bg-stone-50/80 px-6 py-4 border-b border-stone-200/80 flex flex-wrap items-center justify-between gap-3">
                          <div className="flex items-center gap-3">
                            <span className="font-mono text-xs font-bold bg-stone-200 text-stone-800 px-2.5 py-1 rounded-md">
                              {b.bookingNumber || b.id}
                            </span>
                            <span className="text-xs text-stone-500">
                              Booked on {new Date(b.createdAt || Date.now()).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                            </span>
                          </div>

                          <div className="flex items-center gap-2">
                            {isPending && (
                              <span className="inline-flex items-center gap-1 bg-amber-100 text-amber-900 text-xs font-bold px-2.5 py-0.5 rounded-full border border-amber-300">
                                <Clock className="w-3 h-3 text-amber-700" /> Pending UTR Verification
                              </span>
                            )}
                            {isAdvance && !isPending && (
                              <span className="inline-flex items-center gap-1 bg-emerald-100 text-emerald-900 text-xs font-bold px-2.5 py-0.5 rounded-full border border-emerald-300">
                                <CheckCircle2 className="w-3 h-3 text-emerald-700" /> Advance Paid (Slot Confirmed)
                              </span>
                            )}
                            {isPaidFull && (
                              <span className="inline-flex items-center gap-1 bg-emerald-100 text-emerald-900 text-xs font-bold px-2.5 py-0.5 rounded-full border border-emerald-300">
                                <CheckCircle2 className="w-3 h-3 text-emerald-700" /> 100% Paid in Full
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Booking Card Body */}
                        <div className="p-6">
                          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                            {/* Venue & Event Info */}
                            <div className="md:col-span-2">
                              <h4 className="font-serif text-lg font-bold text-stone-900 mb-1">
                                {b.eventName || (b.items && b.items[0] ? b.items[0].name : 'Royal Celebration')}
                              </h4>
                              <div className="flex items-center gap-2 text-xs text-stone-600 mb-3">
                                <MapPin className="w-3.5 h-3.5 text-amber-700 shrink-0" />
                                <span>{b.city || 'Lucknow, Uttar Pradesh'}</span>
                              </div>

                              <div className="grid grid-cols-2 gap-3 text-xs text-stone-700 bg-stone-50 p-3 rounded-xl border border-stone-100">
                                <div>
                                  <span className="text-stone-500 block text-[11px]">Celebration Date:</span>
                                  <span className="font-bold text-stone-900">{b.eventDate}</span>
                                </div>
                                <div>
                                  <span className="text-stone-500 block text-[11px]">Time Slot:</span>
                                  <span className="font-bold text-stone-900 truncate block">{b.timeSlot || 'Full Day'}</span>
                                </div>
                                <div>
                                  <span className="text-stone-500 block text-[11px]">Guest Count:</span>
                                  <span className="font-bold text-stone-900">{b.guestCount || 150} guests</span>
                                </div>
                                <div>
                                  <span className="text-stone-500 block text-[11px]">Services:</span>
                                  <span className="font-bold text-stone-900">{(b.items || []).length || 1} reserved</span>
                                </div>
                              </div>
                            </div>

                            {/* Financial Breakdown */}
                            <div className="md:col-span-2 bg-[#faf7f2] p-4 rounded-xl border border-stone-200/80 flex flex-col justify-between">
                              <div className="space-y-1.5 text-xs">
                                <div className="flex justify-between text-stone-600">
                                  <span>Total Package Amount:</span>
                                  <span className="font-semibold text-stone-900">₹{(b.totalAmount || 0).toLocaleString('en-IN')}</span>
                                </div>
                                <div className="flex justify-between text-emerald-800 font-bold bg-emerald-50 px-2 py-1 rounded">
                                  <span>Advance Paid ({b.advancePercent || 5}%):</span>
                                  <span>₹{(b.advancePaid || 0).toLocaleString('en-IN')}</span>
                                </div>
                                <div className="flex justify-between text-stone-700 font-bold pt-1 border-t border-stone-200">
                                  <span>Remaining Balance:</span>
                                  <span className="text-[#4a1525]">₹{(b.remainingAmount || 0).toLocaleString('en-IN')}</span>
                                </div>
                                {b.balanceDueDate && (
                                  <div className="text-[11px] text-stone-500 italic text-right">
                                    Due 15 days before event ({b.balanceDueDate})
                                  </div>
                                )}
                              </div>

                              <div className="flex gap-2 pt-4 mt-2 border-t border-stone-200">
                                <button
                                  type="button"
                                  onClick={() => toast.success(`GST Tax Invoice for ${b.bookingNumber} downloaded!`)}
                                  className="flex-1 inline-flex items-center justify-center gap-1.5 bg-white border border-stone-300 hover:bg-stone-50 text-stone-800 text-xs font-semibold py-2 px-3 rounded-lg shadow-2xs transition-colors cursor-pointer"
                                >
                                  <FileText className="w-3.5 h-3.5 text-amber-700" />
                                  <span>Invoice</span>
                                </button>
                                <button
                                  type="button"
                                  onClick={() => toast.info('Our Concierge Manager will contact you on WhatsApp regarding your request.')}
                                  className="inline-flex items-center justify-center gap-1.5 bg-white border border-stone-300 hover:bg-stone-50 text-stone-700 text-xs font-semibold py-2 px-3 rounded-lg shadow-2xs transition-colors cursor-pointer"
                                >
                                  <MessageSquare className="w-3.5 h-3.5 text-stone-500" />
                                  <span>Help</span>
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: MEETINGS & CONSULTATIONS */}
          {activeTab === 'meetings' && (
            <div>
              <div className="mb-6">
                <h2 className="text-xl font-serif font-bold text-stone-900">My Consultations & Recce Meetings</h2>
                <p className="text-stone-600 text-xs">Direct 1-to-1 video calls and physical site inspection meetings requested with venue owners.</p>
              </div>

              {meetings.length === 0 ? (
                <div className="bg-white rounded-2xl border border-stone-200 p-12 text-center shadow-xs">
                  <div className="w-14 h-14 rounded-full bg-amber-50 text-amber-800 flex items-center justify-center mx-auto mb-4">
                    <Phone className="w-7 h-7" />
                  </div>
                  <h3 className="text-lg font-serif font-bold text-stone-900 mb-2">No Scheduled Meetings</h3>
                  <p className="text-stone-600 text-xs max-w-md mx-auto mb-6">
                    You have not requested any 1-to-1 meetings with palace coordinators yet. You can request a meeting directly from any venue's page.
                  </p>
                  <Link
                    href="/venues"
                    className="inline-flex items-center gap-2 bg-[#4a1525] text-amber-200 text-xs font-semibold px-4 py-2.5 rounded-xl shadow-xs"
                  >
                    Browse Venues to Request Call <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {meetings.map((m) => (
                    <div key={m.id} className="bg-white rounded-xl border border-stone-200 p-5 shadow-xs">
                      <div className="flex items-start justify-between gap-3 mb-3">
                        <div>
                          <h4 className="font-serif font-bold text-base text-stone-900">{m.venueName}</h4>
                          <span className="text-xs text-stone-500">Ref: {m.id}</span>
                        </div>
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300 uppercase">
                          {m.status || 'Requested'}
                        </span>
                      </div>

                      <div className="space-y-1.5 text-xs text-stone-700 bg-stone-50 p-3 rounded-lg mb-3">
                        <div className="flex justify-between">
                          <span className="text-stone-500">Scheduled Date:</span>
                          <span className="font-semibold text-stone-900">{m.date}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-stone-500">Time:</span>
                          <span className="font-semibold text-stone-900">{m.time} ({m.durationMinutes} mins)</span>
                        </div>
                        {m.message && (
                          <div className="pt-1 text-stone-600 italic">
                            "{m.message}"
                          </div>
                        )}
                      </div>

                      <div className="text-[11px] text-stone-500 flex items-center justify-between">
                        <span>Contact: {m.customerPhone}</span>
                        <span className="text-amber-800 font-semibold">Video Call Link Active</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: PROFILE */}
          {activeTab === 'profile' && (
            <div className="max-w-2xl bg-white rounded-2xl border border-stone-200 p-6 sm:p-8 shadow-xs">
              <h2 className="text-xl font-serif font-bold text-stone-900 mb-1">Customer Profile & Contact</h2>
              <p className="text-stone-600 text-xs mb-6">Update your wedding coordination contact details and primary city preference.</p>

              <form onSubmit={handleSaveProfile} className="space-y-4">
                <div>
                  <label className="text-xs font-semibold text-stone-700 mb-1.5 block">Full Name</label>
                  <input
                    type="text"
                    required
                    value={profileName}
                    onChange={(e) => setProfileName(e.target.value)}
                    className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm focus:outline-none focus:bg-white"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-stone-700 mb-1.5 block">Email Address (Read-only)</label>
                  <input
                    type="email"
                    disabled
                    value={user?.email || 'customer@example.com'}
                    className="w-full bg-stone-100 border border-stone-300 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-stone-500 cursor-not-allowed"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-stone-700 mb-1.5 block">Phone Number for WhatsApp Updates</label>
                  <input
                    type="tel"
                    required
                    value={profilePhone}
                    onChange={(e) => setProfilePhone(e.target.value)}
                    className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm focus:outline-none focus:bg-white"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-stone-700 mb-1.5 block">Preferred Wedding Destination City</label>
                  <select
                    value={profileCity}
                    onChange={(e) => setProfileCity(e.target.value)}
                    className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm focus:outline-none focus:bg-white cursor-pointer"
                  >
                    <option value="Lucknow">Lucknow (Awadh Heritage)</option>
                    <option value="Varanasi">Varanasi (Ghats & Riverfronts)</option>
                    <option value="Jaipur">Jaipur (Royal Havelis & Palaces)</option>
                    <option value="Udaipur">Udaipur (Lakeside Castles)</option>
                    <option value="Delhi NCR">Delhi NCR (Boutique Lawns)</option>
                    <option value="Goa">Goa (Beachside Destination)</option>
                  </select>
                </div>

                <div className="pt-4">
                  <button
                    type="submit"
                    className="bg-[#4a1525] hover:bg-[#5e1b2f] text-amber-200 font-semibold text-xs sm:text-sm px-6 py-2.5 rounded-xl shadow-md transition-colors cursor-pointer"
                  >
                    Save Preferences
                  </button>
                </div>
              </form>
            </div>
          )}
        </main>

        <FooterSection />
      </div>
    </ErrorBoundary>
  )
}
