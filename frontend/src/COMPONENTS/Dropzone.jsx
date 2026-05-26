import { useState } from 'react';

function Dropzone() {
  const [file, setFile] = useState(null);

  const handleFileChange = (event) => {
    // Get the selected file from the user
    const selectedFile = event.target.files[0];
    
    // Verify that the file is indeed a PDF
    if (selectedFile && selectedFile.type === "application/pdf") {
      setFile(selectedFile);
      console.log("File selected:", selectedFile.name);
      // The file will be sent to the backend here
    } else {
      alert("Please select a valid PDF file.");
    }
  };

  return (
    <div style={styles.container}>
      <h2>📁 Upload your PDF Document</h2>
      <p>Select the file for AI analysis.</p>
      
      <input 
        type="file" 
        accept=".pdf" 
        onChange={handleFileChange} 
        style={styles.input}
      />
      
      {/* If a file is loaded, display its name */}
      {file && (
        <div style={styles.successMessage}>
          <p>✅ File ready: <strong>{file.name}</strong></p>
        </div>
      )}
    </div>
  );
}

// Basic styling
const styles = {
  container: {
    border: '2px dashed #007bff',
    padding: '30px',
    textAlign: 'center',
    borderRadius: '10px',
    backgroundColor: '#f8f9fa',
    margin: '20px auto',
    maxWidth: '500px'
  },
  input: {
    marginTop: '15px',
    cursor: 'pointer'
  },
  successMessage: {
    marginTop: '15px',
    color: 'green'
  }
};

export default Dropzone;
