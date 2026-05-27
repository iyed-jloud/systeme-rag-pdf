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

    const history = messages.slice(-10).map((message) => ({
      role: message.sender === 'user' ? 'user' : 'assistant',
      content: message.text,
    }));
    const newMessages = [...messages, { sender: 'user', text: question }];
    setMessages([...newMessages, { sender: 'ia', text: '' }]);
    setInput('');
    setIsLoading(true);

    try {
      let streamedAnswer = '';
      await api.streamQuestion({
        sessionId,
        question,
        history,
        onSources: (nextSources) => setSources(nextSources || []),
        onDelta: (delta) => {
          streamedAnswer += delta;
          setMessages((currentMessages) => {
            const updatedMessages = [...currentMessages];
            const lastIndex = updatedMessages.length - 1;
            updatedMessages[lastIndex] = {
              ...updatedMessages[lastIndex],
              text: `${updatedMessages[lastIndex].text}${delta}`,
            };
            return updatedMessages;
          });
        },
      });
      if (!streamedAnswer.trim()) {
        setMessages((currentMessages) => {
          const updatedMessages = [...currentMessages];
          const lastIndex = updatedMessages.length - 1;
          updatedMessages[lastIndex] = {
            ...updatedMessages[lastIndex],
            text: 'No answer returned by the backend.',
          };
          return updatedMessages;
        });
      }
    } catch (err) {
      setMessages((currentMessages) => {
        const updatedMessages = [...currentMessages];
        const lastIndex = updatedMessages.length - 1;
        updatedMessages[lastIndex] = {
          sender: 'ia',
          text: err.message || 'Could not get an answer from the backend.',
        };
        return updatedMessages;
      });
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
          messages[messages.length - 1]?.sender !== 'ia' && (
            <article className="message from-assistant">
              <strong>Assistant</strong>
              <p>Thinking...</p>
            </article>
          )
        )}
      </div>

      <div className="composer">
        <input
          type="text"
          value={input}
          onChange={(event) => setInput(event.target.value)}
          placeholder="Ask anything "
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
