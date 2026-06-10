import type {
  Department,
  DepartmentTreeNode,
  Employee,
  Position,
  PositionAssignment,
  PositionTreeNode,
  ReportingManagerResult
} from '../types/organization';

export function suggestDepartmentCode(name: string): string {
  return name
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9\s]/g, '')
    .split(/\s+/)
    .filter(Boolean)
    .map(word => word.slice(0, 4))
    .join('-')
    .slice(0, 12) || 'DEPT';
}

export function buildDepartmentTree(departments: Department[]): DepartmentTreeNode[] {
  const map = new Map<string, DepartmentTreeNode>();
  departments.forEach(d => map.set(d.id, { ...d, children: [] }));

  const roots: DepartmentTreeNode[] = [];
  for (const node of map.values()) {
    if (node.parentDepartmentId && map.has(node.parentDepartmentId)) {
      map.get(node.parentDepartmentId)!.children.push(node);
    } else {
      roots.push(node);
    }
  }

  const sortNodes = (nodes: DepartmentTreeNode[]) => {
    nodes.sort((a, b) => a.name.localeCompare(b.name));
    nodes.forEach(n => sortNodes(n.children));
  };
  sortNodes(roots);
  return roots;
}

export function buildPositionTree(positions: Position[]): PositionTreeNode[] {
  const map = new Map<string, PositionTreeNode>();
  positions.forEach(p => map.set(p.id, { ...p, children: [] }));

  const roots: PositionTreeNode[] = [];
  for (const node of map.values()) {
    if (node.reportsToPositionId && map.has(node.reportsToPositionId)) {
      map.get(node.reportsToPositionId)!.children.push(node);
    } else {
      roots.push(node);
    }
  }

  const sortNodes = (nodes: PositionTreeNode[]) => {
    nodes.sort((a, b) => a.name.localeCompare(b.name));
    nodes.forEach(n => sortNodes(n.children));
  };
  sortNodes(roots);
  return roots;
}

export function getDepartmentPositionCount(
  departmentId: string,
  positions: Position[]
): number {
  return positions.filter(p => p.departmentId === departmentId).length;
}

export function getActiveAssignmentsForPosition(
  positionId: string,
  assignments: PositionAssignment[]
): PositionAssignment[] {
  return assignments.filter(
    a => a.positionId === positionId && a.status === 'active' && a.effectiveTo === null
  );
}

export function getPositionOccupants(
  positionId: string,
  assignments: PositionAssignment[],
  employees: Employee[]
): Employee[] {
  return getActiveAssignmentsForPosition(positionId, assignments)
    .map(a => employees.find(e => e.id === a.employeeId))
    .filter((e): e is Employee => Boolean(e));
}

export function getDepartmentHeadEmployee(
  departmentId: string,
  departments: Department[],
  positions: Position[],
  assignments: PositionAssignment[],
  employees: Employee[]
): { headPosition: Position | null; headEmployee: Employee | null } {
  const dept = departments.find(d => d.id === departmentId);
  if (!dept?.headPositionId) return { headPosition: null, headEmployee: null };

  const headPosition = positions.find(p => p.id === dept.headPositionId) ?? null;
  if (!headPosition) return { headPosition: null, headEmployee: null };

  const occupants = getPositionOccupants(dept.headPositionId, assignments, employees);
  return { headPosition, headEmployee: occupants[0] ?? null };
}

export function getEmployeeById(employees: Employee[], id: string): Employee | undefined {
  return employees.find(e => e.id === id);
}

export function getReportingManagerForEmployee(
  employeeId: string,
  positions: Position[],
  assignments: PositionAssignment[],
  employees: Employee[]
): ReportingManagerResult {
  const assignment = assignments.find(
    a => a.employeeId === employeeId && a.status === 'active' && a.effectiveTo === null
  );

  if (!assignment) {
    return { manager: null, unresolved: true, reason: 'No active position assignment' };
  }

  const position = positions.find(p => p.id === assignment.positionId);
  if (!position?.reportsToPositionId) {
    return { manager: null, unresolved: false, reason: 'No reporting manager' };
  }

  const parentPosition = positions.find(p => p.id === position.reportsToPositionId);
  if (!parentPosition) {
    return { manager: null, unresolved: true, reason: 'Parent position not found' };
  }

  if (parentPosition.type === 'pooled') {
    return { manager: null, unresolved: true, reason: 'Parent is a pooled position' };
  }

  if (parentPosition.status === 'inactive') {
    return { manager: null, unresolved: true, reason: 'Reporting manager unresolved' };
  }

  const parentAssignments = getActiveAssignmentsForPosition(parentPosition.id, assignments);
  if (parentAssignments.length === 0) {
    return { manager: null, unresolved: true, reason: 'Reporting manager unresolved' };
  }

  const manager = getEmployeeById(employees, parentAssignments[0].employeeId);
  if (!manager) {
    return { manager: null, unresolved: true, reason: 'Reporting manager unresolved' };
  }

  return { manager, unresolved: false };
}

