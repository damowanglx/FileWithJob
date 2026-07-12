import { useEffect, useRef, useCallback } from 'react';

interface PerformanceMetrics {
  renderCount: number;
  lastRenderTime: number;
  averageRenderTime: number;
  maxRenderTime: number;
}

export function usePerformanceMonitor(componentName: string) {
  const renderCount = useRef(0);
  const renderTimes = useRef<number[]>([]);
  const lastRenderStart = useRef<number>(0);

  useEffect(() => {
    lastRenderStart.current = performance.now();
    renderCount.current += 1;

    return () => {
      const renderTime = performance.now() - lastRenderStart.current;
      renderTimes.current.push(renderTime);

      // Keep only last 100 render times
      if (renderTimes.current.length > 100) {
        renderTimes.current.shift();
      }

      // Log slow renders (> 16ms)
      if (renderTime > 16) {
        console.warn(
          `[Performance] ${componentName} slow render: ${renderTime.toFixed(2)}ms`
        );
      }
    };
  });

  const getMetrics = useCallback((): PerformanceMetrics => {
    const times = renderTimes.current;
    const sum = times.reduce((a, b) => a + b, 0);

    return {
      renderCount: renderCount.current,
      lastRenderTime: times[times.length - 1] || 0,
      averageRenderTime: times.length > 0 ? sum / times.length : 0,
      maxRenderTime: times.length > 0 ? Math.max(...times) : 0,
    };
  }, []);

  return { getMetrics };
}

export function useRenderCount(componentName: string) {
  const count = useRef(0);

  useEffect(() => {
    count.current += 1;
    console.log(`[Render] ${componentName} rendered ${count.current} times`);
  });

  return count.current;
}