export default function NodeInspector({ node, updateNode }) {
  if (!node) return null;

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
      <h4>Node Settings</h4>

      <label>Label</label>
      <input
        value={node.data.label ?? ''}
        onChange={(e) => updateNode({ label: e.target.value })}
      />

      <label>Background</label>
      <input
        type="color"
        value={node.data.color ?? '#ffffff'}
        onChange={(e) => updateNode({ color: e.target.value })}
      />

      <label>Border</label>
      <input
        type="color"
        value={node.data.borderColor ?? '#555555'}
        onChange={(e) => updateNode({ borderColor: e.target.value })}
      />

      <label>Text Color</label>
      <input
        type="color"
        value={node.data.textColor ?? '#000000'}
        onChange={(e) => updateNode({ textColor: e.target.value })}
      />

      <label>Font Size</label>
      <input
        type="number"
        min={10}
        max={48}
        value={node.data.fontSize ?? 14}
        onChange={(e) =>
          updateNode({ fontSize: Number(e.target.value) })
        }
      />
    </div>
  );
}
