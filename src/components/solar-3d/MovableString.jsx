import React, { useMemo, useRef } from 'react'
import * as THREE from 'three'
import { Line } from '@react-three/drei'
import { PANEL } from './config.js'
import { layoutBlock } from './layout.js'
import { rayToFaceUV, resolveRoofDragFromRay } from './roofDrag.js'
import { solarTexture } from './textures.js'
import SpriteLabel from './SpriteLabel.jsx'

// Một tấm pin (khung nhôm + mặt kính cell).
function Panel({ texture, w, h, thickness, highlight }) {
  return (
    <group>
      <mesh castShadow receiveShadow>
        <boxGeometry args={[w, thickness, h]} />
        <meshStandardMaterial
          color={highlight ? '#2f6fd0' : '#c7ccd2'}
          metalness={0.9}
          roughness={0.35}
          emissive={highlight ? '#1473e6' : '#000000'}
          emissiveIntensity={highlight ? 0.35 : 0}
        />
      </mesh>
      <mesh position={[0, thickness / 2 + 0.003, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[w - 0.04, h - 0.04]} />
        <meshStandardMaterial map={texture} metalness={0.5} roughness={0.22} envMapIntensity={1.1} />
      </mesh>
    </group>
  )
}

function formatMeters(value) {
  return Number.isInteger(value) ? `${value}` : value.toFixed(1)
}

function DimensionLabel({ position, color, children }) {
  return (
    <SpriteLabel position={position} color={color} scale={0.2} fontSize={44} outlineWidth={8}>
      {children}
    </SpriteLabel>
  )
}

function DimensionLine({ start, end, tickAxis, label, labelPosition, color }) {
  const tick = 0.12
  const ticks = [start, end].map((p) => ([
    [p[0] - tickAxis[0] * tick, p[1], p[2] - tickAxis[2] * tick],
    [p[0] + tickAxis[0] * tick, p[1], p[2] + tickAxis[2] * tick],
  ]))

  return (
    <group>
      <Line points={[start, end]} color={color} lineWidth={1.5} />
      {ticks.map((points, i) => (
        <Line key={i} points={points} color={color} lineWidth={1.5} />
      ))}
      <DimensionLabel position={labelPosition} color={color}>
        {label}
      </DimensionLabel>
    </group>
  )
}

function StringDimensions({ block, panel }) {
  const extents = useMemo(() => {
    const xs = block.positions.flatMap((p) => [
      p[0] - block.panelW / 2,
      p[0] + block.panelW / 2,
    ])
    const zs = block.positions.flatMap((p) => [
      p[1] - block.panelH / 2,
      p[1] + block.panelH / 2,
    ])
    return {
      minX: Math.min(...xs),
      maxX: Math.max(...xs),
      minZ: Math.min(...zs),
      maxZ: Math.max(...zs),
    }
  }, [block])

  const blockW = extents.maxX - extents.minX
  const blockH = extents.maxZ - extents.minZ
  const y = panel.thickness / 2 + 0.055
  const gap = 0.18
  const widthZ = extents.maxZ + gap
  const depthX = extents.maxX + gap

  return (
    <group>
      <DimensionLine
        start={[extents.minX, y, widthZ]}
        end={[extents.maxX, y, widthZ]}
        tickAxis={[0, 0, 1]}
        label={`Rộng ${formatMeters(blockW)} m`}
        labelPosition={[0, y + 0.08, widthZ + 0.14]}
        color="#0d5bbd"
      />
      <DimensionLine
        start={[depthX, y, extents.minZ]}
        end={[depthX, y, extents.maxZ]}
        tickAxis={[1, 0, 0]}
        label={`Dài ${formatMeters(blockH)} m`}
        labelPosition={[depthX + 0.18, y + 0.08, 0]}
        color="#c0392b"
      />
    </group>
  )
}

// Một CHUỖI N tấm pin di chuyển nguyên khối trên mặt mái.
//  - face: { position, rotation, areaW, areaH } của mặt mái
//  - offset: [u, v] dịch chuyển trong mặt phẳng mái (mét)
//  - spin: góc xoay quanh trục vuông góc mặt mái (radian)
//  - orientation: 'portrait' | 'landscape'
//  - count: số tấm
//  - panel: { width, height, thickness, gap } kích thước tấm pin
//  - onDragState(state): callback khi kéo, trả về mặt mái + offset mới (đã clamp)
export default function MovableString({
  face,
  faces = [face],
  count,
  offset,
  spin,
  orientation,
  panel = PANEL,
  faceIndex = 0,
  selected,
  onSelect,
  onDragState,
  onGrab,
  onRelease,
}) {
  const texture = useMemo(() => solarTexture(), [])
  const drag = useRef(null)
  const faceGroupRef = useRef()

  const lift = panel.thickness / 2 + 0.06

  const block = useMemo(
    () => layoutBlock(count, orientation, panel),
    [count, orientation, panel],
  )

  const parentMatrixWorld = () => {
    const parent = faceGroupRef.current?.parent
    parent?.updateMatrixWorld(true)
    return parent?.matrixWorld?.clone() || new THREE.Matrix4()
  }

  const onDown = (e) => {
    e.stopPropagation()
    onSelect?.()
    onGrab?.() // khóa orbit controls trong lúc kéo
    e.target.setPointerCapture?.(e.pointerId)
    const uv = rayToFaceUV(e.ray, face, parentMatrixWorld())
    drag.current = uv
      ? { du: uv[0] - offset[0], dv: uv[1] - offset[1], fi: faceIndex }
      : { du: 0, dv: 0, fi: faceIndex }
  }

  const onMove = (e) => {
    if (!drag.current) return
    e.stopPropagation()
    const next = resolveRoofDragFromRay({
      ray: e.ray,
      faces,
      currentFaceIndex: faceIndex,
      parentMatrixWorld: parentMatrixWorld(),
      gripOffset: [drag.current.du, drag.current.dv],
    })
    if (!next) return

    if (next.faceIndex !== faceIndex) {
      drag.current.du = 0
      drag.current.dv = 0
      drag.current.fi = next.faceIndex
    } else {
      drag.current.fi = faceIndex
    }
    onDragState?.(next)
  }

  const onUp = (e) => {
    if (!drag.current) return
    e.stopPropagation()
    e.target.releasePointerCapture?.(e.pointerId)
    drag.current = null
    onRelease?.() // mở lại orbit controls
  }

  return (
    // group đặt tại tâm mặt mái, theo đúng hướng dốc
    <group ref={faceGroupRef} position={face.position} rotation={face.rotation}>
      {/* cụm pin: dịch theo offset, nâng khỏi mái, xoay quanh trục đứng cục bộ */}
      <group
        position={[offset[0], lift, offset[1]]}
        rotation={[0, spin, 0]}
        onPointerDown={onDown}
        onPointerMove={onMove}
        onPointerUp={onUp}
        onPointerOver={(e) => {
          e.stopPropagation()
          document.body.style.cursor = 'grab'
        }}
        onPointerOut={() => {
          document.body.style.cursor = 'auto'
        }}
      >
        {block.positions.map((p, i) => (
          <group key={i} position={[p[0], 0, p[1]]}>
            <Panel
              texture={texture}
              w={block.panelW}
              h={block.panelH}
              thickness={panel.thickness}
              highlight={selected}
            />
          </group>
        ))}
        <StringDimensions block={block} panel={panel} />
      </group>
    </group>
  )
}
