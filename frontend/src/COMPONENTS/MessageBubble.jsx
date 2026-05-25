function MessageBubble({ text, sender }) {
  const isUser = sender === 'user';
  
  return (
    <div style={{
      display: 'flex',
      justifyContent: isUser ? 'flex-end' : 'flex-start',
      marginBottom: '10px'
    }}>
      <div style={{
        maxWidth: '70%',
        padding: '12px 16px',
        borderRadius: '15px',
        fontSize: '14px',
        lineHeight: '1.4',
        backgroundColor: isUser ? '#007bff' : '#e9ecef',
        color: isUser ? 'white' : 'black',
        boxShadow: '0px 2px 5px rgba(0,0,0,0.1)'
      }}>
        {text}
      </div>
    </div>
  );
}

export default MessageBubble;