import { ModalTypes } from 'constants/lumin-common';
import toastUtils from '../toastUtils';
import * as Notification from 'react-notifications-component';
import newLayoutToastUtils from 'luminComponents/GeneralLayout/utils/toastUtils';
import { isEnabledReskin } from 'features/Reskin';
import fireEvent from 'helpers/fireEvent';
import array from 'utils/array';

jest.mock('luminComponents/GeneralLayout/utils/toastUtils', () => ({
  openToastMulti: jest.fn(),
}));

jest.mock('features/Reskin', () => ({
  isEnabledReskin: jest.fn(),
}));

jest.mock('helpers/fireEvent', () => jest.fn());

jest.mock('utils/array', () => ({
  removeByIndex: jest.fn((arr, index) => {
    const newArr = [...arr];
    newArr.splice(index, 1);
    return newArr;
  }),
}));

jest.mock('react-notifications-component', () => ({
  Store: {
    addNotification: jest.fn(),
    removeNotification: jest.fn(),
  },
}));

jest.mock('uuid/v4', () => jest.fn(() => 'mock-uuid-123'));

describe('toastUtils', () => {
  let spyAddNotification;
  let spyRemoveNotification;
  let originalPathname;

  beforeEach(() => {
    spyAddNotification = jest.spyOn(Notification.Store, 'addNotification').mockImplementation(() => {});
    spyRemoveNotification = jest.spyOn(Notification.Store, 'removeNotification').mockImplementation(() => {});
    originalPathname = window.location.pathname;
    Object.defineProperty(window, 'location', {
      value: { pathname: '/test' },
      writable: true,
    });
    jest.clearAllMocks();
  });

  afterEach(() => {
    spyAddNotification.mockRestore();
    spyRemoveNotification.mockRestore();
    window.location.pathname = originalPathname;
    jest.clearAllMocks();
  });

  describe('openToastMulti', () => {
    it('should use newLayoutToastUtils when pathname includes /viewer/', async () => {
      window.location.pathname = '/viewer/test';
      const mockClose = jest.fn();
      newLayoutToastUtils.openToastMulti.mockResolvedValue(mockClose);

      const result = await toastUtils.openToastMulti({
        message: 'Test message',
        type: ModalTypes.SUCCESS,
      });

      expect(newLayoutToastUtils.openToastMulti).toHaveBeenCalledWith({
        title: undefined,
        message: 'Test message',
        type: ModalTypes.SUCCESS,
        error: undefined,
        duration: 5000,
        id: undefined,
        limit: 3,
        action: undefined,
        onRemoval: undefined,
      });
      expect(result).toBe(mockClose);
    });

    it('should use reskin toast when enabled and no onRemoval', async () => {
      window.location.pathname = '/test';
      isEnabledReskin.mockReturnValue(true);
      const mockEnqueueSnackbar = jest.fn();
      jest.doMock('lumin-ui/kiwi-ui', () => ({
        enqueueSnackbar: mockEnqueueSnackbar,
      }));

      await toastUtils.openToastMulti({
        message: 'Test message',
        type: ModalTypes.SUCCESS,
        useReskinToast: true,
      });

      expect(spyAddNotification).not.toHaveBeenCalled();
    });

    it('should call store.addNotification when useReskinToast is false', async () => {
      window.location.pathname = '/test';
      isEnabledReskin.mockReturnValue(false);

      await toastUtils.openToastMulti({
        message: 'Test message',
        type: ModalTypes.SUCCESS,
        useReskinToast: false,
      });

      expect(spyAddNotification).toHaveBeenCalled();
    });

    it('should add notification with correct properties', async () => {
      window.location.pathname = '/test';
      isEnabledReskin.mockReturnValue(false);

      await toastUtils.openToastMulti({
        title: 'Test Title',
        message: 'Test message',
        type: ModalTypes.ERROR,
        duration: 3000,
        id: 'custom-id',
      });

      expect(spyAddNotification).toHaveBeenCalledWith(
        expect.objectContaining({
          container: 'top-right',
          id: 'custom-id',
          dismiss: {
            duration: 3000,
            pauseOnHover: true,
          },
        })
      );
    });

    it('should generate uuid when id is not provided', async () => {
      window.location.pathname = '/test';
      isEnabledReskin.mockReturnValue(false);

      await toastUtils.openToastMulti({
        message: 'Test message',
        type: ModalTypes.SUCCESS,
      });

      expect(spyAddNotification).toHaveBeenCalledWith(
        expect.objectContaining({
          id: 'mock-uuid-123',
        })
      );
    });

    it('should handle notification limit', async () => {
      window.location.pathname = '/test';
      isEnabledReskin.mockReturnValue(false);

      await toastUtils.openToastMulti({
        message: 'Test 1',
        type: ModalTypes.SUCCESS,
        limit: 2,
      });
      await toastUtils.openToastMulti({
        message: 'Test 2',
        type: ModalTypes.SUCCESS,
        limit: 2,
      });
      await toastUtils.openToastMulti({
        message: 'Test 3',
        type: ModalTypes.SUCCESS,
        limit: 2,
      });

      expect(spyRemoveNotification).toHaveBeenCalled();
    });

    it('should call onRemoval callback when notification is removed', async () => {
      window.location.pathname = '/test';
      isEnabledReskin.mockReturnValue(false);
      const mockOnRemoval = jest.fn();

      await toastUtils.openToastMulti({
        message: 'Test message',
        type: ModalTypes.SUCCESS,
        onRemoval: mockOnRemoval,
      });

      const addNotificationCall = spyAddNotification.mock.calls[0][0];
      await addNotificationCall.onRemoval('test-id', 'timeout');

      expect(mockOnRemoval).toHaveBeenCalledWith('test-id', 'timeout');
      expect(fireEvent).toHaveBeenCalledWith('toastRemoved', { id: 'test-id', removedBy: 'timeout' });
    });

    it('should disable animation in effect when specified', async () => {
      window.location.pathname = '/test';
      isEnabledReskin.mockReturnValue(false);

      await toastUtils.openToastMulti({
        message: 'Test message',
        type: ModalTypes.SUCCESS,
        disableAnimationInEffect: true,
      });

      const addNotificationCall = spyAddNotification.mock.calls[0][0];
      expect(addNotificationCall.animationIn).toBeUndefined();
    });
  });

  describe('openUnknownErrorToast', () => {
    it('should open error toast with unknown error message', async () => {
      window.location.pathname = '/test';
      isEnabledReskin.mockReturnValue(false);

      await toastUtils.openUnknownErrorToast({
        title: 'Error Title',
      });

      expect(spyAddNotification).toHaveBeenCalled();
      const callArgs = spyAddNotification.mock.calls[0][0];
      expect(callArgs.content.props.type).toBe(ModalTypes.ERROR);
      expect(callArgs.content.props.title).toBe('Error Title');
    });
  });

  describe('success', () => {
    it('should open success toast', async () => {
      window.location.pathname = '/test';
      isEnabledReskin.mockReturnValue(false);

      await toastUtils.success({
        message: 'Success message',
        title: 'Success',
      });

      expect(spyAddNotification).toHaveBeenCalled();
      const callArgs = spyAddNotification.mock.calls[0][0];
      expect(callArgs.content.props.type).toBe(ModalTypes.SUCCESS);
      expect(callArgs.content.props.message).toBe('Success message');
      expect(callArgs.content.props.title).toBe('Success');
    });
  });

  describe('error', () => {
    it('should open error toast', async () => {
      window.location.pathname = '/test';
      isEnabledReskin.mockReturnValue(false);

      await toastUtils.error({
        message: 'Error message',
        title: 'Error',
      });

      expect(spyAddNotification).toHaveBeenCalled();
      const callArgs = spyAddNotification.mock.calls[0][0];
      expect(callArgs.content.props.type).toBe(ModalTypes.ERROR);
      expect(callArgs.content.props.message).toBe('Error message');
      expect(callArgs.content.props.title).toBe('Error');
    });
  });

  describe('warn', () => {
    it('should open warning toast', async () => {
      window.location.pathname = '/test';
      isEnabledReskin.mockReturnValue(false);

      await toastUtils.warn({
        message: 'Warning message',
        title: 'Warning',
      });

      expect(spyAddNotification).toHaveBeenCalled();
      const callArgs = spyAddNotification.mock.calls[0][0];
      expect(callArgs.content.props.type).toBe(ModalTypes.WARNING);
      expect(callArgs.content.props.message).toBe('Warning message');
      expect(callArgs.content.props.title).toBe('Warning');
    });
  });

  describe('info', () => {
    it('should open info toast', async () => {
      window.location.pathname = '/test';
      isEnabledReskin.mockReturnValue(false);

      await toastUtils.info({
        message: 'Info message',
        title: 'Info',
      });

      expect(spyAddNotification).toHaveBeenCalled();
      const callArgs = spyAddNotification.mock.calls[0][0];
      expect(callArgs.content.props.type).toBe(ModalTypes.INFO);
      expect(callArgs.content.props.message).toBe('Info message');
      expect(callArgs.content.props.title).toBe('Info');
    });
  });

  describe('removeById', () => {
    it('should remove notification by id', () => {
      toastUtils.removeById('test-id');
      expect(spyRemoveNotification).toHaveBeenCalledWith('test-id');
    });
  });

  describe('waitForToastRemoval', () => {
    it('should resolve immediately if toast is not in list', async () => {
      const promise = toastUtils.waitForToastRemoval('not-in-list');
      await expect(promise).resolves.toBeUndefined();
    });

    it('should wait for toastRemoved event', async () => {
      window.location.pathname = '/test';
      isEnabledReskin.mockReturnValue(false);

      await toastUtils.openToastMulti({
        message: 'Test',
        type: ModalTypes.SUCCESS,
        id: 'test-id',
      });

      const waitPromise = toastUtils.waitForToastRemoval('test-id');

      const customEvent = new CustomEvent('toastRemoved', {
        detail: { id: 'test-id' },
      });
      window.dispatchEvent(customEvent);

      await expect(waitPromise).resolves.toBeUndefined();
    });
  });

  describe('REMOVED_BY', () => {
    it('should have correct constants', () => {
      expect(toastUtils.REMOVED_BY.MANUAL).toBe('manual');
      expect(toastUtils.REMOVED_BY.TIMEOUT).toBe('timeout');
      expect(toastUtils.REMOVED_BY.CLICK).toBe('click');
    });
  });
});
