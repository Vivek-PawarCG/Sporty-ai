/**
 * Utility functions for input validation and sanitization.
 */

/**
 * Validates and sanitizes chat input.
 * @param {string} message - User message
 * @returns {{ valid: boolean, error?: string, sanitized?: string }}
 */
function validateChatInput(message) {
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

module.exports = {
  validateChatInput,
};
