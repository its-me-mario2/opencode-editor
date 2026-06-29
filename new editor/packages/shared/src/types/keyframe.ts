export type EasingType = 'linear' | 'easeIn' | 'easeOut' | 'easeInOut' | 'bezier';

export interface EasingParams {
  type: EasingType;
  bezier?: { x1: number; y1: number; x2: number; y2: number };
}

export interface Keyframe {
  id: string;
  time: number;
  value: number;
  easing: EasingParams;
}

export interface KeyframeGroup {
  id: string;
  property: string;
  keyframes: Keyframe[];
}

export type AnimatableProperty =
  | 'transform.position.x'
  | 'transform.position.y'
  | 'transform.scale.x'
  | 'transform.scale.y'
  | 'transform.rotation'
  | 'transform.opacity'
  | 'audio.volume'
  | 'audio.pan'
  | 'effect';
