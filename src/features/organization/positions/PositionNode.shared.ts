import type { Position } from '../../../types/organization';
import { getChildren } from '../../../utils/organizationUtils';

export interface PositionCardVisibleFields {
  employeeName: boolean;
  department: boolean;
  position: boolean;
  description: boolean;
  status: boolean;
  email: boolean;
}

export const DEFAULT_POSITION_CARD_FIELDS: PositionCardVisibleFields = {
  employeeName: true,
  department: true,
  position: true,
  description: false,
  status: false,
  email: false,
};

export function getVisiblePositionIds(
  positions: Position[],
  collapsedIds: Set<string>,
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

  return new Set(positions.filter(position => !hidden.has(position.id)).map(position => position.id));
}
