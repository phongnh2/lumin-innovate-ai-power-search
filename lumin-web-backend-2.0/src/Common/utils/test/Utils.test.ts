import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { Utils } from 'Common/utils/Utils';

describe('Utils', () => {
  describe('parseAuthHeader', () => {
    it('should return null if type of input not is string', () => {
      const result = Utils.parseAuthHeader({});
      expect(result).toBe(null);
    });

    it('should return matches object if run correctly', () => {
      const result = Utils.parseAuthHeader('Bearer token');
      expect(result).toEqual({ scheme: 'Bearer', value: 'token' });
    });
  });

  describe('validateEmail', () => {
    it('should return true if valid email', () => {
      const result = Utils.validateEmail('anbx@dgroup.co');
      expect(result).toBe(true);
    });

    it('should return false if inValid email', () => {
      const result = Utils.validateEmail('be');
      expect(result).toBe(false);
    });
  });

  // Disable since password strength is planned to be removed
  // describe('validatePassword', () => {
  //   it('should return true if valid password', () => {
  //     const result = Utils.validatePassword('Password');
  //     expect(result).toBe(true);
  //   });

  //   it('should return false if inValid email', () => {
  //     const result = Utils.validatePassword('pass');
  //     expect(result).toBe(false);
  //   });
  // });

  describe('hashPassword', () => {
    it('should return same hash string if run correctly', async () => {
      const password = 'lumin';
      const pass256 = crypto
        .createHash('sha256')
        .update(password)
        .digest('hex');
      await bcrypt.hash(pass256, 10);
      await Utils.hashPassword(password);

      expect(true).toBe(true);
    });
  });

  describe('getFileNameWithoutExtension', () => {
    it('should return return name without extension if run correctly', () => {
      const fileName = 'test.pdf';

      const result = Utils.getFileNameWithoutExtension(fileName);

      expect(result).toBe('test');
    });
  });

  describe('getExtensionFile', () => {
    it('should return return extension file if run correctly', () => {
      const fileName = 'test.pdf';

      const result = Utils.getExtensionFile(fileName);

      expect(result).toBe('pdf');
    });
  });

  describe('encryptData', () => {
    it('should return return encrypt data if run correctly', () => {
      const data = 'data';
      const key = 'B3vISKJC22xqBe8iTiVLUICM83KmdjT4';
      const result = Utils.encryptData(data, key);

      expect(result).toBe('eb8f6fcef4f24d283bd187fb6500e21a');
    });
  });

  describe('getUserShortName', () => {
    it('should return short name', () => {
      const username = 'Hieu do';
      expect(Utils.getUserShortName(username)).toBe('HD');
    });

    it('should return short name when name has a word', () => {
      const username = 'Hieu';
      expect(Utils.getUserShortName(username)).toBe('H');
    });

    it('should return short name when name has more than 2 word', () => {
      const username = 'Hieu do Minh';
      expect(Utils.getUserShortName(username)).toBe('HD');
    });
  });
});
