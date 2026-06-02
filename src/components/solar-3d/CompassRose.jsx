import React, { useMemo } from 'react'
import SpriteLabel from './SpriteLabel.jsx'

// Vòng la bàn đặt quanh nhà, xoay theo hướng thực tế từ cảm biến.
//  - heading: góc la bàn của thiết bị (độ). Ta xoay vòng ngược lại để hướng
//    Bắc luôn chỉ đúng phương Bắc thực tế so với mô hình.
//  - radius: bán kính đặt nhãn N/E/S/W.
export default function CompassRose({ heading = 0, radius = 9 }) {
  // Hiệu chỉnh cho kịch bản: điện thoại đặt phẳng, nhìn mô hình từ trên xuống.
  // Quay cụm theo +heading để la bàn xoay đúng chiều như la bàn thật khi
  // người dùng xoay thiết bị (Bắc luôn chỉ về phương Bắc thực tế).
  const rot = useMemo(() => (heading * Math.PI) / 180, [heading])

  // Bố trí theo góc nhìn từ trên xuống (up = -Z, phải = +X):
  //   Bắc ở -Z (xa/trên), Đông +X (phải), Nam +Z (gần/dưới), Tây -X (trái).
  // Đi N -> Đ -> N -> T theo chiều kim đồng hồ = la bàn hợp lệ.
  const dirs = [
    { label: 'B', color: '#e23b3b', angle: Math.PI }, // Bắc -> -Z
    { label: 'Đ', color: '#1b2733', angle: Math.PI / 2 }, // Đông -> +X
    { label: 'N', color: '#1b2733', angle: 0 }, // Nam -> +Z
    { label: 'T', color: '#1b2733', angle: -Math.PI / 2 }, // Tây -> -X
  ]

  const y = 0.05

  return (
    <group rotation={[0, rot, 0]}>
      {/* mũi tên chỉ Bắc (đặt ở -Z, chĩa ra ngoài) */}
      <mesh position={[0, y, -(radius - 0.8)]} rotation={[Math.PI / 2, 0, 0]}>
        <coneGeometry args={[0.4, 1.2, 3]} />
        <meshStandardMaterial color="#e23b3b" />
      </mesh>

      {dirs.map((d) => {
        const x = Math.sin(d.angle) * radius
        const z = Math.cos(d.angle) * radius
        return (
          <SpriteLabel
            key={d.label}
            position={[x, y + 0.6, z]}
            color={d.color}
            scale={1.05}
            fontSize={72}
            outlineWidth={10}
          >
            {d.label}
          </SpriteLabel>
        )
      })}

      {/* vòng tròn nền mờ trên mặt đất */}
      <mesh position={[0, y - 0.04, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[radius - 0.12, radius + 0.02, 64]} />
        <meshStandardMaterial color="#1473e6" transparent opacity={0.35} />
      </mesh>
    </group>
  )
}
