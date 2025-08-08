import { useEffect } from "react";
import { clamp } from "../utils/angles";

export function useAngleHotkeys(
  getSignedAngle: () => number,
  setSignedAngle: (next: number) => void
) {
  useEffect(() => {
    const handleKey = (ev: KeyboardEvent) => {
      let step = 0;
      if (ev.key === "ArrowLeft") step = -1;
      if (ev.key === "ArrowRight") step = 1;
      if (ev.key === "ArrowUp") step = -10;
      if (ev.key === "ArrowDown") step = 10;
      if (ev.key === "Home") {
        setSignedAngle(-90);
        ev.preventDefault();
        return;
      }
      if (ev.key === "End") {
        setSignedAngle(90);
        ev.preventDefault();
        return;
      }
      if (step !== 0) {
        const next = clamp(getSignedAngle() + step, -90, 90);
        setSignedAngle(next);
        ev.preventDefault();
      }
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [getSignedAngle, setSignedAngle]);
}

export default useAngleHotkeys;
