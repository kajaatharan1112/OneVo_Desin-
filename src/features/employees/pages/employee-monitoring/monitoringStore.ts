import { create } from 'zustand';

export interface ActivityTrackingPolicy {
  name: string;
  description: string;
  trackingInterval: number; // in minutes
  minActivity: number; // percentage
  trackKeyboard: boolean;
  trackMouse: boolean;
  applyTo: string;
  effectiveDate: string;
}

export interface IdleTimePolicy {
  name: string;
  description: string;
  idleThreshold: number; // in minutes
  criticalThreshold: number; // in minutes
  reminderNotification: boolean;
  applyTo: string;
}

export interface ScreenshotPolicy {
  name: string;
  description: string;
  enabled: boolean;
  quality: 'Low' | 'Medium' | 'High';
  notification: boolean;
  retention: string;
  captureMultiple: boolean;
  applyTo: string;
}

export interface WebcamPolicy {
  name: string;
  description: string;
  enabled: boolean;
  idleThreshold: number; // in minutes
  notificationDuration: number; // in seconds
  retention: string;
  applyTo: string;
}

export interface AppAllowItem {
  id: string;
  name: string;
  executableName: string;
  category: string;
  allowed: boolean;
  description: string;
  applyTo: string;
}

export interface DeviceRequest {
  id: string;
  employeeId?: string;
  employeeName?: string;
  oldDevice: string;
  currentDevice: string;
  reason: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  date: string;
}

export interface EmployeeActivity {
  id: string;
  name: string;
  keyboardActivity: number;
  mouseActivity: number;
  status: 'Working' | 'Idle' | 'Break' | 'Offline';
  workingHours: string;
}

export interface AppUsageRecord {
  id: string;
  employee: string;
  blockedApp: string;
  allowedApp: string;
  duration: string;
}

export interface IdleRecord {
  id: string;
  employee: string;
  idleToday: string;
  longestIdle: string;
  averageIdle: string;
}

export interface ScreenshotRecord {
  id: string;
  employee: string;
  department: string;
  time: string;
  date: string;
  quality: string;
  url: string;
}

export interface WebcamPhotoRecord {
  id: string;
  employee: string;
  time: string;
  status: 'Captured' | 'Pending Consent' | 'Rejected';
}

export interface ViolationRecord {
  id: string;
  employee: string;
  type: string;
  details: string;
  time: string;
}

interface MonitoringStore {
  activityPolicy: ActivityTrackingPolicy;
  idlePolicy: IdleTimePolicy;
  screenshotPolicy: ScreenshotPolicy;
  webcamPolicy: WebcamPolicy;
  appsList: AppAllowItem[];
  requests: DeviceRequest[];
  activities: EmployeeActivity[];
  appUsage: AppUsageRecord[];
  idleRecords: IdleRecord[];
  screenshots: ScreenshotRecord[];
  webcamPhotos: WebcamPhotoRecord[];
  violations: ViolationRecord[];
  
  // Drawer & Selection state
  activeRequestId: string | null;
  showRequestDrawer: boolean;
  
  // Actions
  updateActivityPolicy: (policy: Partial<ActivityTrackingPolicy>) => void;
  updateIdlePolicy: (policy: Partial<IdleTimePolicy>) => void;
  updateScreenshotPolicy: (policy: Partial<ScreenshotPolicy>) => void;
  updateWebcamPolicy: (policy: Partial<WebcamPolicy>) => void;
  
  addApp: (app: Omit<AppAllowItem, 'id'>) => void;
  toggleAppStatus: (id: string) => void;
  deleteApp: (id: string) => void;
  
  submitDeviceRequest: (req: Omit<DeviceRequest, 'id' | 'status' | 'date'>) => void;
  approveDeviceRequest: (id: string) => void;
  rejectDeviceRequest: (id: string) => void;
  setActiveRequestId: (id: string | null) => void;
  setShowRequestDrawer: (open: boolean) => void;
}

