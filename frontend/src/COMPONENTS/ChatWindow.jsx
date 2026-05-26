import { useState } from 'react';
import { api } from '../api';

function ChatWindow({ documents, sessionId, setSources }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSend = async () => {
    const question = input.trim();
    if (!question || isLoading) return;

    if (documents.length === 0) {
      setMessages((currentMessages) => [
        ...currentMessages,
        { sender: 'ia', text: 'Upload one or more PDFs first, then ask your question.' },
      ]);
      return;
    }

    const newMessages = [...messages, { sender: 'user', text: question }];
    setMessages(newMessages);
    setInput('');
    setIsLoading(true);

    try {
      const response = await api.askQuestion(sessionId, question);
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
    <div className="chat-panel">
      <div className="chat-header">
        <div>
          <h2>Chat</h2>
          <p>
            {documents.length
              ? `${documents.length} PDF${documents.length === 1 ? '' : 's'} in this session`
              : 'No PDFs selected'}
          </p>
        </div>
      </div>

      <div className="message-list">
        {messages.length === 0 ? (
          <div className="empty-chat">
            <h3>Ask across every uploaded PDF.</h3>
            <p>Answers can cite the exact file and page that supplied each excerpt.</p>
          </div>
        ) : (
          messages.map((msg, index) => (
            <article
              className={`message ${msg.sender === 'user' ? 'from-user' : 'from-assistant'}`}
              key={`${msg.sender}-${index}`}
            >
              <strong>{msg.sender === 'user' ? 'You' : 'Assistant'}</strong>
              <p>{msg.text}</p>
            </article>
          ))
        )}

        {isLoading && (
          <article className="message from-assistant">
            <strong>Assistant</strong>
            <p>Thinking...</p>
          </article>
        )}
      </div>

      <div className="composer">
        <input
          type="text"
          value={input}
          onChange={(event) => setInput(event.target.value)}
          placeholder="Ask a question about this document"
          disabled={isLoading}
          onKeyDown={(event) => event.key === 'Enter' && handleSend()}
        />
        <button onClick={handleSend} disabled={isLoading} type="button">
          {isLoading ? 'Sending' : 'Send'}
        </button>
      </div>
    </div>
  );
}

export default ChatWindow;
