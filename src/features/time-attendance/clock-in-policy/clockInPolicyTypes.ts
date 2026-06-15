export type ClockInRequirement = 'required' | 'not-required';

export type MethodState = 'enabled' | 'disabled' | 'optional';

export type PhotoRequired = 'no' | 'yes' | 'optional';

/** Aligns with employee profile Work Mode — Clock-in Policy reads this, does not assign it. */
export type PolicyWorkMode = 'onsite' | 'remote' | 'hybrid' | 'field';

export type ExemptionScope = 'employee' | 'department' | 'position';

export type ExemptionClockIn = 'exempt' | 'required';

export type PolicyStatus = 'active' | 'inactive';

export interface WorkTypeRule {
  id: string;
  workMode: PolicyWorkMode;
  workType: string;
  biometric: boolean;
  web: MethodState;
  trayApp: boolean;
  photoRequired: PhotoRequired;
  notes: string;
}

export interface ClockInExemption {
  id: string;
  name: string;
  appliesToLabel: string;
  scope: ExemptionScope;
  employeeIds: string[];
  departmentIds: string[];
  positionIds: string[];
  clockInRequired: ExemptionClockIn;
  effectiveFrom: string;
  effectiveTo: string | null;
  startsImmediately: boolean;
  reason?: string;
  status: PolicyStatus;
}

export interface BiometricOutageFallback {
  id: string;
  location: string;
  reason: string;
  startsAt: string;
  endsAt: string;
  status: PolicyStatus;
  enabledBy: string;
}

export interface OutageFallbackDraft {
  enabled: boolean;
  location: string;
  reason: string;
  startsAt: string;
  endsAt: string;
}

export type OutageStartsMode = 'now' | 'on-datetime';
export type OutageEndsMode = '1h' | '4h' | 'eod' | 'custom';

export interface OutageFormState {
  open: boolean;
}

export interface OutageFormValues {
  location: string;
  reason: string;
  startsMode: OutageStartsMode;
  startsAt: string;
  endsMode: OutageEndsMode;
  endsAt: string;
  status: PolicyStatus;
}

export const EMPTY_OUTAGE_FORM = (): OutageFormValues => ({
  location: '',
  reason: '',
  startsMode: 'now',
  startsAt: '',
  endsMode: '4h',
  endsAt: '',
  status: 'active'
});

export interface ManualCorrectionPolicy {
  allowRequests: boolean;
  requireManagerApproval: boolean;
  requireReason: boolean;
  allowAttachment: boolean;
}

export interface ExemptionFormState {
  open: boolean;
  mode: 'create' | 'edit';
  exemptionId: string | null;
}

export interface ExemptionFormValues {
  name: string;
  scope: ExemptionScope;
  employeeIds: string[];
  departmentIds: string[];
  positionIds: string[];
  clockInRequired: ExemptionClockIn;
  startsMode: 'immediately' | 'on-date';
  effectiveFrom: string;
  endsMode: 'no-end' | 'on-date';
  effectiveTo: string;
  reason: string;
  status: PolicyStatus;
}

export const EMPTY_EXEMPTION_FORM = (): ExemptionFormValues => ({
  name: '',
  scope: 'employee',
  employeeIds: [],
  departmentIds: [],
  positionIds: [],
  clockInRequired: 'exempt',
  startsMode: 'immediately',
  effectiveFrom: '',
  endsMode: 'no-end',
  effectiveTo: '',
  reason: '',
  status: 'active'
});

export interface ClockInPolicyState {
  defaultRequirement: ClockInRequirement;
  workTypeRules: WorkTypeRule[];
  exemptions: ClockInExemption[];
  outageFallbackEnabled: boolean;
  outageDraft: OutageFallbackDraft;
  outageFallbacks: BiometricOutageFallback[];
  outageForm: OutageFormState;
  manualCorrection: ManualCorrectionPolicy;
  exemptionForm: ExemptionFormState;
  toast: string | null;
}
