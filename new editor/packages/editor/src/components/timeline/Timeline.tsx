import React, { useRef, useCallback } from 'react';
import { useTimelineStore } from '../../stores/timelineStore';
import { Ruler } from './Ruler';
import { TrackRow } from './Track';
import { Playhead } from './Playhead';

const RULER_HEIGHT = 28;

export const Timeline: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const tracks = useTimelineStore((s) => s.tracks);
  const zoom = useTimelineStore((s) => s.zoom);
  const setZoom = useTimelineStore((s) => s.setZoom);
  const duration = useTimelineStore((s) => s.duration);

  const handleWheel = useCallback(
    (e: React.WheelEvent) => {
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault();
        setZoom(zoom * (e.deltaY > 0 ? 0.9 : 1.1));
      }
    },
    [zoom, setZoom],
  );

  return (
    <div
      className="timeline-container"
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        background: '#0f0f1a',
        userSelect: 'none',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          padding: '4px 8px',
          background: '#1a1a2e',
          borderBottom: '1px solid #2a2a4a',
          gap: 12,
          fontSize: 12,
        }}
      >
        <span style={{ color: '#888' }}>Timeline</span>
        <button
          onClick={() => setZoom(zoom * 1.25)}
          style={zoomBtnStyle}
        >
          +
        </button>
        <button
          onClick={() => setZoom(zoom * 0.8)}
          style={zoomBtnStyle}
        >
          -
        </button>
        <span style={{ color: '#666', fontSize: 11 }}>{Math.round(zoom * 100)}%</span>
      </div>

      <div
        ref={containerRef}
        onWheel={handleWheel}
        style={{
          flex: 1,
          overflow: 'auto',
          position: 'relative',
        }}
      >
        <div style={{ minWidth: duration * 100 * zoom + 200, position: 'relative' }}>
          <div style={{ marginLeft: 180 }}>
            <Ruler height={RULER_HEIGHT} />
          </div>

          <div style={{ position: 'relative' }}>
            {tracks.map((track, index) => (
              <TrackRow key={track.id} track={track} index={index} zoom={zoom} />
            ))}
          </div>

          <Playhead />
        </div>
      </div>
    </div>
  );
};

const zoomBtnStyle: React.CSSProperties = {
  width: 24,
  height: 24,
  borderRadius: 4,
  border: '1px solid #3a3a5a',
  background: '#1e1e32',
  color: '#ccc',
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: 14,
};
