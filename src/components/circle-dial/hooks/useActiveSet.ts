import { useCallback, useEffect, useRef, useState } from "react";
import { angularDistance, normalizeAngle180 } from "../utils/angles";

export function useActiveSet(
  slices: number,
  deltaTheta: number,
  gap: number,
  angle: number
) {
  const compute = useCallback(
    (angleDeg: number) => {
      const norm = normalizeAngle180(angleDeg);
      const active = new Set<number>();
      let bestIndex = 0;
      let bestDist = Number.POSITIVE_INFINITY;
      for (let i = 0; i < slices; i += 1) {
        const c = i * deltaTheta + deltaTheta / 2;
        const dist1 = angularDistance(norm, c);
        const dist2 = angularDistance(norm + 180, c);
        const minDist = Math.min(dist1, dist2);
        if (minDist <= deltaTheta / 2 - gap) active.add(i);
        if (dist1 < bestDist) {
          bestDist = dist1;
          bestIndex = i;
        }
      }
      if (active.size === 0) active.add(bestIndex);
      return active;
    },
    [deltaTheta, gap, slices]
  );

  const [activeSet, setActiveSet] = useState<Set<number>>(() => compute(angle));
  const ref = useRef(activeSet);
  useEffect(() => {
    ref.current = activeSet;
  }, [activeSet]);
  useEffect(() => {
    setActiveSet(compute(angle));
  }, [angle, compute]);

  return {
    activeSet,
    setActiveSet,
    activeSetRef: ref,
    computeActiveSet: compute,
  };
}
