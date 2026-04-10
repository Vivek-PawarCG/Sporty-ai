/**
 * Chat Route — AI Concierge
 * POST /api/chat
 * 
 * Streams Gemini 2.5 Flash Lite Flash responses via Server-Sent Events (SSE).
 * Provides real-time stadium intelligence to attendees.
 */

const express = require('express');
const router = express.Router();
const { getModel, SYSTEM_INSTRUCTION } = require('../services/gemini');
const { logEvent } = require('../middleware/logging');
const { recordMetric } = require('../services/monitoring');

/**
 * Validates and sanitizes chat input.
 * @param {string} message - User message
 * @returns {{ valid: boolean, error?: string, sanitized?: string }}
 */
function validateInput(message) {
  if (!message || typeof message !== 'string') {
    return { valid: false, error: 'Message is required' };
  }

  const trimmed = message.trim();
  if (trimmed.length === 0) {
    return { valid: false, error: 'Message cannot be empty' };
  }
  if (trimmed.length > 500) {
    return { valid: false, error: 'Message must be under 500 characters' };
  }

  // Basic sanitization — strip HTML tags
  const sanitized = trimmed.replace(/<[^>]*>/g, '');
  return { valid: true, sanitized };
}

router.post('/', async (req, res) => {
  const startTime = Date.now();

  // Validate input
  const { message, history = [] } = req.body;
  const validation = validateInput(message);

  if (!validation.valid) {
    return res.status(400).json({ error: validation.error });
  }

  try {
    const model = getModel('gemini-2.5-flash-lite');

    // Convert history to Gemini format
    const chatHistory = history.map(msg => ({
      role: msg.role === 'ai' ? 'model' : 'user',
      parts: [{ text: msg.text }],
    }));

    const chat = model.startChat({
      history: chatHistory,
      systemInstruction: { parts: [{ text: SYSTEM_INSTRUCTION }] },
    });

    // Set up SSE streaming
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('X-Accel-Buffering', 'no');

    // Stream response
    const result = await chat.sendMessageStream(validation.sanitized);

    for await (const chunk of result.stream) {
      const text = chunk.text();
      if (text) {
        res.write(`data: ${JSON.stringify({ text })}\n\n`);
      }
    }

    // Signal completion
    res.write(`data: [DONE]\n\n`);
    res.end();

    // Record metrics
    const latency = Date.now() - startTime;
    recordMetric('chat_latency_ms', latency);
    logEvent('INFO', 'Chat response streamed', { latency, messageLength: validation.sanitized.length });

  } catch (err) {
    console.error('[CHAT] Error:', err.message);
    console.error('[CHAT] Stack:', err.stack);
    console.error('[CHAT] Full error:', JSON.stringify(err, Object.getOwnPropertyNames(err)));
    logEvent('ERROR', 'Chat generation failed', { error: err.message, stack: err.stack?.slice(0, 500) });

    // If headers haven't been sent, return JSON error with details
    if (!res.headersSent) {
      return res.status(500).json({
        error: 'Failed to generate response.',
        detail: err.message,
        hint: err.message.includes('API_KEY') ? 'GEMINI_API_KEY env var may not be set' : undefined,
      });
    }

    // If streaming already started, send error via SSE
    res.write(`data: ${JSON.stringify({ error: `Stream error: ${err.message}` })}\n\n`);
    res.end();
  }
});

module.exports = router;
