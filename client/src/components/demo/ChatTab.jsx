import { useRef, useEffect } from 'react';
import { Send, Bot, User, Trash2 } from 'lucide-react';
import { useChat } from '../../hooks/useChat';

export default function ChatTab() {
  const { messages, input, setInput, sendMessage, isStreaming, clearMessages } = useChat('/api/chat');
  const endRef = useRef(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div>
      <div
        className="chat-messages"
        role="log"
        aria-label="Chat conversation with Sporty-AI"
        aria-live="polite"
      >
        {messages.map((m, i) => (
          <div key={i} className={`msg ${m.role}`} role="article" aria-label={`${m.role === 'ai' ? 'Sporty-AI' : 'You'} said`}>
            <div className="msg-avatar" aria-hidden="true">
              {m.role === 'ai' ? <Bot size={14} /> : <User size={14} />}
            </div>
            <div className={`msg-bubble ${m.isStreaming ? 'msg-thinking' : ''}`}>
              {m.text || 'Thinking…'}
            </div>
          </div>
        ))}
        <div ref={endRef} />
      </div>
      <form onSubmit={sendMessage} className="chat-input-row">
        <input
          className="chat-input"
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="Ask about directions, food, wait times…"
          aria-label="Type your message to Sporty-AI"
          maxLength={500}
          disabled={isStreaming}
        />
        <button
          className="chat-btn"
          type="submit"
          disabled={isStreaming || !input.trim()}
          aria-label="Send message"
        >
          <Send size={16} aria-hidden="true" />
          <span>Send</span>
        </button>
        <button
          className="chat-btn"
          type="button"
          onClick={clearMessages}
          aria-label="Clear chat history"
          style={{ background: 'transparent', border: '1px solid rgba(0,230,118,0.2)', color: '#e0ffe8', padding: '10px 12px' }}
        >
          <Trash2 size={14} aria-hidden="true" />
        </button>
      </form>
    </div>
  );
}
