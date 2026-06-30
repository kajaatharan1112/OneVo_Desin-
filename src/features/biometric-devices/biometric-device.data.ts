import type { BiometricBrand, BiometricDevice, DeviceDraft } from './biometric-device.types';

export const BRAND_LABELS: Record<BiometricBrand, string> = {
  zkteco: 'ZKTeco', hikvision: 'Hikvision', essl: 'eSSL', suprema: 'Suprema', anviz: 'Anviz', other: 'Others'
};

export const EMPTY_DEVICE_DRAFT: DeviceDraft = {
  name: '', brand: null, description: '',
  connection: { ipAddress: '', port: 4370, communicationKey: '', username: '', password: '' },
  assignment: { company: 'OneVo', branch: '', location: '', timezone: 'Asia/Colombo' },
  syncConfig: { frequency: '15-minutes', direction: 'device-to-hrms', autoRetry: true, retryAttempts: 3 }
};

const activities = (id: string) => [
  { id: `${id}-1`, timestamp: '2026-06-29T08:45:00Z', event: 'Synchronization Completed', description: '125 attendance records synchronized', status: 'success' as const },
  { id: `${id}-2`, timestamp: '2026-06-29T08:43:00Z', event: 'Synchronization Started', description: 'Automatic synchronization started', status: 'info' as const },
  { id: `${id}-3`, timestamp: '2026-06-12T04:30:00Z', event: 'Device Connected', description: 'Device connected successfully', status: 'success' as const }
];

export const SEED_BIOMETRIC_DEVICES: BiometricDevice[] = [
  { id: 'bio-1', name: 'Head Office Device', brand: 'zkteco', model: 'MB560', serialNumber: '389242343242', firmware: 'Ver 8.0.3', description: 'Main entrance terminal', connection: { ipAddress: '192.168.1.201', port: 4370, username: 'admin', credentialConfigured: true }, assignment: { company: 'OneVo', branch: 'Head Office', location: 'Main Entrance', timezone: 'Asia/Colombo' }, syncConfig: { frequency: '5-minutes', direction: 'two-way', autoRetry: true, retryAttempts: 3 }, status: 'online', syncStatus: 'success', healthScore: 98, lastHeartbeat: '2026-06-29T08:45:00Z', lastSync: '2026-06-29T08:44:00Z', nextSync: '2026-06-29T08:49:00Z', connectedSince: '2026-05-12T04:30:00Z', networkLatencyMs: 18, activities: activities('bio-1') },
  { id: 'bio-2', name: 'Factory Gate', brand: 'hikvision', model: 'DS-K1T341', serialNumber: 'HK-923812', firmware: '3.2.1', description: '', connection: { ipAddress: '192.168.2.40', port: 8000, username: 'admin', credentialConfigured: true }, assignment: { company: 'OneVo', branch: 'Factory', location: 'Gate A', timezone: 'Asia/Colombo' }, syncConfig: { frequency: '15-minutes', direction: 'device-to-hrms', autoRetry: true, retryAttempts: 5 }, status: 'online', syncStatus: 'success', healthScore: 94, lastHeartbeat: '2026-06-29T08:44:00Z', lastSync: '2026-06-29T08:42:00Z', nextSync: '2026-06-29T08:57:00Z', connectedSince: '2026-04-03T06:00:00Z', networkLatencyMs: 25, activities: activities('bio-2') },
  { id: 'bio-3', name: 'Warehouse', brand: 'zkteco', model: 'F18', serialNumber: 'ZK-728391', firmware: '6.60', description: '', connection: { ipAddress: '192.168.3.18', port: 4370, username: 'admin', credentialConfigured: true }, assignment: { company: 'OneVo', branch: 'Warehouse', location: 'Staff Entry', timezone: 'Asia/Colombo' }, syncConfig: { frequency: 'hourly', direction: 'device-to-hrms', autoRetry: true, retryAttempts: 3 }, status: 'offline', syncStatus: 'failed', healthScore: 35, lastHeartbeat: '2026-06-29T06:45:00Z', lastSync: '2026-06-29T06:30:00Z', nextSync: null, connectedSince: '2026-03-18T05:00:00Z', networkLatencyMs: null, activities: activities('bio-3') },
  { id: 'bio-4', name: 'Sales Office', brand: 'hikvision', model: 'DS-K1A802', serialNumber: 'HK-618422', firmware: '2.1.0', description: '', connection: { ipAddress: '192.168.4.22', port: 8000, username: 'admin', credentialConfigured: true }, assignment: { company: 'OneVo', branch: 'Sales Office', location: 'Reception', timezone: 'Asia/Colombo' }, syncConfig: { frequency: '15-minutes', direction: 'two-way', autoRetry: true, retryAttempts: 3 }, status: 'attention', syncStatus: 'failed', healthScore: 68, lastHeartbeat: '2026-06-29T08:35:00Z', lastSync: '2026-06-29T07:30:00Z', nextSync: '2026-06-29T08:45:00Z', connectedSince: '2026-06-02T04:00:00Z', networkLatencyMs: 96, activities: activities('bio-4') }
];
