import React, { useEffect, useMemo, useState } from 'react';

import { useNavigate, useParams } from 'react-router-dom';

import { ArrowLeft, Play, Save, Pause, Zap } from 'lucide-react';

import { useAutomationStore } from '../../store/automationStore';

import { useAutomationActivityStore } from '../../store/automationActivityStore';

import { useOrganizationStore } from '../../store/organizationStore';

import { filterPositionOptions } from './alertAssignmentUtils';

import type { DemoTriggerKey } from './automationContextRules';

import { canActivate, validateAutomation } from './automationUtils';

import { AutomationChain } from './AutomationChain';

import { AutomationChangeTriggerModal } from './AutomationChangeTriggerModal';

import { AutomationConfigPanel } from './AutomationConfigPanel';



export const AutomationBuilderPage: React.FC = () => {

  const { id } = useParams<{ id: string }>();

  const navigate = useNavigate();

  const [changeTriggerOpen, setChangeTriggerOpen] = useState(false);



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

  const simulateAutomationRun = useAutomationActivityStore(s => s.simulateAutomationRun);

  const { positions, employees } = useOrganizationStore();



  const automation = id && id !== 'new' ? getAutomation(id) : undefined;

  useEffect(() => {

    if (id === 'new') navigate('/automations/new', { replace: true });

  }, [id, navigate]);

  useEffect(() => {
    if (!automation) return;
    const stepExists = selectedStepId != null && automation.steps.some(s => s.id === selectedStepId);
    if (stepExists) return;
    const trigger = automation.steps.find(s => s.type === 'trigger');
    setSelectedStepId(trigger?.id ?? automation.steps[0]?.id ?? null);
  }, [automation, selectedStepId, setSelectedStepId]);



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



  const triggerStep = useMemo(

    () => automation?.steps.find(s => s.type === 'trigger') ?? null,

    [automation]

  );



  const hasOtherSteps = useMemo(

    () => (automation?.steps.some(s => s.type !== 'trigger') ?? false),

    [automation]

  );



  const handleOpenChangeTrigger = () => {

    if (triggerStep) setSelectedStepId(triggerStep.id);

    setChangeTriggerOpen(true);

  };



  const handleConfirmTriggerChange = (key: DemoTriggerKey) => {

    if (!automation || !triggerStep) return;

    updateStep(automation.id, triggerStep.id, { config: { ...triggerStep.config, triggerKey: key } });

    setSelectedStepId(triggerStep.id);

  };



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

            onClick={() => {

              const created = simulateAutomationRun(automation, {

                positions: filterPositionOptions(positions.map(p => ({ id: p.id, name: p.name }))),

                employees: employees.map(e => ({ id: e.id, name: `${e.firstName} ${e.lastName}` }))

              });

              updateAutomation(automation.id, {

                lastRunAt: new Date().toISOString(),

                runCount: automation.runCount + 1

              });

              if (created.length > 0) {

                navigate('/automations');

              }

            }}

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

            onEditTrigger={handleOpenChangeTrigger}

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

          onChangeTrigger={handleOpenChangeTrigger}

          onToggleElseBranch={(conditionStepId, enabled) => {

            if (enabled) enableBranch(automation.id, conditionStepId);

            else disableBranch(automation.id, conditionStepId);

          }}

        />

      </div>



      <AutomationChangeTriggerModal

        open={changeTriggerOpen}

        currentTriggerKey={triggerKey}

        hasOtherSteps={hasOtherSteps}

        onClose={() => setChangeTriggerOpen(false)}

        onConfirm={handleConfirmTriggerChange}

      />

    </div>

  );

};


