import { memo } from "react";
import { motion } from "motion/react";
import { polarToCartesian } from "./utils/geometry";

export type SlicePath = {
  d: string;
  centerAngle: number;
  lambdaStart: number;
  lambdaEnd: number;
};

type Props = {
  cx: number;
  cy: number;
  R: number;
  ringInner: number;
  prefersReduced: boolean;
  colorActive: string;
  baseFill: string;
  baseStroke: string;
  slices: SlicePath[];
  activeSet: Set<number>;
};

function CircleSlicesImpl(props: Props) {
  const {
    cx,
    cy,
    R,
    ringInner,
    prefersReduced,
    colorActive,
    baseFill,
    baseStroke,
    slices,
    activeSet,
  } = props;
  return (
    <g>
      {slices.map((p, i) => {
        const isActive = activeSet.has(i);
        const centroidAngle = p.centerAngle;
        const centroidRadius = (R + ringInner) / 2;
        const c = polarToCartesian(cx, cy, centroidRadius, centroidAngle);
        return (
          <motion.g
            key={`slice-${slices.length}-${i}`}
            layout
            layoutId={`slice-${i}`}
            initial={false}
            animate={{
              scale: prefersReduced ? 1 : isActive ? 1 : 1,
              filter: isActive
                ? "drop-shadow(0 0 10px rgba(10,132,255,0.4))"
                : "drop-shadow(0 0 0 rgba(0,0,0,0))",
            }}
            transition={
              prefersReduced
                ? { duration: 0 }
                : {
                    scale: { type: "spring", stiffness: 200, damping: 18 },
                    filter: { duration: 0.2 },
                  }
            }
            style={{ transformOrigin: `${c.x}px ${c.y}px` }}
          >
            <motion.path
              d={p.d}
              initial={false}
              animate={{
                fill: isActive ? colorActive : baseFill,
                opacity: isActive ? 1 : 0.5,
              }}
              stroke={baseStroke}
              strokeWidth={2}
              transition={{
                duration: prefersReduced ? 0 : 0.2,
                ease: "easeInOut",
              }}
            />
          </motion.g>
        );
      })}
    </g>
  );
}

export const CircleSlices = memo(CircleSlicesImpl);
export default CircleSlices;
