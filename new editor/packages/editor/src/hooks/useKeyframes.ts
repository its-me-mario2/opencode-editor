import { useCallback } from 'react';
import { KeyframeEngine, EASING_PRESETS } from '@opencode/engine';
import type { Keyframe, EasingParams } from '@opencode/shared';
import { useTimelineStore } from '../stores/timelineStore';

const keyframeEngine = new KeyframeEngine();

export function useKeyframes(clipId: string) {
  const currentTime = useTimelineStore((s) => s.currentTime);
  const selectedKeyframeIds = useTimelineStore((s) => s.selectedKeyframeIds);

  const addKeyframe = useCallback(
    (property: string, value: number, easing?: EasingParams) => {
      const keyframe: Keyframe = {
        id: crypto.randomUUID(),
        time: currentTime,
        value,
        easing: easing ?? EASING_PRESETS['linear']!,
      };
      keyframeEngine.addKeyframe(`${clipId}:${property}`, keyframe);
    },
    [clipId, currentTime],
  );

  const removeKeyframe = useCallback(
    (property: string, keyframeId: string) => {
      keyframeEngine.removeKeyframe(`${clipId}:${property}`, keyframeId);
    },
    [clipId],
  );

  const getValue = useCallback(
    (property: string, time: number): number | undefined => {
      return keyframeEngine.getValueAtTime(`${clipId}:${property}`, time);
    },
    [clipId],
  );

  const getKeyframes = useCallback(
    (property: string): Keyframe[] => {
      const group = keyframeEngine.getGroup(`${clipId}:${property}`);
      return group?.keyframes ?? [];
    },
    [clipId],
  );

  const getAllKeyframes = useCallback(() => {
    return keyframeEngine.getAllGroups();
  }, []);

  return {
    addKeyframe,
    removeKeyframe,
    getValue,
    getKeyframes,
    getAllKeyframes,
    selectedKeyframeIds,
    keyframeEngine,
  };
}
