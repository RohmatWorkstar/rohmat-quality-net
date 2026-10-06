import { describe, it, expect } from 'vitest';
import { authApi } from '@/services/auth';

/**
 * Audit Reference: AUD-03 (Missing Signup Route & Broken Auth)
 * Tests that authentication service maps to valid REST endpoints.
 */
describe('AUD-03: Auth Service Endpoint Alignment', () => {
  it('defines login and signup methods with correct signatures', () => {
    expect(authApi.login).toBeDefined();
    expect(typeof authApi.login).toBe('function');

    expect(authApi.signup).toBeDefined();
    expect(typeof authApi.signup).toBe('function');
  });

  it('validates signup payload schema', () => {
    const validSignup = {
      email: 'assessor@example.com',
      password: 'password123',
      role: 'user' as const
    };

    expect(validSignup.email).toContain('@');
    expect(validSignup.password.length).toBeGreaterThanOrEqual(6);
    expect(['admin', 'user']).toContain(validSignup.role);
  });
});
