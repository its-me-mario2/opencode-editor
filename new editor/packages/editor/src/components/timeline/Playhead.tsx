import React from 'react';
import { useTimelineStore } from '../../stores/timelineStore';

export const Playhead: React.FC = () => {
  const currentTime = useTimelineStore((s) => s.currentTime);
  const zoom = useTimelineStore((s) => s.zoom);
  const setCurrentTime = useTimelineStore((s) => s.setCurrentTime);

  const x = currentTime * 100 * zoom;

  const handlePointerDown = (e: React.PointerEvent) => {
    e.preventDefault();
    const onMove = (ev: PointerEvent) => {
      const rect = (e.target as HTMLElement).closest('.timeline-container')?.getBoundingClientRect();
      if (!rect) return;
      const time = (ev.clientX - rect.left) / (100 * zoom);
      setCurrentTime(Math.max(0, time));
    };
    const onUp = () => {
      document.removeEventListener('pointermove', onMove);
      document.removeEventListener('pointerup', onUp);
    };
    document.addEventListener('pointermove', onMove);
    document.addEventListener('pointerup', onUp);
  };

  return (
    <div
      onPointerDown={handlePointerDown}
      style={{
        position: 'absolute',
        left: x,
        top: 0,
        width: 2,
        height: '100%',
        background: '#ff4444',
        zIndex: 100,
        cursor: 'col-resize',
        pointerEvents: 'all',
      }}
    >
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: -6,
          width: 14,
          height: 14,
          background: '#ff4444',
          clipPath: 'polygon(50% 100%, 0 0, 100% 0)',
        }}
      />
    </div>
  );
};
