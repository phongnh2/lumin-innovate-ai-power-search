import { fetchGoogleTokenInfo, createGoogleCallback } from '../utils';
import { AWS_EVENTS } from 'constants/awsEvents';
import { STATUS_CODE } from 'constants/lumin-common';
import { eventTracking } from 'utils/recordUtil';
import { IGoogleCallbackResponse, IGoogleEndPointResponse } from '../types';

jest.mock('utils/recordUtil', () => ({
  eventTracking: jest.fn(),
}));

describe('utils', () => {
  describe('fetchGoogleTokenInfo', () => {
    const mockCredential = 'mock-credential-token';
    const mockTokenInfo: IGoogleEndPointResponse = {
      sub: '123456789',
      name: 'John Doe',
      given_name: 'John',
      family_name: 'Doe',
      picture: 'https://example.com/photo.jpg',
      email: 'john.doe@example.com',
    };

    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('should fetch token info successfully', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        status: STATUS_CODE.SUCCEED,
        json: jest.fn().mockResolvedValueOnce(mockTokenInfo),
      });

      const result = await fetchGoogleTokenInfo(mockCredential);

      expect(global.fetch).toHaveBeenCalledWith(
        `https://oauth2.googleapis.com/tokeninfo?id_token=${mockCredential}`
      );
      expect(result).toEqual(mockTokenInfo);
    });

    it('should throw error when response status is not success', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        status: 400,
        json: jest.fn(),
      });

      await expect(fetchGoogleTokenInfo(mockCredential)).rejects.toThrow('Failed to fetch token info');
    });

    it('should throw error when fetch fails', async () => {
      const networkError = new Error('Network error');
      (global.fetch as jest.Mock).mockRejectedValueOnce(networkError);

      await expect(fetchGoogleTokenInfo(mockCredential)).rejects.toThrow('Network error');
    });

    it('should handle 401 unauthorized status', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        status: 401,
        json: jest.fn(),
      });

      await expect(fetchGoogleTokenInfo(mockCredential)).rejects.toThrow('Failed to fetch token info');
    });

    it('should handle 500 server error status', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        status: 500,
        json: jest.fn(),
      });

      await expect(fetchGoogleTokenInfo(mockCredential)).rejects.toThrow('Failed to fetch token info');
    });
  });

  describe('createGoogleCallback', () => {
    const mockOnSuccess = jest.fn();
    const mockOnError = jest.fn();
    const mockCredential = 'mock-credential-token';
    const mockTokenInfo: IGoogleEndPointResponse = {
      sub: '123456789',
      name: 'John Doe',
      given_name: 'John',
      family_name: 'Doe',
      picture: 'https://example.com/photo.jpg',
      email: 'john.doe@example.com',
    };

    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('should return a callback function', () => {
      const callback = createGoogleCallback(mockOnSuccess, mockOnError);

      expect(typeof callback).toBe('function');
    });

    describe('successful flow', () => {
      it('should call onSuccess with token info when credential is valid', async () => {
        (global.fetch as jest.Mock).mockResolvedValueOnce({
          status: STATUS_CODE.SUCCEED,
          json: jest.fn().mockResolvedValueOnce(mockTokenInfo),
        });

        const callback = createGoogleCallback(mockOnSuccess, mockOnError);
        const data: IGoogleCallbackResponse = { credential: mockCredential };

        await callback(data);

        expect(mockOnSuccess).toHaveBeenCalledWith(mockTokenInfo);
        expect(mockOnError).not.toHaveBeenCalled();
      });

      it('should track sign-in success event', async () => {
        (global.fetch as jest.Mock).mockResolvedValueOnce({
          status: STATUS_CODE.SUCCEED,
          json: jest.fn().mockResolvedValueOnce(mockTokenInfo),
        });

        const callback = createGoogleCallback(mockOnSuccess, mockOnError);
        const data: IGoogleCallbackResponse = { credential: mockCredential };

        await callback(data);

        expect(eventTracking).toHaveBeenCalledWith(AWS_EVENTS.GOOGLE_ONE_TAP.SIGN_IN_SUCCESS, {
          email: mockTokenInfo.email,
        });
      });
    });

    describe('error handling', () => {
      it('should call onError when credential is missing', async () => {
        const callback = createGoogleCallback(mockOnSuccess, mockOnError);
        const data: IGoogleCallbackResponse = {};

        await callback(data);

        expect(mockOnError).toHaveBeenCalledWith(expect.any(Error));
        expect(mockOnError.mock.calls[0][0].message).toBe('Missing credential in Google response');
        expect(mockOnSuccess).not.toHaveBeenCalled();
      });

      it('should call onError when credential is undefined', async () => {
        const callback = createGoogleCallback(mockOnSuccess, mockOnError);
        const data: IGoogleCallbackResponse = { credential: undefined };

        await callback(data);

        expect(mockOnError).toHaveBeenCalledWith(expect.any(Error));
        expect(mockOnSuccess).not.toHaveBeenCalled();
      });

      it('should call onError when fetch fails', async () => {
        const fetchError = new Error('Fetch failed');
        (global.fetch as jest.Mock).mockRejectedValueOnce(fetchError);

        const callback = createGoogleCallback(mockOnSuccess, mockOnError);
        const data: IGoogleCallbackResponse = { credential: mockCredential };

        await callback(data);

        expect(mockOnError).toHaveBeenCalledWith(fetchError);
        expect(mockOnSuccess).not.toHaveBeenCalled();
      });

      it('should call onError when token info fetch returns error status', async () => {
        (global.fetch as jest.Mock).mockResolvedValueOnce({
          status: 400,
          json: jest.fn(),
        });

        const callback = createGoogleCallback(mockOnSuccess, mockOnError);
        const data: IGoogleCallbackResponse = { credential: mockCredential };

        await callback(data);

        expect(mockOnError).toHaveBeenCalledWith(expect.any(Error));
        expect(mockOnSuccess).not.toHaveBeenCalled();
      });
    });

    describe('optional callbacks', () => {
      it('should handle undefined onSuccess callback', async () => {
        (global.fetch as jest.Mock).mockResolvedValueOnce({
          status: STATUS_CODE.SUCCEED,
          json: jest.fn().mockResolvedValueOnce(mockTokenInfo),
        });

        const callback = createGoogleCallback(undefined, mockOnError);
        const data: IGoogleCallbackResponse = { credential: mockCredential };

        await expect(callback(data)).resolves.not.toThrow();
      });

      it('should handle undefined onError callback when credential is missing', async () => {
        const callback = createGoogleCallback(mockOnSuccess, undefined);
        const data: IGoogleCallbackResponse = {};

        await expect(callback(data)).resolves.not.toThrow();
      });

      it('should handle undefined onError callback when fetch fails', async () => {
        (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Fetch failed'));

        const callback = createGoogleCallback(mockOnSuccess, undefined);
        const data: IGoogleCallbackResponse = { credential: mockCredential };

        await expect(callback(data)).resolves.not.toThrow();
      });

      it('should handle both callbacks being undefined', async () => {
        const callback = createGoogleCallback(undefined, undefined);
        const data: IGoogleCallbackResponse = {};

        await expect(callback(data)).resolves.not.toThrow();
      });
    });

    describe('data object variations', () => {
      it('should handle data being null-like', async () => {
        const callback = createGoogleCallback(mockOnSuccess, mockOnError);

        await callback({} as IGoogleCallbackResponse);

        expect(mockOnError).toHaveBeenCalled();
        expect(mockOnSuccess).not.toHaveBeenCalled();
      });

      it('should handle empty string credential', async () => {
        const callback = createGoogleCallback(mockOnSuccess, mockOnError);
        const data: IGoogleCallbackResponse = { credential: '' };

        await callback(data);

        expect(mockOnError).toHaveBeenCalled();
        expect(mockOnSuccess).not.toHaveBeenCalled();
      });
    });
  });
});

