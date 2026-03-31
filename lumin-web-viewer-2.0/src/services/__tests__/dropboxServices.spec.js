import { DROPBOX_AUTHORIZE_DOWNLOAD_API } from 'constants/urls';
import dropboxServices from '../dropboxServices';
import Axios from '@libs/axios';
import logger from '../../helpers/logger';
import fileMock from '../../__mocks__/fileMock';
import { LOGGER } from 'constants/lumin-common';
import * as electronServices from '../electronDropboxServices';
import { isElectron } from 'utils/corePathHelper';

jest.mock('../../helpers/logger');
jest.mock('@libs/axios');

jest.mock('../electronDropboxServices', () => ({
  authenticate: jest.fn(() => Promise.resolve()),
  subscribe: jest.fn(() => jest.fn()),
}));

jest.mock('utils/corePathHelper', () => ({
  isElectron: jest.fn(),
}));

beforeEach(() => {
  Axios.dropboxInstance = jest.fn(() => Promise.resolve({}));
});

afterEach(() => {
  jest.resetModules();
  jest.clearAllMocks();
});

describe('requestPermission - Electron branch', () => {
  it('should handle Electron authentication and subscription', async () => {
    isElectron.mockReturnValue(true);

    let subscribeCallback;
    const unsubscribeMock = jest.fn();

    electronServices.subscribe.mockImplementation((cb) => {
      subscribeCallback = cb;
      return unsubscribeMock;
    });

    electronServices.authenticate.mockResolvedValue();

    const fakeWindow = dropboxServices.requestPermission();

    subscribeCallback({ token: 'fake-token', error: null });

    expect(fakeWindow).toHaveProperty('close');
    expect(fakeWindow.closed).toBe(true); // should be closed after token
    expect(electronServices.authenticate).toHaveBeenCalledWith({
      authorizeUrl: DROPBOX_AUTHORIZE_DOWNLOAD_API,
    });
    expect(unsubscribeMock).toHaveBeenCalled();
  });

  it('should close fake window on authenticate error', async () => {
    isElectron.mockReturnValue(true);

    let subscribeCallback;
    const unsubscribeMock = jest.fn();

    electronServices.subscribe.mockImplementation((cb) => {
      subscribeCallback = cb;
      return unsubscribeMock;
    });

    electronServices.authenticate.mockRejectedValue(new Error('fail'));

    const fakeWindow = dropboxServices.requestPermission();

    await new Promise(process.nextTick);

    expect(fakeWindow.closed).toBe(true);
    expect(unsubscribeMock).toHaveBeenCalled();
  });
});

describe('requestPermission - Electron branch token/error false', () => {
  it('should not close fakeWindow and not call unsubscribe if token and error are falsy', () => {
    isElectron.mockReturnValue(true);

    const unsubscribeMock = jest.fn();
    let subscribeCallback;

    electronServices.subscribe.mockImplementation((cb) => {
      subscribeCallback = cb;
      return unsubscribeMock;
    });

    electronServices.authenticate.mockResolvedValue();

    const fakeWindow = dropboxServices.requestPermission();
    subscribeCallback({ token: null, error: null });

    expect(fakeWindow.closed).toBe(false);
    expect(unsubscribeMock).not.toHaveBeenCalled();
  });

  it('should call electronDropboxServices.authenticate and return for Electron', async () => {
    isElectron.mockReturnValue(true);
    const authSpy = electronServices.authenticate.mockResolvedValue();
    const error = { response: { status: 400 } };

    await dropboxServices.handleErrorGetFileFromDropbox(error);

    expect(authSpy).toHaveBeenCalledWith({
      authorizeUrl: DROPBOX_AUTHORIZE_DOWNLOAD_API,
    });
  });
});

describe('handleErrorGetFileFromDropbox - electron branch', () => {
  it('should call electronDropboxServices.authenticate when running in Electron', async () => {
    isElectron.mockReturnValue(true);
    const error = { response: { status: 500 } };

    await dropboxServices.handleErrorGetFileFromDropbox(error);

    expect(electronServices.authenticate).toHaveBeenCalledWith({
      authorizeUrl: DROPBOX_AUTHORIZE_DOWNLOAD_API,
    });
  });
});

