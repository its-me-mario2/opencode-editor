import type { TimelineState } from './track';
import type { Asset } from './asset';

export type AspectRatio = '9:16' | '16:9' | '1:1' | '4:5' | '21:9';

export interface CanvasSettings {
  width: number;
  height: number;
  fps: number;
  aspectRatio: AspectRatio;
  backgroundColor: string;
}

export interface ProjectMeta {
  id: string;
  name: string;
  canvas: CanvasSettings;
  createdAt: number;
  updatedAt: number;
  thumbnail?: string;
  duration: number;
}

export interface Project {
  meta: ProjectMeta;
  timeline: TimelineState;
  assets: Asset[];
}
