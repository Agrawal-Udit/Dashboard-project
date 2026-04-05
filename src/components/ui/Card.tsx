import { motion, useReducedMotion } from "motion/react";
import type { HTMLMotionProps } from "motion/react";
import { getSurfaceMotion } from "../../utils/motionConfig";

interface CardProps extends Omit<HTMLMotionProps<"div">, "children"> {
  children: React.ReactNode;
  hoverEffect?: boolean;
  variant?: "default" | "glass" | "gradient";
}

export function Card({
  children,
  className = "",
  hoverEffect = false,
  variant = "default",
  ...props
}: CardProps) {
  const shouldReduceMotion = useReducedMotion() ?? false;
  const cardMotion = getSurfaceMotion("card", shouldReduceMotion);

  const variantClasses: Record<NonNullable<CardProps["variant"]>, string> = {
    default:
      "rounded-lg border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-950",
    glass:
      "rounded-xl border border-zinc-200/70 bg-white/70 p-5 backdrop-blur-lg dark:border-zinc-700/60 dark:bg-zinc-900/60",
    gradient: "finrise-accent-card rounded-xl p-5",
  };

  const hoverClass = hoverEffect
    ? "transition-colors hover:border-zinc-300 dark:hover:border-zinc-700"
    : "";

  return (
    <motion.div
      className={`${variantClasses[variant]} ${hoverClass} ${className}`}
      initial={cardMotion.initial}
      animate={cardMotion.animate}
      transition={cardMotion.transition}
      {...props}
    >
      {children}
    </motion.div>
  );
}
