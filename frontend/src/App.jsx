import { useState } from 'react';
import Dropzone from './COMPONENTS/Dropzone';
import ChatWindow from './COMPONENTS/ChatWindow';
import SourcePanel from './COMPONENTS/SourcePanel';
import './App.css'; // Ajoute cette ligne ici
import { useState } from 'react';
// ... tes autres imports

function App() {
  // This data will be populated by the AI later
  const [sources, setSources] = useState([]); 

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#f0f2f5' }}>
      
      {/* Main Column (Center) */}
      <div style={{ flex: 1, marginRight: '300px', padding: '40px' }}>
        <header style={{ textAlign: 'center', marginBottom: '40px' }}>
          <h1 style={{ fontSize: '2.5rem', color: '#1c1e21' }}>📄 Intelligent PDF Assistant</h1>
          <p style={{ color: '#606770' }}>RAG System (Retrieval-Augmented Generation)</p>
        </header>

        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <Dropzone />
          <ChatWindow setSources={setSources} />
        </div>
      </div>

      {/* Source Panel (Right Side) */}
      <SourcePanel sources={sources} />

    </div>
  );
}

export default App;
