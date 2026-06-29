import React, { useMemo } from 'react';
import { useTimelineStore } from '../../stores/timelineStore';

export const Ruler: React.FC<{ height: number }> = ({ height }) => {
  const zoom = useTimelineStore((s) => s.zoom);
  const duration = useTimelineStore((s) => s.duration);

  const ticks = useMemo(() => {
    const result: { time: number; label: string }[] = [];
    const pixelsPerSecond = 100 * zoom;
    const interval = pixelsPerSecond > 80 ? 1 : pixelsPerSecond > 40 ? 2 : pixelsPerSecond > 10 ? 5 : 10;
    let t = 0;
    while (t <= duration) {
      const minutes = Math.floor(t / 60);
      const seconds = Math.floor(t % 60);
      result.push({ time: t, label: `${minutes}:${seconds.toString().padStart(2, '0')}` });
      t += interval;
    }
    return result;
  }, [zoom, duration]);

  return (
    <div
      style={{
        height,
        background: '#1e1e32',
        borderBottom: '1px solid #2a2a4a',
        position: 'sticky',
        top: 0,
        zIndex: 10,
        overflow: 'hidden',
      }}
    >
      {ticks.map((tick) => (
        <div
          key={tick.time}
          style={{
            position: 'absolute',
            left: tick.time * 100 * zoom,
            top: 0,
            height: '100%',
            borderLeft: '1px solid #3a3a5a',
            display: 'flex',
            alignItems: 'flex-end',
            paddingLeft: 4,
          }}
        >
          <span style={{ fontSize: 10, color: '#8888aa', userSelect: 'none' }}>
            {tick.label}
          </span>
        </div>
      ))}
    </div>
  );
};
