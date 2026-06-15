import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { EmployeesPage } from './EmployeesPage';
import { EmployeeProfilePage } from './EmployeeProfilePage';

export const PeopleEmployeesRoutes: React.FC = () => {
  return (
    <Routes>
      <Route path="/people/employees" element={<EmployeesPage />} />
      <Route path="/people/employees/:employeeId" element={<EmployeeProfilePage />} />
    </Routes>
  );
};
