import * as THREE from 'three'
import { layoutBlock } from './layout.js'

export function worldVerticalPost(base, height) {
  return {
    a: base,
    b: [base[0], base[1] + height, base[2]],
  }
}

export function frameTiltRotation(direction, tilt) {
  if (typeof direction === 'number') {
    return [
      Math.cos(direction) * tilt,
      0,
      -Math.sin(direction) * tilt,
    ]
  }
  if (direction === 'north') return [-tilt, 0, 0]
  if (direction === 'east') return [0, 0, -tilt]
  if (direction === 'west') return [0, 0, tilt]
  return [tilt, 0, 0]
}

export function frameTiltVector(direction) {
  if (typeof direction === 'number') return [Math.sin(direction), 0, Math.cos(direction)]
  if (direction === 'north') return [0, 0, -1]
  if (direction === 'east') return [1, 0, 0]
  if (direction === 'west') return [-1, 0, 0]
  return [0, 0, 1]
}

const DIRECTION_ANGLES = {
  south: 0,
  east: Math.PI / 2,
  north: Math.PI,
  west: -Math.PI / 2,
}

function normalizedAngle(angle) {
  return Math.atan2(Math.sin(angle), Math.cos(angle))
}

export function directionAngle(direction) {
  if (typeof direction === 'number') return direction
  return DIRECTION_ANGLES[direction] ?? DIRECTION_ANGLES.south
}

export function localTiltDirectionForWorld(worldDirection, houseRotationDeg) {
  const localAngle = localTiltAngleForWorld(worldDirection, houseRotationDeg)
  const directions = [
    ['south', 0],
    ['east', Math.PI / 2],
    ['north', Math.PI],
    ['west', -Math.PI / 2],
  ]
  return directions.reduce((best, current) => {
    const [, angle] = current
    const diff = Math.abs(normalizedAngle(localAngle - angle))
    return diff < best.diff ? { key: current[0], diff } : best
  }, { key: 'south', diff: Infinity }).key
}

export function localTiltAngleForWorld(worldDirection, houseRotationDeg) {
  return normalizedAngle(directionAngle(worldDirection) - (houseRotationDeg * Math.PI) / 180)
}

export function effectiveFrameTiltDirection(worldDirection, houseRotationDeg) {
  return localTiltAngleForWorld(worldDirection, houseRotationDeg)
}

export function worldVerticalTop(base, { height, center, tilt, direction }) {
  const [dx, , dz] = frameTiltVector(direction)
  const alongTilt = (base[0] - center[0]) * dx + (base[2] - center[2]) * dz
  const extraY = -alongTilt * Math.tan(tilt)
  return [base[0], center[1] + height + extraY, base[2]]
}

export function adjustedFrameHeightForClearance({
  requestedHeight,
  bases,
  center,
  tilt,
  direction,
  clearance = 0.2,
}) {
  const requiredHeight = bases.reduce((height, base) => {
    const topAtRequested = worldVerticalTop(base, {
      height: requestedHeight,
      center,
      tilt,
      direction,
    })
    const deficit = base[1] + clearance - topAtRequested[1]
    return Math.max(height, requestedHeight + deficit)
  }, requestedHeight)

  return Math.round(requiredHeight * 1000) / 1000
}

export function maxFrameRailOffset(frames = []) {
  return frames.reduce((max, frame) => Math.max(max, frame.railOffset ?? 0), 0)
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value))
}

function rotatedPanelPoint(x, z, spin) {
  const cos = Math.cos(spin)
  const sin = Math.sin(spin)
  return [
    x * cos + z * sin,
    -x * sin + z * cos,
  ]
}

function shiftedWorldPoint(position = [0, 0, 0], rotation = [0, 0, 0], u = 0, v = 0) {
  const point = new THREE.Vector3(u, 0, v).applyEuler(new THREE.Euler(...rotation))
  return [
    position[0] + point.x,
    position[1] + point.y,
    position[2] + point.z,
  ]
}

function addToBounds(bounds, u, v) {
  bounds.minU = Math.min(bounds.minU, u)
  bounds.maxU = Math.max(bounds.maxU, u)
  bounds.minV = Math.min(bounds.minV, v)
  bounds.maxV = Math.max(bounds.maxV, v)
}

function stringBounds(string, panel) {
  const block = layoutBlock(string.count, string.orientation, panel)
  const [offsetU = 0, offsetV = 0] = string.offset || []
  const spin = string.spin || 0
  const bounds = {
    minU: Infinity,
    maxU: -Infinity,
    minV: Infinity,
    maxV: -Infinity,
  }

  block.positions.forEach(([panelU, panelV]) => {
    ;[-1, 1].forEach((uSign) => {
      ;[-1, 1].forEach((vSign) => {
        const localU = panelU + uSign * (block.panelW / 2)
        const localV = panelV + vSign * (block.panelH / 2)
        const [rotatedU, rotatedV] = rotatedPanelPoint(localU, localV, spin)
        addToBounds(bounds, offsetU + rotatedU, offsetV + rotatedV)
      })
    })
  })

  return bounds
}

export function compactFramesForStrings({
  frames = [],
  faces = [],
  strings = [],
  panel,
  padding = 0.35,
}) {
  const boundsByFace = new Map()

  strings.forEach((string) => {
    const faceIndex = Math.max(0, Math.floor(string.faceIndex || 0))
    if (!frames[faceIndex]) return

    const bounds = stringBounds(string, panel)
    const current = boundsByFace.get(faceIndex) || {
      minU: Infinity,
      maxU: -Infinity,
      minV: Infinity,
      maxV: -Infinity,
    }
    addToBounds(current, bounds.minU, bounds.minV)
    addToBounds(current, bounds.maxU, bounds.maxV)
    boundsByFace.set(faceIndex, current)
  })

  if (boundsByFace.size === 0) return frames

  return frames.flatMap((frame, faceIndex) => {
    const bounds = boundsByFace.get(faceIndex)
    if (!bounds) return []

    const face = faces[faceIndex] || frame
    const maxAreaW = face.areaW ?? frame.areaW
    const maxAreaH = face.areaH ?? frame.areaH
    const paddedMinU = bounds.minU - padding
    const paddedMaxU = bounds.maxU + padding
    const paddedMinV = bounds.minV - padding
    const paddedMaxV = bounds.maxV + padding
    const areaW = Math.min(maxAreaW, paddedMaxU - paddedMinU)
    const areaH = Math.min(maxAreaH, paddedMaxV - paddedMinV)
    const centerU = clamp(
      (paddedMinU + paddedMaxU) / 2,
      -maxAreaW / 2 + areaW / 2,
      maxAreaW / 2 - areaW / 2,
    )
    const centerV = clamp(
      (paddedMinV + paddedMaxV) / 2,
      -maxAreaH / 2 + areaH / 2,
      maxAreaH / 2 - areaH / 2,
    )

    return [{
      ...frame,
      sourceFaceIndex: faceIndex,
      areaW,
      areaH,
      position: shiftedWorldPoint(frame.position, frame.rotation, centerU, centerV),
      topCenter: frame.topCenter
        ? shiftedWorldPoint(frame.topCenter, frame.rotation, centerU, centerV)
        : frame.topCenter,
    }]
  })
}
