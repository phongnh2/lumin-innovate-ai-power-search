import { renderHook, act } from '@testing-library/react';
import { useDispatch, useSelector } from 'react-redux';
import { matchPath, useNavigate, useLocation } from 'react-router';

import { useUpdateUserSubscription } from '../useUpdateUserSubscription';
import { useEnableWebReskin, useTranslation } from 'hooks';
import { userServices } from 'services';
import { kratosService } from 'services/oryServices';
import { socket } from 'src/socket';

import { USER_SUBSCRIPTION_TYPE } from 'constants/userConstants';
import { SOCKET_ON } from 'constants/socketConstant';

jest.mock('react-redux', () => ({
  useDispatch: jest.fn(),
  useSelector: jest.fn(),
  shallowEqual: jest.fn(),
}));

jest.mock('react-router', () => ({
  matchPath: jest.fn(),
  useNavigate: jest.fn(),
  useLocation: jest.fn(),
}));

jest.mock('react-use', () => ({
  useLatest: jest.fn((value) => ({ current: value })),
}));

jest.mock('hooks', () => ({
  useEnableWebReskin: jest.fn(),
  useTranslation: jest.fn(),
}));

jest.mock('services', () => ({
  authServices: {
    afterSignOut: jest.fn(),
  },
  userServices: {
    updateUserSubscription: jest.fn(),
  },
}));

jest.mock('services/oryServices', () => ({
  kratosService: {
    signOut: jest.fn(),
  },
}));

jest.mock('src/socket', () => ({
  socket: {
    on: jest.fn(),
    removeListener: jest.fn(),
  },
}));

jest.mock('helpers/logger', () => ({
  logError: jest.fn(),
  logInfo: jest.fn(),
}));

jest.mock('utils', () => ({
  toastUtils: {
    error: jest.fn(),
  },
}));

jest.mock('actions', () => ({
  openModal: jest.fn((settings) => ({ type: 'OPEN_MODAL', payload: settings })),
  updateCurrentUser: jest.fn((user) => ({ type: 'UPDATE_CURRENT_USER', payload: user })),
  updateModalProperties: jest.fn((props) => ({ type: 'UPDATE_MODAL_PROPERTIES', payload: props })),
  fetchOrganizations: jest.fn(() => ({ type: 'FETCH_ORGANIZATIONS' })),
}));

