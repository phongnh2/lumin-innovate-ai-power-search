import { renderHook, act } from '@testing-library/react';
import { useDispatch } from 'react-redux';

import actions from 'actions';
import dropboxServices from 'services/dropboxServices';
import googleServices from 'services/googleServices';
import { oneDriveServices } from 'services/oneDriveServices';
import { DataElements } from 'constants/dataElement';
import { STORAGE_TYPE } from 'constants/lumin-common';

import useRequestPermission from '../useRequestPermission';

jest.mock('react-redux', () => ({
  useDispatch: jest.fn(),
}));

jest.mock('actions', () => ({
  openElement: jest.fn((payload) => ({ type: 'OPEN_ELEMENT', payload })),
  closeElement: jest.fn((payload) => ({ type: 'CLOSE_ELEMENT', payload })),
}));

jest.mock('services/dropboxServices', () => ({
  requestPermission: jest.fn(),
}));

jest.mock('services/googleServices', () => ({
  implicitSignIn: jest.fn(),
}));

jest.mock('services/oneDriveServices', () => ({
  oneDriveServices: {
    getToken: jest.fn(),
  },
}));

describe('useRequestPermission', () => {
  const mockDispatch = jest.fn();
  const mockCallback = jest.fn();
  const mockOnError = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useDispatch as jest.Mock).mockReturnValue(mockDispatch);
  });

  describe('Google Drive', () => {
    it('should handle successful Google permission request', async () => {
      (googleServices.implicitSignIn as jest.Mock).mockImplementation(async ({ callback }) => {
        callback();
      });

      const { result } = renderHook(() => useRequestPermission(STORAGE_TYPE.GOOGLE));
      const requestPermission = result.current;

      await act(async () => {
        await requestPermission(mockCallback, mockOnError);
      });

      expect(mockDispatch).toHaveBeenCalledWith(actions.openElement(DataElements.LOADING_MODAL));
      expect(googleServices.implicitSignIn).toHaveBeenCalledWith({ callback: mockCallback });
      expect(mockCallback).toHaveBeenCalled();
      expect(mockDispatch).toHaveBeenCalledWith(actions.closeElement(DataElements.LOADING_MODAL));
    });

    it('should handle failed Google permission request', async () => {
      const error = new Error('Google Auth Failed');
      (googleServices.implicitSignIn as jest.Mock).mockRejectedValue(error);

      const { result } = renderHook(() => useRequestPermission(STORAGE_TYPE.GOOGLE));
      const requestPermission = result.current;

      await act(async () => {
        await requestPermission(mockCallback, mockOnError);
      });

      expect(mockDispatch).toHaveBeenCalledWith(actions.openElement(DataElements.LOADING_MODAL));
      expect(mockOnError).toHaveBeenCalledWith(error);
      expect(mockDispatch).toHaveBeenCalledWith(actions.closeElement(DataElements.LOADING_MODAL));
    });
  });

  describe('Dropbox', () => {
    it('should handle successful Dropbox permission request', () => {
      const { result } = renderHook(() => useRequestPermission(STORAGE_TYPE.DROPBOX));
      const requestPermission = result.current;

      act(() => {
        requestPermission(mockCallback, mockOnError);
      });

      expect(mockDispatch).toHaveBeenCalledWith(actions.openElement(DataElements.LOADING_MODAL));
      expect(dropboxServices.requestPermission).toHaveBeenCalled();

      act(() => {
        const event = new CustomEvent('dropboxAuthorized', {
          detail: { token: 'valid-token' },
        });
        window.dispatchEvent(event);
      });

      expect(mockCallback).toHaveBeenCalled();
      expect(mockDispatch).toHaveBeenCalledWith(actions.closeElement(DataElements.LOADING_MODAL));
    });

    it('should handle failed Dropbox permission request (no token)', () => {
      const errorMessage = 'Access denied';
      const { result } = renderHook(() => useRequestPermission(STORAGE_TYPE.DROPBOX));
      const requestPermission = result.current;

      act(() => {
        requestPermission(mockCallback, mockOnError);
      });

      act(() => {
        const event = new CustomEvent('dropboxAuthorized', {
          detail: { token: undefined, errorMessage },
        });
        window.dispatchEvent(event);
      });

      expect(mockCallback).not.toHaveBeenCalled();
      expect(mockOnError).toHaveBeenCalledWith(errorMessage);
      expect(mockDispatch).toHaveBeenCalledWith(actions.closeElement(DataElements.LOADING_MODAL));
    });
  });

  describe('OneDrive', () => {
    it('should handle successful OneDrive permission request', async () => {
      (oneDriveServices.getToken as jest.Mock).mockResolvedValue('token');

      const { result } = renderHook(() => useRequestPermission(STORAGE_TYPE.ONEDRIVE));
      const requestPermission = result.current;

      await act(async () => {
        await requestPermission(mockCallback, mockOnError);
      });

      expect(mockDispatch).toHaveBeenCalledWith(actions.openElement(DataElements.LOADING_MODAL));
      expect(oneDriveServices.getToken).toHaveBeenCalled();
      expect(mockCallback).toHaveBeenCalled();
      expect(mockDispatch).toHaveBeenCalledWith(actions.closeElement(DataElements.LOADING_MODAL));
    });

    it('should handle failed OneDrive permission request', async () => {
      const error = new Error('OneDrive Auth Failed');
      (oneDriveServices.getToken as jest.Mock).mockRejectedValue(error);

      const { result } = renderHook(() => useRequestPermission(STORAGE_TYPE.ONEDRIVE));
      const requestPermission = result.current;

      await act(async () => {
        await requestPermission(mockCallback, mockOnError);
      });

      expect(mockDispatch).toHaveBeenCalledWith(actions.openElement(DataElements.LOADING_MODAL));
      expect(mockOnError).toHaveBeenCalledWith(error);
      expect(mockDispatch).toHaveBeenCalledWith(actions.closeElement(DataElements.LOADING_MODAL));
    });
  });

  describe('Default Parameters', () => {
    it('should use default callback parameters for Google Drive', async () => {
      (googleServices.implicitSignIn as jest.Mock).mockImplementation(async ({ callback }) => {
        callback();
      });

      const { result } = renderHook(() => useRequestPermission(STORAGE_TYPE.GOOGLE));
      const requestPermission = result.current;

      await act(async () => {
        await requestPermission();
      });

      expect(mockDispatch).toHaveBeenCalledWith(actions.openElement(DataElements.LOADING_MODAL));
      expect(googleServices.implicitSignIn).toHaveBeenCalled();
      expect(mockDispatch).toHaveBeenCalledWith(actions.closeElement(DataElements.LOADING_MODAL));
    });

    it('should use default callback parameters for Dropbox', () => {
      const { result } = renderHook(() => useRequestPermission(STORAGE_TYPE.DROPBOX));
      const requestPermission = result.current;

      act(() => {
        requestPermission();
      });

      expect(mockDispatch).toHaveBeenCalledWith(actions.openElement(DataElements.LOADING_MODAL));
      expect(dropboxServices.requestPermission).toHaveBeenCalled();

      act(() => {
        const event = new CustomEvent('dropboxAuthorized', {
          detail: { token: 'valid-token' },
        });
        window.dispatchEvent(event);
      });

      expect(mockDispatch).toHaveBeenCalledWith(actions.closeElement(DataElements.LOADING_MODAL));
    });

    it('should use default callback parameters for OneDrive', async () => {
      (oneDriveServices.getToken as jest.Mock).mockResolvedValue('token');

      const { result } = renderHook(() => useRequestPermission(STORAGE_TYPE.ONEDRIVE));
      const requestPermission = result.current;

      await act(async () => {
        await requestPermission();
      });

      expect(mockDispatch).toHaveBeenCalledWith(actions.openElement(DataElements.LOADING_MODAL));
      expect(oneDriveServices.getToken).toHaveBeenCalled();
      expect(mockDispatch).toHaveBeenCalledWith(actions.closeElement(DataElements.LOADING_MODAL));
    });
  });

  describe('Invalid Storage Type', () => {
    it('should throw error for invalid storage type', () => {
      const { result } = renderHook(() => useRequestPermission('INVALID_TYPE'));
      const requestPermission = result.current;

      expect(() => {
        requestPermission(mockCallback, mockOnError);
      }).toThrow('Invalid storage type: INVALID_TYPE');
    });
  });
});