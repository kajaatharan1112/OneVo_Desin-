import React, { useEffect } from 'react';
import { useBulkOnboardingStore } from '../../../../store/bulkOnboardingStore';
import { useOrganizationStore } from '../../../../store/organizationStore';
import { getSuggestedRoleIdsForPosition } from '../../employees/positionAccessUtils';
import { MOCK_ROLES } from '../../../admin/adminMockData';
import type { BulkAccessGroup } from '../bulkOnboardingTypes';

export const Step4ReviewAccess: React.FC = () => {
  const { rows, accessGroups, setAccessGroups, nextStep, prevStep } = useBulkOnboardingStore();
  const { positions } = useOrganizationStore();

  useEffect(() => {
    const groups = new Map<string, BulkAccessGroup>();
    for (const row of rows) {
      if (!row.resolvedPositionId || row.skip) continue;
      const existing = groups.get(row.resolvedPositionId);
      if (existing) {
        existing.rowIndexes.push(row.rowIndex);
      } else {
        const position = positions.find(p => p.id === row.resolvedPositionId);
        const suggested = getSuggestedRoleIdsForPosition(row.resolvedPositionId);
        groups.set(row.resolvedPositionId, {
          positionId: row.resolvedPositionId,
          positionName: position?.name ?? 'Unknown',
          rowIndexes: [row.rowIndex],
          suggestedRoleIds: suggested,
          confirmedRoleIds: suggested
        });
      }
    }
    setAccessGroups(Array.from(groups.values()));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rows]);

  const toggleRole = (positionId: string, roleId: string) => {
    setAccessGroups(accessGroups.map(g => {
      if (g.positionId !== positionId) return g;
      const has = g.confirmedRoleIds.includes(roleId);
      return { ...g, confirmedRoleIds: has ? g.confirmedRoleIds.filter(r => r !== roleId) : [...g.confirmedRoleIds, roleId] };
    }));
  };

  return (
    <div className="bulk-onboard-step">
      <h3>Review Access Impact</h3>
      <p className="emp-form-hint">Rows are grouped by resolved position. Confirm the access each group will receive — nothing is applied until import.</p>

      {accessGroups.length === 0 && <p className="cfg-empty__title">No rows with a resolved position.</p>}

      {accessGroups.map(group => (
        <div key={group.positionId} className="emp-record-card">
          <div className="emp-record-card__head">
            <h2 className="emp-record-card__title">{group.positionName} · {group.rowIndexes.length} employee(s)</h2>
          </div>
          {MOCK_ROLES.filter(r => r.active).map(role => (
            <label key={role.id} className="cip-toggle-row">
              <input
                type="checkbox"
                checked={group.confirmedRoleIds.includes(role.id)}
                onChange={() => toggleRole(group.positionId, role.id)}
              />
              {role.name}
              {group.suggestedRoleIds.includes(role.id) && <span className="cfg-badge cfg-badge--active">Suggested</span>}
            </label>
          ))}
        </div>
      ))}

      <div className="bulk-onboard-step__footer">
        <button type="button" className="org-btn org-btn--secondary" onClick={prevStep}>Back</button>
        <button type="button" className="org-btn org-btn--primary" onClick={nextStep}>Next</button>
      </div>
    </div>
  );
};
