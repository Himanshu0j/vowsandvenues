'use client'

import React, { useState } from 'react'
import {
  DollarSign,
  ShieldCheck,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Send,
  Building2,
  Calendar,
  Lock,
  ArrowRight,
  Download,
  RefreshCw,
  FileCheck
} from 'lucide-react'
import { toast } from 'sonner'

export const INITIAL_MILESTONE_CONTRACTS = [
  {
    id: 'contract_01',
    bookingId: 'VV-8491',
    coupleName: 'Aanya Singhania & Kabir Kapoor',
    venueName: 'The Royal Lake Palace & Gardens',
    totalContractValue: 6500000,
    cautionDeposit: 100000,
    cautionDepositStatus: 'HELD_IN_ESCROW',
    stages: [
      { name: 'Token Advance (20%)', amount: 1300000, dueDate: '2026-10-01', status: 'RELEASED_TO_VENDOR', paidDate: '2026-10-02', escrowReleased: true },
      { name: '2nd Milestone (40%)', amount: 2600000, dueDate: '2026-11-14', status: 'HELD_IN_ESCROW', paidDate: '2026-10-10', escrowReleased: false },
      { name: 'Final Balance (40%)', amount: 2600000, dueDate: '2026-12-07', status: 'PENDING_CLIENT_PAYMENT', paidDate: null, escrowReleased: false }
    ]
  },
  {
    id: 'contract_02',
    bookingId: 'VV-7201',
    coupleName: 'Simran Chawla & Rohan Oberoi',
    venueName: 'Umaid Bhawan Citadel & Lawns',
    totalContractValue: 8000000,
    cautionDeposit: 150000,
    cautionDepositStatus: 'REFUNDED_TO_CLIENT',
    stages: [
      { name: 'Token Advance (20%)', amount: 1600000, dueDate: '2026-09-25', status: 'RELEASED_TO_VENDOR', paidDate: '2026-09-25', escrowReleased: true },
      { name: '2nd Milestone (40%)', amount: 3200000, dueDate: '2026-10-15', status: 'RELEASED_TO_VENDOR', paidDate: '2026-10-12', escrowReleased: true },
      { name: 'Final Balance (40%)', amount: 3200000, dueDate: '2026-12-14', status: 'HELD_IN_ESCROW', paidDate: '2026-10-12', escrowReleased: false }
    ]
  },
  {
    id: 'contract_03',
    bookingId: 'VV-6102',
    coupleName: 'Dr. Meera Nambiar & Arjun Reddy',
    venueName: 'Rambagh Citadel & Mughal Gardens',
    totalContractValue: 3200000,
    cautionDeposit: 50000,
    cautionDepositStatus: 'HELD_IN_ESCROW',
    stages: [
      { name: 'Token Advance (20%)', amount: 640000, dueDate: '2026-10-05', status: 'RELEASED_TO_VENDOR', paidDate: '2026-10-05', escrowReleased: true },
      { name: '2nd Milestone (40%)', amount: 1280000, dueDate: '2027-01-05', status: 'UPCOMING', paidDate: null, escrowReleased: false },
      { name: 'Final Balance (40%)', amount: 1280000, dueDate: '2027-01-29', status: 'UPCOMING', paidDate: null, escrowReleased: false }
    ]
  }
]

