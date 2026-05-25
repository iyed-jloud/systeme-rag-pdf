function Dropzone({ file, onFileSelected }) {
  const handleFileChange = (event) => {
    const selectedFile = event.target.files?.[0];

    if (!selectedFile) return;

    if (selectedFile.type !== 'application/pdf') {
      event.target.value = '';
      alert('Veuillez selectionner un fichier PDF valide.');
      return;
    }

    onFileSelected(selectedFile);
  };

  return (
    <section className="dropzone" aria-label="Chargement du PDF">
      <div>
        <h2>Charger un document PDF</h2>
        <p>Selectionnez un fichier local pour tester le parcours frontend.</p>
      </div>

      <label className="file-picker">
        <input
          type="file"
          accept="application/pdf,.pdf"
          onChange={handleFileChange}
        />
        <span>Choisir un PDF</span>
      </label>

      {file && (
        <div className="file-summary" role="status">
          <span>{file.name}</span>
          <small>{(file.size / 1024 / 1024).toFixed(2)} MB</small>
        </div>
      )}
    </section>
  );
}

export default Dropzone;