export function wouldCreateDepartmentCycle(
  departmentId: string,
  newParentDepartmentId: string | null,
  departments: Department[]
): boolean {
  if (!newParentDepartmentId) return false;
  if (departmentId === newParentDepartmentId) return true;

  let current: string | null = newParentDepartmentId;
  const visited = new Set<string>();

  while (current) {
    if (current === departmentId) return true;
    if (visited.has(current)) return false;
    visited.add(current);
    current = departments.find(d => d.id === current)?.parentDepartmentId ?? null;
  }

  return false;
}

export function canSetDepartmentParent(
  departmentId: string | null,
  newParentDepartmentId: string | null,
  departments: Department[]
): { ok: boolean; error?: string } {
  if (!departmentId) {
    return { ok: true };
  }

  if (departmentId === newParentDepartmentId) {
    return { ok: false, error: 'A department cannot be its own parent.' };
  }

  if (wouldCreateDepartmentCycle(departmentId, newParentDepartmentId, departments)) {
    return { ok: false, error: 'This would create a circular department hierarchy.' };
  }

  return { ok: true };
}

export function isPositionDescendant(
  positionId: string,
  potentialAncestorId: string,
  positions: Position[]
): boolean {
  let current = positions.find(p => p.id === positionId);
  const visited = new Set<string>();

  while (current?.reportsToPositionId) {
    if (current.reportsToPositionId === potentialAncestorId) return true;
    if (visited.has(current.reportsToPositionId)) return false;
    visited.add(current.reportsToPositionId);
    current = positions.find(p => p.id === current!.reportsToPositionId);
  }

  return false;
}

export function wouldCreatePositionCycle(
  positionId: string,
  newReportsToPositionId: string | null,
  positions: Position[]
): boolean {
  if (!newReportsToPositionId) return false;
  if (positionId === newReportsToPositionId) return true;
  return isPositionDescendant(newReportsToPositionId, positionId, positions);
}

export function canMovePosition(
  positionId: string,
  newReportsToPositionId: string | null,
  positions: Position[]
): { ok: boolean; error?: string } {
  if (positionId === newReportsToPositionId) {
    return { ok: false, error: 'Cannot drop a position onto itself.' };
  }

  if (!newReportsToPositionId) {
    return { ok: true };
  }

  const target = positions.find(p => p.id === newReportsToPositionId);
  if (!target) {
    return { ok: false, error: 'Target position not found.' };
  }

  if (target.type === 'pooled') {
    return { ok: false, error: 'Pooled positions cannot be reporting manager targets.' };
  }

  if (target.status === 'inactive') {
    return { ok: false, error: 'Inactive positions cannot be reporting targets.' };
  }

  if (wouldCreatePositionCycle(positionId, newReportsToPositionId, positions)) {
    return { ok: false, error: 'Cannot create a circular reporting chain.' };
  }

  return { ok: true };
}

export function canAssignEmployeeToPosition(
  employeeId: string,
  positionId: string,
  positions: Position[],
  assignments: PositionAssignment[]
): { ok: boolean; error?: string } {
  const position = positions.find(p => p.id === positionId);
  if (!position) return { ok: false, error: 'Position not found.' };
  if (position.status === 'inactive') {
    return { ok: false, error: 'Cannot assign to an inactive position.' };
  }

  const existing = assignments.find(
    a =>
      a.employeeId === employeeId &&
      a.positionId === positionId &&
      a.status === 'active' &&
      a.effectiveTo === null
  );
  if (existing) {
    return { ok: false, error: 'Employee is already assigned to this position.' };
  }

  const activeCount = getActiveAssignmentsForPosition(positionId, assignments).length;
  const capacity = position.type === 'unique' ? 1 : position.capacity;

  if (activeCount >= capacity) {
    return {
      ok: false,
      error:
        position.type === 'unique'
          ? 'Unique positions allow only one active employee.'
          : `Pooled position is at capacity (${capacity}).`
    };
  }

  return { ok: true };
}

export function getPositionOccupancy(
  positionId: string,
  position: Position,
  assignments: PositionAssignment[]
): { count: number; capacity: number; isFull: boolean } {
  const count = getActiveAssignmentsForPosition(positionId, assignments).length;
  const capacity = position.type === 'unique' ? 1 : position.capacity;
  return { count, capacity, isFull: count >= capacity };
}

export function getDepartmentName(
  departmentId: string,
  departments: { id: string; name: string }[]
): string {
  return departments.find(d => d.id === departmentId)?.name ?? '—';
}

