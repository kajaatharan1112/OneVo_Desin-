import React, { useMemo, useState } from 'react';
import { Download, FileText, Search, Trash2, UploadCloud } from 'lucide-react';
import { useWork } from '../../context/work-context';
import { CURRENT_USER_ID, employeeName, type WorkDocument, type WorkProject } from '../../workMockData';

interface Props {
  project: WorkProject;
}

interface UploadingFile {
  name: string;
  size: string;
  progress: number;
  id: string;
}

export const ProjectFilesPage: React.FC<Props> = ({ project }) => {
  const { documents } = useWork();
  const [localDocs, setLocalDocs] = useState<WorkDocument[]>(() => 
    documents.filter(d => d.projectId === project.id)
  );
  const [search, setSearch] = useState('');
  const [uploading, setUploading] = useState<UploadingFile[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);

  const filteredDocs = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return localDocs;
    return localDocs.filter(d => d.name.toLowerCase().includes(q) || d.type.toLowerCase().includes(q));
  }, [localDocs, search]);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const simulateUpload = (fileName: string) => {
    const id = `upload-${Date.now()}`;
    const newUpload = { name: fileName, size: '2.4 MB', progress: 0, id };
    setUploading(prev => [...prev, newUpload]);

    let currentProgress = 0;
    const interval = setInterval(() => {
      currentProgress += 10;
      setUploading(prev => 
        prev.map(item => item.id === id ? { ...item, progress: currentProgress } : item)
      );

      if (currentProgress >= 100) {
        clearInterval(interval);
        setTimeout(() => {
          // Remove from uploading list
          setUploading(prev => prev.filter(item => item.id !== id));
          
          // Add to local documents list
          const newDoc: WorkDocument = {
            id: `doc-${Date.now()}`,
            name: fileName,
            type: fileName.split('.').pop()?.toUpperCase() || 'Doc',
            ownerId: CURRENT_USER_ID,
            projectId: project.id,
            projectName: project.name,
            workspaceIds: project.workspaceIds,
            scope: 'project',
            status: 'draft',
            version: '1.0',
            locked: false,
            updatedAt: new Date().toISOString()
          };
          setLocalDocs(prev => [newDoc, ...prev]);
        }, 300);
      }
    }, 150);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      simulateUpload(file.name);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      simulateUpload(file.name);
    }
  };

  const handleDelete = (docId: string) => {
    if (window.confirm('Are you sure you want to delete this file?')) {
      setLocalDocs(prev => prev.filter(d => d.id !== docId));
    }
  };

  const handleDownload = (doc: WorkDocument) => {
    // Generate text/csv report content to download
    const content = `OneVo Documents System\nFile: ${doc.name}\nType: ${doc.type}\nVersion: ${doc.version}\nProject: ${project.name}\nUpdated: ${new Date(doc.updatedAt).toLocaleString()}`;
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = doc.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="work-screen" style={{ padding: '0 20px 24px' }}>
      <div className="work-screen__head">
        <div>
          <h3 className="work-screen__title">Project Files & Docs</h3>
          <p className="work-screen__desc">Share deliverables, wireframes, and design specs with the team.</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: '20px', marginTop: '16px' }}>
        {/* Upload Column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div 
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            style={{
              border: isDragOver ? '2px dashed var(--accent)' : '2px dashed var(--border)',
              borderRadius: '12px',
              padding: '30px 20px',
              textAlign: 'center',
              backgroundColor: isDragOver ? 'rgba(99, 102, 241, 0.05)' : 'var(--surface-panel)',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              position: 'relative'
            }}
          >
            <input 
              type="file" 
              onChange={handleFileSelect} 
              style={{
                position: 'absolute',
                inset: 0,
                opacity: 0,
                cursor: 'pointer'
              }}
              id="file-upload-input"
            />
            <UploadCloud size={32} style={{ color: 'var(--text-m)', opacity: 0.7, marginBottom: '12px' }} />
            <h4 style={{ margin: '0 0 6px 0', fontSize: '14px', color: 'var(--text-h)', fontWeight: 600 }}>
              Drag & drop to upload
            </h4>
            <p style={{ margin: 0, fontSize: '12px', color: 'var(--text-m)' }}>
              Or click to browse from files
            </p>
          </div>

          {uploading.length > 0 && (
            <div className="work-panel">
              <h4 style={{ margin: '0 0 12px 0', fontSize: '13px', fontWeight: 600, color: 'var(--text-h)' }}>
                Uploading Files ({uploading.length})
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {uploading.map(file => (
                  <div key={file.id}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '4px' }}>
                      <span style={{ color: 'var(--text-h)', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '160px' }} title={file.name}>
                        {file.name}
                      </span>
                      <span style={{ color: 'var(--text-m)' }}>{file.progress}%</span>
                    </div>
                    <div style={{ height: '4px', background: 'var(--border)', borderRadius: '2px', overflow: 'hidden' }}>
                      <div style={{ width: `${file.progress}%`, height: '100%', background: 'var(--accent)', transition: 'width 0.15s ease-out' }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Files Directory Column */}
        <div className="work-panel" style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 600, color: 'var(--text-h)' }}>
              Files Directory
            </h3>
            <div className="cfg-search" style={{ width: '220px' }}>
              <Search size={14} />
              <input 
                placeholder="Search files…" 
                value={search}
                onChange={e => setSearch(e.target.value)}
                aria-label="Search files"
              />
            </div>
          </div>

          <div className="cfg-table-wrap" style={{ flex: 1 }}>
            <table className="cfg-table">
              <thead>
                <tr>
                  <th>File Name</th>
                  <th>Type</th>
                  <th>Version</th>
                  <th>Last Updated</th>
                  <th>Owner</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredDocs.map(doc => (
                  <tr key={doc.id}>
                    <td className="cfg-table__name" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <FileText size={14} style={{ color: 'var(--text-m)' }} />
                      <span style={{ fontWeight: 500 }}>{doc.name}</span>
                    </td>
                    <td><span className="cfg-table__meta">{doc.type}</span></td>
                    <td>v{doc.version}</td>
                    <td>{new Date(doc.updatedAt).toLocaleDateString(undefined, { dateStyle: 'medium' })}</td>
                    <td>{employeeName(doc.ownerId)}</td>
                    <td>
                      <div className="work-table-actions" style={{ justifyContent: 'flex-end', gap: '8px' }}>
                        <button 
                          type="button" 
                          className="cfg-action-btn"
                          onClick={() => handleDownload(doc)}
                          title="Download file"
                        >
                          <Download size={14} />
                        </button>
                        <button 
                          type="button" 
                          className="cfg-action-btn"
                          onClick={() => handleDelete(doc.id)}
                          style={{ color: '#ef4444' }}
                          title="Delete file"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}

                {filteredDocs.length === 0 && (
                  <tr>
                    <td colSpan={6} className="admin-hint" style={{ textAlign: 'center', padding: '40px' }}>
                      No files found. Drag & drop file to upload your first design or document asset.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
