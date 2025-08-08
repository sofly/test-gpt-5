export function polarToCartesian(
  cx: number,
  cy: number,
  r: number,
  angleDeg: number
) {
  const rad = (angleDeg * Math.PI) / 180;
  return {
    x: cx + r * Math.cos(rad),
    y: cy + r * Math.sin(rad),
  };
}

// Orthographic meridian band path between two longitudes (degrees)
export function meridianBandPath(
  cx: number,
  cy: number,
  r: number,
  lambdaStartDeg: number,
  lambdaEndDeg: number,
  samples = 72
) {
  const toRad = (d: number) => (d * Math.PI) / 180;
  const lam1 = toRad(lambdaStartDeg);
  const lam2 = toRad(lambdaEndDeg);
  const pts: { x: number; y: number }[] = [];
  for (let i = 0; i <= samples; i += 1) {
    const t = i / samples;
    const phi = -Math.PI / 2 + t * Math.PI;
    const x = cx + r * Math.sin(lam2) * Math.cos(phi);
    const y = cy + r * Math.sin(phi);
    pts.push({ x, y });
  }
  for (let i = samples; i >= 0; i -= 1) {
    const t = i / samples;
    const phi = -Math.PI / 2 + t * Math.PI;
    const x = cx + r * Math.sin(lam1) * Math.cos(phi);
    const y = cy + r * Math.sin(phi);
    pts.push({ x, y });
  }
  const [p0, ...rest] = pts;
  return `M ${p0.x} ${p0.y} ${rest.map((p) => `L ${p.x} ${p.y}`).join(" ")} Z`;
}

// Single meridian curve path (degrees)
export function meridianCurvePath(
  cx: number,
  cy: number,
  r: number,
  lambdaDeg: number,
  samples = 72
) {
  const lam = (lambdaDeg * Math.PI) / 180;
  const pts: { x: number; y: number }[] = [];
  for (let i = 0; i <= samples; i += 1) {
    const t = i / samples;
    const phi = -Math.PI / 2 + t * Math.PI;
    const x = cx + r * Math.sin(lam) * Math.cos(phi);
    const y = cy + r * Math.sin(phi);
    pts.push({ x, y });
  }
  const [p0, ...rest] = pts;
  return `M ${p0.x} ${p0.y} ${rest.map((p) => `L ${p.x} ${p.y}`).join(" ")}`;
}
