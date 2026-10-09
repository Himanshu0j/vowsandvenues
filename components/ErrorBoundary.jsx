'use client'

import React from 'react'

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, errorInfo) {
    console.error('[VOWS & VENUES] Client component caught exception:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="max-w-3xl mx-auto my-12 p-8 bg-white/95 backdrop-blur-xl border-2 border-rose-200 rounded-3xl shadow-xl text-center space-y-4">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center font-bold text-2xl border border-rose-200">
            ⚠️
          </div>
          <h2 className="font-serif text-2xl font-bold text-stone-900">
            {this.props.fallbackTitle || 'Workspace View Notice'}
          </h2>
          <p className="text-xs text-stone-600 max-w-md mx-auto leading-relaxed">
            {this.state.error?.message || 'A transient client-side state issue was encountered. Click below to reload or return home.'}
          </p>
          <div className="pt-4 flex items-center justify-center gap-3">
            <button
              onClick={() => {
                this.setState({ hasError: false, error: null })
                if (typeof window !== 'undefined') window.location.href = '/'
              }}
              className="px-5 py-2.5 rounded-full bg-[#4a1525] text-amber-200 font-bold text-xs shadow-md hover:brightness-110 transition-all cursor-pointer"
            >
              Return to Home
            </button>
            <button
              onClick={() => {
                this.setState({ hasError: false, error: null })
                if (typeof window !== 'undefined') window.location.reload()
              }}
              className="px-5 py-2.5 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-800 font-semibold text-xs border border-stone-200 transition-all cursor-pointer"
            >
              Reload View
            </button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
