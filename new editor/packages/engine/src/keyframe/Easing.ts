import type { EasingParams, EasingType } from '@opencode/shared';

export function evaluateEasing(t: number, easing: EasingParams): number {
  const tt = Math.max(0, Math.min(1, t));

  switch (easing.type) {
    case 'linear':
      return tt;
    case 'easeIn':
      return easeInQuad(tt);
    case 'easeOut':
      return easeOutQuad(tt);
    case 'easeInOut':
      return easeInOutQuad(tt);
    case 'bezier':
      if (easing.bezier) {
        return cubicBezier(tt, easing.bezier);
      }
      return tt;
    default:
      return tt;
  }
}

export function getEasingFunction(type: EasingType): (t: number) => number {
  switch (type) {
    case 'linear': return (t) => t;
    case 'easeIn': return easeInQuad;
    case 'easeOut': return easeOutQuad;
    case 'easeInOut': return easeInOutQuad;
    case 'bezier': return (t) => t;
  }
}

export function easeInQuad(t: number): number {
  return t * t;
}

export function easeOutQuad(t: number): number {
  return t * (2 - t);
}

export function easeInOutQuad(t: number): number {
  return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
}

export function easeInCubic(t: number): number {
  return t * t * t;
}

export function easeOutCubic(t: number): number {
  return (--t) * t * t + 1;
}

export function easeInOutCubic(t: number): number {
  return t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1;
}

export function easeInElastic(t: number): number {
  if (t === 0 || t === 1) return t;
  return -Math.pow(2, 10 * (t - 1)) * Math.sin((t - 1.1) * 5 * Math.PI);
}

export function easeOutElastic(t: number): number {
  if (t === 0 || t === 1) return t;
  return Math.pow(2, -10 * t) * Math.sin((t - 0.1) * 5 * Math.PI) + 1;
}

export function easeInBounce(t: number): number {
  return 1 - easeOutBounce(1 - t);
}

export function easeOutBounce(t: number): number {
  if (t < 1 / 2.75) {
    return 7.5625 * t * t;
  } else if (t < 2 / 2.75) {
    return 7.5625 * (t -= 1.5 / 2.75) * t + 0.75;
  } else if (t < 2.5 / 2.75) {
    return 7.5625 * (t -= 2.25 / 2.75) * t + 0.9375;
  } else {
    return 7.5625 * (t -= 2.625 / 2.75) * t + 0.984375;
  }
}

export function cubicBezier(t: number, p: { x1: number; y1: number; x2: number; y2: number }): number {
  const { x1, y1, x2, y2 } = p;

  // Newton-Raphson to solve for t given x
  let guess = t;
  for (let i = 0; i < 8; i++) {
    const x = cubicBezierComponent(guess, x1, x2) - t;
    if (Math.abs(x) < 1e-7) break;
    const dx = derivativeCubicBezierComponent(guess, x1, x2);
    if (Math.abs(dx) < 1e-7) break;
    guess -= x / dx;
  }
  guess = Math.max(0, Math.min(1, guess));

  return cubicBezierComponent(guess, y1, y2);
}

function cubicBezierComponent(t: number, a: number, b: number): number {
  return ((1 - 3 * b + 3 * a) * t + (3 * b - 6 * a)) * t * t + 3 * a * t;
}

function derivativeCubicBezierComponent(t: number, a: number, b: number): number {
  return 3 * (1 - 3 * b + 3 * a) * t * t + 2 * (3 * b - 6 * a) * t + 3 * a;
}

export const EASING_PRESETS: Record<string, EasingParams> = {
  linear: { type: 'linear' },
  easeIn: { type: 'easeIn' },
  easeOut: { type: 'easeOut' },
  easeInOut: { type: 'easeInOut' },
  easeInCubic: { type: 'bezier', bezier: { x1: 0.32, y1: 0, x2: 0.67, y2: 0 } },
  easeOutCubic: { type: 'bezier', bezier: { x1: 0.33, y1: 1, x2: 0.68, y2: 1 } },
  easeInOutCubic: { type: 'bezier', bezier: { x1: 0.65, y1: 0, x2: 0.35, y2: 1 } },
  easeInElastic: { type: 'bezier', bezier: { x1: 0.5, y1: 0, x2: 0.5, y2: 1.5 } },
  easeOutElastic: { type: 'bezier', bezier: { x1: 0.5, y1: -0.5, x2: 0.5, y2: 1 } },
  easeInBounce: { type: 'bezier', bezier: { x1: 0.5, y1: 0, x2: 0.5, y2: -0.5 } },
  easeOutBounce: { type: 'bezier', bezier: { x1: 0.5, y1: 1.5, x2: 0.5, y2: 1 } },
};