export default function AdminMilestoneEscrow() {
  const [contracts, setContracts] = useState(INITIAL_MILESTONE_CONTRACTS)
  const [releaseActionBusy, setReleaseActionBusy] = useState(false)

  // Calculate totals
  const totalEscrowHeld = contracts.reduce((acc, c) => {
    const heldStages = c.stages
      .filter(s => s.status === 'HELD_IN_ESCROW' && !s.escrowReleased)
      .reduce((sum, s) => sum + s.amount, 0)
    const heldDeposit = c.cautionDepositStatus === 'HELD_IN_ESCROW' ? c.cautionDeposit : 0
    return acc + heldStages + heldDeposit
  }, 0)

  const totalReleased = contracts.reduce((acc, c) => {
    return acc + c.stages
      .filter(s => s.escrowReleased)
      .reduce((sum, s) => sum + s.amount, 0)
  }, 0)

  // Release Escrow Payout Handler
  const handleReleaseEscrow = (contractId, stageName) => {
    setReleaseActionBusy(true)
    setTimeout(() => {
      setContracts(prev => prev.map(c => {
        if (c.id !== contractId) return c
        return {
          ...c,
          stages: c.stages.map(s => {
            if (s.name !== stageName) return s
            return {
              ...s,
              status: 'RELEASED_TO_VENDOR',
              escrowReleased: true
            }
          })
        }
      }))
      setReleaseActionBusy(false)
      toast.success(`Escrow funds for "${stageName}" successfully released to Vendor Bank Account!`)
    }, 600)
  }

  // Caution Deposit Refund
  const handleRefundCautionDeposit = (contractId) => {
    setContracts(prev => prev.map(c => c.id === contractId ? { ...c, cautionDepositStatus: 'REFUNDED_TO_CLIENT' } : c))
    toast.success('Refundable caution deposit released back to couple!')
  }

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-stone-900 via-amber-950/80 to-stone-900 text-white rounded-2xl p-6 border border-amber-500/30 shadow-xl">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs font-semibold uppercase tracking-wider mb-2">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Multi-Stage Escrow Protection</span>
            </div>
            <h2 className="font-serif text-2xl font-bold text-white">Milestone Payments &amp; Escrow Releases</h2>
            <p className="text-xs text-stone-300 mt-1 max-w-2xl leading-relaxed">
              Standard Indian luxury wedding billing follows 20% / 40% / 40% split milestones. Funds are securely locked in escrow until Admin approval.
            </p>
          </div>

          <div className="flex items-center gap-2 bg-stone-900/80 px-4 py-2 rounded-xl border border-white/10">
            <Lock className="w-4 h-4 text-emerald-400" />
            <span className="text-xs text-stone-300 font-mono">100% Escrow Backed</span>
          </div>
        </div>

        {/* Financial KPI Row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6 pt-5 border-t border-white/10">
          <div>
            <span className="text-[11px] text-stone-400 uppercase tracking-wider block">Total Active Escrow Held</span>
            <span className="font-serif text-2xl font-bold text-champagne">
              ₹{(totalEscrowHeld / 100000).toFixed(2)} Lakhs
            </span>
            <span className="text-[10px] text-stone-400 block mt-0.5">Protected in Yes Bank Escrow A/c</span>
          </div>
          <div>
            <span className="text-[11px] text-stone-400 uppercase tracking-wider block">Total Payouts Released to Vendors</span>
            <span className="font-serif text-2xl font-bold text-emerald-400">
              ₹{(totalReleased / 100000).toFixed(2)} Lakhs
            </span>
            <span className="text-[10px] text-emerald-400/80 block mt-0.5">Verified milestone settlements</span>
          </div>
          <div>
            <span className="text-[11px] text-stone-400 uppercase tracking-wider block">Refundable Caution Deposits</span>
            <span className="font-serif text-2xl font-bold text-white">
              ₹{(contracts.reduce((a, b) => a + b.cautionDeposit, 0) / 100000).toFixed(2)} Lakhs
            </span>
            <span className="text-[10px] text-stone-400 block mt-0.5">Damage waiver / noise limit deposit</span>
          </div>
        </div>
      </div>

      {/* Contracts & Milestones Breakdown */}
      <div className="space-y-4">
        {contracts.map((contract) => (
          <div
            key={contract.id}
            className="bg-white rounded-2xl p-5 border border-stone-200 shadow-sm space-y-4"
          >
            {/* Contract Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-stone-100">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold text-stone-500 bg-stone-100 px-2 py-0.5 rounded">
                    {contract.bookingId}
                  </span>
                  <h3 className="font-serif font-bold text-base text-stone-900">{contract.coupleName}</h3>
                </div>
                <div className="flex items-center gap-2 text-xs text-stone-500 mt-1">
                  <Building2 className="w-3.5 h-3.5 text-champagne" />
                  <span>{contract.venueName}</span>
                </div>
              </div>

              <div className="text-right">
                <span className="text-[11px] text-stone-400 uppercase block font-medium">Total Contract</span>
                <span className="font-serif text-lg font-bold text-stone-900">
                  ₹{(contract.totalContractValue / 100000).toFixed(2)} Lakhs
                </span>
              </div>
            </div>

            {/* Stages Grid (3 Columns) */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {contract.stages.map((stage, idx) => (
                <div
                  key={idx}
                  className={`p-4 rounded-xl border flex flex-col justify-between ${
                    stage.escrowReleased
                      ? 'bg-emerald-50/40 border-emerald-200 text-stone-800'
                      : stage.status === 'HELD_IN_ESCROW'
                      ? 'bg-amber-50/50 border-amber-300 text-stone-800'
                      : 'bg-stone-50 border-stone-200 text-stone-600'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between text-xs font-bold mb-1">
                      <span>{stage.name}</span>
                      <span className="font-mono">₹{(stage.amount / 100000).toFixed(1)}L</span>
                    </div>

                    <div className="text-[11px] space-y-0.5 text-stone-500 mb-3">
                      <div>Due: <span className="font-medium text-stone-700">{stage.dueDate}</span></div>
                      {stage.paidDate && (
                        <div>Paid by Client: <span className="font-medium text-emerald-700">{stage.paidDate}</span></div>
                      )}
                    </div>
                  </div>

                  <div>
                    {stage.escrowReleased ? (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-100 text-emerald-800 text-[11px] font-bold w-full justify-center">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Payout Released to Vendor</span>
                      </span>
                    ) : stage.status === 'HELD_IN_ESCROW' ? (
                      <button
                        onClick={() => handleReleaseEscrow(contract.id, stage.name)}
                        disabled={releaseActionBusy}
                        className="w-full py-2 rounded-lg bg-stone-900 hover:bg-black text-white text-[11px] font-bold shadow-xs transition-all flex items-center justify-center gap-1.5"
                      >
                        <ShieldCheck className="w-3.5 h-3.5 text-amber-300" />
                        <span>Release Escrow to Vendor</span>
                      </button>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-stone-200 text-stone-600 text-[11px] font-medium w-full justify-center">
                        <Clock className="w-3 h-3" />
                        <span>Awaiting Client Milestone Payment</span>
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Caution Deposit Footer */}
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs bg-stone-50 p-3 rounded-xl border border-stone-200/80">
              <div className="flex items-center gap-2">
                <Lock className="w-4 h-4 text-champagne" />
                <span>
                  <strong>Security / Caution Deposit:</strong> ₹{(contract.cautionDeposit).toLocaleString('en-IN')}
                </span>
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                  contract.cautionDepositStatus === 'REFUNDED_TO_CLIENT'
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'bg-amber-100 text-amber-800'
                }`}>
                  {contract.cautionDepositStatus}
                </span>
              </div>

              {contract.cautionDepositStatus === 'HELD_IN_ESCROW' && (
                <button
                  onClick={() => handleRefundCautionDeposit(contract.id)}
                  className="px-3 py-1 rounded-lg bg-white border border-stone-300 hover:bg-stone-100 text-stone-700 font-bold text-[11px]"
                >
                  Refund Deposit to Client
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