export function getChildren(positionId: string, positions: Position[]): Position[] {
  return positions.filter(p => p.reportsToPositionId === positionId);
}

export function getRootPositions(positions: Position[]): Position[] {
  return positions.filter(p => p.reportsToPositionId === null);
}

export function hasChildPositions(positionId: string, positions: Position[]): boolean {
  return positions.some(p => p.reportsToPositionId === positionId);
}

export function isDepartmentCodeUnique(
  code: string,
  departments: Department[],
  excludeId?: string
): boolean {
  const normalized = code.trim().toUpperCase();
  return !departments.some(
    d => d.id !== excludeId && d.code.trim().toUpperCase() === normalized
  );
}

export function isPositionCodeUnique(
  code: string,
  positions: Position[],
  excludeId?: string
): boolean {
  const normalized = code.trim().toUpperCase();
  return !positions.some(
    p => p.id !== excludeId && p.code.trim().toUpperCase() === normalized
  );
}

export function getValidHeadPositions(
  departmentId: string,
  positions: Position[]
): Position[] {
  return positions.filter(
    p =>
      p.departmentId === departmentId &&
      p.type === 'unique' &&
      p.status === 'active'
  );
}

export function getValidReportingTargets(
  positionId: string | null,
  positions: Position[]
): Position[] {
  return positions.filter(
    p =>
      p.id !== positionId &&
      p.type === 'unique' &&
      p.status === 'active'
  );
}

export function canChangePositionToPooled(
  positionId: string,
  positions: Position[]
): { ok: boolean; error?: string } {
  if (hasChildPositions(positionId, positions)) {
    return {
      ok: false,
      error: 'Cannot change to pooled while other positions report to this position.'
    };
  }
  return { ok: true };
}

export function createId(prefix: string): string {
  return `${prefix}-${crypto.randomUUID().slice(0, 8)}`;
}

export interface TreeLayoutNode {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
}

const NODE_WIDTH = 240;
const NODE_HEIGHT = 160;
const H_GAP = 48;
const V_GAP = 90;

interface LayoutTree {
  position: Position;
  children: LayoutTree[];
  width: number;
}

function buildLayoutTree(
  position: Position,
  positions: Position[],
  collapsedIds: Set<string>
): LayoutTree {
  const children = collapsedIds.has(position.id)
    ? []
    : getChildren(position.id, positions).map(child =>
        buildLayoutTree(child, positions, collapsedIds)
      );

  const childWidth =
    children.length === 0
      ? NODE_WIDTH
      : children.reduce((sum, c) => sum + c.width, 0) + H_GAP * (children.length - 1);

  return {
    position,
    children,
    width: Math.max(NODE_WIDTH, childWidth)
  };
}

function assignCoordinates(
  tree: LayoutTree,
  x: number,
  y: number,
  nodes: TreeLayoutNode[]
): void {
  const nodeX = x + tree.width / 2 - NODE_WIDTH / 2;
  nodes.push({ id: tree.position.id, x: nodeX, y, width: NODE_WIDTH, height: NODE_HEIGHT });

  if (tree.children.length === 0) return;

  let childX = x;
  const childY = y + NODE_HEIGHT + V_GAP;

  for (const child of tree.children) {
    assignCoordinates(child, childX, childY, nodes);
    childX += child.width + H_GAP;
  }
}

export function computeTreeLayout(
  positions: Position[],
  collapsedIds: Set<string>
): { nodes: TreeLayoutNode[]; edges: { source: string; target: string }[] } {
  const roots = getRootPositions(positions);
  const nodes: TreeLayoutNode[] = [];
  const edges: { source: string; target: string }[] = [];

  let offsetX = 0;
  for (const root of roots) {
    const tree = buildLayoutTree(root, positions, collapsedIds);
    assignCoordinates(tree, offsetX, 0, nodes);
    offsetX += tree.width + H_GAP * 2;
  }

  for (const pos of positions) {
    if (pos.reportsToPositionId && !collapsedIds.has(pos.reportsToPositionId)) {
      const ancestorHidden = (() => {
        let current: string | null = pos.reportsToPositionId;
        while (current) {
          if (collapsedIds.has(current)) return true;
          current = positions.find(p => p.id === current)?.reportsToPositionId ?? null;
        }
        return false;
      })();

      if (!ancestorHidden) {
        edges.push({ source: pos.reportsToPositionId, target: pos.id });
      }
    }
  }

  return { nodes, edges };
}

export function getVisiblePositions(
  positions: Position[],
  collapsedIds: Set<string>
): Position[] {
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

  return positions.filter(p => !hidden.has(p.id));
}

export { NODE_WIDTH, NODE_HEIGHT };
