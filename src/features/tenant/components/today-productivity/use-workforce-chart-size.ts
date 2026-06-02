import { useLayoutEffect, useRef, useState } from 'react';

const MIN = 135;
const MAX = 198;
const SCALE = 1.06;

/** Fit square chart inside workforce panel without clipping. */
export function useWorkforceChartSize() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState(162);

  useLayoutEffect(() => {
    const element = containerRef.current;
    if (!element) return;

    const measure = () => {
      const { width, height } = element.getBoundingClientRect();
      const side = Math.floor(Math.min(width, height));
      if (side <= 0) return;
      setSize(Math.min(MAX, Math.max(MIN, Math.floor(side * SCALE))));
    };

    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  return { containerRef, size };
}
