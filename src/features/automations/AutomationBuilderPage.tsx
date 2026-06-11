import React, { useMemo } from 'react';
import { Navigate, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Play, Save, Pause, Zap } from 'lucide-react';
import { useAutomationStore } from '../../store/automationStore';
import { canActivate, validateAutomation } from './automationUtils';
import { AutomationChain } from './AutomationChain';
import { AutomationConfigPanel } from './AutomationConfigPanel';

export const AutomationBuilderPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isNew = id === 'new' || !id;

  const {
    getAutomation,
    updateAutomation,
    setAutomationStatus,
    selectedStepId,
    setSelectedStepId,
    addStepAfter,
    enableBranch,
    disableBranch,
    updateStep,
    deleteStep
  } = useAutomationStore();

  const automation = !isNew && id ? getAutomation(id) : undefined;

  const validationIssues = useMemo(
    () => (automation ? validateAutomation(automation) : []),
    [automation]
  );

  const selectedStep = useMemo(
    () => automation?.steps.find(s => s.id === selectedStepId) ?? null,
    [automation, selectedStepId]
  );

  const triggerKey = useMemo(
    () => automation?.steps.find(s => s.type === 'trigger')?.config.triggerKey ?? '',
    [automation]
  );

  if (isNew) {
    return <Navigate to="/automations" replace />;
  }

  if (!automation) {
    return (
      <div className="cfg-page__body">
        <p>Automation not found.</p>
        <button type="button" className="org-btn org-btn--secondary" onClick={() => navigate('/automations')}>
          Back to Automations
        </button>
      </div>
    );
  }

  return (
    <div className="auto-builder-page">
      <div className="auto-builder-topbar">
        <div className="builder-toolbar__left">
          <button type="button" className="cfg-icon-btn" onClick={() => navigate('/automations')} title="Back to Automations">
            <ArrowLeft size={14} />
          </button>
          <input
            className="builder-toolbar__name"
            value={automation.name}
            onChange={e => updateAutomation(automation.id, { name: e.target.value })}
          />
          <span className={`cfg-badge cfg-badge--${automation.status}`}>{automation.status}</span>
        </div>
        <div className="builder-toolbar__actions">
          <button type="button" className="org-btn org-btn--secondary" onClick={() => updateAutomation(automation.id, { status: 'draft' })}>
            <Save size={14} /> Save Draft
          </button>
          <button
            type="button"
            className="org-btn org-btn--ghost"
            onClick={() => updateAutomation(automation.id, {
              lastRunAt: new Date().toISOString(),
              runCount: automation.runCount + 1
            })}
          >
            <Play size={14} /> Test
          </button>
          {automation.status === 'active' ? (
            <button type="button" className="org-btn org-btn--secondary" onClick={() => setAutomationStatus(automation.id, 'paused')}>
              <Pause size={14} /> Pause
            </button>
          ) : (
            <button
              type="button"
              className="org-btn org-btn--primary"
              disabled={!canActivate(automation)}
              title={!canActivate(automation) ? 'Fix validation issues before activating' : undefined}
              onClick={() => setAutomationStatus(automation.id, 'active')}
            >
              <Zap size={14} /> Activate
            </button>
          )}
        </div>
      </div>

      <div className="auto-builder-body">
        <div className="auto-builder-center">
          <AutomationChain
            steps={automation.steps}
            triggerKey={triggerKey}
            selectedStepId={selectedStepId}
            onSelectStep={setSelectedStepId}
            onAddStep={(afterStepId, type, sectionId) => addStepAfter(automation.id, afterStepId, type, sectionId)}
            onEnableBranch={conditionId => enableBranch(automation.id, conditionId)}
            onDeleteStep={stepId => deleteStep(automation.id, stepId)}
          />
        </div>
        <AutomationConfigPanel
          automation={automation}
          selectedStep={selectedStep}
          validationIssues={validationIssues}
          onAutomationChange={updates => updateAutomation(automation.id, updates)}
          onStepConfigChange={(stepId, config) => updateStep(automation.id, stepId, { config })}
          onToggleElseBranch={(conditionStepId, enabled) => {
            if (enabled) enableBranch(automation.id, conditionStepId);
            else disableBranch(automation.id, conditionStepId);
          }}
        />
      </div>
    </div>
  );
};
