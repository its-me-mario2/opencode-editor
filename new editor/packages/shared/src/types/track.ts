export type TrackType = 'video' | 'audio' | 'text' | 'image' | 'pip' | 'effect';

export interface Track {
  id: string;
  type: TrackType;
  name: string;
  index: number;
  enabled: boolean;
  locked: boolean;
  muted: boolean;
  clips: string[];
}

export interface TimelineState {
  tracks: Track[];
  duration: number;
  currentTime: number;
  zoom: number;
  snapEnabled: boolean;
}
