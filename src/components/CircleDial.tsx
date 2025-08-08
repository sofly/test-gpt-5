import { useCallback, useEffect, useRef, useState } from "react";
import { motion, useReducedMotion } from "motion/react";

import {
  normalizeAngle180,
  normalizeSigned180,
  toInternalFromSigned,
  toSignedFromInternal,
} from "./circle-dial/utils/angles";
import CircleSlices from "./circle-dial/CircleSlices";
import {
  SYSTEM_COLORS,
  BASE_FILL_LIGHT,
  BASE_STROKE_LIGHT,
} from "./circle-dial/constants";
import { useRafThrottle } from "./circle-dial/hooks/useRafThrottle";
import { useSlicePaths } from "./circle-dial/hooks/useSlicePaths";
import { useActiveSet } from "./circle-dial/hooks/useActiveSet";
import { useAngleHotkeys } from "./circle-dial/hooks/useAngleHotkeys";
import Stick from "./circle-dial/Stick";

type CircleDialValue = {
  slices: number;
  angle: number;
};

type CircleDialProps = {
  value?: CircleDialValue;
  onChange?: (value: CircleDialValue) => void;
  minSlices?: number;
  maxSlices?: number;
  initialAngle?: number;
  autoPlay?: boolean;
  onSliceActivate?: (index: number) => void;
  onSliceDeactivate?: (index: number) => void;
};

