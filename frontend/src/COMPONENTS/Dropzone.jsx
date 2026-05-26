import { useState } from 'react';
import { api } from '../api';

function Dropzone({ onUploadComplete }) {
  const [file, setFile] = useState(null);
  const [isHovered, setIsHovered] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState(null);
  const [error, setError] = useState('');

  const handleFileChange = async (event) => {
    const selectedFile = event.target.files[0];

    setError('');
    setUploadResult(null);

    if (selectedFile && selectedFile.type === "application/pdf") {
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
    } else {
      setFile(null);
      setError("Please select a valid PDF file.");
    }
  };

  return (
    <div 
      className="fade-in"
      style={{
        ...styles.container,
        borderColor: isHovered ? 'var(--primary)' : '#cbd5e1',
        backgroundColor: isHovered ? '#eff6ff' : 'var(--white)',
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div style={styles.iconContainer}>
        <span style={styles.icon}>📄</span>
      </div>
      
      <h2 style={styles.title}>Upload your PDF Document</h2>
      <p style={styles.subtitle}>Select the file for AI analysis.</p>
      
      {/* Bouton personnalisé pour cacher le bouton moche par défaut du navigateur */}
      <label style={styles.customButton}>
        {isUploading ? 'Uploading...' : 'Choose File'}
        <input 
          type="file" 
          accept=".pdf" 
          onChange={handleFileChange} 
          disabled={isUploading}
          style={{ display: 'none' }} // On cache le vrai input
        />
      </label>
      
      {uploadResult && file && (
        <div style={styles.successMessage}>
          <span style={styles.checkIcon}>✅</span> 
          <p style={{ margin: 0 }}>
            File ready: <strong style={{ color: 'var(--text-dark)' }}>{file.name}</strong>
            <br />
            <small>{uploadResult.chunks} chunks indexed</small>
          </p>
        </div>
      )}
      {error && <p style={styles.errorMessage}>{error}</p>}
    </div>
  );
}

const styles = {
  container: {
    border: '2px dashed',
    padding: '40px 20px',
    textAlign: 'center',
    borderRadius: 'var(--radius)',
    margin: '0 auto 20px',
    transition: 'all 0.3s ease',
    boxShadow: 'var(--shadow-sm)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainer: {
    backgroundColor: '#e0f2fe',
    width: '60px',
    height: '60px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: '15px',
  },
  icon: {
    fontSize: '28px',
  },
  title: {
    fontSize: '1.25rem',
    color: 'var(--text-dark)',
    margin: '0 0 5px 0',
    fontWeight: '600',
  },
  subtitle: {
    color: 'var(--text-light)',
    margin: '0 0 20px 0',
    fontSize: '0.95rem',
  },
  customButton: {
    backgroundColor: 'var(--primary)',
    color: 'var(--white)',
    padding: '10px 24px',
    borderRadius: '6px',
    cursor: 'pointer',
    fontWeight: '500',
    transition: 'background-color 0.2s',
    display: 'inline-block',
  },
  successMessage: {
    marginTop: '20px',
    padding: '12px 20px',
    backgroundColor: '#ecfdf5',
    color: '#047857',
    borderRadius: '6px',
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    border: '1px solid #a7f3d0',
  },
  checkIcon: {
    fontSize: '18px',
  },
  errorMessage: {
    color: '#b91c1c',
    fontSize: '0.9rem',
    margin: '14px 0 0',
  },
};

export default Dropzone;
