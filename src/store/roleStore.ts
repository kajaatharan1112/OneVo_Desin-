import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { MOCK_ROLES, type AdminRole } from '../features/admin/adminMockData';
import { recordHistory } from './historyStore';

interface RoleStore {
  roles: AdminRole[];
  userAssignments: Record<string, string[]>;
  createRole: (input: Pick<AdminRole, 'name' | 'description' | 'permissionIds'>) => string;
  updateRole: (id: string, input: Pick<AdminRole, 'name' | 'description' | 'permissionIds'>) => void;
  deactivateRole: (id: string) => void;
  assignRoleToUsers: (roleId: string, userIds: string[]) => void;
  setEmployeeRoles: (employeeId: string, roleIds: string[]) => void;
  resetDemoRoles: () => void;
}

function seedAssignments(): Record<string, string[]> {
  return {
    'role-owner': ['user-1'],
    'role-people-admin': ['user-2'],
    'role-leave-approver': ['user-3'],
    'role-readonly': ['user-5']
  };
}

function withCounts(roles: AdminRole[], assignments: Record<string, string[]>): AdminRole[] {
  return roles.map(role => ({
    ...role,
    userCount: new Set(assignments[role.id] ?? []).size
  }));
}

export const useRoleStore = create<RoleStore>()(
  persist(
    (set, get) => ({
      roles: withCounts(MOCK_ROLES, seedAssignments()),
      userAssignments: seedAssignments(),

      createRole: input => {
        const id = `role-${Date.now()}`;
        const role: AdminRole = {
          id,
          name: input.name.trim(),
          description: input.description.trim(),
          type: 'custom',
          permissionIds: [...new Set(input.permissionIds)],
          userCount: 0,
          updatedAt: new Date().toISOString(),
          active: true
        };
        set(state => ({ roles: [role, ...state.roles] }));
        recordHistory({ title: 'Role created', description: `${role.name} was created with ${role.permissionIds.length} permissions.`, category: 'Access', target: role.name });
        return id;
      },

      updateRole: (id, input) => {
        set(state => ({
          roles: state.roles.map(role =>
            role.id === id && role.id !== 'role-owner'
              ? {
                  ...role,
                  name: input.name.trim(),
                  description: input.description.trim(),
                  permissionIds: [...new Set(input.permissionIds)],
                  updatedAt: new Date().toISOString()
                }
              : role
          )
        }));
        recordHistory({ title: 'Role permissions updated', description: `Permissions for ${input.name.trim()} were updated.`, category: 'Access', target: input.name.trim() });
      },

      deactivateRole: id => {
        const roleName = get().roles.find(role => role.id === id)?.name ?? 'Role';
        set(state => ({
          roles: state.roles.map(role =>
            role.id === id && role.type !== 'system'
              ? { ...role, active: false, updatedAt: new Date().toISOString() }
              : role
          )
        }));
        recordHistory({ title: 'Role deactivated', description: `${roleName} was deactivated.`, category: 'Access', target: roleName });
      },

      assignRoleToUsers: (roleId, userIds) => {
        const nextAssignments = {
          ...get().userAssignments,
          [roleId]: [...new Set([...(get().userAssignments[roleId] ?? []), ...userIds])]
        };
        set(state => ({
          userAssignments: nextAssignments,
          roles: withCounts(state.roles, nextAssignments)
        }));
      },

      setEmployeeRoles: (employeeId, roleIds) => {
        const nextAssignments = Object.fromEntries(
          Object.entries(get().userAssignments).map(([roleId, ids]) => [
            roleId,
            ids.filter(id => id !== employeeId)
          ])
        );
        for (const roleId of roleIds) {
          nextAssignments[roleId] = [...new Set([...(nextAssignments[roleId] ?? []), employeeId])];
        }
        set(state => ({
          userAssignments: nextAssignments,
          roles: withCounts(state.roles, nextAssignments)
        }));
      },

      resetDemoRoles: () => {
        const userAssignments = seedAssignments();
        set({ roles: withCounts(MOCK_ROLES, userAssignments), userAssignments });
      }
    }),
    {
      name: 'onevo-role-store',
      version: 2,
      partialize: state => ({ roles: state.roles, userAssignments: state.userAssignments })
    }
  )
);

export function getActiveRoles(): AdminRole[] {
  return useRoleStore.getState().roles.filter(role => role.active);
}
