export type NotificationFilter = 'new' | 'past';

export type NotificationCategory =
  | 'approval'
  | 'meeting'
  | 'task-review'
  | 'todo-request'
  | 'warning';

export type NotificationActionVariant = 'primary' | 'secondary' | 'danger' | 'ghost';

export interface NotificationAction {
  id: string;
  label: string;
  variant: NotificationActionVariant;
}

export interface AppNotification {
  id: string;
  category: NotificationCategory;
  title: string;
  message: string;
  timeLabel: string;
  filter: NotificationFilter;
  actions: NotificationAction[];
}
