import React from 'react';
import { ClipboardCheck } from 'lucide-react';
import { pendingOwnerApprovals } from '../../../data/tenant-today-productivity.data';

export const PendingRequestsPanel: React.FC = () => {
  return (
    <article className="ceo-pending" aria-label="Pending owner approvals">
      <header className="ceo-pending__head">
        <ClipboardCheck size={16} aria-hidden="true" />
        <h3 className="ceo-pending__title">Pending owner approvals</h3>
        <span className="ceo-pending__badge">Need your sign-off</span>
      </header>

      <div className="ceo-pending__table-wrap">
        <table className="ceo-pending__table">
          <thead>
            <tr>
              <th scope="col">Request</th>
              <th scope="col">Category</th>
              <th scope="col">Requested by</th>
              <th scope="col">Requested on</th>
              <th scope="col">Pending for</th>
              <th scope="col">Action</th>
            </tr>
          </thead>
          <tbody>
            {pendingOwnerApprovals.map((item) => (
              <tr key={item.id}>
                <td className="ceo-pending__request">{item.request}</td>
                <td>{item.category}</td>
                <td>{item.requestedBy}</td>
                <td>{item.requestedAt}</td>
                <td>
                  <span
                    className={`ceo-pending__days${item.pendingEmphasis ? ' ceo-pending__days--emphasis' : ''}`}
                  >
                    {item.pendingDays} {item.pendingDays === 1 ? 'day' : 'days'}
                  </span>
                </td>
                <td>
                  <div className="ceo-pending__actions">
                    <button type="button" className="ceo-pending__btn ceo-pending__btn--approve">
                      Approve
                    </button>
                    <button type="button" className="ceo-pending__btn ceo-pending__btn--reject">
                      Reject
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </article>
  );
};
