import React, { useCallback } from 'react';
import type { Clip as ClipType } from '@opencode/shared';
import { useTimelineStore } from '../../stores/timelineStore';
import { useDragDrop } from '../../hooks/useDragDrop';

interface ClipProps {
  clip: ClipType;
  zoom: number;
  trackHeight: number;
}

const CLIP_COLORS: Record<string, string> = {
  video: '#4a6cf7',
  audio: '#20c997',
  text: '#ffa94d',
  image: '#51cf66',
  generator: '#cc5de8',
};

export const ClipComponent: React.FC<ClipProps> = React.memo(({ clip, zoom, trackHeight }) => {
  const selectClip = useTimelineStore((s) => s.selectClip);
  const selectedClipIds = useTimelineStore((s) => s.selectedClipIds);
  const isSelected = selectedClipIds.includes(clip.id);

  const x = clip.start * 100 * zoom;
  const width = clip.duration * 100 * zoom;
  const color = CLIP_COLORS[clip.type] ?? '#666';

  const handlePointerDown = useCallback(
    (e: React.PointerEvent) => {
      e.stopPropagation();
      selectClip(clip.id, e.shiftKey);
    },
    [clip.id, selectClip],
  );

  return (
    <div
      onPointerDown={handlePointerDown}
      style={{
        position: 'absolute',
        left: x,
        top: 2,
        width: Math.max(width, 8),
        height: trackHeight - 4,
        background: isSelected ? color : `${color}99`,
        border: isSelected ? `2px solid #fff` : `1px solid ${color}`,
        borderRadius: 4,
        cursor: 'pointer',
        overflow: 'hidden',
        display: 'flex',
        alignItems: 'center',
        padding: '0 6px',
        fontSize: 11,
        color: '#fff',
        userSelect: 'none',
        boxSizing: 'border-box',
      }}
    >
      <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
        {clip.name}
      </span>
      <div
        style={{
          position: 'absolute',
          left: 0,
          top: 0,
          width: 4,
          height: '100%',
          cursor: 'ew-resize',
        }}
      />
      <div
        style={{
          position: 'absolute',
          right: 0,
          top: 0,
          width: 4,
          height: '100%',
          cursor: 'ew-resize',
        }}
      />
    </div>
  );
});

ClipComponent.displayName = 'ClipComponent';
