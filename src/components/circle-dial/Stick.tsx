import { memo, useMemo } from "react";
import { motion } from "motion/react";
import { meridianCurvePath } from "./utils/geometry";

type Props = {
  cx: number;
  cy: number;
  R: number;
  signedAngle: number; // [-90, 90]
  strokeWidth: number;
  color: string;
  opacity?: number;
  transition?: { [key: string]: unknown };
};

function StickImpl({
  cx,
  cy,
  R,
  signedAngle,
  strokeWidth,
  color,
  opacity = 0.8,
  transition,
}: Props) {
  const d = useMemo(
    () => meridianCurvePath(cx, cy, R, signedAngle, 96),
    [cx, cy, R, signedAngle]
  );
  return (
    <motion.path
      d={d}
      stroke={color}
      strokeOpacity={opacity}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      fill="none"
      initial={false}
      animate={{ pathLength: 1 }}
      transition={transition}
    />
  );
}

export const Stick = memo(StickImpl);
export default Stick;
