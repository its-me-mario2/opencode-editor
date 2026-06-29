import type { Keyframe, KeyframeGroup, AnimatableProperty } from '@opencode/shared';
import { evaluateEasing } from './Easing';

export class KeyframeEngine {
  private groups: Map<string, KeyframeGroup>;

  constructor() {
    this.groups = new Map();
  }

  addKeyframe(groupId: string, keyframe: Keyframe): void {
    let group = this.groups.get(groupId);
    if (!group) {
      group = { id: groupId, property: '', keyframes: [] };
      this.groups.set(groupId, group);
    }
    group.keyframes.push(keyframe);
    group.keyframes.sort((a, b) => a.time - b.time);
  }

  removeKeyframe(groupId: string, keyframeId: string): void {
    const group = this.groups.get(groupId);
    if (!group) return;
    group.keyframes = group.keyframes.filter((k) => k.id !== keyframeId);
    if (group.keyframes.length === 0) {
      this.groups.delete(groupId);
    }
  }

  getGroup(groupId: string): KeyframeGroup | undefined {
    return this.groups.get(groupId);
  }

  getAllGroups(): KeyframeGroup[] {
    return Array.from(this.groups.values());
  }

  getValueAtTime(groupId: string, time: number): number | undefined {
    const group = this.groups.get(groupId);
    if (!group || group.keyframes.length === 0) return undefined;
    if (group.keyframes.length === 1) return group.keyframes[0]!.value;

    const kfs = group.keyframes;

    if (time <= kfs[0]!.time) return kfs[0]!.value;
    if (time >= kfs[kfs.length - 1]!.time) return kfs[kfs.length - 1]!.value;

    for (let i = 0; i < kfs.length - 1; i++) {
      const curr = kfs[i]!;
      const next = kfs[i + 1]!;
      if (time >= curr.time && time <= next.time) {
        const duration = next.time - curr.time;
        if (duration === 0) return curr.value;
        const t = (time - curr.time) / duration;
        const easedT = evaluateEasing(t, curr.easing);
        return lerp(curr.value, next.value, easedT);
      }
    }

    return kfs[kfs.length - 1]!.value;
  }

  getInterpolatedProperties(
    groups: KeyframeGroup[],
    time: number,
  ): Record<string, number> {
    const result: Record<string, number> = {};
    for (const group of groups) {
      for (const kf of group.keyframes) {
        if (Math.abs(kf.time - time) < 0.001) {
          result[group.property] = kf.value;
          break;
        }
      }
      const val = this.getValueAtTime(group.id, time);
      if (val !== undefined) {
        result[group.property] = val;
      }
    }
    return result;
  }

  clear(): void {
    this.groups.clear();
  }

  toJSON(): KeyframeGroup[] {
    return this.getAllGroups();
  }

  static fromJSON(groups: KeyframeGroup[]): KeyframeEngine {
    const engine = new KeyframeEngine();
    for (const group of groups) {
      engine.groups.set(group.id, group);
    }
    return engine;
  }
}

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}
