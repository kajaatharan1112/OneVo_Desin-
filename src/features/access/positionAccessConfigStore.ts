import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { EmployeeAccessArea } from './visibilityModel';
import { normalizeEmployeeAccessArea } from './visibilityModel';
import { POSITION_ACCESS_TEMPLATES } from './positionAccessTemplates';
import type { GeneratedAccessGrant } from './accessTypes';

export interface PositionAccessConfig {
  enabled: boolean;
  roleId: string;
  roleName: string;
  accessArea: EmployeeAccessArea;
  departmentIds?: string[];
  departmentNames?: string[];
  positionIds?: string[];
  positionNames?: string[];
  requiresApproval: boolean;
  permissionCodes: string[];
}

interface PositionAccessConfigStore {
  overrides: Record<string, PositionAccessConfig>;
  setConfig: (positionId: string, config: PositionAccessConfig) => void;
  clearConfig: (positionId: string) => void;
  getConfig: (positionId: string) => PositionAccessConfig | null;
  getTemplateGrants: (positionId: string) => GeneratedAccessGrant[];
}

const disabledConfig: PositionAccessConfig = {
  enabled: false,
  roleId: '',
  roleName: '',
  accessArea: 'none',
  requiresApproval: false,
  permissionCodes: []
};

function staticConfig(positionId: string): PositionAccessConfig | null {
  const entries = POSITION_ACCESS_TEMPLATES[positionId];
  if (!entries?.length) return null;
  const e = entries[0];
  return {
    enabled: e.enabled,
    roleId: e.roleId,
    roleName: e.roleName,
    accessArea: normalizeEmployeeAccessArea(e.accessArea),
    departmentIds: e.departmentIds ? [...e.departmentIds] : undefined,
    departmentNames: e.departmentNames ? [...e.departmentNames] : undefined,
    positionIds: e.positionIds ? [...e.positionIds] : undefined,
    positionNames: e.positionNames ? [...e.positionNames] : undefined,
    requiresApproval: e.requiresApproval,
    permissionCodes: [...e.permissionCodes]
  };
}

export const usePositionAccessConfigStore = create<PositionAccessConfigStore>()(persist((set, get) => ({
  overrides: {},

  setConfig: (positionId, config) => {
    set(s => ({ overrides: { ...s.overrides, [positionId]: config } }));
  },

  clearConfig: positionId => {
    set(s => ({ overrides: { ...s.overrides, [positionId]: disabledConfig } }));
  },

  getConfig: positionId => {
    return get().overrides[positionId] ?? staticConfig(positionId);
  },

  getTemplateGrants: positionId => {
    const config = get().getConfig(positionId);
    if (!config?.enabled || !config.roleId) return [];
    return [
      {
        roleId: config.roleId,
        roleName: config.roleName,
        accessArea: config.accessArea,
        departmentIds: config.departmentIds ? [...config.departmentIds] : undefined,
        departmentNames: config.departmentNames ? [...config.departmentNames] : undefined,
        positionIds: config.positionIds ? [...config.positionIds] : undefined,
        positionNames: config.positionNames ? [...config.positionNames] : undefined,
        requiresApproval: config.requiresApproval,
        permissionCodes: [...config.permissionCodes]
      }
    ];
  }
}), { name: 'onevo-position-access-config', version: 1 }));

export function getPositionAccessTemplate(positionId: string): GeneratedAccessGrant[] {
  return usePositionAccessConfigStore.getState().getTemplateGrants(positionId);
}
