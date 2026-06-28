import React, { useMemo, useRef, useState } from 'react';
import { ArrowRight, CheckCircle2, Download, Eye, FileSpreadsheet, UploadCloud, X, AlertCircle } from 'lucide-react';
import { useBulkOnboardingStore, runId } from '../../../store/bulkOnboardingStore';
import { useOrganizationStore } from '../../../store/organizationStore';
import { autoMapColumns, buildImportRows, getUnmappedRequiredFields, summarizeRows, validateImportRows } from './bulkOnboardingUtils';
import { BULK_IMPORT_REQUIRED_COLUMNS, type BulkImportField, type BulkImportRow, type ImportRun } from './bulkOnboardingTypes';
import './bulkOnboarding.css';

const escapeXml = (value: string) => value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const excelRow = (values: readonly string[]) => `<Row>${values.map(value => `<Cell><Data ss:Type="String">${escapeXml(value)}</Data></Cell>`).join('')}</Row>`;
const templateExcel = `<?xml version="1.0"?><?mso-application progid="Excel.Sheet"?>
<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet" xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet">
<Worksheet ss:Name="Employees"><Table>${excelRow(BULK_IMPORT_REQUIRED_COLUMNS)}${excelRow(['EMP-001','Jane','Doe','jane@company.com','Engineering','Software Engineer','2026-07-01','Full-time'])}</Table></Worksheet></Workbook>`;

const parseExcelSheet = (text: string): { headers: string[]; rows: string[][] } => {
  const documentXml = new DOMParser().parseFromString(text, 'application/xml');
  if (documentXml.querySelector('parsererror')) return { headers: [], rows: [] };
  const parsedRows = Array.from(documentXml.getElementsByTagName('Row')).map(row =>
    Array.from(row.getElementsByTagName('Cell')).map(cell => cell.getElementsByTagName('Data')[0]?.textContent?.trim() ?? '')
  );
  return { headers: parsedRows[0] ?? [], rows: parsedRows.slice(1).filter(row => row.some(Boolean)) };
};

