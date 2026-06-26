import React, { useMemo, useState } from 'react';
import { FileSpreadsheet, FileText, Loader2, Sparkles } from 'lucide-react';
import { useWork } from '../../context/work-context';
import { projectTasks, employeeName, type WorkProject } from '../../workMockData';

interface Props {
  project: WorkProject;
}

export const ProjectReportsPage: React.FC<Props> = ({ project }) => {
  const { tasks } = useWork();
  const [generatingPdf, setGeneratingPdf] = useState(false);
  const [generatingExcel, setGeneratingExcel] = useState(false);

  const projectTaskList = useMemo(
    () => projectTasks(project.id, tasks),
    [project.id, tasks]
  );

  const stats = useMemo(() => {
    const done = projectTaskList.filter(t => t.status === 'done').length;
    const total = projectTaskList.length;
    const progress = total > 0 ? Math.round((done / total) * 100) : 0;
    
    // Group tasks by assignee
    const assignees: Record<string, number> = {};
    projectTaskList.forEach(t => {
      const name = employeeName(t.assigneeId);
      assignees[name] = (assignees[name] || 0) + 1;
    });

    return { done, total, progress, assignees };
  }, [projectTaskList]);

  const handleExportPdf = () => {
    setGeneratingPdf(true);
    setTimeout(() => {
      setGeneratingPdf(false);
      // Trigger download
      const docHeader = `ONEVO PLATFORM - PROJECT REPORT SUMMARY\n`;
      const docProject = `Project: ${project.name} (${project.key})\nStatus: ${project.status.toUpperCase()}\nHealth: ${project.health.toUpperCase()}\n`;
      const docTimeline = `Start Date: ${project.startDate}\nDue Date: ${project.dueDate || '—'}\n`;
      const docTasks = `Total Tasks: ${stats.total}\nCompleted Tasks: ${stats.done}\nProgress: ${stats.progress}%\n`;
      const docAssigneeTitle = `\nAssignee Workload:\n`;
      const docAssigneeList = Object.entries(stats.assignees).map(([name, count]) => `- ${name}: ${count} task(s)`).join('\n');
      
      const content = docHeader + '\n' + docProject + docTimeline + docTasks + docAssigneeTitle + docAssigneeList;
      const blob = new Blob([content], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${project.key}_Project_Report.txt`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }, 1500);
  };

  const handleExportExcel = () => {
    setGeneratingExcel(true);
    setTimeout(() => {
      setGeneratingExcel(false);
      // Trigger CSV download
      let csvContent = "data:text/csv;charset=utf-8,";
      csvContent += "Task Key,Title,Status,Priority,Assignee,Due Date\n";
      
      projectTaskList.forEach(t => {
        const row = `"${t.key}","${t.title}","${t.status}","${t.priority}","${employeeName(t.assigneeId)}","${t.dueDate || ''}"\n`;
        csvContent += row;
      });

      const encodedUri = encodeURI(csvContent);
      const link = document.createElement('a');
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", `${project.key}_Tasks_Export.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }, 1500);
  };

  return (
    <div className="work-screen" style={{ padding: '0 20px 24px' }}>
      <div className="work-screen__head">
        <div>
          <h3 className="work-screen__title">Project Reports</h3>
          <p className="work-screen__desc">Generate, inspect, and export comprehensive project summaries and workload datasets.</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '20px', marginTop: '16px' }}>
        {/* Left Side: Summary Metrics */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div className="work-panel">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
              <Sparkles size={16} style={{ color: 'var(--accent)' }} />
              <h4 style={{ margin: 0, fontSize: '14px', fontWeight: 600, color: 'var(--text-h)' }}>
                Report Dashboard Summary
              </h4>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
              <div style={{ padding: '14px', borderRadius: '8px', background: 'var(--surface-muted)', border: '1px solid var(--border)' }}>
                <span style={{ fontSize: '12px', color: 'var(--text-m)' }}>Completion Rate</span>
                <span style={{ display: 'block', fontSize: '24px', fontWeight: 700, color: 'var(--text-h)', marginTop: '4px' }}>
                  {stats.progress}%
                </span>
              </div>
              <div style={{ padding: '14px', borderRadius: '8px', background: 'var(--surface-muted)', border: '1px solid var(--border)' }}>
                <span style={{ fontSize: '12px', color: 'var(--text-m)' }}>Total Work Items</span>
                <span style={{ display: 'block', fontSize: '24px', fontWeight: 700, color: 'var(--text-h)', marginTop: '4px' }}>
                  {stats.total}
                </span>
              </div>
            </div>

            <h5 style={{ margin: '0 0 12px 0', fontSize: '13px', fontWeight: 600, color: 'var(--text-h)' }}>
              Workload Allocation by Employee
            </h5>
            <div className="cfg-table-wrap">
              <table className="cfg-table" style={{ fontSize: '12px' }}>
                <thead>
                  <tr>
                    <th>Employee Name</th>
                    <th style={{ textAlign: 'right' }}>Tasks Allocated</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(stats.assignees).map(([name, count]) => (
                    <tr key={name}>
                      <td style={{ fontWeight: 500 }}>{name}</td>
                      <td style={{ textAlign: 'right', fontWeight: 600 }}>{count}</td>
                    </tr>
                  ))}
                  {Object.keys(stats.assignees).length === 0 && (
                    <tr>
                      <td colSpan={2} className="admin-hint" style={{ textAlign: 'center' }}>No tasks allocated yet.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right Side: Export Action Buttons */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div className="work-panel" style={{ padding: '24px' }}>
            <h4 style={{ margin: '0 0 12px 0', fontSize: '14px', fontWeight: 600, color: 'var(--text-h)' }}>
              Export Datasets
            </h4>
            <p style={{ margin: '0 0 24px 0', fontSize: '13px', color: 'var(--text-m)', lineHeight: '1.4' }}>
              Download project health summaries and full task CSVs for executive syncs or Excel import analysis.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <button 
                type="button" 
                className="org-btn org-btn--secondary" 
                onClick={handleExportPdf}
                disabled={generatingPdf}
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '12px' }}
              >
                {generatingPdf ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    Compiling PDF Report...
                  </>
                ) : (
                  <>
                    <FileText size={16} style={{ color: '#ef4444' }} />
                    Download PDF Summary
                  </>
                )}
              </button>

              <button 
                type="button" 
                className="org-btn org-btn--secondary" 
                onClick={handleExportExcel}
                disabled={generatingExcel}
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '12px' }}
              >
                {generatingExcel ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    Generating Excel Dataset...
                  </>
                ) : (
                  <>
                    <FileSpreadsheet size={16} style={{ color: '#10b981' }} />
                    Download Excel Dataset (.csv)
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
