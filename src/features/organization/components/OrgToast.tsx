import React, { useEffect } from 'react';
import { useOrganizationStore } from '../../../store/organizationStore';

export const OrgToast: React.FC = () => {
  const { toast, clearToast } = useOrganizationStore();

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(clearToast, 4000);
    return () => clearTimeout(timer);
  }, [toast, clearToast]);

  if (!toast) return null;

  return (
    <div className="org-toast" role="status">
      {toast}
      <button type="button" onClick={clearToast} aria-label="Dismiss">×</button>
    </div>
  );
};
