import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { EmployeesPage } from './EmployeesPage';
import { EmployeeProfilePage } from './EmployeeProfilePage';

interface PeopleEmployeesRoutesProps {
  isTenantAdmin?: boolean;
}

export const PeopleEmployeesRoutes: React.FC<PeopleEmployeesRoutesProps> = ({ isTenantAdmin }) => {
  return (
    <Routes>
      <Route path="/people/employees" element={<EmployeesPage isTenantAdmin={isTenantAdmin} />} />
      <Route path="/people/employees/:employeeId" element={<EmployeeProfilePage />} />
    </Routes>
  );
};