describe('dropboxServices - getUserSpaceInfo', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    Axios.dropboxInstance = jest.fn().mockResolvedValue({ data: { used: 123, allocation: { allocated: '1000' } } });
  });

  it('should call dropboxInstance and log info', async () => {
    const spyLogInfo = jest.spyOn(logger, 'logInfo').mockImplementation(() => {});

    await dropboxServices.getUserSpaceInfo();

    expect(spyLogInfo).toHaveBeenCalledWith({
      message: LOGGER.EVENT.DROPBOX_GET_USER_SPACE_INFO,
      reason: LOGGER.Service.DROPBOX_GET_USER_SPACE_INFO,
    });
  });
});

describe('dropServices', () => {
  describe('uploadFileToDropbox', () => {
    it('Axios.dropboxInstance should be called', async () => {
      const param = { fileId: '123', file: fileMock };
      await dropboxServices.uploadFileToDropbox(param);
      expect(Axios.dropboxInstance).toBeCalled();
    });
  });

  describe('insertFileToDropbox', () => {
    it('Axios.dropboxInstance should be called', async () => {
      const param = { fileName: 'testtest', file: fileMock };
      await dropboxServices.insertFileToDropbox(param);
      expect(Axios.dropboxInstance).toBeCalled();
    });
  });

  describe('getFileMetaData', () => {
    it('Axios.dropboxInstance should be called', async () => {
      const fileId = '123';
      await dropboxServices.getFileMetaData(fileId);
      expect(Axios.dropboxInstance).toBeCalled();
    });
  });

  describe('getFolderFromPath', () => {
    it('should return folder path', () => {
      const path = 'path/example';
      const folderPath = dropboxServices.getFolderFromPath(path);
      expect(folderPath).toBe('path/');
    });

    it('should return only slash', () => {
      const path = '/path';
      const folderPath = dropboxServices.getFolderFromPath(path);
      expect(folderPath).toBe('/');
    });
  });

  describe('renameFile', () => {
    it('Axios.dropboxInstance should be called', async () => {
      const fileId = '123123';
      const fileName = 'testtest.pdf';
      const pathDisplay = 'test/example';
      await dropboxServices.renameFile(fileId, fileName, pathDisplay);
      expect(Axios.dropboxInstance).toBeCalled();
    });
  });

  describe('getFileFromDropbox', () => {
    it('should call Axios.axios.get and return file', async () => {
      Axios.axios = {
        get: jest.fn().mockResolvedValue({ data: new Uint8Array() }),
      };
      const fileId = '1233123';
      const fileName = 'test';
      const file = await dropboxServices.getFileFromDropbox(fileId, fileName);
      expect(file).toBeInstanceOf(global.File);
      expect(Axios.axios.get).toBeCalled();
    });

    it('should call handleErrorGetFileFromDropbox on error', async () => {
      const spy = jest.spyOn(dropboxServices, 'handleErrorGetFileFromDropbox').mockImplementation(() => {});
      Axios.axios.get = jest.fn().mockRejectedValue('failed');
      await dropboxServices.getFileFromDropbox({});
      expect(spy).toBeCalled();
      spy.mockRestore();
    });
  });

  describe('handleErrorGetFileFromDropbox', () => {
    it('should trigger logout dropbox for status 401 in browser', () => {
      isElectron.mockReturnValue(false);
      const error = { response: { status: 401 } };
      const spyWindow = jest.spyOn(window, 'open').mockImplementation(() => ({ close: jest.fn() }));

      dropboxServices.handleErrorGetFileFromDropbox(error);

      expect(spyWindow).toBeCalled();
      spyWindow.mockRestore();
    });

    it('should trigger requestPermission for status 400 in browser', () => {
      isElectron.mockReturnValue(false);
      const error = { response: { status: 400 } };
      const spyWindow = jest.spyOn(window, 'open').mockImplementation(() => ({}));

      dropboxServices.handleErrorGetFileFromDropbox(error);

      expect(spyWindow).toBeCalledWith(DROPBOX_AUTHORIZE_DOWNLOAD_API, '_blank');
      spyWindow.mockRestore();
    });
  });

  describe('requestPermission', () => {
    it('should call window.open in browser', () => {
      isElectron.mockReturnValue(false);
      const spyWindow = jest.spyOn(window, 'open').mockImplementation(() => {});
      dropboxServices.requestPermission();
      expect(spyWindow).toBeCalledWith(DROPBOX_AUTHORIZE_DOWNLOAD_API, '_blank');
      spyWindow.mockRestore();
    });

    it('should return a fake window in Electron', () => {
      isElectron.mockReturnValue(true);
      const fakeWindow = dropboxServices.requestPermission();
      expect(fakeWindow).toHaveProperty('close');
      expect(fakeWindow.closed).toBe(false);
    });
  });
});
