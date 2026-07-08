import { describe, it, expect, beforeEach } from 'vitest';
import { saveToken, getToken, removeToken } from '../../utils/token';

describe('token', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('saves token to localStorage', () => {
    saveToken('abc123');
    expect(localStorage.getItem('token')).toBe('abc123');
  });

  it('retrieves a previously saved token', () => {
    localStorage.setItem('token', 'xyz789');
    expect(getToken()).toBe('xyz789');
  });

  it('returns null when no token exists', () => {
    expect(getToken()).toBeNull();
  });

  it('removes token from localStorage', () => {
    localStorage.setItem('token', 'test-token');
    removeToken();
    expect(localStorage.getItem('token')).toBeNull();
  });

  it('handles empty string token', () => {
    saveToken('');
    expect(getToken()).toBe('');
  });

  it('overwrites an existing token when saveToken is called again', () => {
    saveToken('first-token');
    saveToken('second-token');
    expect(getToken()).toBe('second-token');
  });

  it('removeToken is idempotent when no token exists', () => {
    expect(() => removeToken()).not.toThrow();
    expect(getToken()).toBeNull();
  });

  it('handles token with special characters', () => {
    const special = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MX0._signature';
    saveToken(special);
    expect(getToken()).toBe(special);
  });

  it('handles token expiration round-trip', () => {
    saveToken('valid-token');
    expect(getToken()).toBe('valid-token');
    removeToken();
    expect(getToken()).toBeNull();
  });
});
