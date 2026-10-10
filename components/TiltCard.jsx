'use client'

import React, { useRef, useState, useEffect } from 'react'

export default function TiltCard({
  children,
  className = '',
  maxTilt = 7, // Subtle, refined degrees of tilt
  scale = 1.015,
  glare = true
}) {
  const cardRef = useRef(null)
  const [transform, setTransform] = useState('perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)')
  const [glarePosition, setGlarePosition] = useState({ x: 50, y: 50, opacity: 0 })
  const [isHovered, setIsHovered] = useState(false)
  const [reducedMotion, setReducedMotion] = useState(false)

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const media = window.matchMedia('(prefers-reduced-motion: reduce)')
      setReducedMotion(media.matches)
    }
  }, [])

  const handleMouseMove = (e) => {
    if (reducedMotion) return
    const card = cardRef.current
    if (!card) return

    const rect = card.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    const centerX = rect.width / 2
    const centerY = rect.height / 2

    const rotateX = ((y - centerY) / centerY) * -maxTilt
    const rotateY = ((x - centerX) / centerX) * maxTilt

    setIsHovered(true)
    setTransform(`perspective(1100px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) scale3d(${scale}, ${scale}, ${scale})`)

    if (glare) {
      const glareX = (x / rect.width) * 100
      const glareY = (y / rect.height) * 100
      setGlarePosition({ x: glareX, y: glareY, opacity: 0.30 })
    }
  }

  const handleMouseLeave = () => {
    setIsHovered(false)
    setTransform('perspective(1100px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)')
    if (glare) {
      setGlarePosition(prev => ({ ...prev, opacity: 0 }))
    }
  }

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        transform,
        transition: isHovered
          ? 'transform 0.12s cubic-bezier(0.25, 1, 0.5, 1)'
          : 'transform 0.6s cubic-bezier(0.16, 1, 0.3, 1)'
      }}
      className={`relative transform-gpu will-change-transform ${className}`}
    >
      {children}

      {/* Dynamic Specular 3D Glare */}
      {glare && !reducedMotion && (
        <div
          className="absolute inset-0 rounded-[inherit] pointer-events-none transition-opacity duration-300 z-30"
          style={{
            opacity: glarePosition.opacity,
            background: `radial-gradient(circle 340px at ${glarePosition.x}% ${glarePosition.y}%, rgba(255, 235, 190, 0.25), transparent 75%)`
          }}
        />
      )}
    </div>
  )
}