export function CircleDial(props: CircleDialProps) {
  const {
    value,
    onChange,
    minSlices = 2,
    maxSlices = 72,
    initialAngle = 0,
    autoPlay = false,
    onSliceActivate,
    onSliceDeactivate,
  } = props;

  // Controlled/uncontrolled state
  const [internal, setInternal] = useState<CircleDialValue>({
    slices: Math.min(Math.max(12, minSlices), maxSlices),
    angle: toInternalFromSigned(normalizeSigned180(initialAngle)),
  });
  const state = value ?? internal;
  const setState = useCallback(
    (next: CircleDialValue) => {
      if (onChange) onChange(next);
      else setInternal(next);
    },
    [onChange]
  );

  const prefersReduced = !!useReducedMotion();

  // Responsive radius based on container size via viewBox mapping
  const size = 1000; // fixed viewBox; scales with container
  const cx = size / 2;
  const cy = size / 2;
  const R = Math.min(cx, cy) * 0.9; // leave padding
  const ringInner = R * 0.64; // ring thickness ~ 26%

  // Geometry from hook (needs R, cx, cy)
  const { paths: slicePaths, deltaTheta } = useSlicePaths(
    state.slices,
    R,
    cx,
    cy
  );
  const gap = 2; // degrees

  // slice paths provided by hook

  const { activeSet, activeSetRef, computeActiveSet, setActiveSet } =
    useActiveSet(state.slices, deltaTheta, gap, state.angle);

  // Announce active slice (first one; indices human-readable)
  const liveRegionRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    const newActive = computeActiveSet(state.angle);
    const prev = activeSetRef.current;
    // fire enter/leave callbacks
    const entered = [...newActive].filter((i) => !prev.has(i));
    const exited = [...prev].filter((i) => !newActive.has(i));
    if (entered.length && onSliceActivate) entered.forEach(onSliceActivate);
    if (exited.length && onSliceDeactivate) exited.forEach(onSliceDeactivate);
    setActiveSet(newActive);
    activeSetRef.current = newActive;

    const first = [...newActive][0];
    if (liveRegionRef.current) {
      if (first != null) {
        liveRegionRef.current.textContent = `Active slice: ${first + 1} of ${
          state.slices
        }`;
      } else {
        liveRegionRef.current.textContent = "";
      }
    }
  }, [
    computeActiveSet,
    onSliceActivate,
    onSliceDeactivate,
    state.angle,
    state.slices,
    setActiveSet,
    activeSetRef,
  ]);

  // Auto play 0→180→0 loop
  const stateRef = useRef(state);
  useEffect(() => {
    stateRef.current = state;
  }, [state]);
  useEffect(() => {
    if (!autoPlay) return;
    let raf: number | null = null;
    let direction = 1; // 1: up to 180, -1: down to 0
    const step = () => {
      const cur = value ?? stateRef.current;
      const nextAngle = cur.angle + direction * 0.5 * (prefersReduced ? 0 : 1);
      let a = nextAngle;
      if (a >= 180) {
        a = 180;
        direction = -1;
      }
      if (a <= 0) {
        a = 0;
        direction = 1;
      }
      setState({ ...cur, angle: a });
      raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => {
      if (raf) cancelAnimationFrame(raf);
    };
  }, [autoPlay, prefersReduced, setState, value]);

  const onSlicesChange = useCallback(
    (n: number) => {
      const clamped = Math.max(minSlices, Math.min(maxSlices, Math.round(n)));
      setState({ slices: clamped, angle: normalizeAngle180(state.angle) });
    },
    [maxSlices, minSlices, setState, state.angle]
  );

  const onAngleChange = useCallback(
    (signed: number) => {
      setState({ slices: state.slices, angle: toInternalFromSigned(signed) });
    },
    [setState, state.slices]
  );

  const onAngleChangeThrottled = useRafThrottle((a: number) =>
    onAngleChange(a)
  );

  // Hotkeys (document-level)
  useAngleHotkeys(
    () => toSignedFromInternal(state.angle),
    (next) => onAngleChangeThrottled(next)
  );

  // Drag on the ring to set angle
  const svgRef = useRef<SVGSVGElement | null>(null);

  const stickStrokeWidth = Math.max(2, R * 0.01);

  // Animation configs
  const stickTransition = prefersReduced
    ? ({ duration: 0 } as const)
    : ({ type: "spring", stiffness: 180, damping: 22 } as const);

  const colorActive = SYSTEM_COLORS.systemBlue;

  return (
    <div className="circle-dial-root" style={{ width: "min(60vmin, 640px)" }}>
      <div className="controls" role="group" aria-label="Dial controls">
        <label className="slider-label">
          <span>Slices (n): </span>
          <input
            type="range"
            min={minSlices}
            max={maxSlices}
            step={1}
            value={state.slices}
            aria-label="Number of slices"
            onChange={(e) => onSlicesChange(parseInt(e.target.value, 10))}
          />
          <span className="slider-value">{state.slices}</span>
        </label>
        <label className="slider-label">
          <span>Angle (θ): </span>
          <input
            type="range"
            min={-90}
            max={90}
            step={1}
            value={Math.round(toSignedFromInternal(state.angle))}
            aria-label="Angle"
            onChange={(e) =>
              onAngleChangeThrottled(parseInt(e.target.value, 10))
            }
          />
          <span className="slider-value">
            {Math.round(toSignedFromInternal(state.angle))}°
          </span>
        </label>
      </div>

      <div
        aria-live="polite"
        aria-atomic="true"
        ref={liveRegionRef}
        className="sr-only"
      />

      <motion.svg
        ref={svgRef}
        viewBox={`0 0 ${size} ${size}`}
        className="dial-svg"
        role="group"
        aria-label="Interactive circle dial"
      >
        {/* Outer ring background */}
        <circle
          cx={cx}
          cy={cy}
          r={R}
          fill={BASE_FILL_LIGHT}
          stroke={BASE_STROKE_LIGHT}
          strokeWidth={2}
        />

        <CircleSlices
          cx={cx}
          cy={cy}
          R={R}
          ringInner={ringInner}
          prefersReduced={prefersReduced}
          colorActive={colorActive}
          baseFill={BASE_FILL_LIGHT}
          baseStroke={BASE_STROKE_LIGHT}
          slices={slicePaths}
          activeSet={activeSet}
        />

        {/* Curved stick: single meridian defined by signed angle in [-180,180] */}
        <Stick
          cx={cx}
          cy={cy}
          R={R}
          signedAngle={toSignedFromInternal(state.angle)}
          strokeWidth={stickStrokeWidth}
          color={SYSTEM_COLORS.systemGreen}
          opacity={0.8}
          transition={stickTransition}
        />

        {/* Center dot to visually anchor */}
        <circle
          cx={cx}
          cy={cy}
          r={Math.max(2, R * 0.01)}
          fill={BASE_STROKE_LIGHT}
        />
      </motion.svg>

      <div className="hint" aria-hidden="true">
        Drag the ring or use sliders. Hover color: {SYSTEM_COLORS.systemOrange}
      </div>
    </div>
  );
}

export default CircleDial;
