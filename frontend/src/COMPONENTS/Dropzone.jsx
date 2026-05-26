import { useState } from 'react';
import { api } from '../api';

function Dropzone({ sessionId, documents, onUploadComplete }) {
  const [isHovered, setIsHovered] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState(null);
  const [error, setError] = useState('');

  const uploadFile = async (selectedFile) => {
    setError('');
    setUploadResult(null);

    if (!selectedFile || selectedFile.type !== 'application/pdf') {
      setError('Please select a valid PDF file.');
      return;
    }

    setIsUploading(true);

    try {
      const result = await api.uploadFile(sessionId, selectedFile);
      setUploadResult(result);
      onUploadComplete?.(result);
    } catch (err) {
      setError(err.message || 'Could not upload this PDF.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileChange = (event) => {
    uploadFile(event.target.files[0]);
  };

  const handleDrop = (event) => {
    event.preventDefault();
    setIsHovered(false);
    uploadFile(event.dataTransfer.files[0]);
  };

  return (
    <div
      className={`dropzone ${isHovered ? 'is-hovered' : ''}`}
      onDragOver={(event) => {
        event.preventDefault();
        setIsHovered(true);
      }}
      onDragLeave={() => setIsHovered(false)}
      onDrop={handleDrop}
    >
      <div className="dropzone-copy">
        <span className="file-chip">PDF</span>
        <div>
          <h2>{documents.length ? `${documents.length} PDFs indexed` : 'Upload PDFs'}</h2>
          <p>
            {uploadResult
              ? `${uploadResult.filename} added with ${uploadResult.chunks} chunks`
              : 'Drop another PDF or choose one from your computer.'}
          </p>
        </div>
      </div>

      <label className="primary-button">
        {isUploading ? 'Uploading...' : documents.length ? 'Add PDF' : 'Choose file'}
        <input
          type="file"
          accept=".pdf"
          onChange={handleFileChange}
          disabled={isUploading}
        />
      </label>

      {documents.length > 0 && (
        <div className="document-stack">
          {documents.slice(-3).map((doc, index) => (
            <span key={`${doc.filename}-${doc.total_chunks}-${index}`}>{doc.filename}</span>
          ))}
        </div>
      )}

      {error && <p className="upload-error">{error}</p>}
    </div>
  );
}

export default Dropzone;
