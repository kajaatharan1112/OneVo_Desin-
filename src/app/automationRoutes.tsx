import { Route, Routes } from 'react-router-dom';
import { AutomationListPage } from '../features/automations/AutomationListPage';
import { AutomationBuilderPage } from '../features/automations/AutomationBuilderPage';
import { AutomationTriggerSelectPage } from '../features/automations/AutomationTriggerSelectPage';

export function AutomationRoutes() {
  return (
    <Routes>
      <Route path="/automations" element={<AutomationListPage />} />
      <Route path="/automations/new" element={<AutomationTriggerSelectPage />} />
      <Route path="/automations/:id" element={<AutomationBuilderPage />} />
    </Routes>
  );
}
