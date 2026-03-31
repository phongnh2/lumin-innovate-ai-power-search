/* eslint-disable */
import * as passwordUtils from '../password';

describe('password', () => {
  describe('letterValidator', () => {
    it('should return true when input has more than or equal 8 letters', () => {
      expect(passwordUtils.letterValidator('12312312')).toBe(true);
    });
    it('should return false when input has less than 8 letters', () => {
      expect(passwordUtils.letterValidator('1232312')).toBe(false);
    });
  });

  describe('numberValidator', () => {
    it('should return true when input has at least one number', () => {
      expect(passwordUtils.numberValidator('dasdkb1')).toBe(true);
    });
    it('should return false when input has no number', () => {
      expect(passwordUtils.numberValidator('dasdasd')).toBe(false);
    });
  });

  describe('lowerCaseValidator', () => {
    it('should return true when input has at least one lower case letter', () => {
      expect(passwordUtils.lowerCaseValidator('a131312123')).toBe(true);
    });
    it('should return false when input has no lower case letter', () => {
      expect(passwordUtils.lowerCaseValidator('H378913')).toBe(false);
    });
  });

  describe('upperCaseValidator', () => {
    it('should return true when input has at least one upper case letter', () => {
      expect(passwordUtils.upperCaseValidator('A131312123')).toBe(true);
    });
    it('should return false when input has no upper case letter', () => {
      expect(passwordUtils.upperCaseValidator('a378913')).toBe(false);
    });
  });

  describe('getPasswordStrength', () => {
    describe('Not defined strength password', () => {
      it('should be return 0', () => {
        expect(passwordUtils.getPasswordStrength('')).toBe(0);
      });
      it('should be return 1', () => {
        expect(passwordUtils.getPasswordStrength('1')).toBe(1);
      });
      it('should be return 2', () => {
        expect(passwordUtils.getPasswordStrength('12312312a')).toBe(2);
      });
      it('should be return 3', () => {
        expect(passwordUtils.getPasswordStrength('12312312aA')).toBe(3);
      });
    });
  });

  describe('getPwdStrengthColors', () => {
    describe('Not defined strength password', () => {
      it('should return ["var(--color-neutral-20)", "var(--color-neutral-20)", "var(--color-neutral-20)"]', () => {
        expect(passwordUtils.getPwdStrengthColors(0)).toEqual([
          'var(--color-neutral-20)',
          'var(--color-neutral-20)',
          'var(--color-neutral-20)',
        ]);
      });
    });

    describe('Weak strength password', () => {
      it('should return ["var(--color-secondary-50)", "var(--color-neutral-20)", "var(--color-neutral-20)"]', () => {
        expect(passwordUtils.getPwdStrengthColors(1)).toEqual([
          'var(--color-secondary-50)',
          'var(--color-neutral-20)',
          'var(--color-neutral-20)',
        ]);
      });
    });

    describe('Medium strength password', () => {
      it('should return ["var(--color-warning-50)", "var(--color-warning-50)", "var(--color-neutral-20)"]', () => {
        expect(passwordUtils.getPwdStrengthColors(2)).toEqual([
          'var(--color-warning-50)',
          'var(--color-warning-50)',
          'var(--color-neutral-20)',
        ]);
      });
    });

    describe('Strong strength password', () => {
      it('should return ["var(--color-success-50)", "var(--color-success-50)", "var(--color-success-50)"]', () => {
        expect(passwordUtils.getPwdStrengthColors(3)).toEqual([
          'var(--color-success-50)',
          'var(--color-success-50)',
          'var(--color-success-50)',
        ]);
      });
    });
  });
});
