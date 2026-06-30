export type BiometricBrand = 'zkteco' | 'hikvision' | 'essl' | 'suprema' | 'anviz' | 'other';
export type DeviceStatus = 'online' | 'offline' | 'attention' | 'disabled' | 'archived';
export type SyncStatus = 'success' | 'syncing' | 'failed' | 'idle';
export type SyncFrequency = 'realtime' | '5-minutes' | '15-minutes' | 'hourly' | 'manual';
export type SyncDirection = 'hrms-to-device' | 'device-to-hrms' | 'two-way';

export interface DeviceConnection {
  ipAddress: string;
  port: number;
  communicationKey: string;
  username: string;
  password: string;
}

export interface DeviceAssignment {
  company: string;
  branch: string;
  location: string;
  timezone: string;
}

export interface DeviceSyncConfig {
  frequency: SyncFrequency;
  direction: SyncDirection;
  autoRetry: boolean;
  retryAttempts: number;
}

export interface DeviceActivity {
  id: string;
  timestamp: string;
  event: string;
  description: string;
  status: 'success' | 'info' | 'failed';
}

export interface BiometricDevice {
  id: string;
  name: string;
  brand: BiometricBrand;
  model: string;
  serialNumber: string;
  firmware: string;
  description: string;
  connection: Omit<DeviceConnection, 'communicationKey' | 'password'> & { credentialConfigured: boolean };
  assignment: DeviceAssignment;
  syncConfig: DeviceSyncConfig;
  status: DeviceStatus;
  syncStatus: SyncStatus;
  healthScore: number;
  lastHeartbeat: string | null;
  lastSync: string | null;
  nextSync: string | null;
  connectedSince: string;
  networkLatencyMs: number | null;
  activities: DeviceActivity[];
}

export interface DeviceDraft {
  name: string;
  brand: BiometricBrand | null;
  description: string;
  connection: DeviceConnection;
  assignment: DeviceAssignment;
  syncConfig: DeviceSyncConfig;
}

export interface ConnectionTestResult {
  success: boolean;
  checks: Array<{ label: string; passed: boolean; message?: string }>;
  detected?: Pick<BiometricDevice, 'model' | 'serialNumber' | 'firmware'>;
}
