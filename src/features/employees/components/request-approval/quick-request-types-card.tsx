import React from 'react';
import {
  CalendarDays,
  ClipboardList,
  FileText,
  Home,
  Laptop,
  PlusCircle
} from 'lucide-react';
import type { QuickRequestType, RequestType } from '../../types/employee-requests.types';

function QuickTypeIcon({ type }: { type: RequestType }) {
  const props = { size: 14, strokeWidth: 2, 'aria-hidden': true as const };

  switch (type) {
    case 'leave':
      return <CalendarDays {...props} />;
    case 'wfh':
      return <Home {...props} />;
    case 'asset':
      return <Laptop {...props} />;
    case 'attendance':
      return <ClipboardList {...props} />;
    default:
      return <FileText {...props} />;
  }
}

interface QuickRequestTypesCardProps {
  types: QuickRequestType[];
  className?: string;
}

export const QuickRequestTypesCard: React.FC<QuickRequestTypesCardProps> = ({
  types,
  className = ''
}) => {
  return (
    <section
      className={`era-panel era-quick-types ${className}`.trim()}
      aria-label="Quick request types"
    >
      <header className="era-section__head">
        <PlusCircle size={14} aria-hidden="true" />
        <h3 className="era-section__title">Quick Request Types</h3>
      </header>
      <ul className="era-quick-types__grid">
        {types.map((item) => (
          <li key={item.id} className="era-quick-types__cell">
            <button type="button" className="era-quick-types__btn">
              <span className="era-quick-types__icon" aria-hidden="true">
                <QuickTypeIcon type={item.type} />
              </span>
              <span className="era-quick-types__label">{item.label}</span>
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
};
