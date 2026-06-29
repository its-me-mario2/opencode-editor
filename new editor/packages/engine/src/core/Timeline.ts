import type { Track, TimelineState, Clip } from '@opencode/shared';
import { TrackManager } from './Track';
import { ClipManager } from './Clip';
import { uuid } from '@opencode/shared';

export class Timeline {
  readonly state: TimelineState;
  private tracks: Map<string, Track>;
  private clips: Map<string, Clip>;
  private trackManager: TrackManager;
  private clipManager: ClipManager;

  constructor() {
    this.state = {
      tracks: [],
      duration: 0,
      currentTime: 0,
      zoom: 1,
      snapEnabled: true,
    };
    this.tracks = new Map();
    this.clips = new Map();
    this.trackManager = new TrackManager(this);
    this.clipManager = new ClipManager(this);
  }

  get trackManagerInstance(): TrackManager {
    return this.trackManager;
  }

  get clipManagerInstance(): ClipManager {
    return this.clipManager;
  }

  addTrack(track: Omit<Track, 'id'>): Track {
    const newTrack: Track = { ...track, id: uuid() };
    this.tracks.set(newTrack.id, newTrack);
    this.state.tracks.push(newTrack);
    return newTrack;
  }

  removeTrack(trackId: string): void {
    const track = this.tracks.get(trackId);
    if (!track) return;
    for (const clipId of track.clips) {
      this.clips.delete(clipId);
    }
    this.tracks.delete(trackId);
    this.state.tracks = this.state.tracks.filter((t) => t.id !== trackId);
  }

  getTrack(trackId: string): Track | undefined {
    return this.tracks.get(trackId);
  }

  getAllTracks(): Track[] {
    return Array.from(this.tracks.values());
  }

  addClip(clip: Omit<Clip, 'id'>): Clip {
    const newClip: Clip = { ...clip, id: uuid() };
    this.clips.set(newClip.id, newClip);
    const track = this.tracks.get(newClip.trackId);
    if (track) {
      track.clips.push(newClip.id);
      track.clips.sort((a, b) => {
        const ca = this.clips.get(a)!;
        const cb = this.clips.get(b)!;
        return ca.start - cb.start;
      });
    }
    this.recalculateDuration();
    return newClip;
  }

  removeClip(clipId: string): void {
    const clip = this.clips.get(clipId);
    if (!clip) return;
    const track = this.tracks.get(clip.trackId);
    if (track) {
      track.clips = track.clips.filter((id) => id !== clipId);
    }
    this.clips.delete(clipId);
    this.recalculateDuration();
  }

  getClip(clipId: string): Clip | undefined {
    return this.clips.get(clipId);
  }

  getClipsForTrack(trackId: string): Clip[] {
    const track = this.tracks.get(trackId);
    if (!track) return [];
    return track.clips.map((id) => this.clips.get(id)!).filter(Boolean);
  }

  getAllClips(): Clip[] {
    return Array.from(this.clips.values());
  }

  setCurrentTime(time: number): void {
    this.state.currentTime = Math.max(0, Math.min(time, this.state.duration));
  }

  setZoom(zoom: number): void {
    this.state.zoom = Math.max(0.1, Math.min(zoom, 128));
  }

  recalculateDuration(): void {
    let maxEnd = 0;
    for (const clip of this.clips.values()) {
      if (clip.end > maxEnd) maxEnd = clip.end;
    }
    this.state.duration = maxEnd;
  }

  toJSON(): TimelineState {
    return { ...this.state };
  }

  static fromJSON(state: TimelineState): Timeline {
    const timeline = new Timeline();
    timeline.state.tracks = state.tracks;
    timeline.state.duration = state.duration;
    timeline.state.currentTime = state.currentTime;
    timeline.state.zoom = state.zoom;
    timeline.state.snapEnabled = state.snapEnabled;
    return timeline;
  }
}
