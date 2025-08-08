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
  // Fold any angle into the [0, 180] range by mirroring values above 180
  // around the 180° axis. Previously this subtracted 180 which produced
  // incorrect results (e.g. 200° -> 20°). The correct mirror is 360 - w
  // so 200° becomes 160° and 181° becomes 179°.
  return w > 180 ? 360 - w : w;
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
