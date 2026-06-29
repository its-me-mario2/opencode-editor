import React, { useEffect } from 'react';
import { Timeline } from './components/timeline/Timeline';
import { Preview } from './components/preview/Preview';
import { PropertiesPanel } from './components/panels/Properties';
import { EffectsPanel } from './components/panels/Effects';
import { AudioPanel } from './components/panels/Audio';
import { ExportDialog } from './components/panels/Export';
import { useProjectStore } from './stores/projectStore';
import { useUIStore } from './stores/uiStore';

export const App: React.FC = () => {
  const project = useProjectStore((s) => s.project);
  const createProject = useProjectStore((s) => s.createProject);
  const showExportDialog = useUIStore((s) => s.showExportDialog);
  const setShowExport = useUIStore((s) => s.setShowExport);
  const activePanel = useUIStore((s) => s.activePanel);

  useEffect(() => {
    if (!project) {
      createProject('Untitled Project', '16:9');
    }
  }, [project, createProject]);

  if (!project) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', background: '#0f0f1a' }}>
        <div style={{ color: '#888', fontSize: 14 }}>Loading...</div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', width: '100vw', overflow: 'hidden' }}>
      {/* Menu Bar */}
      <div style={{ display: 'flex', alignItems: 'center', height: 36, background: '#12121e', borderBottom: '1px solid #2a2a4a', padding: '0 8px', gap: 8, fontSize: 12 }}>
        <span style={{ fontWeight: 700, color: '#4a6cf7', fontSize: 14, marginRight: 16 }}>OpenEditor</span>
        {['File', 'Edit', 'Tools', 'View', 'Help'].map((menu) => (
          <span key={menu} style={{ color: '#888', cursor: 'pointer', padding: '4px 8px', borderRadius: 4 }}>{menu}</span>
        ))}
        <div style={{ flex: 1 }} />
        <span style={{ color: '#666' }}>{project.name} — {project.canvas.width}x{project.canvas.height}</span>
      </div>

      {/* Main Layout */}
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        {/* Media Panel */}
        <div style={{ width: 200, minWidth: 200, background: '#151528', borderRight: '1px solid #2a2a4a', display: 'flex', flexDirection: 'column' }}>
          <div style={{ padding: '8px 12px', borderBottom: '1px solid #2a2a4a', fontSize: 13, fontWeight: 600, color: '#ccc' }}>Media</div>
          <div style={{ flex: 1, padding: 12, display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'center', justifyContent: 'center', color: '#666', fontSize: 12 }}>
            <div style={{ fontSize: 32, opacity: 0.5 }}>📁</div>
            <div>Drop media here</div>
            <button style={{ padding: '6px 16px', borderRadius: 6, border: '1px solid #3a3a5a', background: '#1e1e32', color: '#aaa', cursor: 'pointer', fontSize: 12 }}>Import</button>
          </div>
        </div>

        {/* Center: Preview + Timeline */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          <div style={{ height: '50%', minHeight: 200 }}>
            <Preview />
          </div>
          <div style={{ flex: 1, minHeight: 150, borderTop: '1px solid #2a2a4a' }}>
            <Timeline />
          </div>
        </div>

        {/* Right Panel */}
        <div style={{ width: 260, minWidth: 260, overflow: 'auto' }}>
          {activePanel === 'properties' && <PropertiesPanel />}
          {activePanel === 'effects' && <EffectsPanel />}
          {activePanel === 'audio' && <AudioPanel />}
        </div>
      </div>

      {/* Bottom tabs for right panel */}
      <div style={{ display: 'flex', height: 32, background: '#12121e', borderTop: '1px solid #2a2a4a' }}>
        {[
          { id: 'properties', label: 'Properties', icon: '⚙️' },
          { id: 'effects', label: 'Effects', icon: '✨' },
          { id: 'audio', label: 'Audio', icon: '🔊' },
          { id: 'export', label: 'Export', icon: '📤' },
        ].map((tab) => {
          const isActive = activePanel === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => tab.id === 'export' ? setShowExport(true) : useUIStore.getState().setActivePanel(tab.id as any)}
              style={{
                padding: '0 16px',
                border: 'none',
                background: isActive ? '#1e1e32' : 'transparent',
                color: isActive ? '#fff' : '#888',
                cursor: 'pointer',
                fontSize: 12,
                display: 'flex',
                alignItems: 'center',
                gap: 4,
                borderRight: '1px solid #2a2a4a',
              }}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      <ExportDialog />
    </div>
  );
};
