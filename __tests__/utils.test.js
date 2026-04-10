/**
 * Sporty-AI — Unit Tests
 * Tests utility functions and input validation.
 */

// ─── densityColor Tests ────────────────────────────────────────

function densityColor(d) {
  if (d < 0.35) return '#00e676';
  if (d < 0.65) return '#ffd740';
  return '#ff5252';
}

const { validateChatInput } = require('../server/utils/validation');

describe('densityColor', () => {
  test('returns green for low density (< 0.35)', () => {
    expect(densityColor(0.1)).toBe('#00e676');
    expect(densityColor(0.2)).toBe('#00e676');
    expect(densityColor(0.34)).toBe('#00e676');
  });

  test('returns yellow for moderate density (0.35 - 0.65)', () => {
    expect(densityColor(0.35)).toBe('#ffd740');
    expect(densityColor(0.5)).toBe('#ffd740');
    expect(densityColor(0.64)).toBe('#ffd740');
  });

  test('returns red for high density (>= 0.65)', () => {
    expect(densityColor(0.65)).toBe('#ff5252');
    expect(densityColor(0.8)).toBe('#ff5252');
    expect(densityColor(0.99)).toBe('#ff5252');
  });

  test('handles boundary values', () => {
    expect(densityColor(0)).toBe('#00e676');
    expect(densityColor(1)).toBe('#ff5252');
  });
});

// ─── validateChatInput Tests ─────────────────────────────────

describe('validateChatInput', () => {
  test('validates normal messages', () => {
    const result = validateChatInput('Where is the nearest restroom?');
    expect(result.valid).toBe(true);
    expect(result.sanitized).toBe('Where is the nearest restroom?');
  });

  test('rejects empty input', () => {
    expect(validateChatInput('')).toEqual({ valid: false, error: 'Message is required' });
    expect(validateChatInput('   ')).toEqual({ valid: false, error: 'Message cannot be empty' });
  });

  test('rejects null/undefined input', () => {
    expect(validateChatInput(null)).toEqual({ valid: false, error: 'Message is required' });
    expect(validateChatInput(undefined)).toEqual({ valid: false, error: 'Message is required' });
  });

  test('rejects non-string input', () => {
    expect(validateChatInput(123)).toEqual({ valid: false, error: 'Message is required' });
    expect(validateChatInput({})).toEqual({ valid: false, error: 'Message is required' });
  });

  test('rejects messages over 500 characters', () => {
    const longMsg = 'a'.repeat(501);
    const result = validateChatInput(longMsg);
    expect(result.valid).toBe(false);
    expect(result.error).toBe('Message must be under 500 characters');
  });

  test('accepts messages exactly 500 characters', () => {
    const msg = 'a'.repeat(500);
    expect(validateChatInput(msg).valid).toBe(true);
  });

  test('strips HTML tags for XSS prevention', () => {
    const result = validateChatInput('Hello <script>alert("xss")</script> world');
    expect(result.valid).toBe(true);
    expect(result.sanitized).toBe('Hello alert("xss") world');
  });

  test('trims whitespace', () => {
    const result = validateChatInput('  hello world  ');
    expect(result.valid).toBe(true);
    expect(result.sanitized).toBe('hello world');
  });
});
