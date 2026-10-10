'use client'

import React, { useEffect, useState } from 'react'
import { motion, useReducedMotion } from 'framer-motion'

export const smoothSpring = {
  duration: 0.75,
  ease: [0.16, 1, 0.3, 1]
}

export default function ScrollReveal({
  children,
  className = '',
  animation = 'fade-up', // 'fade-up' | 'fade-down' | 'fade-left' | 'fade-right' | 'zoom-in' | 'line-reveal'
  delay = 0,
  duration = 0.75,
  amount = 0.18,
  once = true,
  yOffset = 28,
  xOffset = 32
}) {
  const shouldReduceMotion = useReducedMotion()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Static fallback if motion is reduced or during initial SSR render
  if (shouldReduceMotion || !mounted) {
    return <div className={className}>{children}</div>
  }

  const variantsMap = {
    'fade-up': {
      hidden: { opacity: 0, y: yOffset },
      visible: {
        opacity: 1,
        y: 0,
        transition: { duration, delay, ease: [0.16, 1, 0.3, 1] }
      }
    },
    'fade-down': {
      hidden: { opacity: 0, y: -yOffset },
      visible: {
        opacity: 1,
        y: 0,
        transition: { duration, delay, ease: [0.16, 1, 0.3, 1] }
      }
    },
    'fade-left': {
      hidden: { opacity: 0, x: -xOffset },
      visible: {
        opacity: 1,
        x: 0,
        transition: { duration, delay, ease: [0.16, 1, 0.3, 1] }
      }
    },
    'fade-right': {
      hidden: { opacity: 0, x: xOffset },
      visible: {
        opacity: 1,
        x: 0,
        transition: { duration, delay, ease: [0.16, 1, 0.3, 1] }
      }
    },
    'zoom-in': {
      hidden: { opacity: 0, scale: 0.96 },
      visible: {
        opacity: 1,
        scale: 1,
        transition: { duration, delay, ease: [0.16, 1, 0.3, 1] }
      }
    },
    'line-reveal': {
      hidden: { opacity: 0, y: 36, clipPath: 'inset(0 0 100% 0)' },
      visible: {
        opacity: 1,
        y: 0,
        clipPath: 'inset(0 0 0% 0)',
        transition: { duration: 0.85, delay, ease: [0.16, 1, 0.3, 1] }
      }
    }
  }

  const selectedVariant = variantsMap[animation] || variantsMap['fade-up']

  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once, amount }}
      variants={selectedVariant}
      className={className}
    >
      {children}
    </motion.div>
  )
}

/**
 * Stagger Container component for grids of cards
 */
export function ScrollStaggerContainer({
  children,
  className = '',
  staggerDelay = 0.08,
  delayChildren = 0.05,
  amount = 0.15,
  once = true
}) {
  const shouldReduceMotion = useReducedMotion()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (shouldReduceMotion || !mounted) {
    return <div className={className}>{children}</div>
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: staggerDelay,
        delayChildren
      }
    }
  }

  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once, amount }}
      variants={containerVariants}
      className={className}
    >
      {children}
    </motion.div>
  )
}

/**
 * Individual Stagger Item for cards inside ScrollStaggerContainer
 */
export function ScrollStaggerItem({
  children,
  className = '',
  yOffset = 24
}) {
  const shouldReduceMotion = useReducedMotion()

  if (shouldReduceMotion) {
    return <div className={className}>{children}</div>
  }

  const itemVariants = {
    hidden: { opacity: 0, y: yOffset },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.65, ease: [0.16, 1, 0.3, 1] }
    }
  }

  return (
    <motion.div variants={itemVariants} className={className}>
      {children}
    </motion.div>
  )
}
