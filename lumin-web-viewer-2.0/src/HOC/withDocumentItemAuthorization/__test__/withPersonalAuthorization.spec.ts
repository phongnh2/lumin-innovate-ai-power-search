import '@testing-library/jest-dom';
import { PersonalAuthTestCase } from './testUtils';

jest.mock('utils/checkDocumentRole', () => ({
  checkPersonalDocumentAction: jest.fn((role) => {
    const perms: Record<string, string[]> = {
      OWNER: ['View', 'Rename', 'Move', 'Remove', 'Share', 'MakeACopy', 'CopyLink', 'MarkFavorite', 'UploadToLumin', 'CreateAsTemplate', 'Merge'],
      SHARER: ['View', 'Rename', 'Share', 'MakeACopy', 'CopyLink', 'MarkFavorite'],
      EDITOR: ['View', 'MakeACopy', 'CopyLink', 'MarkFavorite'],
      VIEWER: ['View', 'CopyLink', 'MarkFavorite'],
      SPECTATOR: ['View'],
    };
    return perms[role] || ['View'];
  }),
}));

import withPersonalAuthorization from '../withPersonalAuthorization';

describe('withPersonalAuthorization', () => {
  const personalTestCases: PersonalAuthTestCase[] = [
    { docRole: 'owner', action: 'View', expected: true },
    { docRole: 'owner', action: 'Rename', expected: true },
    { docRole: 'owner', action: 'Move', expected: true },
    { docRole: 'owner', action: 'Remove', expected: true },
    { docRole: 'owner', action: 'Share', expected: true },
    { docRole: 'owner', action: 'MakeACopy', expected: true },
    { docRole: 'sharer', action: 'View', expected: true },
    { docRole: 'sharer', action: 'Rename', expected: true },
    { docRole: 'sharer', action: 'Share', expected: true },
    { docRole: 'sharer', action: 'Move', expected: false },
    { docRole: 'sharer', action: 'Remove', expected: false },
    { docRole: 'editor', action: 'View', expected: true },
    { docRole: 'editor', action: 'Rename', expected: false },
    { docRole: 'editor', action: 'Share', expected: false },
    { docRole: 'viewer', action: 'View', expected: true },
    { docRole: 'viewer', action: 'CopyLink', expected: true },
    { docRole: 'viewer', action: 'MakeACopy', expected: false },
    { docRole: 'spectator', action: 'View', expected: true },
    { docRole: 'spectator', action: 'CopyLink', expected: false },
  ];

  test.each(personalTestCases)('Personal: $docRole - $action = $expected', ({ docRole, action, expected }) => {
    const auth = withPersonalAuthorization({ roleOfDocument: docRole });
    expect(auth(action)).toBe(expected);
  });
});
