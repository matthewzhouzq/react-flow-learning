import { Handle, Position, NodeResizer } from '@xyflow/react';
import { useState } from 'react';

export default function EditableNode({ id, data, selected }) {
  const [editing, setEditing] = useState(false);

  return (
    <>
      {selected && <NodeResizer minWidth={120} minHeight={50} />}

      <div
        style={{
          padding: 10,
          borderRadius: 6,
          border: `2px solid ${data.borderColor ?? '#555'}`,
          background: data.color ?? '#fff',
          width: '100%',
          height: '100%',
          boxSizing: 'border-box',
        }}
        onDoubleClick={() => setEditing(true)}
      >
        <Handle type="target" position={Position.Top} />

        {editing ? (
          <input
            autoFocus
            value={data.label ?? ''}
            onChange={(e) => data.onChange(id, e.target.value)}
            onBlur={() => setEditing(false)}
            style={{ width: '100%' }}
          />
        ) : (
            <div
            style={{
                color: data.textColor || '#000',
                fontSize: data.fontSize || 12,
                fontWeight: selected ? 'bold' : 'normal',
                fontFamily: data.fontFamily || "'Quicksand', 'Google Sans Code', sans-serif",
            }}
            >
            {data.label}
            </div>

        )}

        <Handle type="source" position={Position.Bottom} />
      </div>
    </>
  );
}
