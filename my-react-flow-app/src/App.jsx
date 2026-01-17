import {
  Background,
  Controls,
  MiniMap,
  ReactFlow,
  addEdge,
  applyEdgeChanges,
  applyNodeChanges,
  useReactFlow,
  ReactFlowProvider
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import { useCallback, useEffect, useMemo, useState, useRef } from 'react';
import useUndo from 'use-undo';

import EditableNode from './components/EditableNode';
import LeftToolbar from './components/LeftToolbar';
import NodeInspector from './components/NodeInspector';
import EdgeInspector from './components/EdgeInspector';

import { NODE_DEFAULTS, EDGE_DEFAULTS } from './components/defaults';

const nodeTypes = { editable: EditableNode };

let idCounter = 3;

const initialState = {
  nodes: [
    {
      id: 'n1',
      type: 'editable',
      position: { x: 0, y: 0 },
      data: { ...NODE_DEFAULTS, label: 'empty node' },
    },
  ],
  edges: [
    {
      id: 'n1-n2',
      source: 'n1',
      target: 'n2',
      style: { ...EDGE_DEFAULTS },
    },
  ],
};

function FlowInner() {
  const { screenToFlowPosition } = useReactFlow();
  const [state, { set, undo, redo, canUndo, canRedo }] = useUndo(initialState);

  const { nodes, edges } = state.present || { nodes: [], edges: [] };

  const [selectedNodeId, setSelectedNodeId] = useState(null);
  const [selectedEdgeId, setSelectedEdgeId] = useState(null);

  const reactFlowWrapper = useRef(null);

  const [contextMenu, setContextMenu] = useState({
    visible: false,
    x: 0,
    y: 0,
    nodeId: null,
  });

  // NODE CHANGES
  const onNodesChange = useCallback(
    (changes) =>
      set(
        {
          nodes: applyNodeChanges(changes, nodes),
          edges,
        },
        false
      ),
    [nodes, edges]
  );

  // EDGE CHANGES
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
        edges: addEdge({ ...params, style: { ...EDGE_DEFAULTS } }, edges),
      }),
    [nodes, edges]
  );

  // ADD NODE
  const onAddNode = () => {
    const id = `n${idCounter++}`;
    set({
      nodes: [
        ...nodes,
        {
          id,
          type: 'editable',
          position: { x: 0, y: -100 },
          data: { ...NODE_DEFAULTS, label: 'empty node', onChange: (id, value) => onNodeChange(id, value) },
        },
      ],
      edges,
    });
  };

  const onNodeChange = (id, value) => {
    set({
      nodes: nodes.map((node) =>
        node.id === id ? { ...node, data: { ...NODE_DEFAULTS, ...node.data, label: value } } : node
      ),
      edges,
    });
  };

  const onDeleteNode = (nodeId) => {
    // If nodeId is an event object (from a button click), ignore it and use selectedNodeId
    // If nodeId is a string (from context menu), use that string
    const idToDelete = typeof nodeId === 'string' ? nodeId : selectedNodeId;
    
    if (!idToDelete) {
      console.warn("No node ID found to delete");
      return;
    }

    const currentNodes = state.present.nodes;
    const currentEdges = state.present.edges;

    set({
      nodes: currentNodes.filter((n) => n.id !== idToDelete),
      edges: currentEdges.filter((e) => e.source !== idToDelete && e.target !== idToDelete),
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
        n.id === selectedNodeId ? { ...n, data: { ...n.data, ...updates } } : n
      ),
      edges,
    });
  };

  const updateSelectedEdge = (updates) => {
    set({
      nodes,
      edges: edges.map((e) => (e.id === selectedEdgeId ? { ...e, ...updates } : e)),
    });
  };

  const nodesWithHandlers = nodes.map((n) => ({
    ...n,
    data: {
      ...NODE_DEFAULTS,
      ...n.data,
      onChange: (id, value) => onNodeChange(id, value),
      // Pass the existing edges down so the node can check them
      isValidConnection: (connection) => {
        // 1. Prevent connecting to the same side (your existing rule)
        const sourceSide = connection.sourceHandle.split('-')[0];
        const targetSide = connection.targetHandle.split('-')[0];
        if (sourceSide === targetSide) return false;

        // 2. Prevent duplicate connections between the same nodes
        const edgeExists = edges.some(
          (edge) =>
            (edge.source === connection.source && edge.target === connection.target) ||
            (edge.source === connection.target && edge.target === connection.source)
        );

        return !edgeExists;
      },
    },
  }));

  // CONTEXT MENU HANDLERS
  const handleContextMenu = (event) => {
    event.preventDefault();
    setContextMenu({
      visible: true,
      x: event.clientX,
      y: event.clientY,
      nodeId: null,
    });
  };

  const handleNodeContextMenu = (event, node) => {
    event.preventDefault();
    event.stopPropagation();
    
    // ADD THIS: Automatically select the node you right-clicked
    setSelectedNodeId(node.id); 
    setSelectedEdgeId(null);

    setContextMenu({
      visible: true,
      x: event.clientX,
      y: event.clientY,
      nodeId: node.id,
    });
  };

  const onAddNodeAtPosition = (clientX, clientY) => {
    const position = screenToFlowPosition({ x: clientX, y: clientY });
    
    const maxId = nodes.reduce((max, node) => {
      const num = parseInt(node.id.replace('n', ''));
      return num > max ? num : max;
    }, 0);
    
    const id = `n${maxId + 1}`;
    
    // Update the selection state to the new ID right now
    setSelectedNodeId(id); 
    setSelectedEdgeId(null);

    set({
      nodes: [
        ...nodes,
        {
          id,
          type: 'editable',
          position,
          // Ensure the node is marked as selected internally too
          selected: true, 
          data: { ...NODE_DEFAULTS, label: 'empty node', onChange: onNodeChange },
        },
      ],
      edges,
    });
  };

  const onSelectionChange = useCallback(({ nodes, edges }) => {
    // If a node is selected, set it. Otherwise null.
    const selectedNode = nodes[0];
    setSelectedNodeId(selectedNode?.id || null);

    // If an edge is selected, set it. Otherwise null.
    const selectedEdge = edges[0];
    setSelectedEdgeId(selectedEdge?.id || null);
  }, []);

  // UNDO/REDO
  useEffect(() => {
    const handler = (e) => {
      if (e.ctrlKey && e.key === 'z') undo();
      if (e.ctrlKey && (e.key === 'y' || (e.shiftKey && e.key === 'Z'))) redo();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [undo, redo]);

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

    <div ref={reactFlowWrapper} style={{ width: '100%', height: '100%' }}>
    <ReactFlow
      nodes={nodesWithHandlers}
      edges={edges}
      nodeTypes={nodeTypes}
      onNodesChange={onNodesChange}
      onEdgesChange={onEdgesChange}
      onConnect={onConnect}
      // This one line replaces 3 different click handlers
      onSelectionChange={onSelectionChange} 
      onNodeContextMenu={handleNodeContextMenu}
      onPaneContextMenu={handleContextMenu}
      fitView
    >
      <Controls />
      <MiniMap />
      <Background gap={12} size={1} />
    </ReactFlow>
    </div>

      <NodeInspector node={selectedNode} updateNode={updateSelectedNode} />
      <EdgeInspector edge={selectedEdge} updateEdge={updateSelectedEdge} />

    {contextMenu.visible && (
      <div
        style={{
          position: 'absolute',
          top: contextMenu.y,
          left: contextMenu.x,
          background: '#ffffff',
          border: '1px solid #e2e8f0',
          padding: '4px',
          borderRadius: '8px',
          zIndex: 9999,
          boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -2px rgba(0,0,0,0.05)',
          minWidth: '150px',
          pointerEvents: 'all',
        }}
        onMouseLeave={() => setContextMenu({ ...contextMenu, visible: false })}
      >
        {contextMenu.nodeId ? (
          <div
            style={{ 
              padding: '8px 12px', 
              cursor: 'pointer', 
              color: '#cc0000',
              fontWeight: '550',
              fontSize: '14px',
              borderRadius: '4px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
            onClick={() => {
              onDeleteNode(contextMenu.nodeId);
              setContextMenu({ ...contextMenu, visible: false });
            }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#fce9e9')}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
          >
            Delete Node
          </div>
        ) : (
          <div
            style={{ 
              padding: '8px 12px', 
              cursor: 'pointer', 
              color: '#2d3748',
              fontWeight: '550',
              fontSize: '14px',
              borderRadius: '4px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
            onClick={() => {
              onAddNodeAtPosition(contextMenu.x, contextMenu.y);
              setContextMenu({ ...contextMenu, visible: false });
            }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#f5f5f5')}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
          >
            Add Node
          </div>
        )}
      </div>
    )}
    </div>
  );
}

export default function App() {
  return (
      <ReactFlowProvider>
        <FlowInner />
      </ReactFlowProvider>
    );
}
