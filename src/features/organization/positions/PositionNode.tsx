import React, { useRef, type CSSProperties } from 'react';
import { useDraggable, useDroppable } from '@dnd-kit/core';
import { ChevronDown, ChevronRight, GripVertical, Pencil, Plus, Users } from 'lucide-react';
import type { Position } from '../../../types/organization';
import {
  getDepartmentName,
  getPositionOccupancy,
  getPositionOccupants
} from '../../../utils/organizationUtils';
import { useOrganizationStore } from '../../../store/organizationStore';
import { useActorAccess } from '../../access/useActorAccess';
import { DEFAULT_POSITION_CARD_FIELDS, type PositionCardVisibleFields } from './PositionNode.shared';

interface PositionNodeProps {
  position: Position;
  isSelected?: boolean;
  isCollapsed: boolean;
  hasChildren: boolean;
  isDragOverlay?: boolean;
  isGlobalDragging?: boolean;
  onSelect?: () => void;
  visibleFields?: PositionCardVisibleFields;
}

export const PositionNode: React.FC<PositionNodeProps> = ({
  position,
  isSelected = false,
  isCollapsed,
  hasChildren,
  isDragOverlay = false,
  isGlobalDragging = false,
  onSelect,
  visibleFields = DEFAULT_POSITION_CARD_FIELDS
}) => {
  const { hasPermission } = useActorAccess();
  const canCreate = hasPermission('positions:create');
  const canEdit = hasPermission('positions:edit');
  const didDragRef = useRef(false);
  const {
    departments,
    assignments,
    employees,
    togglePositionCollapse,
    openCreateChildPosition,
    openEditPosition
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
  const primaryOccupant = occupants[0];
  const initials = primaryOccupant
    ? `${primaryOccupant.firstName[0] ?? ''}${primaryOccupant.lastName[0] ?? ''}`.toUpperCase()
    : position.name.slice(0, 2).toUpperCase();
  const avatarUrl = primaryOccupant
    ? `https://i.pravatar.cc/160?u=${encodeURIComponent(primaryOccupant.email)}`
    : null;
  const departmentName = getDepartmentName(position.departmentId, departments);
  const colorIndex = [...position.departmentId].reduce((total, character) => total + character.charCodeAt(0), 0) % 5;
  const departmentColors = [
    ['#6d5dfc', '#9b8cff'],
    ['#00a6a6', '#31d5c8'],
    ['#f05678', '#ff8a9e'],
    ['#e88920', '#ffc15c'],
    ['#2878d0', '#5eb5ff']
  ];
  const [accent, accentSoft] = departmentColors[colorIndex];
  const cardStyle = {
    '--position-accent': accent,
    '--position-accent-soft': accentSoft
  } as CSSProperties;

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
        style={cardStyle}
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
        <div className="position-card__top-actions">
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

        </div>

        {visibleFields.department && (
          <span className="position-card__department-pill">{departmentName}</span>
        )}

        <div className={`position-card__avatar-ring${primaryOccupant ? '' : ' position-card__avatar-ring--vacant'}`}>
          <span className={`position-card__avatar${primaryOccupant ? '' : ' position-card__avatar--vacant'}`}>
            {avatarUrl && <img src={avatarUrl} alt="" onError={event => { event.currentTarget.style.display = 'none'; }} />}
            <span>{initials}</span>
          </span>
          <span className={`position-card__presence${primaryOccupant ? '' : ' position-card__presence--vacant'}`} aria-hidden />
        </div>

        <div className="position-card__identity">
          {visibleFields.employeeName && (
            <strong>{primaryOccupant ? `${primaryOccupant.firstName} ${primaryOccupant.lastName}` : 'Open position'}</strong>
          )}
          {visibleFields.position && <span className="position-card__name">{position.name}</span>}
        </div>

        <div className="position-card__meta">
          <span className="position-card__occupancy">
            <Users size={12} />
            {position.type === 'pooled' ? `${occupancy.count} of ${occupancy.capacity} filled` : primaryOccupant ? 'Position filled' : 'Ready to assign'}
          </span>
        </div>

        {visibleFields.employeeName && assigneeNames.length > 1 ? (
          <div className="position-card__assignees">
            Also: {assigneeNames.slice(1, 2).join(', ')}
            {assigneeNames.length > 2 && ` +${assigneeNames.length - 2}`}
          </div>
        ) : null}

        {visibleFields.description && position.description && (
          <div className="position-card__detail">{position.description}</div>
        )}
        {visibleFields.status && (
          <div className={`position-card__status position-card__status--${position.status}`}>
            {position.status}
          </div>
        )}
        {visibleFields.email && primaryOccupant?.email && (
          <div className="position-card__detail" title={primaryOccupant.email}>{primaryOccupant.email}</div>
        )}

        {showDropHint && (
          <div className="position-card__drop-label">Drop to reparent</div>
        )}

        {(canCreate || canEdit) && <div className="position-card__toolbar">
          {canCreate && <button
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
          </button>}
          {canEdit && <button
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
          </button>}
        </div>}
      </div>
    </div>
  );
};
