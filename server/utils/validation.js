const { z } = require('zod');

// Zod schema for chat validation
const chatSchema = z.string({
  required_error: 'Message is required',
  invalid_type_error: 'Message must be a string',
})
.min(1, 'Message cannot be empty')
.max(500, 'Message must be under 500 characters')
.transform(str => str.trim().replace(/<[^>]*>/g, ''));

/**
 * Validates and sanitizes chat input using Zod.
 * @param {string} message - User message
 * @returns {{ valid: boolean, error?: string, sanitized?: string }}
 */
function validateChatInput(message) {
  const result = chatSchema.safeParse(message);
  if (!result.success) {
    const errorMsg = result.error?.issues?.[0]?.message || 'Invalid input';
    return { valid: false, error: errorMsg };
  }
  return { valid: true, sanitized: result.data };
}

module.exports = {
  validateChatInput,
};
