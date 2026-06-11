import React from 'react';
import clsx from 'clsx';
import type { DemoTriggerKey } from './automationContextRules';
import { TRIGGER_HELPER_TEXT, TRIGGER_ICONS, TRIGGER_PICKER_GROUPS } from './triggerPickerConfig';

interface AutomationTriggerPickerProps {
  onSelect: (triggerKey: DemoTriggerKey) => void;
  selectedKey?: string;
  title?: string;
  subtitle?: string;
  hideHeader?: boolean;
  variant?: 'embedded' | 'page' | 'modal';
}

export const AutomationTriggerPicker: React.FC<AutomationTriggerPickerProps> = ({
  onSelect,
  selectedKey = '',
  title = 'Choose what starts this automation',
  subtitle = 'Select one event to begin building the flow.',
  hideHeader = false,
  variant = 'embedded'
}) => (
  <section
    className={clsx('auto-trigger-picker', `auto-trigger-picker--${variant}`)}
    aria-label="Choose automation trigger"
  >
    {!hideHeader && (
      <>
        <h2 className="auto-trigger-picker__title">{title}</h2>
        {subtitle ? <p className="auto-trigger-picker__subtitle">{subtitle}</p> : null}
      </>
    )}

    <div className="auto-trigger-picker__groups">
      {TRIGGER_PICKER_GROUPS.map(group => (
        <div key={group.key} className="auto-trigger-picker__group">
          <h3 className="auto-trigger-picker__group-label">{group.label}</h3>
          <div className="auto-trigger-picker__grid">
            {group.triggers.map(trigger => {
              const Icon = TRIGGER_ICONS[trigger.key];
              const selected = selectedKey === trigger.key;
              return (
                <button
                  key={trigger.key}
                  type="button"
                  className={`auto-trigger-card${selected ? ' auto-trigger-card--selected' : ''}`}
                  onClick={() => onSelect(trigger.key)}
                >
                  <span className="auto-trigger-card__icon">
                    <Icon size={16} />
                  </span>
                  <span className="auto-trigger-card__name">{trigger.label}</span>
                  <span className="auto-trigger-card__desc">{TRIGGER_HELPER_TEXT[trigger.key]}</span>
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  </section>
);
