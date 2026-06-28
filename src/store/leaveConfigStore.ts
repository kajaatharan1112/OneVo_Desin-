import { create } from 'zustand';
import type {
  EntitlementAuditEntry,
  GeneratePreviewRow,
  LeaveEntitlement,
  LeavePolicy,
  LeavePolicyFormState,
  LeaveType,
  LeaveTypeFormState,
  PolicyScope
} from '../features/leave/configuration/leaveConfigTypes';
import {
  SEED_ENTITLEMENTS,
  SEED_LEAVE_POLICIES,
  SEED_LEAVE_TYPES
} from '../features/leave/configuration/leaveConfigMockData';
import { detectPolicyConflict, matchPolicyForEmployee } from '../features/leave/configuration/leaveConfigUtils';
import { useOrganizationStore } from './organizationStore';

const createId = (prefix: string) =>
  `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;

interface GenerateScope {
  year: number;
  scope: PolicyScope | 'all';
  departmentId?: string | null;
  positionId?: string | null;
}

interface LeaveConfigState {
  leaveTypes: LeaveType[];
  policies: LeavePolicy[];
  entitlements: LeaveEntitlement[];
  auditLog: EntitlementAuditEntry[];
  leaveTypeForm: LeaveTypeFormState;
  policyForm: LeavePolicyFormState;
  toast: string | null;

  openCreateLeaveType: () => void;
  openEditLeaveType: (id: string) => void;
  closeLeaveTypeForm: () => void;
  saveLeaveType: (data: Omit<LeaveType, 'id'> & { id?: string }) => void;
  deleteLeaveType: (id: string) => void;

  openCreatePolicy: () => void;
  openEditPolicy: (id: string) => void;
  closePolicyForm: () => void;
  savePolicy: (data: Omit<LeavePolicy, 'id'> & { id?: string }) => { ok: boolean; error?: string };
  deletePolicy: (id: string) => void;

  buildGeneratePreview: (opts: GenerateScope) => GeneratePreviewRow[];
  generateEntitlements: (opts: GenerateScope) => { created: number; skipped: number; missing: number };
  recalculateEntitlements: (year: number) => number;
  adjustEntitlement: (
    entitlementId: string,
    totalValue: number,
    reason: string,
    changedBy?: string
  ) => boolean;

  showToast: (msg: string) => void;
  clearToast: () => void;
}

function getOrgContext() {
  const { employees, departments, positions, assignments } = useOrganizationStore.getState();
  return { employees, departments, positions, assignments };
}

function employeeName(emp: { firstName: string; lastName: string }) {
  return `${emp.firstName} ${emp.lastName}`;
}

function employeesInScope(
  scope: GenerateScope['scope'],
  departmentId?: string | null,
  positionId?: string | null
) {
  const { employees, assignments, positions } = getOrgContext();
  const active = employees.filter(e => e.status === 'active');

  if (scope === 'all' || scope === 'company') return active;

  if (scope === 'position' && positionId) {
    const ids = new Set(
      assignments
        .filter(a => a.positionId === positionId && a.status === 'active' && !a.effectiveTo)
        .map(a => a.employeeId)
    );
    return active.filter(e => ids.has(e.id));
  }

  if (scope === 'department' && departmentId) {
    const posIds = new Set(positions.filter(p => p.departmentId === departmentId).map(p => p.id));
    const ids = new Set(
      assignments
        .filter(a => posIds.has(a.positionId) && a.status === 'active' && !a.effectiveTo)
        .map(a => a.employeeId)
    );
    return active.filter(e => ids.has(e.id));
  }

  return active;
}

export const useLeaveConfigStore = create<LeaveConfigState>((set, get) => ({
  leaveTypes: SEED_LEAVE_TYPES,
  policies: SEED_LEAVE_POLICIES,
  entitlements: SEED_ENTITLEMENTS,
  auditLog: [],
  leaveTypeForm: { open: false, mode: 'create', leaveTypeId: null },
  policyForm: { open: false, mode: 'create', policyId: null },
  toast: null,

  openCreateLeaveType: () =>
    set({ leaveTypeForm: { open: true, mode: 'create', leaveTypeId: null } }),
  openEditLeaveType: (id) =>
    set({ leaveTypeForm: { open: true, mode: 'edit', leaveTypeId: id } }),
  closeLeaveTypeForm: () =>
    set({ leaveTypeForm: { open: false, mode: 'create', leaveTypeId: null } }),

  saveLeaveType: (data) => {
    if (data.id) {
      set(s => ({
        leaveTypes: s.leaveTypes.map(t => (t.id === data.id ? { ...t, ...data, id: data.id! } : t))
      }));
      get().showToast('Leave type updated.');
      return;
    }
    const id = createId('lt');
    set(s => ({
      leaveTypes: [...s.leaveTypes, { ...data, id, status: data.active ? 'active' : 'inactive' }]
    }));
    get().showToast('Leave type created.');
  },

  deleteLeaveType: (id) => {
    set(s => ({ leaveTypes: s.leaveTypes.filter(t => t.id !== id) }));
    get().showToast('Leave type removed.');
  },

  openCreatePolicy: () =>
    set({ policyForm: { open: true, mode: 'create', policyId: null } }),
  openEditPolicy: (id) =>
    set({ policyForm: { open: true, mode: 'edit', policyId: id } }),
  closePolicyForm: () =>
    set({ policyForm: { open: false, mode: 'create', policyId: null } }),

  savePolicy: (data) => {
    const { departments, positions } = getOrgContext();
    const conflict = detectPolicyConflict(
      {
        id: data.id,
        leaveTypeId: data.leaveTypeId,
        status: data.status,
        appliesTo: data.appliesTo,
        departmentIds: data.departmentIds,
        positionIds: data.positionIds,
        effectiveFrom: data.effectiveFrom
      },
      get().policies,
      departments,
      positions,
      get().leaveTypes
    );
    if (conflict) {
      return { ok: false, error: conflict.message };
    }

    if (data.id) {
      set(s => ({
        policies: s.policies.map(p => (p.id === data.id ? { ...p, ...data, id: data.id! } : p))
      }));
      get().showToast('Leave policy updated.');
      return { ok: true };
    }
    const id = createId('lp');
    set(s => ({ policies: [...s.policies, { ...data, id }] }));
    get().showToast('Leave policy created.');
    return { ok: true };
  },

  deletePolicy: (id) => {
    set(s => ({ policies: s.policies.filter(p => p.id !== id) }));
    get().showToast('Leave policy removed.');
  },

  buildGeneratePreview: (opts) => {
    const { leaveTypes, policies } = get();
    const { departments, positions, assignments } = getOrgContext();
    const rows: GeneratePreviewRow[] = [];
    const targetEmployees = employeesInScope(opts.scope, opts.departmentId, opts.positionId);
    const activeTypes = leaveTypes.filter(t => t.active && t.status === 'active');

    for (const emp of targetEmployees) {
      const assignment = assignments.find(
        a => a.employeeId === emp.id && a.status === 'active' && !a.effectiveTo
      );
      const position = assignment
        ? positions.find(p => p.id === assignment.positionId)
        : undefined;
      const dept = position
        ? departments.find(d => d.id === position.departmentId)
        : undefined;

      for (const lt of activeTypes) {
        // Gender filter check
        const empGender = emp.gender || 'male'; // fallback to male/female if undefined, or check if matches
        if (lt.genderApplicability && lt.genderApplicability !== 'all' && empGender !== lt.genderApplicability) {
          continue; // completely skip listing or generating if gender doesn't match
        }

        const existing = get().entitlements.find(
          e => e.employeeId === emp.id && e.leaveTypeId === lt.id && e.year === opts.year
        );
        if (existing) {
          rows.push({
            employeeId: emp.id,
            employeeName: employeeName(emp),
            departmentName: dept?.name ?? '—',
            positionName: position?.name ?? '—',
            leaveTypeName: lt.name,
            policyName: existing.policyName,
            days: existing.totalValue, // keep property 'days' in GeneratePreviewRow or rename it, let's keep it but store limitValue
            skipped: true,
            skipReason: 'Entitlement already exists'
          });
          continue;
        }

        const policy = matchPolicyForEmployee(emp.id, lt.id, policies, assignments, positions);
        if (!policy) {
          rows.push({
            employeeId: emp.id,
            employeeName: employeeName(emp),
            departmentName: dept?.name ?? '—',
            positionName: position?.name ?? '—',
            leaveTypeName: lt.name,
            policyName: null,
            days: 0,
            skipped: true,
            skipReason: 'Missing policy'
          });
          continue;
        }

        rows.push({
          employeeId: emp.id,
          employeeName: employeeName(emp),
          departmentName: dept?.name ?? '—',
          positionName: position?.name ?? '—',
          leaveTypeName: lt.name,
          policyName: policy.name,
          days: policy.limitValue,
          skipped: false
        });
      }
    }
    return rows;
  },

  generateEntitlements: (opts) => {
    const preview = get().buildGeneratePreview(opts);
    const toCreate = preview.filter(r => !r.skipped);
    const missing = preview.filter(r => r.skipped && r.skipReason === 'Missing policy').length;
    const skipped = preview.filter(r => r.skipped && r.skipReason !== 'Missing policy').length;
    const { policies, leaveTypes } = get();
    const { assignments, positions } = getOrgContext();
    const newEntitlements: LeaveEntitlement[] = [];
    const newAudit: EntitlementAuditEntry[] = [];

    for (const row of toCreate) {
      const lt = leaveTypes.find(t => t.name === row.leaveTypeName);
      if (!lt) continue;
      const policy = matchPolicyForEmployee(row.employeeId, lt.id, policies, assignments, positions);
      const id = createId('ent');
      const total = policy?.limitValue ?? 0;
      const unit = policy?.limitUnit ?? 'hours';
      const period = policy?.limitPeriod ?? 'yearly';
      newEntitlements.push({
        id,
        employeeId: row.employeeId,
        leaveTypeId: lt.id,
        policyId: policy?.id ?? null,
        policyName: policy?.name ?? null,
        year: opts.year,
        totalValue: total,
        usedValue: 0,
        pendingValue: 0,
        remainingValue: total,
        limitUnit: unit,
        limitPeriod: period,
        source: 'generated',
        status: policy ? 'active' : 'missing-policy'
      });
      newAudit.push({
        id: createId('aud'),
        entitlementId: id,
        date: new Date().toISOString(),
        employeeId: row.employeeId,
        leaveTypeId: lt.id,
        changeType: 'Generated',
        daysChanged: total,
        balanceAfter: total,
        reason: `Generated from policy: ${policy?.name ?? 'N/A'}`,
        changedBy: 'System'
      });
    }

    set(s => ({
      entitlements: [...s.entitlements, ...newEntitlements],
      auditLog: [...s.auditLog, ...newAudit]
    }));
    get().showToast(`Generated ${newEntitlements.length} entitlements.`);
    return { created: newEntitlements.length, skipped, missing };
  },

  recalculateEntitlements: (year) => {
    const { policies } = get();
    const { assignments, positions } = getOrgContext();
    let updated = 0;
    const newAudit: EntitlementAuditEntry[] = [];

    set(s => ({
      entitlements: s.entitlements.map(ent => {
        if (ent.year !== year || ent.source !== 'generated') return ent;
        const policy = matchPolicyForEmployee(
          ent.employeeId,
          ent.leaveTypeId,
          policies,
          assignments,
          positions
        );
        if (!policy) return ent;
        const newTotal = policy.limitValue;
        if (newTotal === ent.totalValue) return ent;
        updated += 1;
        const remaining = newTotal - ent.usedValue - ent.pendingValue;
        newAudit.push({
          id: createId('aud'),
          entitlementId: ent.id,
          date: new Date().toISOString(),
          employeeId: ent.employeeId,
          leaveTypeId: ent.leaveTypeId,
          changeType: 'Recalculated',
          daysChanged: newTotal - ent.totalValue,
          balanceAfter: remaining,
          reason: `Recalculated from policy: ${policy.name}`,
          changedBy: 'System'
        });
        return {
          ...ent,
          totalValue: newTotal,
          remainingValue: remaining,
          limitUnit: policy.limitUnit,
          limitPeriod: policy.limitPeriod,
          policyId: policy.id,
          policyName: policy.name
        };
      }),
      auditLog: [...s.auditLog, ...newAudit]
    }));
    get().showToast(`Recalculated ${updated} entitlements.`);
    return updated;
  },

  adjustEntitlement: (entitlementId, totalValue, reason, changedBy = 'HR Admin') => {
    if (!reason.trim()) return false;
    let ok = false;
    set(s => {
      const ent = s.entitlements.find(e => e.id === entitlementId);
      if (!ent) return s;
      ok = true;
      const remaining = totalValue - ent.usedValue - ent.pendingValue;
      const audit: EntitlementAuditEntry = {
        id: createId('aud'),
        entitlementId,
        date: new Date().toISOString(),
        employeeId: ent.employeeId,
        leaveTypeId: ent.leaveTypeId,
        changeType: 'Manual Adjustment',
        daysChanged: totalValue - ent.totalValue,
        balanceAfter: remaining,
        reason: reason.trim(),
        changedBy
      };
      return {
        entitlements: s.entitlements.map(e =>
          e.id === entitlementId
            ? { ...e, totalValue, remainingValue: remaining, source: 'manual' as const }
            : e
        ),
        auditLog: [...s.auditLog, audit]
      };
    });
    if (ok) get().showToast('Entitlement adjusted.');
    return ok;
  },

  showToast: (msg) => set({ toast: msg }),
  clearToast: () => set({ toast: null })
}));
