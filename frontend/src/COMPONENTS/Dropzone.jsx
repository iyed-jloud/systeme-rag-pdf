import { useState } from 'react';
import { api } from '../api';

function Dropzone({ onUploadComplete }) {
  const [file, setFile] = useState(null);
  const [isHovered, setIsHovered] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState(null);
  const [error, setError] = useState('');

  const uploadFile = async (selectedFile) => {
    setError('');
    setUploadResult(null);

    if (!selectedFile || selectedFile.type !== 'application/pdf') {
      setFile(null);
      setError('Please select a valid PDF file.');
      return;
    }

    setFile(selectedFile);
    setIsUploading(true);

    try {
      const result = await api.uploadFile(selectedFile);
      setUploadResult(result);
      onUploadComplete?.(result);
    } catch (err) {
      setFile(null);
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
          <h2>{file?.name || 'Upload a PDF'}</h2>
          <p>
            {uploadResult
              ? `${uploadResult.chunks} chunks indexed`
              : 'Drop a file here or choose one from your computer.'}
          </p>
        </div>
      </div>

      <label className="primary-button">
        {isUploading ? 'Uploading...' : file ? 'Replace' : 'Choose file'}
        <input
          type="file"
          accept=".pdf"
          onChange={handleFileChange}
          disabled={isUploading}
        />
      </label>

      {error && <p className="upload-error">{error}</p>}
    </div>
  );
}

export default Dropzone;
