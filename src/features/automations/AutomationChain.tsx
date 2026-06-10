import React, { useRef, useState } from 'react';
import { Plus } from 'lucide-react';
import type { AddStepOption, AutomationStep, StepType } from './automationTypes';
import { AutomationStepCard } from './AutomationStepCard';
import { AutomationAddStepMenu } from './AutomationAddStepMenu';
import { getBranchSteps, hasBranch } from './automationUtils';

const OPTION_TO_TYPE: Record<AddStepOption, StepType | 'branch'> = {
  condition: 'condition',
  action: 'action',
  approval: 'approval',
  notification: 'notification',
  alert: 'alert',
  delay: 'delay',
  branch: 'branch'
};

interface AutomationChainProps {
  steps: AutomationStep[];
  triggerKey: string;
  selectedStepId: string | null;
  onSelectStep: (id: string | null) => void;
  onAddStep: (afterStepId: string | null, type: StepType, sectionId: string) => void;
  onEnableBranch: (conditionStepId: string) => void;
  onDeleteStep: (stepId: string) => void;
}

function AddButton({
  afterStepId,
  sectionId,
  onAdd,
  onBranch
}: {
  afterStepId: string;
  sectionId: string;
  onAdd: (afterStepId: string | null, option: AddStepOption, sectionId: string) => void;
  onBranch?: () => void;
}) {
  const [open, setOpen] = useState(false);
  const btnRef = useRef<HTMLButtonElement>(null);

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
        onClose={() => setOpen(false)}
        anchorRef={btnRef}
        onSelect={opt => {
          if (opt === 'branch' && onBranch) {
            onBranch();
          } else {
            onAdd(afterStepId, opt, sectionId);
          }
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
  triggerKey
}: {
  chainSteps: AutomationStep[];
  allSteps: AutomationStep[];
  selectedStepId: string | null;
  sectionId: string;
  triggerKey: string;
  onSelectStep: (id: string) => void;
  onAddStep: AutomationChainProps['onAddStep'];
  onEnableBranch: AutomationChainProps['onEnableBranch'];
  onDeleteStep: (id: string) => void;
}) {
  if (chainSteps.length === 0) {
    return (
      <div className="auto-chain__empty">
        <AddButton
          afterStepId=""
          sectionId={sectionId}
          onAdd={(_after, opt, sec) => {
            const type = OPTION_TO_TYPE[opt];
            if (type !== 'branch') onAddStep(null, type, sec);
          }}
        />
      </div>
    );
  }

  return (
    <>
      {chainSteps.map((step, idx) => {
        const isLast = idx === chainSteps.length - 1;
        const showBranches = step.type === 'condition' && (step.config.hasBranch || hasBranch(allSteps, step.id));

        return (
          <React.Fragment key={step.id}>
            <AutomationStepCard
              step={step}
              triggerKey={triggerKey}
              selected={selectedStepId === step.id}
              onSelect={() => onSelectStep(step.id)}
              onEdit={() => onSelectStep(step.id)}
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
                onBranch={() => onEnableBranch(step.id)}
                onAdd={(after, opt, sec) => {
                  if (opt === 'branch') {
                    onEnableBranch(step.id);
                    return;
                  }
                  const type = OPTION_TO_TYPE[opt];
                  if (type !== 'branch') onAddStep(after || step.id, type, sec);
                }}
              />
            )}

            {isLast && step.type === 'end' ? null : null}
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
        onAddStep={props.onAddStep}
        onEnableBranch={props.onEnableBranch}
        onDeleteStep={props.onDeleteStep}
      />
    </div>
  );
};
