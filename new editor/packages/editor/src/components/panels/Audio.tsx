import React, { useState } from 'react';

export const AudioPanel: React.FC = () => {
  const [volume, setVolume] = useState(1);
  const [fadeIn, setFadeIn] = useState(0);
  const [fadeOut, setFadeOut] = useState(0);
  const [noiseReduction, setNoiseReduction] = useState(0);
  const [voiceIsolation, setVoiceIsolation] = useState(false);

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', background: '#151528', borderLeft: '1px solid #2a2a4a' }}>
      <div style={{ padding: '8px 12px', borderBottom: '1px solid #2a2a4a', fontSize: 13, fontWeight: 600, color: '#ccc' }}>
        Audio
      </div>

      <div style={{ flex: 1, overflow: 'auto', padding: 12, display: 'flex', flexDirection: 'column', gap: 14 }}>
        <SliderRow label="Volume" value={volume} min={0} max={2} step={0.01} onChange={setVolume} />
        <SliderRow label="Fade In" value={fadeIn} min={0} max={5} step={0.1} onChange={setFadeIn} suffix="s" />
        <SliderRow label="Fade Out" value={fadeOut} min={0} max={5} step={0.1} onChange={setFadeOut} suffix="s" />
        <SliderRow label="Noise Reduction" value={noiseReduction} min={0} max={100} step={1} onChange={setNoiseReduction} suffix="%" />

        <ToggleRow label="Voice Isolation" enabled={voiceIsolation} onChange={setVoiceIsolation} />

        <div style={{ borderTop: '1px solid #2a2a4a', paddingTop: 12 }}>
          <div style={{ fontSize: 12, color: '#888', marginBottom: 8 }}>Voice Effects</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
            {[
              { id: 'none', label: 'None', icon: '🔇' },
              { id: 'robot', label: 'Robot', icon: '🤖' },
              { id: 'deep', label: 'Deep', icon: '👨' },
              { id: 'high', label: 'High', icon: '👧' },
              { id: 'echo', label: 'Echo', icon: '🔊' },
            ].map((v) => (
              <div key={v.id} style={{ padding: 8, borderRadius: 6, background: '#1e1e32', cursor: 'pointer', textAlign: 'center', fontSize: 11, color: '#aaa', border: '1px solid #2a2a4a' }}>
                <div style={{ fontSize: 16, marginBottom: 2 }}>{v.icon}</div>
                <div>{v.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

const SliderRow: React.FC<{
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (v: number) => void;
  suffix?: string;
}> = ({ label, value, min, max, step, onChange, suffix }) => (
  <div>
    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#888', marginBottom: 4 }}>
      <span>{label}</span>
      <span>{value.toFixed(step < 1 ? 2 : 0)}{suffix ?? ''}</span>
    </div>
    <input
      type="range"
      min={min}
      max={max}
      step={step}
      value={value}
      onChange={(e) => onChange(parseFloat(e.target.value))}
      style={{ width: '100%', accentColor: '#4a6cf7', height: 4 }}
    />
  </div>
);

const ToggleRow: React.FC<{
  label: string;
  enabled: boolean;
  onChange: (v: boolean) => void;
}> = ({ label, enabled, onChange }) => (
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
        transition: 'background 0.2s',
      }}
    >
      <div
        style={{
          width: 16,
          height: 16,
          borderRadius: 8,
          background: '#fff',
          position: 'absolute',
          top: 2,
          left: enabled ? 18 : 2,
          transition: 'left 0.2s',
        }}
      />
    </button>
  </div>
);
