import React, { useState } from 'react';
import type { ExportCodec, ExportResolution, ExportQuality } from '@opencode/shared';
import { useUIStore } from '../../stores/uiStore';

export const ExportDialog: React.FC = () => {
  const showExportDialog = useUIStore((s) => s.showExportDialog);
  const setShowExport = useUIStore((s) => s.setShowExport);

  const [codec, setCodec] = useState<ExportCodec>('h264');
  const [resolution, setResolution] = useState<ExportResolution>('1080p');
  const [quality, setQuality] = useState<ExportQuality>('recommended');
  const [fps, setFps] = useState(30);
  const [hardwareEncoding, setHardwareEncoding] = useState(true);

  if (!showExportDialog) return null;

  const handleExport = () => {
    setShowExport(false);
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.7)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
      }}
      onClick={() => setShowExport(false)}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: '#1a1a2e',
          borderRadius: 12,
          padding: 24,
          width: 420,
          border: '1px solid #2a2a4a',
          display: 'flex',
          flexDirection: 'column',
          gap: 16,
        }}
      >
        <div style={{ fontSize: 16, fontWeight: 600, color: '#fff' }}>Export</div>

        <SelectRow label="Codec" value={codec} options={[
          { value: 'h264', label: 'H.264' },
          { value: 'hevc', label: 'HEVC (H.265)' },
          { value: 'vp9', label: 'VP9' },
          { value: 'av1', label: 'AV1' },
        ]} onChange={(v) => setCodec(v as ExportCodec)} />

        <SelectRow label="Resolution" value={resolution} options={[
          { value: '1080p', label: '1920x1080 (1080p)' },
          { value: '1440p', label: '2560x1440 (1440p)' },
          { value: '2160p', label: '3840x2160 (4K)' },
          { value: '4320p', label: '7680x4320 (8K)' },
        ]} onChange={(v) => setResolution(v as ExportResolution)} />

        <SelectRow label="Quality" value={quality} options={[
          { value: 'low', label: 'Low' },
          { value: 'recommended', label: 'Recommended' },
          { value: 'high', label: 'High' },
        ]} onChange={(v) => setQuality(v as ExportQuality)} />

        <SliderRow label="Frame Rate" value={fps} min={24} max={60} step={1} onChange={setFps} />

        <ToggleRow label="Hardware Encoding" enabled={hardwareEncoding} onChange={setHardwareEncoding} />

        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 8 }}>
          <button onClick={() => setShowExport(false)} style={btnSecondary}>Cancel</button>
          <button onClick={handleExport} style={btnPrimary}>Export</button>
        </div>
      </div>
    </div>
  );
};

const SelectRow: React.FC<{
  label: string;
  value: string;
  options: { value: string; label: string }[];
  onChange: (v: string) => void;
}> = ({ label, value, options, onChange }) => (
  <div>
    <div style={{ fontSize: 11, color: '#888', marginBottom: 4 }}>{label}</div>
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      style={{
        width: '100%',
        padding: '6px 8px',
        borderRadius: 6,
        border: '1px solid #2a2a4a',
        background: '#151528',
        color: '#ccc',
        fontSize: 12,
        outline: 'none',
      }}
    >
      {options.map((o) => (
        <option key={o.value} value={o.value}>{o.label}</option>
      ))}
    </select>
  </div>
);

const SliderRow: React.FC<{
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (v: number) => void;
}> = ({ label, value, min, max, step, onChange }) => (
  <div>
    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#888', marginBottom: 4 }}>
      <span>{label}</span>
      <span>{value}</span>
    </div>
    <input
      type="range"
      min={min}
      max={max}
      step={step}
      value={value}
      onChange={(e) => onChange(parseInt(e.target.value))}
      style={{ width: '100%', accentColor: '#4a6cf7', height: 4 }}
    />
  </div>
);

const ToggleRow: React.FC<{ label: string; enabled: boolean; onChange: (v: boolean) => void }> = ({
  label, enabled, onChange,
}) => (
  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
    <span style={{ fontSize: 11, color: '#888' }}>{label}</span>
    <button
      onClick={() => onChange(!enabled)}
      style={{
        width: 36,
        height: 20,
        borderRadius: 10,
        border: 'none',
        background: enabled ? '#4a6cf7' : '#2a2a4a',
        cursor: 'pointer',
        position: 'relative',
      }}
    >
      <div style={{ width: 16, height: 16, borderRadius: 8, background: '#fff', position: 'absolute', top: 2, left: enabled ? 18 : 2, transition: 'left 0.2s' }} />
    </button>
  </div>
);

const btnBase: React.CSSProperties = {
  padding: '8px 20px',
  borderRadius: 6,
  border: 'none',
  cursor: 'pointer',
  fontSize: 13,
  fontWeight: 500,
};

const btnPrimary: React.CSSProperties = {
  ...btnBase,
  background: '#4a6cf7',
  color: '#fff',
};

const btnSecondary: React.CSSProperties = {
  ...btnBase,
  background: '#2a2a4a',
  color: '#ccc',
};
