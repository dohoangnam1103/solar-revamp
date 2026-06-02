import React, { useEffect, useMemo } from 'react'
import * as THREE from 'three'
import { Line } from '@react-three/drei'
import { FRAME_HEIGHT, HOUSE, TILT_ANGLE } from './config.js'
import SteelFrame, { SurfaceSteelFrame } from './SteelFrame.jsx'
import {
  adjustedFrameHeightForClearance,
  frameTiltRotation,
} from './frameGeometry.js'
import { metalRoofMaps, tileRoofMaps, wallTexture } from './textures.js'

function toWorldPoint(position, rotation, point) {
  const v = new THREE.Vector3(...point).applyEuler(new THREE.Euler(...rotation))
  return [v.x + position[0], v.y + position[1], v.z + position[2]]
}

function frameBaseSamples(face) {
  const halfW = face.areaW / 2
  const halfH = face.areaH / 2
  return [
    [-halfW, 0.06, -halfH],
    [halfW, 0.06, -halfH],
    [-halfW, 0.06, halfH],
    [halfW, 0.06, halfH],
    [0, 0.06, -halfH],
    [0, 0.06, halfH],
  ].map((point) => toWorldPoint(face.position, face.rotation, point))
}

// Mesh đa giác phẳng từ danh sách điểm 3D, có tính UV theo mét.
export function RoofPolygon({ points, color, metalness, roughness, map, normalMap }) {
  const geometry = useMemo(() => {
    const geo = new THREE.BufferGeometry()
    const vp = points.map((p) => new THREE.Vector3(p[0], p[1], p[2]))
    const e1 = new THREE.Vector3().subVectors(vp[1], vp[0]).normalize()
    const tmp = new THREE.Vector3().subVectors(vp[2], vp[0])
    const normal = new THREE.Vector3().crossVectors(e1, tmp).normalize()
    const e2 = new THREE.Vector3().crossVectors(normal, e1).normalize()
    const uv2 = vp.map((v) => {
      const d = new THREE.Vector3().subVectors(v, vp[0])
      return [d.dot(e1), d.dot(e2)]
    })
    const verts = []
    const uvs = []
    for (let i = 1; i < vp.length - 1; i++) {
      verts.push(vp[0].x, vp[0].y, vp[0].z)
      verts.push(vp[i].x, vp[i].y, vp[i].z)
      verts.push(vp[i + 1].x, vp[i + 1].y, vp[i + 1].z)
      uvs.push(uv2[0][0], uv2[0][1])
      uvs.push(uv2[i][0], uv2[i][1])
      uvs.push(uv2[i + 1][0], uv2[i + 1][1])
    }
    geo.setAttribute('position', new THREE.Float32BufferAttribute(verts, 3))
    geo.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2))
    geo.computeVertexNormals()
    return geo
  }, [points])

  return (
    <mesh geometry={geometry} castShadow receiveShadow>
      <meshStandardMaterial
        color={color}
        metalness={metalness}
        roughness={roughness}
        map={map || null}
        normalMap={normalMap || null}
        side={THREE.DoubleSide}
      />
    </mesh>
  )
}

function Walls({ texture, dims, roofShape }) {
  const { width, depth, wallHeight } = dims
  if (roofShape === 'l' || roofShape === 'l-mirror' || roofShape === 't') {
    const isTRoof = roofShape === 't'
    const sideSign = roofShape === 'l-mirror' ? 1 : -1
    const mainDepth = dims.lMainDepth ?? depth * 0.55
    const wingWidth = dims.lWingWidth ?? width * 0.48
    const wingDepth = dims.lWingDepth ?? depth * 0.45
    const mainZ = depth / 2 - mainDepth / 2
    const wingX = isTRoof ? 0 : sideSign * (width / 2 - wingWidth / 2)
    const wingZ = -depth / 2 + wingDepth / 2

    return (
      <group>
        <mesh position={[0, wallHeight / 2, mainZ]} castShadow receiveShadow>
          <boxGeometry args={[width, wallHeight, mainDepth]} />
          <meshStandardMaterial map={texture} roughness={0.92} />
        </mesh>
        <mesh position={[wingX, wallHeight / 2, wingZ]} castShadow receiveShadow>
          <boxGeometry args={[wingWidth, wallHeight, wingDepth]} />
          <meshStandardMaterial map={texture} roughness={0.92} />
        </mesh>
      </group>
    )
  }

  return (
    <group>
      <mesh position={[0, wallHeight / 2, 0]} castShadow receiveShadow>
        <boxGeometry args={[width, wallHeight, depth]} />
        <meshStandardMaterial map={texture} roughness={0.92} />
      </mesh>
    </group>
  )
}

