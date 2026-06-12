import React, { useEffect } from 'react';
import { useLeaveConfigStore } from '../../../store/leaveConfigStore';

export const LeaveConfigToast: React.FC = () => {
  const { toast, clearToast } = useLeaveConfigStore();

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(clearToast, 3500);
    return () => clearTimeout(t);
  }, [toast, clearToast]);

  if (!toast) return null;

  return (
    <div className="leave-cfg-toast" role="status">
      {toast}
      <button type="button" onClick={clearToast} aria-label="Dismiss">×</button>
    </div>
  );
};
