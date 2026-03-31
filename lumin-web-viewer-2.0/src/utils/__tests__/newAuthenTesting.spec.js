import { hasUserCreatedAfterLaunchNewAuthen, isUserNeedToJoinOrg, isUserInNewAuthenTestingScope } from '../newAuthenTesting';
import { UserUtilities } from '../Factory/User';
import { getLanguageFromUrl } from '../getLanguage';
import { Routers } from 'constants/Routers';
import dayjs from 'dayjs';
import { ENABLE_NEW_AUTHEN_DATE } from 'constants/urls';

jest.mock('../getLanguage', () => ({
  getLanguageFromUrl: jest.fn(),
}));

jest.mock('../Factory/User', () => ({
  UserUtilities: jest.fn().mockImplementation(() => ({
    isFree: jest.fn(),
  })),
}));

describe('newAuthenTesting', () => {
  const originalLocation = window.location;

  beforeEach(() => {
    jest.clearAllMocks();
    delete window.location;
    window.location = { pathname: '/' };
  });

  afterAll(() => {
    window.location = originalLocation;
  });

  it('hasUserCreatedAfterLaunchNewAuthen returns false if created before launch', () => {
    expect(hasUserCreatedAfterLaunchNewAuthen({ createdAt: '2021-01-01' })).toBe(false);
  });

  it('isUserNeedToJoinOrg returns false for non-free user', () => {
    UserUtilities.mockImplementation(() => ({ isFree: () => false }));
    expect(isUserNeedToJoinOrg({ hasJoinedOrg: false, createdAt: ENABLE_NEW_AUTHEN_DATE })).toBe(false);
  });

  it('isUserInNewAuthenTestingScope - except page returns true', () => {
    const user = {
      hasJoinedOrg: false,
      createdAt: dayjs(ENABLE_NEW_AUTHEN_DATE).add(1, 'day').toISOString(),
    };
    UserUtilities.mockImplementation(() => ({ isFree: () => true }));
    getLanguageFromUrl.mockReturnValue(null);

    Object.defineProperty(window, 'location', {
      writable: true,
      value: { pathname: Routers.JOIN_YOUR_ORGANIZATIONS },
    });

    expect(isUserInNewAuthenTestingScope(user)).toBe(false);
  });

  it('isUserInNewAuthenTestingScope - not except page returns true', () => {
    const user = {
      hasJoinedOrg: false,
      createdAt: dayjs(ENABLE_NEW_AUTHEN_DATE).add(1, 'day').toISOString(),
    };
    UserUtilities.mockImplementation(() => ({ isFree: () => true }));
    getLanguageFromUrl.mockReturnValue(true);

    Object.defineProperty(window, 'location', {
      writable: true,
      value: { pathname: '/some-other-page' },
    });

    expect(isUserInNewAuthenTestingScope(user)).toBe(true);
  });
});
