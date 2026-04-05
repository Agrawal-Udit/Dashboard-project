import { describe, it, expect } from "vitest";
import type { MotionSurface } from "../motionConfig";
import { getSurfaceMotion } from "../motionConfig";

const surfaces: MotionSurface[] = ["route", "card", "modal", "chart"];

const hasMovement = (state: Record<string, number> | undefined) => {
  if (!state) return false;
  const keys = ["x", "y", "scale", "translateX", "translateY"];
  return keys.some((key) => key in state && state[key] !== 0);
};

describe("motionConfig", () => {
  it("returns zero-duration transitions for all surfaces when reduced motion is enabled", () => {
    for (const surface of surfaces) {
      const preset = getSurfaceMotion(surface, true);
      expect(preset.transition.duration).toBe(0);
    }
  });

  it("does not use translate/scale movement in reduced motion mode", () => {
    for (const surface of surfaces) {
      const preset = getSurfaceMotion(surface, true);
      expect(hasMovement(preset.initial)).toBe(false);
      expect(hasMovement(preset.animate)).toBe(false);
      expect(hasMovement(preset.exit)).toBe(false);
    }
  });

  it("keeps non-zero modal animation duration in normal mode", () => {
    const modalPreset = getSurfaceMotion("modal", false);

    expect(modalPreset.transition.duration).toBeGreaterThan(0);
    expect(modalPreset.initial).not.toEqual(modalPreset.animate);
  });

  it("provides route exit config in normal mode for page transitions", () => {
    const routePreset = getSurfaceMotion("route", false);

    expect(routePreset.exit).toBeDefined();
  });
});
