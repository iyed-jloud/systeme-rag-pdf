import { useState } from 'react';
import './App.css';
import ChatWindow from './COMPONENTS/ChatWindow';
import Dropzone from './COMPONENTS/Dropzone';
import SourcePanel from './COMPONENTS/SourcePanel';

function App() {
  const [documentFile, setDocumentFile] = useState(null);
  const [sources, setSources] = useState([]);

  const handleFileSelected = (file) => {
    setDocumentFile(file);
    setSources([]);
  };

  return (
    <main className="app-shell">
      <section className="workspace" aria-label="Assistant PDF">
        <header className="app-header">
          <div>
            <p className="eyebrow">Prototype frontend</p>
            <h1>Assistant PDF Intelligent</h1>
          </div>
          <div className="status-pill" data-ready={documentFile ? 'true' : 'false'}>
            {documentFile ? 'PDF pret' : 'En attente du PDF'}
          </div>
        </header>

        <Dropzone file={documentFile} onFileSelected={handleFileSelected} />
        <ChatWindow
          documentFile={documentFile}
          onSourcesChange={setSources}
        />
      </section>

      <SourcePanel sources={sources} />
    </main>
  );
}

export default App;
