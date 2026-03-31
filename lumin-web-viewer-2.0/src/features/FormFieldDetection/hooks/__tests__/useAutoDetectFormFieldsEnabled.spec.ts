import { renderHook } from '@testing-library/react';
import { useSelector } from 'react-redux';
import selectors from 'selectors';
import { useDocumentViewerLoaded } from 'hooks/useDocumentViewerLoaded';
import { useShallowSelector } from 'hooks/useShallowSelector';
import { useSyncDocumentChecker } from 'features/Document/hooks/useSyncDocumentChecker';
import getCurrentRole from 'helpers/getCurrentRole';
import { DOCUMENT_ROLES } from 'constants/lumin-common';
import { TOOLS_NAME } from 'constants/toolsName';
import { useCheckFormFieldsInDocument } from '../useCheckFormFieldsInDocument';
import { useEnableAutoDetect } from '../useEnableAutoDetect';
import { useAutoDetectFormFieldsEnabled } from '../useAutoDetectFormFieldsEnabled';

jest.mock('react-redux', () => ({
  useSelector: jest.fn(),
}));

jest.mock('hooks/useShallowSelector', () => ({
  useShallowSelector: jest.fn(),
}));

jest.mock('hooks/useDocumentViewerLoaded', () => ({
  useDocumentViewerLoaded: jest.fn(),
}));

jest.mock('features/Document/hooks/useSyncDocumentChecker', () => ({
  useSyncDocumentChecker: jest.fn(),
}));

jest.mock('helpers/getCurrentRole', () => ({
  __esModule: true,
  default: jest.fn(),
}));

jest.mock('../useCheckFormFieldsInDocument', () => ({
  useCheckFormFieldsInDocument: jest.fn(),
}));

jest.mock('../useEnableAutoDetect', () => ({
  useEnableAutoDetect: jest.fn(),
}));

