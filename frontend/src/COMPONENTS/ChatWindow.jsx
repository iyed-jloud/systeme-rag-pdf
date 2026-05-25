import { useState } from 'react';

function ChatWindow() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");

  const handleSend = () => {
    // Si le champ est vide, on ne fait rien
    if (!input.trim()) return;

    // On ajoute la question de l'utilisateur à l'écran
    const newMessages = [...messages, { sender: 'user', text: input }];
    setMessages(newMessages);
    setInput(""); // On vide le champ de texte

    // Ici, on simulera la réponse de l'IA en attendant ton collègue
    setTimeout(() => {
      setMessages([...newMessages, 
        { sender: 'ia', text: "Ceci est une réponse simulée. Le backend de l'IA n'est pas encore branché !" }
      ]);
    }, 1000);
  };

  return (
    <div style={styles.chatContainer}>
      <h3>💬 Posez vos questions</h3>
      
      {/* Zone où les messages s'affichent */}
      <div style={styles.messageList}>
        {messages.length === 0 ? (
          <p style={{ textAlign: 'center', color: '#888' }}>Aucun message. Posez votre première question !</p>
        ) : (
          messages.map((msg, index) => (
            <div key={index} style={msg.sender === 'user' ? styles.userMsg : styles.iaMsg}>
              <strong>{msg.sender === 'user' ? 'Vous : ' : 'IA : '}</strong>
              {msg.text}
            </div>
          ))
        )}
      </div>
      
      {/* Zone pour taper la question */}
      <div style={styles.inputArea}>
        <input 
          type="text" 
          value={input} 
          onChange={(e) => setInput(e.target.value)}
          placeholder="Que voulez-vous savoir sur ce document ?"
          style={styles.input}
          onKeyPress={(e) => e.key === 'Enter' && handleSend()}
        />
        <button onClick={handleSend} style={styles.button}>Envoyer</button>
      </div>
    </div>
  );
}

// Les styles pour rendre le chat propre et lisible
const styles = {
  chatContainer: { border: '1px solid #ccc', borderRadius: '8px', padding: '20px', marginTop: '20px', backgroundColor: 'white' },
  messageList: { minHeight: '250px', maxHeight: '400px', overflowY: 'auto', marginBottom: '15px', padding: '10px', backgroundColor: '#f8f9fa', borderRadius: '5px' },
  userMsg: { backgroundColor: '#d1e7dd', padding: '10px', borderRadius: '8px', marginBottom: '10px', textAlign: 'right', marginLeft: '20%' },
  iaMsg: { backgroundColor: '#e2e3e5', padding: '10px', borderRadius: '8px', marginBottom: '10px', textAlign: 'left', marginRight: '20%' },
  inputArea: { display: 'flex', gap: '10px' },
  input: { flex: 1, padding: '10px', borderRadius: '5px', border: '1px solid #ccc' },
  button: { padding: '10px 20px', borderRadius: '5px', backgroundColor: '#007bff', color: 'white', border: 'none', cursor: 'pointer', fontWeight: 'bold' }
};

export default ChatWindow;