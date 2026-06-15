import React, { useEffect } from 'react';
import { useSchedulesConfigStore } from '../../../store/schedulesConfigStore';

export const SchedulesConfigToast: React.FC = () => {
  const { toast, clearToast } = useSchedulesConfigStore();

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(clearToast, 3500);
    return () => clearTimeout(t);
  }, [toast, clearToast]);

  if (!toast) return null;

  return (
    <div className="schedules-cfg-toast" role="status">
      {toast}
      <button type="button" onClick={clearToast} aria-label="Dismiss">×</button>
    </div>
  );
};
