'use client'

import React, { useState } from 'react'
import {
  FileText,
  DollarSign,
  Download,
  Building,
  CheckCircle2,
  Calendar,
  Layers,
  Percent,
  Printer,
  ShieldCheck
} from 'lucide-react'
import { toast } from 'sonner'

export const INITIAL_INVOICES = [
  {
    invoiceNumber: 'VV-GST-2026-0089',
    bookingId: 'VV-8491',
    date: '2026-10-02',
    clientName: 'Aanya Singhania & Kabir Kapoor',
    clientGSTIN: '08AABCS1429B1Z2',
    venueName: 'The Royal Lake Palace & Gardens',
    sacCode: '9985 (Event Concierge)',
    taxableAmount: 1101695,
    cgst: 99153, // 9%
    sgst: 99153, // 9%
    igst: 0,
    totalInvoiceAmount: 1300000,
    tcsAmount: 11017, // 1% TCS
    status: 'PAID'
  },
  {
    invoiceNumber: 'VV-GST-2026-0088',
    bookingId: 'VV-7201',
    date: '2026-09-25',
    clientName: 'Simran Chawla & Rohan Oberoi',
    clientGSTIN: '07AAACS9821A1Z5',
    venueName: 'Umaid Bhawan Citadel & Lawns',
    sacCode: '9972 (Venue Rental)',
    taxableAmount: 1355932,
    cgst: 0,
    sgst: 0,
    igst: 244068, // 18% IGST
    totalInvoiceAmount: 1600000,
    tcsAmount: 13559, // 1% TCS
    status: 'PAID'
  }
]

