import React from 'react';
import { useSchedulesConfigStore } from '../../../store/schedulesConfigStore';

export const DeleteHolidayModal: React.FC = () => {
  const { holidayDeleteModal, closeDeleteHoliday, confirmDeleteHoliday } = useSchedulesConfigStore();

  if (!holidayDeleteModal.open) return null;

  return (
    <div className="schedules-cfg-modal-overlay schedules-cfg-modal-overlay--holiday-delete" onClick={closeDeleteHoliday}>
      <div
        className="schedules-cfg-modal schedules-cfg-holiday-delete-modal"
        role="dialog"
        aria-modal="true"
        aria-label="Delete holiday"
        onClick={e => e.stopPropagation()}
      >
        <div className="schedules-cfg-modal__body schedules-cfg-holiday-delete-modal__body">
          <h2>Delete holiday?</h2>
          <p>This holiday will be removed from the holiday calendar.</p>
        </div>
        <footer className="schedules-cfg-modal__footer">
          <button type="button" className="org-btn org-btn--secondary" onClick={closeDeleteHoliday}>
            Cancel
          </button>
          <button type="button" className="org-btn org-btn--primary" onClick={confirmDeleteHoliday}>
            Delete
          </button>
        </footer>
      </div>
    </div>
  );
};
