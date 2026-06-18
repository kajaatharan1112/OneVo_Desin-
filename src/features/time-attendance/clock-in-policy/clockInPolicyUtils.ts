import type {
  ClockInExemption,
  ExemptionFormValues,
  ExemptionScope,
  OutageFormValues,
  OutageScope
} from './clockInPolicyTypes';
import { useOrganizationStore } from '../../../store/organizationStore';

export function todayIsoDate(): string {
  const d = new Date();
  return d.toISOString().slice(0, 10);
}

export function formatPolicyDate(iso: string): string {
  const d = new Date(iso.includes('T') ? iso : iso + 'T00:00:00');
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export function formatOutageDateTime(iso: string): string {
  const d = new Date(iso);
  return d
    .toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    })
    .replace(',', '');
}

export function formatOutageRange(startsAt: string, endsAt: string): string {
  return `${formatOutageDateTime(startsAt)} - ${formatOutageDateTime(endsAt)}`;
}

export function chipStateLabel(on: boolean): string {
  return on ? 'on' : 'off';
}

export function webChipOn(web: string): boolean {
  return web === 'enabled' || web === 'optional';
}

export function photoChipLabel(value: string): string {
  if (value === 'yes') return 'on';
  if (value === 'optional') return 'optional';
  return 'off';
}

export function clockInRequirementSummary(value: 'exempt' | 'required'): string {
  return value === 'exempt' ? 'Clock-in not required' : 'Clock-in required';
}

export function scopeLabel(scope: ExemptionScope): string {
  switch (scope) {
    case 'employee':
      return 'Employee';
    case 'department':
      return 'Department';
    case 'position':
      return 'Position';
    default:
      return scope;
  }
}

export function exemptionScopeSummary(exemption: ClockInExemption): string {
  return `${scopeLabel(exemption.scope)} · ${exemption.appliesToLabel}`;
}

export function exemptionPeriodSummary(exemption: ClockInExemption): string {
  const start = exemption.startsImmediately
    ? 'Starts immediately'
    : `Starts ${formatPolicyDate(exemption.effectiveFrom)}`;
  const end = exemption.effectiveTo
    ? `Ends ${formatPolicyDate(exemption.effectiveTo)}`
    : 'No end date';
  return `${start} · ${end}`;
}

export function buildAppliesToLabel(
  scope: ExemptionScope,
  employeeIds: string[],
  departmentIds: string[],
  positionIds: string[]
): string {
  const { employees, departments, positions } = useOrganizationStore.getState();

  if (scope === 'employee') {
    return employeeIds
      .map(id => {
        const emp = employees.find(e => e.id === id);
        return emp ? `${emp.firstName} ${emp.lastName}` : null;
      })
      .filter(Boolean)
      .join(', ');
  }
  if (scope === 'department') {
    return departmentIds
      .map(id => departments.find(d => d.id === id)?.name)
      .filter(Boolean)
      .join(', ');
  }
  return positionIds
    .map(id => positions.find(p => p.id === id)?.name)
    .filter(Boolean)
    .join(', ');
}

export function buildOutageAppliesToLabel(
  scope: OutageScope,
  employeeIds: string[],
  departmentIds: string[],
  positionIds: string[]
): string {
  if (scope === 'company') return 'Entire company';
  return buildAppliesToLabel(scope, employeeIds, departmentIds, positionIds);
}

export function resolveExemptionDates(values: ExemptionFormValues): {
  effectiveFrom: string;
  effectiveTo: string | null;
  startsImmediately: boolean;
} {
  const effectiveFrom =
    values.startsMode === 'immediately' ? todayIsoDate() : values.effectiveFrom;
  const effectiveTo =
    values.endsMode === 'no-end' ? null : values.effectiveTo || null;
  return {
    effectiveFrom,
    effectiveTo,
    startsImmediately: values.startsMode === 'immediately'
  };
}

export function resolveOutageTimes(values: OutageFormValues): {
  startsAt: string;
  endsAt: string;
} | null {
  if (!values.startDate || !values.startTime || !values.endDate || !values.endTime) return null;
  return {
    startsAt: `${values.startDate}T${values.startTime}`,
    endsAt: `${values.endDate}T${values.endTime}`
  };
}

export function validateExemptionForm(values: ExemptionFormValues): string | null {
  if (!values.name.trim()) return 'Exemption name is required.';
  if (values.startsMode === 'on-date' && !values.effectiveFrom) {
    return 'Select a start date.';
  }
  if (values.endsMode === 'on-date' && !values.effectiveTo) {
    return 'Select an end date.';
  }
  if (values.scope === 'employee' && values.employeeIds.length === 0) {
    return 'Select at least one employee.';
  }
  if (values.scope === 'department' && values.departmentIds.length === 0) {
    return 'Select at least one department.';
  }
  if (values.scope === 'position' && values.positionIds.length === 0) {
    return 'Select at least one position.';
  }
  if (values.endsMode === 'on-date' && values.startsMode === 'on-date') {
    if (values.effectiveTo < values.effectiveFrom) {
      return 'End date must be after start date.';
    }
  }
  return null;
}

export function validateOutageForm(values: OutageFormValues): string | null {
  if (values.scope === 'department' && values.departmentIds.length === 0) {
    return 'Select at least one department.';
  }
  if (values.scope === 'position' && values.positionIds.length === 0) {
    return 'Select at least one position.';
  }
  if (values.scope === 'employee' && values.employeeIds.length === 0) {
    return 'Select at least one employee.';
  }
  if (!values.reason.trim()) return 'Outage reason is required.';
  if (!values.startDate || !values.startTime) return 'Start date/time is required.';
  if (!values.endDate || !values.endTime) return 'End date/time is required.';
  const times = resolveOutageTimes(values);
  if (!times) return 'Unable to compute outage window.';
  if (new Date(times.endsAt) <= new Date(times.startsAt)) {
    return 'End date/time must be after start date/time.';
  }
  return null;
}
