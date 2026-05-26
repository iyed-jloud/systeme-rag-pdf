import { useState } from 'react';

function Dropzone() {
  const [file, setFile] = useState(null);
  const [isHovered, setIsHovered] = useState(false);

  const handleFileChange = (event) => {
    const selectedFile = event.target.files[0];
    
    if (selectedFile && selectedFile.type === "application/pdf") {
      setFile(selectedFile);
      console.log("File selected:", selectedFile.name);
    } else {
      alert("Please select a valid PDF file.");
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
        Choose File
        <input 
          type="file" 
          accept=".pdf" 
          onChange={handleFileChange} 
          style={{ display: 'none' }} // On cache le vrai input
        />
      </label>
      
      {file && (
        <div style={styles.successMessage}>
          <span style={styles.checkIcon}>✅</span> 
          <p style={{ margin: 0 }}>File ready: <strong style={{ color: 'var(--text-dark)' }}>{file.name}</strong></p>
        </div>
      )}
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
  }
};

export default Dropzone;
