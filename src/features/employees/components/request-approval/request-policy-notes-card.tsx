import React from 'react';
import { Info } from 'lucide-react';
import type { RequestPolicyNote } from '../../types/employee-requests.types';

interface RequestPolicyNotesCardProps {
  notes: RequestPolicyNote[];
  className?: string;
}

export const RequestPolicyNotesCard: React.FC<RequestPolicyNotesCardProps> = ({
  notes,
  className = ''
}) => {
  return (
    <section
      className={`era-panel era-policy-notes ${className}`.trim()}
      aria-label="Request policy notes"
    >
      <header className="era-section__head era-section__head--quiet">
        <Info size={12} aria-hidden="true" />
        <h3 className="era-section__title">Policy Notes</h3>
      </header>
      <ul className="era-policy-notes__list">
        {notes.map((note) => (
          <li key={note.id} className="era-policy-notes__item">
            {note.text}
          </li>
        ))}
      </ul>
    </section>
  );
};
