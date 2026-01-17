import { useEffect, useState } from 'react';

export default function EdgeInspector({ edge, updateEdge }) {
  if (!edge) return null;

  const [style, setStyle] = useState(edge.style ?? {});

  useEffect(() => {
    setStyle(edge.style ?? {});
  }, [edge.id]);

  const commit = (newStyle) => {
    updateEdge({ style: newStyle });
  };

  return (
    <div
      style={{
        position: 'absolute',
        right: 10,
        top: 250,
        background: '#fff',
        padding: 10,
        borderRadius: 6,
        boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
        zIndex: 10,
        width: 220,
        display: 'flex',
        flexDirection: 'column',
        gap: 6,
      }}
    >
      <h4>Connector Settings</h4>

      <label>Color</label>
      <input
        type="color"
        value={style.stroke ?? '#000000'}
        onChange={(e) => {
          const next = { ...style, stroke: e.target.value };
          setStyle(next);
          commit(next);
        }}
      />

      <label>Thickness</label>
      <input
        type="number"
        min={1}
        max={10}
        value={style.strokeWidth ?? 2}
        onChange={(e) =>
          setStyle({
            ...style,
            strokeWidth: Number(e.target.value),
          })
        }
        onBlur={() => commit(style)}
      />

      <label>Line Type</label>
      <select
        value={
          style.strokeDasharray === '5 5' ? 'dotted' : 'solid'
        }
        onChange={(e) => {
          const next = {
            ...style,
            strokeDasharray:
              e.target.value === 'dotted' ? '5 5' : undefined,
          };
          setStyle(next);
          commit(next);
        }}
      >
        <option value="solid">Solid</option>
        <option value="dotted">Dotted</option>
      </select>
    </div>
  );
}
