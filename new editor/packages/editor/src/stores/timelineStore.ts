import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import type { TimelineState, Track, Clip } from '@opencode/shared';

interface TimelineStore extends TimelineState {
  selectedTrackId: string | null;
  selectedClipIds: string[];
  selectedKeyframeIds: string[];
  dragState: { type: 'clip' | 'keyframe' | 'trim' | 'none'; id: string | null };

  setDuration: (duration: number) => void;
  setCurrentTime: (time: number) => void;
  setZoom: (zoom: number) => void;
  setSnap: (enabled: boolean) => void;

  addTrack: (track: Track) => void;
  removeTrack: (trackId: string) => void;
  updateTrack: (trackId: string, updates: Partial<Track>) => void;
  reorderTracks: (fromIndex: number, toIndex: number) => void;

  addClip: (clip: Clip) => void;
  removeClip: (clipId: string) => void;
  updateClip: (clipId: string, updates: Partial<Clip>) => void;
  moveClip: (clipId: string, newStart: number, newTrackId?: string) => void;
  splitClip: (clipId: string, time: number) => Clip[];

  selectTrack: (trackId: string | null) => void;
  selectClip: (clipId: string, multi?: boolean) => void;
  deselectAll: () => void;

  setDragState: (state: TimelineStore['dragState']) => void;
}

export const useTimelineStore = create<TimelineStore>()(
  immer((set, get) => ({
    tracks: [],
    duration: 0,
    currentTime: 0,
    zoom: 1,
    snapEnabled: true,
    selectedTrackId: null,
    selectedClipIds: [],
    selectedKeyframeIds: [],
    dragState: { type: 'none', id: null },

    setDuration: (duration) =>
      set((state) => {
        state.duration = duration;
      }),

    setCurrentTime: (time) =>
      set((state) => {
        state.currentTime = Math.max(0, Math.min(time, state.duration));
      }),

    setZoom: (zoom) =>
      set((state) => {
        state.zoom = Math.max(0.1, Math.min(zoom, 128));
      }),

    setSnap: (enabled) =>
      set((state) => {
        state.snapEnabled = enabled;
      }),

    addTrack: (track) =>
      set((state) => {
        state.tracks.push(track);
      }),

    removeTrack: (trackId) =>
      set((state) => {
        const idx = state.tracks.findIndex((t) => t.id === trackId);
        if (idx !== -1) state.tracks.splice(idx, 1);
        if (state.selectedTrackId === trackId) state.selectedTrackId = null;
      }),

    updateTrack: (trackId, updates) =>
      set((state) => {
        const track = state.tracks.find((t) => t.id === trackId);
        if (track) Object.assign(track, updates);
      }),

    reorderTracks: (fromIndex, toIndex) =>
      set((state) => {
        const [moved] = state.tracks.splice(fromIndex, 1);
        state.tracks.splice(toIndex, 0, moved!);
      }),

    addClip: (clip) =>
      set((state) => {
        const track = state.tracks.find((t) => t.id === clip.trackId);
        if (track) {
          track.clips.push(clip.id);
          track.clips.sort((a, b) => {
            const ca = get().tracks
              .flatMap((t) => t.clips.map((id) => ({ id })))
              .find((c) => c.id === a);
            const cb = get().tracks
              .flatMap((t) => t.clips.map((id) => ({ id })))
              .find((c) => c.id === b);
            return 0;
          });
        }
        state.duration = Math.max(state.duration, clip.end);
      }),

    removeClip: (clipId) =>
      set((state) => {
        for (const track of state.tracks) {
          const idx = track.clips.indexOf(clipId);
          if (idx !== -1) {
            track.clips.splice(idx, 1);
            break;
          }
        }
        state.selectedClipIds = state.selectedClipIds.filter((id) => id !== clipId);
      }),

    updateClip: (clipId, updates) =>
      set((state) => {
        const clip = getClipFromState(state, clipId);
        if (clip) Object.assign(clip, updates);
      }),

    moveClip: (clipId, newStart, newTrackId) =>
      set((state) => {
        const clip = getClipFromState(state, clipId);
        if (!clip) return;
        const duration = clip.end - clip.start;
        clip.start = newStart;
        clip.end = newStart + duration;
        if (newTrackId && newTrackId !== clip.trackId) {
          const oldTrack = state.tracks.find((t) => t.id === clip.trackId);
          if (oldTrack) {
            oldTrack.clips = oldTrack.clips.filter((id) => id !== clipId);
          }
          clip.trackId = newTrackId;
          const newTrack = state.tracks.find((t) => t.id === newTrackId);
          if (newTrack) {
            newTrack.clips.push(clipId);
          }
        }
        state.duration = Math.max(state.duration, clip.end);
      }),

    splitClip: (clipId, time) => {
      const state = get();
      const clip = getClipFromState(state, clipId);
      if (!clip || time <= clip.start || time >= clip.end) return [];

      const splitRatio = (time - clip.start) / clip.duration;
      const sourceSplit = clip.sourceStart + (clip.sourceEnd - clip.sourceStart) * splitRatio;

      const clipA: Clip = {
        ...clip,
        id: crypto.randomUUID(),
        end: time,
        duration: time - clip.start,
        sourceEnd: sourceSplit,
      };

      const clipB: Clip = {
        ...clip,
        id: crypto.randomUUID(),
        start: time,
        sourceStart: sourceSplit,
        duration: clip.end - time,
      };

      set((s) => {
        const track = s.tracks.find((t) => t.id === clip.trackId);
        if (track) {
          const idx = track.clips.indexOf(clipId);
          if (idx !== -1) {
            track.clips.splice(idx, 1, clipA.id, clipB.id);
          }
        }
      });

      set((s) => {
        s.selectedClipIds = [clipB.id];
      });

      return [clipA, clipB];
    },

    selectTrack: (trackId) =>
      set((state) => {
        state.selectedTrackId = trackId;
      }),

    selectClip: (clipId, multi) =>
      set((state) => {
        if (multi) {
          const idx = state.selectedClipIds.indexOf(clipId);
          if (idx !== -1) {
            state.selectedClipIds.splice(idx, 1);
          } else {
            state.selectedClipIds.push(clipId);
          }
        } else {
          state.selectedClipIds = [clipId];
        }
      }),

    deselectAll: () =>
      set((state) => {
        state.selectedClipIds = [];
        state.selectedKeyframeIds = [];
        state.selectedTrackId = null;
      }),

    setDragState: (dragState) =>
      set((state) => {
        state.dragState = dragState;
      }),
  })),
);

function getClipFromState(state: TimelineStore, clipId: string): Clip | undefined {
  for (const track of state.tracks) {
    for (const id of track.clips) {
      if (id === clipId) {
        return {} as Clip;
      }
    }
  }
  return undefined;
}
