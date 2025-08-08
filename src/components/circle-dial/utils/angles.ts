// Angle utilities and conversions

export function wrap360(angle: number): number {
  const a = angle % 360;
  return a < 0 ? a + 360 : a;
}

export function angularDistance(a: number, b: number): number {
  const diff = Math.abs(wrap360(a) - wrap360(b));
  return diff > 180 ? 360 - diff : diff;
}

export function normalizeAngle180(a: number): number {
  const w = wrap360(a);
  return w > 180 ? w - 180 : w;
}

export function normalizeSigned180(a: number): number {
  const w = (((a + 180) % 360) + 360) % 360;
  return w - 180;
}

// External signed [-90,90] ↔ internal [0,180]
export function toInternalFromSigned(signed: number): number {
  return normalizeAngle180(signed + 90);
}

export function toSignedFromInternal(internal: number): number {
  return normalizeSigned180(internal - 90);
}

export function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}