function formatMeters(value) {
  return Number.isInteger(value) ? `${value}` : value.toFixed(1)
}

function DimensionLabel({ position, color, children }) {
  const text = String(children)
  const label = useMemo(() => {
    const fontSize = 56
    const paddingX = 28
    const paddingY = 16
    const canvas = document.createElement('canvas')
    const context = canvas.getContext('2d')
    const font = `800 ${fontSize}px system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif`

    context.font = font
    const metrics = context.measureText(text)
    canvas.width = Math.ceil(metrics.width + paddingX * 2)
    canvas.height = fontSize + paddingY * 2

    const drawContext = canvas.getContext('2d')
    drawContext.font = font
    drawContext.textAlign = 'center'
    drawContext.textBaseline = 'middle'
    drawContext.lineJoin = 'round'
    drawContext.lineWidth = 10
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
  }, [color, text])

  useEffect(() => () => label.texture.dispose(), [label])

  return (
    <sprite position={position} scale={[label.aspect * 0.42, 0.42, 1]} renderOrder={10}>
      <spriteMaterial map={label.texture} transparent depthWrite={false} />
    </sprite>
  )
}

function DimensionLine({ start, end, tickAxis, label, labelPosition, color }) {
  const tick = 0.32
  const ticks = [start, end].map((p) => ([
    [p[0] - tickAxis[0] * tick, p[1], p[2] - tickAxis[2] * tick],
    [p[0] + tickAxis[0] * tick, p[1], p[2] + tickAxis[2] * tick],
  ]))

  return (
    <group>
      <Line points={[start, end]} color={color} lineWidth={2} />
      {ticks.map((points, i) => (
        <Line key={i} points={points} color={color} lineWidth={2} />
      ))}
      <DimensionLabel position={labelPosition} color={color}>
        {label}
      </DimensionLabel>
    </group>
  )
}

function LHouseDimensions({ dims, roofShape }) {
  const {
    width,
    depth,
    lMainDepth = depth * 0.55,
    lWingWidth = width * 0.48,
    lWingDepth = depth * 0.45,
  } = dims
  const y = 0.08
  const gap = 0.82
  const isTRoof = roofShape === 't'
  const sideSign = roofShape === 'l-mirror' ? 1 : -1
  const mainZFront = depth / 2
  const mainZBack = depth / 2 - lMainDepth
  const wingZFront = mainZBack
  const wingZBack = -depth / 2
  const wingXOuter = isTRoof ? -lWingWidth / 2 : sideSign * width / 2
  const wingXInner = isTRoof ? lWingWidth / 2 : sideSign * (width / 2 - lWingWidth)
  const mainDepthX = -sideSign * (width / 2 + gap)
  const wingDepthX = isTRoof ? lWingWidth / 2 + gap : wingXOuter + sideSign * gap
  const wingWidthZ = wingZBack - gap
  const widthColor = '#0d5bbd'
  const depthColor = '#c0392b'

  return (
    <group>
      <DimensionLine
        start={[-width / 2, y, mainZFront + gap]}
        end={[width / 2, y, mainZFront + gap]}
        tickAxis={[0, 0, 1]}
        label={`Rộng mái chính ${formatMeters(width)} m`}
        labelPosition={[0, y + 0.28, mainZFront + gap + 0.38]}
        color={widthColor}
      />
      <DimensionLine
        start={[mainDepthX, y, mainZBack]}
        end={[mainDepthX, y, mainZFront]}
        tickAxis={[1, 0, 0]}
        label={`Dài mái chính ${formatMeters(lMainDepth)} m`}
        labelPosition={[mainDepthX - sideSign * 0.46, y + 0.28, (mainZFront + mainZBack) / 2]}
        color={depthColor}
      />
      <DimensionLine
        start={[wingXOuter, y, wingWidthZ]}
        end={[wingXInner, y, wingWidthZ]}
        tickAxis={[0, 0, 1]}
        label={`Rộng mái nhánh ${formatMeters(lWingWidth)} m`}
        labelPosition={[(wingXOuter + wingXInner) / 2, y + 0.28, wingWidthZ - 0.38]}
        color={widthColor}
      />
      <DimensionLine
        start={[wingDepthX, y, wingZBack]}
        end={[wingDepthX, y, wingZFront]}
        tickAxis={[1, 0, 0]}
        label={`Dài mái nhánh ${formatMeters(lWingDepth)} m`}
        labelPosition={[wingDepthX + sideSign * 0.46, y + 0.28, (wingZBack + wingZFront) / 2]}
        color={depthColor}
      />
    </group>
  )
}

