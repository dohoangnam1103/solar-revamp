import { PANEL } from './config.js'

// Bố trí N tấm thành 1 KHỐI chuỗi (cho demo2), tự chọn số cột để khối cân đối,
// hoặc ép số cột theo `cols`. orientation: 'portrait' (dọc) | 'landscape' (ngang).
// panel: { width, height, gap } — mặc định lấy từ PANEL.
// Trả về vị trí cục bộ [x, y] của từng tấm, tâm khối tại gốc.
export function layoutBlock(n, orientation = 'portrait', panel = PANEL, cols = null) {
  const pw = orientation === 'portrait' ? panel.width : panel.height
  const ph = orientation === 'portrait' ? panel.height : panel.width
  const stepX = pw + panel.gap
  const stepY = ph + panel.gap

  // mặc định: cả chuỗi nằm trên 1 HÀNG thẳng (không tự bẻ xuống hàng).
  // truyền `cols` nếu muốn ép số cột cụ thể.
  const nCols = cols && cols > 0 ? Math.min(cols, n) : n
  const nRows = Math.ceil(n / nCols)
  const gridH = nRows * stepY - panel.gap

  const positions = []
  let remaining = n
  for (let r = 0; r < nRows; r++) {
    const inRow = Math.min(nCols, remaining)
    const rowW = inRow * stepX - panel.gap
    for (let c = 0; c < inRow; c++) {
      const x = -rowW / 2 + stepX / 2 + c * stepX
      const y = -gridH / 2 + stepY / 2 + r * stepY
      positions.push([x, y])
    }
    remaining -= inRow
  }
  return { positions, panelW: pw, panelH: ph, nCols, nRows }
}
