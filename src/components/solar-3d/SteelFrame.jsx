import React, { useMemo } from 'react'
import * as THREE from 'three'
import { worldVerticalPost, worldVerticalTop } from './frameGeometry.js'

// Vật liệu thép mạ kẽm dùng chung.
const STEEL = { color: '#8b9198', metalness: 0.78, roughness: 0.34 }
const CONCRETE = { color: '#b7b3aa', metalness: 0.05, roughness: 0.95 }

// Một thanh thép (ống tròn) nối 2 điểm bất kỳ trong không gian.
function Strut({ a, b, r = 0.035, mat = STEEL }) {
  const { pos, quat, len } = useMemo(() => {
    const va = new THREE.Vector3(...a)
    const vb = new THREE.Vector3(...b)
    const dir = new THREE.Vector3().subVectors(vb, va)
    const len = dir.length()
    const mid = new THREE.Vector3().addVectors(va, vb).multiplyScalar(0.5)
    const quat = new THREE.Quaternion().setFromUnitVectors(
      new THREE.Vector3(0, 1, 0),
      dir.clone().normalize(),
    )
    return { pos: mid, quat, len }
  }, [a, b])

  return (
    <mesh position={pos} quaternion={quat} castShadow>
      <cylinderGeometry args={[r, r, len, 10]} />
      <meshStandardMaterial {...mat} />
    </mesh>
  )
}

// Đế bê tông dưới chân trụ.
function Footing({ x, z, deckY }) {
  return (
    <mesh position={[x, deckY + 0.1, z]} castShadow receiveShadow>
      <boxGeometry args={[0.26, 0.2, 0.26]} />
      <meshStandardMaterial {...CONCRETE} />
    </mesh>
  )
}

// Giàn khung sắt đỡ tấm pin trên mái phẳng (sân thượng).
//  - areaW: bề ngang giàn (trục X)
//  - areaH: chiều sâu giàn (trục Z)
//  - tilt:  góc nghiêng (radian), mặt pin cao ở sau (-Z), thấp ở trước (+Z)
//  - centerY: cao độ tâm mặt rail (khớp với đáy cụm pin)
//  - deckY: cao độ mặt sàn thượng
export default function SteelFrame({ areaW, areaH, tilt, centerY, deckY }) {
  const tan = Math.tan(tilt)
  const railTop = centerY - 0.05 // tâm thanh rail, ngay dưới pin

  // Cao độ mặt rail tại vị trí z (world): cao ở sau (-z), thấp ở trước (+z).
  const railY = (z) => railTop - z * tan

  // Lưới trụ: cột theo X, hàng theo Z.
  const { colXs, rowZs } = useMemo(() => {
    const nCols = Math.max(1, Math.round(areaW / 2.3))
    const cols = []
    for (let i = 0; i <= nCols; i++) cols.push(-areaW / 2 + (i * areaW) / nCols)

    const inset = 0.4
    const rows = [-areaH / 2 + inset, areaH / 2 - inset]
    if (areaH > 6) rows.splice(1, 0, 0) // thêm hàng giữa nếu giàn dài
    return { colXs: cols, rowZs: rows }
  }, [areaW, areaH])

  const postBaseY = deckY + 0.2 // chân trụ bắt đầu trên đế bê tông

  const elements = []

  // Trụ đứng + đế bê tông tại mỗi mắt lưới.
  colXs.forEach((x, ci) => {
    rowZs.forEach((z, ri) => {
      const topY = railY(z) - 0.06
      elements.push(<Footing key={`f-${ci}-${ri}`} x={x} z={z} deckY={deckY} />)
      elements.push(
        <Strut
          key={`p-${ci}-${ri}`}
          a={[x, postBaseY, z]}
          b={[x, topY, z]}
          r={0.045}
        />,
      )
    })
  })

  // Rail dọc theo độ dốc (trục Z) tại mỗi cột — đỡ trực tiếp tấm pin.
  const zBack = -areaH / 2 + 0.1
  const zFront = areaH / 2 - 0.1
  colXs.forEach((x, ci) => {
    elements.push(
      <Strut
        key={`rail-${ci}`}
        a={[x, railY(zBack), zBack]}
        b={[x, railY(zFront), zFront]}
        r={0.04}
      />,
    )
  })

  // Xà ngang (trục X) nối các trụ ở hàng trước & sau để cứng vững.
  rowZs.forEach((z, ri) => {
    elements.push(
      <Strut
        key={`beam-${ri}`}
        a={[colXs[0], railY(z) - 0.06, z]}
        b={[colXs[colXs.length - 1], railY(z) - 0.06, z]}
        r={0.04}
      />,
    )
  })

  // Thanh giằng chéo trên 2 bent ngoài cùng (đầu hồi giàn) cho chắc.
  ;[colXs[0], colXs[colXs.length - 1]].forEach((x, i) => {
    const zb = -areaH / 2 + 0.4
    const zf = areaH / 2 - 0.4
    elements.push(
      <Strut
        key={`brace-a-${i}`}
        a={[x, postBaseY, zf]}
        b={[x, railY(zb) - 0.06, zb]}
        r={0.03}
      />,
    )
    elements.push(
      <Strut
        key={`brace-b-${i}`}
        a={[x, postBaseY, zb]}
        b={[x, railY(zf) - 0.06, zf]}
        r={0.03}
      />,
    )
  })

  return <group>{elements}</group>
}

