import React, { useEffect } from 'react';
import { Trash2 } from 'lucide-react';
import { MOCK_ROLES, GRANTABLE_PERMISSIONS } from '../admin/adminMockData';
import type { GeneratedAccessGrant } from './accessTypes';
import { formatGrantSummary } from './accessUtils';
import { getPositionAccessTemplate } from './positionAccessConfigStore';
import { POSITION_VISIBILITY_OPTIONS } from './visibilityModel';

function rolePermissionCodes(roleId: string): string[] {
  const role = MOCK_ROLES.find(r => r.id === roleId);
  if (!role) return [];
  return role.permissionIds
    .map(pid => GRANTABLE_PERMISSIONS.find(p => p.id === pid)?.code)
    .filter((c): c is string => Boolean(c));
}

interface PositionAccessSectionProps {
  targetPositionId: string;
  canEdit: boolean;
  grants: GeneratedAccessGrant[];
  onChange: (grants: GeneratedAccessGrant[]) => void;
}

export const PositionAccessSection: React.FC<PositionAccessSectionProps> = ({
  targetPositionId,
  canEdit,
  grants,
  onChange
}) => {
  useEffect(() => {
    if (targetPositionId) {
      onChange(getPositionAccessTemplate(targetPositionId));
    }
  }, [targetPositionId]);

  if (!targetPositionId) return null;

  if (!canEdit) {
    return (
      <div className="access-section access-section--readonly">
        <label className="schedules-cfg-form-section__label">Access impact</label>
        <p className="access-section__notice">
          This change includes access updates and requires approval.
        </p>
      </div>
    );
  }

  const updateGrant = (index: number, patch: Partial<GeneratedAccessGrant>) => {
    const next = [...grants];
    next[index] = { ...next[index], ...patch };
    onChange(next);
  };

  return (
    <div className="access-section">
      <label className="schedules-cfg-form-section__label">Access impact preview</label>
      <p className="access-section__hint">
        Generated from the target position template. Reporting visibility is derived from the org
        structure — not chosen manually.
      </p>

      {grants.length === 0 ? (
        <p className="access-section__empty">No elevated access generated for this position.</p>
      ) : (
        <ul className="access-section__list">
          {grants.map((grant, index) => (
            <li key={`${grant.roleId}-${index}`} className="access-grant-row access-grant-row--preview">
              <div className="access-grant-row__fields">
                <div className="org-form-field">
                  <label>Role to grant</label>
                  <select
                    value={grant.roleId}
                    onChange={e => {
                      const role = MOCK_ROLES.find(r => r.id === e.target.value);
                      if (!role) return;
                      updateGrant(index, {
                        roleId: role.id,
                        roleName: role.name,
                        permissionCodes: rolePermissionCodes(role.id)
                      });
                    }}
                  >
                    {MOCK_ROLES.filter(r => r.active).map(r => (
                      <option key={r.id} value={r.id}>
                        {r.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="org-form-field">
                  <label>Visibility</label>
                  <input
                    readOnly
                    className="settings-readonly"
                    value={POSITION_VISIBILITY_OPTIONS.find(o => o.value === grant.scope)?.label ?? grant.scope}
                  />
                </div>
              </div>
              <p className="access-grant-row__summary">{formatGrantSummary(grant)}</p>
              <button
                type="button"
                className="cfg-action-btn cfg-action-btn--icon cfg-action-btn--danger"
                onClick={() => onChange(grants.filter((_, i) => i !== index))}
                aria-label="Remove grant"
              >
                <Trash2 size={14} />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};
