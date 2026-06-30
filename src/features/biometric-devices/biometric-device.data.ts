import type { BiometricBrand, BiometricDevice, DeviceLog } from './biometric-device.types';

export const BIOMETRIC_BRANDS: Array<{ name: BiometricBrand; hint: string }> = [
  { name: 'ZKTeco', hint: 'ZK protocol' }, { name: 'Hikvision', hint: 'ISAPI compatible' },
  { name: 'eSSL', hint: 'Attendance devices' }, { name: 'Suprema', hint: 'BioStar devices' },
  { name: 'Anviz', hint: 'CrossChex devices' }, { name: 'Others', hint: 'Custom integration' },
];

const log = (id: string, event: string, description: string, status: DeviceLog['status'], at: string): DeviceLog => ({ id, event, description, status, at });

export const INITIAL_BIOMETRIC_DEVICES: BiometricDevice[] = [
  {
    id: 'bio-001', name: 'Head Office Device', brand: 'ZKTeco', model: 'MB560', serialNumber: 'ZK982423342',
    firmware: 'Ver 8.0.3', ipAddress: '192.168.1.201', port: 4370, branch: 'Head Office', location: 'Main Entrance',
    timezone: 'Asia/Colombo', status: 'online', healthScore: 98, lastHeartbeat: '15 sec ago', lastSync: '2 min ago',
    nextSync: 'in 3 min', connectedSince: '12 May 2026, 10:30 AM', syncFrequency: 'Every 5 Minutes',
    syncDirection: 'Device → HRMS', autoRetry: true, retryAttempts: 3, latency: 18,
    logs: [log('l1','Device Connected','Device connected successfully','success','10:30:15 AM'), log('l2','Sync Completed','125 attendance records synced','success','10:31:18 AM'), log('l3','Configuration Updated','Synchronization frequency updated','info','Yesterday')],
  },
  {
    id: 'bio-002', name: 'Factory Gate', brand: 'Hikvision', model: 'DS-K1T341', serialNumber: 'HK11029482',
    firmware: 'V3.2.1', ipAddress: '192.168.2.44', port: 8000, branch: 'Factory', location: 'Gate 1', timezone: 'Asia/Colombo',
    status: 'online', healthScore: 94, lastHeartbeat: '32 sec ago', lastSync: '4 min ago', nextSync: 'in 1 min',
    connectedSince: '3 Jun 2026, 08:10 AM', syncFrequency: 'Every 5 Minutes', syncDirection: 'Two-Way Synchronization', autoRetry: true, retryAttempts: 3, latency: 26,
    logs: [log('l4','Sync Completed','88 attendance records synced','success','09:45:00 AM')],
  },
  {
    id: 'bio-003', name: 'Branch Office', brand: 'eSSL', model: 'uFace 302', serialNumber: 'ES8801934', firmware: 'V2.8',
    ipAddress: '10.0.0.18', port: 4370, branch: 'Kandy Branch', location: 'Reception', timezone: 'Asia/Colombo', status: 'online',
    healthScore: 91, lastHeartbeat: '1 min ago', lastSync: '5 min ago', nextSync: 'now', connectedSince: '18 Jun 2026, 09:00 AM',
    syncFrequency: 'Every 5 Minutes', syncDirection: 'Device → HRMS', autoRetry: true, retryAttempts: 5, latency: 38, logs: [],
  },
  {
    id: 'bio-004', name: 'Warehouse', brand: 'ZKTeco', model: 'F18', serialNumber: 'ZK44019931', firmware: 'V6.7',
    ipAddress: '10.12.0.9', port: 4370, branch: 'Warehouse', location: 'Staff Entrance', timezone: 'Asia/Colombo', status: 'offline',
    healthScore: 32, lastHeartbeat: '1 hour ago', lastSync: '1 hour ago', nextSync: 'Pending connection', connectedSince: '20 Jun 2026, 11:20 AM',
    syncFrequency: 'Every 15 Minutes', syncDirection: 'Device → HRMS', autoRetry: true, retryAttempts: 5, latency: 0,
    logs: [log('l5','Device Disconnected','Heartbeat timeout','failed','1 hour ago'), log('l6','Sync Failed','Network timeout','failed','58 min ago')],
  },
  {
    id: 'bio-005', name: 'Sales Office', brand: 'Hikvision', model: 'DS-K1A802', serialNumber: 'HK55719012', firmware: 'V1.9',
    ipAddress: '172.16.1.22', port: 8000, branch: 'Sales Office', location: 'Lobby', timezone: 'Asia/Colombo', status: 'attention',
    healthScore: 68, lastHeartbeat: '3 min ago', lastSync: '10 min ago', nextSync: 'Retrying', connectedSince: '24 Jun 2026, 01:40 PM',
    syncFrequency: 'Every 5 Minutes', syncDirection: 'Two-Way Synchronization', autoRetry: true, retryAttempts: 3, latency: 84,
    logs: [log('l7','Sync Failed','Partial employee mapping failure','failed','10 min ago')],
  },
];
