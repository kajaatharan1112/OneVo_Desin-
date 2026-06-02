import { useLayoutEffect, useRef, useState } from 'react';

export function usePanelChartHeight(fallback = 96) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState(fallback);

  useLayoutEffect(() => {
    const element = containerRef.current;
    if (!element) return;

    const measure = () => {
      const next = Math.floor(element.getBoundingClientRect().height);
      setHeight(next > 0 ? Math.max(fallback, next) : fallback);
    };

    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(element);
    return () => observer.disconnect();
  }, [fallback]);

  return { containerRef, height };
}
