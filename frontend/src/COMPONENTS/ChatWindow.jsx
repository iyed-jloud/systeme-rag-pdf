import { useState } from 'react';

function ChatWindow() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");

  const handleSend = () => {
    // Do nothing if the input is empty
    if (!input.trim()) return;

    // Add user's question to the list
    const newMessages = [...messages, { sender: 'user', text: input }];
    setMessages(newMessages);
    setInput(""); // Clear input field

    // Simulate AI response (to be replaced by real API call)
    setTimeout(() => {
      setMessages([...newMessages, 
        { sender: 'ia', text: "This is a simulated response. The AI backend is not yet connected!" }
      ]);
    }, 1000);
  };

  return (
    <div style={styles.chatContainer}>
      <h3>💬 Ask your questions</h3>
      
      {/* Message display area */}
      <div style={styles.messageList}>
        {messages.length === 0 ? (
          <p style={{ textAlign: 'center', color: '#888' }}>No messages yet. Ask your first question!</p>
        ) : (
          messages.map((msg, index) => (
            <div key={index} style={msg.sender === 'user' ? styles.userMsg : styles.iaMsg}>
              <strong>{msg.sender === 'user' ? 'You: ' : 'AI: '}</strong>
              {msg.text}
            </div>
          ))
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
          onKeyPress={(e) => e.key === 'Enter' && handleSend()}
        />
        <button onClick={handleSend} style={styles.button}>Send</button>
      </div>
    </div>
  );
}

// Styling for a clean and professional look
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
