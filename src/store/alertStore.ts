import { create } from 'zustand';
import type { AlertInstance, AlertInstanceStatus, AlertRule } from '../types/alert';

const now = () => new Date().toISOString();

const SEED_ALERTS: AlertInstance[] = [
  { id: 'al-1', title: 'Repeated late check-in', severity: 'medium', category: 'Attendance', source: 'Attendance Monitor', target: 'Alex Rivera / Engineering', assignedTo: 'Reporting Manager', status: 'open', createdAt: '2026-06-08T08:15:00Z', slaRemaining: '18h 30m' },
  { id: 'al-2', title: 'High idle activity detected', severity: 'high', category: 'Monitoring', source: 'Workforce Monitoring', target: 'Team B / Backend', assignedTo: 'HR Admin', status: 'escalated', createdAt: '2026-06-07T14:00:00Z', slaRemaining: 'Overdue' },
  { id: 'al-3', title: 'Missing onboarding document', severity: 'medium', category: 'Employee Lifecycle', source: 'New Employee Onboarding', target: 'Jordan Lee / Sales', assignedTo: 'HR Admin', status: 'open', createdAt: '2026-06-09T07:00:00Z', slaRemaining: '2d 5h' },
  { id: 'al-4', title: 'Leave approval overdue', severity: 'high', category: 'Leave', source: 'Leave Request Approval', target: 'Sarah Chen / Marketing', assignedTo: 'Department Head', status: 'open', createdAt: '2026-06-06T10:00:00Z', slaRemaining: '4h 12m' },
  { id: 'al-5', title: 'Contract expiry within 14 days', severity: 'critical', category: 'Compliance', source: 'Document Expiry Monitor', target: 'Vendor Contract / Legal', assignedTo: 'Compliance Officer', status: 'acknowledged', createdAt: '2026-06-05T09:00:00Z', slaRemaining: '12d' }
];

const SEED_ALERT_RULES: AlertRule[] = [
  { id: 'arule-1', name: 'Repeated late check-ins', description: 'If employee is late 3 times in 7 days, create medium attendance alert.', category: 'Attendance', severity: 'medium', status: 'active', triggerCondition: 'Late check-in count >= 3 in 7 days', targetScope: 'Employee', notificationChannels: ['In-app', 'Email'], escalationWorkflowId: 'wf-4', createdAt: '2025-10-01T10:00:00Z', updatedAt: '2026-01-15T10:00:00Z' },
  { id: 'arule-2', name: 'High monitoring severity', description: 'If monitoring severity is high, create high alert and notify HR.', category: 'Monitoring', severity: 'high', status: 'active', triggerCondition: 'Monitoring severity = high', targetScope: 'Department', notificationChannels: ['Slack', 'Email'], escalationWorkflowId: 'wf-4', createdAt: '2025-11-10T10:00:00Z', updatedAt: '2026-02-01T10:00:00Z' },
  { id: 'arule-3', name: 'Approval pending escalation', description: 'If approval is pending over 48 hours, escalate to department head.', category: 'Leave', severity: 'high', status: 'active', triggerCondition: 'Approval pending > 48 hours', targetScope: 'Approval request', notificationChannels: ['In-app'], escalationWorkflowId: 'wf-2', createdAt: '2025-12-01T10:00:00Z', updatedAt: '2026-03-01T10:00:00Z' },
  { id: 'arule-4', name: 'Document expiry warning', description: 'If document expires within 14 days, create compliance alert.', category: 'Compliance', severity: 'critical', status: 'draft', triggerCondition: 'Document expiry <= 14 days', targetScope: 'Employee / Contract', notificationChannels: ['Email', 'Microsoft Teams'], escalationWorkflowId: null, createdAt: '2026-01-20T10:00:00Z', updatedAt: '2026-04-10T10:00:00Z' }
];

interface AlertStore {
  alerts: AlertInstance[];
  alertRules: AlertRule[];
  selectedAlertId: string | null;

  setSelectedAlertId: (id: string | null) => void;
  updateAlertStatus: (id: string, status: AlertInstanceStatus) => void;
  acknowledgeAlert: (id: string) => void;
  resolveAlert: (id: string) => void;
  escalateAlert: (id: string) => void;
  addAlertRule: (rule: Omit<AlertRule, 'id' | 'createdAt' | 'updatedAt'>) => string;
  updateAlertRule: (id: string, updates: Partial<AlertRule>) => void;
}

export const useAlertStore = create<AlertStore>((set) => ({
  alerts: SEED_ALERTS,
  alertRules: SEED_ALERT_RULES,
  selectedAlertId: null,

  setSelectedAlertId: (id) => set({ selectedAlertId: id }),

  updateAlertStatus: (id, status) => {
    set(s => ({
      alerts: s.alerts.map(a => (a.id === id ? { ...a, status } : a))
    }));
  },

  acknowledgeAlert: (id) => {
    set(s => ({
      alerts: s.alerts.map(a => (a.id === id ? { ...a, status: 'acknowledged' as const } : a))
    }));
  },

  resolveAlert: (id) => {
    set(s => ({
      alerts: s.alerts.map(a => (a.id === id ? { ...a, status: 'resolved' as const } : a))
    }));
  },

  escalateAlert: (id) => {
    set(s => ({
      alerts: s.alerts.map(a => (a.id === id ? { ...a, status: 'escalated' as const } : a))
    }));
  },

  addAlertRule: (rule) => {
    const id = `arule-${Date.now()}`;
    set(s => ({
      alertRules: [...s.alertRules, { ...rule, id, createdAt: now(), updatedAt: now() }]
    }));
    return id;
  },

  updateAlertRule: (id, updates) => {
    set(s => ({
      alertRules: s.alertRules.map(r =>
        r.id === id ? { ...r, ...updates, updatedAt: now() } : r
      )
    }));
  }
}));
