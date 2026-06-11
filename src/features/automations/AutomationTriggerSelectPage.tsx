import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useAutomationStore } from '../../store/automationStore';
import { AutomationTriggerPicker } from './AutomationTriggerPicker';

export const AutomationTriggerSelectPage: React.FC = () => {
  const navigate = useNavigate();
  const createBlankWithTrigger = useAutomationStore(s => s.createBlankWithTrigger);

  return (
    <div className="auto-trigger-select-page">
      <header className="auto-trigger-select-page__header">
        <button
          type="button"
          className="cfg-icon-btn auto-trigger-select-page__back"
          onClick={() => navigate('/automations')}
          title="Back to Automations"
        >
          <ArrowLeft size={14} />
        </button>
        <span className="auto-trigger-select-page__heading">New automation</span>
        <span className="cfg-badge cfg-badge--draft">draft</span>
      </header>

      <main className="auto-trigger-select-page__main">
        <AutomationTriggerPicker
          variant="page"
          title="Choose what starts this automation"
          subtitle="Select one event to begin building the flow."
          onSelect={key => {
            const id = createBlankWithTrigger(key);
            navigate(`/automations/${id}`);
          }}
        />
      </main>
    </div>
  );
};
