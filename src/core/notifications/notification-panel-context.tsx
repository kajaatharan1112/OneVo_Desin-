import { createContext, useContext } from 'react';

interface NotificationPanelContextValue {
  openNotificationPanel: () => void;
}

const NotificationPanelContext = createContext<NotificationPanelContextValue | null>(null);

export const NotificationPanelProvider = NotificationPanelContext.Provider;

export function useNotificationPanel(): NotificationPanelContextValue {
  const ctx = useContext(NotificationPanelContext);
  if (!ctx) {
    return { openNotificationPanel: () => undefined };
  }
  return ctx;
}