// Giàn khung sắt bám theo mặt mái dốc, nhưng trụ đứng vuông góc với mặt đất.
export function SurfaceSteelFrame({
  areaW,
  areaH,
  railOffset = 0.46,
  position,
  rotation,
  topCenter,
  topTilt = 0,
  tiltDirection = 'roof',
}) {
  const { colXs, rowZs } = useMemo(() => {
    const nCols = Math.max(1, Math.round(areaW / 2.3))
    const cols = []
    for (let i = 0; i <= nCols; i++) cols.push(-areaW / 2 + (i * areaW) / nCols)

    const inset = 0.35
    const rows = [-areaH / 2 + inset, areaH / 2 - inset]
    if (areaH > 6) rows.splice(1, 0, 0)
    return { colXs: cols, rowZs: rows }
  }, [areaW, areaH])

  const euler = useMemo(() => new THREE.Euler(...rotation), [rotation])
  const toWorld = (x, y, z) => {
    const point = new THREE.Vector3(x, y, z).applyEuler(euler)
    point.x += position[0]
    point.y += position[1]
    point.z += position[2]
    return point.toArray()
  }

  const baseLift = 0.06
  const postHeight = railOffset
  const topPoint = (x, z, height = postHeight) => {
    const base = toWorld(x, baseLift, z)
    if (tiltDirection === 'roof') return worldVerticalPost(base, height).b
    return worldVerticalTop(base, {
      height,
      center: topCenter,
      tilt: topTilt,
      direction: tiltDirection,
    })
  }
  const elements = []

  colXs.forEach((x, ci) => {
    rowZs.forEach((z, ri) => {
      const base = toWorld(x, baseLift, z)
      elements.push(
        <Strut
          key={`sf-p-${ci}-${ri}`}
          a={base}
          b={topPoint(x, z)}
          r={0.04}
        />,
      )
    })
  })

  const zBack = -areaH / 2 + 0.1
  const zFront = areaH / 2 - 0.1
  colXs.forEach((x, ci) => {
    elements.push(
      <Strut
        key={`sf-rail-${ci}`}
        a={topPoint(x, zBack)}
        b={topPoint(x, zFront)}
        r={0.04}
      />,
    )
  })

  rowZs.forEach((z, ri) => {
    elements.push(
      <Strut
        key={`sf-beam-${ri}`}
        a={topPoint(colXs[0], z, postHeight - 0.06)}
        b={topPoint(colXs[colXs.length - 1], z, postHeight - 0.06)}
        r={0.04}
      />,
    )
  })

  ;[colXs[0], colXs[colXs.length - 1]].forEach((x, i) => {
    const zb = -areaH / 2 + 0.4
    const zf = areaH / 2 - 0.4
    elements.push(
      <Strut
        key={`sf-brace-a-${i}`}
        a={toWorld(x, baseLift, zf)}
        b={topPoint(x, zb, postHeight - 0.06)}
        r={0.028}
      />,
    )
    elements.push(
      <Strut
        key={`sf-brace-b-${i}`}
        a={toWorld(x, baseLift, zb)}
        b={topPoint(x, zf, postHeight - 0.06)}
        r={0.028}
      />,
    )
  })

  return <group>{elements}</group>
}
