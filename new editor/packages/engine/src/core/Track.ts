import type { Track, TrackType } from '@opencode/shared';
import type { Timeline } from './Timeline';

export class TrackManager {
  constructor(private timeline: Timeline) {}

  createTrack(type: TrackType, name: string, index: number): Track {
    const track: Omit<Track, 'id'> = {
      type,
      name,
      index,
      enabled: true,
      locked: false,
      muted: type === 'audio',
      clips: [] as string[],
    };
    return this.timeline.addTrack(track);
  }

  duplicateTrack(trackId: string): Track | undefined {
    const track = this.timeline.getTrack(trackId);
    if (!track) return;

    const clips = this.timeline.getClipsForTrack(trackId);
    const newTrack = this.timeline.addTrack({
      type: track.type,
      name: `${track.name} (copy)`,
      index: track.index + 0.1,
      enabled: track.enabled,
      locked: false,
      muted: track.muted,
      clips: [] as string[],
    });

    for (const clip of clips) {
      this.timeline.addClip({ ...clip, trackId: newTrack.id });
    }

    return newTrack;
  }

  moveTrack(trackId: string, newIndex: number): void {
    const track = this.timeline.getTrack(trackId);
    if (!track) return;
    track.index = newIndex;
    this.timeline.state.tracks.sort((a, b) => a.index - b.index);
  }

  toggleLock(trackId: string): void {
    const track = this.timeline.getTrack(trackId);
    if (track) track.locked = !track.locked;
  }

  toggleMute(trackId: string): void {
    const track = this.timeline.getTrack(trackId);
    if (track) track.muted = !track.muted;
  }

  toggleEnabled(trackId: string): void {
    const track = this.timeline.getTrack(trackId);
    if (track) track.enabled = !track.enabled;
  }
}
