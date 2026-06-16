import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './theme/init-theme'
import './styles/index.css'
import './styles/shell.css'
import './styles/notifications.css'
import './styles/employee-dashboard-layout.css'
import './styles/employee-task-overview.css'
import './styles/employee-goals-overview.css'
import './styles/employee-request-approval.css'
import './styles/employee-my-calendar.css'
import './styles/employee-activity.css'
import './styles/tenant-today-productivity.css'
import './styles/tenant-dashboard-premium.css'
import './styles/ceo-summary-cards.css'
import './styles/ceo-dashboard.css'
import './styles/ceo-dashboard-fixes.css'
import './styles/ceo-performance-dashboard.css'
import './styles/nexus-scroll.css'
import './styles/theme-cards.css'
import './styles/positions.css'
import './styles/organization.css'
import './styles/configuration.css'
import './features/leave/configuration/leaveConfiguration.css'
import './features/admin/admin.css'
import './features/settings/settings.css'
import './features/work/work.css'
import './features/employees/components/productivity-dashboard/productivity-dashboard.css'
import { ThemeProvider } from './core/theme/theme-context'
import App from './app/App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <ThemeProvider>
        <App />
      </ThemeProvider>
    </BrowserRouter>
  </StrictMode>,
)
