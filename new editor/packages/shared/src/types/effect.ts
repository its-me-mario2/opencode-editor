export interface ColorGrading {
  brightness: number;
  contrast: number;
  saturation: number;
  exposure: number;
  sharpen: number;
  highlights: number;
  shadows: number;
  temperature: number;
  tint: number;
  vignette: number;
  hsl: HSLChannel[];
  curves: ColorCurves;
  lut?: string;
}

export interface HSLChannel {
  channel: 'red' | 'orange' | 'yellow' | 'green' | 'cyan' | 'blue' | 'purple' | 'magenta';
  hue: number;
  saturation: number;
  lightness: number;
}

export interface ColorCurves {
  rgb: CurvePoint[];
  red: CurvePoint[];
  green: CurvePoint[];
  blue: CurvePoint[];
}

export interface CurvePoint {
  input: number;
  output: number;
}

export interface MaskSettings {
  type: MaskType;
  enabled: boolean;
  feather: number;
  invert: boolean;
  params: Record<string, number>;
}

export type MaskType = 'linear' | 'mirror' | 'radial' | 'rectangle' | 'heart';

export interface StabilizationSettings {
  level: 'off' | 'basic' | 'recommended' | 'mostStable';
  angle: number;
  zoom: number;
}

export interface MotionBlurSettings {
  enabled: boolean;
  blend: number;
  samples: number;
  direction: number;
}
