'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { usePathname } from 'next/navigation'

interface TrailPoint {
  x: number
  y: number
  age: number
}

export default function CustomCursor() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const orbRef = useRef<HTMLDivElement>(null)
  const mousePos = useRef({ x: -200, y: -200 })
  const orbPos = useRef({ x: -200, y: -200 })
  const trail = useRef<TrailPoint[]>([])
  const animFrame = useRef<number>(0)
  const [isHovering, setIsHovering] = useState(false)
  const [isClicking, setIsClicking] = useState(false)
  const pathname = usePathname()

  const getColorRGB = useCallback(() => {
    if (pathname?.includes('/brief')) return '255, 107, 74'
    if (pathname?.includes('/settings')) return '245, 158, 11'
    if (pathname?.includes('/onboarding')) return '29, 158, 117'
    return '255, 107, 74'
  }, [pathname])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const resize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    resize()
    window.addEventListener('resize', resize)

    const onMouseMove = (e: MouseEvent) => {
      mousePos.current = { x: e.clientX, y: e.clientY }
      trail.current.push({
        x: e.clientX,
        y: e.clientY,
        age: 0,
      })
      // Keep trail length — controls how long the ribbon is
      if (trail.current.length > 55) {
        trail.current.shift()
      }
    }

    const onMouseDown = () => setIsClicking(true)
    const onMouseUp = () => setIsClicking(false)
    const onMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      setIsHovering(!!target.closest('button, a, [role="button"], input, select'))
    }

    document.addEventListener('mousemove', onMouseMove)
    document.addEventListener('mousedown', onMouseDown)
    document.addEventListener('mouseup', onMouseUp)
    document.addEventListener('mouseover', onMouseOver)

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      const color = getColorRGB()

      // Age all trail points
      trail.current.forEach((p) => p.age++)
      // Remove stale points when mouse is still
      trail.current = trail.current.filter((p) => p.age < 60)

      if (trail.current.length > 2) {
        // ── Draw wide soft glow ribbon (bottom layer) ──
        ctx.beginPath()
        ctx.moveTo(trail.current[0].x, trail.current[0].y)

        for (let i = 1; i < trail.current.length - 1; i++) {
          const mx = (trail.current[i].x + trail.current[i + 1].x) / 2
          const my = (trail.current[i].y + trail.current[i + 1].y) / 2
          ctx.quadraticCurveTo(trail.current[i].x, trail.current[i].y, mx, my)
        }

        const grad1 = ctx.createLinearGradient(
          trail.current[0].x,
          trail.current[0].y,
          trail.current[trail.current.length - 1].x,
          trail.current[trail.current.length - 1].y
        )
        grad1.addColorStop(0, `rgba(${color}, 0)`)
        grad1.addColorStop(0.5, `rgba(${color}, 0.08)`)
        grad1.addColorStop(1, `rgba(${color}, 0.18)`)

        ctx.strokeStyle = grad1
        ctx.lineWidth = isHovering ? 22 : 16
        ctx.lineCap = 'round'
        ctx.lineJoin = 'round'
        ctx.stroke()

        // ── Draw medium ribbon (middle layer) ──
        ctx.beginPath()
        ctx.moveTo(trail.current[0].x, trail.current[0].y)

        for (let i = 1; i < trail.current.length - 1; i++) {
          const mx = (trail.current[i].x + trail.current[i + 1].x) / 2
          const my = (trail.current[i].y + trail.current[i + 1].y) / 2
          ctx.quadraticCurveTo(trail.current[i].x, trail.current[i].y, mx, my)
        }

        const grad2 = ctx.createLinearGradient(
          trail.current[0].x,
          trail.current[0].y,
          trail.current[trail.current.length - 1].x,
          trail.current[trail.current.length - 1].y
        )
        grad2.addColorStop(0, `rgba(${color}, 0)`)
        grad2.addColorStop(0.4, `rgba(${color}, 0.2)`)
        grad2.addColorStop(1, `rgba(${color}, 0.55)`)

        ctx.strokeStyle = grad2
        ctx.lineWidth = isHovering ? 10 : 7
        ctx.lineCap = 'round'
        ctx.lineJoin = 'round'
        ctx.stroke()

        // ── Draw crisp bright core line (top layer) ──
        ctx.beginPath()
        ctx.moveTo(trail.current[0].x, trail.current[0].y)

        for (let i = 1; i < trail.current.length - 1; i++) {
          const mx = (trail.current[i].x + trail.current[i + 1].x) / 2
          const my = (trail.current[i].y + trail.current[i + 1].y) / 2
          ctx.quadraticCurveTo(trail.current[i].x, trail.current[i].y, mx, my)
        }

        const grad3 = ctx.createLinearGradient(
          trail.current[0].x,
          trail.current[0].y,
          trail.current[trail.current.length - 1].x,
          trail.current[trail.current.length - 1].y
        )
        grad3.addColorStop(0, `rgba(255, 255, 255, 0)`)
        grad3.addColorStop(0.3, `rgba(255, 255, 255, 0.15)`)
        grad3.addColorStop(0.7, `rgba(255, 255, 255, 0.6)`)
        grad3.addColorStop(1, `rgba(255, 255, 255, 0.95)`)

        ctx.strokeStyle = grad3
        ctx.lineWidth = isHovering ? 3 : 2
        ctx.lineCap = 'round'
        ctx.lineJoin = 'round'
        ctx.stroke()
      }

      // Smooth orb follow with slight lag
      orbPos.current.x += (mousePos.current.x - orbPos.current.x) * 0.14
      orbPos.current.y += (mousePos.current.y - orbPos.current.y) * 0.14

      if (orbRef.current) {
        orbRef.current.style.left = `${orbPos.current.x}px`
        orbRef.current.style.top = `${orbPos.current.y}px`
      }

      animFrame.current = requestAnimationFrame(animate)
    }

    animFrame.current = requestAnimationFrame(animate)

    return () => {
      window.removeEventListener('resize', resize)
      document.removeEventListener('mousemove', onMouseMove)
      document.removeEventListener('mousedown', onMouseDown)
      document.removeEventListener('mouseup', onMouseUp)
      document.removeEventListener('mouseover', onMouseOver)
      if (animFrame.current) cancelAnimationFrame(animFrame.current)
    }
  }, [getColorRGB])

  const color = getColorRGB()
  const orbSize = isClicking ? 8 : isHovering ? 16 : 11

  return (
    <>
      {/* Ribbon canvas */}
      <canvas
        ref={canvasRef}
        className="fixed inset-0 pointer-events-none"
        style={{ zIndex: 9998 }}
      />

      {/* Orb at cursor tip */}
      <div
        ref={orbRef}
        className="fixed pointer-events-none"
        style={{
          zIndex: 9999,
          width: `${orbSize}px`,
          height: `${orbSize}px`,
          marginLeft: `-${orbSize / 2}px`,
          marginTop: `-${orbSize / 2}px`,
          borderRadius: '50%',
          background: isClicking
            ? `radial-gradient(circle,
                #ffffff 0%,
                rgba(${color}, 1) 50%,
                rgba(${color}, 0.2) 100%)`
            : `radial-gradient(circle,
                #ffffff 0%,
                rgba(${color}, 0.95) 45%,
                rgba(${color}, 0.3) 75%,
                transparent 100%)`,
          boxShadow: isHovering
            ? `0 0 14px 5px rgba(${color}, 0.65),
               0 0 28px 10px rgba(${color}, 0.3),
               0 0 48px 16px rgba(${color}, 0.12)`
            : `0 0 8px 3px rgba(${color}, 0.5),
               0 0 18px 7px rgba(${color}, 0.22),
               0 0 36px 12px rgba(${color}, 0.08)`,
          transition: `width 0.12s, height 0.12s, margin 0.12s, box-shadow 0.2s`,
        }}
      />
    </>
  )
}