function HouseDimensions({ dims, roofShape }) {
  if (roofShape === 'l' || roofShape === 'l-mirror' || roofShape === 't') {
    return <LHouseDimensions dims={dims} roofShape={roofShape} />
  }

  const { width, depth } = dims
  const y = 0.08
  const gap = 0.82
  const widthZ = depth / 2 + gap
  const depthX = width / 2 + gap
  const widthColor = '#0d5bbd'
  const depthColor = '#c0392b'

  return (
    <group>
      <DimensionLine
        start={[-width / 2, y, widthZ]}
        end={[width / 2, y, widthZ]}
        tickAxis={[0, 0, 1]}
        label={`Rộng ${formatMeters(width)} m`}
        labelPosition={[0, y + 0.28, widthZ + 0.38]}
        color={widthColor}
      />
      <DimensionLine
        start={[depthX, y, -depth / 2]}
        end={[depthX, y, depth / 2]}
        tickAxis={[1, 0, 0]}
        label={`Dài ${formatMeters(depth)} m`}
        labelPosition={[depthX + 0.46, y + 0.28, 0]}
        color={depthColor}
      />
    </group>
  )
}

export function Equipment({ hasBattery, dims }) {
  const { width, wallHeight } = dims
  const x = -width / 2 - 0.05
  return (
    <group>
      <mesh position={[x, wallHeight * 0.45, 2]} castShadow>
        <boxGeometry args={[0.16, 0.7, 0.5]} />
        <meshStandardMaterial color="#3a4250" metalness={0.4} roughness={0.5} />
      </mesh>
      {hasBattery && (
        <mesh position={[x, wallHeight * 0.3, 3]} castShadow>
          <boxGeometry args={[0.24, 1.1, 0.6]} />
          <meshStandardMaterial color="#1473e6" metalness={0.3} roughness={0.5} />
        </mesh>
      )}
    </group>
  )
}

