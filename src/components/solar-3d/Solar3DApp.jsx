'use client'

import React, { useState, useMemo, useRef, useEffect, useId } from 'react'
import { Canvas, useThree } from '@react-three/fiber'
import {
  OrbitControls,
  ContactShadows,
  Sky,
} from '@react-three/drei'
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js'
import HouseShell, { useHouseGeometry } from './HouseShell.jsx'
import MovableString from './MovableString.jsx'
import CompassRose from './CompassRose.jsx'
import useCompass from './useCompass.js'
import {
  compactFramesForStrings,
  effectiveFrameTiltDirection,
  maxFrameRailOffset,
} from './frameGeometry.js'
import {
  FRAME_HEIGHT,
  MOUNT_TYPES,
  ROOF_TYPES,
  HOUSE,
  PANEL,
} from './config.js'
import {
  BUILDING_DIMENSION_MAX,
  DEFAULT_DEMO2_STATE,
  DEMO2_STORAGE_KEY,
  nextStringId,
  parseDemo2State,
} from './demo2Storage.js'
import { groundTexture } from './textures.js'
import styles from './Solar3DApp.module.css'

import * as THREE from 'three'

// Hướng nhìn chuẩn để đọc la bàn (gần như từ trên xuống, hơi nghiêng).
// Chỉ dùng làm HƯỚNG, khoảng cách (zoom) giữ nguyên theo hiện tại.
const ALIGNED_DIR = [0, 20, 15]

function Ground() {
  const tex = useMemo(() => groundTexture(), [])
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]} receiveShadow>
      <planeGeometry args={[80, 80]} />
      <meshStandardMaterial map={tex} roughness={1} />
    </mesh>
  )
}

// Điều khiển camera: đưa view về góc nhìn chuẩn khi bấm hiệu chỉnh,
// giữ nguyên khoảng cách (zoom) hiện tại.
function CameraController({ controlsRef, recalibrateKey }) {
  const { camera } = useThree()

  // đưa camera về HƯỚNG nhìn chuẩn mỗi khi recalibrateKey đổi,
  // nhưng GIỮ NGUYÊN khoảng cách (zoom) hiện tại.
  useEffect(() => {
    if (recalibrateKey === 0) return
    const ctrl = controlsRef.current
    const target = ctrl ? ctrl.target : new THREE.Vector3(0, 4, 0)
    const dist = camera.position.distanceTo(target)
    const dir = new THREE.Vector3(...ALIGNED_DIR).normalize()
    camera.position.copy(target).addScaledVector(dir, dist)
    if (ctrl) ctrl.update()
  }, [recalibrateKey, camera, controlsRef])

  return null
}

function SceneEnvironment() {
  const { gl, scene } = useThree()

  useEffect(() => {
    const pmrem = new THREE.PMREMGenerator(gl)
    const envMap = pmrem.fromScene(new RoomEnvironment(), 0.04).texture
    const previousEnvironment = scene.environment

    scene.environment = envMap

    return () => {
      scene.environment = previousEnvironment
      envMap.dispose()
      pmrem.dispose()
    }
  }, [gl, scene])

  return null
}

function cameraMaxDistanceForGeometry(geometry) {
  const dims = geometry?.dims || HOUSE
  const width = Number(dims.width) || HOUSE.width
  const depth = Number(dims.depth) || HOUSE.depth
  const height = (Number(dims.wallHeight) || HOUSE.wallHeight) +
    (Number(dims.roofHeight) || HOUSE.roofHeight)
  const footprintDiagonal = Math.hypot(width, depth)

  return Math.min(260, Math.max(42, Math.ceil(footprintDiagonal * 2.25 + height * 2)))
}

