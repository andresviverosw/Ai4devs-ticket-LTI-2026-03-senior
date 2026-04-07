import React from 'react';
import styles from './CandidateForm.module.css';

type Props = {
  fileName: string | null;
  error?: string;
  onChange: (file: File | null) => void;
};

export function CvUploadField({ fileName, error, onChange }: Props) {
  return (
    <div>
      <label htmlFor="candidate-cv">Résumé / CV (PDF or DOCX)</label>
      <input
        id="candidate-cv"
        type="file"
        accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        onChange={(e) => {
          const f = e.target.files?.[0] ?? null;
          onChange(f);
        }}
      />
      <p className={styles.fileHint} aria-live="polite">
        {fileName ? <>Selected: {fileName}</> : <>No file selected</>}
      </p>
      {error ? <span className={styles.fieldError}>{error}</span> : null}
    </div>
  );
}