describe('useUpdateUserSubscription', () => {
  const mockDispatch = jest.fn();
  const mockNavigate = jest.fn();
  const mockCurrentUser = {
    _id: 'user-123',
    email: 'test@example.com',
    payment: { type: 'FREE' },
  };

  beforeEach(() => {
    jest.clearAllMocks();
    useDispatch.mockReturnValue(mockDispatch);
    useNavigate.mockReturnValue(mockNavigate);
    useLocation.mockReturnValue({ pathname: '/documents' });
    useSelector.mockReturnValue(mockCurrentUser);
    useEnableWebReskin.mockReturnValue({ isEnableReskin: true });
    useTranslation.mockReturnValue({
      t: (key) => key,
    });
    matchPath.mockReturnValue(null);
    userServices.updateUserSubscription.mockReturnValue({
      unsubscribe: jest.fn(),
    });
  });

  describe('subscription setup', () => {
    it('should set up subscription when current user exists', () => {
      renderHook(() => useUpdateUserSubscription());

      expect(userServices.updateUserSubscription).toHaveBeenCalledWith({
        onNext: expect.any(Function),
        onError: expect.any(Function),
      });
    });

    it('should unsubscribe on unmount', () => {
      const mockUnsubscribe = jest.fn();
      userServices.updateUserSubscription.mockReturnValue({
        unsubscribe: mockUnsubscribe,
      });

      const { unmount } = renderHook(() => useUpdateUserSubscription());

      unmount();

      expect(mockUnsubscribe).toHaveBeenCalled();
    });
  });

  describe('socket event listeners', () => {
    it('should set up socket listeners for ENABLE_GOOGLE_SIGN_IN_SUCCESS', () => {
      renderHook(() => useUpdateUserSubscription());

      expect(socket.on).toHaveBeenCalledWith(
        SOCKET_ON.ENABLE_GOOGLE_SIGN_IN_SUCCESS,
        expect.any(Function)
      );
    });

    it('should set up socket listeners for USER_EMAIL_CHANGED', () => {
      renderHook(() => useUpdateUserSubscription());

      expect(socket.on).toHaveBeenCalledWith(
        SOCKET_ON.USER_EMAIL_CHANGED,
        expect.any(Function)
      );
    });

    it('should remove socket listeners on unmount', () => {
      const { unmount } = renderHook(() => useUpdateUserSubscription());

      unmount();

      expect(socket.removeListener).toHaveBeenCalledWith({
        message: SOCKET_ON.ENABLE_GOOGLE_SIGN_IN_SUCCESS,
      });
      expect(socket.removeListener).toHaveBeenCalledWith({
        message: SOCKET_ON.USER_EMAIL_CHANGED,
      });
    });
  });

  describe('subscribeUpdateUser', () => {
    it('should handle CANCELED_SUBSCRIPTION type', () => {
      let subscriptionCallback;
      userServices.updateUserSubscription.mockImplementation(({ onNext }) => {
        subscriptionCallback = onNext;
        return { unsubscribe: jest.fn() };
      });

      renderHook(() => useUpdateUserSubscription());

      act(() => {
        subscriptionCallback({
          type: USER_SUBSCRIPTION_TYPE.CANCELED_SUBSCRIPTION,
          user: { ...mockCurrentUser, payment: { type: 'FREE' } },
        });
      });

      expect(mockDispatch).toHaveBeenCalled();
    });

    it('should handle SHOW_RATING_MODAL type', () => {
      let subscriptionCallback;
      userServices.updateUserSubscription.mockImplementation(({ onNext }) => {
        subscriptionCallback = onNext;
        return { unsubscribe: jest.fn() };
      });

      renderHook(() => useUpdateUserSubscription());

      act(() => {
        subscriptionCallback({
          type: USER_SUBSCRIPTION_TYPE.SHOW_RATING_MODAL,
          user: mockCurrentUser,
        });
      });

      expect(mockDispatch).toHaveBeenCalled();
    });

    it('should handle MIGRATING_SUCCESS type', () => {
      let subscriptionCallback;
      userServices.updateUserSubscription.mockImplementation(({ onNext }) => {
        subscriptionCallback = onNext;
        return { unsubscribe: jest.fn() };
      });

      renderHook(() => useUpdateUserSubscription());

      act(() => {
        subscriptionCallback({
          type: USER_SUBSCRIPTION_TYPE.MIGRATING_SUCCESS,
          user: mockCurrentUser,
          metadata: { migratedOrg: { url: 'test-org' } },
        });
      });

      expect(mockDispatch).toHaveBeenCalled();
    });
  });

  describe('onCancelSubscription', () => {
    it('should update current user when on org path', () => {
      matchPath.mockImplementation((config, pathname) => {
        if (config.path.includes('org')) {
          return { params: {} };
        }
        return null;
      });

      let subscriptionCallback;
      userServices.updateUserSubscription.mockImplementation(({ onNext }) => {
        subscriptionCallback = onNext;
        return { unsubscribe: jest.fn() };
      });

      renderHook(() => useUpdateUserSubscription());

      const updatedUser = { ...mockCurrentUser, payment: { type: 'FREE' } };
      act(() => {
        subscriptionCallback({
          type: USER_SUBSCRIPTION_TYPE.CANCELED_SUBSCRIPTION,
          user: updatedUser,
        });
      });

      expect(mockDispatch).toHaveBeenCalled();
    });

    it('should open modal when not on org path and plan changed', () => {
      matchPath.mockReturnValue(null);

      let subscriptionCallback;
      userServices.updateUserSubscription.mockImplementation(({ onNext }) => {
        subscriptionCallback = onNext;
        return { unsubscribe: jest.fn() };
      });

      renderHook(() => useUpdateUserSubscription());

      const updatedUser = { ...mockCurrentUser, payment: { type: 'PREMIUM' } };
      act(() => {
        subscriptionCallback({
          type: USER_SUBSCRIPTION_TYPE.CANCELED_SUBSCRIPTION,
          user: updatedUser,
        });
      });

      expect(mockDispatch).toHaveBeenCalled();
    });
  });
});

