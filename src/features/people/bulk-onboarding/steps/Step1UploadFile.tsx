import React, { useRef, useState } from 'react';
import { UploadCloud } from 'lucide-react';
import { useBulkOnboardingStore } from '../../../../store/bulkOnboardingStore';
import { autoMapColumns, parseCsv } from '../bulkOnboardingUtils';
import { BULK_IMPORT_REQUIRED_COLUMNS } from '../bulkOnboardingTypes';

export const Step1UploadFile: React.FC = () => {
  const { setUploadedFile, nextStep } = useBulkOnboardingStore();
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (file: File) => {
    if (file.name.toLowerCase().endsWith('.xlsx')) {
      setError('XLSX files are not supported in this preview — please export your sheet as CSV and upload again.');
      return;
    }
    const text = await file.text();
    const { headers, rows } = parseCsv(text);
    if (headers.length === 0) {
      setError('The file appears to be empty.');
      return;
    }
    setError(null);
    setUploadedFile(file.name, headers, rows, autoMapColumns(headers));
    nextStep();
  };

  return (
    <div className="bulk-onboard-step">
      <h3>Upload File</h3>
      <p className="emp-form-hint">Accepts CSV or XLSX. Your file should include the following columns:</p>
      <ul className="bulk-onboard-required-columns">
        {BULK_IMPORT_REQUIRED_COLUMNS.map(c => <li key={c}>{c}</li>)}
      </ul>

      {error && <p className="schedules-cfg-form-error">{error}</p>}

      <div className="bulk-onboard-dropzone" onClick={() => inputRef.current?.click()}>
        <UploadCloud size={28} />
        <p>Click to choose a CSV or XLSX file</p>
        <input
          ref={inputRef}
          type="file"
          accept=".csv,.xlsx"
          style={{ display: 'none' }}
          onChange={e => {
            const file = e.target.files?.[0];
            if (file) handleFile(file);
          }}
        />
      </div>
    </div>
  );
};
