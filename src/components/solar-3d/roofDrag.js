import * as THREE from 'three'

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value))
}

function clampToFace(face, u, v) {
  return [
    clamp(u, -face.areaW / 2, face.areaW / 2),
    clamp(v, -face.areaH / 2, face.areaH / 2),
  ]
}

const CROSS_EPSILON = 0.08
const ENTER_INSET = 0.18
const RAY_FACE_MARGIN = 0.12

function insetEdge(halfSize, sign) {
  return sign * Math.max(0, halfSize - ENTER_INSET)
}

export function resolveRoofDragFace({ roofShape, faces, faceIndex, rawUV }) {
  let fi = faceIndex < faces.length ? faceIndex : 0
  let [u, v] = rawUV
  const face = faces[fi]
  const halfW = face.areaW / 2
  const halfH = face.areaH / 2

  if (roofShape === 't') {
    if (fi === 0 && v < -halfH - CROSS_EPSILON) {
      const overshoot = -halfH - v
      fi = 1
      v = insetEdge(faces[1].areaH / 2, 1) - overshoot
    } else if (fi === 1 && v > halfH + CROSS_EPSILON) {
      const overshoot = v - halfH
      fi = 0
      v = insetEdge(faces[0].areaH / 2, -1) + overshoot
    } else if (fi === 1 && v < -halfH - CROSS_EPSILON && faces.length >= 4) {
      fi = u < 0 ? 2 : 3
      u = insetEdge(faces[fi].areaW / 2, fi === 2 ? 1 : -1)
      v = insetEdge(faces[fi].areaH / 2, 1)
    } else if (fi === 2 && u > halfW + CROSS_EPSILON) {
      fi = 3
      u = insetEdge(faces[3].areaW / 2, -1)
    } else if (fi === 3 && u < -halfW - CROSS_EPSILON) {
      fi = 2
      u = insetEdge(faces[2].areaW / 2, 1)
    } else if ((fi === 2 || fi === 3) && v > halfH + CROSS_EPSILON) {
      fi = 1
      u = fi === 2 ? -faces[1].areaW / 4 : faces[1].areaW / 4
      v = insetEdge(faces[1].areaH / 2, -1)
    }
  } else if (roofShape === 'l' || roofShape === 'l-mirror') {
    const sideSign = roofShape === 'l-mirror' ? 1 : -1
    const crossedWingSide = sideSign * u > halfW + CROSS_EPSILON

    if (fi === 0 && v < -halfH - CROSS_EPSILON) {
      const overshoot = -halfH - v
      fi = 1
      v = insetEdge(faces[1].areaH / 2, 1) - overshoot
    } else if (fi === 1 && v > halfH + CROSS_EPSILON) {
      const overshoot = v - halfH
      fi = 0
      v = insetEdge(faces[0].areaH / 2, -1) + overshoot
    } else if ((fi === 0 || fi === 1) && crossedWingSide && faces.length >= 4) {
      fi = fi === 0 ? 2 : 3
      u = insetEdge(faces[fi].areaW / 2, -sideSign)
      v = clamp(v, -faces[fi].areaH / 2, faces[fi].areaH / 2)
    } else if (fi === 2 && sideSign * u < -halfW - CROSS_EPSILON) {
      fi = 3
      u = insetEdge(faces[3].areaW / 2, sideSign)
    } else if (fi === 3 && sideSign * u > halfW + CROSS_EPSILON) {
      fi = 2
      u = insetEdge(faces[2].areaW / 2, -sideSign)
    } else if ((fi === 2 || fi === 3) && v > halfH + CROSS_EPSILON) {
      fi = fi === 2 ? 0 : 1
      u = insetEdge(faces[fi].areaW / 2, sideSign)
      v = 0
    }
  } else if (faces.length > 1) {
    if (fi === 0 && v < -halfH - CROSS_EPSILON) {
      const overshoot = -halfH - v
      fi = 1
      v = insetEdge(faces[1].areaH / 2, 1) - overshoot
    } else if (fi === 1 && v > halfH + CROSS_EPSILON) {
      const overshoot = v - halfH
      fi = 0
      v = insetEdge(faces[0].areaH / 2, -1) + overshoot
    }
  }

  const [clampedU, clampedV] = clampToFace(faces[fi], u, v)
  return { faceIndex: fi, offset: [clampedU, clampedV] }
}

function faceMatrixWorld(face, parentMatrixWorld) {
  const matrix = new THREE.Matrix4().compose(
    new THREE.Vector3(...face.position),
    new THREE.Quaternion().setFromEuler(new THREE.Euler(...face.rotation)),
    new THREE.Vector3(1, 1, 1),
  )
  return parentMatrixWorld.clone().multiply(matrix)
}

export function rayToFaceUV(ray, face, parentMatrixWorld = new THREE.Matrix4()) {
  const matrix = faceMatrixWorld(face, parentMatrixWorld)
  const position = new THREE.Vector3().setFromMatrixPosition(matrix)
  const rotation = new THREE.Quaternion().setFromRotationMatrix(matrix)
  const normal = new THREE.Vector3(0, 1, 0).applyQuaternion(rotation)
  const plane = new THREE.Plane().setFromNormalAndCoplanarPoint(normal, position)
  const hit = new THREE.Vector3()
  if (!ray.intersectPlane(plane, hit)) return null

  const local = hit.clone().applyMatrix4(matrix.clone().invert())
  return [local.x, local.z]
}

function outsideDistance(face, offset, margin = 0) {
  const overU = Math.max(0, Math.abs(offset[0]) - face.areaW / 2 - margin)
  const overV = Math.max(0, Math.abs(offset[1]) - face.areaH / 2 - margin)
  return Math.hypot(overU, overV)
}

export function resolveRoofDragFromRay({
  ray,
  faces,
  currentFaceIndex,
  parentMatrixWorld = new THREE.Matrix4(),
  gripOffset = [0, 0],
}) {
  const fi = currentFaceIndex < faces.length ? currentFaceIndex : 0
  const currentFace = faces[fi] || faces[0]
  const currentUV = rayToFaceUV(ray, currentFace, parentMatrixWorld)
  if (!currentUV) return null

  const currentOffset = [
    currentUV[0] - gripOffset[0],
    currentUV[1] - gripOffset[1],
  ]
  const currentOutside = outsideDistance(currentFace, currentOffset)

  if (currentOutside === 0) {
    const [u, v] = clampToFace(currentFace, currentOffset[0], currentOffset[1])
    return { faceIndex: fi, offset: [u, v] }
  }

  const candidates = faces
    .map((face, faceIndex) => {
      if (faceIndex === fi) return null
      const uv = rayToFaceUV(ray, face, parentMatrixWorld)
      if (!uv) return null
      const distance = outsideDistance(face, uv, RAY_FACE_MARGIN)
      if (distance > 0) return null
      return { faceIndex, offset: clampToFace(face, uv[0], uv[1]) }
    })
    .filter(Boolean)

  if (candidates.length > 0) {
    return candidates[0]
  }

  const [u, v] = clampToFace(currentFace, currentOffset[0], currentOffset[1])
  return { faceIndex: fi, offset: [u, v] }
}
