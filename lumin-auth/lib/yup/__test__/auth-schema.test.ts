/* eslint-disable sonarjs/no-duplicate-string */
import { ValidatorMessage } from '@/constants/validator-message';

import { emailSchema, forgotPasswordSchema, passwordSchema, signInSchema, signUpSchema } from '../auth-schema';

describe('auth-schema', () => {
  describe('signUpSchema', () => {
    it('should validate correct sign up data', async () => {
      const validData = {
        email: 'test@example.com',
        name: 'Test User',
        password: 'password123',
        terms: true
      };

      await expect(signUpSchema.validate(validData)).resolves.toEqual(validData);
    });

    it('should reject invalid email', async () => {
      const invalidData = {
        email: 'invalid-email',
        name: 'Test User',
        password: 'password123',
        terms: true
      };

      await expect(signUpSchema.validate(invalidData)).rejects.toThrow();
    });

    it('should reject short password', async () => {
      const invalidData = {
        email: 'test@example.com',
        name: 'Test User',
        password: 'short',
        terms: true
      };

      await expect(signUpSchema.validate(invalidData)).rejects.toThrow();
    });

    it('should reject when terms not accepted', async () => {
      const invalidData = {
        email: 'test@example.com',
        name: 'Test User',
        password: 'password123',
        terms: false
      };

      await expect(signUpSchema.validate(invalidData)).rejects.toThrow(ValidatorMessage.Terms.Required);
    });

    it('should reject empty name', async () => {
      const invalidData = {
        email: 'test@example.com',
        name: '',
        password: 'password123',
        terms: true
      };

      await expect(signUpSchema.validate(invalidData)).rejects.toThrow();
    });
  });

  describe('signInSchema', () => {
    it('should validate correct sign in data', async () => {
      const validData = {
        email: 'test@example.com',
        password: 'password123'
      };

      await expect(signInSchema.validate(validData)).resolves.toEqual(validData);
    });

    it('should reject missing email', async () => {
      const invalidData = {
        email: '',
        password: 'password123'
      };

      await expect(signInSchema.validate(invalidData)).rejects.toThrow();
    });

    it('should reject missing password', async () => {
      const invalidData = {
        email: 'test@example.com',
        password: ''
      };

      await expect(signInSchema.validate(invalidData)).rejects.toThrow();
    });
  });

  describe('emailSchema', () => {
    it('should validate correct email', async () => {
      const validData = { email: 'test@example.com' };

      await expect(emailSchema.validate(validData)).resolves.toEqual(validData);
    });

    it('should reject invalid email', async () => {
      const invalidData = { email: 'not-an-email' };

      await expect(emailSchema.validate(invalidData)).rejects.toThrow();
    });

    it('should reject empty email', async () => {
      const invalidData = { email: '' };

      await expect(emailSchema.validate(invalidData)).rejects.toThrow();
    });
  });

  describe('passwordSchema', () => {
    it('should validate correct password', async () => {
      const validData = { newPassword: 'validPassword123' };

      await expect(passwordSchema.validate(validData)).resolves.toEqual(validData);
    });

    it('should reject short password', async () => {
      const invalidData = { newPassword: 'short' };

      await expect(passwordSchema.validate(invalidData)).rejects.toThrow();
    });

    it('should reject empty password', async () => {
      const invalidData = { newPassword: '' };

      await expect(passwordSchema.validate(invalidData)).rejects.toThrow();
    });
  });

  describe('forgotPasswordSchema', () => {
    it('should validate correct forgot password data', async () => {
      const validData = {
        email: 'test@example.com',
        token: 'recaptcha-token'
      };

      await expect(forgotPasswordSchema.validate(validData)).resolves.toEqual(validData);
    });

    it('should reject missing token', async () => {
      const invalidData = {
        email: 'test@example.com',
        token: ''
      };

      await expect(forgotPasswordSchema.validate(invalidData)).rejects.toThrow();
    });

    it('should reject invalid email', async () => {
      const invalidData = {
        email: 'invalid',
        token: 'recaptcha-token'
      };

      await expect(forgotPasswordSchema.validate(invalidData)).rejects.toThrow();
    });
  });
});
