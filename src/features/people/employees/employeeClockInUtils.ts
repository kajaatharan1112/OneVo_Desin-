import type { ClockInExemption } from '../../time-attendance/clock-in-policy/clockInPolicyTypes';
import type { Employee, Position, PositionAssignment } from '../../../types/organization';

export interface ClockInResolution {
  required: boolean;
  source: 'default' | 'employee' | 'position' | 'department';
  sourceLabel: string;
}

export function resolveClockInRequirement(
  employee: Employee,
  positions: Position[],
  assignments: PositionAssignment[],
  exemptions: ClockInExemption[],
  defaultRequirement: 'required' | 'not-required'
): ClockInResolution {
  const assignment = assignments.find(
    a => a.employeeId === employee.id && a.status === 'active' && a.effectiveTo === null
  );
  const position = assignment
    ? positions.find(p => p.id === assignment.positionId) ?? null
    : null;

  const employeeExemption = exemptions.find(
    e =>
      e.status === 'active' &&
      e.scope === 'employee' &&
      e.employeeIds.includes(employee.id)
  );
  if (employeeExemption) {
    return {
      required: employeeExemption.clockInRequired === 'required',
      source: 'employee',
      sourceLabel: `Employee exemption (${employeeExemption.name})`
    };
  }

  if (position) {
    const positionExemption = exemptions.find(
      e =>
        e.status === 'active' &&
        e.scope === 'position' &&
        e.positionIds.includes(position.id)
    );
    if (positionExemption) {
      return {
        required: positionExemption.clockInRequired === 'required',
        source: 'position',
        sourceLabel: `Position exemption (${positionExemption.name})`
      };
    }
  }

  if (position) {
    const departmentExemption = exemptions.find(
      e =>
        e.status === 'active' &&
        e.scope === 'department' &&
        e.departmentIds.includes(position.departmentId)
    );
    if (departmentExemption) {
      return {
        required: departmentExemption.clockInRequired === 'required',
        source: 'department',
        sourceLabel: `Department exemption (${departmentExemption.name})`
      };
    }
  }

  return {
    required: defaultRequirement === 'required',
    source: 'default',
    sourceLabel: 'Default company policy'
  };
}
