'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import {
  MapPin,
  Heart,
  Bell,
  Sparkles,
  ChevronDown,
  User,
  ShieldCheck,
  Building2,
  CalendarDays,
  Menu,
  X,
  Compass,
  LogOut,
  Calendar,
  Calculator
} from 'lucide-react'

export default function Navbar({
  activeTab,
  setActiveTab,
  userRole,
  setUserRole,
  selectedCity,
  setSelectedCity,
  cities = [],
  wishlistCount = 0,
  notifications = [],
  budgetCount = 0,
  currentUser = null,
  onOpenAuth,
  onLogout,
  announcement = null
}) {
  const [showProfileMenu, setShowProfileMenu] = useState(false)
  const [showNotifications, setShowNotifications] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const unreadCount = notifications.filter(n => !n.read).length

  return (
    <>
      <header className="sticky top-0 z-50 bg-[#FAF7F2]/95 backdrop-blur-md border-b border-stone-200/80 shadow-xs transition-all overflow-x-clip">
      {/* 1. TOP EDITORIAL ANNOUNCEMENT BANNER */}
      {announcement?.enabled && (
        <div className="bg-[#1C0E13] text-[#FAF5EB] text-[11px] sm:text-xs py-1.5 px-4 text-center font-normal tracking-wide flex items-center justify-center gap-2 border-b border-white/10">
          <span className="truncate max-w-[240px] sm:max-w-none">{announcement.text}</span>
          <button
            onClick={() => setActiveTab('explore')}
            className="text-amber-200 hover:text-white font-medium underline underline-offset-2 ml-1 cursor-pointer transition-colors shrink-0 whitespace-nowrap"
          >
            Explore &rarr;
          </button>
        </div>
      )}

      {/* 2. MAIN NAVIGATION BAR */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-18">
          
          {/* BRAND LOGO */}
          <div
            onClick={() => { setActiveTab('home'); setMobileMenuOpen(false); }}
            className="flex items-center gap-2.5 sm:gap-3 cursor-pointer group select-none shrink-0"
          >
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-[#2D0B16] text-[#C5A059] flex items-center justify-center border border-[#C5A059]/30 shadow-xs group-hover:scale-105 transition-all shrink-0">
              <span className="font-serif font-bold text-base sm:text-lg leading-none text-amber-200">V</span>
            </div>
            <div>
              <div className="font-serif text-lg sm:text-xl font-bold tracking-tight text-[#1c1917] flex items-center gap-1.5">
                <span>Vows &amp; Venues</span>
              </div>
              <div className="hidden sm:block text-[9px] uppercase font-semibold tracking-[0.2em] text-[#78716c] -mt-0.5">
                Luxury Indian Event Marketplace
              </div>
            </div>
          </div>

          {/* REFINED CITY SELECTOR */}
          <div className="hidden xl:flex items-center bg-stone-100/90 hover:bg-stone-200/80 transition-all rounded-full px-3.5 py-1.5 border border-stone-200 text-xs font-medium text-stone-700">
            <MapPin className="w-3.5 h-3.5 text-[#2D0B16] mr-1.5" />
            <span className="text-stone-500 mr-1">City:</span>
            <select
              value={selectedCity}
              onChange={(e) => setSelectedCity(e.target.value)}
              className="bg-transparent text-[#1c1917] font-semibold focus:outline-none cursor-pointer pr-1"
            >
              {cities.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          {/* DESKTOP NAV LINKS */}
          <nav className="hidden lg:flex items-center gap-1 xl:gap-1.5 text-[12px] xl:text-[13px] font-medium text-[#44403c]">
            <button
              onClick={() => setActiveTab('home')}
              className={`px-3 py-1.5 rounded-full transition-all ${
                activeTab === 'home'
                  ? 'text-[#2D0B16] bg-stone-200/75 font-semibold'
                  : 'hover:text-[#1c1917] hover:bg-stone-100/80'
              }`}
            >
              Home
            </button>
            <Link
              href="/venues"
              className="px-3 py-1.5 rounded-full transition-all hover:text-[#1c1917] hover:bg-stone-100/80 font-medium"
            >
              Browse Venues
            </Link>
            <Link
              href="/how-it-works"
              className="px-3 py-1.5 rounded-full transition-all hover:text-[#1c1917] hover:bg-stone-100/80 font-medium"
            >
              How it Works
            </Link>
            <Link
              href="/pricing"
              className="px-3 py-1.5 rounded-full transition-all hover:text-[#1c1917] hover:bg-stone-100/80 font-medium"
            >
              Pricing
            </Link>
            <button
              onClick={() => setActiveTab('builder')}
              className={`px-3 py-1.5 rounded-full relative transition-all flex items-center gap-1.5 ${
                activeTab === 'builder'
                  ? 'text-[#2D0B16] bg-stone-200/75 font-semibold'
                  : 'hover:text-[#1c1917] hover:bg-stone-100/80'
              }`}
            >
              <span>Build My Event</span>
              {budgetCount > 0 && (
                <span className="bg-[#2D0B16] text-amber-100 text-[10px] font-bold px-1.5 py-0.2 rounded-full shadow-xs">
                  {budgetCount}
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveTab('planning_toolkit')}
              className={`px-3 py-1.5 rounded-full relative transition-all flex items-center gap-1.5 ${
                activeTab === 'planning_toolkit'
                  ? 'text-[#2D0B16] bg-stone-200/75 font-semibold'
                  : 'hover:text-[#1c1917] hover:bg-stone-100/80'
              }`}
            >
              <span>Wedding Toolkit</span>
              <span className="hidden xl:inline text-[9px] font-semibold uppercase tracking-wider text-stone-500 bg-stone-200/70 px-1.5 py-0.5 rounded-md">
                Budget &amp; RSVP
              </span>
            </button>
          </nav>

          {/* RIGHT ACTION BUTTONS */}
          <div className="flex items-center gap-2 sm:gap-2.5 xl:gap-3 shrink-0">
            {/* Wishlist Button */}
            <button
              onClick={() => setActiveTab('wishlist')}
              title="Saved Wishlist"
              className={`hidden sm:flex p-2 rounded-full border relative transition-all active:scale-95 ${
                activeTab === 'wishlist'
                  ? 'bg-rose-50 text-rose-600 border-rose-200 shadow-xs'
                  : 'bg-stone-100/80 hover:bg-stone-200/70 border-stone-200 text-stone-700'
              }`}
            >
              <Heart className={`w-4 h-4 ${wishlistCount > 0 ? 'fill-rose-500 text-rose-500' : ''}`} />
              {wishlistCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-rose-600 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center shadow-xs">
                  {wishlistCount}
                </span>
              )}
            </button>

            {/* Notifications Bell */}
            <div className="relative hidden sm:block">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                title="Notifications"
                className="p-2 rounded-full border border-stone-200 bg-stone-100/80 hover:bg-stone-200/70 text-stone-700 relative transition-all"
              >
                <Bell className="w-4 h-4" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-[#C5A059] ring-2 ring-white"></span>
                )}
              </button>

              {/* Notifications Dropdown */}
              {showNotifications && (
                <div className="absolute right-0 mt-3 w-80 sm:w-96 bg-white rounded-2xl shadow-xl border border-stone-200 p-4 z-50 animate-in fade-in slide-in-from-top-2">
                  <div className="flex items-center justify-between pb-3 border-b border-stone-100">
                    <h4 className="font-serif font-bold text-sm text-[#1c1917] flex items-center gap-2">
                      <Bell className="w-4 h-4 text-[#2D0B16]" /> Notifications
                    </h4>
                    <span className="text-[11px] text-stone-500">{notifications.length} alerts</span>
                  </div>
                  <div className="divide-y divide-stone-100 max-h-72 overflow-y-auto mt-2">
                    {notifications.length === 0 ? (
                      <div className="py-6 text-center text-xs text-stone-400">
                        No recent notifications
                      </div>
                    ) : (
                      notifications.map(n => (
                        <div key={n.id} className={`py-2.5 px-2 text-xs rounded-lg ${n.read ? 'opacity-70' : 'bg-[#faf8f5]'}`}>
                          <div className="font-semibold text-stone-900 mb-0.5">{n.title}</div>
                          <div className="text-stone-600 leading-relaxed text-[11px]">{n.message}</div>
                        </div>
                      ))
                    )}
                  </div>
                  <button
                    onClick={() => setShowNotifications(false)}
                    className="w-full mt-3 py-1.5 text-center text-xs text-[#2D0B16] font-semibold hover:bg-stone-50 rounded-lg transition-colors cursor-pointer"
                  >
                    Close
                  </button>
                </div>
              )}
            </div>

            {/* USER ACCOUNT / ROLE MENU */}
            {currentUser ? (
              <div className="relative">
                <button
                  onClick={() => setShowProfileMenu(!showProfileMenu)}
                  className="flex items-center gap-1.5 sm:gap-2 pl-1.5 pr-2.5 sm:pr-3 py-1 sm:py-1.5 rounded-full bg-[#2D0B16] hover:bg-[#3D101E] text-white transition-all border border-[#C5A059]/30 shadow-xs active:scale-95 text-xs cursor-pointer"
                >
                  <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-[#C5A059] text-[#1c1917] font-bold text-xs flex items-center justify-center shadow-xs shrink-0">
                    {currentUser.name ? currentUser.name[0].toUpperCase() : 'U'}
                  </div>
                  <span className="text-xs font-medium hidden sm:inline max-w-[100px] truncate text-amber-50">
                    {currentUser.name}
                  </span>
                  <ChevronDown className="w-3.5 h-3.5 opacity-80 text-amber-200 shrink-0" />
                </button>

                {showProfileMenu && (
                  <div className="absolute right-0 mt-3 w-64 bg-white rounded-2xl shadow-2xl border border-stone-200 p-2 z-50 animate-in fade-in slide-in-from-top-2 text-xs">
                    <div className="p-3 border-b border-stone-100 bg-stone-50 rounded-xl mb-1">
                      <div className="font-bold text-stone-900 truncate">{currentUser.name}</div>
                      <div className="text-[11px] text-stone-500 truncate">{currentUser.email}</div>
                      <div className="inline-block mt-1.5 px-2.5 py-0.5 bg-stone-200 text-stone-800 rounded-full text-[10px] font-bold uppercase tracking-wider">
                        Role: {userRole}
                      </div>
                    </div>

                    <Link
                      href="/dashboard"
                      onClick={() => setShowProfileMenu(false)}
                      className="w-full text-left px-3 py-2 hover:bg-[#faf8f5] rounded-lg font-medium text-stone-800 flex items-center gap-2"
                    >
                      <Building2 className="w-4 h-4 text-stone-500" /> Customer Dashboard &amp; Bookings
                    </Link>
                    <button
                      onClick={() => { setShowProfileMenu(false); setActiveTab('builder'); }}
                      className="w-full text-left px-3 py-2 hover:bg-[#faf8f5] rounded-lg font-medium text-stone-800 flex items-center gap-2 cursor-pointer"
                    >
                      <CalendarDays className="w-4 h-4 text-stone-500" /> My Event Plan
                    </button>
                    <button
                      onClick={() => { setShowProfileMenu(false); setActiveTab('planning_toolkit'); }}
                      className="w-full text-left px-3 py-2 hover:bg-[#faf8f5] rounded-lg font-medium text-stone-800 flex items-center gap-2 cursor-pointer"
                    >
                      <Calculator className="w-4 h-4 text-stone-500" /> Wedding Toolkit (Budget &amp; RSVP)
                    </button>
                    <button
                      onClick={() => { setShowProfileMenu(false); setActiveTab('wishlist'); }}
                      className="w-full text-left px-3 py-2 hover:bg-[#faf8f5] rounded-lg font-medium text-stone-800 flex items-center gap-2 cursor-pointer"
                    >
                      <Heart className="w-4 h-4 text-stone-500" /> Saved Wishlist
                    </button>

                    <div className="border-t border-stone-100 my-1 pt-1">
                      <div className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-stone-400">
                        Switch View / Workspace
                      </div>
                      <Link
                        href="/"
                        onClick={() => { setUserRole('customer'); setShowProfileMenu(false); }}
                        className={`block w-full text-left px-3 py-1.5 rounded-lg text-xs font-semibold ${userRole === 'customer' ? 'text-[#2D0B16] bg-stone-100' : 'text-stone-700 hover:bg-stone-50'}`}
                      >
                        Customer Experience
                      </Link>
                      <Link
                        href="/vendor"
                        onClick={() => { setUserRole('vendor'); setShowProfileMenu(false); }}
                        className={`block w-full text-left px-3 py-1.5 rounded-lg text-xs font-semibold ${userRole === 'vendor' ? 'text-[#2D0B16] bg-stone-100' : 'text-stone-700 hover:bg-stone-50'}`}
                      >
                        Vendor Partner Portal
                      </Link>
                      <Link
                        href="/admin"
                        onClick={() => { setUserRole('admin'); setShowProfileMenu(false); }}
                        className={`block w-full text-left px-3 py-1.5 rounded-lg text-xs font-semibold ${userRole === 'admin' ? 'text-[#2D0B16] bg-stone-100' : 'text-stone-700 hover:bg-stone-50'}`}
                      >
                        Operations Admin Console
                      </Link>
                    </div>

                    <div className="border-t border-stone-100 mt-1 pt-1">
                      <button
                        onClick={() => { setShowProfileMenu(false); onLogout(); }}
                        className="w-full text-left px-3 py-2 text-rose-600 hover:bg-rose-50 rounded-lg font-semibold flex items-center gap-2 cursor-pointer"
                      >
                        <LogOut className="w-4 h-4" /> Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={onOpenAuth || (() => { window.location.href = '/login' })}
                className="px-4 sm:px-5 py-2 rounded-full bg-[#2D0B16] hover:bg-[#3D101E] text-amber-50 text-xs font-semibold transition-all shadow-xs border border-[#C5A059]/30 active:scale-95 flex items-center gap-1.5 shrink-0 cursor-pointer"
              >
                <span>Sign In</span>
              </button>
            )}

            {/* MOBILE MENU TOGGLE */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-xl border border-stone-200 bg-stone-100 hover:bg-stone-200 text-stone-800 transition-all flex items-center justify-center shrink-0 active:scale-95 cursor-pointer"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

          </div>
        </div>
      </div>

      {/* MOBILE ACCORDION DRAWER */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-[#FAF7F2] border-b border-stone-200 px-4 py-4 space-y-3 animate-in slide-in-from-top-2 shadow-xl">
          {/* City Selector */}
          <div className="p-2.5 rounded-xl bg-white border border-stone-200 flex items-center justify-between shadow-xs">
            <span className="text-xs text-stone-600 font-semibold flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-[#2D0B16]" /> City:
            </span>
            <select
              value={selectedCity}
              onChange={(e) => setSelectedCity(e.target.value)}
              className="bg-stone-50 border border-stone-200 rounded-lg px-2.5 py-1 text-xs font-semibold text-stone-900 focus:outline-none cursor-pointer"
            >
              {cities.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          {/* Quick Notifications Alert if any */}
          {unreadCount > 0 && (
            <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-950 text-xs flex items-center justify-between">
              <span className="flex items-center gap-1.5 font-semibold">
                <Bell className="w-3.5 h-3.5 text-[#2D0B16]" /> {unreadCount} New Notification{unreadCount > 1 ? 's' : ''}
              </span>
              <span className="text-[10px] bg-[#2D0B16] text-amber-200 px-2 py-0.5 rounded-full font-bold">Alert</span>
            </div>
          )}

          {/* Nav Links */}
          <div className="space-y-1">
            <button
              onClick={() => { setActiveTab('home'); setMobileMenuOpen(false); }}
              className={`w-full text-left px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all flex items-center justify-between cursor-pointer ${
                activeTab === 'home' ? 'bg-[#2D0B16] text-[#f5ebd7] shadow-xs' : 'text-stone-700 hover:bg-white'
              }`}
            >
              <span>Home</span>
            </button>
            <Link
              href="/venues"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full text-left px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all flex items-center justify-between text-stone-700 hover:bg-white"
            >
              <span>Browse Venues</span>
              <Building2 className="w-4 h-4 text-stone-500" />
            </Link>
            <Link
              href="/dashboard"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full text-left px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all flex items-center justify-between text-stone-700 hover:bg-white"
            >
              <span>Customer Dashboard</span>
              <Building2 className="w-4 h-4 text-stone-500" />
            </Link>
            <Link
              href="/how-it-works"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full text-left px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all flex items-center justify-between text-stone-700 hover:bg-white"
            >
              <span>How it Works</span>
              <Compass className="w-4 h-4 text-stone-500" />
            </Link>
            <Link
              href="/pricing"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full text-left px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all flex items-center justify-between text-stone-700 hover:bg-white"
            >
              <span>Pricing</span>
            </Link>
            <button
              onClick={() => { setActiveTab('builder'); setMobileMenuOpen(false); }}
              className={`w-full text-left px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all flex items-center justify-between cursor-pointer ${
                activeTab === 'builder' ? 'bg-[#2D0B16] text-[#f5ebd7] shadow-xs' : 'text-stone-700 hover:bg-white'
              }`}
            >
              <span>Build My Event</span>
              {budgetCount > 0 ? (
                <span className="bg-[#2D0B16] text-amber-200 text-[10px] font-bold px-2 py-0.5 rounded-full">
                  {budgetCount} Items
                </span>
              ) : (
                <Calendar className="w-4 h-4 text-stone-500" />
              )}
            </button>
            <button
              onClick={() => { setActiveTab('planning_toolkit'); setMobileMenuOpen(false); }}
              className={`w-full text-left px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all flex items-center justify-between cursor-pointer ${
                activeTab === 'planning_toolkit' ? 'bg-[#2D0B16] text-[#f5ebd7] shadow-xs' : 'text-stone-700 hover:bg-white'
              }`}
            >
              <span>Wedding Toolkit (Budget &amp; RSVP)</span>
              <Calculator className="w-4 h-4 text-stone-500" />
            </button>
            <button
              onClick={() => { setActiveTab('wishlist'); setMobileMenuOpen(false); }}
              className={`w-full text-left px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all flex items-center justify-between cursor-pointer ${
                activeTab === 'wishlist' ? 'bg-[#2D0B16] text-[#f5ebd7] shadow-xs' : 'text-stone-700 hover:bg-white'
              }`}
            >
              <span>Saved Wishlist</span>
              {wishlistCount > 0 ? (
                <span className="bg-rose-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                  {wishlistCount} Saved
                </span>
              ) : (
                <Heart className="w-4 h-4 text-stone-500" />
              )}
            </button>
          </div>

          {/* Role Portals */}
          <div className="border-t border-stone-200 pt-2 flex gap-2">
            <button
              onClick={() => { setUserRole('vendor'); setActiveTab('vendor_portal'); setMobileMenuOpen(false); }}
              className="flex-1 py-2 text-center text-xs font-semibold rounded-xl bg-white border border-stone-200 text-stone-800 hover:bg-stone-50 shadow-xs cursor-pointer"
            >
              Vendor Portal
            </button>
            <button
              onClick={() => { setUserRole('admin'); setActiveTab('admin_portal'); setMobileMenuOpen(false); }}
              className="flex-1 py-2 text-center text-xs font-semibold rounded-xl bg-[#2D0B16] text-[#f5ebd7] hover:bg-[#3D101E] shadow-xs cursor-pointer"
            >
              Admin Console
            </button>
          </div>

          {/* Current User in mobile menu */}
          {currentUser && (
            <div className="border-t border-stone-200 pt-2 flex items-center justify-between">
              <div className="text-xs">
                <div className="font-bold text-stone-900 truncate max-w-[180px]">{currentUser.name}</div>
                <div className="text-[10px] text-stone-500 capitalize">{userRole} Account</div>
              </div>
              <button
                onClick={() => { setMobileMenuOpen(false); onLogout(); }}
                className="text-xs font-semibold text-rose-600 hover:text-rose-700 px-2 py-1 rounded-lg hover:bg-rose-50 cursor-pointer"
              >
                Sign Out
              </button>
            </div>
          )}
        </div>
      )}
    </header>

    {/* 3. MOBILE FIXED BOTTOM NAVIGATION BAR */}
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-[#FAF7F2]/95 backdrop-blur-xl border-t border-stone-200/80 px-2 py-2 shadow-lg flex items-center justify-around pb-[max(0.5rem,env(safe-area-inset-bottom))]">
      <button
        onClick={() => { setActiveTab('home'); setMobileMenuOpen(false); }}
        className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-colors cursor-pointer ${
          activeTab === 'home' ? 'text-[#2D0B16] font-bold' : 'text-[#78716c] hover:text-[#1c1917]'
        }`}
      >
        <Sparkles className={`w-5 h-5 ${activeTab === 'home' ? 'text-[#C5A059]' : ''}`} />
        <span className="text-[10px] mt-0.5">Home</span>
      </button>

      <button
        onClick={() => { setActiveTab('explore'); setMobileMenuOpen(false); }}
        className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-colors cursor-pointer ${
          activeTab === 'explore' ? 'text-[#2D0B16] font-bold' : 'text-[#78716c] hover:text-[#1c1917]'
        }`}
      >
        <Compass className={`w-5 h-5 ${activeTab === 'explore' ? 'text-[#C5A059]' : ''}`} />
        <span className="text-[10px] mt-0.5">Explore</span>
      </button>

      <button
        onClick={() => { setActiveTab('builder'); setMobileMenuOpen(false); }}
        className={`relative flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-colors cursor-pointer ${
          activeTab === 'builder' ? 'text-[#2D0B16] font-bold' : 'text-[#78716c] hover:text-[#1c1917]'
        }`}
      >
        <CalendarDays className={`w-5 h-5 ${activeTab === 'builder' ? 'text-[#C5A059]' : ''}`} />
        {budgetCount > 0 && (
          <span className="absolute -top-1 right-2 bg-[#2D0B16] text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center border border-white">
            {budgetCount}
          </span>
        )}
        <span className="text-[10px] mt-0.5">Builder</span>
      </button>

      <button
        onClick={() => { setActiveTab('wishlist'); setMobileMenuOpen(false); }}
        className={`relative flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-colors cursor-pointer ${
          activeTab === 'wishlist' ? 'text-[#2D0B16] font-bold' : 'text-[#78716c] hover:text-[#1c1917]'
        }`}
      >
        <Heart className={`w-5 h-5 ${activeTab === 'wishlist' ? 'fill-rose-500 text-rose-500' : ''}`} />
        {wishlistCount > 0 && (
          <span className="absolute -top-1 right-2 bg-rose-600 text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center border border-white">
            {wishlistCount}
          </span>
        )}
        <span className="text-[10px] mt-0.5">Saved</span>
      </button>

      <button
        onClick={() => {
          if (currentUser) {
            if (userRole === 'admin') setActiveTab('admin_portal')
            else if (userRole === 'vendor') setActiveTab('vendor_portal')
            else setActiveTab('bookings')
          } else {
            if (typeof onOpenAuth === 'function') onOpenAuth()
            else window.location.href = '/login'
          }
          setMobileMenuOpen(false)
        }}
        className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-colors cursor-pointer ${
          ['bookings', 'admin_portal', 'vendor_portal'].includes(activeTab) ? 'text-[#2D0B16] font-bold' : 'text-[#78716c] hover:text-[#1c1917]'
        }`}
      >
        <User className="w-5 h-5" />
        <span className="text-[10px] mt-0.5">{currentUser ? (userRole === 'admin' ? 'Admin' : 'Account') : 'Sign In'}</span>
      </button>
    </nav>
  </>
  )
}