export const useMonitoringStore = create<MonitoringStore>((set) => ({
  activityPolicy: {
    name: 'Activity Tracking Policy',
    description: 'Monitors raw mouse clicks, keyboard strokes, and scroll interactions at configured intervals.',
    trackingInterval: 1,
    minActivity: 30,
    trackKeyboard: true,
    trackMouse: true,
    applyTo: 'All Employees',
    effectiveDate: '2026-07-01',
  },
  idlePolicy: {
    name: 'Idle Time Policy',
    description: 'Defines the idle time limits for normal and critical inactivity',
    idleThreshold: 5,
    criticalThreshold: 30,
    reminderNotification: true,
    applyTo: 'All Employees',
  },
  screenshotPolicy: {
    name: 'Screenshot Policy',
    description: 'Periodically captures desktop screens with optional on-screen notifications.',
    enabled: true,
    quality: 'Medium',
    notification: true,
    retention: '30 Days',
    captureMultiple: true,
    applyTo: 'All Employees',
  },
  webcamPolicy: {
    name: 'Webcam Policy',
    description: 'Verifies presence using facial photography when the inactivity exceeds the idle threshold.',
    enabled: true,
    idleThreshold: 10,
    notificationDuration: 30,
    retention: '60 Days',
    applyTo: 'All Employees',
  },
  appsList: [
    { id: '1', name: 'Google Chrome', executableName: 'chrome.exe', category: 'Browser', allowed: true, description: 'Standard corporate browser', applyTo: 'All Employees' },
    { id: '2', name: 'Slack Desktop', executableName: 'slack.exe', category: 'Communication', allowed: true, description: 'Primary chat channel', applyTo: 'All Employees' },
    { id: '3', name: 'Figma App', executableName: 'figma.exe', category: 'Design', allowed: true, description: 'UI/UX Design tool', applyTo: 'Design Team' },
    { id: '4', name: 'VS Code', executableName: 'code.exe', category: 'Development', allowed: true, description: 'Editor/IDE for dev work', applyTo: 'Engineering' },
    { id: '5', name: 'Minesweeper Classic', executableName: 'minesweeper.exe', category: 'Entertainment', allowed: false, description: 'Local system game', applyTo: 'All Employees' },
  ],
  requests: [
    { id: 'req-1', employeeId: 'emp-2', employeeName: 'Aarathana', oldDevice: 'Dell Latitude 5420', currentDevice: 'MacBook Pro M3', reason: 'Old laptop battery swelled. Upgraded to new company machine.', status: 'Pending', date: '2026-06-28 10:20' }
  ],
  activities: [
    { id: 'emp-1', name: 'emp-1', keyboardActivity: 78, mouseActivity: 85, status: 'Working', workingHours: '6h 45m' },
    { id: 'emp-2', name: 'emp-2', keyboardActivity: 5, mouseActivity: 12, status: 'Idle', workingHours: '4h 10m' },
    { id: 'emp-3', name: 'emp-3', keyboardActivity: 92, mouseActivity: 90, status: 'Working', workingHours: '7h 15m' },
    { id: 'emp-6', name: 'emp-6', keyboardActivity: 0, mouseActivity: 0, status: 'Offline', workingHours: '0h 0m' },
    { id: 'emp-8', name: 'emp-8', keyboardActivity: 45, mouseActivity: 60, status: 'Break', workingHours: '5h 30m' },
  ],
  appUsage: [
    { id: 'u-1', employee: 'emp-1', blockedApp: 'None', allowedApp: 'chrome.exe', duration: '4h 12m' },
    { id: 'u-2', employee: 'emp-2', blockedApp: 'minesweeper.exe', allowedApp: 'slack.exe', duration: '12m (Blocked)' },
    { id: 'u-3', employee: 'emp-3', blockedApp: 'None', allowedApp: 'code.exe', duration: '6h 0m' },
  ],
  idleRecords: [
    { id: 'i-1', employee: 'emp-1', idleToday: '32 Min', longestIdle: '12 Min', averageIdle: '4 Min' },
    { id: 'i-2', employee: 'emp-2', idleToday: '110 Min', longestIdle: '45 Min', averageIdle: '18 Min' },
    { id: 'i-3', employee: 'emp-3', idleToday: '15 Min', longestIdle: '8 Min', averageIdle: '3 Min' },
  ],
  screenshots: [
    { id: 's-1', employee: 'emp-1', department: 'Executive', time: '14:23', date: '2026-06-28', quality: 'Medium', url: '/img/screen1.jpg' },
    { id: 's-2', employee: 'emp-2', department: 'Executive', time: '13:05', date: '2026-06-28', quality: 'Medium', url: '/img/screen2.jpg' },
    { id: 's-3', employee: 'emp-3', department: 'Finance', time: '16:11', date: '2026-06-28', quality: 'High', url: '/img/screen3.jpg' },
  ],
  webcamPhotos: [
    { id: 'w-1', employee: 'emp-1', time: '14:30', status: 'Captured' },
    { id: 'w-2', employee: 'emp-2', time: '11:15', status: 'Pending Consent' },
    { id: 'w-3', employee: 'emp-6', time: '09:45', status: 'Rejected' },
  ],
  violations: [
    { id: 'v-1', employee: 'emp-2', type: 'Blocked App Used', details: 'Launched minesweeper.exe during working hours.', time: '11:20 AM' },
    { id: 'v-2', employee: 'emp-6', type: 'Camera Denied', details: 'Webcam consent requested and explicitly rejected.', time: '09:45 AM' },
    { id: 'v-3', employee: 'emp-2', type: 'Repeated Idle', details: 'Exceeded critical idle threshold (30m) 3 times today.', time: '03:15 PM' },
  ],

  activeRequestId: null,
  showRequestDrawer: false,

  updateActivityPolicy: (policy) => set((state) => ({ activityPolicy: { ...state.activityPolicy, ...policy } })),
  updateIdlePolicy: (policy) => set((state) => ({ idlePolicy: { ...state.idlePolicy, ...policy } })),
  updateScreenshotPolicy: (policy) => set((state) => ({ screenshotPolicy: { ...state.screenshotPolicy, ...policy } })),
  updateWebcamPolicy: (policy) => set((state) => ({ webcamPolicy: { ...state.webcamPolicy, ...policy } })),

  addApp: (app) => set((state) => ({
    appsList: [...state.appsList, { ...app, id: `app-${Date.now()}` }]
  })),

  toggleAppStatus: (id) => set((state) => ({
    appsList: state.appsList.map(a => a.id === id ? { ...a, allowed: !a.allowed } : a)
  })),

  deleteApp: (id) => set((state) => ({
    appsList: state.appsList.filter(a => a.id !== id)
  })),

  submitDeviceRequest: (req) => set((state) => ({
    requests: [
      ...state.requests,
      {
        ...req,
        id: `req-${Date.now()}`,
        status: 'Pending',
        date: new Date().toISOString().replace('T', ' ').substring(0, 16)
      }
    ]
  })),

  approveDeviceRequest: (id) => set((state) => ({
    requests: state.requests.map(r => r.id === id ? { ...r, status: 'Approved' } : r)
  })),

  rejectDeviceRequest: (id) => set((state) => ({
    requests: state.requests.map(r => r.id === id ? { ...r, status: 'Rejected' } : r)
  })),

  setActiveRequestId: (id) => set({ activeRequestId: id }),
  setShowRequestDrawer: (open) => set({ showRequestDrawer: open })
}));
