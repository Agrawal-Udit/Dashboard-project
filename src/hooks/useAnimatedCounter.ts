import { useEffect, useState } from "react";
import { useReducedMotion } from "motion/react";

interface UseAnimatedCounterOptions {
  duration?: number;
  decimals?: number;
  prefix?: string;
  suffix?: string;
  locale?: string;
  formatValue?: (value: number) => string;
}

export function useAnimatedCounter(
  targetValue: number,
  options: UseAnimatedCounterOptions = {},
) {
  const {
    duration = 1500,
    decimals = 2,
    prefix = "",
    suffix = "",
    locale = "en-US",
    formatValue,
  } = options;
  const shouldReduceMotion = useReducedMotion();
  const [displayValue, setDisplayValue] = useState(targetValue);

  useEffect(() => {
    if (shouldReduceMotion) {
      setDisplayValue(targetValue);
      return;
    }

    const startTime = performance.now();
    const startValue = displayValue;
    const difference = targetValue - startValue;

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Ease out cubic for smooth deceleration
      const easeOut = 1 - Math.pow(1 - progress, 3);

      const currentValue = startValue + difference * easeOut;
      setDisplayValue(currentValue);

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [targetValue, duration, shouldReduceMotion]);

  if (formatValue) {
    return formatValue(displayValue);
  }

  const formatted = new Intl.NumberFormat(locale, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(displayValue);

  return `${prefix}${formatted}${suffix}`;
}

const inrCurrencyFormatter = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

export function useAnimatedCurrency(value: number, duration = 1500) {
  return useAnimatedCounter(value, {
    duration,
    formatValue: (amount) => inrCurrencyFormatter.format(amount),
  });
}
