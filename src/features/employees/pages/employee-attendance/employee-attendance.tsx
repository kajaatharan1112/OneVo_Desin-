import React from 'react';
import { Clock } from 'lucide-react';

export const EmployeeAttendance: React.FC = () => {
  return (
    <div className="content-card">
      <span style={{ display: 'flex', justifyContent: 'center', marginBottom: '16px', color: 'var(--accent)' }}>
        <Clock size={40} />
      </span>
      <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-h)', marginBottom: '8px' }}>
        Employee Attendance Portal
      </h3>
      <p style={{ fontSize: '0.85rem', color: '#6b7280', maxWidth: '400px', margin: '0 auto' }}>
        This is a dedicated workspace panel for the employee's custom attendance interface.
      </p>
    </div>
  );
};
