import React, { useEffect, useMemo } from 'react'
import * as THREE from 'three'

export default function SpriteLabel({
  children,
  color = '#1b2733',
  position = [0, 0, 0],
  scale = 0.42,
  fontSize = 56,
  fontWeight = 800,
  outlineWidth = 10,
}) {
  const text = String(children)
  const label = useMemo(() => {
    const paddingX = Math.ceil(fontSize * 0.5)
    const paddingY = Math.ceil(fontSize * 0.28)
    const canvas = document.createElement('canvas')
    const context = canvas.getContext('2d')
    const font = `${fontWeight} ${fontSize}px system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif`

    context.font = font
    const metrics = context.measureText(text)
    canvas.width = Math.ceil(metrics.width + paddingX * 2)
    canvas.height = fontSize + paddingY * 2

    const drawContext = canvas.getContext('2d')
    drawContext.font = font
    drawContext.textAlign = 'center'
    drawContext.textBaseline = 'middle'
    drawContext.lineJoin = 'round'
    drawContext.lineWidth = outlineWidth
    drawContext.strokeStyle = '#ffffff'
    drawContext.fillStyle = color
    drawContext.strokeText(text, canvas.width / 2, canvas.height / 2)
    drawContext.fillText(text, canvas.width / 2, canvas.height / 2)

    const texture = new THREE.CanvasTexture(canvas)
    texture.colorSpace = THREE.SRGBColorSpace
    texture.anisotropy = 8

    return {
      aspect: canvas.width / canvas.height,
      texture,
    }
  }, [color, fontSize, fontWeight, outlineWidth, text])

  useEffect(() => () => label.texture.dispose(), [label])

  return (
    <sprite position={position} scale={[label.aspect * scale, scale, 1]} renderOrder={10}>
      <spriteMaterial map={label.texture} transparent depthWrite={false} />
    </sprite>
  )
}
