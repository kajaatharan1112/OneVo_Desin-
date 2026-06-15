import type {
  ClockInExemption,
  ExemptionFormValues,
  ExemptionScope,
  OutageFormValues
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

export function computeOutageTimes(values: OutageFormValues): {
  startsAt: string;
  endsAt: string;
} | null {
  const now = new Date();
  let startsAt: Date;

  if (values.startsMode === 'now') {
    startsAt = now;
  } else {
    if (!values.startsAt) return null;
    startsAt = new Date(values.startsAt);
  }

  let endsAt: Date;
  switch (values.endsMode) {
    case '1h':
      endsAt = new Date(startsAt.getTime() + 60 * 60 * 1000);
      break;
    case '4h':
      endsAt = new Date(startsAt.getTime() + 4 * 60 * 60 * 1000);
      break;
    case 'eod': {
      endsAt = new Date(startsAt);
      endsAt.setHours(23, 59, 0, 0);
      break;
    }
    case 'custom':
      if (!values.endsAt) return null;
      endsAt = new Date(values.endsAt);
      break;
    default:
      return null;
  }

  const toLocalIso = (d: Date) => {
    const pad = (n: number) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  };

  return { startsAt: toLocalIso(startsAt), endsAt: toLocalIso(endsAt) };
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
  if (!values.location.trim()) return 'Affected office/location is required.';
  if (!values.reason.trim()) return 'Outage reason is required.';
  if (values.startsMode === 'on-datetime' && !values.startsAt) {
    return 'Select a start date and time.';
  }
  if (values.endsMode === 'custom' && !values.endsAt) {
    return 'Select an end date and time.';
  }
  const times = computeOutageTimes(values);
  if (!times) return 'Unable to compute outage window.';
  if (new Date(times.endsAt) <= new Date(times.startsAt)) {
    return 'End time must be after start time.';
  }
  return null;
}
