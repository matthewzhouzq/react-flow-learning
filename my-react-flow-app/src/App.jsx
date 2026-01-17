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

import { useCallback, useMemo, useState } from 'react';

import EditableNode from './components/EditableNode';
import LeftToolbar from './components/LeftToolbar';
import NodeInspector from './components/NodeInspector';
import EdgeInspector from './components/EdgeInspector';

const nodeTypes = {
  editable: EditableNode,
};

let idCounter = 3;

export default function App() {
  const [nodes, setNodes] = useState([
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
  ]);

  const [edges, setEdges] = useState([
    { id: 'n1-n2', source: 'n1', target: 'n2' },
  ]);

  const [selectedNodeId, setSelectedNodeId] = useState(null);
  const [selectedEdgeId, setSelectedEdgeId] = useState(null);


  const onNodesChange = useCallback(
    (changes) =>
      setNodes((nds) => applyNodeChanges(changes, nds)),
    []
  );

  const onEdgesChange = useCallback(
    (changes) =>
      setEdges((eds) => applyEdgeChanges(changes, eds)),
    []
  );

  const onConnect = useCallback(
    (params) =>
      setEdges((eds) => addEdge(params, eds)),
    []
  );

  const onAddNode = () => {
    const id = `n${idCounter++}`;
    setNodes((nds) => [
      ...nds,
      {
        id,
        type: 'editable',
        position: { x: 200, y: 200 },
        data: { label: `Node ${idCounter}` },
      },
    ]);
  };

  const onDeleteNode = () => {
    if (!selectedNodeId) return;
    setNodes((nds) => nds.filter((n) => n.id !== selectedNodeId));
    setEdges((eds) =>
      eds.filter(
        (e) =>
          e.source !== selectedNodeId &&
          e.target !== selectedNodeId
      )
    );
    setSelectedNodeId(null);
  };

  const selectedNode = useMemo(
    () => nodes.find((n) => n.id === selectedNodeId),
    [nodes, selectedNodeId]
  );

  const updateSelectedNode = (updates) => {
    setNodes((nds) =>
      nds.map((n) =>
        n.id === selectedNodeId
          ? { ...n, data: { ...n.data, ...updates } }
          : n
      )
    );
  };

  const selectedEdge = useMemo(
    () => edges.find((e) => e.id === selectedEdgeId),
    [edges, selectedEdgeId]
  );

  const updateSelectedEdge = (updates) => {
    setEdges((eds) =>
      eds.map((e) =>
        e.id === selectedEdgeId ? { ...e, ...updates } : e
      )
    );
  };


  const nodesWithHandlers = nodes.map((n) => ({
    ...n,
    data: {
      ...n.data,
      onChange: (id, value) =>
        setNodes((nds) =>
          nds.map((node) =>
            node.id === id
              ? { ...node, data: { ...node.data, label: value } }
              : node
          )
        ),
    },
  }));

  return (
    <div style={{ width: '100vw', height: '100vh' }}>
      <LeftToolbar
        onAdd={onAddNode}
        onDelete={onDeleteNode}
        canDelete={!!selectedNodeId}
      />

      <NodeInspector
        node={selectedNode}
        updateNode={updateSelectedNode}
      />

      <EdgeInspector
        edge={selectedEdge}
        updateEdge={updateSelectedEdge}
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
    </div>
  );
}
