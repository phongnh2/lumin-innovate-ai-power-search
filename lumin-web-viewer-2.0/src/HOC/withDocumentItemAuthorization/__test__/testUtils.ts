// Shared test utilities for authorization tests

export const CURRENT_USER = { _id: 'user-123' };
export const OTHER_USER = 'other-user';

export interface AuthTestCase {
  userRole: string;
  ownerId: string;
  docRole: string;
  action: string;
  expected: boolean | undefined;
}

export interface PersonalAuthTestCase {
  docRole: string;
  action: string;
  expected: boolean;
}

export const createAuthorizeFn = <T extends (...args: unknown[]) => (action: string) => boolean | undefined>(
  authFn: T,
  params: Parameters<T>[0]
) => authFn(params);

export const testAuthorization = (
  authorize: (action: string) => boolean | undefined,
  action: string,
  expected: boolean | undefined
) => {
  expect(authorize(action)).toBe(expected);
};

