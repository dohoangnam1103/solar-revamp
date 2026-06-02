// Thông số kỹ thuật dùng cho mô phỏng Demo2.
// Đơn vị: mét (m) cho kích thước.

// Thông số 1 tấm pin mặt trời điển hình.
export const PANEL = {
  width: 1.13, // bề ngang tấm pin
  height: 2.28, // chiều dài tấm pin
  thickness: 0.04,
  gap: 0.02, // khe hở 2cm giữa các tấm trong cùng string
}

// Kích thước mẫu nhà chung chung (footprint).
export const HOUSE = {
  width: 9, // chiều ngang nhà (trục X)
  depth: 11, // chiều sâu nhà (trục Z)
  lMainWidth: 9, // chiều rộng khối mái chính chữ L
  lMainDepth: 6, // chiều dài khối mái chính chữ L
  lWingWidth: 4.5, // chiều rộng khối mái nhánh chữ L
  lWingDepth: 5, // chiều dài khối mái nhánh chữ L
  wallHeight: 6, // chiều cao tường (2 tầng)
  roofHeight: 2.4, // chiều cao phần mái dốc
}

// Các loại mái hỗ trợ: chỉ mô tả hình dạng/vật liệu mái.
export const ROOF_TYPES = {
  ton: {
    label: 'Mái tôn',
    color: '#9aa6b2',
    metalness: 0.55,
    roughness: 0.45,
    shape: 'mono', // mái dốc 1 phía (lệch), từ sau ra trước nhà
    texture: 'metal',
  },
  ngoi: {
    label: 'Mái ngói',
    color: '#9e4a3c',
    metalness: 0.05,
    roughness: 0.85,
    shape: 'gable',
    texture: 'tile',
  },
  nhat: {
    label: 'Mái Nhật',
    color: '#6c7a6a',
    metalness: 0.1,
    roughness: 0.8,
    shape: 'hip', // mái dốc 4 phía
    texture: 'tile',
  },
  bang: {
    label: 'Mái bằng',
    color: '#d9d4c5',
    metalness: 0.1,
    roughness: 0.9,
    shape: 'flat',
    texture: null,
  },
  chuL: {
    label: 'Mái chữ L',
    color: '#9e4a3c',
    metalness: 0.05,
    roughness: 0.85,
    shape: 'l',
    texture: 'tile',
  },
  chuLNguoc: {
    label: 'Mái chữ L ngược',
    color: '#9e4a3c',
    metalness: 0.05,
    roughness: 0.85,
    shape: 'l-mirror',
    texture: 'tile',
  },
  chuT: {
    label: 'Mái chữ T',
    color: '#9e4a3c',
    metalness: 0.05,
    roughness: 0.85,
    shape: 't',
    texture: 'tile',
  },
}

// Cách lắp pin trên loại mái đã chọn.
export const MOUNT_TYPES = {
  flush: {
    label: 'Áp mái',
    hasFrame: false,
  },
  frame: {
    label: 'Có khung sắt',
    hasFrame: true,
  },
}

export const FRAME_HEIGHT = {
  min: 0.2,
  max: 5,
  step: 0.1,
  default: 0.5,
}

export const FRAME_TILT_DIRECTIONS = {
  roof: { label: 'Theo mái' },
  north: { label: 'Bắc' },
  south: { label: 'Nam' },
  east: { label: 'Đông' },
  west: { label: 'Tây' },
}

export const FRAME_TILT_DIRECTION_SLIDER = {
  min: 0,
  max: 3,
  step: 1,
  default: 2,
  directions: ['east', 'west', 'south', 'north'],
}

export const TILT_ANGLE = 10 // độ nghiêng cố định của khung sắt (độ)
