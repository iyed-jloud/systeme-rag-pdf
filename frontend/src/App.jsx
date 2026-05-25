import { useState } from 'react';
import Dropzone from './COMPONENTS/Dropzone';
import ChatWindow from './COMPONENTS/ChatWindow';
import SourcePanel from './COMPONENTS/SourcePanel';

function App() {
  // Ces données seront remplies par l'IA plus tard
  const [sources, setSources] = useState([]); 

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#f0f2f5' }}>
      
      {/* Colonne principale (Centre) */}
      <div style={{ flex: 1, marginRight: '300px', padding: '40px' }}>
        <header style={{ textAlign: 'center', marginBottom: '40px' }}>
          <h1 style={{ fontSize: '2.5rem', color: '#1c1e21' }}>📄 Assistant PDF Intelligent</h1>
          <p style={{ color: '#606770' }}>Système RAG (Retrieval-Augmented Generation)</p>
        </header>

        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <Dropzone />
          <ChatWindow setSources={setSources} />
        </div>
      </div>

      {/* Panneau des Sources (Côté droit) */}
      <SourcePanel sources={sources} />

    </div>
  );
}

export default App;