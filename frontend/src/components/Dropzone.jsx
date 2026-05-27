import { useState } from 'react';
import { api } from '../api';

const MAX_PDFS = 5;
const MAX_UPLOAD_BYTES = 200 * 1024 * 1024;

function Dropzone({ sessionId, documents, onUploadComplete, onDocumentRemoved }) {
  const [isHovered, setIsHovered] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [removingDocumentId, setRemovingDocumentId] = useState('');
  const [uploadResult, setUploadResult] = useState(null);
  const [error, setError] = useState('');

  const uploadFile = async (selectedFile) => {
    setError('');
    setUploadResult(null);

    if (documents.length >= MAX_PDFS) {
      setError(`You can upload up to ${MAX_PDFS} PDFs per session.`);
      return;
    }

    if (!selectedFile || selectedFile.type !== 'application/pdf') {
      setError('Please select a valid PDF file.');
      return;
    }

    if (selectedFile.size > MAX_UPLOAD_BYTES) {
      setError('PDF is too large. Maximum upload size is 200 MB.');
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
    event.target.value = '';
  };

  const handleDrop = (event) => {
    event.preventDefault();
    setIsHovered(false);
    uploadFile(event.dataTransfer.files[0]);
  };

  const handleRemoveDocument = async (documentId) => {
    setError('');
    setRemovingDocumentId(documentId);

    try {
      await api.removeDocument(sessionId, documentId);
      onDocumentRemoved?.(documentId);
      setUploadResult(null);
    } catch (err) {
      setError(err.message || 'Could not remove this PDF.');
    } finally {
      setRemovingDocumentId('');
    }
  };

  const isAtLimit = documents.length >= MAX_PDFS;
  const isUploadDisabled = isUploading || isAtLimit;

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
              : `${MAX_PDFS} PDFs max, 200 MB each.`}
          </p>
        </div>
      </div>

      <label className={`primary-button ${isUploadDisabled ? 'is-disabled' : ''}`}>
        {isUploading ? 'Uploading...' : isAtLimit ? 'Limit reached' : documents.length ? 'Add PDF' : 'Choose file'}
        <input
          type="file"
          accept=".pdf"
          onChange={handleFileChange}
          disabled={isUploadDisabled}
        />
      </label>

      {documents.length > 0 && (
        <div className="document-stack">
          {documents.map((doc, index) => (
            <div className="document-chip" key={doc.document_id || `${doc.filename}-${index}`}>
              <span className="document-name">{doc.filename}</span>
              <button
                type="button"
                aria-label={`Remove ${doc.filename}`}
                disabled={removingDocumentId === doc.document_id}
                onClick={() => handleRemoveDocument(doc.document_id)}
              >
                x
              </button>
            </div>
          ))}
        </div>
      )}

      {error && <p className="upload-error">{error}</p>}
    </div>
  );
}

export default Dropzone;
