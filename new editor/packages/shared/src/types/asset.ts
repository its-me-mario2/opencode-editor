export type AssetType = 'video' | 'audio' | 'image' | 'font' | 'lut' | 'template' | 'effect' | 'transition';

export interface Asset {
  id: string;
  projectId: string;
  type: AssetType;
  name: string;
  originalName: string;
  mimeType: string;
  size: number;
  duration: number;
  width: number;
  height: number;
  fps: number;
  codec: string;
  thumbnail?: string;
  proxyPath?: string;
  sourcePath: string;
  metadata: Record<string, unknown>;
  createdAt: number;
}

export interface StockAsset {
  id: string;
  name: string;
  type: AssetType;
  category: string;
  previewUrl: string;
  downloadUrl: string;
  duration: number;
  tags: string[];
  isPremium: boolean;
}

export interface Sticker {
  id: string;
  name: string;
  category: string;
  animated: boolean;
  url: string;
  width: number;
  height: number;
}

export interface TransitionAsset {
  id: string;
  name: string;
  category: '3d' | 'glitch' | 'blur' | 'camera' | 'wipe' | 'dissolve';
  thumbnail: string;
  duration: number;
  params: Record<string, number>;
}
