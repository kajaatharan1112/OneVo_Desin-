import React from 'react';

type WidgetLeadTone = 'default' | 'good' | 'warn';

interface WidgetLeadProps {
  value: string;
  caption: string;
  tone?: WidgetLeadTone;
}

export const WidgetLead: React.FC<WidgetLeadProps> = ({ value, caption, tone = 'default' }) => (
  <div className={`cwo-widget__lead${tone !== 'default' ? ` cwo-widget__lead--${tone}` : ''}`}>
    <p className="cwo-widget__lead-value">{value}</p>
    <p className="cwo-widget__lead-caption">{caption}</p>
  </div>
);
