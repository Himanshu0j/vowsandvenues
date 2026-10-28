'use client'

import React, { useState, useEffect } from 'react'
import {
  CreditCard,
  QrCode,
  Smartphone,
  Building2,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Copy,
  Save,
  RefreshCw,
  ShieldCheck,
  Eye,
  EyeOff,
  Send,
  Sparkles,
  Lock,
  Unlock,
  Clock,
  ArrowRight,
  ExternalLink,
  Check,
  Search,
  Filter,
  DollarSign
} from 'lucide-react'
import { toast } from 'sonner'

export const DEFAULT_PAYMENT_CONFIG = {
  activeMode: 'CUSTOM_UPI_QR', // 'CUSTOM_UPI_QR' | 'PAYMENT_GATEWAY' | 'HYBRID' | 'BANK_NEFT_RTGS'
  upi: {
    upiId: '9305977591@ptaxis',
    merchantName: 'Sakshi Singh',
    qrImageUrl: '/images/paytm_upi_qr.png',
    requireUtr: true,
    requireScreenshot: false,
    autoWhatsAppReceipt: true
  },
  gateway: {
    provider: 'razorpay', // 'razorpay' | 'cashfree' | 'stripe' | 'paytm'
    isLive: false,
    keyId: 'rzp_test_9A2bKx89mQpL4z',
    keySecret: '••••••••••••••••••••••••',
    webhookSecret: '••••••••••••••••••••••••',
    convenienceFeeType: 'flat', // 'flat' | 'percent' | 'zero'
    convenienceFeeAmount: 2500,
    autoRefund: true
  },
  bank: {
    bankName: 'HDFC Bank, Fort Branch, Mumbai',
    accountHolder: 'Vows & Venues Escrow Services LLP',
    accountNumber: '50200088991122',
    ifsc: 'HDFC0000060',
    branch: 'Fort / Hazratganj Commercial Branch',
    virtualEscrowPrefix: 'VVESC'
  }
}

export const INITIAL_TRANSACTIONS = [
  {
    id: 'tx_pay_101',
    bookingId: 'BK-2026-9481',
    clientName: 'Aanya Singhania & Kabir Kapoor',
    clientPhone: '+919820123456',
    amount: 160000,
    method: 'CUSTOM_UPI_QR',
    payeeUpi: '9305977591@ptaxis',
    utr: '429188291042',
    date: '14 Oct 2026, 01:15 AM',
    status: 'PENDING_VERIFICATION',
    notes: '20% Token advance paid via Paytm UPI QR'
  },
  {
    id: 'tx_pay_102',
    bookingId: 'BK-2026-8812',
    clientName: 'Simran Chawla & Rohan Oberoi',
    clientPhone: '+919811223344',
    amount: 220000,
    method: 'PAYMENT_GATEWAY',
    gatewayProvider: 'Razorpay',
    paymentId: 'pay_Or92jks8921Lk',
    utr: 'RZP-8921849102',
    date: '13 Oct 2026, 06:40 PM',
    status: 'VERIFIED',
    notes: 'Instant settlement via HDFC NetBanking Gateway'
  },
  {
    id: 'tx_pay_103',
    bookingId: 'BK-2026-7734',
    clientName: 'Dr. Meera Nambiar',
    clientPhone: '+919845012345',
    amount: 500000,
    method: 'BANK_NEFT_RTGS',
    bankName: 'HDFC Escrow Account',
    utr: 'HDFCR5202610120098',
    date: '12 Oct 2026, 03:20 PM',
    status: 'VERIFIED',
    notes: 'NEFT Corporate Payout advance verified with bank statement'
  },
  {
    id: 'tx_pay_104',
    bookingId: 'BK-2026-6621',
    clientName: 'Vikram & Radhika Seth',
    clientPhone: '+919876543210',
    amount: 75000,
    method: 'CUSTOM_UPI_QR',
    payeeUpi: '9305977591@ptaxis',
    utr: '000000000000',
    date: '11 Oct 2026, 11:10 AM',
    status: 'REJECTED',
    notes: 'Invalid dummy UTR reference submitted'
  }
]

