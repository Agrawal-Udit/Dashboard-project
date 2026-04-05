import { motion, useReducedMotion } from "motion/react";
import { FileQuestion, TrendingUp } from "lucide-react";

interface EmptyStateProps {
  message: string;
  icon?: "chart" | "list";
}

export function EmptyState({ message, icon = "chart" }: EmptyStateProps) {
  const Icon = icon === "chart" ? TrendingUp : FileQuestion;
  const shouldReduceMotion = useReducedMotion() ?? false;

  return (
    <motion.div
      className="flex h-75 flex-col items-center justify-center gap-4"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
    >
      <motion.div
        className="rounded-2xl border border-white/18 bg-white/12 p-4"
        animate={shouldReduceMotion ? undefined : { y: [0, -5, 0] }}
        transition={
          shouldReduceMotion
            ? undefined
            : { repeat: Infinity, duration: 2, ease: "easeInOut" }
        }
      >
        <Icon className="h-8 w-8 text-zinc-200" />
      </motion.div>
      <div className="text-center">
        <p className="text-sm font-medium text-zinc-200">
          {message}
        </p>
        <p className="mt-1 text-xs text-zinc-300">
          Add some transactions to see data here
        </p>
      </div>
    </motion.div>
  );
}
