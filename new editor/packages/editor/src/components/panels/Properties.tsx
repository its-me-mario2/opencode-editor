import React, { useCallback } from 'react';
import { useTimelineStore } from '../../stores/timelineStore';
import { useProjectStore } from '../../stores/projectStore';

export const PropertiesPanel: React.FC = () => {
  const selectedClipIds = useTimelineStore((s) => s.selectedClipIds);
  const project = useProjectStore((s) => s.project);

  if (selectedClipIds.length === 0) {
    return (
      <PanelContainer title="Project">
        {project && (
          <div style={{ padding: 8, fontSize: 12, color: '#aaa', display: 'flex', flexDirection: 'column', gap: 8 }}>
            <div><label style={{ color: '#888' }}>Name</label><div>{project.name}</div></div>
            <div><label style={{ color: '#888' }}>Resolution</label><div>{project.canvas.width}x{project.canvas.height}</div></div>
            <div><label style={{ color: '#888' }}>FPS</label><div>{project.canvas.fps}</div></div>
            <div><label style={{ color: '#888' }}>Duration</label><div>{project.duration.toFixed(2)}s</div></div>
          </div>
        )}
      </PanelContainer>
    );
  }

  return (
    <PanelContainer title="Properties">
      <div style={{ padding: 8, color: '#aaa', fontSize: 12 }}>
        Selected: {selectedClipIds.length} clip(s)
      </div>
    </PanelContainer>
  );
};

const PanelContainer: React.FC<{ title: string; children: React.ReactNode }> = ({
  title,
  children,
}) => (
  <div
    style={{
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      background: '#151528',
      borderLeft: '1px solid #2a2a4a',
    }}
  >
    <div
      style={{
        padding: '8px 12px',
        borderBottom: '1px solid #2a2a4a',
        fontSize: 13,
        fontWeight: 600,
        color: '#ccc',
      }}
    >
      {title}
    </div>
    <div style={{ flex: 1, overflow: 'auto' }}>{children}</div>
  </div>
);
