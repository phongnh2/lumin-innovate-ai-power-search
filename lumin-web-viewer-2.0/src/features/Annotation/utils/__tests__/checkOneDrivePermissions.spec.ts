import { store } from 'store';
import selectors from 'selectors';
import actions from 'actions';
import { oneDriveServices, OneDriveFileRole } from 'services/oneDriveServices';
import logger from 'helpers/logger';
import { checkOneDrivePermissions } from '../checkOneDrivePermissions';
import { LOGGER } from 'constants/lumin-common';

jest.mock('store', () => ({
  store: {
    getState: jest.fn(),
    dispatch: jest.fn(),
  },
}));

jest.mock('selectors', () => ({
  getCurrentUser: jest.fn(),
  getCurrentDocument: jest.fn(),
}));

jest.mock('actions', () => ({
  setCanModifyDriveContent: jest.fn().mockReturnValue({ type: 'SET_CAN_MODIFY_DRIVE_CONTENT' }),
}));

jest.mock('services/oneDriveServices', () => ({
  oneDriveServices: {
    getMe: jest.fn(),
    getFilePermissions: jest.fn(),
  },
  OneDriveFileRole: {
    Owner: 'owner',
    Write: 'write',
  },
}));

jest.mock('helpers/logger', () => ({
  logError: jest.fn(),
}));

describe('checkOneDrivePermissions', () => {
  const mockUser = { email: 'test@example.com' };
  const mockDocument = {
    remoteId: 'remote-123',
    externalStorageAttributes: { driveId: 'drive-123' },
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (selectors.getCurrentUser as jest.Mock).mockReturnValue(mockUser);
    (selectors.getCurrentDocument as jest.Mock).mockReturnValue(mockDocument);
  });

  it('should return early if no current user is logged in', async () => {
    (selectors.getCurrentUser as jest.Mock).mockReturnValue(null);
    
    await checkOneDrivePermissions();
    
    expect(oneDriveServices.getMe).not.toHaveBeenCalled();
    expect(store.dispatch).not.toHaveBeenCalled();
  });

  it('should return early if no current document is loaded', async () => {
    (selectors.getCurrentDocument as jest.Mock).mockReturnValue(null);
    
    await checkOneDrivePermissions();
    
    expect(oneDriveServices.getMe).not.toHaveBeenCalled();
    expect(store.dispatch).not.toHaveBeenCalled();
  });

  it('should set permission if user is the Owner of the file', async () => {
    (oneDriveServices.getMe as jest.Mock).mockResolvedValue({
      owner: { user: { email: 'test@example.com' } },
    });
    (oneDriveServices.getFilePermissions as jest.Mock).mockResolvedValue({
      value: [
        {
          roles: [OneDriveFileRole.Owner],
          grantedToV2: { siteUser: { email: 'test@example.com' } },
        },
      ],
    });

    await checkOneDrivePermissions();

    expect(store.dispatch).toHaveBeenCalledWith(actions.setCanModifyDriveContent(true));
  });

  it('should set permission if user has Write role via grantedToIdentitiesV2', async () => {
    (oneDriveServices.getMe as jest.Mock).mockResolvedValue({
      owner: { user: { email: 'test@example.com' } },
    });
    (oneDriveServices.getFilePermissions as jest.Mock).mockResolvedValue({
      value: [
        {
          roles: [OneDriveFileRole.Write],
          grantedToIdentitiesV2: [{ siteUser: { email: 'test@example.com' } }],
        },
      ],
    });

    await checkOneDrivePermissions();

    expect(store.dispatch).toHaveBeenCalledWith(actions.setCanModifyDriveContent(true));
  });

  it('should skip permission check if roles is not an array (Edge Case)', async () => {
    (oneDriveServices.getMe as jest.Mock).mockResolvedValue({
      owner: { user: { email: 'test@example.com' } },
    });
    (oneDriveServices.getFilePermissions as jest.Mock).mockResolvedValue({
      value: [
        {
          // @ts-ignore: Testing invalid API response
          roles: 'invalid_string', 
        },
      ],
    });

    await checkOneDrivePermissions();

    expect(store.dispatch).not.toHaveBeenCalled();
  });

  it('should NOT set permission if user email does not match Owner or Write access', async () => {
    (oneDriveServices.getMe as jest.Mock).mockResolvedValue({
      owner: { user: { email: 'test@example.com' } },
    });
    (oneDriveServices.getFilePermissions as jest.Mock).mockResolvedValue({
      value: [
        {
          roles: [OneDriveFileRole.Owner],
          grantedToV2: { siteUser: { email: 'other@example.com' } },
        },
      ],
    });

    await checkOneDrivePermissions();

    expect(store.dispatch).not.toHaveBeenCalled();
  });

  it('should handle API errors and log them', async () => {
    const error = new Error('OneDrive API Timeout');
    (oneDriveServices.getMe as jest.Mock).mockRejectedValue(error);

    await checkOneDrivePermissions();

    expect(logger.logError).toHaveBeenCalledWith({
      reason: LOGGER.Service.ONE_DRIVE_API_ERROR,
      error,
      message: 'Error checking one drive permissions',
    });
    expect(store.dispatch).not.toHaveBeenCalled();
  });
});