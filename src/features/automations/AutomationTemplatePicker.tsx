import React from 'react';
import { UserPlus, UserMinus, Calendar, Clock, Briefcase, Activity, FileText, ClipboardCheck } from 'lucide-react';
import { CREATE_AUTOMATION_CARDS } from './automationContextRules';
import type { TemplateId } from './automationTypes';

const ICONS: Record<TemplateId, React.ReactNode> = {
  blank: <FileText size={20} />,
  new_employee_setup: <UserPlus size={20} />,
  employee_offboarding: <UserMinus size={20} />,
  leave_request_approval: <Calendar size={20} />,
  attendance_correction_approval: <ClipboardCheck size={20} />,
  late_attendance_alert: <Clock size={20} />,
  position_change_check: <Briefcase size={20} />,
  monitoring_alert_escalation: <Activity size={20} />
};

interface AutomationTemplatePickerProps {
  onSelect: (templateId: TemplateId) => void;
}

export const AutomationTemplatePicker: React.FC<AutomationTemplatePickerProps> = ({ onSelect }) => (
  <section className="auto-list-create">
    <div className="auto-template-picker auto-template-picker--embedded">
      <h2 className="auto-template-picker__title">Create a new automation</h2>
      <p className="auto-template-picker__subtitle">Pick a template below or start from scratch</p>
      <div className="auto-template-grid">
        {CREATE_AUTOMATION_CARDS.map(card => (
          <button
            key={card.id}
            type="button"
            className="auto-template-card"
            onClick={() => onSelect(card.id)}
          >
            <span className="auto-template-card__icon">{ICONS[card.id]}</span>
            <span className="auto-template-card__name">{card.name}</span>
            <span className="auto-template-card__desc">{card.description}</span>
          </button>
        ))}
      </div>
    </div>
  </section>
);
