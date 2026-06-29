import React, { useState } from 'react';

const EFFECTS = [
  { id: 'blur', name: 'Blur', icon: '🌫️' },
  { id: 'sharpen', name: 'Sharpen', icon: '🔍' },
  { id: 'glitch', name: 'Glitch', icon: '📺' },
  { id: 'vignette', name: 'Vignette', icon: '🎭' },
  { id: 'filmGrain', name: 'Film Grain', icon: '🎞️' },
  { id: 'chromatic', name: 'Chromatic', icon: '🌈' },
] as const;

const FILTERS = [
  { id: 'vintage', name: 'Vintage', icon: '📷' },
  { id: 'retro', name: 'Retro', icon: '🕹️' },
  { id: 'cinematic', name: 'Cinematic', icon: '🎬' },
  { id: 'vlog', name: 'VLOG', icon: '🎥' },
  { id: 'noir', name: 'Noir', icon: '⚫' },
  { id: 'dream', name: 'Dream', icon: '💭' },
] as const;

export const EffectsPanel: React.FC = () => {
  const [tab, setTab] = useState<'effects' | 'filters'>('effects');

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', background: '#151528', borderLeft: '1px solid #2a2a4a' }}>
      <div style={{ display: 'flex', borderBottom: '1px solid #2a2a4a' }}>
        {(['effects', 'filters'] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            style={{
              flex: 1,
              padding: '8px',
              border: 'none',
              background: tab === t ? '#2a2a4a' : 'transparent',
              color: tab === t ? '#fff' : '#888',
              cursor: 'pointer',
              fontSize: 12,
              textTransform: 'capitalize',
            }}
          >
            {t}
          </button>
        ))}
      </div>

      <div style={{ flex: 1, overflow: 'auto', padding: 8 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
          {(tab === 'effects' ? EFFECTS : FILTERS).map((item) => (
            <div
              key={item.id}
              style={{
                padding: '8px 6px',
                borderRadius: 6,
                background: '#1e1e32',
                cursor: 'pointer',
                textAlign: 'center',
                fontSize: 11,
                color: '#aaa',
                border: '1px solid #2a2a4a',
              }}
            >
              <div style={{ fontSize: 20, marginBottom: 4 }}>{item.icon}</div>
              <div>{item.name}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
