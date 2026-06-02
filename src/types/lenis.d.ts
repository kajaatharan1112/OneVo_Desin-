declare module 'lenis' {
  export default class Lenis {
    constructor(options?: {
      duration?: number;
      easing?: (t: number) => number;
      orientation?: 'vertical' | 'horizontal';
      gestureOrientation?: 'vertical' | 'horizontal' | 'both';
      smoothWheel?: boolean;
      wheelMultiplier?: number;
      touchMultiplier?: number;
      infinite?: boolean;
    });

    raf(time: number): void;
    on(event: string, callback: Function): void;
    destroy(): void;
    scrollTo(target: string | number | HTMLElement, options?: any): void;
    start(): void;
    stop(): void;
  }
}