export default function AdminPaymentGatewayManager() {
  const [config, setConfig] = useState(DEFAULT_PAYMENT_CONFIG)
  const [transactions, setTransactions] = useState(INITIAL_TRANSACTIONS)
  const [activeTab, setActiveTab] = useState('settings') // 'settings' | 'inbox'
  const [showSecret, setShowSecret] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [txSearch, setTxSearch] = useState('')
  const [txStatusFilter, setTxStatusFilter] = useState('ALL')
  const [copiedKey, setCopiedKey] = useState('')

  // Load stored config if available
  useEffect(() => {
    try {
      const stored = localStorage.getItem('vv_payment_gateway_config')
      if (stored) {
        setConfig(JSON.parse(stored))
      }
      const storedTxs = localStorage.getItem('vv_payment_transactions')
      if (storedTxs) {
        setTransactions(JSON.parse(storedTxs))
      }
    } catch (_) {}
  }, [])

  // Save changes
  const handleSaveConfig = () => {
    setIsSaving(true)
    try {
      localStorage.setItem('vv_payment_gateway_config', JSON.stringify(config))
      setTimeout(() => {
        setIsSaving(false)
        toast.success('Payment Gateway & Collection settings saved successfully!')
      }, 500)
    } catch (e) {
      setIsSaving(false)
      toast.error('Failed to save settings: ' + e.message)
    }
  }

  const handleCopy = (text, key) => {
    navigator.clipboard.writeText(text)
    setCopiedKey(key)
    toast.success(`Copied: ${text}`)
    setTimeout(() => setCopiedKey(''), 2000)
  }

  // Transaction Verification Actions
  const handleVerifyTransaction = async (id, bookingId) => {
    setTransactions(prev => {
      const next = prev.map(t => t.id === id ? { ...t, status: 'VERIFIED' } : t)
      localStorage.setItem('vv_payment_transactions', JSON.stringify(next))
      return next
    })
    const bId = bookingId || id
    try {
      const token = localStorage.getItem('vv_auth_token') || localStorage.getItem('auth_token')
      if (token && bId) {
        await fetch(`/api/admin/bookings/${bId}/verify-payment`, {
          method: 'PATCH',
          headers: { Authorization: `Bearer ${token}` }
        })
      }
    } catch (_) {}
    toast.success('Payment verified & booking confirmed! Token receipt dispatched.')
  }

  const handleRejectTransaction = async (id, bookingId) => {
    setTransactions(prev => {
      const next = prev.map(t => t.id === id ? { ...t, status: 'REJECTED' } : t)
      localStorage.setItem('vv_payment_transactions', JSON.stringify(next))
      return next
    })
    const bId = bookingId || id
    try {
      const token = localStorage.getItem('vv_auth_token') || localStorage.getItem('auth_token')
      if (token && bId) {
        await fetch(`/api/admin/bookings/${bId}/reject-payment`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({ reason: 'Invalid UTR reference or payment not received in bank escrow' })
        })
      }
    } catch (_) {}
    toast.error('Payment rejected. Customer will be notified to re-submit valid UTR.')
  }

  const handleOpenWhatsApp = (tx) => {
    const text = encodeURIComponent(
      `Namaste ${tx.clientName}! Greetings from Vows & Venues Operations.\n\n` +
      `Regarding your payment submission for Booking #${tx.bookingId}:\n` +
      `Amount: ₹${tx.amount.toLocaleString('en-IN')}\n` +
      `Submitted UTR: ${tx.utr}\n` +
      `Status: ${tx.status}\n\n` +
      `Kindly share your official bank payment receipt screenshot so our concierge team can confirm your palace booking immediately.`
    )
    window.open(`https://wa.me/${tx.clientPhone.replace(/[^0-9]/g, '')}?text=${text}`, '_blank')
  }

  // Filtered transactions
  const filteredTxs = transactions.filter(t => {
    const matchesSearch =
      t.clientName.toLowerCase().includes(txSearch.toLowerCase()) ||
      t.bookingId.toLowerCase().includes(txSearch.toLowerCase()) ||
      t.utr.toLowerCase().includes(txSearch.toLowerCase())
    const matchesStatus = txStatusFilter === 'ALL' || t.status === txStatusFilter
    return matchesSearch && matchesStatus
  })

  // Dynamic QR Preview URL
  const dynamicQrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=260x260&data=${encodeURIComponent(
    `upi://pay?pa=${config.upi.upiId}&pn=${encodeURIComponent(config.upi.merchantName)}&cu=INR`
  )}`

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      
      {/* TOP HEADER */}
      <div className="bg-gradient-to-r from-stone-900 via-stone-950 to-stone-900 text-white rounded-3xl p-6 sm:p-8 border border-amber-300/30 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-400 via-amber-500 to-amber-600 text-stone-950 flex items-center justify-center font-bold shadow-lg shrink-0">
              <QrCode className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="bg-amber-400 text-stone-950 text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                  Payment Operations Control
                </span>
                <span className="text-xs text-amber-300 font-mono flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                  Active Mode: <strong>{config.activeMode}</strong>
                </span>
              </div>
              <h1 className="font-serif text-2xl sm:text-3xl font-bold mt-1 text-white">
                Payment Gateway &amp; UPI / QR Collections Manager
              </h1>
              <p className="text-xs text-stone-300 mt-1 max-w-2xl">
                Configure whether customer payments are routed directly to Admin&apos;s custom UPI/QR code, online gateway (Razorpay/Cashfree), or hybrid mode with UTR payment proof verification.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handleSaveConfig}
              disabled={isSaving}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 text-stone-950 font-bold text-xs flex items-center gap-2 shadow-lg hover:brightness-110 active:scale-95 transition-all disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{isSaving ? 'Saving…' : 'Save Payment Controls'}</span>
            </button>
          </div>
        </div>

        {/* TOP TAB SWITCHER */}
        <div className="flex items-center gap-2 pt-6 mt-6 border-t border-stone-800 text-xs">
          <button
            onClick={() => setActiveTab('settings')}
            className={`px-4 py-2 rounded-xl font-bold flex items-center gap-2 transition-all ${
              activeTab === 'settings'
                ? 'bg-amber-400 text-stone-950 shadow'
                : 'text-stone-300 hover:text-white hover:bg-white/10'
            }`}
          >
            <CreditCard className="w-4 h-4" />
            <span>Gateway &amp; UPI Setup</span>
          </button>

          <button
            onClick={() => setActiveTab('inbox')}
            className={`px-4 py-2 rounded-xl font-bold flex items-center gap-2 transition-all relative ${
              activeTab === 'inbox'
                ? 'bg-amber-400 text-stone-950 shadow'
                : 'text-stone-300 hover:text-white hover:bg-white/10'
            }`}
          >
            <Clock className="w-4 h-4" />
            <span>Inbound UTR Verifications</span>
            {transactions.filter(t => t.status === 'PENDING_VERIFICATION').length > 0 && (
              <span className="bg-rose-500 text-white text-[10px] font-bold px-1.5 py-0.2 rounded-full">
                {transactions.filter(t => t.status === 'PENDING_VERIFICATION').length}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* ============================================================== */}
      {/* TAB 1: SETTINGS & MODE CONTROLS */}
      {/* ============================================================== */}
      {activeTab === 'settings' && (
        <div className="space-y-8">
          
          {/* 1. MASTER PAYMENT COLLECTION MODE SELECTOR */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div>
                <span className="text-[11px] font-bold text-stone-400 uppercase tracking-wider block">
                  Master Payment Flow
                </span>
                <h2 className="font-serif text-xl sm:text-2xl font-bold text-stone-900 mt-0.5">
                  Choose How Platform Collects Payments
                </h2>
              </div>
              <span className="text-xs bg-stone-100 text-stone-700 px-3 py-1 rounded-full font-semibold">
                Customer Checkout Flow Updates Instantly
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-2">
              {/* Option 1: Custom UPI & QR */}
              <div
                onClick={() => setConfig({ ...config, activeMode: 'CUSTOM_UPI_QR' })}
                className={`p-5 rounded-2xl border-2 cursor-pointer transition-all ${
                  config.activeMode === 'CUSTOM_UPI_QR'
                    ? 'border-amber-500 bg-amber-50/70 shadow-md ring-2 ring-amber-400/20'
                    : 'border-stone-200 bg-stone-50 hover:bg-white hover:border-stone-300'
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-500 text-stone-950 flex items-center justify-center font-bold">
                    <QrCode className="w-5 h-5" />
                  </div>
                  {config.activeMode === 'CUSTOM_UPI_QR' && (
                    <CheckCircle2 className="w-5 h-5 text-amber-600 fill-amber-100" />
                  )}
                </div>
                <h3 className="font-serif font-bold text-base text-stone-900">
                  Direct Admin UPI &amp; QR
                </h3>
                <p className="text-xs text-stone-600 mt-1 leading-relaxed">
                  Money goes directly into Admin&apos;s personal/business UPI account. Zero gateway fees. Customer submits UTR receipt.
                </p>
                <div className="mt-3 text-[10px] font-bold uppercase tracking-wider text-amber-800 bg-amber-200/60 px-2 py-0.5 rounded-md inline-block">
                  0% Gateway Commission
                </div>
              </div>

              {/* Option 2: Payment Gateway */}
              <div
                onClick={() => setConfig({ ...config, activeMode: 'PAYMENT_GATEWAY' })}
                className={`p-5 rounded-2xl border-2 cursor-pointer transition-all ${
                  config.activeMode === 'PAYMENT_GATEWAY'
                    ? 'border-emerald-600 bg-emerald-50/70 shadow-md ring-2 ring-emerald-400/20'
                    : 'border-stone-200 bg-stone-50 hover:bg-white hover:border-stone-300'
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold">
                    <CreditCard className="w-5 h-5" />
                  </div>
                  {config.activeMode === 'PAYMENT_GATEWAY' && (
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 fill-emerald-100" />
                  )}
                </div>
                <h3 className="font-serif font-bold text-base text-stone-900">
                  Online Payment Gateway
                </h3>
                <p className="text-xs text-stone-600 mt-1 leading-relaxed">
                  Collect payments automatically via Razorpay, Cashfree, or Stripe. Supports Cards, NetBanking, and instant webhooks.
                </p>
                <div className="mt-3 text-[10px] font-bold uppercase tracking-wider text-emerald-800 bg-emerald-200/60 px-2 py-0.5 rounded-md inline-block">
                  Automated Webhook Sync
                </div>
              </div>

              {/* Option 3: Hybrid (Recommended) */}
              <div
                onClick={() => setConfig({ ...config, activeMode: 'HYBRID' })}
                className={`p-5 rounded-2xl border-2 cursor-pointer transition-all ${
                  config.activeMode === 'HYBRID'
                    ? 'border-indigo-600 bg-indigo-50/70 shadow-md ring-2 ring-indigo-400/20'
                    : 'border-stone-200 bg-stone-50 hover:bg-white hover:border-stone-300'
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  {config.activeMode === 'HYBRID' && (
                    <CheckCircle2 className="w-5 h-5 text-indigo-600 fill-indigo-100" />
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <h3 className="font-serif font-bold text-base text-stone-900">
                    Hybrid Mode
                  </h3>
                  <span className="bg-indigo-600 text-white text-[9px] font-extrabold uppercase px-1.5 py-0.2 rounded-full">
                    Recommended
                  </span>
                </div>
                <p className="text-xs text-stone-600 mt-1 leading-relaxed">
                  Gives couples both options: Scan Admin QR Code / UPI (0% fee) OR pay with Credit/Debit Cards via Gateway.
                </p>
                <div className="mt-3 text-[10px] font-bold uppercase tracking-wider text-indigo-800 bg-indigo-200/60 px-2 py-0.5 rounded-md inline-block">
                  Maximum Flexibility
                </div>
              </div>

              {/* Option 4: Direct Escrow NEFT/RTGS */}
              <div
                onClick={() => setConfig({ ...config, activeMode: 'BANK_NEFT_RTGS' })}
                className={`p-5 rounded-2xl border-2 cursor-pointer transition-all ${
                  config.activeMode === 'BANK_NEFT_RTGS'
                    ? 'border-purple-600 bg-purple-50/70 shadow-md ring-2 ring-purple-400/20'
                    : 'border-stone-200 bg-stone-50 hover:bg-white hover:border-stone-300'
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 rounded-xl bg-purple-600 text-white flex items-center justify-center font-bold">
                    <Building2 className="w-5 h-5" />
                  </div>
                  {config.activeMode === 'BANK_NEFT_RTGS' && (
                    <CheckCircle2 className="w-5 h-5 text-purple-600 fill-purple-100" />
                  )}
                </div>
                <h3 className="font-serif font-bold text-base text-stone-900">
                  Bank NEFT / RTGS Escrow
                </h3>
                <p className="text-xs text-stone-600 mt-1 leading-relaxed">
                  Best for high-value palace weddings (₹10 Lakhs+). Shows direct corporate escrow bank coordinates for RTGS wire transfer.
                </p>
                <div className="mt-3 text-[10px] font-bold uppercase tracking-wider text-purple-800 bg-purple-200/60 px-2 py-0.5 rounded-md inline-block">
                  High-Ticket Security
                </div>
              </div>
            </div>
          </div>

          {/* 2. ADMIN CUSTOM UPI & QR CODE DETAILS */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Form settings */}
            <div className="lg:col-span-2 bg-white rounded-3xl p-6 sm:p-8 border border-stone-200 shadow-sm space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-stone-100">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-900 flex items-center justify-center font-bold">
                    <QrCode className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-serif font-bold text-lg text-stone-900">
                      Admin UPI ID &amp; QR Code Settings
                    </h3>
                    <p className="text-xs text-stone-500">Configure your direct UPI handle and payee details for customer scanning</p>
                  </div>
                </div>
                <span className="text-xs font-mono font-bold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200">
                  Direct Bank Credit
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-stone-700 block mb-1">
                    Admin UPI ID (VPA) *
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={config.upi.upiId}
                      onChange={(e) => setConfig({
                        ...config,
                        upi: { ...config.upi, upiId: e.target.value }
                      })}
                      placeholder="e.g. 9305977591@ptaxis"
                      className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs font-mono font-bold text-stone-900 focus:outline-none focus:border-amber-500"
                    />
                    <button
                      type="button"
                      onClick={() => handleCopy(config.upi.upiId, 'upiId')}
                      className="absolute right-2.5 top-2.5 text-stone-400 hover:text-stone-700"
                      title="Copy UPI ID"
                    >
                      {copiedKey === 'upiId' ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
                  <span className="text-[11px] text-stone-400 mt-1 block">
                    Supported: GPay, PhonePe, Paytm, BHIM, Cred, Amazon Pay
                  </span>
                </div>

                <div>
                  <label className="text-xs font-bold text-stone-700 block mb-1">
                    Payee / Merchant Business Name *
                  </label>
                  <input
                    type="text"
                    value={config.upi.merchantName}
                    onChange={(e) => setConfig({
                      ...config,
                      upi: { ...config.upi, merchantName: e.target.value }
                    })}
                    placeholder="e.g. Vows &amp; Venues Luxury Hospitality"
                    className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs font-semibold text-stone-900 focus:outline-none focus:border-amber-500"
                  />
                  <span className="text-[11px] text-stone-400 mt-1 block">
                    This business name will appear on client&apos;s banking app
                  </span>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-stone-700 block mb-1">
                  Custom Static QR Code Image (Upload File or Enter URL)
                </label>
                <div className="flex flex-col sm:flex-row gap-2 items-stretch sm:items-center">
                  <input
                    type="text"
                    value={config.upi.qrImageUrl}
                    onChange={(e) => setConfig({
                      ...config,
                      upi: { ...config.upi, qrImageUrl: e.target.value }
                    })}
                    placeholder="/images/paytm_upi_qr.png or image URL"
                    className="flex-1 px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-800 font-mono focus:outline-none focus:border-amber-500"
                  />
                  <label className="px-4 py-2.5 rounded-xl bg-amber-100 hover:bg-amber-200 text-amber-950 font-bold text-xs cursor-pointer border border-amber-300 flex items-center justify-center gap-1.5 shrink-0 transition-colors">
                    <QrCode className="w-3.5 h-3.5 text-amber-800" />
                    <span>Upload QR Image</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0]
                        if (file) {
                          const reader = new FileReader()
                          reader.onload = () => {
                            setConfig(prev => ({
                              ...prev,
                              upi: { ...prev.upi, qrImageUrl: reader.result }
                            }))
                            toast.success('New QR code loaded into preview!')
                          }
                          reader.readAsDataURL(file)
                        }
                      }}
                    />
                  </label>
                </div>
                <p className="text-[11px] text-stone-500 mt-1">
                  Active QR: Paytm UPI QR for Sakshi Singh (<span className="font-mono font-semibold text-stone-800">9305977591@ptaxis</span>). Upload a replacement image or specify an asset path anytime.
                </p>
              </div>

              {/* Verification Controls */}
              <div className="pt-3 border-t border-stone-100 space-y-3">
                <span className="text-xs font-bold text-stone-800 block">
                  Customer Checkout Verification Rules:
                </span>

                <div className="flex items-center justify-between p-3 rounded-xl bg-stone-50 border border-stone-200">
                  <div>
                    <span className="text-xs font-bold text-stone-800 block">Require 12-Digit UTR Reference Number</span>
                    <span className="text-[11px] text-stone-500">Customer must enter their UPI transaction ID before order confirms</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={config.upi.requireUtr}
                    onChange={(e) => setConfig({
                      ...config,
                      upi: { ...config.upi, requireUtr: e.target.checked }
                    })}
                    className="w-4 h-4 accent-amber-600 rounded cursor-pointer"
                  />
                </div>

                <div className="flex items-center justify-between p-3 rounded-xl bg-stone-50 border border-stone-200">
                  <div>
                    <span className="text-xs font-bold text-stone-800 block">Auto WhatsApp Payment Alert to Concierge</span>
                    <span className="text-[11px] text-stone-500">Ping admin WhatsApp whenever a new customer submits a UPI payment</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={config.upi.autoWhatsAppReceipt}
                    onChange={(e) => setConfig({
                      ...config,
                      upi: { ...config.upi, autoWhatsAppReceipt: e.target.checked }
                    })}
                    className="w-4 h-4 accent-amber-600 rounded cursor-pointer"
                  />
                </div>
              </div>
            </div>

            {/* Live QR Preview Widget */}
            <div className="bg-gradient-to-b from-stone-900 to-stone-950 text-white rounded-3xl p-6 border border-amber-400/30 shadow-xl flex flex-col items-center text-center justify-between">
              <div>
                <span className="text-[10px] font-bold text-amber-300 uppercase tracking-widest bg-amber-400/20 px-2.5 py-0.5 rounded-full border border-amber-400/30">
                  Customer View Preview
                </span>
                <h4 className="font-serif font-bold text-lg text-white mt-2">
                  Admin Live UPI QR
                </h4>
                <p className="text-[11px] text-stone-400 mt-0.5">
                  This QR code appears directly during customer checkout
                </p>
              </div>

              {/* QR Image Box */}
              <div className="my-4 p-3 bg-white rounded-2xl shadow-2xl border-4 border-amber-400">
                <img
                  src={config.upi.qrImageUrl || dynamicQrUrl}
                  alt="Admin UPI QR"
                  className="w-48 h-48 object-contain rounded-lg"
                />
              </div>

              <div className="w-full space-y-1.5">
                <div className="bg-stone-800/80 p-2.5 rounded-xl border border-stone-700/60">
                  <span className="text-[10px] text-stone-400 block font-mono">UPI ID:</span>
                  <span className="font-mono font-bold text-amber-300 text-xs">
                    {config.upi.upiId}
                  </span>
                </div>
                <div className="text-[11px] text-stone-400 flex items-center justify-center gap-2 pt-1">
                  <span>BHIM</span> • <span>GPay</span> • <span>PhonePe</span> • <span>Paytm</span>
                </div>
              </div>
            </div>
          </div>

          {/* 3. ONLINE PAYMENT GATEWAY CONFIG (Razorpay / Cashfree) */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200 shadow-sm space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-900 flex items-center justify-center font-bold">
                  <CreditCard className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-serif font-bold text-lg text-stone-900">
                    Online Payment Gateway Credentials
                  </h3>
                  <p className="text-xs text-stone-500">API keys for automated credit/debit cards and NetBanking checkout</p>
                </div>
              </div>

              {/* Environment Toggle */}
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-stone-600">Environment:</span>
                <button
                  type="button"
                  onClick={() => setConfig({
                    ...config,
                    gateway: { ...config.gateway, isLive: !config.gateway.isLive }
                  })}
                  className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 transition-all ${
                    config.gateway.isLive
                      ? 'bg-rose-600 text-white shadow-sm'
                      : 'bg-amber-100 text-amber-900 border border-amber-300'
                  }`}
                >
                  {config.gateway.isLive ? <Lock className="w-3 h-3" /> : <Unlock className="w-3 h-3" />}
                  <span>{config.gateway.isLive ? 'LIVE / PRODUCTION' : 'TEST / SANDBOX'}</span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="text-xs font-bold text-stone-700 block mb-1">
                  Gateway Provider
                </label>
                <select
                  value={config.gateway.provider}
                  onChange={(e) => setConfig({
                    ...config,
                    gateway: { ...config.gateway, provider: e.target.value }
                  })}
                  className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs font-bold text-stone-900 focus:outline-none"
                >
                  <option value="razorpay">Razorpay (Cards, NetBanking, UPI)</option>
                  <option value="cashfree">Cashfree Payments (Escrow Ready)</option>
                  <option value="stripe">Stripe (International Cards)</option>
                  <option value="paytm">Paytm Payment Gateway</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-stone-700 block mb-1">
                  Key ID / Client ID *
                </label>
                <input
                  type="text"
                  value={config.gateway.keyId}
                  onChange={(e) => setConfig({
                    ...config,
                    gateway: { ...config.gateway, keyId: e.target.value }
                  })}
                  placeholder="rzp_live_xxxxxxxx"
                  className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs font-mono font-bold text-stone-900 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-stone-700 block mb-1">
                  Key Secret *
                </label>
                <div className="relative">
                  <input
                    type={showSecret ? 'text' : 'password'}
                    value={config.gateway.keySecret}
                    onChange={(e) => setConfig({
                      ...config,
                      gateway: { ...config.gateway, keySecret: e.target.value }
                    })}
                    placeholder="••••••••••••••••"
                    className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs font-mono font-bold text-stone-900 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowSecret(!showSecret)}
                    className="absolute right-2.5 top-2.5 text-stone-400 hover:text-stone-700"
                  >
                    {showSecret ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
              <div>
                <label className="text-xs font-bold text-stone-700 block mb-1">
                  Webhook Secret (For Automated Server Callbacks)
                </label>
                <input
                  type="text"
                  value={config.gateway.webhookSecret}
                  onChange={(e) => setConfig({
                    ...config,
                    gateway: { ...config.gateway, webhookSecret: e.target.value }
                  })}
                  placeholder="whsec_xxxxxxxx"
                  className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs font-mono text-stone-800 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-stone-700 block mb-1">
                  Platform Convenience Fee
                </label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    value={config.gateway.convenienceFeeAmount}
                    onChange={(e) => setConfig({
                      ...config,
                      gateway: { ...config.gateway, convenienceFeeAmount: Number(e.target.value) }
                    })}
                    className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs font-bold text-stone-900 focus:outline-none"
                  />
                  <span className="px-3 py-2 bg-stone-100 rounded-xl text-xs font-bold text-stone-600 flex items-center">
                    ₹ INR
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* 4. ESCROW BANK NEFT/RTGS ACCOUNT DETAILS */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-purple-100 text-purple-900 flex items-center justify-center font-bold">
                  <Building2 className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-serif font-bold text-lg text-stone-900">
                    Escrow NEFT / RTGS Bank Coordinates
                  </h3>
                  <p className="text-xs text-stone-500">Corporate escrow accounts for luxury palace advances (₹5L+)</p>
                </div>
              </div>
              <span className="text-xs font-bold text-purple-800 bg-purple-50 px-2.5 py-1 rounded-full border border-purple-200">
                High-Value Wire Transfer
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              <div>
                <label className="text-xs font-bold text-stone-700 block mb-1">Bank Name</label>
                <input
                  type="text"
                  value={config.bank.bankName}
                  onChange={(e) => setConfig({
                    ...config,
                    bank: { ...config.bank, bankName: e.target.value }
                  })}
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs font-semibold text-stone-900"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-stone-700 block mb-1">Beneficiary Name</label>
                <input
                  type="text"
                  value={config.bank.accountHolder}
                  onChange={(e) => setConfig({
                    ...config,
                    bank: { ...config.bank, accountHolder: e.target.value }
                  })}
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs font-semibold text-stone-900"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-stone-700 block mb-1">Account Number</label>
                <input
                  type="text"
                  value={config.bank.accountNumber}
                  onChange={(e) => setConfig({
                    ...config,
                    bank: { ...config.bank, accountNumber: e.target.value }
                  })}
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs font-mono font-bold text-stone-900"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-stone-700 block mb-1">IFSC Code</label>
                <input
                  type="text"
                  value={config.bank.ifsc}
                  onChange={(e) => setConfig({
                    ...config,
                    bank: { ...config.bank, ifsc: e.target.value }
                  })}
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs font-mono font-bold text-stone-900"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 2: INBOUND PAYMENT UTR VERIFICATIONS INBOX */}
      {/* ============================================================== */}
      {activeTab === 'inbox' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-stone-100">
            <div>
              <span className="text-[11px] font-bold text-stone-400 uppercase tracking-wider block">
                Verification Queue
              </span>
              <h2 className="font-serif text-xl sm:text-2xl font-bold text-stone-900 mt-0.5">
                Inbound Customer Payments &amp; UTR Submissions
              </h2>
              <p className="text-xs text-stone-500 mt-0.5">
                Review UPI QR receipts and gateway transactions submitted by wedding couples
              </p>
            </div>

            {/* Search & Filter */}
            <div className="flex items-center gap-2 flex-wrap">
              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-stone-400" />
                <input
                  type="text"
                  value={txSearch}
                  onChange={(e) => setTxSearch(e.target.value)}
                  placeholder="Search client, UTR, booking..."
                  className="pl-8 pr-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs font-medium focus:outline-none w-56"
                />
              </div>

              <select
                value={txStatusFilter}
                onChange={(e) => setTxStatusFilter(e.target.value)}
                className="px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs font-bold text-stone-800 focus:outline-none cursor-pointer"
              >
                <option value="ALL">All Statuses ({transactions.length})</option>
                <option value="PENDING_VERIFICATION">Pending Verification</option>
                <option value="VERIFIED">Verified / Paid</option>
                <option value="REJECTED">Rejected</option>
              </select>
            </div>
          </div>

          {/* Transactions List */}
          <div className="divide-y divide-stone-100">
            {filteredTxs.length === 0 ? (
              <div className="py-12 text-center text-stone-400 text-xs">
                No payment submissions matching criteria.
              </div>
            ) : (
              filteredTxs.map(tx => (
                <div key={tx.id} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-serif font-bold text-stone-900 text-base">
                        {tx.clientName}
                      </span>
                      <span className="text-xs font-mono font-bold text-stone-500 bg-stone-100 px-2 py-0.5 rounded-md">
                        {tx.bookingId}
                      </span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                        tx.status === 'VERIFIED'
                          ? 'bg-emerald-100 text-emerald-800'
                          : tx.status === 'PENDING_VERIFICATION'
                            ? 'bg-amber-100 text-amber-800 animate-pulse'
                            : 'bg-rose-100 text-rose-800'
                      }`}>
                        {tx.status.replace('_', ' ')}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 text-xs text-stone-500">
                      <span>📱 {tx.clientPhone}</span>
                      <span>📅 {tx.date}</span>
                      <span className="font-medium text-stone-700">
                        Method: <strong className="text-stone-900">{tx.method}</strong>
                      </span>
                    </div>

                    <div className="text-xs text-stone-600 pt-0.5 flex items-center gap-2">
                      <span>Submitted UTR / Ref:</span>
                      <span className="font-mono font-bold text-stone-900 bg-stone-100 px-2 py-0.5 rounded border border-stone-200">
                        {tx.utr}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleCopy(tx.utr, tx.id)}
                        className="text-stone-400 hover:text-stone-700"
                        title="Copy UTR"
                      >
                        {copiedKey === tx.id ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>

                    {tx.notes && (
                      <p className="text-[11px] text-stone-400 italic">
                        &quot;{tx.notes}&quot;
                      </p>
                    )}
                  </div>

                  {/* Right side: Amount & Action buttons */}
                  <div className="sm:text-right shrink-0 space-y-2">
                    <div className="font-serif font-bold text-xl text-emerald-950">
                      ₹{tx.amount.toLocaleString('en-IN')}
                    </div>
                    <div className="text-[10px] text-stone-400 uppercase tracking-widest font-semibold">
                      Advance Received
                    </div>

                    <div className="flex items-center gap-1.5 sm:justify-end pt-1">
                      {tx.status === 'PENDING_VERIFICATION' && (
                        <>
                          <button
                            onClick={() => handleVerifyTransaction(tx.id)}
                            className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow flex items-center gap-1"
                          >
                            <Check className="w-3.5 h-3.5" />
                            <span>Verify &amp; Confirm</span>
                          </button>
                          <button
                            onClick={() => handleRejectTransaction(tx.id)}
                            className="px-3 py-1.5 rounded-lg bg-stone-100 hover:bg-rose-50 text-rose-700 font-bold text-xs"
                          >
                            Reject
                          </button>
                        </>
                      )}

                      <button
                        onClick={() => handleOpenWhatsApp(tx)}
                        className="px-3 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold text-xs flex items-center gap-1"
                        title="Chat with couple on WhatsApp"
                      >
                        <Send className="w-3 h-3" />
                        <span>WhatsApp</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}
