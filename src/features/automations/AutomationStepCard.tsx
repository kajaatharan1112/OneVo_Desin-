import React, { useMemo } from 'react';
import { Pencil, Trash2, Zap, GitBranch, Play, Shield, Bell, AlertTriangle, Clock, Square } from 'lucide-react';
import clsx from 'clsx';
import type { AutomationStep } from './automationTypes';
import { stepToSentence, stepTypeLabel } from './automationUtils';
import { STEP_MISMATCH_MESSAGE } from './automationContextRules';
import { ALERT_AFTER_APPROVAL_WARNING, isAlertImmediatelyAfterApproval } from './approvalStepUtils';
import { useOrganizationStore } from '../../store/organizationStore';
import { filterPositionOptions } from './alertAssignmentUtils';

const ICONS = {
  trigger: Zap,
  condition: GitBranch,
  action: Play,
  approval: Shield,
  notification: Bell,
  alert: AlertTriangle,
  delay: Clock,
  end: Square
};

interface AutomationStepCardProps {
  step: AutomationStep;
  steps?: AutomationStep[];
  triggerKey?: string;
  selected: boolean;
  invalid?: boolean;
  onSelect: () => void;
  onEdit: () => void;
  onDelete: () => void;
  canDelete?: boolean;
}

export const AutomationStepCard: React.FC<AutomationStepCardProps> = ({
  step,
  steps = [],
  triggerKey = '',
  selected,
  invalid = false,
  onSelect,
  onEdit,
  onDelete,
  canDelete = true
}) => {
  const Icon = ICONS[step.type];
  const { positions: orgPositions, employees: orgEmployees, departments: orgDepartments } = useOrganizationStore();

  const orgContext = useMemo(() => ({
    positions: filterPositionOptions(orgPositions.map(p => ({ id: p.id, name: p.name }))),
    employees: orgEmployees.map(e => ({
      id: e.id,
      name: `${e.firstName} ${e.lastName}`
    })),
    departments: orgDepartments.map(d => ({ id: d.id, name: d.name })),
    triggerKey
  }), [orgPositions, orgEmployees, orgDepartments, triggerKey]);

  return (
    <div
      className={clsx('auto-step-card', `auto-step-card--${step.type}`, selected && 'auto-step-card--selected', invalid && 'auto-step-card--invalid')}
      onClick={onSelect}
      role="button"
      tabIndex={0}
      onKeyDown={e => e.key === 'Enter' && onSelect()}
    >
      <div className="auto-step-card__header">
        <span className="auto-step-card__icon"><Icon size={14} /></span>
        <span className="auto-step-card__type">{stepTypeLabel(step.type)}</span>
        <div className="auto-step-card__actions" onClick={e => e.stopPropagation()}>
          <button type="button" className="cfg-icon-btn" title="Edit" onClick={onEdit}><Pencil size={12} /></button>
          {canDelete && step.type !== 'trigger' && (
            <button type="button" className="cfg-icon-btn" title="Delete" onClick={onDelete}><Trash2 size={12} /></button>
          )}
        </div>
      </div>
      <p className="auto-step-card__sentence">{stepToSentence(step, orgContext)}</p>
      {invalid && <p className="auto-step-card__warning">{STEP_MISMATCH_MESSAGE}</p>}
      {step.type === 'alert' && isAlertImmediatelyAfterApproval(steps, step.id) && (
        <p className="auto-step-card__warning">{ALERT_AFTER_APPROVAL_WARNING}</p>
      )}
    </div>
  );
};
