import { useState } from 'react';
import './App.css'; // Notre nouveau fichier CSS !
import Dropzone from './COMPONENTS/Dropzone';
import ChatWindow from './COMPONENTS/ChatWindow';
import SourcePanel from './COMPONENTS/SourcePanel';

function App() {
  const [sources, setSources] = useState([]); 

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: 'var(--bg-main)' }}>
      
      {/* Main Column (Center) avec l'animation fade-in */}
      <div className="fade-in" style={{ flex: 1, marginRight: '320px', padding: '50px 40px' }}>
        
        <header style={{ textAlign: 'center', marginBottom: '50px' }}>
          <h1 style={{ 
            fontSize: '3rem', 
            color: 'var(--text-dark)', 
            fontWeight: '700',
            letterSpacing: '-1px',
            marginBottom: '10px'
          }}>
            <span style={{ color: 'var(--primary)' }}>📄</span> Intelligent PDF Assistant
          </h1>
          <p style={{ color: 'var(--text-light)', fontSize: '1.2rem', fontWeight: '500' }}>
            RAG System (Retrieval-Augmented Generation)
          </p>
        </header>

        <div style={{ maxWidth: '850px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '30px' }}>
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
