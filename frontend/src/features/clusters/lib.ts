export function generateClusterColor(clusterId: number) {
  if (clusterId === -1) {
    return "hsl(0, 0%, 30%)"
  }

  const hue = (clusterId * 137.508) % 360
  return `hsl(${hue}, 70%, 60%)`
}
