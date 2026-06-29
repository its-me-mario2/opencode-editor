import React, { useRef, useEffect, useState } from 'react';
import { useTimelineStore } from '../../stores/timelineStore';
import { useProjectStore } from '../../stores/projectStore';
import { useUIStore } from '../../stores/uiStore';
import { usePlayback } from '../../hooks/usePlayback';

export const Preview: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [dimensions, setDimensions] = useState({ width: 480, height: 270 });
  const { togglePlayPause, currentTime } = usePlayback(canvasRef);
  const playbackState = useUIStore((s) => s.playbackState);
  const previewResolution = useUIStore((s) => s.previewResolution);
  const project = useProjectStore((s) => s.project);
  const setCurrentTime = useTimelineStore((s) => s.setCurrentTime);
  const duration = useTimelineStore((s) => s.duration);

  useEffect(() => {
    if (!project) return;
    const { canvas } = project;
    const scale =
      previewResolution === 'full' ? 1 : previewResolution === 'half' ? 0.5 : 0.25;
    setDimensions({
      width: canvas.width * scale,
      height: canvas.height * scale,
    });
  }, [project, previewResolution]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    const ms = Math.floor((seconds % 1) * 100);
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}.${ms.toString().padStart(2, '0')}`;
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        background: '#0a0a14',
        height: '100%',
        padding: 8,
      }}
    >
      <div
        style={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
        }}
      >
        <canvas
          ref={canvasRef}
          width={dimensions.width}
          height={dimensions.height}
          style={{
            width: dimensions.width,
            height: dimensions.height,
            borderRadius: 4,
            background: '#000',
            boxShadow: '0 0 20px rgba(0,0,0,0.5)',
          }}
        />
      </div>

      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          padding: '8px 0',
          width: '100%',
          justifyContent: 'center',
        }}
      >
        <button onClick={() => setCurrentTime(0)} style={transportBtnStyle} title="Start">
          ⏮
        </button>
        <button onClick={togglePlayPause} style={{ ...transportBtnStyle, width: 40, height: 40, fontSize: 18 }}>
          {playbackState === 'playing' ? '⏸' : '▶'}
        </button>
        <button onClick={() => setCurrentTime(Math.max(0, currentTime - 1))} style={transportBtnStyle} title="Previous Frame">
          ⏪
        </button>
        <button onClick={() => setCurrentTime(Math.min(duration, currentTime + 1))} style={transportBtnStyle} title="Next Frame">
          ⏩
        </button>

        <span style={{ color: '#888', fontSize: 13, fontFamily: 'monospace', marginLeft: 8 }}>
          {formatTime(currentTime)} / {formatTime(duration)}
        </span>
      </div>
    </div>
  );
};

const transportBtnStyle: React.CSSProperties = {
  width: 32,
  height: 32,
  borderRadius: 6,
  border: '1px solid #3a3a5a',
  background: '#1e1e32',
  color: '#ccc',
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: 14,
  transition: 'background 0.15s',
};