function Scene({
  geometry,
  panel,
  strings,
  selectedId,
  onSelect,
  onDragState,
  onGrab,
  onRelease,
  dragging,
  compassActive,
  showCompass,
  roseHeading,
  appliedHeading,
  houseRotation,
  controlsRef,
  recalibrateKey,
}) {
  const faces = geometry.faces
  const cameraMaxDistance = useMemo(
    () => cameraMaxDistanceForGeometry(geometry),
    [geometry],
  )

  return (
    <>
      <Sky sunPosition={[12, 9, 6]} turbidity={4} rayleigh={1.2} />
      <hemisphereLight args={['#cfe6ff', '#b9c7a6', 0.55]} />
      <directionalLight
        position={[14, 18, 8]}
        intensity={2.4}
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-left={-20}
        shadow-camera-right={20}
        shadow-camera-top={20}
        shadow-camera-bottom={-20}
        shadow-bias={-0.0003}
      />
      <SceneEnvironment />
      {/* group xoay cả nhà + pin theo hướng nhà của khách.
          appliedHeading: heading la bàn được áp dụng (đóng băng khi user xoay view). */}
      <group
        rotation={[
          0,
          ((houseRotation + appliedHeading) * Math.PI) / 180,
          0,
        ]}
      >
        <HouseShell roof={geometry.roof} geometry={geometry} dims={geometry.dims} showEquipment={false} />

        {strings.map((s) => {
          const face = faces[s.faceIndex] || faces[0]
          return (
            <MovableString
              key={s.id}
              face={face}
              faces={faces}
              count={s.count}
              offset={s.offset}
              spin={s.spin}
              orientation={s.orientation}
              panel={panel}
              faceIndex={s.faceIndex}
              selected={s.id === selectedId}
              onSelect={() => onSelect(s.id)}
              onDragState={(state) => onDragState(s.id, state)}
              onGrab={onGrab}
              onRelease={onRelease}
            />
          )
        })}
      </group>

      <ContactShadows position={[0, 0, 0]} opacity={0.5} scale={36} blur={2.4} far={14} />
      <Ground />

      {showCompass && <CompassRose heading={roseHeading} radius={9} />}

      <CameraController
        controlsRef={controlsRef}
        recalibrateKey={recalibrateKey}
      />

      <OrbitControls
        ref={controlsRef}
        enablePan={false}
        enabled={!dragging}
        enableRotate={!compassActive}
        minDistance={10}
        maxDistance={cameraMaxDistance}
        maxPolarAngle={Math.PI / 2.1}
        target={[0, 4, 0]}
        enableDamping
        dampingFactor={0.08}
      />
    </>
  )
}

function clampDimensionInput(value, min, max = BUILDING_DIMENSION_MAX) {
  const v = parseFloat(value)
  if (Number.isNaN(v)) return null
  return Math.min(max, Math.max(min, v))
}

function getInitialDemo2State() {
  if (typeof window === 'undefined') return DEFAULT_DEMO2_STATE
  try {
    return parseDemo2State(window.localStorage.getItem(DEMO2_STORAGE_KEY))
  } catch {
    return DEFAULT_DEMO2_STATE
  }
}

function DimensionInput({ label, value, min, max = BUILDING_DIMENSION_MAX, onChange }) {
  const inputId = useId()
  const [draftState, setDraftState] = useState(() => ({
    source: value,
    draft: String(value),
  }))
  const draft = draftState.source === value ? draftState.draft : String(value)
  const setDraft = (nextDraft) => {
    setDraftState({
      source: value,
      draft: nextDraft,
    })
  }

  const commitDraft = () => {
    const next = clampDimensionInput(draft, min, max)
    if (next == null) {
      setDraft(String(value))
      return
    }
    onChange(next)
    setDraft(String(next))
  }

  return (
    <div className="dimension-field">
      <label htmlFor={inputId}>{label}</label>
      <input
        id={inputId}
        name={inputId}
        type="number"
        min={min}
        max={max}
        step="0.5"
        value={draft}
        onChange={(e) => {
          const nextDraft = e.target.value
          setDraft(nextDraft)
          if (nextDraft.trim() === '' || nextDraft.endsWith('.')) return
          const parsed = Number(nextDraft)
          if (Number.isFinite(parsed) && parsed >= min && parsed <= max) {
            onChange(parsed)
          }
        }}
        onBlur={commitDraft}
      />
    </div>
  )
}

