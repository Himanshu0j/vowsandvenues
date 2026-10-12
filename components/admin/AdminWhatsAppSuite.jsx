'use client'

import React, { useState } from 'react'
import {
  Send,
  MessageSquare,
  Sparkles,
  Phone,
  CheckCircle2,
  Clock,
  Copy,
  Plus,
  RefreshCw,
  BellRing,
  ExternalLink,
  ShieldCheck,
  Smartphone
} from 'lucide-react'
import { toast } from 'sonner'

export const INITIAL_TEMPLATES = [
  {
    id: 'tpl_counter_offer',
    title: 'Negotiation Counter-Offer Alert',
    trigger: 'Vendor submits counter-offer in live negotiation',
    category: 'Negotiations',
    variables: ['{{couple_name}}', '{{vendor_name}}', '{{counter_price}}', '{{original_price}}', '{{link}}'],
    body: 'Namaste {{couple_name}}! ✨\n\nExclusive update from Vows & Venues Concierge:\n{{vendor_name}} has sent an exclusive counter-offer of ₹{{counter_price}} (previously ₹{{original_price}}).\n\nReview & accept before it expires:\n{{link}}\n\nWarm regards,\nVows & Venues Royal Concierge'
  },
  {
    id: 'tpl_token_confirmed',
    title: 'Token Advance & Contract Confirmation',
    trigger: 'Client pays initial 20% token advance',
    category: 'Bookings',
    variables: ['{{couple_name}}', '{{venue_name}}', '{{event_date}}', '{{booking_id}}', '{{receipt_url}}'],
    body: 'Badhaai Ho! 🎊 Your royal wedding booking at {{venue_name}} is officially locked in for {{event_date}}!\n\nBooking ID: {{booking_id}}\nToken Advance Paid: Verified via Escrow.\n\nDownload GST Tax Invoice & Escrow Guarantee:\n{{receipt_url}}\n\nYour dedicated planner will connect shortly.'
  },
  {
    id: 'tpl_recce_reminder',
    title: '24-Hour Site Recce Reminder',
    trigger: '24 hours prior to scheduled venue inspection',
    category: 'Site Visits',
    variables: ['{{couple_name}}', '{{venue_name}}', '{{time}}', '{{coordinator_name}}', '{{coordinator_phone}}'],
    body: 'Namaste {{couple_name}}! 🏰\n\nYour site recce inspection at {{venue_name}} is confirmed for tomorrow at {{time}}.\n\nPalace Coordinator: {{coordinator_name}}\nDirect Phone: {{coordinator_phone}}\n\nComplimentary valet and bridal hospitality lounge will be ready upon arrival.'
  },
  {
    id: 'tpl_milestone_due',
    title: 'Milestone 2 Payment Reminder',
    trigger: '30 days prior to wedding date',
    category: 'Finance',
    variables: ['{{couple_name}}', '{{amount}}', '{{due_date}}', '{{pay_link}}'],
    body: 'Namaste {{couple_name}}, gentle reminder regarding your upcoming wedding celebration.\n\nMilestone 2 installment of ₹{{amount}} is due on {{due_date}}.\n\nSecure 1-click escrow payment link:\n{{pay_link}}'
  }
]

export const RECENT_WHATSAPP_LOGS = [
  { id: 'wlog_1', phone: '+919820123456', recipient: 'Aanya & Kabir Kapoor', template: 'Negotiation Counter-Offer Alert', time: '12 mins ago', status: 'DELIVERED' },
  { id: 'wlog_2', phone: '+919876543210', recipient: 'Simran & Rohan Oberoi', template: 'Token Advance & Contract Confirmation', time: '1 hour ago', status: 'READ' },
  { id: 'wlog_3', phone: '+919920887766', recipient: 'Tanvi & Advait Deshmukh', template: '24-Hour Site Recce Reminder', time: '3 hours ago', status: 'DELIVERED' },
  { id: 'wlog_4', phone: '+919845012345', recipient: 'Dr. Meera & Arjun Reddy', template: 'Milestone 2 Payment Reminder', time: 'Yesterday', status: 'READ' }
]

