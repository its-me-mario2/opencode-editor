import type { KeyframeGroup } from './keyframe';

export type ClipType = 'video' | 'audio' | 'text' | 'image' | 'generator';

export interface Clip {
  id: string;
  type: ClipType;
  trackId: string;
  name: string;

  sourceStart: number;
  sourceEnd: number;
  start: number;
  end: number;
  duration: number;

  speed: number;
  speedCurve: SpeedControlPoint[];

  transform: TransformProperties;
  keyframes: KeyframeGroup[];
  effects: AppliedEffect[];
  transitions: ClipTransitions;

  audio?: AudioClipProperties;
  text?: TextClipProperties;
  source?: ClipSource;
}

export interface ClipSource {
  assetId: string;
  filePath: string;
  type: string;
  width: number;
  height: number;
  duration: number;
}

export interface TransformProperties {
  position: { x: number; y: number };
  scale: { x: number; y: number };
  rotation: number;
  opacity: number;
  anchor: { x: number; y: number };
  crop: CropSettings;
  flip: { horizontal: boolean; vertical: boolean };
  blendMode: BlendMode;
}

export interface CropSettings {
  top: number;
  bottom: number;
  left: number;
  right: number;
}

export interface SpeedControlPoint {
  time: number;
  value: number;
}

export interface AppliedEffect {
  id: string;
  type: string;
  enabled: boolean;
  params: Record<string, number>;
}

export interface ClipTransitions {
  in?: TransitionConfig;
  out?: TransitionConfig;
}

export interface TransitionConfig {
  id: string;
  type: string;
  duration: number;
}

export interface AudioClipProperties {
  volume: number;
  pan: number;
  fadeIn: number;
  fadeOut: number;
  pitch: number;
  speed: number;
  mute: boolean;
  noiseReduction: number;
  voiceIsolation: boolean;
}

export interface TextClipProperties {
  content: string;
  fontFamily: string;
  fontSize: number;
  fontWeight: number;
  color: string;
  strokeColor: string;
  strokeWidth: number;
  shadowColor: string;
  shadowBlur: number;
  shadowOffset: { x: number; y: number };
  align: 'left' | 'center' | 'right';
  letterSpacing: number;
  lineHeight: number;
  background: { enabled: boolean; color: string; padding: number; borderRadius: number };
  template: string;
  animation: string;
}

export type BlendMode =
  | 'normal'
  | 'darken'
  | 'multiply'
  | 'colorBurn'
  | 'linearBurn'
  | 'lighten'
  | 'screen'
  | 'colorDodge'
  | 'linearDodge'
  | 'overlay'
  | 'softLight'
  | 'hardLight'
  | 'vividLight'
  | 'linearLight'
  | 'pinLight'
  | 'difference'
  | 'exclusion'
  | 'hue'
  | 'saturation'
  | 'color'
  | 'luminosity';
