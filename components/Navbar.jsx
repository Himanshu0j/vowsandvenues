'use client'

import React, { useState } from 'react'
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
  ShoppingBag
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
    <header className="sticky top-0 z-50 bg-[#faf8f5]/95 backdrop-blur-md border-b border-[#e8e2d5] transition-all">
      {/* 1. TOP ANNOUNCEMENT BANNER */}
      {announcement?.enabled && (
        <div className="bg-[#4a1525] text-[#f5ebd7] text-[11px] sm:text-xs py-1.5 px-4 text-center font-medium tracking-wide flex items-center justify-center gap-2 border-b border-[#5c1d2e]">
          <span>{announcement.text}</span>
          <button
            onClick={() => setActiveTab('explore')}
            className="underline underline-offset-2 hover:text-white font-semibold ml-1 cursor-pointer"
          >
            Explore Now &rarr;
          </button>
        </div>
      )}

      {/* 2. MAIN NAVIGATION BAR */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* BRAND LOGO */}
          <div
            onClick={() => { setActiveTab('home'); setMobileMenuOpen(false); }}
            className="flex items-center gap-3 cursor-pointer group select-none"
          >
            <div className="w-10 h-10 rounded-full bg-[#4a1525] text-[#c5a059] flex items-center justify-center border border-[#c5a059]/40 shadow-sm group-hover:scale-105 transition-transform">
              <span className="font-serif font-bold text-lg leading-none">V</span>
            </div>
            <div>
              <div className="font-serif text-2xl font-bold tracking-tight text-[#1c1917] flex items-center gap-1.5">
                <span>Vows &amp; Venues</span>
                <span className="w-1.5 h-1.5 rounded-full bg-[#c5a059] inline-block"></span>
              </div>
              <div className="text-[9px] uppercase font-semibold tracking-[0.2em] text-[#78716c] -mt-0.5">
                Luxury Indian Event Marketplace
              </div>
            </div>
          </div>

          {/* CITY SELECTOR PILL */}
          <div className="hidden xl:flex items-center bg-[#f2ede4] hover:bg-[#eae3d7] transition-colors rounded-full px-4 py-1.5 border border-[#dfd7c8] text-xs font-medium text-[#44403c]">
            <MapPin className="w-3.5 h-3.5 text-[#4a1525] mr-1.5" />
            <span className="text-[#78716c] mr-1">Location:</span>
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
          <nav className="hidden md:flex items-center gap-1 lg:gap-1.5 text-[13px] font-medium text-[#44403c]">
            <button
              onClick={() => setActiveTab('home')}
              className={`px-3.5 py-2 rounded-full transition-all ${
                activeTab === 'home'
                  ? 'text-[#4a1525] bg-[#ebd8de]/50 font-semibold border border-[#d9b8c3]/60'
                  : 'hover:text-[#1c1917] hover:bg-[#f2ede4]'
              }`}
            >
              Home
            </button>
            <button
              onClick={() => setActiveTab('explore')}
              className={`px-3.5 py-2 rounded-full transition-all ${
                activeTab === 'explore'
                  ? 'text-[#4a1525] bg-[#ebd8de]/50 font-semibold border border-[#d9b8c3]/60'
                  : 'hover:text-[#1c1917] hover:bg-[#f2ede4]'
              }`}
            >
              Explore Vendors
            </button>
            <button
              onClick={() => setActiveTab('categories')}
              className={`px-3.5 py-2 rounded-full transition-all ${
                activeTab === 'categories'
                  ? 'text-[#4a1525] bg-[#ebd8de]/50 font-semibold border border-[#d9b8c3]/60'
                  : 'hover:text-[#1c1917] hover:bg-[#f2ede4]'
              }`}
            >
              Categories
            </button>
            <button
              onClick={() => setActiveTab('packages')}
              className={`px-3.5 py-2 rounded-full transition-all ${
                activeTab === 'packages'
                  ? 'text-[#4a1525] bg-[#ebd8de]/50 font-semibold border border-[#d9b8c3]/60'
                  : 'hover:text-[#1c1917] hover:bg-[#f2ede4]'
              }`}
            >
              Ready Packages
            </button>
            <button
              onClick={() => setActiveTab('builder')}
              className={`px-3.5 py-2 rounded-full relative transition-all flex items-center gap-1.5 ${
                activeTab === 'builder'
                  ? 'text-[#4a1525] bg-[#ebd8de]/50 font-semibold border border-[#d9b8c3]/60'
                  : 'hover:text-[#1c1917] hover:bg-[#f2ede4]'
              }`}
            >
              <span>Build My Event</span>
              {budgetCount > 0 && (
                <span className="bg-[#4a1525] text-[#f5ebd7] text-[10px] font-bold px-1.5 py-0.2 rounded-full">
                  {budgetCount}
                </span>
              )}
            </button>
          </nav>

          {/* RIGHT ACTION BUTTONS */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Wishlist Button */}
            <button
              onClick={() => setActiveTab('wishlist')}
              title="Saved Wishlist"
              className={`p-2.5 rounded-full border relative transition-all ${
                activeTab === 'wishlist'
                  ? 'bg-rose-50 text-rose-600 border-rose-300'
                  : 'bg-[#f5f2eb] hover:bg-[#eae3d7] border-[#dfd7c8] text-[#44403c]'
              }`}
            >
              <Heart className={`w-4 h-4 ${wishlistCount > 0 ? 'fill-rose-500 text-rose-500' : ''}`} />
              {wishlistCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-rose-600 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                  {wishlistCount}
                </span>
              )}
            </button>

            {/* Notifications Bell */}
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                title="Notifications"
                className="p-2.5 rounded-full border border-[#dfd7c8] bg-[#f5f2eb] hover:bg-[#eae3d7] text-[#44403c] relative transition-all"
              >
                <Bell className="w-4 h-4" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-[#c5a059] ring-2 ring-white"></span>
                )}
              </button>

              {/* Notifications Dropdown */}
              {showNotifications && (
                <div className="absolute right-0 mt-3 w-80 sm:w-96 bg-white rounded-2xl shadow-xl border border-[#e8e2d5] p-4 z-50 animate-in fade-in slide-in-from-top-2">
                  <div className="flex items-center justify-between pb-3 border-b border-stone-100">
                    <h4 className="font-serif font-bold text-sm text-[#1c1917] flex items-center gap-2">
                      <Bell className="w-4 h-4 text-[#4a1525]" /> Notifications
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
                    className="w-full mt-3 py-1.5 text-center text-xs text-[#4a1525] font-semibold hover:bg-stone-50 rounded-lg transition-colors"
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
                  className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-full bg-[#4a1525] text-white hover:bg-[#3d111e] transition-colors border border-[#5c1d2e] shadow-sm"
                >
                  <div className="w-7 h-7 rounded-full bg-[#c5a059] text-[#1c1917] font-bold text-xs flex items-center justify-center">
                    {currentUser.name ? currentUser.name[0].toUpperCase() : 'U'}
                  </div>
                  <span className="text-xs font-semibold hidden sm:inline max-w-[100px] truncate">
                    {currentUser.name}
                  </span>
                  <ChevronDown className="w-3.5 h-3.5 opacity-80" />
                </button>

                {showProfileMenu && (
                  <div className="absolute right-0 mt-3 w-64 bg-white rounded-2xl shadow-xl border border-[#e8e2d5] p-2 z-50 animate-in fade-in slide-in-from-top-2 text-xs">
                    <div className="p-3 border-b border-stone-100 bg-[#faf8f5] rounded-xl mb-1">
                      <div className="font-bold text-stone-900 truncate">{currentUser.name}</div>
                      <div className="text-[11px] text-stone-500 truncate">{currentUser.email}</div>
                      <div className="inline-block mt-1.5 px-2 py-0.5 bg-[#ebd8de] text-[#4a1525] rounded-full text-[10px] font-bold uppercase tracking-wider">
                        Role: {userRole}
                      </div>
                    </div>

                    <button
                      onClick={() => { setShowProfileMenu(false); setActiveTab('bookings'); }}
                      className="w-full text-left px-3 py-2 hover:bg-[#faf8f5] rounded-lg font-medium text-stone-800 flex items-center gap-2"
                    >
                      <ShoppingBag className="w-4 h-4 text-stone-500" /> My Bookings
                    </button>
                    <button
                      onClick={() => { setShowProfileMenu(false); setActiveTab('builder'); }}
                      className="w-full text-left px-3 py-2 hover:bg-[#faf8f5] rounded-lg font-medium text-stone-800 flex items-center gap-2"
                    >
                      <CalendarDays className="w-4 h-4 text-stone-500" /> My Event Plan
                    </button>
                    <button
                      onClick={() => { setShowProfileMenu(false); setActiveTab('wishlist'); }}
                      className="w-full text-left px-3 py-2 hover:bg-[#faf8f5] rounded-lg font-medium text-stone-800 flex items-center gap-2"
                    >
                      <Heart className="w-4 h-4 text-stone-500" /> Saved Wishlist
                    </button>

                    <div className="border-t border-stone-100 my-1 pt-1">
                      <div className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-stone-400">
                        Switch View / Workspace
                      </div>
                      <button
                        onClick={() => { setUserRole('customer'); setActiveTab('home'); setShowProfileMenu(false); }}
                        className={`w-full text-left px-3 py-1.5 rounded-lg text-xs font-semibold ${userRole === 'customer' ? 'text-[#4a1525] bg-[#ebd8de]/40' : 'text-stone-700 hover:bg-stone-50'}`}
                      >
                        Customer Experience
                      </button>
                      <button
                        onClick={() => { setUserRole('vendor'); setActiveTab('vendor_portal'); setShowProfileMenu(false); }}
                        className={`w-full text-left px-3 py-1.5 rounded-lg text-xs font-semibold ${userRole === 'vendor' ? 'text-[#4a1525] bg-[#ebd8de]/40' : 'text-stone-700 hover:bg-stone-50'}`}
                      >
                        Vendor Portal
                      </button>
                      <button
                        onClick={() => { setUserRole('admin'); setActiveTab('admin_portal'); setShowProfileMenu(false); }}
                        className={`w-full text-left px-3 py-1.5 rounded-lg text-xs font-semibold ${userRole === 'admin' ? 'text-[#4a1525] bg-[#ebd8de]/40' : 'text-stone-700 hover:bg-stone-50'}`}
                      >
                        Operations Admin Console
                      </button>
                    </div>

                    <div className="border-t border-stone-100 mt-1 pt-1">
                      <button
                        onClick={() => { setShowProfileMenu(false); onLogout(); }}
                        className="w-full text-left px-3 py-2 text-rose-600 hover:bg-rose-50 rounded-lg font-semibold flex items-center gap-2"
                      >
                        <LogOut className="w-4 h-4" /> Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={onOpenAuth}
                className="px-4 sm:px-5 py-2 rounded-full bg-[#4a1525] hover:bg-[#3d111e] text-[#f5ebd7] text-xs font-semibold transition-all shadow-sm border border-[#5c1d2e]"
              >
                Sign In
              </button>
            )}

            {/* MOBILE MENU TOGGLE */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2.5 rounded-full border border-[#dfd7c8] bg-[#f5f2eb] text-[#44403c]"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

          </div>
        </div>
      </div>

      {/* MOBILE ACCORDION MENU */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-b border-[#e8e2d5] px-4 py-4 space-y-2 animate-in slide-in-from-top-2">
          <div className="pb-2 border-b border-stone-100 flex items-center justify-between">
            <span className="text-xs text-stone-500 font-medium">Selected City:</span>
            <select
              value={selectedCity}
              onChange={(e) => setSelectedCity(e.target.value)}
              className="bg-[#f5f2eb] rounded-lg px-2.5 py-1 text-xs font-bold text-stone-800"
            >
              {cities.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          <button
            onClick={() => { setActiveTab('home'); setMobileMenuOpen(false); }}
            className={`w-full text-left px-3 py-2.5 rounded-xl text-sm font-semibold ${activeTab === 'home' ? 'bg-[#ebd8de] text-[#4a1525]' : 'text-stone-700 hover:bg-stone-50'}`}
          >
            Home
          </button>
          <button
            onClick={() => { setActiveTab('explore'); setMobileMenuOpen(false); }}
            className={`w-full text-left px-3 py-2.5 rounded-xl text-sm font-semibold ${activeTab === 'explore' ? 'bg-[#ebd8de] text-[#4a1525]' : 'text-stone-700 hover:bg-stone-50'}`}
          >
            Explore Vendors
          </button>
          <button
            onClick={() => { setActiveTab('categories'); setMobileMenuOpen(false); }}
            className={`w-full text-left px-3 py-2.5 rounded-xl text-sm font-semibold ${activeTab === 'categories' ? 'bg-[#ebd8de] text-[#4a1525]' : 'text-stone-700 hover:bg-stone-50'}`}
          >
            Categories
          </button>
          <button
            onClick={() => { setActiveTab('packages'); setMobileMenuOpen(false); }}
            className={`w-full text-left px-3 py-2.5 rounded-xl text-sm font-semibold ${activeTab === 'packages' ? 'bg-[#ebd8de] text-[#4a1525]' : 'text-stone-700 hover:bg-stone-50'}`}
          >
            Ready Packages
          </button>
          <button
            onClick={() => { setActiveTab('builder'); setMobileMenuOpen(false); }}
            className={`w-full text-left px-3 py-2.5 rounded-xl text-sm font-semibold flex items-center justify-between ${activeTab === 'builder' ? 'bg-[#ebd8de] text-[#4a1525]' : 'text-stone-700 hover:bg-stone-50'}`}
          >
            <span>Build My Event</span>
            {budgetCount > 0 && (
              <span className="bg-[#4a1525] text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                {budgetCount} Items
              </span>
            )}
          </button>

          <div className="border-t border-stone-100 pt-2 flex gap-2">
            <button
              onClick={() => { setUserRole('vendor'); setActiveTab('vendor_portal'); setMobileMenuOpen(false); }}
              className="flex-1 py-2 text-center text-xs font-semibold rounded-xl bg-stone-100 text-stone-800 hover:bg-stone-200"
            >
              Vendor Portal
            </button>
            <button
              onClick={() => { setUserRole('admin'); setActiveTab('admin_portal'); setMobileMenuOpen(false); }}
              className="flex-1 py-2 text-center text-xs font-semibold rounded-xl bg-[#4a1525] text-[#f5ebd7] hover:bg-[#3d111e]"
            >
              Admin Console
            </button>
          </div>
        </div>
      )}

      {/* 3. MOBILE FIXED BOTTOM NAVIGATION BAR */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-[#ffffff]/95 backdrop-blur-lg border-t border-[#e8e2d5] px-2 py-1.5 shadow-[0_-4px_20px_rgba(0,0,0,0.08)] flex items-center justify-around">
        <button
          onClick={() => { setActiveTab('home'); setMobileMenuOpen(false); }}
          className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-colors ${
            activeTab === 'home' ? 'text-[#4a1525] font-bold' : 'text-[#78716c] hover:text-[#1c1917]'
          }`}
        >
          <Sparkles className={`w-5 h-5 ${activeTab === 'home' ? 'text-[#c5a059]' : ''}`} />
          <span className="text-[10px] mt-0.5">Home</span>
        </button>

        <button
          onClick={() => { setActiveTab('explore'); setMobileMenuOpen(false); }}
          className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-colors ${
            activeTab === 'explore' ? 'text-[#4a1525] font-bold' : 'text-[#78716c] hover:text-[#1c1917]'
          }`}
        >
          <Compass className={`w-5 h-5 ${activeTab === 'explore' ? 'text-[#c5a059]' : ''}`} />
          <span className="text-[10px] mt-0.5">Explore</span>
        </button>

        <button
          onClick={() => { setActiveTab('builder'); setMobileMenuOpen(false); }}
          className={`relative flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-colors ${
            activeTab === 'builder' ? 'text-[#4a1525] font-bold' : 'text-[#78716c] hover:text-[#1c1917]'
          }`}
        >
          <CalendarDays className={`w-5 h-5 ${activeTab === 'builder' ? 'text-[#c5a059]' : ''}`} />
          {budgetCount > 0 && (
            <span className="absolute -top-1 right-2 bg-[#4a1525] text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center border border-white">
              {budgetCount}
            </span>
          )}
          <span className="text-[10px] mt-0.5">Builder</span>
        </button>

        <button
          onClick={() => { setActiveTab('wishlist'); setMobileMenuOpen(false); }}
          className={`relative flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-colors ${
            activeTab === 'wishlist' ? 'text-[#4a1525] font-bold' : 'text-[#78716c] hover:text-[#1c1917]'
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
              onOpenAuth()
            }
            setMobileMenuOpen(false)
          }}
          className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-colors ${
            ['bookings', 'admin_portal', 'vendor_portal'].includes(activeTab) ? 'text-[#4a1525] font-bold' : 'text-[#78716c] hover:text-[#1c1917]'
          }`}
        >
          <User className="w-5 h-5" />
          <span className="text-[10px] mt-0.5">{currentUser ? (userRole === 'admin' ? 'Admin' : 'Account') : 'Sign In'}</span>
        </button>
      </nav>
    </header>
  )
}
