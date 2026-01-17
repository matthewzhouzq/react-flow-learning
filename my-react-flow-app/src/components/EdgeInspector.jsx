export default function EdgeInspector({ edge, updateEdge }) {
  if (!edge) return null;

  const stroke = edge.style?.stroke ?? '#000000';
  const strokeWidth = edge.style?.strokeWidth ?? 2;
  const isDotted = edge.style?.strokeDasharray === '5 5';

  return (
    <div
      style={{
        position: 'absolute',
        right: 10,
        top: 10,
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
        value={stroke}
        onChange={(e) =>
          updateEdge({
            style: {
              ...edge.style,
              stroke: e.target.value,
            },
          })
        }
      />

      <label>Thickness</label>
      <input
        type="number"
        min={1}
        max={10}
        value={strokeWidth}
        onChange={(e) =>
          updateEdge({
            style: {
              ...edge.style,
              strokeWidth: Number(e.target.value),
            },
          })
        }
      />

      <label>Line Type</label>
      <select
        value={isDotted ? 'dotted' : 'solid'}
        onChange={(e) =>
          updateEdge({
            style: {
              ...edge.style,
              strokeDasharray:
                e.target.value === 'dotted' ? '5 5' : undefined,
            },
          })
        }
      >
        <option value="solid">Solid</option>
        <option value="dotted">Dotted</option>
      </select>
    </div>
  );
}
