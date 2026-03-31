import { renderHook } from '@testing-library/react';
import { useSelector } from 'react-redux';

import { useDocumentPermission } from '../useDocumentPermission';
import getCurrentRole from 'helpers/getCurrentRole';
import { getDocumentRoleIndex } from 'utils/permission';

import { DocumentRole } from 'constants/documentConstants';

jest.mock('react-redux', () => ({
  useSelector: jest.fn(),
  shallowEqual: jest.fn(),
}));

jest.mock('helpers/getCurrentRole', () => jest.fn());

jest.mock('utils/permission', () => ({
  getDocumentRoleIndex: jest.fn(),
}));

describe('useDocumentPermission', () => {
  const mockCurrentUser = { _id: 'user-123', email: 'test@example.com' };

  beforeEach(() => {
    jest.clearAllMocks();
    useSelector.mockReturnValue(mockCurrentUser);
  });

  describe('canShare', () => {
    it('should return true when user has owner role', () => {
      getCurrentRole.mockReturnValue(DocumentRole.OWNER);
      getDocumentRoleIndex
        .mockReturnValueOnce(0) // owner role index
        .mockReturnValueOnce(1); // sharer role index

      const mockDocument = { _id: 'doc-123' };
      const { result } = renderHook(() => useDocumentPermission(mockDocument));

      expect(result.current.canShare).toBe(true);
    });

    it('should return true when user has sharer role', () => {
      getCurrentRole.mockReturnValue(DocumentRole.SHARER);
      getDocumentRoleIndex
        .mockReturnValueOnce(1) // sharer role index
        .mockReturnValueOnce(1); // sharer role index

      const mockDocument = { _id: 'doc-123' };
      const { result } = renderHook(() => useDocumentPermission(mockDocument));

      expect(result.current.canShare).toBe(true);
    });

    it('should return false when user has editor role', () => {
      getCurrentRole.mockReturnValue(DocumentRole.EDITOR);
      getDocumentRoleIndex
        .mockReturnValueOnce(2) // editor role index
        .mockReturnValueOnce(1); // sharer role index

      const mockDocument = { _id: 'doc-123' };
      const { result } = renderHook(() => useDocumentPermission(mockDocument));

      expect(result.current.canShare).toBe(false);
    });
  });

  describe('canEdit', () => {
    it('should return true when user has owner role', () => {
      getCurrentRole.mockReturnValue(DocumentRole.OWNER);
      getDocumentRoleIndex
        .mockReturnValueOnce(0) // owner
        .mockReturnValueOnce(1) // sharer
        .mockReturnValueOnce(0) // owner (for canEdit)
        .mockReturnValueOnce(2); // editor

      const mockDocument = { _id: 'doc-123' };
      const { result } = renderHook(() => useDocumentPermission(mockDocument));

      expect(result.current.canEdit).toBe(true);
    });

    it('should return true when user has editor role', () => {
      getCurrentRole.mockReturnValue(DocumentRole.EDITOR);
      getDocumentRoleIndex
        .mockReturnValueOnce(2) // editor
        .mockReturnValueOnce(1) // sharer
        .mockReturnValueOnce(2) // editor (for canEdit)
        .mockReturnValueOnce(2); // editor

      const mockDocument = { _id: 'doc-123' };
      const { result } = renderHook(() => useDocumentPermission(mockDocument));

      expect(result.current.canEdit).toBe(true);
    });

    it('should return false when user has viewer role', () => {
      getCurrentRole.mockReturnValue(DocumentRole.VIEWER);
      getDocumentRoleIndex
        .mockReturnValueOnce(3) // viewer
        .mockReturnValueOnce(1) // sharer
        .mockReturnValueOnce(3) // viewer (for canEdit)
        .mockReturnValueOnce(2); // editor

      const mockDocument = { _id: 'doc-123' };
      const { result } = renderHook(() => useDocumentPermission(mockDocument));

      expect(result.current.canEdit).toBe(false);
    });
  });

  describe('canComment', () => {
    it('should return true when user has viewer role and is logged in', () => {
      useSelector.mockReturnValue(mockCurrentUser);
      getCurrentRole.mockReturnValue(DocumentRole.VIEWER);
      getDocumentRoleIndex
        .mockReturnValueOnce(3) // viewer
        .mockReturnValueOnce(1) // sharer
        .mockReturnValueOnce(3) // viewer (for canEdit)
        .mockReturnValueOnce(2) // editor
        .mockReturnValueOnce(3) // viewer (for canComment)
        .mockReturnValueOnce(3); // viewer

      const mockDocument = { _id: 'doc-123' };
      const { result } = renderHook(() => useDocumentPermission(mockDocument));

      expect(result.current.canComment).toBeTruthy();
    });

    it('should return false when user is not logged in', () => {
      useSelector.mockReturnValue(null);
      getCurrentRole.mockReturnValue(DocumentRole.VIEWER);
      getDocumentRoleIndex
        .mockReturnValueOnce(3) // viewer
        .mockReturnValueOnce(1) // sharer
        .mockReturnValueOnce(3) // viewer (for canEdit)
        .mockReturnValueOnce(2) // editor
        .mockReturnValueOnce(3) // viewer (for canComment)
        .mockReturnValueOnce(3); // viewer

      const mockDocument = { _id: 'doc-123' };
      const { result } = renderHook(() => useDocumentPermission(mockDocument));

      expect(result.current.canComment).toBeFalsy();
    });

    it('should return false when user has spectator role', () => {
      useSelector.mockReturnValue(mockCurrentUser);
      getCurrentRole.mockReturnValue(DocumentRole.SPECTATOR);
      getDocumentRoleIndex
        .mockReturnValueOnce(4) // spectator
        .mockReturnValueOnce(1) // sharer
        .mockReturnValueOnce(4) // spectator (for canEdit)
        .mockReturnValueOnce(2) // editor
        .mockReturnValueOnce(4) // spectator (for canComment)
        .mockReturnValueOnce(3); // viewer

      const mockDocument = { _id: 'doc-123' };
      const { result } = renderHook(() => useDocumentPermission(mockDocument));

      expect(result.current.canComment).toBeFalsy();
    });
  });
});