export const BulkOnboardingPage: React.FC = () => {
  const { importRuns, recordImportRun } = useBulkOnboardingStore();
  const { departments, positions, assignments, employees, completeEmployeeOnboarding } = useOrganizationStore();
  const [modalOpen, setModalOpen] = useState(false);
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [fileName, setFileName] = useState('');
  const [headers, setHeaders] = useState<string[]>([]);
  const [rawRows, setRawRows] = useState<string[][]>([]);
  const [mapping, setMapping] = useState<Record<string, BulkImportField | ''>>({});
  const [rows, setRows] = useState<BulkImportRow[]>([]);
  const [successOpen, setSuccessOpen] = useState(false);
  const [selectedBatch, setSelectedBatch] = useState<ImportRun | null>(null);
  const [uploadError, setUploadError] = useState('');
  const [hasValidated, setHasValidated] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const unmapped = getUnmappedRequiredFields(mapping);
  const summary = useMemo(() => summarizeRows(rows), [rows]);
  const errors = rows.flatMap(row => row.errors.map(error => ({ rowIndex: row.rowIndex, error })));

  const resetFlow = () => {
    setStep(1); setFileName(''); setHeaders([]); setRawRows([]); setMapping({}); setRows([]); setUploadError(''); setHasValidated(false);
  };

  const downloadTemplate = () => {
    const url = URL.createObjectURL(new Blob([templateExcel], { type: 'application/vnd.ms-excel' }));
    const anchor = document.createElement('a');
    anchor.href = url; anchor.download = 'bulk-onboarding-template.xls'; anchor.click();
    URL.revokeObjectURL(url);
  };

  const uploadExcel = async (file: File) => {
    if (!file.name.toLowerCase().endsWith('.xls')) { setUploadError('Please upload the Excel .xls template.'); return; }
    const parsed = parseExcelSheet(await file.text());
    if (!parsed.headers.length || !parsed.rows.length) { setUploadError('The Excel sheet must include a header and at least one employee.'); return; }
    const autoMapping = autoMapColumns(parsed.headers);
    setFileName(file.name); setHeaders(parsed.headers); setRawRows(parsed.rows); setMapping(autoMapping);
    setRows(buildImportRows(parsed.headers, parsed.rows, autoMapping)); setHasValidated(false); setUploadError(''); setStep(2);
  };

  const applyMapping = (nextMapping: Record<string, BulkImportField | ''>) => {
    setMapping(nextMapping);
    setRows(buildImportRows(headers, rawRows, nextMapping));
    setHasValidated(false);
  };

  const revalidate = () => {
    setRows(current => validateImportRows(current, departments, positions, assignments, employees));
    setHasValidated(true);
  };

  const updateCell = (rowIndex: number, field: keyof BulkImportRow, value: string) => {
    setRows(current => current.map(row => row.rowIndex === rowIndex ? { ...row, [field]: value, errors: [] } : row));
    setHasValidated(false);
  };

  const completeImport = () => {
    const validated = validateImportRows(rows, departments, positions, assignments, employees);
    setRows(validated);
    if (validated.some(row => row.errors.length)) return;
    const createdEmployeeIds: string[] = [];
    validated.forEach(row => {
      const result = completeEmployeeOnboarding({
        firstName: row.firstName, lastName: row.lastName, email: row.workEmail, workEmail: row.workEmail,
        phone: '', employeeNumber: row.employeeNumber, legalEntity: '',
        employmentType: row.employmentType.toLowerCase() === 'part-time' ? 'part-time' : 'full-time',
        startDate: row.startDate, workMode: 'onsite', positionId: row.resolvedPositionId || '', confirmedRoleIds: []
      });
      if (result.employeeId) createdEmployeeIds.push(result.employeeId);
    });
    const batch: ImportRun = {
      id: runId(), fileName, uploadedBy: 'Chief Executive Officer', uploadedAt: new Date().toISOString(),
      totalRows: validated.length, importedCount: createdEmployeeIds.length, warningCount: validated.filter(row => row.warnings.length).length,
      failedCount: 0, skippedCount: 0, inviteStatus: 'not-sent', status: 'imported', createdEmployeeIds,
      failedRows: [], rows: validated
    };
    recordImportRun(batch); setModalOpen(false); setSuccessOpen(true); resetFlow();
  };

  return (
    <div className="bulk-flow-page">
      <header className="bulk-flow-page__header">
        <div><span className="bulk-flow-page__eyebrow">Settings</span><h1>Bulk Onboarding</h1><p>Upload, validate, and onboard employee batches from one clean workflow.</p></div>
        <button className="org-btn org-btn--primary bulk-flow-page__button" type="button" onClick={() => setModalOpen(true)}><UploadCloud size={16} /> Bulk Onboarding</button>
      </header>

      <section className="bulk-flow-diagram" aria-label="Bulk onboarding user flow">
        <div className="bulk-flow-node bulk-flow-node--blue"><FileSpreadsheet size={22} /><span>Step 1</span><strong>Excel Upload</strong><small>Download template and upload completed Excel sheet</small></div>
        <ArrowRight className="bulk-flow-arrow" size={24} />
        <div className="bulk-flow-node bulk-flow-node--violet"><AlertCircle size={22} /><span>Step 2</span><strong>Column Mapping</strong><small>Map Excel columns to HRMS fields</small></div>
        <ArrowRight className="bulk-flow-arrow" size={24} />
        <div className="bulk-flow-node bulk-flow-node--green"><CheckCircle2 size={22} /><span>Step 3</span><strong>Validation & Onboard</strong><small>Fix errors, revalidate, and onboard employees</small></div>
      </section>

      <section className="bulk-batch-section">
        <div className="bulk-batch-section__head"><div><h2>Bulk Onboarding List</h2><p>{importRuns.length} uploaded batches</p></div></div>
        <div className="bulk-batch-list">
          {importRuns.length === 0 ? <div className="bulk-batch-empty"><FileSpreadsheet size={28} /><strong>No batches uploaded yet</strong><span>Use Bulk Onboarding to create your first batch.</span></div> : importRuns.map(batch => (
            <article className="bulk-batch-row" key={batch.id}>
              <div className="bulk-batch-row__icon"><FileSpreadsheet size={18} /></div>
              <div><strong>{batch.fileName}</strong><span>{new Date(batch.uploadedAt).toLocaleString()}</span></div>
              <span>{batch.totalRows} employees</span><span className="bulk-count bulk-count--success">{batch.importedCount} successful</span><span className="bulk-count bulk-count--failed">{batch.failedCount} failed</span>
              <button type="button" className="cfg-action-btn" title="View batch" aria-label={`View ${batch.fileName}`} onClick={() => setSelectedBatch(batch)}><Eye size={16} /></button>
            </article>
          ))}
        </div>
      </section>

      {modalOpen && <div className="bulk-center-overlay" onMouseDown={() => setModalOpen(false)}><section className="bulk-center-modal" role="dialog" aria-modal="true" onMouseDown={event => event.stopPropagation()}>
        <header><div><span>Bulk Onboarding</span><h2>{step === 1 ? 'Excel Upload' : step === 2 ? 'Column Mapping' : 'Validation & Onboard'}</h2></div><button type="button" className="cfg-action-btn" aria-label="Close" onClick={() => setModalOpen(false)}><X size={17} /></button></header>
        <div className="bulk-stepper"><div className="is-active"><b>1</b><span>Excel Upload</span></div><i /><div className={step >= 2 ? 'is-active' : ''}><b>2</b><span>Column Mapping</span></div><i /><div className={step === 3 ? 'is-active' : ''}><b>3</b><span>Validation & Onboard</span></div></div>
        <div className="bulk-center-modal__body">
          {step === 1 ? <div className="bulk-upload-step">
            <div className="bulk-template-card"><Download size={22} /><div><strong>Download Excel template</strong><span>Fill in employee details using the required format.</span></div><button type="button" className="org-btn org-btn--secondary" onClick={downloadTemplate}>Download Template</button></div>
            <button type="button" className="bulk-upload-zone" onClick={() => inputRef.current?.click()}><UploadCloud size={32} /><strong>Upload completed Excel sheet</strong><span>Click to browse your file</span></button>
            <input ref={inputRef} hidden type="file" accept=".xls,application/vnd.ms-excel" onChange={event => { const file = event.target.files?.[0]; if (file) void uploadExcel(file); }} />
            {uploadError && <p className="bulk-inline-error">{uploadError}</p>}
          </div> : step === 2 ? <div className="bulk-validation-step">
            <div className="bulk-step-intro"><h3>Map Excel columns</h3><p>Match every uploaded column with the correct HRMS employee field.</p></div>
            <div className="bulk-mapping-grid">{headers.map((header, index) => <label key={header}><span>{header}<small>{rawRows[0]?.[index]}</small></span><select value={mapping[header] || ''} onChange={event => applyMapping({ ...mapping, [header]: event.target.value as BulkImportField | '' })}><option value="">Ignore</option>{BULK_IMPORT_REQUIRED_COLUMNS.map(field => <option key={field} value={field}>{field}</option>)}</select></label>)}</div>
            {unmapped.length > 0 && <div className="bulk-error-panel"><h3>Required mappings</h3>{unmapped.map(field => <button key={field} type="button">Map required field: {field}</button>)}</div>}
            <div className="bulk-validation-actions"><button type="button" className="org-btn org-btn--secondary" onClick={() => setStep(1)}>Back</button><button type="button" className="org-btn org-btn--primary" disabled={unmapped.length > 0} onClick={() => setStep(3)}>Continue to Validation</button></div>
          </div> : <div className="bulk-validation-step">
            <div className="bulk-step-intro"><h3>Validate employee data</h3><p>Correct invalid cells, revalidate the batch, then onboard employees.</p></div>
            {rows.length > 0 && <div className="bulk-edit-table"><table><thead><tr><th>Row</th><th>Employee No.</th><th>First Name</th><th>Last Name</th><th>Email</th><th>Department</th><th>Position</th><th>Start Date</th><th>Type</th></tr></thead><tbody>{rows.map(row => <tr key={row.rowIndex} className={row.errors.length ? 'has-error' : ''}><td>{row.rowIndex + 2}</td>{([['employeeNumber','Employee number'],['firstName','First name'],['lastName','Last name'],['workEmail','Email'],['departmentName','Department'],['positionName','Position'],['startDate','Start date'],['employmentType','Employment type']] as const).map(([field,label]) => <td key={field}><input aria-label={`${label} row ${row.rowIndex + 2}`} value={String(row[field])} onChange={event => updateCell(row.rowIndex, field, event.target.value)} /></td>)}</tr>)}</tbody></table></div>}
            <div className="bulk-validation-actions"><button type="button" className="org-btn org-btn--secondary" onClick={() => setStep(2)}>Back</button><button type="button" className="org-btn org-btn--secondary" onClick={revalidate}>Revalidate</button><button type="button" className="org-btn org-btn--primary" disabled={!hasValidated || errors.length > 0} onClick={completeImport}>Onboard Employees</button></div>
            {hasValidated && errors.length > 0 && <div className="bulk-error-panel"><h3>Validation errors</h3>{errors.map((item,index) => <button key={`${item.rowIndex}-${index}`} type="button" onClick={() => document.querySelector<HTMLInputElement>(`[aria-label$="row ${item.rowIndex + 2}"]`)?.focus()}>Row {item.rowIndex + 2}: {item.error}</button>)}</div>}
            {hasValidated && !errors.length && rows.length > 0 && <div className="bulk-valid-card"><CheckCircle2 size={18} /> Ready to onboard {summary.valid + summary.warning} employees</div>}
          </div>}
        </div>
      </section></div>}

      {successOpen && <div className="bulk-center-overlay"><div className="bulk-success-modal" role="status"><span><CheckCircle2 size={34} /></span><h2>Employees Successfully Onboarded</h2><p>The validated batch has been added to the Bulk Onboarding List.</p><button type="button" className="org-btn org-btn--primary" onClick={() => setSuccessOpen(false)}>View Bulk Onboarding List</button></div></div>}

      {selectedBatch && <div className="bulk-drawer-overlay" onMouseDown={() => setSelectedBatch(null)}><aside className="bulk-batch-drawer" onMouseDown={event => event.stopPropagation()}><header><div><span>Batch Details</span><h2>{selectedBatch.fileName}</h2></div><button type="button" className="cfg-action-btn" aria-label="Close" onClick={() => setSelectedBatch(null)}><X size={17} /></button></header><div className="bulk-batch-drawer__content">
        <div className="bulk-drawer-stats"><div><strong>{selectedBatch.totalRows}</strong><span>Total</span></div><div className="is-success"><strong>{selectedBatch.importedCount}</strong><span>Success</span></div><div className="is-failed"><strong>{selectedBatch.failedCount}</strong><span>Failed</span></div></div>
        <section><h3>Batch Details</h3><dl><div><dt>Uploaded by</dt><dd>{selectedBatch.uploadedBy}</dd></div><div><dt>Uploaded at</dt><dd>{new Date(selectedBatch.uploadedAt).toLocaleString()}</dd></div><div><dt>Status</dt><dd>{selectedBatch.status}</dd></div></dl></section>
        <section><h3>Employee List</h3><div className="bulk-drawer-employees">{selectedBatch.rows?.map(row => <div key={row.rowIndex}><span>{row.firstName} {row.lastName}<small>{row.workEmail}</small></span><b className={row.errors.length ? 'is-failed' : 'is-success'}>{row.errors.length ? 'Failed' : 'Success'}</b></div>)}</div></section>
        <section><h3>Validation Summary</h3><p>{selectedBatch.warningCount} warnings and {selectedBatch.failedCount} validation failures.</p></section>
        <section><h3>Error Details</h3>{selectedBatch.failedRows.length ? selectedBatch.failedRows.map(row => <div key={row.rowIndex} className="bulk-drawer-error">Row {row.rowIndex + 2}: {row.errors.join(', ')}</div>) : <div className="bulk-drawer-clean"><CheckCircle2 size={17} /> No validation errors</div>}</section>
      </div></aside></div>}
    </div>
  );
};