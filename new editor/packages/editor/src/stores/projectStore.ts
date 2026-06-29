import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import type { ProjectMeta, CanvasSettings, Asset, AspectRatio } from '@opencode/shared';

interface ProjectStore {
  project: ProjectMeta | null;
  assets: Asset[];
  isDirty: boolean;

  createProject: (name: string, aspectRatio: AspectRatio) => void;
  updateProjectMeta: (updates: Partial<ProjectMeta>) => void;
  setAspectRatio: (ratio: AspectRatio) => void;
  setCanvas: (canvas: Partial<CanvasSettings>) => void;

  addAsset: (asset: Asset) => void;
  removeAsset: (assetId: string) => void;
  updateAsset: (assetId: string, updates: Partial<Asset>) => void;

  markClean: () => void;
  loadProject: (project: ProjectMeta, assets: Asset[]) => void;
}

export const useProjectStore = create<ProjectStore>()(
  immer((set) => ({
    project: null,
    assets: [],
    isDirty: false,

    createProject: (name, aspectRatio) =>
      set((state) => {
        const presets: Record<AspectRatio, { width: number; height: number }> = {
          '9:16': { width: 1080, height: 1920 },
          '16:9': { width: 1920, height: 1080 },
          '1:1': { width: 1080, height: 1080 },
          '4:5': { width: 1080, height: 1350 },
          '21:9': { width: 2560, height: 1080 },
        };
        const dims = presets[aspectRatio];
        state.project = {
          id: crypto.randomUUID(),
          name,
          canvas: { ...dims, fps: 30, aspectRatio, backgroundColor: '#000000' },
          createdAt: Date.now(),
          updatedAt: Date.now(),
          duration: 0,
        };
        state.assets = [];
        state.isDirty = true;
      }),

    updateProjectMeta: (updates) =>
      set((state) => {
        if (state.project) {
          Object.assign(state.project, updates, { updatedAt: Date.now() });
          state.isDirty = true;
        }
      }),

    setAspectRatio: (ratio) =>
      set((state) => {
        if (!state.project) return;
        const presets = {
          '9:16': { width: 1080, height: 1920 },
          '16:9': { width: 1920, height: 1080 },
          '1:1': { width: 1080, height: 1080 },
          '4:5': { width: 1080, height: 1350 },
          '21:9': { width: 2560, height: 1080 },
        };
        const dims = presets[ratio];
        state.project.canvas.aspectRatio = ratio;
        state.project.canvas.width = dims.width;
        state.project.canvas.height = dims.height;
        state.project.updatedAt = Date.now();
        state.isDirty = true;
      }),

    setCanvas: (canvas) =>
      set((state) => {
        if (state.project) {
          Object.assign(state.project.canvas, canvas);
          state.project.updatedAt = Date.now();
          state.isDirty = true;
        }
      }),

    addAsset: (asset) =>
      set((state) => {
        state.assets.push(asset);
        state.isDirty = true;
      }),

    removeAsset: (assetId) =>
      set((state) => {
        state.assets = state.assets.filter((a) => a.id !== assetId);
        state.isDirty = true;
      }),

    updateAsset: (assetId, updates) =>
      set((state) => {
        const asset = state.assets.find((a) => a.id === assetId);
        if (asset) {
          Object.assign(asset, updates);
          state.isDirty = true;
        }
      }),

    markClean: () =>
      set((state) => {
        state.isDirty = false;
      }),

    loadProject: (project, assets) =>
      set((state) => {
        state.project = project;
        state.assets = assets;
        state.isDirty = false;
      }),
  })),
);
