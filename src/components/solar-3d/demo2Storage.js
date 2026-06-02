import {
  FRAME_HEIGHT,
  HOUSE,
  MOUNT_TYPES,
  ROOF_TYPES,
} from './config.js'

export const DEMO2_STORAGE_KEY = 'solar3d.demo2.state.v1'
export const BUILDING_DIMENSION_MAX = 100

export const DEFAULT_DEMO2_STATE = {
  roofKey: 'ton',
  mountKey: 'flush',
  frameHeight: FRAME_HEIGHT.default,
  frameTiltDirectionStep: 2,
  frameTiltDirection: 'south',
  width: HOUSE.width,
  depth: HOUSE.depth,
  lMainWidth: HOUSE.lMainWidth,
  lMainDepth: HOUSE.lMainDepth,
  lWingWidth: HOUSE.lWingWidth,
  lWingDepth: HOUSE.lWingDepth,
  panelLen: 2278,
  panelWid: 1133,
  inputCount: 9,
  targetFace: 0,
  strings: [],
  selectedId: null,
  houseRotation: 0,
}

function clampNumber(value, fallback, min, max) {
  const n = Number(value)
  if (!Number.isFinite(n)) return fallback
  return Math.min(max, Math.max(min, n))
}

function normalizeString(value) {
  const id = Number(value?.id)
  if (!Number.isFinite(id)) return null

  const offset = Array.isArray(value?.offset) ? value.offset : [0, 0]
  const faceIndex = Math.max(0, Math.floor(clampNumber(value?.faceIndex, 0, 0, 20)))

  return {
    id,
    count: Math.round(clampNumber(value?.count, DEFAULT_DEMO2_STATE.inputCount, 1, 40)),
    offset: [
      clampNumber(offset[0], 0, -100, 100),
      clampNumber(offset[1], 0, -100, 100),
    ],
    spin: clampNumber(value?.spin, 0, -Math.PI, Math.PI),
    orientation: value?.orientation === 'landscape' ? 'landscape' : 'portrait',
    faceIndex,
  }
}

export function normalizeDemo2State(value) {
  const base = DEFAULT_DEMO2_STATE
  const strings = Array.isArray(value?.strings)
    ? value.strings.map(normalizeString).filter(Boolean)
    : []
  const selectedId = strings.some((s) => s.id === value?.selectedId)
    ? value.selectedId
    : null
  const lMainWidth = clampNumber(value?.lMainWidth, base.lMainWidth, 4, BUILDING_DIMENSION_MAX)
  const lWingWidth = clampNumber(value?.lWingWidth, base.lWingWidth, 3, lMainWidth)

  return {
    roofKey: value?.roofKey in ROOF_TYPES ? value.roofKey : base.roofKey,
    mountKey: value?.mountKey in MOUNT_TYPES ? value.mountKey : base.mountKey,
    frameHeight: clampNumber(value?.frameHeight, base.frameHeight, FRAME_HEIGHT.min, FRAME_HEIGHT.max),
    frameTiltDirectionStep: base.frameTiltDirectionStep,
    frameTiltDirection: base.frameTiltDirection,
    width: clampNumber(value?.width, base.width, 4, BUILDING_DIMENSION_MAX),
    depth: clampNumber(value?.depth, base.depth, 4, BUILDING_DIMENSION_MAX),
    lMainWidth,
    lMainDepth: clampNumber(value?.lMainDepth, base.lMainDepth, 3, BUILDING_DIMENSION_MAX),
    lWingWidth,
    lWingDepth: clampNumber(value?.lWingDepth, base.lWingDepth, 3, BUILDING_DIMENSION_MAX),
    panelLen: Math.round(clampNumber(value?.panelLen, base.panelLen, 500, 2600)),
    panelWid: Math.round(clampNumber(value?.panelWid, base.panelWid, 300, 1500)),
    inputCount: Math.round(clampNumber(value?.inputCount, base.inputCount, 1, 40)),
    targetFace: Math.max(0, Math.floor(clampNumber(value?.targetFace, base.targetFace, 0, 20))),
    strings,
    selectedId,
    houseRotation: Math.round(clampNumber(value?.houseRotation, base.houseRotation, 0, 360)),
  }
}

export function parseDemo2State(raw) {
  if (!raw) return DEFAULT_DEMO2_STATE
  try {
    return normalizeDemo2State(JSON.parse(raw))
  } catch {
    return DEFAULT_DEMO2_STATE
  }
}

export function nextStringId(strings) {
  return strings.reduce((max, s) => Math.max(max, s.id), 0) + 1
}
