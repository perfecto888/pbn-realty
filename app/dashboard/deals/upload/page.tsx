'use client';

import { useState } from 'react';
import Link from 'next/link';
import { DashboardLayout } from '../../../../src/components/DashboardLayout';
import { Card } from '../../../../src/components/Card';
import { Button } from '../../../../src/components/Button';
import styles from './page.module.css';

interface UploadResponse {
  success?: boolean;
  message?: string;
  dealsInserted?: number;
  error?: string;
  validationWarnings?: { row: number; errors: string[] }[];
}

export default function DealsUploadPage() {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [response, setResponse] = useState<UploadResponse | null>(null);
  const [dragActive, setDragActive] = useState(false);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const droppedFiles = e.dataTransfer.files;
    if (droppedFiles?.[0]) {
      setFile(droppedFiles[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setResponse({ error: 'Please select a file' });
      return;
    }

    setUploading(true);
    setResponse(null);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/deals/upload', {
        method: 'POST',
        body: formData,
      });

      const data: UploadResponse = await res.json();
      setResponse(data);

      if (data.success) {
        setFile(null);
      }
    } catch (error) {
      setResponse({ error: 'Failed to upload file: ' + String(error) });
    } finally {
      setUploading(false);
    }
  };

  return (
    <DashboardLayout title="Upload Deals">
      <div className={styles.container}>
        <div className={styles.header}>
          <Link href="/dashboard">
            <Button variant="ghost">← Back</Button>
          </Link>
          <h1 className={styles.title}>Upload Las Vegas Deals</h1>
        </div>

        <div className={styles.content}>
          {/* Instructions */}
          <Card className={styles.instructionsCard}>
            <div className={styles.instructionHeader}>
              <div>
                <h2 className={styles.sectionTitle}>Upload Format</h2>
                <p>Upload an Excel (.xlsx, .xls) or CSV file with the following columns:</p>
              </div>
              <a href="/api/deals/template" download>
                <Button variant="secondary">Download Template →</Button>
              </a>
            </div>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Column Name</th>
                  <th>Required</th>
                  <th>Description</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>address</td>
                  <td>Yes</td>
                  <td>Street address of the property</td>
                </tr>
                <tr>
                  <td>city</td>
                  <td>Yes</td>
                  <td>City (must be Las Vegas)</td>
                </tr>
                <tr>
                  <td>state</td>
                  <td>Yes</td>
                  <td>State abbreviation (NV)</td>
                </tr>
                <tr>
                  <td>price</td>
                  <td>Yes</td>
                  <td>Purchase price in dollars</td>
                </tr>
                <tr>
                  <td>zip</td>
                  <td>No</td>
                  <td>ZIP code</td>
                </tr>
                <tr>
                  <td>propertyType</td>
                  <td>No</td>
                  <td>Office, Retail, Industrial, etc.</td>
                </tr>
                <tr>
                  <td>squareFeet</td>
                  <td>No</td>
                  <td>Total square footage</td>
                </tr>
                <tr>
                  <td>yearBuilt</td>
                  <td>No</td>
                  <td>Year property was built</td>
                </tr>
                <tr>
                  <td>currentNoi</td>
                  <td>No</td>
                  <td>Current Net Operating Income</td>
                </tr>
                <tr>
                  <td>currentCapRate</td>
                  <td>No</td>
                  <td>Current Cap Rate percentage</td>
                </tr>
                <tr>
                  <td>sourceUrl</td>
                  <td>No</td>
                  <td>Link to property listing</td>
                </tr>
              </tbody>
            </table>
          </Card>

          {/* Upload Area */}
          <Card className={styles.uploadCard}>
            <h2 className={styles.sectionTitle}>Upload File</h2>

            <div
              className={`${styles.dragDrop} ${dragActive ? styles.dragActive : ''}`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <input
                type="file"
                accept=".xlsx,.xls,.csv"
                onChange={handleFileChange}
                className={styles.fileInput}
                id="fileInput"
                disabled={uploading}
              />
              <label htmlFor="fileInput" className={styles.dragLabel}>
                <div className={styles.dragIcon}>📁</div>
                <p className={styles.dragText}>
                  Drag and drop your Excel or CSV file here
                </p>
                <p className={styles.dragSubtext}>or click to select a file</p>
              </label>
            </div>

            {file && (
              <div className={styles.fileSelected}>
                <p className={styles.fileName}>
                  Selected: <strong>{file.name}</strong>
                </p>
                <p className={styles.fileSize}>
                  Size: {(file.size / 1024).toFixed(2)} KB
                </p>
              </div>
            )}

            <Button
              variant="primary"
              onClick={handleUpload}
              disabled={!file || uploading}
              className={styles.uploadBtn}
            >
              {uploading ? 'Uploading...' : 'Upload Deals'}
            </Button>
          </Card>

          {/* Response Messages */}
          {response && (
            <Card
              className={`${styles.responseCard} ${response.success ? styles.successResponse : styles.errorResponse}`}
            >
              {response.success ? (
                <>
                  <h3 className={styles.successTitle}>Success!</h3>
                  <p>{response.message}</p>
                  {response.dealsInserted && (
                    <p className={styles.dealsCount}>
                      {response.dealsInserted} deals imported successfully
                    </p>
                  )}
                  {response.validationWarnings && response.validationWarnings.length > 0 && (
                    <div className={styles.warnings}>
                      <p className={styles.warningTitle}>Validation Warnings:</p>
                      <ul>
                        {response.validationWarnings.map((warning, idx) => (
                          <li key={idx}>
                            Row {warning.row}: {warning.errors.join(', ')}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  <Link href="/dashboard">
                    <Button variant="primary" className={styles.backBtn}>
                      Back to Dashboard
                    </Button>
                  </Link>
                </>
              ) : (
                <>
                  <h3 className={styles.errorTitle}>Error</h3>
                  <p>{response.error}</p>
                  {response.validationWarnings && response.validationWarnings.length > 0 && (
                    <div className={styles.errors}>
                      <p className={styles.errorDetail}>Issues found:</p>
                      <ul>
                        {response.validationWarnings.map((err, idx) => (
                          <li key={idx}>
                            Row {err.row}: {err.errors.join(', ')}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </>
              )}
            </Card>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
