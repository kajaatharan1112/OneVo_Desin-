import React, { useRef } from 'react';
import { useDraggable, useDroppable } from '@dnd-kit/core';
import { ChevronDown, ChevronRight, GripVertical, Pencil, Plus, UserPlus, Users } from 'lucide-react';
import type { Position } from '../../../types/organization';
import {
  getChildren,
  getDepartmentName,
  getPositionOccupancy,
  getPositionOccupants
} from '../../../utils/organizationUtils';
import { useOrganizationStore } from '../../../store/organizationStore';

interface PositionNodeProps {
  position: Position;
  isSelected?: boolean;
  isCollapsed: boolean;
  hasChildren: boolean;
  isDragOverlay?: boolean;
  isGlobalDragging?: boolean;
  onSelect?: () => void;
}

export const PositionNode: React.FC<PositionNodeProps> = ({
  position,
  isSelected = false,
  isCollapsed,
  hasChildren,
  isDragOverlay = false,
  isGlobalDragging = false,
  onSelect
}) => {
  const didDragRef = useRef(false);
  const {
    departments,
    assignments,
    employees,
    togglePositionCollapse,
    openCreateChildPosition,
    openEditPosition,
    openAssignEmployee
  } = useOrganizationStore();

  const { attributes, listeners, setNodeRef: setDragRef, isDragging } = useDraggable({
    id: position.id,
    data: { position },
    disabled: isDragOverlay
  });

  const { setNodeRef: setDropRef, isOver } = useDroppable({
    id: `drop-${position.id}`,
    data: { positionId: position.id }
  });

  const occupancy = getPositionOccupancy(position.id, position, assignments);
  const occupants = getPositionOccupants(position.id, assignments, employees);
  const assigneeNames = occupants.map(e => `${e.firstName} ${e.lastName}`);

  const showDropHint = isGlobalDragging && !isDragging && position.type !== 'pooled';

  return (
    <div
      ref={setDropRef}
      className={[
        'position-card-drop-zone',
        isOver && 'position-card-drop-zone--over',
        showDropHint && 'position-card-drop-zone--hint'
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <div
        ref={setDragRef}
        className={[
          'position-card',
          isSelected && 'position-card--selected',
          isDragging && 'position-card--dragging',
          isOver && 'position-card--drop-target',
          position.type === 'pooled' && 'position-card--pooled',
          isDragOverlay && 'position-card--overlay',
          isGlobalDragging && !isDragging && 'position-card--drop-candidate'
        ]
          .filter(Boolean)
          .join(' ')}
        {...listeners}
        {...attributes}
        onClick={e => {
          e.stopPropagation();
          if (didDragRef.current) {
            didDragRef.current = false;
            return;
          }
          onSelect?.();
        }}
        role="button"
        tabIndex={0}
        onPointerUp={() => {
          if (isDragging) didDragRef.current = true;
        }}
      >
        <div className="position-card__header">
          <span className="position-card__drag-handle" aria-hidden>
            <GripVertical size={14} />
          </span>

          {hasChildren && (
            <button
              type="button"
              className="position-card__collapse"
              onPointerDown={e => e.stopPropagation()}
              onClick={e => {
                e.stopPropagation();
                togglePositionCollapse(position.id);
              }}
              aria-label={isCollapsed ? 'Expand branch' : 'Collapse branch'}
            >
              {isCollapsed ? <ChevronRight size={14} /> : <ChevronDown size={14} />}
            </button>
          )}

          <div className="position-card__titles">
            <span className="position-card__name">{position.name}</span>
            <span className="position-card__code">{position.code}</span>
          </div>

          <span className={`position-card__type position-card__type--${position.type}`}>
            {position.type}
          </span>
        </div>

        <div className="position-card__meta">
          <span>{getDepartmentName(position.departmentId, departments)}</span>
          <span className="position-card__occupancy">
            <Users size={12} />
            {occupancy.count}/{occupancy.capacity}
          </span>
        </div>

        {assigneeNames.length > 0 ? (
          <div className="position-card__assignees">
            {assigneeNames.slice(0, 2).join(', ')}
            {assigneeNames.length > 2 && ` +${assigneeNames.length - 2}`}
          </div>
        ) : (
          <div className="position-card__vacant">Vacant</div>
        )}

        {showDropHint && (
          <div className="position-card__drop-label">Drop to reparent</div>
        )}

        <div className="position-card__toolbar">
          <button
            type="button"
            className="position-card__toolbar-btn"
            onPointerDown={e => e.stopPropagation()}
            onClick={e => {
              e.stopPropagation();
              openCreateChildPosition(position.id);
            }}
            aria-label={`Add child under ${position.name}`}
            title="Add child position"
          >
            <Plus size={13} />
          </button>
          <button
            type="button"
            className="position-card__toolbar-btn"
            onPointerDown={e => e.stopPropagation()}
            onClick={e => {
              e.stopPropagation();
              openEditPosition(position.id);
            }}
            aria-label={`Edit ${position.name}`}
            title="Edit position"
          >
            <Pencil size={13} />
          </button>
          <button
            type="button"
            className="position-card__toolbar-btn"
            onPointerDown={e => e.stopPropagation()}
            onClick={e => {
              e.stopPropagation();
              openAssignEmployee(position.id);
            }}
            aria-label={`Assign employee to ${position.name}`}
            title="Assign employee"
          >
            <UserPlus size={13} />
          </button>
        </div>
      </div>
    </div>
  );
};

export function getVisiblePositionIds(
  positions: Position[],
  collapsedIds: Set<string>
): Set<string> {
  const hidden = new Set<string>();

  function hideDescendants(parentId: string) {
    for (const child of getChildren(parentId, positions)) {
      hidden.add(child.id);
      hideDescendants(child.id);
    }
  }

  for (const id of collapsedIds) {
    hideDescendants(id);
  }

  return new Set(positions.filter(p => !hidden.has(p.id)).map(p => p.id));
}
