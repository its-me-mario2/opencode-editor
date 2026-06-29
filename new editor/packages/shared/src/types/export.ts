export type ExportCodec = 'h264' | 'hevc' | 'vp9' | 'av1';

export type ExportQuality = 'low' | 'recommended' | 'high';

export type ExportResolution = '1080p' | '1440p' | '2160p' | '4320p';

export interface ExportSettings {
  codec: ExportCodec;
  resolution: ExportResolution;
  fps: number;
  bitrate: number;
  quality: ExportQuality;
  audioBitrate: number;
  audioSampleRate: number;
  format: 'mp4' | 'mov' | 'webm';
  startTime: number;
  endTime: number;
  hardwareEncoding: boolean;
}

export interface ExportProgress {
  phase: 'encoding' | 'muxing' | 'complete';
  percent: number;
  fps: number;
  eta: number;
}

export interface ExportTemplate {
  id: string;
  name: string;
  settings: ExportSettings;
}