export default function AdminGSTCompliance() {
  const [invoices, setInvoices] = useState(INITIAL_INVOICES)
  const [selectedMonth, setSelectedMonth] = useState('October 2026')
  const [activeInvoicePreview, setActiveInvoicePreview] = useState(null)

  // Monthly totals
  const totalGTV = invoices.reduce((acc, i) => acc + i.totalInvoiceAmount, 0)
  const totalTaxable = invoices.reduce((acc, i) => acc + i.taxableAmount, 0)
  const totalGST = invoices.reduce((acc, i) => acc + (i.cgst + i.sgst + i.igst), 0)
  const totalTCS = invoices.reduce((acc, i) => acc + i.tcsAmount, 0)

  const handleExportCSV = () => {
    const headers = 'Invoice No,Booking ID,Date,Client,GSTIN,SAC Code,Taxable Value,CGST (9%),SGST (9%),IGST (18%),Total Amount,1% TCS\n'
    const rows = invoices.map(i =>
      `"${i.invoiceNumber}","${i.bookingId}","${i.date}","${i.clientName}","${i.clientGSTIN}","${i.sacCode}",${i.taxableAmount},${i.cgst},${i.sgst},${i.igst},${i.totalInvoiceAmount},${i.tcsAmount}`
    ).join('\n')

    const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `Vows_Venues_GST_Monthly_Report_${selectedMonth.replace(' ', '_')}.csv`
    link.click()
    toast.success('GST compliance tax report downloaded for CA / Accountant!')
  }

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-stone-900 via-stone-950 to-stone-900 text-white rounded-2xl p-6 border border-champagne/30 shadow-xl">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-champagne/20 border border-champagne/40 text-champagne text-xs font-semibold uppercase tracking-wider mb-2">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Government of India GST &amp; E-Commerce Tax Suite</span>
            </div>
            <h2 className="font-serif text-2xl font-bold text-white">Indian GST &amp; Compliance Invoicing</h2>
            <p className="text-xs text-stone-300 mt-1 max-w-2xl leading-relaxed">
              Automated 18% GST (SAC 9985 / 9972) calculation, Section 52 TCS 1% collection, CGST/SGST/IGST reconciliation, and monthly CA-ready tax reports.
            </p>
          </div>

          <button
            onClick={handleExportCSV}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-champagne to-amber-400 hover:brightness-105 text-stone-900 font-bold text-xs shadow-md transition-all flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            <span>Export CA Monthly Report (CSV)</span>
          </button>
        </div>

        {/* GST KPI Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 pt-5 border-t border-white/10 text-xs">
          <div>
            <span className="text-[11px] text-stone-400 uppercase tracking-wider block">Gross Turnover (GTV)</span>
            <span className="font-serif text-xl font-bold text-white">
              ₹{(totalGTV).toLocaleString('en-IN')}
            </span>
          </div>
          <div>
            <span className="text-[11px] text-stone-400 uppercase tracking-wider block">Taxable Base Value</span>
            <span className="font-serif text-xl font-bold text-stone-200">
              ₹{(totalTaxable).toLocaleString('en-IN')}
            </span>
          </div>
          <div>
            <span className="text-[11px] text-stone-400 uppercase tracking-wider block">Total GST Collected (18%)</span>
            <span className="font-serif text-xl font-bold text-champagne">
              ₹{(totalGST).toLocaleString('en-IN')}
            </span>
          </div>
          <div>
            <span className="text-[11px] text-stone-400 uppercase tracking-wider block">1% TCS E-Commerce</span>
            <span className="font-serif text-xl font-bold text-emerald-400">
              ₹{(totalTCS).toLocaleString('en-IN')}
            </span>
          </div>
        </div>
      </div>

      {/* Invoices List Table */}
      <div className="bg-white rounded-2xl p-5 border border-stone-200 shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-stone-200">
          <div>
            <h3 className="font-serif font-bold text-base text-stone-900">Tax Invoices Register</h3>
            <span className="text-xs text-stone-500">Platform GSTIN: 07AAACV9842F1Z8 (Delhi Principal Place of Business)</span>
          </div>
          <span className="text-xs font-bold text-stone-600 bg-stone-100 px-3 py-1 rounded-lg">
            {selectedMonth}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-stone-200 text-stone-500 uppercase tracking-wider text-[10px] bg-stone-50/60">
                <th className="p-3">Invoice # / Date</th>
                <th className="p-3">Client / GSTIN</th>
                <th className="p-3">Venue / SAC Code</th>
                <th className="p-3">Taxable Value</th>
                <th className="p-3">GST (CGST/SGST/IGST)</th>
                <th className="p-3">Total Amount</th>
                <th className="p-3 text-right">Invoice View</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {invoices.map(inv => (
                <tr key={inv.invoiceNumber} className="hover:bg-stone-50/50 transition-colors">
                  <td className="p-3">
                    <span className="font-mono font-bold text-stone-900 block">{inv.invoiceNumber}</span>
                    <span className="text-[10px] text-stone-400">{inv.date} · Booking {inv.bookingId}</span>
                  </td>

                  <td className="p-3">
                    <span className="font-semibold text-stone-800 block">{inv.clientName}</span>
                    <span className="font-mono text-[10px] text-stone-400">GSTIN: {inv.clientGSTIN}</span>
                  </td>

                  <td className="p-3">
                    <span className="text-stone-800 block truncate max-w-[150px]">{inv.venueName}</span>
                    <span className="text-[10px] text-champagne font-bold font-mono">SAC {inv.sacCode}</span>
                  </td>

                  <td className="p-3 font-mono font-medium text-stone-700">
                    ₹{(inv.taxableAmount).toLocaleString('en-IN')}
                  </td>

                  <td className="p-3 font-mono text-[11px] text-stone-600">
                    {inv.igst > 0 ? (
                      <span>IGST: ₹{(inv.igst).toLocaleString('en-IN')}</span>
                    ) : (
                      <span>CGST: ₹{(inv.cgst).toLocaleString('en-IN')} + SGST: ₹{(inv.sgst).toLocaleString('en-IN')}</span>
                    )}
                  </td>

                  <td className="p-3 font-mono font-bold text-stone-900">
                    ₹{(inv.totalInvoiceAmount).toLocaleString('en-IN')}
                  </td>

                  <td className="p-3 text-right">
                    <button
                      onClick={() => setActiveInvoicePreview(inv)}
                      className="px-2.5 py-1.5 rounded-lg border border-stone-200 hover:bg-stone-100 text-stone-700 font-bold text-[11px]"
                    >
                      View Invoice
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* INVOICE PREVIEW MODAL */}
      {activeInvoicePreview && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-stone-200 text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-stone-200 mb-4">
              <div>
                <h3 className="font-serif font-bold text-base text-stone-900">Tax Invoice</h3>
                <span className="font-mono text-[11px] text-stone-500">{activeInvoicePreview.invoiceNumber}</span>
              </div>
              <button onClick={() => setActiveInvoicePreview(null)} className="font-bold text-stone-400 hover:text-stone-700">✕</button>
            </div>

            <div className="space-y-3 bg-stone-50 p-4 rounded-xl border border-stone-200/80 mb-4 font-mono text-[11px]">
              <div className="flex justify-between">
                <span className="text-stone-500">Issuer:</span>
                <strong>Vows &amp; Venues Hospitality Pvt Ltd</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-500">GSTIN:</span>
                <span>07AAACV9842F1Z8</span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-500">Billed To:</span>
                <span>{activeInvoicePreview.clientName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-500">Client GSTIN:</span>
                <span>{activeInvoicePreview.clientGSTIN}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-500">Service:</span>
                <span>SAC {activeInvoicePreview.sacCode}</span>
              </div>
              <div className="pt-2 border-t flex justify-between font-bold text-stone-900 text-xs">
                <span>Total Amount Paid:</span>
                <span className="text-champagne">₹{(activeInvoicePreview.totalInvoiceAmount).toLocaleString('en-IN')}</span>
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <button onClick={() => setActiveInvoicePreview(null)} className="px-4 py-2 font-bold text-stone-600">Close</button>
              <button onClick={() => { window.print(); toast.success('Print dialog opened'); }} className="px-4 py-2 bg-stone-900 text-white font-bold rounded-lg flex items-center gap-1.5">
                <Printer className="w-3.5 h-3.5" />
                <span>Print Invoice</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
