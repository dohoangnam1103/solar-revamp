import * as THREE from 'three'

// Tạo texture bằng canvas (procedural) — không cần tải file ngoài,
// chạy offline, và tự lặp (tile) mượt trên bề mặt mái.
// Mỗi texture chỉ tạo 1 lần rồi cache lại.

const cache = {}
function cached(key, factory) {
  if (!cache[key]) cache[key] = factory()
  return cache[key]
}

function makeCanvas(w, h) {
  const c = document.createElement('canvas')
  c.width = w
  c.height = h
  return c
}

function toTexture(canvas, repeat = [1, 1]) {
  const tex = new THREE.CanvasTexture(canvas)
  tex.wrapS = THREE.RepeatWrapping
  tex.wrapT = THREE.RepeatWrapping
  tex.repeat.set(repeat[0], repeat[1])
  tex.anisotropy = 8
  tex.colorSpace = THREE.SRGBColorSpace
  return tex
}

// ---------- TẤM PIN MẶT TRỜI ----------
// Vẽ lưới cell mono (góc vát), busbar trắng, nền xanh đậm.
export function solarTexture() {
  return cached('solar', () => {
    const cols = 6
    const rows = 12
    const cell = 84 // px mỗi cell
    const pad = 6
    const w = cols * cell
    const h = rows * cell
    const c = makeCanvas(w, h)
    const ctx = c.getContext('2d')

    // nền (khe giữa cell) xanh rất đậm
    ctx.fillStyle = '#0a1530'
    ctx.fillRect(0, 0, w, h)

    for (let r = 0; r < rows; r++) {
      for (let col = 0; col < cols; col++) {
        const x = col * cell + pad
        const y = r * cell + pad
        const s = cell - pad * 2

        // gradient nhẹ trong từng cell → cảm giác phản quang
        const g = ctx.createLinearGradient(x, y, x + s, y + s)
        g.addColorStop(0, '#1c3f7a')
        g.addColorStop(0.5, '#16315f')
        g.addColorStop(1, '#102447')
        ctx.fillStyle = g

        // cell mono: góc vát
        const cut = 12
        ctx.beginPath()
        ctx.moveTo(x + cut, y)
        ctx.lineTo(x + s - cut, y)
        ctx.lineTo(x + s, y + cut)
        ctx.lineTo(x + s, y + s - cut)
        ctx.lineTo(x + s - cut, y + s)
        ctx.lineTo(x + cut, y + s)
        ctx.lineTo(x, y + s - cut)
        ctx.lineTo(x, y + cut)
        ctx.closePath()
        ctx.fill()

        // busbar dọc (2 đường mảnh)
        ctx.fillStyle = 'rgba(200,210,230,0.35)'
        ctx.fillRect(x + s * 0.33, y, 2, s)
        ctx.fillRect(x + s * 0.66, y, 2, s)
      }
    }
    return toTexture(c, [1, 1])
  })
}

// ---------- MÁI TÔN (sóng) ----------
// color map: sọc sáng/tối; normal map: sóng hình sin để bắt sáng.
export function metalRoofMaps() {
  return cached('metal', () => {
    const w = 256
    const h = 16
    // color
    const c = makeCanvas(w, h)
    const ctx = c.getContext('2d')
    for (let x = 0; x < w; x++) {
      const wave = Math.sin((x / w) * Math.PI * 2 * 8) // 8 sóng
      const v = 150 + wave * 45
      ctx.fillStyle = `rgb(${v},${v + 6},${v + 14})`
      ctx.fillRect(x, 0, 1, h)
    }
    const color = toTexture(c, [0.5, 0.5])

    // normal map
    const nc = makeCanvas(w, h)
    const nctx = nc.getContext('2d')
    for (let x = 0; x < w; x++) {
      // đạo hàm sóng → độ nghiêng theo trục x
      const slope = Math.cos((x / w) * Math.PI * 2 * 8)
      const nx = slope * 0.8
      const nz = Math.sqrt(Math.max(0.0001, 1 - nx * nx))
      const r = Math.floor((nx * 0.5 + 0.5) * 255)
      const g = 128
      const b = Math.floor((nz * 0.5 + 0.5) * 255)
      nctx.fillStyle = `rgb(${r},${g},${b})`
      nctx.fillRect(x, 0, 1, h)
    }
    const normal = new THREE.CanvasTexture(nc)
    normal.wrapS = THREE.RepeatWrapping
    normal.wrapT = THREE.RepeatWrapping
    normal.repeat.set(0.5, 0.5)
    normal.anisotropy = 8

    return { color, normal }
  })
}

