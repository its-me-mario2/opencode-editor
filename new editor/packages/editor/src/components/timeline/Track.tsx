import React, { useMemo } from 'react';
import type { Track as TrackType } from '@opencode/shared';
import { useTimelineStore } from '../../stores/timelineStore';
import { ClipComponent } from './Clip';

interface TrackRowProps {
  track: TrackType;
  index: number;
  zoom: number;
}

const TRACK_HEADER_WIDTH = 180;
const TRACK_HEIGHT = 60;

export const TrackRow: React.FC<TrackRowProps> = React.memo(({ track, index, zoom }) => {
  const selectTrack = useTimelineStore((s) => s.selectTrack);
  const selectedTrackId = useTimelineStore((s) => s.selectedTrackId);
  const isSelected = selectedTrackId === track.id;

  const clips = useMemo(() => {
    return [];
  }, []);

  const trackIcons: Record<string, string> = {
    video: '🎬',
    audio: '🔊',
    text: 'T',
    image: '🖼',
    pip: '📺',
    effect: '✨',
  };

  return (
    <div
      style={{
        display: 'flex',
        height: TRACK_HEIGHT,
        borderBottom: '1px solid #2a2a4a',
      }}
    >
      <div
        onClick={() => selectTrack(track.id)}
        style={{
          width: TRACK_HEADER_WIDTH,
          minWidth: TRACK_HEADER_WIDTH,
          background: isSelected ? '#2a2a4a' : '#1a1a2e',
          borderRight: '1px solid #2a2a4a',
          display: 'flex',
          alignItems: 'center',
          padding: '0 8px',
          gap: 6,
          cursor: 'pointer',
          userSelect: 'none',
          fontSize: 12,
        }}
      >
        <span style={{ fontSize: 14 }}>{trackIcons[track.type] ?? '📁'}</span>
        <span style={{ color: track.locked ? '#666' : '#ccc', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {track.name}
        </span>
        {track.locked && <span style={{ color: '#ff6b6b', marginLeft: 'auto' }}>🔒</span>}
        {track.muted && track.type === 'audio' && (
          <span style={{ color: '#ffa94d', marginLeft: 'auto' }}>🔇</span>
        )}
      </div>

      <div
        style={{
          flex: 1,
          position: 'relative',
          background: index % 2 === 0 ? '#12121e' : '#151528',
          overflow: 'hidden',
        }}
      >
        {track.clips.map((clipId) => (
          <div key={clipId} style={{ position: 'absolute', inset: 0 }}>
            {/* Clip rendering would use a lookup to Clip data */}
          </div>
        ))}
      </div>
    </div>
  );
});

TrackRow.displayName = 'TrackRow';
