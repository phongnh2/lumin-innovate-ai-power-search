import { AWS_EVENTS } from 'constants/awsEvents';
import { SESSION_STORAGE_KEY } from 'constants/sessionStorageKey';

jest.mock('../EventCollection', () => {
  return {
    EventCollection: class {
      record = jest.fn();
      getInstance = jest.fn().mockResolvedValue({ record: jest.fn() });
      recordService = { record: jest.fn() };
    },
  };
});

import { GoogleDriveEventCollection } from '../GoogleDriveEventCollection';

describe('GoogleDriveEventCollection', () => {
  let collection;

  beforeEach(() => {
    collection = new GoogleDriveEventCollection();
    sessionStorage.clear();
  });

  describe('totalPopupInSession', () => {
    test('should record modal viewed with totalPopup from sessionStorage', () => {
      sessionStorage.setItem(SESSION_STORAGE_KEY.TOTAL_GOOGLE_POPUP, '3');

      collection.totalPopupInSession();

      expect(collection.record).toHaveBeenCalledWith({
        name: AWS_EVENTS.MODAL.VIEWED,
        attributes: {
          modalName: 'requestAccessToken',
          totalPopup: '3',
        },
      });
    });

    test('should remove sessionStorage key after recording', () => {
      sessionStorage.setItem(SESSION_STORAGE_KEY.TOTAL_GOOGLE_POPUP, '5');

      collection.totalPopupInSession();

      expect(sessionStorage.getItem(SESSION_STORAGE_KEY.TOTAL_GOOGLE_POPUP)).toBeNull();
    });

    test('should use 0 as default when no sessionStorage value', () => {
      collection.totalPopupInSession();

      expect(collection.record).toHaveBeenCalledWith({
        name: AWS_EVENTS.MODAL.VIEWED,
        attributes: {
          modalName: 'requestAccessToken',
          totalPopup: 0,
        },
      });
    });
  });
});