export default function AdminWhatsAppSuite() {
  const [templates, setTemplates] = useState(INITIAL_TEMPLATES)
  const [logs, setLogs] = useState(RECENT_WHATSAPP_LOGS)
  const [testPhone, setTestPhone] = useState('+919820123456')
  const [selectedTemplateId, setSelectedTemplateId] = useState(INITIAL_TEMPLATES[0].id)
  const [customMsg, setCustomMsg] = useState(INITIAL_TEMPLATES[0].body)

  const handleSelectTemplate = (tpl) => {
    setSelectedTemplateId(tpl.id)
    setCustomMsg(tpl.body)
  }

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text)
    toast.success('WhatsApp text copied to clipboard!')
  }

  const handleSendTestPing = () => {
    const cleanPhone = testPhone.replace(/[^0-9]/g, '')
    if (!cleanPhone || cleanPhone.length < 10) {
      toast.error('Please enter a valid phone number with country code')
      return
    }

    // Replace dummy variables
    const filledText = customMsg
      .replace('{{couple_name}}', 'Aanya & Kabir')
      .replace('{{vendor_name}}', 'The Royal Nawabi Palace')
      .replace('{{venue_name}}', 'Rambagh Citadel')
      .replace('{{counter_price}}', '3,50,000')
      .replace('{{original_price}}', '4,20,000')
      .replace('{{event_date}}', '14 Dec 2026')
      .replace('{{booking_id}}', 'VV-8491')
      .replace('{{receipt_url}}', 'https://vowsandvenues-staging.onrender.com/receipt/VV-8491')
      .replace('{{link}}', 'https://vowsandvenues-staging.onrender.com/negotiate/neg_01')
      .replace('{{time}}', '11:30 AM')
      .replace('{{coordinator_name}}', 'Maharaj Vikram Singh')
      .replace('{{coordinator_phone}}', '+91 98290 12345')
      .replace('{{amount}}', '4,80,000')
      .replace('{{due_date}}', '15 Nov 2026')
      .replace('{{pay_link}}', 'https://vowsandvenues-staging.onrender.com/pay/milestone_2')

    const encoded = encodeURIComponent(filledText)
    window.open(`https://wa.me/${cleanPhone}?text=${encoded}`, '_blank')

    // Add to activity logs
    setLogs(prev => [
      {
        id: `wlog_${Date.now()}`,
        phone: testPhone,
        recipient: 'Direct WhatsApp Test',
        template: templates.find(t => t.id === selectedTemplateId)?.title || 'Custom Ping',
        time: 'Just now',
        status: 'SENT'
      },
      ...prev
    ])
    toast.success('WhatsApp launcher dispatched!')
  }

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-emerald-950 via-stone-900 to-stone-950 text-white rounded-2xl p-6 border border-emerald-500/30 shadow-xl">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 text-xs font-semibold uppercase tracking-wider mb-2">
              <Smartphone className="w-3.5 h-3.5" />
              <span>WhatsApp Business API &amp; Concierge Automation</span>
            </div>
            <h2 className="font-serif text-2xl font-bold text-white">Automated WhatsApp Communications</h2>
            <p className="text-xs text-stone-300 mt-1 max-w-2xl leading-relaxed">
              In Indian weddings, 92% of response engagement occurs on WhatsApp. Manage automated alerts, negotiation counters, recce reminders, and instant 1-click broadcasts.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold border border-emerald-500/40">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              API Connected: WhatsApp Cloud
            </span>
          </div>
        </div>
      </div>

      {/* Main Grid: Launcher + Template Manager */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* LEFT COLUMN: 1-Click Interactive WhatsApp Launcher (5 Cols) */}
        <div className="lg:col-span-5 bg-white rounded-2xl p-5 border border-stone-200 shadow-sm space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-stone-200">
            <Send className="w-4 h-4 text-emerald-600" />
            <h3 className="font-serif font-bold text-sm text-stone-900">Direct WhatsApp Concierge Launcher</h3>
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1">Recipient Phone Number (with Country Code)</label>
            <div className="relative">
              <Phone className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="tel"
                value={testPhone}
                onChange={(e) => setTestPhone(e.target.value)}
                placeholder="+919876543210"
                className="w-full pl-9 pr-3 py-2 text-xs font-mono font-medium rounded-lg border border-stone-200 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1">Select Template</label>
            <select
              value={selectedTemplateId}
              onChange={(e) => {
                const found = templates.find(t => t.id === e.target.value)
                if (found) handleSelectTemplate(found)
              }}
              className="w-full px-3 py-2 text-xs rounded-lg border border-stone-200 bg-stone-50 font-medium text-stone-800 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            >
              {templates.map(t => (
                <option key={t.id} value={t.id}>{t.title} ({t.category})</option>
              ))}
            </select>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-bold text-stone-700">Message Body Preview</label>
              <button
                type="button"
                onClick={() => handleCopy(customMsg)}
                className="text-[11px] text-emerald-700 hover:text-emerald-800 font-semibold flex items-center gap-1"
              >
                <Copy className="w-3 h-3" />
                <span>Copy</span>
              </button>
            </div>
            <textarea
              rows={8}
              value={customMsg}
              onChange={(e) => setCustomMsg(e.target.value)}
              className="w-full p-3 text-xs font-sans rounded-xl border border-stone-200 bg-emerald-50/20 text-stone-800 focus:ring-2 focus:ring-emerald-500 focus:outline-none leading-relaxed"
            />
          </div>

          <button
            onClick={handleSendTestPing}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2"
          >
            <Send className="w-4 h-4" />
            <span>Launch WhatsApp with Pre-Filled Message</span>
          </button>
        </div>

        {/* RIGHT COLUMN: Pre-Approved Templates & Live Broadcast Logs (7 Cols) */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Templates Library */}
          <div className="bg-white rounded-2xl p-5 border border-stone-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-stone-200">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-champagne" />
                <h3 className="font-serif font-bold text-sm text-stone-900">Pre-Approved Automated Templates</h3>
              </div>
              <span className="text-[11px] text-stone-500 font-medium">{templates.length} Active Templates</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {templates.map(tpl => (
                <div
                  key={tpl.id}
                  onClick={() => handleSelectTemplate(tpl)}
                  className={`p-3.5 rounded-xl border cursor-pointer transition-all text-left ${
                    selectedTemplateId === tpl.id
                      ? 'border-emerald-500 bg-emerald-50/40 ring-1 ring-emerald-500'
                      : 'border-stone-200 hover:border-stone-300 bg-stone-50/50'
                  }`}
                >
                  <div className="flex items-center justify-between gap-1 mb-1">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-stone-200 text-stone-700">
                      {tpl.category}
                    </span>
                    <span className="text-[10px] text-stone-400 font-medium">Meta Verified</span>
                  </div>
                  <h4 className="font-serif font-bold text-xs text-stone-900 mb-1">{tpl.title}</h4>
                  <p className="text-[11px] text-stone-500 line-clamp-2 leading-relaxed">
                    {tpl.trigger}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Activity / Broadcast Logs */}
          <div className="bg-white rounded-2xl p-5 border border-stone-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-stone-200">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-stone-500" />
                <h3 className="font-serif font-bold text-sm text-stone-900">Recent Automated WhatsApp Pings</h3>
              </div>
              <span className="text-[10px] text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded">
                Live Webhooks Active
              </span>
            </div>

            <div className="divide-y divide-stone-100">
              {logs.map(log => (
                <div key={log.id} className="py-2.5 flex items-center justify-between gap-2 text-xs">
                  <div>
                    <span className="font-semibold text-stone-900 block">{log.recipient}</span>
                    <span className="text-[10px] text-stone-500">{log.template} · {log.phone}</span>
                  </div>
                  <div className="text-right">
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                      <CheckCircle2 className="w-2.5 h-2.5" />
                      {log.status}
                    </span>
                    <span className="block text-[10px] text-stone-400 mt-0.5">{log.time}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>
    </div>
  )
}
