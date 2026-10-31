'use client'

import { useEffect, useRef } from 'react'

export default function GlobalErrorTracker() {
  const lastReportedRef = useRef(new Map())

  useEffect(() => {
    if (typeof window === 'undefined') return

    const sendError = async ({ message, stack, source, severity = 'error', component, metadata = {} }) => {
      try {
        const msg = String(message || 'Unknown client error')
        const now = Date.now()

        // Client-side debounce: ignore duplicate message within 10 seconds
        const lastTime = lastReportedRef.current.get(msg)
        if (lastTime && now - lastTime < 10000) {
          return
        }
        lastReportedRef.current.set(msg, now)

        // Read stored user / token info if available
        let userEmail = null
        let userId = null
        let userRole = 'guest'
        try {
          const storedUser = localStorage.getItem('vv_user')
          if (storedUser) {
            const parsed = JSON.parse(storedUser)
            userId = parsed.id || parsed._id
            userEmail = parsed.email
            userRole = parsed.role || 'customer'
          }
        } catch (_) {}

        const token = localStorage.getItem('vv_token') || localStorage.getItem('vv_auth_token') || ''

        const payload = {
          message: msg,
          stack: stack || null,
          source: source || 'frontend_runtime',
          severity,
          path: window.location.pathname + window.location.search,
          component: component || null,
          userId,
          userEmail,
          userRole,
          userAgent: navigator.userAgent,
          metadata: {
            ...metadata,
            viewport: `${window.innerWidth}x${window.innerHeight}`,
            screen: `${window.screen.width}x${window.screen.height}`,
            referrer: document.referrer || '',
            online: navigator.onLine,
            reportedAt: new Date().toISOString()
          }
        }

        // Fire and forget via keepalive fetch
        fetch('/api/system/errors', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {})
          },
          body: JSON.stringify(payload),
          keepalive: true
        }).catch(() => {})
      } catch (_) {}
    }

    // Expose global manual reporter for any app component
    window.__vv_reportError = (err, customMeta = {}) => {
      const msg = err?.message || String(err)
      const stack = err?.stack || null
      sendError({
        message: msg,
        stack,
        source: customMeta.source || 'manual_report',
        severity: customMeta.severity || 'error',
        component: customMeta.component || 'Application',
        metadata: customMeta
      })
    }

    // 1. Uncaught window error
    const handleWindowError = (event) => {
      // Ignore chrome extension noise or known browser cross-origin script issues
      const filename = event.filename || ''
      if (filename.startsWith('chrome-extension://') || filename.startsWith('moz-extension://')) {
        return
      }
      // Ignore benign PerformanceServerTiming DataCloneError
      if (event.error instanceof DOMException && event.error.name === 'DataCloneError') {
        return
      }

      sendError({
        message: event.message || (event.error && event.error.message) || 'Uncaught window error',
        stack: event.error?.stack || `${filename}:${event.lineno}:${event.colno}`,
        source: 'frontend_runtime',
        severity: 'error',
        component: filename ? filename.split('/').pop() : 'window.onerror',
        metadata: {
          filename,
          lineno: event.lineno,
          colno: event.colno
        }
      })
    }

    // 2. Unhandled promise rejection
    const handleRejection = (event) => {
      const reason = event.reason
      let message = 'Unhandled Promise Rejection'
      let stack = null

      if (typeof reason === 'string') {
        message = reason
      } else if (reason instanceof Error) {
        message = reason.message
        stack = reason.stack
      } else if (reason && typeof reason === 'object') {
        message = reason.message || JSON.stringify(reason).slice(0, 500)
      }

      // Ignore cancelled fetch or user abort
      if (message.includes('AbortError') || message.includes('signal is aborted')) {
        return
      }

      sendError({
        message,
        stack,
        source: 'unhandled_promise',
        severity: 'error',
        component: 'Promise',
        metadata: {
          reasonType: typeof reason
        }
      })
    }

    window.addEventListener('error', handleWindowError)
    window.addEventListener('unhandledrejection', handleRejection)

    return () => {
      window.removeEventListener('error', handleWindowError)
      window.removeEventListener('unhandledrejection', handleRejection)
    }
  }, [])

  return null
}
