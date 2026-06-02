export function normalizeCompassHeading(e, options = {}) {
  let heading = null

  if (typeof e.webkitCompassHeading === 'number') {
    heading = e.webkitCompassHeading + (options.screenAngle || 0)
  } else if (typeof e.alpha === 'number') {
    heading = 360 - e.alpha
  }

  if (heading == null || Number.isNaN(heading)) return null
  return (heading + 360) % 360
}

export function getScreenOrientationAngle(win = window) {
  if (typeof win?.screen?.orientation?.angle === 'number') {
    return win.screen.orientation.angle
  }
  if (typeof win?.orientation === 'number') {
    return win.orientation
  }
  return 0
}
