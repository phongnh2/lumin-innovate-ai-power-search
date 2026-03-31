import { store } from 'store';
import { selectors, setIsExceedQuotaExternalStorage } from 'features/QuotaExternalStorage/slices';
import { STORAGE_TYPE } from 'constants/lumin-common';
import { checkQuotaExternalStorage, checkAndDispatchQuotaExceeded } from '../checkQuotaExternalStorage';

jest.mock('store', () => ({
  store: {
    getState: jest.fn(),
    dispatch: jest.fn(),
  },
}));

jest.mock('features/QuotaExternalStorage/slices', () => ({
  selectors: {
    getExternalQuotaSpace: jest.fn(),
  },
  setIsExceedQuotaExternalStorage: jest.fn((value) => ({ type: 'SET_QUOTA_EXCEEDED', payload: value })),
}));

describe('checkQuotaExternalStorage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return isExceeded=false when quota is enough', () => {
    (selectors.getExternalQuotaSpace as jest.Mock).mockReturnValue({ remaining: 1000 });
    const file = new File([new ArrayBuffer(500)], 'file.pdf');
    const result = checkQuotaExternalStorage(file, { } as any);
    expect(result.isExceeded).toBe(false);
  });

  it('checkAndDispatchQuotaExceeded should dispatch action when quota exceeded and not OneDrive/Google', () => {
    (selectors.getExternalQuotaSpace as jest.Mock).mockReturnValue({ remaining: 100 });
    const file = new File([new ArrayBuffer(500)], 'file.pdf');
    const document = { size: 0, service: 'OTHER' as any };
    const result = checkAndDispatchQuotaExceeded(file, document as any);

    expect(result).toBe(true);
    expect(store.dispatch).toHaveBeenCalledWith(setIsExceedQuotaExternalStorage(true));
  });

  it('checkAndDispatchQuotaExceeded should not dispatch for OneDrive/Google service', () => {
    (selectors.getExternalQuotaSpace as jest.Mock).mockReturnValue({ remaining: 100 });
    const file = new File([new ArrayBuffer(500)], 'file.pdf');
    const document = { size: 0, service: STORAGE_TYPE.ONEDRIVE };
    const result = checkAndDispatchQuotaExceeded(file, document as any);

    expect(result).toBe(false);
    expect(store.dispatch).not.toHaveBeenCalled();
  });
});
