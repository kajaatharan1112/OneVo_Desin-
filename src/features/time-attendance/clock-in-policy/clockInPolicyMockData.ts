import type {
  BiometricOutageFallback,
  ClockInExemption,
  ManualCorrectionPolicy,
  OutageFallbackDraft,
  WorkTypeRule
} from './clockInPolicyTypes';

export const SEED_WORK_TYPE_RULES: WorkTypeRule[] = [
  {
    id: 'wt-onsite',
    workMode: 'onsite',
    workType: 'Onsite employees',
    biometric: true,
    web: 'disabled',
    trayApp: false,
    photoRequired: 'no',
    notes: 'Use biometric terminals unless fallback is active.'
  },
  {
    id: 'wt-remote',
    workMode: 'remote',
    workType: 'Remote employees',
    biometric: false,
    web: 'optional',
    trayApp: true,
    photoRequired: 'yes',
    notes: 'Use tray/web clock-in with photo verification.'
  },
  {
    id: 'wt-hybrid',
    workMode: 'hybrid',
    workType: 'Hybrid employees',
    biometric: true,
    web: 'optional',
    trayApp: true,
    photoRequired: 'yes',
    notes: 'Use biometric onsite and tray/web when remote.'
  },
  {
    id: 'wt-field',
    workMode: 'field',
    workType: 'Field employees',
    biometric: false,
    web: 'optional',
    trayApp: true,
    photoRequired: 'optional',
    notes: 'Use company-approved web or tray clock-in.'
  }
];

export const SEED_EXEMPTIONS: ClockInExemption[] = [
  {
    id: 'ex-exec',
    name: 'Executive exemption',
    appliesToLabel: 'CEO, CTO',
    scope: 'position',
    employeeIds: [],
    departmentIds: [],
    positionIds: ['pos-ceo', 'pos-cto'],
    clockInRequired: 'exempt',
    effectiveFrom: '2026-01-01',
    effectiveTo: null,
    startsImmediately: true,
    status: 'active'
  },
  {
    id: 'ex-board',
    name: 'Board advisor exemption',
    appliesToLabel: 'Ahmad Razif',
    scope: 'employee',
    employeeIds: ['emp-1'],
    departmentIds: [],
    positionIds: [],
    clockInRequired: 'exempt',
    effectiveFrom: '2026-01-01',
    effectiveTo: null,
    startsImmediately: false,
    status: 'active'
  }
];

export const SEED_OUTAGE_FALLBACKS: BiometricOutageFallback[] = [
  {
    id: 'out-colombo',
    appliesToLabel: 'Entire company',
    scope: 'company',
    employeeIds: [],
    departmentIds: [],
    positionIds: [],
    reason: 'Biometric terminal maintenance',
    startsAt: '2026-06-12T09:00',
    endsAt: '2026-06-12T18:00',
    status: 'active',
    enabledBy: 'Manesh'
  }
];

export const DEFAULT_MANUAL_CORRECTION: ManualCorrectionPolicy = {
  allowRequests: true,
  requireManagerApproval: true,
  requireReason: true,
  allowAttachment: true
};

export const DEFAULT_OUTAGE_DRAFT = (): OutageFallbackDraft => ({
  enabled: false,
  reason: '',
  startsAt: '',
  endsAt: ''
});