// Tính hình học mái + danh sách MẶT lắp pin theo loại mái.
// dims: { width, depth, wallHeight, roofHeight } — mặc định lấy từ HOUSE.
export function useHouseGeometry(
  roofShape,
  dims = HOUSE,
  mountKey = 'flush',
  frameHeight = FRAME_HEIGHT.default,
  frameTiltDirection = 'roof',
) {
  const { width, depth, wallHeight, roofHeight } = dims
  const lMainDepth = dims.lMainDepth
  const lWingWidth = dims.lWingWidth
  const lWingDepth = dims.lWingDepth
  const yTop = wallHeight
  const yRidge = wallHeight + roofHeight

  return useMemo(() => {
    const meshes = []
    const faceList = []
    let frameInfo = []
    const frameTilt = (TILT_ANGLE * Math.PI) / 180

    if (roofShape === 'mono') {
      const theta = Math.atan2(roofHeight, depth)
      const slopeLen = Math.hypot(depth, roofHeight)
      meshes.push({
        key: 'slope',
        points: [
          [-width / 2, yTop, depth / 2],
          [width / 2, yTop, depth / 2],
          [width / 2, yRidge, -depth / 2],
          [-width / 2, yRidge, -depth / 2],
        ],
      })
      meshes.push({
        key: 'sideL',
        points: [
          [-width / 2, yTop, depth / 2],
          [-width / 2, yTop, -depth / 2],
          [-width / 2, yRidge, -depth / 2],
        ],
        wall: true,
      })
      meshes.push({
        key: 'sideR',
        points: [
          [width / 2, yTop, depth / 2],
          [width / 2, yRidge, -depth / 2],
          [width / 2, yTop, -depth / 2],
        ],
        wall: true,
      })
      meshes.push({
        key: 'backFill',
        points: [
          [-width / 2, yTop, -depth / 2],
          [width / 2, yTop, -depth / 2],
          [width / 2, yRidge, -depth / 2],
          [-width / 2, yRidge, -depth / 2],
        ],
        wall: true,
      })
      faceList.push({
        position: [0, yTop + roofHeight / 2, 0],
        rotation: [theta, 0, 0],
        areaW: width - 1.2,
        areaH: slopeLen - 1.6,
      })
    } else if (roofShape === 'gable') {
      const theta = Math.atan2(roofHeight, depth / 2)
      const slopeLen = Math.hypot(depth / 2, roofHeight)
      meshes.push({
        key: 'front',
        points: [
          [-width / 2, yTop, depth / 2],
          [width / 2, yTop, depth / 2],
          [width / 2, yRidge, 0],
          [-width / 2, yRidge, 0],
        ],
      })
      meshes.push({
        key: 'back',
        points: [
          [-width / 2, yTop, -depth / 2],
          [-width / 2, yRidge, 0],
          [width / 2, yRidge, 0],
          [width / 2, yTop, -depth / 2],
        ],
      })
      meshes.push({
        key: 'gableL',
        points: [
          [-width / 2, yTop, depth / 2],
          [-width / 2, yRidge, 0],
          [-width / 2, yTop, -depth / 2],
        ],
        wall: true,
      })
      meshes.push({
        key: 'gableR',
        points: [
          [width / 2, yTop, depth / 2],
          [width / 2, yTop, -depth / 2],
          [width / 2, yRidge, 0],
        ],
        wall: true,
      })
      faceList.push({
        position: [0, yTop + roofHeight / 2, depth / 4],
        rotation: [theta, 0, 0],
        areaW: width - 1.2,
        areaH: slopeLen - 1.2,
      })
      faceList.push({
        position: [0, yTop + roofHeight / 2, -depth / 4],
        rotation: [-theta, 0, 0],
        areaW: width - 1.2,
        areaH: slopeLen - 1.2,
      })
    } else if (roofShape === 'hip') {
      const ridgeLen = width * 0.4
      const theta = Math.atan2(roofHeight, depth / 2)
      const slopeLen = Math.hypot(depth / 2, roofHeight)
      meshes.push({
        key: 'front',
        points: [
          [-width / 2, yTop, depth / 2],
          [width / 2, yTop, depth / 2],
          [ridgeLen / 2, yRidge, 0],
          [-ridgeLen / 2, yRidge, 0],
        ],
      })
      meshes.push({
        key: 'back',
        points: [
          [-width / 2, yTop, -depth / 2],
          [-ridgeLen / 2, yRidge, 0],
          [ridgeLen / 2, yRidge, 0],
          [width / 2, yTop, -depth / 2],
        ],
      })
      meshes.push({
        key: 'left',
        points: [
          [-width / 2, yTop, depth / 2],
          [-ridgeLen / 2, yRidge, 0],
          [-width / 2, yTop, -depth / 2],
        ],
      })
      meshes.push({
        key: 'right',
        points: [
          [width / 2, yTop, depth / 2],
          [width / 2, yTop, -depth / 2],
          [ridgeLen / 2, yRidge, 0],
        ],
      })
      faceList.push({
        position: [0, yTop + roofHeight / 2, depth / 4],
        rotation: [theta, 0, 0],
        areaW: width - 2.4,
        areaH: slopeLen - 1.2,
      })
      faceList.push({
        position: [0, yTop + roofHeight / 2, -depth / 4],
        rotation: [-theta, 0, 0],
        areaW: width - 2.4,
        areaH: slopeLen - 1.2,
      })
    } else if (roofShape === 'l' || roofShape === 'l-mirror' || roofShape === 't') {
      const isTRoof = roofShape === 't'
      const sideSign = roofShape === 'l-mirror' ? 1 : -1
      const mainDepth = lMainDepth ?? depth * 0.55
      const wingWidth = lWingWidth ?? width * 0.48
      const wingDepth = lWingDepth ?? depth * 0.45
      const mainZFront = depth / 2
      const mainZBack = depth / 2 - mainDepth
      const wingZFront = mainZBack
      const wingZBack = -depth / 2
      const wingXOuter = isTRoof ? -wingWidth / 2 : sideSign * width / 2
      const wingXInner = isTRoof ? wingWidth / 2 : sideSign * (width / 2 - wingWidth)
      const mainTheta = Math.atan2(roofHeight, mainDepth / 2)
      const mainSlopeLen = Math.hypot(mainDepth / 2, roofHeight)
      const sideTheta = Math.atan2(roofHeight, wingWidth / 2)
      const sideSlopeLen = Math.hypot(wingWidth / 2, roofHeight)
      const mainRidgeZ = (mainZFront + mainZBack) / 2
      const wingRidgeX = isTRoof ? 0 : (wingXOuter + wingXInner) / 2
      const wingOuterRotation = isTRoof ? sideTheta : -sideSign * sideTheta
      const wingInnerRotation = isTRoof ? -sideTheta : sideSign * sideTheta

      meshes.push({
        key: 'l-main-front',
        points: [
          [-width / 2, yTop, mainZFront],
          [width / 2, yTop, mainZFront],
          [width / 2, yRidge, mainRidgeZ],
          [-width / 2, yRidge, mainRidgeZ],
        ],
      })
      meshes.push({
        key: 'l-main-back',
        points: [
          [-width / 2, yTop, mainZBack],
          [-width / 2, yRidge, mainRidgeZ],
          [width / 2, yRidge, mainRidgeZ],
          [width / 2, yTop, mainZBack],
        ],
      })
      meshes.push({
        key: 'l-main-left-gable',
        points: [
          [-width / 2, yTop, mainZFront],
          [-width / 2, yRidge, mainRidgeZ],
          [-width / 2, yTop, mainZBack],
        ],
      })
      meshes.push({
        key: 'l-main-right-gable',
        points: [
          [width / 2, yTop, mainZFront],
          [width / 2, yTop, mainZBack],
          [width / 2, yRidge, mainRidgeZ],
        ],
      })
      meshes.push({
        key: 'l-wing-outer',
        points: [
          [wingXOuter, yTop, wingZBack],
          [wingXOuter, yTop, wingZFront],
          [wingRidgeX, yRidge, wingZFront],
          [wingRidgeX, yRidge, wingZBack],
        ],
      })
      meshes.push({
        key: 'l-wing-inner',
        points: [
          [wingXInner, yTop, wingZBack],
          [wingRidgeX, yRidge, wingZBack],
          [wingRidgeX, yRidge, wingZFront],
          [wingXInner, yTop, wingZFront],
        ],
      })
      meshes.push({
        key: 'l-wing-back-gable',
        points: [
          [wingXOuter, yTop, wingZBack],
          [wingRidgeX, yRidge, wingZBack],
          [wingXInner, yTop, wingZBack],
        ],
      })
      meshes.push({
        key: 'l-wing-front-gable',
        points: [
          [wingXOuter, yTop, wingZFront],
          [wingXInner, yTop, wingZFront],
          [wingRidgeX, yRidge, wingZFront],
        ],
      })
      faceList.push({
        position: [0, yTop + roofHeight / 2, (mainZFront + mainRidgeZ) / 2],
        rotation: [mainTheta, 0, 0],
        areaW: width - 1.2,
        areaH: mainSlopeLen - 1.2,
      })
      faceList.push({
        position: [0, yTop + roofHeight / 2, (mainZBack + mainRidgeZ) / 2],
        rotation: [-mainTheta, 0, 0],
        areaW: width - 1.2,
        areaH: mainSlopeLen - 1.2,
      })
      faceList.push({
        position: [(wingXOuter + wingRidgeX) / 2, yTop + roofHeight / 2, (wingZFront + wingZBack) / 2],
        rotation: [0, 0, wingOuterRotation],
        areaW: sideSlopeLen - 1.2,
        areaH: wingDepth - 1.2,
      })
      faceList.push({
        position: [(wingXInner + wingRidgeX) / 2, yTop + roofHeight / 2, (wingZFront + wingZBack) / 2],
        rotation: [0, 0, wingInnerRotation],
        areaW: sideSlopeLen - 1.2,
        areaH: wingDepth - 1.2,
      })
    } else {
      meshes.push({
        key: 'deck',
        points: [
          [-width / 2, yTop, depth / 2],
          [width / 2, yTop, depth / 2],
          [width / 2, yTop, -depth / 2],
          [-width / 2, yTop, -depth / 2],
        ],
      })
      const areaW = width - 1.2
      const areaH = depth - 1.2
      if (mountKey === 'frame') {
        const direction = frameTiltDirection === 'roof' ? 'south' : frameTiltDirection
        faceList.push({
          position: [0, yTop + frameHeight, 0],
          rotation: frameTiltRotation(direction, frameTilt),
          areaW,
          areaH,
        })
        frameInfo = [{
          mode: 'surface',
          position: [0, yTop, 0],
          rotation: [0, 0, 0],
          areaW,
          areaH,
          railOffset: frameHeight,
          topCenter: [0, yTop, 0],
          topTilt: frameTilt,
          tiltDirection: direction,
        }]
      } else {
        faceList.push({ position: [0, yTop + 0.03, 0], rotation: [0, 0, 0], areaW, areaH })
      }
    }

    if (mountKey === 'frame' && roofShape !== 'flat') {
      frameInfo = faceList.map((face) => {
        const railOffset = frameTiltDirection === 'roof'
          ? frameHeight
          : adjustedFrameHeightForClearance({
            requestedHeight: frameHeight,
            bases: frameBaseSamples(face),
            center: face.position,
            tilt: frameTilt,
            direction: frameTiltDirection,
            clearance: 0.2,
          })

        return {
          mode: 'surface',
          position: face.position,
          rotation: face.rotation,
          areaW: face.areaW,
          areaH: face.areaH,
          railOffset,
          topCenter: face.position,
          topTilt: frameTilt,
          tiltDirection: frameTiltDirection,
        }
      })
      faceList.forEach((face) => {
        const frame = frameInfo[faceList.indexOf(face)]
        face.position = [face.position[0], face.position[1] + frame.railOffset, face.position[2]]
        if (frameTiltDirection !== 'roof') {
          face.rotation = frameTiltRotation(frameTiltDirection, frameTilt)
        }
      })
    }

    return { roofMeshes: meshes, faces: faceList, frames: frameInfo, yTop }
  }, [
    roofShape,
    mountKey,
    frameHeight,
    frameTiltDirection,
    width,
    depth,
    lMainDepth,
    lWingWidth,
    lWingDepth,
    roofHeight,
    yTop,
    yRidge,
  ])
}