// ---------- MÁI NGÓI ----------
// hàng ngói cong, màu đất nung, có đường bóng giữa các hàng.
export function tileRoofMaps() {
  return cached('tile', () => {
    const w = 128
    const h = 128
    const c = makeCanvas(w, h)
    const ctx = c.getContext('2d')

    const rowH = 32
    const colW = 32
    for (let y = 0; y < h; y += rowH) {
      for (let x = 0; x < w; x += colW) {
        // offset xen kẽ từng hàng
        const off = (Math.floor(y / rowH) % 2) * (colW / 2)
        const px = x + off
        const g = ctx.createLinearGradient(0, y, 0, y + rowH)
        g.addColorStop(0, '#b5503f')
        g.addColorStop(0.7, '#9e4030')
        g.addColorStop(1, '#7a2f23')
        ctx.fillStyle = g
        ctx.fillRect(px, y, colW - 1, rowH - 1)
        // bo tròn mép trên viên ngói
        ctx.fillStyle = 'rgba(255,200,170,0.18)'
        ctx.fillRect(px, y, colW - 1, 4)
      }
      // đường bóng cuối hàng
      ctx.fillStyle = 'rgba(40,15,10,0.5)'
      ctx.fillRect(0, y + rowH - 3, w, 3)
    }
    const color = toTexture(c, [1.4, 1.4])

    // normal map đơn giản: gờ ngang giữa các hàng
    const nc = makeCanvas(w, h)
    const nctx = nc.getContext('2d')
    nctx.fillStyle = 'rgb(128,128,255)'
    nctx.fillRect(0, 0, w, h)
    for (let y = 0; y < h; y += rowH) {
      const grad = nctx.createLinearGradient(0, y, 0, y + rowH)
      grad.addColorStop(0, 'rgb(128,80,235)')
      grad.addColorStop(0.5, 'rgb(128,128,255)')
      grad.addColorStop(1, 'rgb(128,180,235)')
      nctx.fillStyle = grad
      nctx.fillRect(0, y, w, rowH)
    }
    const normal = new THREE.CanvasTexture(nc)
    normal.wrapS = THREE.RepeatWrapping
    normal.wrapT = THREE.RepeatWrapping
    normal.repeat.set(1.4, 1.4)
    normal.anisotropy = 8

    return { color, normal }
  })
}

// ---------- TƯỜNG ----------
export function wallTexture() {
  return cached('wall', () => {
    const w = 256
    const h = 256
    const c = makeCanvas(w, h)
    const ctx = c.getContext('2d')
    ctx.fillStyle = '#e9e3d6'
    ctx.fillRect(0, 0, w, h)
    // nhiễu nhẹ cho đỡ phẳng
    for (let i = 0; i < 4000; i++) {
      const x = Math.random() * w
      const y = Math.random() * h
      const a = Math.random() * 0.05
      ctx.fillStyle = `rgba(120,110,95,${a})`
      ctx.fillRect(x, y, 2, 2)
    }
    return toTexture(c, [2, 2])
  })
}

// ---------- MẶT ĐẤT (cỏ) ----------
export function groundTexture() {
  return cached('ground', () => {
    const w = 256
    const h = 256
    const c = makeCanvas(w, h)
    const ctx = c.getContext('2d')
    ctx.fillStyle = '#b9c7a6'
    ctx.fillRect(0, 0, w, h)
    for (let i = 0; i < 9000; i++) {
      const x = Math.random() * w
      const y = Math.random() * h
      const shade = Math.random()
      ctx.fillStyle = `rgba(${110 + shade * 40},${130 + shade * 40},${
        90 + shade * 30
      },0.5)`
      ctx.fillRect(x, y, 2, 3)
    }
    return toTexture(c, [12, 12])
  })
}
