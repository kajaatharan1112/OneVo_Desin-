import { Navigate, Route, Routes } from 'react-router-dom';
import { OrganizationLayout } from '../features/organization/OrganizationLayout';
import { DepartmentsPage } from '../features/organization/departments/DepartmentsPage';
import { PositionsPage } from '../features/organization/positions/PositionsPage';

export function OrganizationRoutes() {
  return (
    <Routes>
      <Route path="/organization" element={<OrganizationLayout />}>
        <Route index element={<Navigate to="departments" replace />} />
        <Route path="departments" element={<DepartmentsPage />} />
        <Route path="positions" element={<PositionsPage />} />
      </Route>
    </Routes>
  );
}