// Vỏ nhà: tường + mái + giàn khung sắt (không gồm tấm pin).
export default function HouseShell({
  roof,
  geometry,
  dims = HOUSE,
  hasBattery = false,
  showEquipment = true,
}) {
  const { roofMeshes, frames = [], yTop } = geometry
  const wallTex = useMemo(() => wallTexture(), [])
  const roofMaps = useMemo(() => {
    if (roof.texture === 'metal') return metalRoofMaps()
    if (roof.texture === 'tile') return tileRoofMaps()
    return null
  }, [roof.texture])

  return (
    <group>
      <Walls texture={wallTex} dims={dims} roofShape={roof.shape} />
      {roofMeshes.map((m) => (
        <RoofPolygon
          key={m.key}
          points={m.points}
          color={m.wall ? '#ded8cc' : roof.color}
          metalness={m.wall ? 0.05 : roof.metalness}
          roughness={m.wall ? 0.9 : roof.roughness}
          map={m.wall ? null : roofMaps?.color}
          normalMap={m.wall ? null : roofMaps?.normal}
        />
      ))}
      <HouseDimensions dims={dims} roofShape={roof.shape} />

      {frames.map((frame, i) =>
        frame.mode === 'flatTilt' ? (
          <SteelFrame
            key={`frame-${i}`}
            areaW={frame.areaW}
            areaH={frame.areaH}
            tilt={frame.tilt}
            centerY={frame.centerY}
            deckY={yTop}
          />
        ) : (
          <SurfaceSteelFrame
            key={`frame-${i}`}
            areaW={frame.areaW}
            areaH={frame.areaH}
            railOffset={frame.railOffset}
            position={frame.position}
            rotation={frame.rotation}
            topCenter={frame.topCenter}
            topTilt={frame.topTilt}
            tiltDirection={frame.tiltDirection}
          />
        ),
      )}

      {showEquipment && <Equipment hasBattery={hasBattery} dims={dims} />}
    </group>
  )
}
