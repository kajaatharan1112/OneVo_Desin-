import React, { useCallback, useMemo, useState } from 'react';
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  pointerWithin,
  type DragEndEvent,
  type DragStartEvent
} from '@dnd-kit/core';
import ReactFlow, {
  Background,
  Controls,
  type Node,
  type Edge,
  type NodeProps,
  Handle,
  Position as FlowHandlePosition
} from 'reactflow';
import 'reactflow/dist/style.css';
import { AlertCircle, Plus } from 'lucide-react';
import { useOrganizationStore } from '../../../store/organizationStore';
import { PositionNode, getVisiblePositionIds } from './PositionNode';
import {
  computeTreeLayout,
  getChildren,
  NODE_HEIGHT,
  NODE_WIDTH
} from '../../../utils/organizationUtils';
import type { Position } from '../../../types/organization';

function PositionFlowNode({
  data
}: NodeProps<{ position: Position; isGlobalDragging: boolean }>) {
  const { collapsedPositionIds } = useOrganizationStore();
  const position = data.position;
  const positions = useOrganizationStore(s => s.positions);
  const hasChildren = getChildren(position.id, positions).length > 0;

  return (
    <div className="position-flow-node">
      <Handle type="target" position={FlowHandlePosition.Top} className="position-flow-handle" />
      <PositionNode
        position={position}
        isCollapsed={collapsedPositionIds.has(position.id)}
        hasChildren={hasChildren}
        isGlobalDragging={data.isGlobalDragging}
      />
      <Handle type="source" position={FlowHandlePosition.Bottom} className="position-flow-handle" />
    </div>
  );
}

const nodeTypes = { positionNode: PositionFlowNode };

export const PositionOrgChart: React.FC = () => {
  const {
    positions,
    collapsedPositionIds,
    dragError,
    clearDragError,
    reparentPosition,
    openCreateRootPosition
  } = useOrganizationStore();

  const [activeDragId, setActiveDragId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 200, tolerance: 6 } })
  );

  const visibleIds = useMemo(
    () => getVisiblePositionIds(positions, collapsedPositionIds),
    [positions, collapsedPositionIds]
  );

  const { nodes: layoutNodes, edges: layoutEdges } = useMemo(
    () => computeTreeLayout(positions, collapsedPositionIds),
    [positions, collapsedPositionIds]
  );

  const isGlobalDragging = activeDragId !== null;
  const draggedPosition = positions.find(p => p.id === activeDragId) ?? null;

  const flowNodes: Node[] = useMemo(
    () =>
      layoutNodes
        .filter(n => visibleIds.has(n.id))
        .map(n => {
          const position = positions.find(p => p.id === n.id)!;
          return {
            id: n.id,
            type: 'positionNode',
            position: { x: n.x, y: n.y },
            data: { position, isGlobalDragging },
            draggable: false,
            selectable: false,
            width: NODE_WIDTH,
            height: NODE_HEIGHT
          };
        }),
    [layoutNodes, visibleIds, positions, isGlobalDragging]
  );

  const flowEdges: Edge[] = useMemo(
    () =>
      layoutEdges
        .filter(e => visibleIds.has(e.source) && visibleIds.has(e.target))
        .map(e => ({
          id: `${e.source}-${e.target}`,
          source: e.source,
          target: e.target,
          type: 'smoothstep',
          className: 'position-flow-edge',
          animated: false
        })),
    [layoutEdges, visibleIds]
  );

  const handleDragStart = useCallback((event: DragStartEvent) => {
    clearDragError();
    setActiveDragId(String(event.active.id));
  }, [clearDragError]);

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      setActiveDragId(null);
      const { active, over } = event;
      if (!over) return;

      const draggedId = String(active.id);
      const overId = String(over.id);
      const targetId = overId.startsWith('drop-') ? overId.slice(5) : overId;

      if (draggedId !== targetId) {
        reparentPosition(draggedId, targetId);
      }
    },
    [reparentPosition]
  );

  return (
    <div className={`position-org-chart${isGlobalDragging ? ' position-org-chart--dragging' : ''}`}>
      <div className="position-org-chart__toolbar">
        <button
          type="button"
          className="org-btn org-btn--secondary"
          onClick={openCreateRootPosition}
        >
          <Plus size={15} />
          Add Root Position
        </button>
      </div>

      {dragError && (
        <div className="position-org-chart__error" role="alert">
          <AlertCircle size={16} />
          <span>{dragError}</span>
          <button type="button" onClick={clearDragError} aria-label="Dismiss error">×</button>
        </div>
      )}

      {isGlobalDragging && (
        <div className="position-org-chart__drag-hint">
          Drop onto a unique active position to change reporting
        </div>
      )}

      <div className="position-org-chart__canvas-wrap">
        <DndContext
          sensors={sensors}
          collisionDetection={pointerWithin}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <ReactFlow
            nodes={flowNodes}
            edges={flowEdges}
            nodeTypes={nodeTypes}
            fitView
            fitViewOptions={{ padding: 0.3 }}
            minZoom={0.25}
            maxZoom={1.5}
            proOptions={{ hideAttribution: true }}
            nodesDraggable={false}
            nodesConnectable={false}
            elementsSelectable={false}
            panOnScroll
            panOnDrag={isGlobalDragging ? false : [1, 2]}
            className="position-flow"
          >
            <Background gap={20} size={1} className="position-flow-bg" />
            <Controls showInteractive={false} />
          </ReactFlow>

          <DragOverlay dropAnimation={null}>
            {draggedPosition && (
              <PositionNode
                position={draggedPosition}
                isCollapsed={false}
                hasChildren={getChildren(draggedPosition.id, positions).length > 0}
                isDragOverlay
              />
            )}
          </DragOverlay>
        </DndContext>
      </div>
    </div>
  );
};
