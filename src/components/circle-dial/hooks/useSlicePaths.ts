import { useMemo } from "react";
import { meridianBandPath } from "../utils/geometry";

export type ComputedSlice = {
  d: string;
  centerAngle: number;
  lambdaStart: number;
  lambdaEnd: number;
};

export function useSlicePaths(
  slices: number,
  R: number,
  cx: number,
  cy: number
) {
  const deltaTheta = 180 / slices;
  const deltaLambda = 180 / slices;
  const paths = useMemo<ComputedSlice[]>(() => {
    const list: ComputedSlice[] = [];
    for (let i = 0; i < slices; i += 1) {
      const lambdaStart = -90 + i * deltaLambda;
      const lambdaEnd = lambdaStart + deltaLambda;
      const thetaCenter = i * deltaTheta + deltaTheta / 2;
      const d = meridianBandPath(cx, cy, R, lambdaStart, lambdaEnd, 72);
      list.push({ d, centerAngle: thetaCenter, lambdaStart, lambdaEnd });
    }
    return list;
  }, [slices, R, cx, cy, deltaLambda, deltaTheta]);

  return { paths, deltaTheta };
}
