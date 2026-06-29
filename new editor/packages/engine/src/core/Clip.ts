import type {
  Clip,
  ClipType,
  TransformProperties,
  AudioClipProperties,
  TextClipProperties,
} from '@opencode/shared';
import type { Timeline } from './Timeline';

export class ClipManager {
  constructor(private timeline: Timeline) {}

  createClip(
    trackId: string,
    type: ClipType,
    start: number,
    sourceStart: number,
    sourceEnd: number,
    overrides: Partial<Clip> = {},
  ): Clip {
    const duration = sourceEnd - sourceStart;
    return this.timeline.addClip({
      trackId,
      type,
      name: `Clip ${this.timeline.getAllClips().length + 1}`,
      sourceStart,
      sourceEnd,
      start,
      end: start + duration,
      duration,
      speed: 1,
      speedCurve: [],
      transform: this.defaultTransform(),
      keyframes: [],
      effects: [],
      transitions: {},
      audio: type === 'audio' || type === 'video' ? this.defaultAudio() : undefined,
      text: type === 'text' ? this.defaultText() : undefined,
      ...overrides,
    });
  }

  split(clipId: string, time: number): Clip[] {
    const clip = this.timeline.getClip(clipId);
    if (!clip) return [];
    if (time <= clip.start || time >= clip.end) return [clip];

    const splitRatio = (time - clip.start) / clip.duration;
    const sourceSplit = clip.sourceStart + (clip.sourceEnd - clip.sourceStart) * splitRatio;

    const { id: _id1, ...clipRest } = clip;
    const clipA: Clip = {
      ...clipRest,
      id: crypto.randomUUID(),
      end: time,
      duration: time - clip.start,
      sourceEnd: sourceSplit,
    };

    const clipB: Clip = {
      ...clipRest,
      id: crypto.randomUUID(),
      start: time,
      sourceStart: sourceSplit,
      duration: clip.end - time,
    };

    this.timeline.removeClip(clipId);
    this.timeline.addClip(clipA);
    this.timeline.addClip(clipB);

    return [clipA, clipB];
  }

  trim(clipId: string, newStart: number, newEnd: number): void {
    const clip = this.timeline.getClip(clipId);
    if (!clip) return;

    const sourceDuration = clip.sourceEnd - clip.sourceStart;
    const clipDuration = clip.end - clip.start;
    const startRatio = (newStart - clip.start) / clipDuration;
    const endRatio = (newEnd - clip.end) / clipDuration;

    clip.start = newStart;
    clip.end = newEnd;
    clip.duration = newEnd - newStart;
    clip.sourceStart += sourceDuration * startRatio;
    clip.sourceEnd += sourceDuration * endRatio;

    this.timeline.recalculateDuration();
  }

  duplicate(clipId: string): Clip | undefined {
    const clip = this.timeline.getClip(clipId);
    if (!clip) return;
    const { id: _ignore, ...rest } = clip;
    return this.timeline.addClip({ ...rest, start: clip.end + 0.033 });
  }

  rippleDelete(clipId: string): void {
    const clip = this.timeline.getClip(clipId);
    if (!clip) return;
    const gap = clip.end - clip.start;
    this.timeline.removeClip(clipId);
    const trackClips = this.timeline.getClipsForTrack(clip.trackId);
    for (const c of trackClips) {
      if (c.start > clip.start) {
        c.start -= gap;
        c.end -= gap;
      }
    }
    this.timeline.recalculateDuration();
  }

  private defaultTransform(): TransformProperties {
    return {
      position: { x: 0, y: 0 },
      scale: { x: 1, y: 1 },
      rotation: 0,
      opacity: 1,
      anchor: { x: 0.5, y: 0.5 },
      crop: { top: 0, bottom: 0, left: 0, right: 0 },
      flip: { horizontal: false, vertical: false },
      blendMode: 'normal',
    };
  }

  private defaultAudio(): AudioClipProperties {
    return {
      volume: 1,
      pan: 0,
      fadeIn: 0,
      fadeOut: 0,
      pitch: 1,
      speed: 1,
      mute: false,
      noiseReduction: 0,
      voiceIsolation: false,
    };
  }

  private defaultText(): TextClipProperties {
    return {
      content: 'Text',
      fontFamily: 'Arial',
      fontSize: 48,
      fontWeight: 400,
      color: '#FFFFFF',
      strokeColor: '#000000',
      strokeWidth: 0,
      shadowColor: '#000000',
      shadowBlur: 0,
      shadowOffset: { x: 0, y: 0 },
      align: 'center',
      letterSpacing: 0,
      lineHeight: 1.2,
      background: { enabled: false, color: '#000000', padding: 8, borderRadius: 4 },
      template: '',
      animation: '',
    };
  }
}
