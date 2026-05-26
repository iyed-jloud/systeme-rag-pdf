import { useState } from 'react';
import './App.css';
import Dropzone from './COMPONENTS/Dropzone';
import ChatWindow from './COMPONENTS/ChatWindow';
import SourcePanel from './COMPONENTS/SourcePanel';

function App() {
  const [sources, setSources] = useState([]); 

  return (
    <div style={{ display: 'flex', height: '100vh', width: '100vw' }}>
      
      {/* Main Content Area */}
      <div style={{ 
        flex: 1, 
        marginRight: '320px', 
        display: 'flex', 
        flexDirection: 'column', 
        padding: '20px 40px',
        height: '100vh' 
      }}>
        
        {/* TITRE - Apparaît en premier (delay-1) */}
        <header className="reveal delay-1" style={{ textAlign: 'center', marginBottom: '20px' }}>
          <h1 style={{ fontSize: '2rem', margin: 0, color: '#1e293b' }}>
            <span style={{ color: '#007bff' }}>📄</span> Intelligent PDF Assistant
          </h1>
          <p style={{ color: '#64748b', fontSize: '0.9rem', margin: '5px 0' }}>RAG System</p>
        </header>

        {/* DROPZONE - Apparaît en deuxième (delay-2) */}
        <div className="reveal delay-2" style={{ marginBottom: '20px' }}>
          <Dropzone />
        </div>

        {/* CHAT WINDOW - Prend tout l'espace restant (delay-3) */}
        <div className="reveal delay-3" style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column' }}>
          <ChatWindow setSources={setSources} />
        </div>
      </div>

      {/* SOURCE PANEL */}
      <SourcePanel sources={sources} />

    </div>
  );
}

export default App;
