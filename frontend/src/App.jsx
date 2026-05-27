import { useState } from 'react';
import './App.css';
import Dropzone from './components/Dropzone';
import ChatWindow from './components/ChatWindow';
import SourcePanel from './components/SourcePanel';

function App() {
  const [sources, setSources] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [isSourcePanelOpen, setIsSourcePanelOpen] = useState(false);
  const [sessionId] = useState(() => {
    if (globalThis.crypto?.randomUUID) return globalThis.crypto.randomUUID();
    return '10000000-1000-4000-8000-100000000000'.replace(/[018]/g, (char) =>
      (Number(char) ^ (Math.random() * 16) >> (Number(char) / 4)).toString(16)
    );
  });

  const handleSourcesChange = (nextSources) => {
    const safeSources = nextSources || [];
    setSources(safeSources);
  };

  const handleDocumentRemoved = (documentId) => {
    setDocuments((currentDocuments) =>
      currentDocuments.filter((document) => document.document_id !== documentId)
    );
    setSources((currentSources) =>
      currentSources.filter((source) => source.document_id !== documentId)
    );
    setIsSourcePanelOpen(false);
  };

  return (
    <div className="app-shell">
      <main className="workspace">
        <header className="topbar">
          <div>
            <p className="eyebrow">Document intelligence</p>
            <h1>Intelligent PDF Assistant</h1>
          </div>

          <button
            className={`ghost-button ${sources.length > 0 ? 'has-sources' : ''}`}
            type="button"
            disabled={sources.length === 0}
            onClick={() => setIsSourcePanelOpen((open) => !open)}
          >
            View references
            {sources.length > 0 && <span>{sources.length}</span>}
          </button>
        </header>

        <section className="upload-strip">
          <Dropzone
            sessionId={sessionId}
            documents={documents}
            onDocumentRemoved={handleDocumentRemoved}
            onUploadComplete={(uploadedDocument) => {
              setDocuments((currentDocuments) => [...currentDocuments, uploadedDocument]);
              setSources([]);
              setIsSourcePanelOpen(false);
            }}
          />
        </section>

        <section className="chat-stage">
          <ChatWindow
            documents={documents}
            sessionId={sessionId}
            setSources={handleSourcesChange}
          />
        </section>
      </main>

      <SourcePanel
        sources={sources}
        isOpen={isSourcePanelOpen}
        onClose={() => setIsSourcePanelOpen(false)}
      />
    </div>
  );
}

export default App;
