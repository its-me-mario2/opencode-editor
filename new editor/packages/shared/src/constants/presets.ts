export const CANVAS_PRESETS = {
  '9:16': { width: 1080, height: 1920, label: 'Portrait (9:16)' },
  '16:9': { width: 1920, height: 1080, label: 'Landscape (16:9)' },
  '1:1': { width: 1080, height: 1080, label: 'Square (1:1)' },
  '4:5': { width: 1080, height: 1350, label: 'Portrait (4:5)' },
  '21:9': { width: 2560, height: 1080, label: 'Ultrawide (21:9)' },
} as const;

export const FRAME_RATES = [23.976, 24, 25, 29.97, 30, 50, 59.94, 60, 120] as const;

export const SPEED_PRESETS = [0.1, 0.25, 0.5, 0.75, 1, 1.25, 1.5, 2, 4, 8, 16, 32, 64, 100] as const;

export const SPEED_CURVE_PRESETS = {
  custom: 'Custom',
  montage: 'Montage',
  hero: 'Hero',
  bullet: 'Bullet Time',
  slowMo: 'Slow Motion',
  speedUp: 'Speed Up',
} as const;

export const BLEND_MODES = [
  'normal', 'darken', 'multiply', 'colorBurn', 'linearBurn',
  'lighten', 'screen', 'colorDodge', 'linearDodge',
  'overlay', 'softLight', 'hardLight', 'vividLight', 'linearLight', 'pinLight',
  'difference', 'exclusion',
  'hue', 'saturation', 'color', 'luminosity',
] as const;

export const MASK_TYPES = ['linear', 'mirror', 'radial', 'rectangle', 'heart'] as const;

export const DEFAULT_EASING = { type: 'linear' as const, bezier: undefined };

export const TRACK_TYPES = ['video', 'audio', 'text', 'image', 'pip', 'effect'] as const;

export const EXPORT_RESOLUTIONS = {
  '1080p': { width: 1920, height: 1080 },
  '1440p': { width: 2560, height: 1440 },
  '2160p': { width: 3840, height: 2160 },
  '4320p': { width: 7680, height: 4320 },
} as const;

export const EXPORT_BITRATES = {
  h264: { low: 2_000_000, recommended: 8_000_000, high: 20_000_000 },
  hevc: { low: 1_000_000, recommended: 5_000_000, high: 12_000_000 },
  vp9: { low: 1_000_000, recommended: 4_000_000, high: 10_000_000 },
  av1: { low: 800_000, recommended: 3_000_000, high: 8_000_000 },
} as const;
