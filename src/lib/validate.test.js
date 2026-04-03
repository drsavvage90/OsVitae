import { describe, it, expect } from 'vitest';
import {
  sanitizeText,
  validateTitle,
  validateName,
  validateDescription,
  validateAmount,
  validateEmail,
  validatePhone,
  MAX_TITLE,
  MAX_TEXT,
  MAX_NAME,
} from './validate';

describe('sanitizeText', () => {
  it('trims and returns a normal string', () => {
    expect(sanitizeText('  hello  ')).toBe('hello');
  });

  it('returns empty string for non-string input', () => {
    expect(sanitizeText(null)).toBe('');
    expect(sanitizeText(42)).toBe('');
    expect(sanitizeText(undefined)).toBe('');
  });

  it('truncates to maxLen', () => {
    const long = 'a'.repeat(3000);
    expect(sanitizeText(long)).toHaveLength(MAX_TEXT);
  });

  it('respects a custom maxLen', () => {
    expect(sanitizeText('abcdef', 3)).toBe('abc');
  });
});

describe('validateTitle', () => {
  it('accepts a valid title', () => {
    const result = validateTitle('My Task');
    expect(result).toEqual({ valid: true, value: 'My Task' });
  });

  it('rejects an empty title', () => {
    const result = validateTitle('   ');
    expect(result).toEqual({ valid: false, error: 'Title is required.' });
  });

  it('truncates titles exceeding MAX_TITLE', () => {
    const long = 'x'.repeat(MAX_TITLE + 100);
    const result = validateTitle(long);
    expect(result.valid).toBe(true);
    expect(result.value).toHaveLength(MAX_TITLE);
  });
});

describe('validateName', () => {
  it('accepts a valid name', () => {
    const result = validateName('Workspace');
    expect(result).toEqual({ valid: true, value: 'Workspace' });
  });

  it('rejects an empty name', () => {
    const result = validateName('');
    expect(result).toEqual({ valid: false, error: 'Name is required.' });
  });

  it('truncates names exceeding MAX_NAME', () => {
    const long = 'n'.repeat(MAX_NAME + 50);
    const result = validateName(long);
    expect(result.valid).toBe(true);
    expect(result.value).toHaveLength(MAX_NAME);
  });
});

describe('validateDescription', () => {
  it('accepts a valid description', () => {
    const result = validateDescription('Some details');
    expect(result).toEqual({ valid: true, value: 'Some details' });
  });

  it('accepts an empty description', () => {
    const result = validateDescription('');
    expect(result).toEqual({ valid: true, value: '' });
  });

  it('handles non-string input gracefully', () => {
    const result = validateDescription(null);
    expect(result).toEqual({ valid: true, value: '' });
  });
});

describe('validateAmount', () => {
  it('accepts a valid positive number', () => {
    const result = validateAmount('42.50');
    expect(result).toEqual({ valid: true, value: 42.5 });
  });

  it('rejects zero and negative numbers', () => {
    expect(validateAmount('0')).toEqual({ valid: false, error: 'Amount must be a positive number.' });
    expect(validateAmount('-5')).toEqual({ valid: false, error: 'Amount must be a positive number.' });
  });

  it('rejects non-numeric input', () => {
    expect(validateAmount('abc')).toEqual({ valid: false, error: 'Amount must be a positive number.' });
  });

  it('rejects amounts that are too large', () => {
    const result = validateAmount('9999999999');
    expect(result).toEqual({ valid: false, error: 'Amount is too large.' });
  });

  it('rounds to two decimal places', () => {
    const result = validateAmount('10.999');
    expect(result.value).toBe(11);
  });
});

describe('validateEmail', () => {
  it('accepts a valid email', () => {
    const result = validateEmail('user@example.com');
    expect(result).toEqual({ valid: true, value: 'user@example.com' });
  });

  it('rejects an invalid email', () => {
    const result = validateEmail('not-an-email');
    expect(result).toEqual({ valid: false, error: 'Invalid email address.' });
  });

  it('accepts empty input as optional', () => {
    expect(validateEmail('')).toEqual({ valid: true, value: '' });
    expect(validateEmail(null)).toEqual({ valid: true, value: '' });
  });
});

describe('validatePhone', () => {
  it('accepts a valid phone number', () => {
    const result = validatePhone('+1 (555) 123-4567');
    expect(result).toEqual({ valid: true, value: '+1 (555) 123-4567' });
  });

  it('rejects invalid characters', () => {
    const result = validatePhone('abc-phone');
    expect(result).toEqual({ valid: false, error: 'Invalid phone number.' });
  });

  it('accepts empty input as optional', () => {
    expect(validatePhone('')).toEqual({ valid: true, value: '' });
    expect(validatePhone(undefined)).toEqual({ valid: true, value: '' });
  });
});
