import * as Yup from 'yup';
import { yupValidator } from '../yup';
import { validatePassword } from 'utils/password';
import validators from 'utils/validator';
import { isEmail, isFQDN } from 'validator';

jest.mock('utils/password', () => ({
  validatePassword: jest.fn(),
  PASSWORD_STRENGTH: {
    WEAK: 'Weak',
    MEDIUM: 'Medium',
    STRONG: 'Strong',
  },
  MAX_PASSWORD_LENGTH: 100,
  MIN_PASSWORD_LENGTH: 8,
  MIN_OLD_PASSWORD_LENGTH: 6,
}));

jest.mock('utils/validator', () => ({
  validateNameUrl: jest.fn(),
  validateNameHtml: jest.fn(),
}));

jest.mock('validator', () => ({
  isEmail: jest.fn(),
  isFQDN: jest.fn(),
}));

describe('yup', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('preventSpaces', () => {
    it('should pass validation for valid string', async () => {
      const schema = Yup.string().preventSpaces('No spaces allowed');
      await expect(schema.validate('validString')).resolves.toBe('validString');
    });

    it('should fail validation for empty string', async () => {
      const schema = Yup.string().preventSpaces('No spaces allowed');
      await expect(schema.validate('')).rejects.toThrow('No spaces allowed');
    });

    it('should fail validation for string with only spaces', async () => {
      const schema = Yup.string().preventSpaces('No spaces allowed');
      await expect(schema.validate('   ')).rejects.toThrow('No spaces allowed');
    });
  });

  describe('passwordStrength', () => {
    it('should pass validation for valid password', async () => {
      (validatePassword as jest.Mock).mockReturnValue(true);
      const schema = Yup.string().passwordStrength();
      await expect(schema.validate('ValidPass123')).resolves.toBe('ValidPass123');
      expect(validatePassword).toHaveBeenCalledWith('ValidPass123', 'Medium');
    });

    it('should fail validation for weak password', async () => {
      (validatePassword as jest.Mock).mockReturnValue(false);
      const schema = Yup.string().passwordStrength();
      await expect(schema.validate('weak')).rejects.toThrow();
    });

    it('should use custom level', async () => {
      (validatePassword as jest.Mock).mockReturnValue(true);
      const schema = Yup.string().passwordStrength(2);
      await expect(schema.validate('StrongPass123')).resolves.toBe('StrongPass123');
      expect(validatePassword).toHaveBeenCalledWith('StrongPass123', 2);
    });
  });

  describe('isEmail', () => {
    it('should pass validation for valid email', async () => {
      (isEmail as jest.Mock).mockReturnValue(true);
      const schema = Yup.string().isEmail();
      await expect(schema.validate('test@example.com')).resolves.toBe('test@example.com');
      expect(isEmail).toHaveBeenCalledWith('test@example.com');
    });

    it('should pass validation for empty email', async () => {
      (isEmail as jest.Mock).mockReturnValue(false);
      const schema = Yup.string().isEmail();
      await expect(schema.validate('')).resolves.toBe('');
    });

    it('should fail validation for invalid email', async () => {
      (isEmail as jest.Mock).mockReturnValue(false);
      const schema = Yup.string().isEmail();
      await expect(schema.validate('invalid-email')).rejects.toThrow();
    });
  });

  describe('isFQDN', () => {
    it('should pass validation for valid domain', async () => {
      (isFQDN as jest.Mock).mockReturnValue(true);
      const schema = Yup.string().isFQDN();
      await expect(schema.validate('example.com')).resolves.toBe('example.com');
      expect(isFQDN).toHaveBeenCalledWith('example.com');
    });

    it('should pass validation for empty domain', async () => {
      (isFQDN as jest.Mock).mockReturnValue(false);
      const schema = Yup.string().isFQDN();
      await expect(schema.validate('')).resolves.toBe('');
    });

    it('should fail validation for invalid domain', async () => {
      (isFQDN as jest.Mock).mockReturnValue(false);
      const schema = Yup.string().isFQDN();
      await expect(schema.validate('invalid-domain')).rejects.toThrow();
    });
  });

  describe('notContainUrl', () => {
    it('should pass validation when name does not contain URL', async () => {
      (validators.validateNameUrl as jest.Mock).mockReturnValue(true);
      const schema = Yup.string().notContainUrl();
      await expect(schema.validate('ValidName')).resolves.toBe('ValidName');
      expect(validators.validateNameUrl).toHaveBeenCalledWith('ValidName');
    });

    it('should fail validation when name contains URL', async () => {
      (validators.validateNameUrl as jest.Mock).mockReturnValue(false);
      const schema = Yup.string().notContainUrl();
      await expect(schema.validate('http://example.com')).rejects.toThrow();
    });
  });

  describe('notContainHtml', () => {
    it('should pass validation when name does not contain HTML', async () => {
      (validators.validateNameHtml as jest.Mock).mockReturnValue(true);
      const schema = Yup.string().notContainHtml();
      await expect(schema.validate('ValidName')).resolves.toBe('ValidName');
      expect(validators.validateNameHtml).toHaveBeenCalledWith('ValidName');
    });

    it('should fail validation when name contains HTML', async () => {
      (validators.validateNameHtml as jest.Mock).mockReturnValue(false);
      const schema = Yup.string().notContainHtml();
      await expect(schema.validate('<div>Name</div>')).rejects.toThrow();
    });
  });

  describe('yupValidator', () => {
    describe('email', () => {
      it('should validate valid email', async () => {
        (isEmail as jest.Mock).mockReturnValue(true);
        const validator = yupValidator();
        await expect(validator.email.validate('test@example.com')).resolves.toBe('test@example.com');
      });

      it('should fail for invalid email', async () => {
        (isEmail as jest.Mock).mockReturnValue(false);
        const validator = yupValidator();
        await expect(validator.email.validate('invalid-email')).rejects.toThrow();
      });
    });

    describe('emailRequired', () => {
      it('should validate required email', async () => {
        (isEmail as jest.Mock).mockReturnValue(true);
        const validator = yupValidator();
        await expect(validator.emailRequired.validate('test@example.com')).resolves.toBe('test@example.com');
      });

      it('should fail for empty email', async () => {
        const validator = yupValidator();
        await expect(validator.emailRequired.validate('')).rejects.toThrow();
      });
    });

    describe('passwordWithStrength', () => {
      it('should validate password with strength', async () => {
        (validatePassword as jest.Mock).mockReturnValue(true);
        const validator = yupValidator();
        await expect(validator.passwordWithStrength.validate('ValidPass123')).resolves.toBe('ValidPass123');
      });

      it('should fail for weak password', async () => {
        (validatePassword as jest.Mock).mockReturnValue(false);
        const validator = yupValidator();
        await expect(validator.passwordWithStrength.validate('weak')).rejects.toThrow();
      });

      it('should fail for empty password', async () => {
        const validator = yupValidator();
        await expect(validator.passwordWithStrength.validate('')).rejects.toThrow();
      });
    });

    describe('password', () => {
      it('should validate password', async () => {
        const validator = yupValidator();
        await expect(validator.password.validate('password123')).resolves.toBe('password123');
      });

      it('should fail for empty password', async () => {
        const validator = yupValidator();
        await expect(validator.password.validate('')).rejects.toThrow();
      });
    });

    describe('name', () => {
      it('should validate name', async () => {
        const validator = yupValidator();
        await expect(validator.name.validate('John Doe')).resolves.toBe('John Doe');
      });

      it('should allow empty name', async () => {
        const validator = yupValidator();
        await expect(validator.name.validate('')).resolves.toBe('');
      });
    });

    describe('userName', () => {
      it('should validate valid username', async () => {
        (validators.validateNameUrl as jest.Mock).mockReturnValue(true);
        (validators.validateNameHtml as jest.Mock).mockReturnValue(true);
        const validator = yupValidator();
        await expect(validator.userName.validate('JohnDoe')).resolves.toBe('JohnDoe');
      });

      it('should fail for empty username', async () => {
        const validator = yupValidator();
        await expect(validator.userName.validate('')).rejects.toThrow();
      });

      it('should fail for username with URL', async () => {
        (validators.validateNameUrl as jest.Mock).mockReturnValue(false);
        const validator = yupValidator();
        await expect(validator.userName.validate('http://example.com')).rejects.toThrow();
      });
    });

    describe('domainRequired', () => {
      it('should validate valid domain', async () => {
        (isFQDN as jest.Mock).mockReturnValue(true);
        const validator = yupValidator();
        await expect(validator.domainRequired.validate('example.com')).resolves.toBe('example.com');
      });

      it('should fail for empty domain', async () => {
        const validator = yupValidator();
        await expect(validator.domainRequired.validate('')).rejects.toThrow();
      });
    });

    describe('organizationName', () => {
      it('should validate valid organization name', async () => {
        (validators.validateNameUrl as jest.Mock).mockReturnValue(true);
        (validators.validateNameHtml as jest.Mock).mockReturnValue(true);
        const validator = yupValidator();
        await expect(validator.organizationName.validate('My Organization')).resolves.toBe('My Organization');
      });

      it('should fail for empty organization name', async () => {
        const validator = yupValidator();
        await expect(validator.organizationName.validate('')).rejects.toThrow();
      });
    });

    describe('storageNameValidate', () => {
      it('should validate storage name', async () => {
        const validator = yupValidator();
        await expect(validator.storageNameValidate.validate('Document Name')).resolves.toBe('Document Name');
      });

      it('should fail for empty storage name', async () => {
        const validator = yupValidator();
        await expect(validator.storageNameValidate.validate('')).rejects.toThrow();
      });
    });
  });
});

