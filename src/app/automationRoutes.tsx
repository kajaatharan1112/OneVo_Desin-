import { Navigate, Route, Routes } from 'react-router-dom';
import { AutomationListPage } from '../features/automations/AutomationListPage';
import { AutomationBuilderPage } from '../features/automations/AutomationBuilderPage';

export function AutomationRoutes() {
  return (
    <Routes>
      <Route path="/automations" element={<AutomationListPage />} />
      <Route path="/automations/new" element={<Navigate to="/automations" replace />} />
      <Route path="/automations/:id" element={<AutomationBuilderPage />} />
    </Routes>
  );
}
