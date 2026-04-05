import type { Transition, Variants } from "motion/react";

export type MotionSurface =
  | "route"
  | "card"
  | "modal"
  | "chart"
  | "kpi"
  | "row"
  | "sidebar"
  | "button";

interface MotionPreset {
  initial: Record<string, number>;
  animate: Record<string, number>;
  exit?: Record<string, number>;
  transition: Transition;
  whileHover?: Record<string, number | string>;
  whileTap?: Record<string, number>;
}

function reducedMotionPreset(withExit: boolean): MotionPreset {
  return {
    initial: { opacity: 1 },
    animate: { opacity: 1 },
    ...(withExit ? { exit: { opacity: 1 } } : {}),
    transition: {
      duration: 0,
      ease: "linear",
    },
  };
}

export function getSurfaceMotion(
  surface: MotionSurface,
  reduced: boolean,
): MotionPreset {
  if (reduced) {
    return reducedMotionPreset(surface === "route" || surface === "modal");
  }

  switch (surface) {
    case "route":
      return {
        initial: { opacity: 0, y: 12, scale: 0.98 },
        animate: { opacity: 1, y: 0, scale: 1 },
        exit: { opacity: 0, y: -8, scale: 0.98 },
        transition: {
          duration: 0.3,
          ease: [0.25, 0.46, 0.45, 0.94],
        },
      };

    case "card":
      return {
        initial: { opacity: 0, y: 20, scale: 0.95 },
        animate: { opacity: 1, y: 0, scale: 1 },
        transition: {
          duration: 0.4,
          ease: [0.25, 0.46, 0.45, 0.94],
        },
        whileHover: { y: -4, scale: 1.02 },
      };

    case "kpi":
      return {
        initial: { opacity: 0, y: 30, scale: 0.9 },
        animate: { opacity: 1, y: 0, scale: 1 },
        transition: {
          duration: 0.5,
          ease: [0.25, 0.46, 0.45, 0.94],
        },
        whileHover: { y: -6, scale: 1.03 },
      };

    case "modal":
      return {
        initial: { opacity: 0, y: 20, scale: 0.9 },
        animate: { opacity: 1, y: 0, scale: 1 },
        exit: { opacity: 0, y: 10, scale: 0.95 },
        transition: {
          duration: 0.25,
          ease: [0.25, 0.46, 0.45, 0.94],
        },
      };

    case "chart":
      return {
        initial: { opacity: 0, y: 20, scale: 0.95 },
        animate: { opacity: 1, y: 0, scale: 1 },
        transition: {
          duration: 0.5,
          ease: [0.25, 0.46, 0.45, 0.94],
        },
      };

    case "row":
      return {
        initial: { opacity: 0, x: -20 },
        animate: { opacity: 1, x: 0 },
        exit: { opacity: 0, x: 20 },
        transition: {
          duration: 0.3,
          ease: "easeOut",
        },
      };

    case "sidebar":
      return {
        initial: { opacity: 0, x: -10 },
        animate: { opacity: 1, x: 0 },
        transition: {
          duration: 0.2,
          ease: "easeOut",
        },
        whileHover: { x: 4 },
      };

    case "button":
      return {
        initial: { opacity: 1, scale: 1 },
        animate: { opacity: 1, scale: 1 },
        transition: {
          duration: 0.15,
          ease: "easeOut",
        },
        whileHover: { scale: 1.05 },
        whileTap: { scale: 0.95 },
      };
  }
}

export const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1,
    },
  },
};

export const staggerItem: Variants = {
  hidden: { opacity: 0, y: 20, scale: 0.95 },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.4,
      ease: [0.25, 0.46, 0.45, 0.94],
    },
  },
};

export const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: [0.25, 0.46, 0.45, 0.94],
    },
  },
};

export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.4,
      ease: [0.25, 0.46, 0.45, 0.94],
    },
  },
};

export const slideInLeft: Variants = {
  hidden: { opacity: 0, x: -50 },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.5,
      ease: [0.25, 0.46, 0.45, 0.94],
    },
  },
};

export const pulseGlow = {
  animate: {
    boxShadow: [
      "0 0 20px rgba(99, 102, 241, 0.3)",
      "0 0 40px rgba(99, 102, 241, 0.5)",
      "0 0 20px rgba(99, 102, 241, 0.3)",
    ],
  },
  transition: {
    duration: 2,
    repeat: Infinity,
    ease: "easeInOut",
  },
};
