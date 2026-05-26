import { useState } from 'react';
import { api } from '../api';

function ChatWindow({ document, setSources }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSend = async () => {
    // Do nothing if the input is empty
    const question = input.trim();
    if (!question || isLoading) return;

    if (!document?.doc_id) {
      setMessages((currentMessages) => [
        ...currentMessages,
        { sender: 'ia', text: 'Please upload a PDF before asking a question.' },
      ]);
      return;
    }

    // Add user's question to the list
    const newMessages = [...messages, { sender: 'user', text: question }];
    setMessages(newMessages);
    setInput(""); // Clear input field
    setIsLoading(true);

    try {
      const response = await api.askQuestion(document.doc_id, question);
      setSources(response.sources || []);
      setMessages([
        ...newMessages,
        { sender: 'ia', text: response.answer || 'No answer returned by the backend.' },
      ]);
    } catch (err) {
      setMessages([
        ...newMessages,
        { sender: 'ia', text: err.message || 'Could not get an answer from the backend.' },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={styles.chatContainer}>
      <h3 style={styles.header}>💬 Ask your questions</h3>
      {document?.filename && (
        <p style={styles.documentStatus}>Current document: {document.filename}</p>
      )}
      
      {/* Message display area */}
      <div style={styles.messageList}>
        {messages.length === 0 ? (
          <p style={{ textAlign: 'center', color: '#94a3b8', marginTop: '40px' }}>No messages yet. Ask your first question!</p>
        ) : (
          messages.map((msg, index) => (
            <div key={index} style={msg.sender === 'user' ? styles.userMsg : styles.iaMsg}>
              <strong style={{ display: 'block', fontSize: '0.8rem', marginBottom: '4px', opacity: 0.8 }}>
                {msg.sender === 'user' ? 'You' : 'AI Assistant'}
              </strong>
              {msg.text}
            </div>
          ))
        )}
        {isLoading && (
          <div style={styles.iaMsg}>
            <strong style={{ display: 'block', fontSize: '0.8rem', marginBottom: '4px', opacity: 0.8 }}>
              AI Assistant
            </strong>
            Thinking...
          </div>
        )}
      </div>
      
      {/* Input area */}
      <div style={styles.inputArea}>
        <input 
          type="text" 
          value={input} 
          onChange={(e) => setInput(e.target.value)}
          placeholder="What would you like to know about this document?"
          style={styles.input}
          disabled={isLoading}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
        />
        <button onClick={handleSend} style={styles.button} disabled={isLoading}>
          {isLoading ? 'Sending...' : 'Send'}
        </button>
      </div>
    </div>
  );
}

// Styling premium et sans scroll global
const styles = {
  chatContainer: { 
    display: 'flex', 
    flexDirection: 'column', 
    height: '100%', // Prend toute la place allouée par App.jsx
    backgroundColor: 'white', 
    borderRadius: '12px', 
    padding: '20px', 
    boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)',
    border: '1px solid #e2e8f0'
  },
  header: {
    margin: '0 0 15px 0',
    color: '#1e293b',
    fontSize: '1.2rem'
  },
  documentStatus: {
    margin: '-8px 0 12px',
    color: '#64748b',
    fontSize: '0.85rem',
  },
  messageList: { 
    flex: 1, // La liste prend tout l'espace disponible
    overflowY: 'auto', // Seule cette zone scrolle
    marginBottom: '15px', 
    padding: '15px', 
    backgroundColor: '#f8fafc', 
    borderRadius: '8px',
    border: '1px inset #f1f5f9'
  },
  // Design des bulles façon iMessage / ChatGPT
  userMsg: { 
    backgroundColor: '#007bff', 
    color: 'white', 
    padding: '12px 16px', 
    borderRadius: '16px 16px 0 16px', // Pointe vers le bas à droite
    marginBottom: '12px', 
    textAlign: 'left', 
    marginLeft: 'auto',
    maxWidth: '80%',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
  },
  iaMsg: { 
    backgroundColor: '#e2e8f0', 
    color: '#1e293b', 
    padding: '12px 16px', 
    borderRadius: '16px 16px 16px 0', // Pointe vers le bas à gauche
    marginBottom: '12px', 
    textAlign: 'left', 
    marginRight: 'auto',
    maxWidth: '80%',
    boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
  },
  inputArea: { 
    display: 'flex', 
    gap: '10px',
    paddingTop: '10px',
    borderTop: '1px solid #f1f5f9' 
  },
  input: { 
    flex: 1, 
    padding: '12px 15px', 
    borderRadius: '8px', 
    border: '1px solid #cbd5e1',
    outline: 'none',
    fontSize: '0.95rem'
  },
  button: { 
    padding: '10px 24px', 
    borderRadius: '8px', 
    backgroundColor: '#007bff', 
    color: 'white', 
    border: 'none', 
    cursor: 'pointer', 
    fontWeight: '600',
    transition: 'background-color 0.2s'
  }
};

export default ChatWindow;
