import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './theme/init-theme'
import './styles/index.css'
import './styles/shell.css'
import './styles/notifications.css'
import './styles/employee-task-overview.css'
import './styles/employee-goals-overview.css'
import './styles/tenant-today-productivity.css'
import './styles/ceo-summary-cards.css'
import './styles/ceo-dashboard.css'
import './styles/theme-cards.css'
import './styles/nexus-scroll.css'
import { ThemeProvider } from './core/theme/theme-context'
import App from './app/App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider>
      <App />
    </ThemeProvider>
  </StrictMode>,
)
