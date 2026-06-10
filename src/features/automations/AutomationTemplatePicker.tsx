import React from 'react';
import { FileText, UserPlus, Calendar, Clock, FileWarning, Briefcase, UserMinus } from 'lucide-react';
import { TEMPLATES } from './automationMockData';

const ICONS: Record<string, React.ReactNode> = {
  blank: <FileText size={20} />,
  onboarding: <UserPlus size={20} />,
  leave: <Calendar size={20} />,
  attendance: <Clock size={20} />,
  document: <FileWarning size={20} />,
  position: <Briefcase size={20} />,
  offboarding: <UserMinus size={20} />
};

interface AutomationTemplatePickerProps {
  onSelect: (templateId: string) => void;
  embedded?: boolean;
}

export const AutomationTemplatePicker: React.FC<AutomationTemplatePickerProps> = ({ onSelect, embedded = false }) => (
  <div className={`auto-template-picker${embedded ? ' auto-template-picker--embedded' : ''}`}>
    <h2 className="auto-template-picker__title">{embedded ? 'Create a new automation' : 'Choose how to start'}</h2>
    <p className="auto-template-picker__subtitle">
      {embedded ? 'Pick a template below or start from scratch' : 'Pick a template or start from scratch'}
    </p>
    <div className="auto-template-grid">
      {TEMPLATES.map(t => (
        <button key={t.id} type="button" className="auto-template-card" onClick={() => onSelect(t.id)}>
          <span className="auto-template-card__icon">{ICONS[t.id] ?? <FileText size={20} />}</span>
          <span className="auto-template-card__name">{t.name}</span>
          <span className="auto-template-card__desc">{t.description}</span>
        </button>
      ))}
    </div>
  </div>
);
