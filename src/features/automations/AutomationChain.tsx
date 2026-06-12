import React, { useMemo, useRef, useState } from 'react';
import { Plus } from 'lucide-react';
import type { AddStepOption, AutomationStep, StepType } from './automationTypes';
import { AutomationStepCard } from './AutomationStepCard';
import { AutomationAddStepMenu } from './AutomationAddStepMenu';
import { getAllowedAddStepOptions, isTriggerSelected, stepMatchesTrigger } from './automationContextRules';
import { getBranchSteps, hasBranch } from './automationUtils';

const OPTION_TO_TYPE: Record<Exclude<AddStepOption, 'branch' | 'end'>, StepType> = {
  condition: 'condition',
  action: 'action',
  approval: 'approval',
  notification: 'notification',
  alert: 'alert',
  delay: 'delay'
};

interface AutomationChainProps {
  steps: AutomationStep[];
  triggerKey: string;
  selectedStepId: string | null;
  onSelectStep: (id: string | null) => void;
  onEditTrigger: () => void;
  onAddStep: (afterStepId: string | null, type: StepType, sectionId: string) => void;
  onEnableBranch: (conditionStepId: string) => void;
  onDeleteStep: (stepId: string) => void;
}

function AddButton({
  afterStepId,
  sectionId,
  triggerKey,
  steps,
  onAdd,
  onBranch
}: {
  afterStepId: string;
  sectionId: string;
  triggerKey: string;
  steps: AutomationStep[];
  onAdd: (afterStepId: string | null, option: AddStepOption, sectionId: string) => void;
  onBranch?: () => void;
}) {
  const [open, setOpen] = useState(false);
  const btnRef = useRef<HTMLButtonElement>(null);

  const allowedOptions = useMemo(
    () => getAllowedAddStepOptions(triggerKey, steps, afterStepId || null),
    [triggerKey, steps, afterStepId]
  );

  if (!isTriggerSelected(triggerKey)) {
    return (
      <div className="auto-chain__add auto-chain__add--disabled">
        <button type="button" className="auto-chain__add-btn" disabled aria-label="Add step">
          <Plus size={16} />
        </button>
        <span className="auto-chain__add-hint">Choose a trigger first.</span>
      </div>
    );
  }

  if (allowedOptions.length === 0) return null;

  return (
    <div className="auto-chain__add">
      <button
        ref={btnRef}
        type="button"
        className="auto-chain__add-btn"
        onClick={() => setOpen(v => !v)}
        aria-label="Add step"
      >
        <Plus size={16} />
      </button>
      <AutomationAddStepMenu
        open={open}
        allowedOptions={allowedOptions}
        onClose={() => setOpen(false)}
        anchorRef={btnRef}
        onSelect={opt => {
          if (opt === 'branch' && onBranch) onBranch();
          else onAdd(afterStepId, opt, sectionId);
        }}
      />
    </div>
  );
}

function StepChain({
  chainSteps,
  allSteps,
  selectedStepId,
  sectionId,
  onSelectStep,
  onAddStep,
  onEnableBranch,
  onDeleteStep,
  onEditTrigger,
  triggerKey
}: {
  chainSteps: AutomationStep[];
  allSteps: AutomationStep[];
  selectedStepId: string | null;
  sectionId: string;
  triggerKey: string;
  onSelectStep: (id: string) => void;
  onEditTrigger: () => void;
  onAddStep: (afterStepId: string | null, option: AddStepOption, sectionId: string) => void;
  onEnableBranch: AutomationChainProps['onEnableBranch'];
  onDeleteStep: (id: string) => void;
}) {
  if (chainSteps.length === 0) {
    return (
      <div className="auto-chain__empty">
        <AddButton
          afterStepId=""
          sectionId={sectionId}
          triggerKey={triggerKey}
          steps={allSteps}
          onAdd={onAddStep}
        />
      </div>
    );
  }

  return (
    <>
      {chainSteps.map(step => {
        const showBranches = step.type === 'condition' && (step.config.hasBranch || hasBranch(allSteps, step.id));
        const stepInvalid = isTriggerSelected(triggerKey) && step.type !== 'trigger' && !stepMatchesTrigger(step, triggerKey);
        const isTriggerStep = step.type === 'trigger';

        return (
          <React.Fragment key={step.id}>
            <AutomationStepCard
              step={step}
              steps={allSteps}
              triggerKey={triggerKey}
              selected={selectedStepId === step.id}
              invalid={stepInvalid}
              onSelect={() => onSelectStep(step.id)}
              onEdit={() => {
                onSelectStep(step.id);
                if (isTriggerStep) onEditTrigger();
              }}
              onDelete={() => onDeleteStep(step.id)}
              canDelete={step.type !== 'trigger'}
            />

            {showBranches ? (
              <div className="auto-branch">
                <div className="auto-branch__path">
                  <span className="auto-branch__label">YES path</span>
                  <StepChain
                    chainSteps={getBranchSteps(allSteps, step.id, 'yes')}
                    allSteps={allSteps}
                    selectedStepId={selectedStepId}
                    sectionId={`branch-${step.id}-yes`}
                    triggerKey={triggerKey}
                    onSelectStep={onSelectStep}
                    onEditTrigger={onEditTrigger}
                    onAddStep={onAddStep}
                    onEnableBranch={onEnableBranch}
                    onDeleteStep={onDeleteStep}
                  />
                </div>
                <div className="auto-branch__path">
                  <span className="auto-branch__label">NO path</span>
                  <StepChain
                    chainSteps={getBranchSteps(allSteps, step.id, 'no')}
                    allSteps={allSteps}
                    selectedStepId={selectedStepId}
                    sectionId={`branch-${step.id}-no`}
                    triggerKey={triggerKey}
                    onSelectStep={onSelectStep}
                    onEditTrigger={onEditTrigger}
                    onAddStep={onAddStep}
                    onEnableBranch={onEnableBranch}
                    onDeleteStep={onDeleteStep}
                  />
                </div>
              </div>
            ) : (
              <AddButton
                afterStepId={step.id}
                sectionId={sectionId}
                triggerKey={triggerKey}
                steps={allSteps}
                onBranch={() => onEnableBranch(step.id)}
                onAdd={(after, opt, sec) => {
                  if (opt === 'branch') {
                    onEnableBranch(step.id);
                    return;
                  }
                  onAddStep(after || step.id, opt, sec);
                }}
              />
            )}
          </React.Fragment>
        );
      })}
    </>
  );
}

export const AutomationChain: React.FC<AutomationChainProps> = (props) => {
  const mainSteps = props.steps.filter(s => s.sectionId === 'main').sort((a, b) => a.sortOrder - b.sortOrder);

  return (
    <div className="auto-chain">
      <StepChain
        chainSteps={mainSteps}
        allSteps={props.steps}
        selectedStepId={props.selectedStepId}
        sectionId="main"
        triggerKey={props.triggerKey}
        onSelectStep={id => props.onSelectStep(id)}
        onEditTrigger={props.onEditTrigger}
        onAddStep={(after, opt, sec) => {
          if (opt === 'end') {
            props.onAddStep(after, 'end', sec);
            return;
          }
          if (opt === 'branch') return;
          const type = OPTION_TO_TYPE[opt as Exclude<AddStepOption, 'branch' | 'end'>];
          if (type) props.onAddStep(after, type, sec);
        }}
        onEnableBranch={props.onEnableBranch}
        onDeleteStep={props.onDeleteStep}
      />
    </div>
  );
};
