'use client'

import React from 'react'
import { motion, useReducedMotion } from 'framer-motion'

export const luxuryEasing = [0.16, 1, 0.3, 1]

/**
 * Directional Scroll Reveal Container
 */
export default function ScrollReveal({
  children,
  className = '',
  animation = 'fade-up', // 'fade-up' | 'fade-down' | 'fade-left' | 'fade-right' | 'zoom-in' | 'clip-reveal'
  delay = 0,
  duration = 0.8,
  amount = 0.12,
  once = true,
  yOffset = 36,
  xOffset = 42
}) {
  const shouldReduceMotion = useReducedMotion()

  if (shouldReduceMotion) {
    return <div className={className}>{children}</div>
  }

  const variantsMap = {
    'fade-up': {
      hidden: { opacity: 0, y: yOffset },
      visible: {
        opacity: 1,
        y: 0,
        transition: { duration, delay, ease: luxuryEasing }
      }
    },
    'fade-down': {
      hidden: { opacity: 0, y: -yOffset },
      visible: {
        opacity: 1,
        y: 0,
        transition: { duration, delay, ease: luxuryEasing }
      }
    },
    'fade-left': {
      hidden: { opacity: 0, x: -xOffset },
      visible: {
        opacity: 1,
        x: 0,
        transition: { duration, delay, ease: luxuryEasing }
      }
    },
    'fade-right': {
      hidden: { opacity: 0, x: xOffset },
      visible: {
        opacity: 1,
        x: 0,
        transition: { duration, delay, ease: luxuryEasing }
      }
    },
    'zoom-in': {
      hidden: { opacity: 0, scale: 0.94 },
      visible: {
        opacity: 1,
        scale: 1,
        transition: { duration, delay, ease: luxuryEasing }
      }
    },
    'clip-reveal': {
      hidden: { opacity: 0, clipPath: 'inset(10% 0% 10% 0%)' },
      visible: {
        opacity: 1,
        clipPath: 'inset(0% 0% 0% 0%)',
        transition: { duration: duration + 0.1, delay, ease: luxuryEasing }
      }
    }
  }

  const selectedVariant = variantsMap[animation] || variantsMap['fade-up']

  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once, amount, margin: '0px 0px -40px 0px' }}
      variants={selectedVariant}
      className={className}
    >
      {children}
    </motion.div>
  )
}

/**
 * Text Line Reveal (The Signature Reference Masking Animation)
 * Splits lines into overflow-hidden wrappers and slides them up
 */
export function TextLineReveal({
  lines = [],
  className = '',
  lineClassName = '',
  stagger = 0.12,
  delay = 0,
  amount = 0.15,
  once = true
}) {
  const shouldReduceMotion = useReducedMotion()

  if (shouldReduceMotion) {
    return (
      <div className={className}>
        {lines.map((line, idx) => (
          <div key={idx} className={lineClassName}>{line}</div>
        ))}
      </div>
    )
  }

  const containerVariants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: stagger,
        delayChildren: delay
      }
    }
  }

  const lineVariants = {
    hidden: {
      y: '115%',
      opacity: 0
    },
    visible: {
      y: '0%',
      opacity: 1,
      transition: {
        duration: 0.85,
        ease: luxuryEasing
      }
    }
  }

  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once, amount, margin: '0px 0px -40px 0px' }}
      variants={containerVariants}
      className={className}
    >
      {lines.map((line, idx) => (
        <span key={idx} className="block overflow-hidden pb-1">
          <motion.span variants={lineVariants} className={`block ${lineClassName}`}>
            {line}
          </motion.span>
        </span>
      ))}
    </motion.div>
  )
}

/**
 * Image Reveal with Smooth Scale & Mask
 */
export function ImageReveal({
  src,
  alt = '',
  className = '',
  imgClassName = '',
  delay = 0,
  duration = 0.95,
  once = true,
  children
}) {
  const shouldReduceMotion = useReducedMotion()

  if (shouldReduceMotion) {
    return (
      <div className={`overflow-hidden relative ${className}`}>
        <img src={src} alt={alt} className={`w-full h-full object-cover ${imgClassName}`} />
        {children}
      </div>
    )
  }

  const containerVariants = {
    hidden: {
      opacity: 0,
      y: 35
    },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration,
        delay,
        ease: luxuryEasing
      }
    }
  }

  const imgVariants = {
    hidden: {
      scale: 1.12
    },
    visible: {
      scale: 1,
      transition: {
        duration: duration + 0.2,
        delay,
        ease: luxuryEasing
      }
    }
  }

  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once, amount: 0.15, margin: '0px 0px -40px 0px' }}
      variants={containerVariants}
      className={`overflow-hidden relative ${className}`}
    >
      <motion.img
        src={src}
        alt={alt}
        variants={imgVariants}
        className={`w-full h-full object-cover ${imgClassName}`}
      />
      {children}
    </motion.div>
  )
}

/**
 * Stagger Container for Grids of Cards
 */
export function ScrollStaggerContainer({
  children,
  className = '',
  staggerDelay = 0.08,
  delayChildren = 0.04,
  amount = 0.1,
  once = true
}) {
  const shouldReduceMotion = useReducedMotion()

  if (shouldReduceMotion) {
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
      viewport={{ once, amount, margin: '0px 0px -30px 0px' }}
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
  yOffset = 30
}) {
  const shouldReduceMotion = useReducedMotion()

  if (shouldReduceMotion) {
    return <div className={className}>{children}</div>
  }

  const itemVariants = {
    hidden: {
      opacity: 0,
      y: yOffset,
      scale: 0.97
    },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: 0.65,
        ease: luxuryEasing
      }
    }
  }

  return (
    <motion.div variants={itemVariants} className={className}>
      {children}
    </motion.div>
  )
}
