import { useState } from 'react';

function Dropzone() {
  const [file, setFile] = useState(null);

  const handleFileChange = (event) => {
    // On récupère le fichier sélectionné par l'utilisateur
    const selectedFile = event.target.files[0];
    
    // On vérifie que c'est bien un PDF
    if (selectedFile && selectedFile.type === "application/pdf") {
      setFile(selectedFile);
      console.log("Fichier sélectionné :", selectedFile.name);
      // Plus tard, on enverra ce fichier au backend de ton collègue ici !
    } else {
      alert("Veuillez sélectionner un fichier PDF valide.");
    }
  };

  return (
    <div style={styles.container}>
      <h2>📁 Chargez votre document PDF</h2>
      <p>Sélectionnez le fichier que l'IA va analyser.</p>
      
      <input 
        type="file" 
        accept=".pdf" 
        onChange={handleFileChange} 
        style={styles.input}
      />
      
      {/* Si un fichier est chargé, on affiche son nom */}
      {file && (
        <div style={styles.successMessage}>
          <p>✅ Fichier prêt : <strong>{file.name}</strong></p>
        </div>
      )}
    </div>
  );
}

// Un peu de style basique pour que ce soit joli
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