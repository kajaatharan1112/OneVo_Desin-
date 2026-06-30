import { create } from 'zustand';
import { SEED_BIOMETRIC_DEVICES } from './biometric-device.data';
import type { BiometricDevice, ConnectionTestResult, DeviceDraft, DeviceStatus } from './biometric-device.types';
import { recordHistory } from '../../store/historyStore';

interface BiometricDeviceState {
  devices: BiometricDevice[];
  addDevice: (draft: DeviceDraft, detected: NonNullable<ConnectionTestResult['detected']>) => BiometricDevice;
  setStatus: (id: string, status: DeviceStatus) => void;
  syncNow: (id: string) => void;
  removeDevice: (id: string) => void;
}

export const useBiometricDeviceStore = create<BiometricDeviceState>((set, get) => ({
  devices: SEED_BIOMETRIC_DEVICES,
  addDevice: (draft, detected) => {
    const now = new Date().toISOString();
    const device: BiometricDevice = {
      id: `bio-${Date.now()}`, name: draft.name, brand: draft.brand ?? 'other', description: draft.description,
      ...detected,
      connection: { ipAddress: draft.connection.ipAddress, port: draft.connection.port, username: draft.connection.username, credentialConfigured: true },
      assignment: draft.assignment, syncConfig: draft.syncConfig, status: 'online', syncStatus: 'success', healthScore: 100,
      lastHeartbeat: now, lastSync: now, nextSync: null, connectedSince: now, networkLatencyMs: 16,
      activities: [{ id: `activity-${Date.now()}`, timestamp: now, event: 'Device Connected', description: 'Device connected successfully', status: 'success' }]
    };
    set({ devices: [device, ...get().devices] });
    recordHistory({ title: 'Biometric device connected', description: `${device.name} was connected successfully.`, category: 'Settings', target: device.name });
    return device;
  },
  setStatus: (id, status) => {
    const device = get().devices.find(item => item.id === id);
    if (!device) return;
    const now = new Date().toISOString();
    set(state => ({
      devices: state.devices.map(item =>
        item.id === id
          ? {
              ...item,
              status,
              activities: [
                {
                  id: `activity-${Date.now()}`,
                  timestamp: now,
                  event: status === 'disabled' ? 'Device Disabled' : 'Device Enabled',
                  description:
                    status === 'disabled'
                      ? 'Device synchronization was disabled by an administrator'
                      : 'Device synchronization was enabled by an administrator',
                  status: 'info',
                },
                ...item.activities,
              ],
            }
          : item,
      ),
    }));
    recordHistory({
      title: status === 'disabled' ? 'Biometric device disabled' : 'Biometric device enabled',
      description: `${device.name} was ${status === 'disabled' ? 'disabled' : 'enabled'}.`,
      category: 'Settings',
      target: device.name,
    });
  },
  syncNow: id => {
    const device = get().devices.find(item => item.id === id);
    if (!device) return;
    const now = new Date().toISOString();
    set(state => ({
      devices: state.devices.map(item =>
        item.id === id
          ? {
              ...item,
              syncStatus: 'success',
              lastSync: now,
              activities: [
                {
                  id: `activity-${Date.now()}`,
                  timestamp: now,
                  event: 'Synchronization Completed',
                  description: 'Manual synchronization completed successfully',
                  status: 'success',
                },
                ...item.activities,
              ],
            }
          : item,
      ),
    }));
    recordHistory({ title: 'Biometric sync started', description: `Manual synchronization was run for ${device.name}.`, category: 'Settings', target: device.name });
  },
  removeDevice: id => {
    const device = get().devices.find(item => item.id === id);
    set(state => ({ devices: state.devices.filter(item => item.id !== id) }));
    if (device) {
      recordHistory({ title: 'Biometric device removed', description: `${device.name} was removed.`, category: 'Settings', target: device.name });
    }
  },
}));
