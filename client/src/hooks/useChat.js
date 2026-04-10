/**
 * useChat Hook — SSE Streaming Chat
 * 
 * Connects to the Express /api/chat endpoint via
 * Server-Sent Events for real-time Gemini streaming.
 */

import { useState, useRef, useCallback } from 'react';

/**
 * @param {string} endpoint - API endpoint for chat
 * @returns {{ messages, input, setInput, sendMessage, isStreaming, clearMessages }}
 */
export function useChat(endpoint = '/api/chat') {
  const [messages, setMessages] = useState([
    {
      role: 'ai',
      text: "👋 Hi! I'm Sporty-AI, your intelligent stadium concierge powered by Gemini. Ask me anything — directions, wait times, food options, or event info!",
    },
  ]);
  const [input, setInput] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const abortRef = useRef(null);

  const sendMessage = useCallback(async (e) => {
    if (e) e.preventDefault();
    const trimmed = input.trim();
    if (!trimmed || isStreaming) return;

    // Add user message
    const userMsg = { role: 'user', text: trimmed };
    const history = [...messages.filter(m => m.role !== 'system'), userMsg];
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsStreaming(true);

    // Add placeholder AI message
    setMessages(prev => [...prev, { role: 'ai', text: '', isStreaming: true }]);

    try {
      abortRef.current = new AbortController();

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: trimmed,
          history: history.slice(-10).map(m => ({
            role: m.role,
            text: m.text,
          })),
        }),
        signal: abortRef.current.signal,
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || 'Server error');
      }

      // Read SSE stream
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let fullText = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            if (data === '[DONE]') continue;

            try {
              const parsed = JSON.parse(data);
              if (parsed.error) {
                throw new Error(parsed.error);
              }
              if (parsed.text) {
                fullText += parsed.text;
                setMessages(prev => {
                  const updated = [...prev];
                  const lastIdx = updated.length - 1;
                  updated[lastIdx] = { role: 'ai', text: fullText, isStreaming: true };
                  return updated;
                });
              }
            } catch (parseErr) {
              if (parseErr.message !== 'Unexpected end of JSON input') {
                console.warn('[Chat] Parse error:', parseErr);
              }
            }
          }
        }
      }

      // Finalize message
      setMessages(prev => {
        const updated = [...prev];
        const lastIdx = updated.length - 1;
        updated[lastIdx] = { role: 'ai', text: fullText || 'Sorry, I couldn\'t generate a response. Please try again!' };
        return updated;
      });
    } catch (err) {
      if (err.name === 'AbortError') return;
      console.error('[Chat] Error:', err);
      setMessages(prev => {
        const updated = [...prev];
        const lastIdx = updated.length - 1;
        updated[lastIdx] = {
          role: 'ai',
          text: `Sorry, I couldn't connect right now. ${err.message || 'Please try again in a moment!'}`,
        };
        return updated;
      });
    } finally {
      setIsStreaming(false);
      abortRef.current = null;
    }
  }, [input, isStreaming, messages, endpoint]);

  const clearMessages = useCallback(() => {
    setMessages([{
      role: 'ai',
      text: "Chat cleared! How can I help you?",
    }]);
  }, []);

  return { messages, input, setInput, sendMessage, isStreaming, clearMessages };
}
