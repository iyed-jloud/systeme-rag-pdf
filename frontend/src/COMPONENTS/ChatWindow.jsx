import { useState } from 'react';
import MessageBubble from './MessageBubble';

function buildMockSources(question, fileName) {
  const cleanQuestion = question.replace(/\s+/g, ' ').trim();

  return [
    {
      text: `Extrait simule depuis ${fileName}: passage lie a "${cleanQuestion}".`,
      page: 1,
    },
    {
      text: 'Deuxieme extrait de test pour verifier le panneau des sources avant le branchement API.',
      page: 2,
    },
  ];
}

function ChatWindow({ documentFile, onSourcesChange }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isThinking, setIsThinking] = useState(false);

  const handleSend = () => {
    const question = input.trim();

    if (!question || isThinking || !documentFile) return;

    const userMessage = { id: crypto.randomUUID(), sender: 'user', text: question };
    setMessages((current) => [...current, userMessage]);
    setInput('');
    setIsThinking(true);

    window.setTimeout(() => {
      const mockSources = buildMockSources(question, documentFile.name);
      const assistantMessage = {
        id: crypto.randomUUID(),
        sender: 'assistant',
        text: `Reponse simulee pour "${question}". Le PDF est bien selectionne et le chat est pret pour le branchement backend.`,
      };

      setMessages((current) => [...current, assistantMessage]);
      onSourcesChange(mockSources);
      setIsThinking(false);
    }, 500);
  };

  const handleKeyDown = (event) => {
    if (event.key === 'Enter') handleSend();
  };

  return (
    <section className="chat-panel" aria-label="Discussion avec le PDF">
      <div className="panel-heading">
        <h2>Questions</h2>
        <span>{messages.length} message{messages.length > 1 ? 's' : ''}</span>
      </div>

      <div className="message-list">
        {messages.length === 0 ? (
          <p className="empty-state">
            {documentFile
              ? 'Posez une premiere question pour tester la reponse simulee.'
              : 'Chargez un PDF pour activer le chat.'}
          </p>
        ) : (
          messages.map((message) => (
            <MessageBubble
              key={message.id}
              sender={message.sender}
              text={message.text}
            />
          ))
        )}
        {isThinking && <MessageBubble sender="assistant" text="Generation en cours..." />}
      </div>

      <div className="composer">
        <input
          type="text"
          value={input}
          onChange={(event) => setInput(event.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={documentFile ? 'Que voulez-vous savoir sur ce document ?' : 'Chargez un PDF pour commencer'}
          disabled={!documentFile || isThinking}
        />
        <button
          type="button"
          onClick={handleSend}
          disabled={!documentFile || !input.trim() || isThinking}
        >
          Envoyer
        </button>
      </div>
    </section>
  );
}

export default ChatWindow;
