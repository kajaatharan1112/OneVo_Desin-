import { ENABLED_MODULES } from '../admin/adminMockData';

/** Tenant has WorkPulse agent / device monitoring capability. */
export const TENANT_DEVICE_CAPABILITY = (ENABLED_MODULES as readonly string[]).includes('Monitoring');

/** Tenant has monitoring / exception alerts module. */
export const TENANT_MONITORING_CAPABILITY = TENANT_DEVICE_CAPABILITY;
