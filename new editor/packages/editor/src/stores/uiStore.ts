import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';

type PanelId = 'properties' | 'effects' | 'audio' | 'color' | 'export' | 'media' | 'text';

interface PanelLayout {
  id: PanelId;
  visible: boolean;
  order: number;
  width: number;
}

interface UIState {
  theme: 'dark' | 'light';
  panels: PanelLayout[];
  activePanel: PanelId | null;
  showExportDialog: boolean;
  showSettings: boolean;
  playbackState: 'playing' | 'paused' | 'stopped';
  previewResolution: 'full' | 'half' | 'quarter';
  snapToGrid: boolean;
  showWaveforms: boolean;
  showKeyframes: boolean;

  setTheme: (theme: 'dark' | 'light') => void;
  togglePanel: (panelId: PanelId) => void;
  setActivePanel: (panel: PanelId | null) => void;
  setShowExport: (show: boolean) => void;
  setPlaybackState: (state: 'playing' | 'paused' | 'stopped') => void;
  setPreviewResolution: (res: 'full' | 'half' | 'quarter') => void;
  setSnapToGrid: (snap: boolean) => void;
  setShowWaveforms: (show: boolean) => void;
  setShowKeyframes: (show: boolean) => void;
}

export const useUIStore = create<UIState>()(
  immer((set) => ({
    theme: 'dark',
    panels: [
      { id: 'media', visible: true, order: 0, width: 260 },
      { id: 'properties', visible: true, order: 1, width: 300 },
      { id: 'effects', visible: true, order: 2, width: 300 },
      { id: 'audio', visible: false, order: 3, width: 300 },
      { id: 'color', visible: false, order: 4, width: 300 },
      { id: 'text', visible: false, order: 5, width: 300 },
      { id: 'export', visible: false, order: 6, width: 300 },
    ],
    activePanel: 'properties',
    showExportDialog: false,
    showSettings: false,
    playbackState: 'stopped',
    previewResolution: 'half',
    snapToGrid: true,
    showWaveforms: true,
    showKeyframes: true,

    setTheme: (theme) => set((s) => { s.theme = theme; }),

    togglePanel: (panelId) =>
      set((s) => {
        const panel = s.panels.find((p) => p.id === panelId);
        if (panel) panel.visible = !panel.visible;
      }),

    setActivePanel: (panel) => set((s) => { s.activePanel = panel; }),

    setShowExport: (show) => set((s) => { s.showExportDialog = show; }),

    setPlaybackState: (state) => set((s) => { s.playbackState = state; }),

    setPreviewResolution: (res) => set((s) => { s.previewResolution = res; }),

    setSnapToGrid: (snap) => set((s) => { s.snapToGrid = snap; }),

    setShowWaveforms: (show) => set((s) => { s.showWaveforms = show; }),

    setShowKeyframes: (show) => set((s) => { s.showKeyframes = show; }),
  })),
);
