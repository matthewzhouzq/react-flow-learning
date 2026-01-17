export default function LeftToolbar({
  onAdd,
  onDelete,
  onUndo,
  onRedo,
  canDelete,
}) {
  return (
    <div
      style={{
        position: 'absolute',
        left: 10,
        top: 10,
        background: '#fff',
        padding: 10,
        borderRadius: 6,
        boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
        zIndex: 10,
        display: 'flex',
        flexDirection: 'column',
        gap: 8,
      }}
    >
      <button onClick={onAdd}>➕ Add Node</button>

      <button onClick={onDelete} disabled={!canDelete}>
        🗑 Delete Node
      </button>

      <button onClick={onUndo}>↩ Undo</button>
      <button onClick={onRedo}>↪ Redo</button>

      <button
        onClick={() => {
          /*
            🤖 AI SUGGESTION PLACEHOLDER 🤖

            fetch('http://localhost:8000/ai/suggest', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ nodes, edges }),
            })
          */
        }}
      >
        🤖 AI Suggest
      </button>
    </div>
  );
}
