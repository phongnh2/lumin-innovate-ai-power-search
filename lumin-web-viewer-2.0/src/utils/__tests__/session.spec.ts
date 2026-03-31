import axios from 'axios';
import SessionUtils from '../session';
import LocalStorageUtils from '../localStorage';
import { LocalStorageKey } from 'constants/localStorageKey';

jest.mock('axios');
jest.mock('utils/localStorage');

describe('SessionUtils', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    Object.defineProperty(global, 'localStorage', {
      value: {
        getItem: jest.fn(),
        setItem: jest.fn(),
        removeItem: jest.fn(),
      },
      writable: true,
    });
    jest.spyOn(Date, 'now').mockReturnValue(1000);
  });

  describe('toSession', () => {
    it('should return session with tokenized', async () => {
      const mockData = { id: '123', tokenized: 'token' };
      (axios.get as jest.Mock).mockResolvedValue({ data: mockData });

      const result = await SessionUtils.toSession();
      expect(result).toEqual(mockData);
      expect(axios.get).toHaveBeenCalledWith(
        expect.stringContaining('/sessions/whoami'),
        expect.objectContaining({ params: { tokenize_as: 'lumin_authorization_jwt' } })
      );
    });

    it('should throw error if axios fails', async () => {
      (axios.get as jest.Mock).mockRejectedValue(new Error('fail'));

      await expect(SessionUtils.toSession()).rejects.toThrow('fail');
    });
  });

  describe('setAuthorizedToken', () => {
    it('should save token with expiredAt', () => {
      const token = 'token';
      const spySet = jest.spyOn(LocalStorageUtils, 'set');

      SessionUtils.setAuthorizedToken(token);

      expect(spySet).toHaveBeenCalledWith(
        expect.objectContaining({
          key: LocalStorageKey.ORY_ACCESS_TOKEN,
          value: expect.stringContaining(token),
        })
      );
    });

    it('should use process.env.AUTHOR_JWT_EXPIRED_AT to calculate expiredAt', () => {
      process.env.AUTHOR_JWT_EXPIRED_AT = '5000'; // ms
      const spySet = jest.spyOn(LocalStorageUtils, 'set');

      SessionUtils.setAuthorizedToken('token');

      const callArg = spySet.mock.calls[0][0];
      const storedValue = JSON.parse(callArg.value);

      expect(storedValue.token).toBe('token');
      expect(storedValue.expiredAt).toBe(1000 + 5000);
      delete process.env.AUTHOR_JWT_EXPIRED_AT;
    });
  });

  describe('generateNewAuthorizedToken', () => {
    it('should call toSession and setAuthorizedToken', async () => {
      const mockToken = 'token';
      jest.spyOn(SessionUtils, 'toSession').mockResolvedValue({ tokenized: mockToken } as any);
      const spySet = jest.spyOn(SessionUtils, 'setAuthorizedToken');

      const result = await SessionUtils.generateNewAuthorizedToken();
      expect(result).toBe(mockToken);
      expect(spySet).toHaveBeenCalledWith(mockToken);
    });

    it('should return empty string if toSession fails', async () => {
      jest.spyOn(SessionUtils, 'toSession').mockRejectedValue(new Error('fail'));
      const result = await SessionUtils.generateNewAuthorizedToken();
      expect(result).toBe('');
    });
  });

  describe('getAuthorizedToken', () => {
    it('should return token from localStorage if not expired', async () => {
      const tokenData = { token: 'token', expiredAt: Date.now() + 10000 };
      localStorage.getItem = jest.fn().mockReturnValue(JSON.stringify(tokenData));

      const result = await SessionUtils.getAuthorizedToken();
      expect(result).toBe(tokenData.token);
    });

    it('should generate new token if localStorage empty', async () => {
      localStorage.getItem = jest.fn().mockReturnValue(null);
      const spyGen = jest.spyOn(SessionUtils, 'generateNewAuthorizedToken').mockResolvedValue('newToken');

      const result = await SessionUtils.getAuthorizedToken();
      expect(result).toBe('newToken');
      expect(spyGen).toHaveBeenCalled();
    });

    it('should generate new token if expired', async () => {
      const tokenData = { token: 'token', expiredAt: Date.now() - 1000 };
      localStorage.getItem = jest.fn().mockReturnValue(JSON.stringify(tokenData));
      const spyGen = jest.spyOn(SessionUtils, 'generateNewAuthorizedToken').mockResolvedValue('newToken');

      const result = await SessionUtils.getAuthorizedToken();
      expect(result).toBe('newToken');
      expect(localStorage.removeItem).toHaveBeenCalledWith(LocalStorageKey.ORY_ACCESS_TOKEN);
      expect(spyGen).toHaveBeenCalled();
    });

    it('should force generate new token if forceNew=true', async () => {
      const spyGen = jest.spyOn(SessionUtils, 'generateNewAuthorizedToken').mockResolvedValue('forcedToken');

      const result = await SessionUtils.getAuthorizedToken({ forceNew: true });
      expect(result).toBe('forcedToken');
      expect(spyGen).toHaveBeenCalled();
    });

    it('should call generateNewAuthorizedToken if localStorage parsing fails', async () => {
      localStorage.getItem = jest.fn().mockReturnValue('invalid json');
      const spyGen = jest.spyOn(SessionUtils, 'generateNewAuthorizedToken').mockResolvedValue('newToken');

      const result = await SessionUtils.getAuthorizedToken();
      expect(result).toBe('newToken');
      expect(spyGen).toHaveBeenCalled();
    });
  });
});
