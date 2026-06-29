import type { ProjectMeta, CanvasSettings, Asset, AspectRatio } from '@opencode/shared';
import { uuid, CANVAS_PRESETS } from '@opencode/shared';
import { Timeline } from './Timeline';

export class Project {
  readonly meta: ProjectMeta;
  readonly timeline: Timeline;
  readonly assets: Map<string, Asset>;

  constructor(name: string, aspectRatio: AspectRatio = '16:9') {
    const canvas = CANVAS_PRESETS[aspectRatio];
    this.meta = {
      id: uuid(),
      name,
      canvas: {
        width: canvas.width,
        height: canvas.height,
        fps: 30,
        aspectRatio,
        backgroundColor: '#000000',
      },
      createdAt: Date.now(),
      updatedAt: Date.now(),
      duration: 0,
    };
    this.timeline = new Timeline();
    this.assets = new Map();
  }

  get canvas(): CanvasSettings {
    return this.meta.canvas;
  }

  setAspectRatio(ratio: AspectRatio): void {
    const preset = CANVAS_PRESETS[ratio];
    this.meta.canvas.aspectRatio = ratio;
    this.meta.canvas.width = preset.width;
    this.meta.canvas.height = preset.height;
    this.touch();
  }

  setFrameRate(fps: number): void {
    this.meta.canvas.fps = fps;
    this.touch();
  }

  addAsset(asset: Omit<Asset, 'id'>): Asset {
    const newAsset: Asset = { ...asset, id: uuid() };
    this.assets.set(newAsset.id, newAsset);
    return newAsset;
  }

  removeAsset(assetId: string): void {
    this.assets.delete(assetId);
  }

  getAsset(assetId: string): Asset | undefined {
    return this.assets.get(assetId);
  }

  getAllAssets(): Asset[] {
    return Array.from(this.assets.values());
  }

  toJSON() {
    return {
      meta: this.meta,
      timeline: this.timeline.toJSON(),
      assets: this.getAllAssets(),
    };
  }

  private touch(): void {
    this.meta.updatedAt = Date.now();
  }
}
