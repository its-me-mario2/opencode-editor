export interface AudioWaveform {
  peaks: Float32Array;
  samples: number;
  duration: number;
  channels: number;
  sampleRate: number;
}

export interface BeatMarker {
  time: number;
  index: number;
  strength: number;
}

export interface VocalEffect {
  type: 'none' | 'robot' | 'deep' | 'high' | 'echo' | 'chipmunk';
  intensity: number;
  pitch: number;
  formant: number;
}

export interface NoiseReductionConfig {
  enabled: boolean;
  amount: number;
  noiseGate: number;
}

export interface VoiceIsolationConfig {
  enabled: boolean;
  strength: number;
}

export interface LoudnessConfig {
  enabled: boolean;
  targetLUFS: number;
}
