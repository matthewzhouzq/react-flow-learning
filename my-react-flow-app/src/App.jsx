import {
  Background,
  Controls,
  MiniMap,
  ReactFlow,
  addEdge,
  applyEdgeChanges,
  applyNodeChanges,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import { useCallback, useEffect, useMemo, useState } from 'react';
import useUndo from 'use-undo';

import EditableNode from './components/EditableNode';
import LeftToolbar from './components/LeftToolbar';
import NodeInspector from './components/NodeInspector';
import EdgeInspector from './components/EdgeInspector';

const nodeTypes = { editable: EditableNode };

let idCounter = 3;

const initialState = {
  nodes: [
    {
      id: 'n1',
      type: 'editable',
      position: { x: 0, y: 0 },
      data: { label: 'Node 1' },
    },
    {
      id: 'n2',
      type: 'editable',
      position: { x: 0, y: 150 },
      data: { label: 'Node 2' },
    },
  ],
  edges: [{ id: 'n1-n2', source: 'n1', target: 'n2' }],
};

export default function App() {
  const [state, { set, undo, redo, canUndo, canRedo }] = useUndo(initialState);
  const { nodes, edges } = state.present;

  const [selectedNodeId, setSelectedNodeId] = useState(null);
  const [selectedEdgeId, setSelectedEdgeId] = useState(null);

  // ⌨️ Keyboard shortcuts
  useEffect(() => {
    const handler = (e) => {
      if (e.ctrlKey && e.key === 'z') undo();
      if (e.ctrlKey && (e.key === 'y' || (e.shiftKey && e.key === 'Z')))
        redo();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [undo, redo]);

  const onNodesChange = useCallback(
    (changes) => {
      // live preview, NO history
      set(
        {
          nodes: applyNodeChanges(changes, nodes),
          edges,
        },
        false // ❗ prevents microscopic undo
      );
    },
    [nodes, edges]
  );
 

  const onEdgesChange = useCallback(
    (changes) =>
      set({
        nodes,
        edges: applyEdgeChanges(changes, edges),
      }),
    [nodes, edges]
  );

  const onConnect = useCallback(
    (params) =>
      set({
        nodes,
        edges: addEdge(params, edges),
      }),
    [nodes, edges]
  );

  const onAddNode = () => {
    const id = `n${idCounter++}`;
    set({
      nodes: [
        ...nodes,
        {
          id,
          type: 'editable',
          position: { x: 200, y: 200 },
          data: { label: `Node ${id}` },
        },
      ],
      edges,
    });
  };

  const onDeleteNode = () => {
    if (!selectedNodeId) return;
    set({
      nodes: nodes.filter((n) => n.id !== selectedNodeId),
      edges: edges.filter(
        (e) =>
          e.source !== selectedNodeId && e.target !== selectedNodeId
      ),
    });
    setSelectedNodeId(null);
  };

  const selectedNode = useMemo(
    () => nodes.find((n) => n.id === selectedNodeId),
    [nodes, selectedNodeId]
  );

  const selectedEdge = useMemo(
    () => edges.find((e) => e.id === selectedEdgeId),
    [edges, selectedEdgeId]
  );

  const updateSelectedNode = (updates) => {
    set({
      nodes: nodes.map((n) =>
        n.id === selectedNodeId
          ? { ...n, data: { ...n.data, ...updates } }
          : n
      ),
      edges,
    });
  };

  const updateSelectedEdge = (updates) => {
    set({
      nodes,
      edges: edges.map((e) =>
        e.id === selectedEdgeId
          ? { ...e, ...updates }
          : e
      ),
    });
  };

  const nodesWithHandlers = nodes.map((n) => ({
    ...n,
    data: {
      ...n.data,
      onChange: (id, value) =>
        set({
          nodes: nodes.map((node) =>
            node.id === id
              ? {
                  ...node,
                  data: { ...node.data, label: value },
                }
              : node
          ),
          edges,
        }),
    },
  }));

  return (
    <div style={{ width: '100vw', height: '100vh' }}>
      <LeftToolbar
        onAdd={onAddNode}
        onDelete={onDeleteNode}
        onUndo={undo}
        onRedo={redo}
        canDelete={!!selectedNodeId}
        canUndo={canUndo}
        canRedo={canRedo}
      />

      <ReactFlow
        nodes={nodesWithHandlers}
        edges={edges}
        nodeTypes={nodeTypes}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodeClick={(_, node) => {
          setSelectedNodeId(node.id);
          setSelectedEdgeId(null);
        }}
        onEdgeClick={(_, edge) => {
          setSelectedEdgeId(edge.id);
          setSelectedNodeId(null);
        }}
        fitView
      >
        <Controls />
        <MiniMap />
        <Background gap={12} size={1} />
      </ReactFlow>

      <NodeInspector
        node={selectedNode}
        updateNode={updateSelectedNode}
      />

      <EdgeInspector
        edge={selectedEdge}
        updateEdge={updateSelectedEdge}
      />
    </div>
  );
}