export default function Demo2() {
  const [initialState] = useState(getInitialDemo2State)
  const nextIdRef = useRef(nextStringId(initialState.strings))
  const skipPersistRef = useRef(false)

  const [roofKey, setRoofKey] = useState(initialState.roofKey)
  const [mountKey, setMountKey] = useState(initialState.mountKey)
  const [frameHeight, setFrameHeight] = useState(initialState.frameHeight)
  const [width, setWidth] = useState(initialState.width)
  const [depth, setDepth] = useState(initialState.depth)
  const [lMainWidth, setLMainWidth] = useState(initialState.lMainWidth)
  const [lMainDepth, setLMainDepth] = useState(initialState.lMainDepth)
  const [lWingWidth, setLWingWidth] = useState(initialState.lWingWidth)
  const [lWingDepth, setLWingDepth] = useState(initialState.lWingDepth)
  // kích thước tấm pin nhập theo mm (dài x rộng)
  const [panelLen, setPanelLen] = useState(initialState.panelLen)
  const [panelWid, setPanelWid] = useState(initialState.panelWid)
  const [inputCount, setInputCount] = useState(initialState.inputCount)
  const [targetFace, setTargetFace] = useState(initialState.targetFace) // mặt mái cho chuỗi mới
  const [strings, setStrings] = useState(initialState.strings) // [{id, count, offset, spin, orientation, faceIndex}]
  const [selectedId, setSelectedId] = useState(initialState.selectedId)
  const [dragging, setDragging] = useState(false)
  const [panelOpen, setPanelOpen] = useState(false)
  const [houseRotation, setHouseRotation] = useState(initialState.houseRotation) // hướng nhà (độ)
  const [recalibrateKey, setRecalibrateKey] = useState(0)
  const [compactFrameExport, setCompactFrameExport] = useState(false)
  const [frameCoverageMode, setFrameCoverageMode] = useState('full')
  const controlsRef = useRef(null)
  const canvasRef = useRef(null)
  const frameHeightId = useId()
  const houseDirectionId = useId()
  const panelLenId = useId()
  const panelWidId = useId()
  const inputCountId = useId()
  const effectiveLWingWidth = Math.min(lWingWidth, lMainWidth)

  const changeLMainWidth = (nextWidth) => {
    setLMainWidth(nextWidth)
    setLWingWidth((current) => Math.min(current, nextWidth))
  }

  const changeLWingWidth = (nextWidth) => {
    setLWingWidth(Math.min(nextWidth, lMainWidth))
  }

  const persistedState = useMemo(() => ({
    roofKey,
    mountKey,
    frameHeight,
    width,
    depth,
    lMainWidth,
    lMainDepth,
    lWingWidth: effectiveLWingWidth,
    lWingDepth,
    panelLen,
    panelWid,
    inputCount,
    targetFace,
    strings,
    selectedId,
    houseRotation,
  }), [
    roofKey,
    mountKey,
    frameHeight,
    width,
    depth,
    effectiveLWingWidth,
    lMainWidth,
    lMainDepth,
    lWingDepth,
    panelLen,
    panelWid,
    inputCount,
    targetFace,
    strings,
    selectedId,
    houseRotation,
  ])

  useEffect(() => {
    if (typeof window === 'undefined') return
    if (skipPersistRef.current) {
      skipPersistRef.current = false
      return
    }
    try {
      const serialized = JSON.stringify(persistedState)
      const isDefaultState = serialized === JSON.stringify(DEFAULT_DEMO2_STATE)
      const hasSavedState = window.localStorage.getItem(DEMO2_STORAGE_KEY) != null
      if (!hasSavedState && isDefaultState) return
      window.localStorage.setItem(DEMO2_STORAGE_KEY, serialized)
    } catch {
      // Local storage can be unavailable in private or restricted browsing modes.
    }
  }, [persistedState])

  const compass = useCompass()

  // Có quyền la bàn -> nhà bám heading, hiện phương hướng, khoá vuốt-xoay.
  const appliedHeading = compass.active ? compass.heading : 0
  const showCompass = compass.active

  // Khi vừa được cấp quyền la bàn -> đưa view về góc nhìn chuẩn.
  const prevActive = useRef(false)
  useEffect(() => {
    if (compass.active && !prevActive.current) {
      setRecalibrateKey((k) => k + 1)
    }
    prevActive.current = compass.active
  }, [compass.active])

  // Bấm icon la bàn -> hiệu chỉnh: đưa view về góc nhìn chuẩn (giữ zoom).
  const recalibrate = () => {
    setRecalibrateKey((k) => k + 1)
  }

  const roof = ROOF_TYPES[roofKey]
  const isBranchedRoof = roof.shape === 'l' || roof.shape === 'l-mirror' || roof.shape === 't'

  const dims = useMemo(
    () => {
      if (!isBranchedRoof) {
        return { width, depth, wallHeight: HOUSE.wallHeight, roofHeight: HOUSE.roofHeight }
      }
      return {
        width: lMainWidth,
        depth: lMainDepth + lWingDepth,
        lMainWidth,
        lMainDepth,
        lWingWidth: effectiveLWingWidth,
        lWingDepth,
        wallHeight: HOUSE.wallHeight,
        roofHeight: HOUSE.roofHeight,
      }
    },
    [depth, effectiveLWingWidth, isBranchedRoof, lMainDepth, lMainWidth, lWingDepth, width],
  )
  const sceneFrameTiltDirection = useMemo(
    () => effectiveFrameTiltDirection(
      'south',
      houseRotation + appliedHeading,
    ),
    [houseRotation, appliedHeading],
  )
  const requestedGeometry = useHouseGeometry(
    roof.shape,
    dims,
    mountKey,
    frameHeight,
    sceneFrameTiltDirection,
  )
  const effectiveFrameHeight = mountKey === 'frame'
    ? Math.max(frameHeight, maxFrameRailOffset(requestedGeometry.frames))
    : frameHeight
  const baseGeometry = useHouseGeometry(
    roof.shape,
    dims,
    mountKey,
    effectiveFrameHeight,
    sceneFrameTiltDirection,
  )

  const faceCount = baseGeometry.faces.length
  const faceLabels = useMemo(() => {
    if (roof.shape === 't') {
      return ['Mái chính trước', 'Mái chính sau', 'Mái nhánh trái', 'Mái nhánh phải']
    }
    if (roof.shape === 'l' || roof.shape === 'l-mirror') {
      return ['Mái chính trước', 'Mái chính sau', 'Mái nhánh ngoài', 'Mái nhánh trong']
    }
    return faceCount > 1 ? ['Mái trái', 'Mái phải'] : ['Mái']
  }, [faceCount, roof.shape])
  // đổi mm -> m cho mô hình 3D (độ dày cố định, không cho nhập)
  const panel = useMemo(
    () => ({
      width: panelWid / 1000,
      height: panelLen / 1000,
      thickness: PANEL.thickness,
      gap: PANEL.gap,
    }),
    [panelLen, panelWid],
  )
  const compactExportFrames = useMemo(
    () => compactFramesForStrings({
      frames: baseGeometry.frames,
      faces: baseGeometry.faces,
      strings,
      panel,
    }),
    [baseGeometry.faces, baseGeometry.frames, panel, strings],
  )
  const shouldUseCompactFrames = mountKey === 'frame' &&
    (compactFrameExport || frameCoverageMode === 'compact')
  const displayGeometry = useMemo(
    () => ({
      ...baseGeometry,
      frames: shouldUseCompactFrames
        ? compactExportFrames
        : baseGeometry.frames,
      roof,
      dims,
    }),
    [
      baseGeometry,
      compactExportFrames,
      dims,
      roof,
      shouldUseCompactFrames,
    ],
  )

  const selected = strings.find((s) => s.id === selectedId) || null

  // Thêm 1 chuỗi mới lên mặt mái đang chọn, lệch nhẹ để không chồng khít.
  const addString = () => {
    const id = nextIdRef.current
    nextIdRef.current += 1
    const faceIndex = Math.min(targetFace, faceCount - 1)
    const sameFace = strings.filter((s) => s.faceIndex === faceIndex).length
    setStrings((prev) => [
      ...prev,
      {
        id,
        count: inputCount,
        offset: [0, ((sameFace % 4) - 1.5) * 1.2],
        spin: 0,
        orientation: 'portrait',
        faceIndex,
      },
    ])
    setSelectedId(id)
  }

  const updateSelected = (patch) => {
    if (selectedId == null) return
    setStrings((prev) =>
      prev.map((s) => (s.id === selectedId ? { ...s, ...patch } : s)),
    )
  }

  const setDragStateOf = (id, dragState) => {
    setStrings((prev) =>
      prev.map((s) => {
        if (s.id !== id) return s
        return { ...s, ...dragState }
      }),
    )
  }

  const deleteSelected = () => {
    if (selectedId == null) return
    setStrings((prev) => prev.filter((s) => s.id !== selectedId))
    setSelectedId(null)
  }

  const clearAll = () => {
    setStrings([])
    setSelectedId(null)
  }

  const saveImage = () => {
    const canvas = canvasRef.current?.querySelector('canvas')
    if (!canvas) return
    const download = () => {
      const link = document.createElement('a')
      link.download = `demo2-${strings.length}chuoi.png`
      link.href = canvas.toDataURL('image/png')
      link.click()
    }

    if (mountKey !== 'frame' || strings.length === 0) {
      download()
      return
    }

    setCompactFrameExport(true)
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        download()
        setCompactFrameExport(false)
      })
    })
  }

  const resetSimulation = () => {
    skipPersistRef.current = true
    try {
      window.localStorage.removeItem(DEMO2_STORAGE_KEY)
    } catch {
      // Ignore storage failures; the visible state still resets.
    }
    const reset = DEFAULT_DEMO2_STATE
    nextIdRef.current = nextStringId(reset.strings)
    setRoofKey(reset.roofKey)
    setMountKey(reset.mountKey)
    setFrameHeight(reset.frameHeight)
    setWidth(reset.width)
    setDepth(reset.depth)
    setLMainWidth(reset.lMainWidth)
    setLMainDepth(reset.lMainDepth)
    setLWingWidth(reset.lWingWidth)
    setLWingDepth(reset.lWingDepth)
    setPanelLen(reset.panelLen)
    setPanelWid(reset.panelWid)
    setInputCount(reset.inputCount)
    setTargetFace(reset.targetFace)
    setStrings(reset.strings)
    setSelectedId(reset.selectedId)
    setHouseRotation(reset.houseRotation)
    setFrameCoverageMode('full')
    setDragging(false)
  }

  const totalPanels = strings.reduce((a, s) => a + s.count, 0)

  return (
    <div className={`${styles.solar3dScope} app ${panelOpen ? 'panel-open' : ''}`}>
      <div className="canvas-wrap" ref={canvasRef}>
        <Canvas
          shadows="basic"
          camera={{ position: [16, 12, 18], fov: 42 }}
          dpr={[1, 2]}
          gl={{ preserveDrawingBuffer: true, antialias: true }}
        >
          <Scene
            geometry={displayGeometry}
            panel={panel}
            strings={strings}
            selectedId={selectedId}
            dragging={dragging}
            onSelect={setSelectedId}
            onDragState={setDragStateOf}
            onGrab={() => setDragging(true)}
            onRelease={() => setDragging(false)}
            compassActive={compass.active}
            showCompass={showCompass}
            roseHeading={compass.heading}
            appliedHeading={appliedHeading}
            houseRotation={houseRotation}
            controlsRef={controlsRef}
            recalibrateKey={recalibrateKey}
          />
        </Canvas>
        <img
          className="scene-logo"
          src="/brand/symbol-10.png"
          alt="SOLIQ ENERGY"
          aria-hidden="true"
        />
        {/* slider chỉnh hướng nhà + nút la bàn, nổi trên đầu vùng 3D */}
        <div className="house-dir-overlay">
          <div className="house-dir-row">
            <label className="house-dir-label" htmlFor={houseDirectionId}>
              <span>🧭 Hướng nhà</span>
              <b>{houseRotation}°</b>
            </label>
            {compass.supported &&
              (!compass.active ? (
                <button className="compass-btn" onClick={compass.request}>
                  Bật la bàn
                </button>
              ) : (
                <button
                  className={`compass-btn ${compass.active ? 'on' : ''}`}
                  onClick={recalibrate}
                  title="Hiệu chỉnh về đúng hướng la bàn"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10" />
                    <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" />
                  </svg>
                  Hiệu chỉnh
                </button>
              ))}
          </div>
          <input
            id={houseDirectionId}
            name={houseDirectionId}
            type="range"
            aria-label="Chỉnh hướng nhà"
            min="0"
            max="360"
            step="1"
            value={houseRotation}
            onPointerDown={(e) => e.stopPropagation()}
            onTouchStart={(e) => e.stopPropagation()}
            onChange={(e) => setHouseRotation(parseInt(e.target.value, 10))}
          />
          {compass.error && <p className="compass-err-overlay">{compass.error}</p>}
        </div>

        {/* nút mở form cài đặt (mobile) */}
        <button
          className="settings-fab"
          onClick={() => setPanelOpen(true)}
          aria-label="Mở cài đặt"
        >
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="3" />
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
          </svg>
        </button>
      </div>

      {/* nền mờ, chạm để đóng form (mobile) */}
      <div className="panel-backdrop" onClick={() => setPanelOpen(false)} />

      <div className="panel">
        {/* nút đóng form (mobile) */}
        <button
          className="panel-close"
          onClick={() => setPanelOpen(false)}
          aria-label="Đóng cài đặt"
        >
          ✕
        </button>

        <div className="panel-header">
          <h1>Demo 2 · Đặt chuỗi pin thủ công</h1>
        </div>
        <p className="sub">Nhập số tấm, bấm Thêm. Mỗi chuỗi giữ độc lập.</p>

        <div className="field">
          <label>Loại mái</label>
          <div className="options">
            {Object.entries(ROOF_TYPES).map(([key, val]) => (
              <div
                key={key}
                className={`opt ${roofKey === key ? 'active' : ''}`}
                onClick={() => setRoofKey(key)}
              >
                {val.label}
              </div>
            ))}
          </div>
        </div>

        {isBranchedRoof ? (
          <div className="dimension-grid two">
            <DimensionInput
              label="Rộng mái chính"
              value={lMainWidth}
              min={4}
              onChange={changeLMainWidth}
            />
            <DimensionInput
              label="Dài mái chính"
              value={lMainDepth}
              min={3}
              onChange={setLMainDepth}
            />
            <DimensionInput
              label="Rộng mái nhánh"
              value={effectiveLWingWidth}
              min={3}
              max={lMainWidth}
              onChange={changeLWingWidth}
            />
            <DimensionInput
              label="Dài mái nhánh"
              value={lWingDepth}
              min={3}
              onChange={setLWingDepth}
            />
          </div>
        ) : (
          <div className="dimension-grid two">
            <DimensionInput
              label="Chiều rộng nhà"
              value={width}
              min={4}
              onChange={setWidth}
            />
            <DimensionInput
              label="Chiều dài nhà"
              value={depth}
              min={4}
              onChange={setDepth}
            />
          </div>
        )}

        <div className="field">
          <label>Cách lắp</label>
          <div className="options">
            {Object.entries(MOUNT_TYPES).map(([key, val]) => (
              <div
                key={key}
                className={`opt ${mountKey === key ? 'active' : ''}`}
                onClick={() => setMountKey(key)}
              >
                {val.label}
              </div>
            ))}
          </div>
        </div>

        {mountKey === 'frame' && (
          <div className="field">
            <label htmlFor={frameHeightId}>
              Độ cao khung sắt:{' '}
              <span className="kw-value">{effectiveFrameHeight.toFixed(1)} m</span>
            </label>
            <input
              id={frameHeightId}
              name={frameHeightId}
              type="range"
              min={FRAME_HEIGHT.min}
              max={FRAME_HEIGHT.max}
              step={FRAME_HEIGHT.step}
              value={frameHeight}
              onChange={(e) => setFrameHeight(parseFloat(e.target.value))}
            />
            <div className="frame-actions">
              <button
                type="button"
                className={`frame-action ${frameCoverageMode === 'compact' ? 'active' : ''}`}
                onClick={() => setFrameCoverageMode('compact')}
              >
                Xoá khung sắt dư thừa
              </button>
              <button
                type="button"
                className={`frame-action ${frameCoverageMode === 'full' ? 'active' : ''}`}
                onClick={() => setFrameCoverageMode('full')}
              >
                Hiện toàn bộ khung sắt
              </button>
            </div>
          </div>
        )}

        <div className="field">
          <label>Kích thước tấm pin (mm)</label>
          <div className="dim-grid two">
            <div className="dim-cell">
              <label htmlFor={panelLenId}>Dài</label>
              <input
                id={panelLenId}
                name={panelLenId}
                type="number"
                min="500"
                max="2600"
                value={panelLen}
                onChange={(e) => {
                  const v = parseInt(e.target.value, 10)
                  if (!Number.isNaN(v)) setPanelLen(v)
                }}
              />
            </div>
            <div className="dim-cell">
              <label htmlFor={panelWidId}>Rộng</label>
              <input
                id={panelWidId}
                name={panelWidId}
                type="number"
                min="300"
                max="1500"
                value={panelWid}
                onChange={(e) => {
                  const v = parseInt(e.target.value, 10)
                  if (!Number.isNaN(v)) setPanelWid(v)
                }}
              />
            </div>
          </div>
        </div>

        {faceCount > 1 && (
          <div className="field">
            <label>Đặt chuỗi mới lên</label>
            <div className="options">
              {faceLabels.map((lbl, i) => (
                <div
                  key={i}
                  className={`opt ${targetFace === i ? 'active' : ''}`}
                  onClick={() => setTargetFace(i)}
                >
                  {lbl}
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="field">
          <label htmlFor={inputCountId}>Số tấm pin trong chuỗi mới</label>
          <div className="stepper">
            <button onClick={() => setInputCount((c) => Math.max(1, c - 1))}>−</button>
            <input
              id={inputCountId}
              name={inputCountId}
              type="number"
              min="1"
              max="40"
              value={inputCount}
              onChange={(e) => {
                const v = parseInt(e.target.value, 10)
                if (!Number.isNaN(v)) setInputCount(Math.min(40, Math.max(1, v)))
              }}
            />
            <button onClick={() => setInputCount((c) => Math.min(40, c + 1))}>+</button>
          </div>
        </div>

        <div className="field">
          <div className="options">
            <div className="opt active" onClick={addString}>
              ＋ Thêm chuỗi {inputCount} tấm
            </div>
            <div className="opt" onClick={clearAll}>
              🗑 Xoá tất cả
            </div>
          </div>
        </div>

        {/* danh sách chuỗi đã thêm */}
        {strings.length > 0 && (
          <div className="field">
            <label>Các chuỗi ({strings.length})</label>
            <div className="string-list">
              {strings.map((s, i) => (
                <div
                  key={s.id}
                  className={`string-item ${s.id === selectedId ? 'active' : ''}`}
                  onClick={() => setSelectedId(s.id)}
                >
                  Chuỗi {i + 1}: {s.count} tấm ({s.orientation === 'portrait' ? 'dọc' : 'ngang'})
                  {faceCount > 1 && ` · ${faceLabels[s.faceIndex] || ''}`}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* điều khiển chuỗi đang chọn */}
        {selected && (
          <>
            <div className="field">
              <label>Hướng tấm pin (chuỗi đang chọn)</label>
              <div className="options">
                <div
                  className={`opt ${selected.orientation === 'portrait' ? 'active' : ''}`}
                  onClick={() => updateSelected({ orientation: 'portrait' })}
                >
                  ↕ Dọc
                </div>
                <div
                  className={`opt ${selected.orientation === 'landscape' ? 'active' : ''}`}
                  onClick={() => updateSelected({ orientation: 'landscape' })}
                >
                  ↔ Ngang
                </div>
              </div>
            </div>

            <div className="field">
              <label>
                Xoay chuỗi:{' '}
                <span className="kw-value">
                  {Math.round((selected.spin * 180) / Math.PI)}°
                </span>
              </label>
              <input
                type="range"
                min="-180"
                max="180"
                step="1"
                value={Math.round((selected.spin * 180) / Math.PI)}
                onChange={(e) =>
                  updateSelected({ spin: (parseFloat(e.target.value) * Math.PI) / 180 })
                }
              />
            </div>

            <div className="field">
              <div className="options single">
                <div className="opt" onClick={deleteSelected}>
                  🗑 Xoá chuỗi này
                </div>
              </div>
            </div>
          </>
        )}

        <div className="summary">
          Tổng: <b>{strings.length} chuỗi</b> · <b>{totalPanels} tấm</b>
          {selected && (
            <>
              <br />
              Đang chọn chuỗi {strings.findIndex((s) => s.id === selectedId) + 1}: vị trí{' '}
              <b>
                {selected.offset[0].toFixed(1)}, {selected.offset[1].toFixed(1)}
              </b>{' '}
              m
            </>
          )}
        </div>

        <button className="save-btn" onClick={saveImage}>
          📷 Lưu ảnh mô phỏng
        </button>

        <button className="save-btn reset-btn" onClick={resetSimulation}>
          Reset mô phỏng
        </button>
      </div>
    </div>
  )
}
