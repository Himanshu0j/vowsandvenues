'use client'

import React, { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'

export default function ThreeWeddingHeroScene() {
  const containerRef = useRef(null)
  const [hasWebGL, setHasWebGL] = useState(true)

  useEffect(() => {
    // Check WebGL availability
    try {
      const canvas = document.createElement('canvas')
      const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl')
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

    // 1. Scene, Camera, Renderer
    const scene = new THREE.Scene()
    // Soft atmospheric fog with warm twilight champagne tint
    scene.fog = new THREE.FogExp2(0x1a070f, 0.035)

    const width = container.clientWidth || window.innerWidth
    const height = container.clientHeight || window.innerHeight

    const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 100)
    camera.position.set(0, 1.2, 5.5)

    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      powerPreference: 'high-performance'
    })
    renderer.setSize(width, height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.toneMapping = THREE.ACESFilmicToneMapping
    renderer.toneMappingExposure = 1.15
    container.appendChild(renderer.domElement)

    // 2. Volumetric Lighting
    const ambientLight = new THREE.AmbientLight(0xffecd2, 0.8)
    scene.add(ambientLight)

    const sunLight = new THREE.DirectionalLight(0xffeedd, 1.6)
    sunLight.position.set(4, 6, 3)
    scene.add(sunLight)

    const royalWineLight = new THREE.PointLight(0xb33951, 2.5, 12)
    royalWineLight.position.set(-3, 2, 2)
    scene.add(royalWineLight)

    const goldChandelierLight = new THREE.PointLight(0xffd700, 3.0, 10)
    goldChandelierLight.position.set(0, 3.2, 0)
    scene.add(goldChandelierLight)

    // 3. 3D Architectural Mandap & Courtyard Geometry
    const mandapGroup = new THREE.Group()

    // Materials
    const marbleMaterial = new THREE.MeshStandardMaterial({
      color: 0xfaf4e8,
      roughness: 0.25,
      metalness: 0.15
    })

    const goldMaterial = new THREE.MeshStandardMaterial({
      color: 0xd4af37,
      roughness: 0.2,
      metalness: 0.85
    })

    const pillarGeometry = new THREE.CylinderGeometry(0.12, 0.16, 3.4, 24)
    const pillarBaseGeometry = new THREE.BoxGeometry(0.5, 0.25, 0.5)
    const pillarPositions = [
      [-1.8, 0, -1.2],
      [1.8, 0, -1.2],
      [-1.4, 0, 1.0],
      [1.4, 0, 1.0]
    ]

    pillarPositions.forEach(([x, y, z]) => {
      // Shaft
      const shaft = new THREE.Mesh(pillarGeometry, marbleMaterial)
      shaft.position.set(x, 1.7, z)
      mandapGroup.add(shaft)

      // Base
      const base = new THREE.Mesh(pillarBaseGeometry, goldMaterial)
      base.position.set(x, 0.12, z)
      mandapGroup.add(base)

      // Capital / Crown
      const crown = new THREE.Mesh(pillarBaseGeometry, goldMaterial)
      crown.position.set(x, 3.35, z)
      mandapGroup.add(crown)
    })

    // Mandap Canopy Arches (Curved Royal Domes)
    const archGeometry = new THREE.TorusGeometry(1.6, 0.05, 12, 32, Math.PI)
    const frontArch = new THREE.Mesh(archGeometry, goldMaterial)
    frontArch.position.set(0, 3.4, 1.0)
    mandapGroup.add(frontArch)

    const backArch = new THREE.Mesh(archGeometry, goldMaterial)
    backArch.position.set(0, 3.4, -1.2)
    mandapGroup.add(backArch)

    // Central Suspended Kalash / Golden Chandelier
    const kalashGeom = new THREE.OctahedronGeometry(0.35, 1)
    const kalash = new THREE.Mesh(kalashGeom, goldMaterial)
    kalash.position.set(0, 3.0, -0.1)
    mandapGroup.add(kalash)

    // Courtyard Terrace Floor
    const floorGeometry = new THREE.PlaneGeometry(24, 24)
    const floorMaterial = new THREE.MeshStandardMaterial({
      color: 0x180b12,
      roughness: 0.4,
      metalness: 0.3
    })
    const floor = new THREE.Mesh(floorGeometry, floorMaterial)
    floor.rotation.x = -Math.PI / 2
    floor.position.y = 0
    mandapGroup.add(floor)

    scene.add(mandapGroup)

    // 4. Floating Rose & Marigold Petal Particles (True 3D drifting simulation)
    const petalCount = 75
    const petalGeom = new THREE.PlaneGeometry(0.08, 0.12)
    const petalMaterialRed = new THREE.MeshStandardMaterial({
      color: 0xa8203d, // Deep Royal Crimson Rose
      side: THREE.DoubleSide,
      roughness: 0.5
    })
    const petalMaterialGold = new THREE.MeshStandardMaterial({
      color: 0xf5a623, // Fresh Marigold Yellow
      side: THREE.DoubleSide,
      roughness: 0.4
    })

    const petals = []
    for (let i = 0; i < petalCount; i++) {
      const mat = Math.random() > 0.4 ? petalMaterialRed : petalMaterialGold
      const mesh = new THREE.Mesh(petalGeom, mat)
      mesh.position.set(
        (Math.random() - 0.5) * 8,
        Math.random() * 6 + 0.5,
        (Math.random() - 0.5) * 6
      )
      mesh.rotation.set(
        Math.random() * Math.PI,
        Math.random() * Math.PI,
        Math.random() * Math.PI
      )
      mesh.userData = {
        speedY: Math.random() * 0.008 + 0.005,
        speedX: (Math.random() - 0.5) * 0.004,
        rotSpeedX: Math.random() * 0.02 + 0.01,
        rotSpeedZ: Math.random() * 0.03 + 0.01,
        swayOffset: Math.random() * Math.PI * 2
      }
      scene.add(mesh)
      petals.push(mesh)
    }

    // 5. Cursor Interactive Parallax
    let mouseX = 0
    let mouseY = 0
    let targetX = 0
    let targetY = 0

    const handleMouseMove = (e) => {
      mouseX = (e.clientX / window.innerWidth) * 2 - 1
      mouseY = -(e.clientY / window.innerHeight) * 2 + 1
    }
    window.addEventListener('mousemove', handleMouseMove, { passive: true })

    // 6. Animation Loop
    let animationFrameId
    let clock = new THREE.Clock()

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate)
      const elapsedTime = clock.getElapsedTime()

      // Smooth camera interpolation towards mouse target
      targetX += (mouseX * 0.45 - targetX) * 0.05
      targetY += (mouseY * 0.25 - targetY) * 0.05

      camera.position.x = targetX
      camera.position.y = 1.2 + targetY
      camera.lookAt(0, 1.8, 0)

      // Chandelier subtle breathing glow
      goldChandelierLight.intensity = 2.8 + Math.sin(elapsedTime * 2.5) * 0.6
      kalash.rotation.y = elapsedTime * 0.35

      // Mandap gentle floating sway
      mandapGroup.rotation.y = Math.sin(elapsedTime * 0.4) * 0.02

      // Petal physics: falling, tumbling, and swaying
      petals.forEach((p) => {
        p.position.y -= p.userData.speedY
        p.position.x += Math.sin(elapsedTime + p.userData.swayOffset) * p.userData.speedX
        p.rotation.x += p.userData.rotSpeedX
        p.rotation.z += p.userData.rotSpeedZ

        // Recycle petal when it falls below ground
        if (p.position.y < 0) {
          p.position.y = 5.5 + Math.random()
          p.position.x = (Math.random() - 0.5) * 8
          p.position.z = (Math.random() - 0.5) * 6
        }
      })

      renderer.render(scene, camera)
    }

    animate()

    // 7. Responsive Resize Handler
    const handleResize = () => {
      if (!container) return
      const newW = container.clientWidth
      const newH = container.clientHeight
      camera.aspect = newW / newH
      camera.updateProjectionMatrix()
      renderer.setSize(newW, newH)
    }
    window.addEventListener('resize', handleResize)

    // Cleanup on unmount
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
      className="absolute inset-0 pointer-events-none z-10 overflow-hidden"
      aria-hidden="true"
    />
  )
}
