import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
} from 'react';
import type { AppNotification } from '../../shared/types/notification.types';
import { CURRENT_USER_ID } from '../../features/work/workMockData';

export type InboxActionResult = {
  handled: boolean;
  followUp?: AppNotification[];
};

export type InboxActionHandler = (
  notification: AppNotification,
  actionId: string,
) => InboxActionResult;

interface InboxContextValue {
  inboxItems: AppNotification[];
  addInboxItem: (item: AppNotification) => void;
  addInboxItems: (items: AppNotification[]) => void;
  resolveInboxAction: (notificationId: string, actionId: string) => void;
  registerActionHandler: (handler: InboxActionHandler | null) => void;
  getInboxForUser: (userId: string) => AppNotification[];
  countNewForUser: (userId: string) => number;
}

const InboxContext = createContext<InboxContextValue | null>(null);

const SEED_INBOX: AppNotification[] = [
  {
    id: 'inbox-seed-pl-1',
    recipientId: 'current-user',
    category: 'approval',
    title: 'Project link request',
    message: 'Maria Lopez wants to link API Gateway Migration with OneVo Platform Refresh.',
    timeLabel: 'Just now',
    filter: 'new',
    actions: [
      { id: 'approve', label: 'Approve', variant: 'primary' },
      { id: 'reject', label: 'Reject', variant: 'danger' },
    ],
    workMeta: {
      kind: 'project_link',
      projectId: 'proj-1',
      relatedLinkId: 'rp-seed-1',
      targetProjectId: 'proj-2',
      requesterId: 'user-3',
    },
  },
];

export const InboxProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [inboxItems, setInboxItems] = useState<AppNotification[]>(SEED_INBOX);
  const handlerRef = useRef<InboxActionHandler | null>(null);

  const addInboxItem = useCallback((item: AppNotification) => {
    setInboxItems(prev => [item, ...prev]);
  }, []);

  const addInboxItems = useCallback((items: AppNotification[]) => {
    if (items.length === 0) return;
    setInboxItems(prev => [...items, ...prev]);
  }, []);

  const registerActionHandler = useCallback((handler: InboxActionHandler | null) => {
    handlerRef.current = handler;
  }, []);

  const resolveInboxAction = useCallback((notificationId: string, actionId: string) => {
    const notification = inboxItems.find(n => n.id === notificationId);
    if (!notification) return;

    let followUp: AppNotification[] = [];
    if (notification.workMeta && handlerRef.current) {
      const result = handlerRef.current(notification, actionId);
      if (result.handled && result.followUp?.length) {
        followUp = result.followUp;
      }
    }

    setInboxItems(prev => {
      const next = prev.map(n =>
        n.id === notificationId ? { ...n, filter: 'past' as const, actions: [] } : n,
      );
      return followUp.length > 0 ? [...followUp, ...next] : next;
    });
  }, [inboxItems]);

  const getInboxForUser = useCallback(
    (userId: string) =>
      inboxItems.filter(n => !n.recipientId || n.recipientId === userId),
    [inboxItems],
  );

  const countNewForUser = useCallback(
    (userId: string) => getInboxForUser(userId).filter(n => n.filter === 'new').length,
    [getInboxForUser],
  );

  const value = useMemo<InboxContextValue>(() => ({
    inboxItems,
    addInboxItem,
    addInboxItems,
    resolveInboxAction,
    registerActionHandler,
    getInboxForUser,
    countNewForUser,
  }), [
    inboxItems,
    addInboxItem,
    addInboxItems,
    resolveInboxAction,
    registerActionHandler,
    getInboxForUser,
    countNewForUser,
  ]);

  return <InboxContext.Provider value={value}>{children}</InboxContext.Provider>;
};

export function useInbox(): InboxContextValue {
  const ctx = useContext(InboxContext);
  if (!ctx) {
    throw new Error('useInbox must be used within InboxProvider');
  }
  return ctx;
}

export function useInboxOptional(): InboxContextValue | null {
  return useContext(InboxContext);
}

/** Default demo user for employee-view inbox filtering. */
export const INBOX_CURRENT_USER = CURRENT_USER_ID;