describe('useAutoDetectFormFieldsEnabled', () => {
  const mockCurrentUser = { id: 'user-1', name: 'Test User' };
  const mockCurrentDocument = { id: 'doc-1', roleOfDocument: DOCUMENT_ROLES.EDITOR };

  beforeEach(() => {
    jest.clearAllMocks();
    (useDocumentViewerLoaded as jest.Mock).mockReturnValue({ loaded: true });
    (useEnableAutoDetect as jest.Mock).mockReturnValue({ enabled: true });
    (useSyncDocumentChecker as jest.Mock).mockReturnValue({ canSync: true });
    (useCheckFormFieldsInDocument as jest.Mock).mockReturnValue({ hasFormFieldsInDocument: false });
    (useShallowSelector as jest.Mock).mockImplementation((selector) => {
      if (selector === selectors.getCurrentDocument) {
        return mockCurrentDocument;
      }
      if (selector === selectors.getCurrentUser) {
        return mockCurrentUser;
      }
      return null;
    });
    (getCurrentRole as jest.Mock).mockReturnValue(DOCUMENT_ROLES.EDITOR);
    (useSelector as jest.Mock).mockImplementation((selector) => {
      if (selector === selectors.isPreviewOriginalVersionMode) {
        return false;
      }
      if (selector === selectors.isOffline) {
        return false;
      }
      if (selector === selectors.getActiveToolName) {
        return TOOLS_NAME.FREETEXT;
      }
      return null;
    });
  });

  describe('canUseAutoDetectFormFields', () => {
    it('should return true when all conditions are met', () => {
      const { result } = renderHook(() => useAutoDetectFormFieldsEnabled());
      expect(result.current.canUseAutoDetectFormFields).toBe(true);
    });

    it('should return false when currentUser is null', () => {
      (useShallowSelector as jest.Mock).mockImplementation((selector) => {
        if (selector === selectors.getCurrentDocument) {
          return mockCurrentDocument;
        }
        if (selector === selectors.getCurrentUser) {
          return null;
        }
        return null;
      });

      const { result } = renderHook(() => useAutoDetectFormFieldsEnabled());
      expect(result.current.canUseAutoDetectFormFields).toBe(false);
    });

    it('should return false when user role is not EDITOR, SHARER, or OWNER', () => {
      (getCurrentRole as jest.Mock).mockReturnValue(DOCUMENT_ROLES.VIEWER);

      const { result } = renderHook(() => useAutoDetectFormFieldsEnabled());
      expect(result.current.canUseAutoDetectFormFields).toBe(false);
    });

    it('should return false when enabled is false', () => {
      (useEnableAutoDetect as jest.Mock).mockReturnValue({ enabled: false });

      const { result } = renderHook(() => useAutoDetectFormFieldsEnabled());
      expect(result.current.canUseAutoDetectFormFields).toBe(false);
    });

    it('should return false when isPreviewOriginalVersionMode is true', () => {
      (useSelector as jest.Mock).mockImplementation((selector) => {
        if (selector === selectors.isPreviewOriginalVersionMode) {
          return true;
        }
        if (selector === selectors.isOffline) {
          return false;
        }
        if (selector === selectors.getActiveToolName) {
          return TOOLS_NAME.FREETEXT;
        }
        return null;
      });

      const { result } = renderHook(() => useAutoDetectFormFieldsEnabled());
      expect(result.current.canUseAutoDetectFormFields).toBe(false);
    });

    it('should return false when isOffline is true', () => {
      (useSelector as jest.Mock).mockImplementation((selector) => {
        if (selector === selectors.isPreviewOriginalVersionMode) {
          return false;
        }
        if (selector === selectors.isOffline) {
          return true;
        }
        if (selector === selectors.getActiveToolName) {
          return TOOLS_NAME.FREETEXT;
        }
        return null;
      });

      const { result } = renderHook(() => useAutoDetectFormFieldsEnabled());
      expect(result.current.canUseAutoDetectFormFields).toBe(false);
    });

    it('should return false when currentDocument is a system file', () => {
      const systemDocument = { ...mockCurrentDocument, isSystemFile: true };
      (useShallowSelector as jest.Mock).mockImplementation((selector) => {
        if (selector === selectors.getCurrentDocument) {
          return systemDocument;
        }
        if (selector === selectors.getCurrentUser) {
          return mockCurrentUser;
        }
        return null;
      });

      const { result } = renderHook(() => useAutoDetectFormFieldsEnabled());
      expect(result.current.canUseAutoDetectFormFields).toBe(false);
    });

    it('should return false when loaded is false', () => {
      (useDocumentViewerLoaded as jest.Mock).mockReturnValue({ loaded: false });

      const { result } = renderHook(() => useAutoDetectFormFieldsEnabled());
      expect(result.current.canUseAutoDetectFormFields).toBe(false);
    });

    it('should return false when canSync is false', () => {
      (useSyncDocumentChecker as jest.Mock).mockReturnValue({ canSync: false });

      const { result } = renderHook(() => useAutoDetectFormFieldsEnabled());
      expect(result.current.canUseAutoDetectFormFields).toBe(false);
    });
  });

  describe('shouldAutoDetectFormFields', () => {
    it('should return true when canUseAutoDetectFormFields is true, hasFormFieldsInDocument is false, and isTypeToolActive is true', () => {
      const { result } = renderHook(() => useAutoDetectFormFieldsEnabled());
      expect(result.current.shouldAutoDetectFormFields).toBe(true);
    });

    it('should return false when canUseAutoDetectFormFields is false', () => {
      (useEnableAutoDetect as jest.Mock).mockReturnValue({ enabled: false });

      const { result } = renderHook(() => useAutoDetectFormFieldsEnabled());
      expect(result.current.shouldAutoDetectFormFields).toBe(false);
    });

    it('should return false when hasFormFieldsInDocument is true', () => {
      (useCheckFormFieldsInDocument as jest.Mock).mockReturnValue({ hasFormFieldsInDocument: true });

      const { result } = renderHook(() => useAutoDetectFormFieldsEnabled());
      expect(result.current.shouldAutoDetectFormFields).toBe(false);
    });

    it('should return false when active tool is not FREETEXT', () => {
      (useSelector as jest.Mock).mockImplementation((selector) => {
        if (selector === selectors.isPreviewOriginalVersionMode) {
          return false;
        }
        if (selector === selectors.isOffline) {
          return false;
        }
        if (selector === selectors.getActiveToolName) {
          return TOOLS_NAME.HIGHLIGHT;
        }
        return null;
      });

      const { result } = renderHook(() => useAutoDetectFormFieldsEnabled());
      expect(result.current.shouldAutoDetectFormFields).toBe(false);
    });
  });

  describe('isViewerLoaded', () => {
    it('should return loaded value from useDocumentViewerLoaded', () => {
      (useDocumentViewerLoaded as jest.Mock).mockReturnValue({ loaded: true });
      const { result } = renderHook(() => useAutoDetectFormFieldsEnabled());
      expect(result.current.isViewerLoaded).toBe(true);
    });

    it('should return false when viewer is not loaded', () => {
      (useDocumentViewerLoaded as jest.Mock).mockReturnValue({ loaded: false });
      const { result } = renderHook(() => useAutoDetectFormFieldsEnabled());
      expect(result.current.isViewerLoaded).toBe(false);
    });
  });
});
