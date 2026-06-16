import { create } from 'zustand';
import type { AccessScope } from './visibilityModel';
import { POSITION_ACCESS_TEMPLATES } from './positionAccessTemplates';
import type { GeneratedAccessGrant } from './accessTypes';

export interface PositionAccessConfig {
  roleId: string;
  roleName: string;
  visibility: AccessScope;
  permissionCodes: string[];
}

interface PositionAccessConfigStore {
  overrides: Record<string, PositionAccessConfig>;
  setConfig: (positionId: string, config: PositionAccessConfig) => void;
  getConfig: (positionId: string) => PositionAccessConfig | null;
  getTemplateGrants: (positionId: string) => GeneratedAccessGrant[];
}

function staticConfig(positionId: string): PositionAccessConfig | null {
  const entries = POSITION_ACCESS_TEMPLATES[positionId];
  if (!entries?.length) return null;
  const e = entries[0];
  return {
    roleId: e.roleId,
    roleName: e.roleName,
    visibility: e.scope,
    permissionCodes: [...e.permissionCodes]
  };
}

export const usePositionAccessConfigStore = create<PositionAccessConfigStore>((set, get) => ({
  overrides: {},

  setConfig: (positionId, config) => {
    set(s => ({ overrides: { ...s.overrides, [positionId]: config } }));
  },

  getConfig: positionId => {
    return get().overrides[positionId] ?? staticConfig(positionId);
  },

  getTemplateGrants: positionId => {
    const config = get().getConfig(positionId);
    if (!config) return [];
    return [
      {
        roleId: config.roleId,
        roleName: config.roleName,
        scope: config.visibility,
        permissionCodes: [...config.permissionCodes]
      }
    ];
  }
}));

export function getPositionAccessTemplate(positionId: string): GeneratedAccessGrant[] {
  return usePositionAccessConfigStore.getState().getTemplateGrants(positionId);
}
