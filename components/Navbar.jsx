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
    <header className="sticky top-0 z-50 bg-[#060c09]/95 backdrop-blur-xl border-b border-[#00ff88]/30 shadow-[0_4px_30px_rgba(0,255,136,0.12)] transition-all">
      {/* 1. TOP ANNOUNCEMENT BANNER */}
      {announcement?.enabled && (
        <div className="bg-gradient-to-r from-[#03140c] via-[#062618] to-[#03140c] text-[#00ff88] text-[10px] sm:text-xs py-1.5 sm:py-2 px-3 sm:px-4 text-center font-medium tracking-wide flex items-center justify-center gap-1.5 sm:gap-2 border-b border-[#00ff88]/30 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#00ff88]/15 to-transparent -translate-x-full animate-[shimmer-sweep_3.5s_infinite]" />
          <Sparkles className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-[#00ff88] animate-pulse shrink-0" />
          <span className="font-serif tracking-wide truncate max-w-[210px] sm:max-w-none font-bold text-white">{announcement.text}</span>
          <button
            onClick={() => setActiveTab('explore')}
            className="underline underline-offset-2 hover:text-[#05f279] font-black text-[#00ff88] ml-1 cursor-pointer transition-colors shrink-0 whitespace-nowrap"
          >
            Explore &rarr;
          </button>
        </div>
      )}

      {/* 2. MAIN NAVIGATION BAR */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          
          {/* BRAND LOGO */}
          <div
            onClick={() => { setActiveTab('home'); setMobileMenuOpen(false); }}
            className="flex items-center gap-2 sm:gap-3 cursor-pointer group select-none shrink-0"
          >
            <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl sm:rounded-2xl bg-gradient-to-br from-[#0c1f16] via-[#081710] to-[#040a07] text-[#00ff88] flex items-center justify-center border-2 border-[#00ff88]/60 shadow-[0_0_15px_rgba(0,255,136,0.35)] group-hover:scale-105 group-hover:rotate-2 transition-all duration-300 ring-2 ring-[#00ff88]/20 shrink-0">
              <span className="font-serif font-black text-lg sm:text-2xl leading-none text-[#00ff88] drop-shadow-[0_0_8px_rgba(0,255,136,0.8)]">V</span>
            </div>
            <div>
              <div className="font-serif text-lg sm:text-2xl font-black tracking-tight text-white flex items-center gap-1 sm:gap-1.5">
                <span>Vows &amp; Venues</span>
                <span className="w-2 h-2 rounded-full bg-[#00ff88] inline-block shadow-[0_0_8px_#00ff88] animate-pulse"></span>
              </div>
              <div className="hidden sm:block text-[9px] uppercase font-black tracking-[0.25em] text-[#00ff88] -mt-0.5">
                Luxury Indian Event Marketplace
              </div>
            </div>
          </div>

          {/* CITY SELECTOR PILL */}
          <div className="hidden xl:flex items-center bg-[#0a1611] hover:bg-[#0e2019] transition-all rounded-full px-4 py-1.5 border border-[#00ff88]/40 shadow-xs text-xs font-medium text-stone-300 hover:scale-105">
            <MapPin className="w-3.5 h-3.5 text-[#00ff88] mr-1.5" />
            <span className="text-[#00ff88] font-bold mr-1">City:</span>
            <select
              value={selectedCity}
              onChange={(e) => setSelectedCity(e.target.value)}
              className="bg-transparent text-white font-bold focus:outline-none cursor-pointer pr-1"
            >
              {cities.map(c => (
                <option key={c} value={c} className="bg-[#050807] text-white">{c}</option>
              ))}
            </select>
          </div>

          {/* DESKTOP NAV LINKS */}
          <nav className="hidden md:flex items-center gap-1 lg:gap-1.5 text-[13px] font-semibold text-stone-300">
            <button
              onClick={() => setActiveTab('home')}
              className={`px-3.5 py-2 rounded-full transition-all duration-300 hover:-translate-y-0.5 ${
                activeTab === 'home'
                  ? 'text-[#050807] bg-[#00ff88] font-black border border-white/40 shadow-[0_0_15px_rgba(0,255,136,0.6)]'
                  : 'hover:text-[#00ff88] hover:bg-[#0e1d16]'
              }`}
            >
              Home
            </button>
            <button
              onClick={() => setActiveTab('explore')}
              className={`px-3.5 py-2 rounded-full transition-all duration-300 hover:-translate-y-0.5 ${
                activeTab === 'explore'
                  ? 'text-[#050807] bg-[#00ff88] font-black border border-white/40 shadow-[0_0_15px_rgba(0,255,136,0.6)]'
                  : 'hover:text-[#00ff88] hover:bg-[#0e1d16]'
              }`}
            >
              Explore Vendors
            </button>
            <button
              onClick={() => setActiveTab('categories')}
              className={`px-3.5 py-2 rounded-full transition-all duration-300 hover:-translate-y-0.5 ${
                activeTab === 'categories'
                  ? 'text-[#050807] bg-[#00ff88] font-black border border-white/40 shadow-[0_0_15px_rgba(0,255,136,0.6)]'
                  : 'hover:text-[#00ff88] hover:bg-[#0e1d16]'
              }`}
            >
              Categories
            </button>
            <button
              onClick={() => setActiveTab('packages')}
              className={`px-3.5 py-2 rounded-full transition-all duration-300 hover:-translate-y-0.5 ${
                activeTab === 'packages'
                  ? 'text-[#050807] bg-[#00ff88] font-black border border-white/40 shadow-[0_0_15px_rgba(0,255,136,0.6)]'
                  : 'hover:text-[#00ff88] hover:bg-[#0e1d16]'
              }`}
            >
              Ready Packages
            </button>
            <button
              onClick={() => setActiveTab('builder')}
              className={`px-3.5 py-2 rounded-full relative transition-all duration-300 hover:-translate-y-0.5 flex items-center gap-1.5 ${
                activeTab === 'builder'
                  ? 'text-[#050807] bg-[#00ff88] font-black border border-white/40 shadow-[0_0_15px_rgba(0,255,136,0.6)]'
                  : 'hover:text-[#00ff88] hover:bg-[#0e1d16]'
              }`}
            >
              <span>Build My Event</span>
              {budgetCount > 0 && (
                <span className="bg-[#00ff88] text-black text-[10px] font-black px-2 py-0.5 rounded-full shadow-sm animate-pulse">
                  {budgetCount}
                </span>
              )}
            </button>
          </nav>

          {/* RIGHT ACTION BUTTONS */}
          <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
            {/* Wishlist Button */}
            <button
              onClick={() => setActiveTab('wishlist')}
              title="Saved Wishlist"
              className={`hidden sm:flex p-2.5 rounded-full border relative transition-all duration-300 hover:scale-110 active:scale-95 ${
                activeTab === 'wishlist'
                  ? 'bg-[#00ff88]/20 text-[#00ff88] border-[#00ff88] shadow-[0_0_15px_rgba(0,255,136,0.4)]'
                  : 'bg-[#091510] hover:bg-[#0e2018] border-[#00ff88]/30 text-stone-300'
              }`}
            >
              <Heart className={`w-4 h-4 ${wishlistCount > 0 ? 'fill-[#00ff88] text-[#00ff88]' : ''}`} />
              {wishlistCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-[#00ff88] text-black text-[10px] font-black w-4 h-4 rounded-full flex items-center justify-center shadow-sm">
                  {wishlistCount}
                </span>
              )}
            </button>

            {/* Notifications Bell (Desktop/Tablet) */}
            <div className="relative hidden sm:block">
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
                  className="btn-neon-green flex items-center gap-1.5 sm:gap-2 pl-1.5 sm:pl-2 pr-2.5 sm:pr-3.5 py-1 sm:py-1.5 rounded-full text-[#050807] transition-all border border-white/40 shadow-[0_0_20px_rgba(0,255,136,0.5)] hover:scale-105 active:scale-95 text-xs font-black cursor-pointer"
                >
                  <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-[#050807] text-[#00ff88] font-black text-xs flex items-center justify-center shadow-sm shrink-0 border border-[#00ff88]">
                    {currentUser.name ? currentUser.name[0].toUpperCase() : 'U'}
                  </div>
                  <span className="text-xs font-black hidden sm:inline max-w-[100px] truncate text-[#050807]">
                    {currentUser.name}
                  </span>
                  <ChevronDown className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-[#050807] shrink-0 stroke-[3]" />
                </button>

                {showProfileMenu && (
                  <div className="absolute right-0 mt-3 w-64 bg-[#0a1510]/95 backdrop-blur-xl rounded-2xl shadow-[0_15px_40px_rgba(0,0,0,0.9)] border border-[#00ff88]/40 p-2 z-50 animate-in fade-in slide-in-from-top-2 text-xs">
                    <div className="p-3 border-b border-[#00ff88]/20 bg-[#07100b] rounded-xl mb-1 border border-[#00ff88]/20">
                      <div className="font-bold text-white truncate">{currentUser.name}</div>
                      <div className="text-[11px] text-[#00ff88] truncate">{currentUser.email}</div>
                      <div className="inline-block mt-1.5 px-2.5 py-0.5 bg-[#00ff88]/20 text-[#00ff88] rounded-full text-[10px] font-black uppercase tracking-wider border border-[#00ff88]/40">
                        Role: {userRole}
                      </div>
                    </div>

                    <button
                      onClick={() => { setShowProfileMenu(false); setActiveTab('bookings'); }}
                      className="w-full text-left px-3 py-2 hover:bg-[#0f2119] rounded-lg font-medium text-stone-200 hover:text-[#00ff88] flex items-center gap-2 cursor-pointer"
                    >
                      <ShoppingBag className="w-4 h-4 text-[#00ff88]" /> My Bookings
                    </button>
                    <button
                      onClick={() => { setShowProfileMenu(false); setActiveTab('builder'); }}
                      className="w-full text-left px-3 py-2 hover:bg-[#0f2119] rounded-lg font-medium text-stone-200 hover:text-[#00ff88] flex items-center gap-2 cursor-pointer"
                    >
                      <CalendarDays className="w-4 h-4 text-[#00ff88]" /> My Event Plan
                    </button>
                    <button
                      onClick={() => { setShowProfileMenu(false); setActiveTab('wishlist'); }}
                      className="w-full text-left px-3 py-2 hover:bg-[#0f2119] rounded-lg font-medium text-stone-200 hover:text-[#00ff88] flex items-center gap-2 cursor-pointer"
                    >
                      <Heart className="w-4 h-4 text-[#00ff88]" /> Saved Wishlist
                    </button>

                    <div className="border-t border-[#00ff88]/20 my-1 pt-1">
                      <div className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-stone-400">
                        Switch View / Workspace
                      </div>
                      <button
                        onClick={() => { setUserRole('customer'); setActiveTab('home'); setShowProfileMenu(false); }}
                        className={`w-full text-left px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer ${userRole === 'customer' ? 'text-[#00ff88] bg-[#00ff88]/15 font-bold' : 'text-stone-300 hover:bg-[#0f2119]'}`}
                      >
                        Customer Experience
                      </button>
                      <button
                        onClick={() => { setUserRole('vendor'); setActiveTab('vendor_portal'); setShowProfileMenu(false); }}
                        className={`w-full text-left px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer ${userRole === 'vendor' ? 'text-[#00ff88] bg-[#00ff88]/15 font-bold' : 'text-stone-300 hover:bg-[#0f2119]'}`}
                      >
                        Vendor Portal
                      </button>
                      <button
                        onClick={() => { setUserRole('admin'); setActiveTab('admin_portal'); setShowProfileMenu(false); }}
                        className={`w-full text-left px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer ${userRole === 'admin' ? 'text-[#00ff88] bg-[#00ff88]/15 font-bold' : 'text-stone-300 hover:bg-[#0f2119]'}`}
                      >
                        Operations Admin Console
                      </button>
                    </div>

                    <div className="border-t border-[#00ff88]/20 mt-1 pt-1">
                      <button
                        onClick={() => { setShowProfileMenu(false); onLogout(); }}
                        className="w-full text-left px-3 py-2 text-rose-400 hover:bg-rose-950/40 rounded-lg font-semibold flex items-center gap-2 cursor-pointer"
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
                className="btn-neon-green px-3.5 sm:px-5 py-1.5 sm:py-2 rounded-full text-[#050807] text-xs font-black transition-all shadow-[0_0_20px_rgba(0,255,136,0.6)] border border-white/40 hover:scale-105 active:scale-95 flex items-center gap-1.5 shrink-0 cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5 text-black shrink-0 fill-black" />
                <span>Sign In</span>
              </button>
            )}

            {/* MOBILE MENU TOGGLE */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-xl border border-[#00ff88]/40 bg-[#0a1611] text-[#00ff88] hover:bg-[#0f2119] transition-all shadow-xs flex items-center justify-center shrink-0 active:scale-95 cursor-pointer"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

          </div>
        </div>
      </div>

      {/* MOBILE ACCORDION DRAWER */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#07100b] border-b-2 border-[#00ff88]/50 px-4 py-4 space-y-3 animate-in slide-in-from-top-2 shadow-[0_15px_30px_rgba(0,0,0,0.9)] text-white">
          {/* City Selector */}
          <div className="p-2.5 rounded-xl bg-[#0b1812] border border-[#00ff88]/30 flex items-center justify-between shadow-xs">
            <span className="text-xs text-stone-300 font-semibold flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-[#00ff88]" /> Location:
            </span>
            <select
              value={selectedCity}
              onChange={(e) => setSelectedCity(e.target.value)}
              className="bg-[#050807] border border-[#00ff88]/40 rounded-lg px-2.5 py-1 text-xs font-bold text-white focus:outline-none cursor-pointer"
            >
              {cities.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          {/* Quick Notifications Alert if any */}
          {unreadCount > 0 && (
            <div className="p-2.5 rounded-xl bg-[#00ff88]/15 border border-[#00ff88]/40 text-[#00ff88] text-xs flex items-center justify-between">
              <span className="flex items-center gap-1.5 font-bold">
                <Bell className="w-3.5 h-3.5 text-[#00ff88]" /> {unreadCount} New Notification{unreadCount > 1 ? 's' : ''}
              </span>
              <span className="text-[10px] bg-[#00ff88] text-black px-2 py-0.5 rounded-full font-black">Alert</span>
            </div>
          )}

          {/* Nav Links */}
          <div className="space-y-1">
            <button
              onClick={() => { setActiveTab('home'); setMobileMenuOpen(false); }}
              className={`w-full text-left px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all flex items-center justify-between ${
                activeTab === 'home' ? 'bg-[#4a1525] text-[#f5ebd7] shadow-sm' : 'text-stone-700 hover:bg-white'
              }`}
            >
              <span>Home</span>
              <Sparkles className="w-4 h-4 opacity-70" />
            </button>
            <button
              onClick={() => { setActiveTab('explore'); setMobileMenuOpen(false); }}
              className={`w-full text-left px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all flex items-center justify-between ${
                activeTab === 'explore' ? 'bg-[#4a1525] text-[#f5ebd7] shadow-sm' : 'text-stone-700 hover:bg-white'
              }`}
            >
              <span>Explore Vendors</span>
              <Compass className="w-4 h-4 opacity-70" />
            </button>
            <button
              onClick={() => { setActiveTab('categories'); setMobileMenuOpen(false); }}
              className={`w-full text-left px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all flex items-center justify-between ${
                activeTab === 'categories' ? 'bg-[#4a1525] text-[#f5ebd7] shadow-sm' : 'text-stone-700 hover:bg-white'
              }`}
            >
              <span>Celebration Categories</span>
              <Building2 className="w-4 h-4 opacity-70" />
            </button>
            <button
              onClick={() => { setActiveTab('packages'); setMobileMenuOpen(false); }}
              className={`w-full text-left px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all flex items-center justify-between ${
                activeTab === 'packages' ? 'bg-[#4a1525] text-[#f5ebd7] shadow-sm' : 'text-stone-700 hover:bg-white'
              }`}
            >
              <span>Ready Packages</span>
              <CalendarDays className="w-4 h-4 opacity-70" />
            </button>
            <button
              onClick={() => { setActiveTab('builder'); setMobileMenuOpen(false); }}
              className={`w-full text-left px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all flex items-center justify-between ${
                activeTab === 'builder' ? 'bg-[#4a1525] text-[#f5ebd7] shadow-sm' : 'text-stone-700 hover:bg-white'
              }`}
            >
              <span>Build My Event</span>
              {budgetCount > 0 ? (
                <span className="bg-amber-400 text-stone-950 text-[10px] font-bold px-2 py-0.5 rounded-full">
                  {budgetCount} Items
                </span>
              ) : (
                <Calendar className="w-4 h-4 opacity-70" />
              )}
            </button>
            <button
              onClick={() => { setActiveTab('wishlist'); setMobileMenuOpen(false); }}
              className={`w-full text-left px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all flex items-center justify-between ${
                activeTab === 'wishlist' ? 'bg-[#4a1525] text-[#f5ebd7] shadow-sm' : 'text-stone-700 hover:bg-white'
              }`}
            >
              <span>Saved Wishlist</span>
              {wishlistCount > 0 ? (
                <span className="bg-rose-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                  {wishlistCount} Saved
                </span>
              ) : (
                <Heart className="w-4 h-4 opacity-70" />
              )}
            </button>
          </div>

          {/* Role Portals */}
          <div className="border-t border-amber-200/80 pt-2 flex gap-2">
            <button
              onClick={() => { setUserRole('vendor'); setActiveTab('vendor_portal'); setMobileMenuOpen(false); }}
              className="flex-1 py-2 text-center text-xs font-bold rounded-xl bg-white border border-stone-200 text-stone-800 hover:bg-stone-50 shadow-xs"
            >
              Vendor Portal
            </button>
            <button
              onClick={() => { setUserRole('admin'); setActiveTab('admin_portal'); setMobileMenuOpen(false); }}
              className="flex-1 py-2 text-center text-xs font-bold rounded-xl bg-gradient-to-r from-[#4a1525] to-[#60192e] text-[#f5ebd7] hover:brightness-110 shadow-xs"
            >
              Admin Console
            </button>
          </div>

          {/* Current User in mobile menu */}
          {currentUser && (
            <div className="border-t border-amber-200/80 pt-2 flex items-center justify-between">
              <div className="text-xs">
                <div className="font-bold text-stone-900 truncate max-w-[180px]">{currentUser.name}</div>
                <div className="text-[10px] text-stone-500 capitalize">{userRole} Account</div>
              </div>
              <button
                onClick={() => { setMobileMenuOpen(false); onLogout(); }}
                className="text-xs font-semibold text-rose-600 hover:text-rose-700 px-2 py-1 rounded-lg hover:bg-rose-50"
              >
                Sign Out
              </button>
            </div>
          )}
        </div>
      )}

      {/* 3. MOBILE FIXED BOTTOM NAVIGATION BAR */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-gradient-to-r from-[#fcf8ef]/95 via-[#fdfaf3]/95 to-[#faf4e9]/95 backdrop-blur-xl border-t border-amber-300/60 px-2 py-1.5 shadow-[0_-4px_25px_rgba(74,21,37,0.08)] flex items-center justify-around">
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
