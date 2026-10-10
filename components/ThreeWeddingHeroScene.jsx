'use client'

import React, { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'

export default function ThreeWeddingHeroScene() {
  const containerRef = useRef(null)
  const [hasWebGL, setHasWebGL] = useState(true)
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    // 1. Check WebGL availability
    try {
      const testCanvas = document.createElement('canvas')
      const gl = testCanvas.getContext('webgl') || testCanvas.getContext('experimental-webgl')
      if (!gl) {
        setHasWebGL(false)
        return
      }
    } catch (e) {
      setHasWebGL(false)
      return
    }

    const container = containerRef.current
    if (!container) return

    // Check prefers-reduced-motion
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    // 2. Scene, Camera, Renderer Setup
    const scene = new THREE.Scene()
    // Soft atmospheric haze with subtle royal wine/champagne tone
    scene.fog = new THREE.FogExp2(0x16070e, 0.032)

    let width = container.clientWidth || window.innerWidth
    let height = container.clientHeight || window.innerHeight

    // Perspective camera with natural 46° FOV for editorial architectural framing
    const camera = new THREE.PerspectiveCamera(46, width / height, 0.1, 100)
    
    // Dynamic camera distance based on aspect ratio to guarantee columns frame the viewport edges
    const isMobile = width < 768
    const initialCamZ = isMobile ? 6.2 : 5.2
    camera.position.set(0, 1.35, initialCamZ)

    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      powerPreference: 'high-performance'
    })
    renderer.setSize(width, height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, isMobile ? 1.5 : 2))
    renderer.toneMapping = THREE.ACESFilmicToneMapping
    renderer.toneMappingExposure = 1.18
    container.appendChild(renderer.domElement)

    // 3. Volumetric Studio Lighting (Warm Ivory, Antique Gold, Royal Wine)
    const ambientLight = new THREE.AmbientLight(0xfff7ed, 0.85) // Warm ivory ambient
    scene.add(ambientLight)

    // Key Golden-Hour Sun Light
    const sunLight = new THREE.DirectionalLight(0xffeed6, 1.8)
    sunLight.position.set(5, 7, 3.5)
    scene.add(sunLight)

    // Subtle Deep Burgundy Rim Fill Light
    const burgundyRimLight = new THREE.PointLight(0x6e1b32, 2.0, 14)
    burgundyRimLight.position.set(-4.5, 2.0, 2.0)
    scene.add(burgundyRimLight)

    // Left Colonnade Sconce Warm Flame
    const leftSconceLight = new THREE.PointLight(0xffb84d, 2.2, 9)
    leftSconceLight.position.set(-3.2, 2.3, 0.2)
    scene.add(leftSconceLight)

    // Right Colonnade Sconce Warm Flame
    const rightSconceLight = new THREE.PointLight(0xffb84d, 2.2, 9)
    rightSconceLight.position.set(3.2, 2.3, 0.2)
    scene.add(rightSconceLight)

    // Background Mandap Sacred Diya Light (Far distance, soft romantic center glow)
    const diyaLight = new THREE.PointLight(0xff9e2c, 1.8, 8)
    diyaLight.position.set(0, 1.1, -4.8)
    scene.add(diyaLight)

    // 4. Architectural Materials (High-Fidelity PBR)
    const makaranaMarbleMaterial = new THREE.MeshStandardMaterial({
      color: 0xfcf8f2, // Makarana royal white marble
      roughness: 0.16,
      metalness: 0.08
    })

    const plinthMarbleMaterial = new THREE.MeshStandardMaterial({
      color: 0x221319, // Deep burgundy-charcoal polished stone plinth
      roughness: 0.24,
      metalness: 0.12
    })

    const antiqueGoldMaterial = new THREE.MeshStandardMaterial({
      color: 0xdfb76c, // 24K Royal Antique Champagne Gold
      roughness: 0.22,
      metalness: 0.88
    })

    const sacredFlameMaterial = new THREE.MeshBasicMaterial({
      color: 0xffdd88
    })

    // 5. Build Architectural Colonnade (Framing Left & Right Wings)
    const pavilionGroup = new THREE.Group()

    // Helper: Build a classical Indian Palace Column with multi-tiered plinth and lotus capital
    const createPalaceColumn = (x, z) => {
      const colGroup = new THREE.Group()
      colGroup.position.set(x, 0, z)

      // 1. Stepped Plinth Base
      const plinthBase = new THREE.Mesh(
        new THREE.BoxGeometry(0.62, 0.22, 0.62),
        plinthMarbleMaterial
      )
      plinthBase.position.y = 0.11
      colGroup.add(plinthBase)

      const plinthMolding = new THREE.Mesh(
        new THREE.CylinderGeometry(0.26, 0.31, 0.16, 28),
        antiqueGoldMaterial
      )
      plinthMolding.position.y = 0.30
      colGroup.add(plinthMolding)

      // 2. Classical Fluted Shaft
      const shaft = new THREE.Mesh(
        new THREE.CylinderGeometry(0.17, 0.20, 3.8, 28),
        makaranaMarbleMaterial
      )
      shaft.position.y = 2.28
      colGroup.add(shaft)

      // Shaft Lower & Mid Rings
      const lowerRing = new THREE.Mesh(
        new THREE.TorusGeometry(0.19, 0.025, 12, 28),
        antiqueGoldMaterial
      )
      lowerRing.rotation.x = Math.PI / 2
      lowerRing.position.y = 0.65
      colGroup.add(lowerRing)

      const upperRing = new THREE.Mesh(
        new THREE.TorusGeometry(0.17, 0.025, 12, 28),
        antiqueGoldMaterial
      )
      upperRing.rotation.x = Math.PI / 2
      upperRing.position.y = 3.9
      colGroup.add(upperRing)

      // 3. Flared Lotus Capital
      const lotusCapital = new THREE.Mesh(
        new THREE.CylinderGeometry(0.30, 0.17, 0.35, 16),
        antiqueGoldMaterial
      )
      lotusCapital.position.y = 4.35
      colGroup.add(lotusCapital)

      // 4. Square Abacus Slab
      const abacus = new THREE.Mesh(
        new THREE.BoxGeometry(0.58, 0.16, 0.58),
        makaranaMarbleMaterial
      )
      abacus.position.y = 4.58
      colGroup.add(abacus)

      return colGroup
    }

    // Determine horizontal column spread: columns flank outer margins leaving central text zone 100% unobstructed
    const spreadInner = isMobile ? 2.5 : 3.4
    const spreadOuter = isMobile ? 3.3 : 4.4

    // Left Colonnade
    const leftInnerCol = createPalaceColumn(-spreadInner, 0.2)
    const leftOuterCol = createPalaceColumn(-spreadOuter, -1.2)
    pavilionGroup.add(leftInnerCol)
    pavilionGroup.add(leftOuterCol)

    // Right Colonnade
    const rightInnerCol = createPalaceColumn(spreadInner, 0.2)
    const rightOuterCol = createPalaceColumn(spreadOuter, -1.2)
    pavilionGroup.add(rightInnerCol)
    pavilionGroup.add(rightOuterCol)

    // Sconce Lantern Brackets on Inner Columns
    const createLantern = (x, y, z) => {
      const lanternGroup = new THREE.Group()
      lanternGroup.position.set(x, y, z)

      const arm = new THREE.Mesh(
        new THREE.CylinderGeometry(0.02, 0.02, 0.35, 8),
        antiqueGoldMaterial
      )
      arm.rotation.z = x > 0 ? Math.PI / 4 : -Math.PI / 4
      lanternGroup.add(arm)

      const housing = new THREE.Mesh(
        new THREE.OctahedronGeometry(0.12, 0),
        antiqueGoldMaterial
      )
      housing.position.set(x > 0 ? -0.18 : 0.18, 0.1, 0.1)
      lanternGroup.add(housing)

      const flame = new THREE.Mesh(
        new THREE.SphereGeometry(0.045, 12, 12),
        sacredFlameMaterial
      )
      flame.position.copy(housing.position)
      lanternGroup.add(flame)

      return lanternGroup
    }

    pavilionGroup.add(createLantern(-spreadInner + 0.15, 2.3, 0.2))
    pavilionGroup.add(createLantern(spreadInner - 0.15, 2.3, 0.2))

    // High Royal Arch spanning OVER the entire scene (y = 4.65, comfortably above headline)
    const archRadius = isMobile ? 2.6 : 3.6
    const archGeom = new THREE.TorusGeometry(archRadius, 0.045, 16, 48, Math.PI)
    const royalGrandArch = new THREE.Mesh(archGeom, antiqueGoldMaterial)
    royalGrandArch.position.set(0, 4.65, 0.1)
    pavilionGroup.add(royalGrandArch)

    // Secondary decorative cusped arch rib
    const innerArchGeom = new THREE.TorusGeometry(archRadius - 0.25, 0.025, 12, 48, Math.PI)
    const royalInnerArch = new THREE.Mesh(innerArchGeom, antiqueGoldMaterial)
    royalInnerArch.position.set(0, 4.65, -0.3)
    pavilionGroup.add(royalInnerArch)

    // 6. Deep-Background Sacred Mandap Pavilion (Positioned at z = -4.8 in deep perspective)
    const backgroundMandap = new THREE.Group()
    backgroundMandap.position.set(0, 0, -4.8)

    // Tiered Circular Dais
    const dais = new THREE.Mesh(
      new THREE.CylinderGeometry(1.6, 1.8, 0.22, 32),
      plinthMarbleMaterial
    )
    dais.position.y = 0.11
    backgroundMandap.add(dais)

    const daisGoldRim = new THREE.Mesh(
      new THREE.TorusGeometry(1.62, 0.03, 12, 32),
      antiqueGoldMaterial
    )
    daisGoldRim.rotation.x = Math.PI / 2
    daisGoldRim.position.y = 0.22
    backgroundMandap.add(daisGoldRim)

    // 4 Slender Pavilion Stanchions
    const stanchionGeom = new THREE.CylinderGeometry(0.055, 0.075, 1.8, 16)
    const stanchionPositions = [
      [-0.85, 0.95, -0.85],
      [0.85, 0.95, -0.85],
      [-0.85, 0.95, 0.85],
      [0.85, 0.95, 0.85]
    ]
    stanchionPositions.forEach(([sx, sy, sz]) => {
      const stan = new THREE.Mesh(stanchionGeom, antiqueGoldMaterial)
      stan.position.set(sx, sy, sz)
      backgroundMandap.add(stan)
    })

    // Miniature Golden Chhatri Dome Crown at far depth
    const domeGeom = new THREE.SphereGeometry(0.95, 24, 16, 0, Math.PI * 2, 0, Math.PI / 2)
    const dome = new THREE.Mesh(domeGeom, antiqueGoldMaterial)
    dome.position.y = 1.85
    backgroundMandap.add(dome)

    // Glowing Sacred Diya in Center Altar
    const diyaBase = new THREE.Mesh(
      new THREE.CylinderGeometry(0.18, 0.12, 0.12, 16),
      antiqueGoldMaterial
    )
    diyaBase.position.y = 0.28
    backgroundMandap.add(diyaBase)

    const diyaFlame = new THREE.Mesh(
      new THREE.SphereGeometry(0.07, 12, 12),
      sacredFlameMaterial
    )
    diyaFlame.position.y = 0.38
    backgroundMandap.add(diyaFlame)

    pavilionGroup.add(backgroundMandap)
    scene.add(pavilionGroup)

    // 7. Organic Floating Rose & Marigold Petals (Tasteful, Slow, Natural Movement)
    // Desktop: 30 petals, Mobile: 14 petals
    const petalCount = isMobile ? 14 : 30
    
    // Slight curved petal geometry using a segmented plane with gentle curve
    const petalGeom = new THREE.PlaneGeometry(0.10, 0.14, 2, 2)
    // Subtle physical curvature along vertex positions for realism
    const posAttr = petalGeom.attributes.position
    posAttr.setZ(0, 0.02)
    posAttr.setZ(2, 0.02)
    posAttr.setZ(6, 0.02)
    posAttr.setZ(8, 0.02)
    posAttr.needsUpdate = true

    const petalMatRed = new THREE.MeshStandardMaterial({
      color: 0x8f152b, // Royal Velvet Rose Crimson
      side: THREE.DoubleSide,
      roughness: 0.55
    })
    const petalMatGold = new THREE.MeshStandardMaterial({
      color: 0xf59e0b, // Fresh Amber Marigold
      side: THREE.DoubleSide,
      roughness: 0.45
    })
    const petalMatBlush = new THREE.MeshStandardMaterial({
      color: 0xc44569, // Twilight Blush Rose
      side: THREE.DoubleSide,
      roughness: 0.52
    })

    const petals = []
    for (let i = 0; i < petalCount; i++) {
      const rand = Math.random()
      const mat = rand > 0.65 ? petalMatGold : rand > 0.3 ? petalMatRed : petalMatBlush
      const petalMesh = new THREE.Mesh(petalGeom, mat)

      // Random scale for natural variance
      const s = 0.6 + Math.random() * 0.7
      petalMesh.scale.set(s, s, s)

      petalMesh.position.set(
        (Math.random() - 0.5) * (isMobile ? 5 : 9),
        Math.random() * 6.0 + 0.2,
        (Math.random() - 0.5) * 5.5 + 0.5
      )
      petalMesh.rotation.set(
        Math.random() * Math.PI * 2,
        Math.random() * Math.PI * 2,
        Math.random() * Math.PI * 2
      )

      petalMesh.userData = {
        speedY: 0.003 + Math.random() * 0.004, // Very slow, graceful falling
        speedX: 0.002 + Math.random() * 0.003,
        rotSpeedX: (Math.random() - 0.5) * 0.015,
        rotSpeedY: (Math.random() - 0.5) * 0.018,
        rotSpeedZ: (Math.random() - 0.5) * 0.012,
        swayFreq: 0.8 + Math.random() * 1.2,
        swayOffset: Math.random() * Math.PI * 2
      }

      scene.add(petalMesh)
      petals.push(petalMesh)
    }

    // 8. Cursor Interactive Parallax (Desktop) & Ambient Breathing (Mobile)
    let mouseX = 0
    let mouseY = 0
    let targetCamX = 0
    let targetCamY = 0

    const handleMouseMove = (e) => {
      if (prefersReducedMotion) return
      mouseX = (e.clientX / window.innerWidth) * 2 - 1
      mouseY = -(e.clientY / window.innerHeight) * 2 + 1
    }
    window.addEventListener('mousemove', handleMouseMove, { passive: true })

    // 9. 60fps Animation Loop
    let animationFrameId
    const clock = new THREE.Clock()

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate)
      const elapsedTime = clock.getElapsedTime()

      if (!prefersReducedMotion) {
        // Desktop gentle cursor parallax interpolation
        if (!isMobile) {
          targetCamX += (mouseX * 0.35 - targetCamX) * 0.04
          targetCamY += (mouseY * 0.18 - targetCamY) * 0.04
          camera.position.x = targetCamX
          camera.position.y = 1.35 + targetCamY
          camera.lookAt(0, 1.45, -1.0)
        } else {
          // Mobile lightweight ambient breathing motion
          camera.position.x = Math.sin(elapsedTime * 0.4) * 0.08
          camera.position.y = 1.35 + Math.cos(elapsedTime * 0.3) * 0.05
          camera.lookAt(0, 1.45, -1.0)
        }

        // Slow, organic petal drift physics
        petals.forEach((p) => {
          p.position.y -= p.userData.speedY
          p.position.x += Math.sin(elapsedTime * p.userData.swayFreq + p.userData.swayOffset) * p.userData.speedX
          p.rotation.x += p.userData.rotSpeedX
          p.rotation.y += p.userData.rotSpeedY
          p.rotation.z += p.userData.rotSpeedZ

          // Respawn petal gracefully above the camera view
          if (p.position.y < -0.2) {
            p.position.y = 6.2 + Math.random() * 0.5
            p.position.x = (Math.random() - 0.5) * (isMobile ? 5 : 9)
            p.position.z = (Math.random() - 0.5) * 5.5 + 0.5
          }
        })

        // Gentle flickering lantern flames
        const flicker = Math.sin(elapsedTime * 3.5) * 0.18 + Math.cos(elapsedTime * 7.2) * 0.10
        leftSconceLight.intensity = 2.2 + flicker
        rightSconceLight.intensity = 2.2 - flicker
        diyaLight.intensity = 1.8 + flicker * 1.2
      }

      renderer.render(scene, camera)
    }

    animate()
    setIsLoaded(true)

    // 10. Responsive Resize Handler
    const handleResize = () => {
      if (!container) return
      width = container.clientWidth
      height = container.clientHeight
      camera.aspect = width / height
      
      const currentIsMobile = width < 768
      camera.position.z = currentIsMobile ? 6.2 : 5.2
      camera.updateProjectionMatrix()
      renderer.setSize(width, height)
    }
    window.addEventListener('resize', handleResize)

    // 11. Cleanup
    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('resize', handleResize)
      cancelAnimationFrame(animationFrameId)
      if (container && renderer.domElement) {
        container.removeChild(renderer.domElement)
      }
      renderer.dispose()
      scene.clear()
    }
  }, [])

  if (!hasWebGL) return null

  return (
    <div
      ref={containerRef}
      className={`absolute inset-0 pointer-events-none z-10 overflow-hidden transition-opacity duration-1000 ${
        isLoaded ? 'opacity-100' : 'opacity-0'
      }`}
      aria-hidden="true"
    />
  )
}
