import { useState } from 'react';
import './App.css';
import Dropzone from './COMPONENTS/Dropzone';
import ChatWindow from './COMPONENTS/ChatWindow';
import SourcePanel from './COMPONENTS/SourcePanel';

function App() {
  const [sources, setSources] = useState([]);
  const [document, setDocument] = useState(null);
  const [isSourcePanelOpen, setIsSourcePanelOpen] = useState(false);

  const handleSourcesChange = (nextSources) => {
    const safeSources = nextSources || [];
    setSources(safeSources);
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
            onUploadComplete={(uploadedDocument) => {
              setDocument(uploadedDocument);
              setSources([]);
              setIsSourcePanelOpen(false);
            }}
          />
        </section>

        <section className="chat-stage">
          <ChatWindow document={document} setSources={handleSourcesChange} />
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
