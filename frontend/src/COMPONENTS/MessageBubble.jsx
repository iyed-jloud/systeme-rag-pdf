function MessageBubble({ text, sender }) {
  const isUser = sender === 'user';

  return (
    <article className={`message-bubble ${isUser ? 'user' : 'assistant'}`}>
      <strong>{isUser ? 'Vous' : 'IA'}</strong>
      <p>{text}</p>
    </article>
  );
}

export default MessageBubble;
