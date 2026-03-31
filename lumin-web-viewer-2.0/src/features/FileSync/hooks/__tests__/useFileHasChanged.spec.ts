import { renderHook, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import { useFileHasChanged } from '../useFileHasChanged';
import { useDocumentViewerLoaded } from 'hooks/useDocumentViewerLoaded';
import { CUSTOM_EVENT } from 'constants/customEvent';

jest.mock('hooks/useDocumentViewerLoaded');

describe('useFileHasChanged', () => {
  const mockUseDocumentViewerLoaded = useDocumentViewerLoaded as jest.MockedFunction<
    typeof useDocumentViewerLoaded
  >;

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseDocumentViewerLoaded.mockReturnValue({ loaded: false });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('when initializing', () => {
    it('should initialize with fileHasChanged as false', () => {
      const { result } = renderHook(() => useFileHasChanged({ enabled: true }));

      expect(result.current.fileHasChanged).toBe(false);
      expect(result.current.setFileHasChanged).toBeDefined();
      expect(typeof result.current.setFileHasChanged).toBe('function');
    });

    it('should return setFileHasChanged function', () => {
      const { result } = renderHook(() => useFileHasChanged({ enabled: true }));

      act(() => {
        result.current.setFileHasChanged(true);
      });

      expect(result.current.fileHasChanged).toBe(true);
    });
  });

  describe('when enabled is true and documentViewerLoaded is true', () => {
    beforeEach(() => {
      mockUseDocumentViewerLoaded.mockReturnValue({ loaded: true });
    });

    it('should add MANIPULATION_CHANGED event listener to window', () => {
      const addEventListenerSpy = jest.spyOn(window, 'addEventListener');

      renderHook(() => useFileHasChanged({ enabled: true }));

      expect(addEventListenerSpy).toHaveBeenCalledWith(
        CUSTOM_EVENT.MANIPULATION_CHANGED,
        expect.any(Function)
      );

      addEventListenerSpy.mockRestore();
    });

    it('should set fileHasChanged to true when MANIPULATION_CHANGED event fires', () => {
      const { result } = renderHook(() => useFileHasChanged({ enabled: true }));

      expect(result.current.fileHasChanged).toBe(false);

      act(() => {
        window.dispatchEvent(new CustomEvent(CUSTOM_EVENT.MANIPULATION_CHANGED));
      });

      expect(result.current.fileHasChanged).toBe(true);
    });

    it('should remove MANIPULATION_CHANGED event listener on cleanup', () => {
      const removeEventListenerSpy = jest.spyOn(window, 'removeEventListener');

      const { unmount } = renderHook(() => useFileHasChanged({ enabled: true }));

      unmount();

      expect(removeEventListenerSpy).toHaveBeenCalledWith(
        CUSTOM_EVENT.MANIPULATION_CHANGED,
        expect.any(Function)
      );

      removeEventListenerSpy.mockRestore();
    });

    it('should clean up event listeners even when fileHasChanged is true', () => {
      const removeEventListenerSpy = jest.spyOn(window, 'removeEventListener');
      const { result, unmount } = renderHook(() =>
        useFileHasChanged({ enabled: true })
      );

      act(() => {
        window.dispatchEvent(new CustomEvent(CUSTOM_EVENT.MANIPULATION_CHANGED));
      });

      expect(result.current.fileHasChanged).toBe(true);

      unmount();

      expect(removeEventListenerSpy).toHaveBeenCalledWith(
        CUSTOM_EVENT.MANIPULATION_CHANGED,
        expect.any(Function)
      );

      removeEventListenerSpy.mockRestore();
    });
  });

  describe('when enabled is false', () => {
    beforeEach(() => {
      mockUseDocumentViewerLoaded.mockReturnValue({ loaded: true });
    });

    it('should not add MANIPULATION_CHANGED event listener to window', () => {
      const addEventListenerSpy = jest.spyOn(window, 'addEventListener');

      renderHook(() => useFileHasChanged({ enabled: false }));

      expect(addEventListenerSpy).not.toHaveBeenCalledWith(
        CUSTOM_EVENT.MANIPULATION_CHANGED,
        expect.any(Function)
      );

      addEventListenerSpy.mockRestore();
    });

    it('should not set fileHasChanged when MANIPULATION_CHANGED event fires', () => {
      const { result } = renderHook(() => useFileHasChanged({ enabled: false }));

      act(() => {
        window.dispatchEvent(new CustomEvent(CUSTOM_EVENT.MANIPULATION_CHANGED));
      });

      expect(result.current.fileHasChanged).toBe(false);
    });
  });

  describe('when documentViewerLoaded is false', () => {
    beforeEach(() => {
      mockUseDocumentViewerLoaded.mockReturnValue({ loaded: false });
    });

    it('should not add MANIPULATION_CHANGED event listener to window even if enabled is true', () => {
      const addEventListenerSpy = jest.spyOn(window, 'addEventListener');

      renderHook(() => useFileHasChanged({ enabled: true }));

      expect(addEventListenerSpy).not.toHaveBeenCalledWith(
        CUSTOM_EVENT.MANIPULATION_CHANGED,
        expect.any(Function)
      );

      addEventListenerSpy.mockRestore();
    });

    it('should add listener when documentViewerLoaded changes from false to true', () => {
      const addEventListenerSpy = jest.spyOn(window, 'addEventListener');
      mockUseDocumentViewerLoaded.mockReturnValue({ loaded: false });

      const { rerender } = renderHook(() => useFileHasChanged({ enabled: true }));

      expect(addEventListenerSpy).not.toHaveBeenCalledWith(
        CUSTOM_EVENT.MANIPULATION_CHANGED,
        expect.any(Function)
      );

      mockUseDocumentViewerLoaded.mockReturnValue({ loaded: true });
      rerender();

      expect(addEventListenerSpy).toHaveBeenCalledWith(
        CUSTOM_EVENT.MANIPULATION_CHANGED,
        expect.any(Function)
      );

      addEventListenerSpy.mockRestore();
    });
  });

  describe('START_SYNC_ON_CONTENT_CHANGE event handling', () => {
    it('should add START_SYNC_ON_CONTENT_CHANGE event listener to document', () => {
      const addEventListenerSpy = jest.spyOn(document, 'addEventListener');

      renderHook(() => useFileHasChanged({ enabled: true }));

      expect(addEventListenerSpy).toHaveBeenCalledWith(
        CUSTOM_EVENT.START_SYNC_ON_CONTENT_CHANGE,
        expect.any(Function)
      );

      addEventListenerSpy.mockRestore();
    });

    it('should set fileHasChanged to false when START_SYNC_ON_CONTENT_CHANGE event fires', () => {
      mockUseDocumentViewerLoaded.mockReturnValue({ loaded: true });
      const { result } = renderHook(() => useFileHasChanged({ enabled: true }));

      // First set fileHasChanged to true
      act(() => {
        window.dispatchEvent(new CustomEvent(CUSTOM_EVENT.MANIPULATION_CHANGED));
      });

      expect(result.current.fileHasChanged).toBe(true);

      // Then fire START_SYNC_ON_CONTENT_CHANGE event
      act(() => {
        document.dispatchEvent(
          new CustomEvent(CUSTOM_EVENT.START_SYNC_ON_CONTENT_CHANGE)
        );
      });

      expect(result.current.fileHasChanged).toBe(false);
    });

    it('should remove START_SYNC_ON_CONTENT_CHANGE event listener on cleanup', () => {
      const removeEventListenerSpy = jest.spyOn(document, 'removeEventListener');

      const { unmount } = renderHook(() => useFileHasChanged({ enabled: true }));

      unmount();

      expect(removeEventListenerSpy).toHaveBeenCalledWith(
        CUSTOM_EVENT.START_SYNC_ON_CONTENT_CHANGE,
        expect.any(Function)
      );

      removeEventListenerSpy.mockRestore();
    });
  });

  describe('when dependencies change', () => {
    it('should re-add listener when enabled changes from false to true', () => {
      mockUseDocumentViewerLoaded.mockReturnValue({ loaded: true });
      const addEventListenerSpy = jest.spyOn(window, 'addEventListener');

      const { rerender } = renderHook(
        ({ enabled }) => useFileHasChanged({ enabled }),
        {
          initialProps: { enabled: false },
        }
      );

      expect(addEventListenerSpy).not.toHaveBeenCalledWith(
        CUSTOM_EVENT.MANIPULATION_CHANGED,
        expect.any(Function)
      );

      rerender({ enabled: true });

      expect(addEventListenerSpy).toHaveBeenCalledWith(
        CUSTOM_EVENT.MANIPULATION_CHANGED,
        expect.any(Function)
      );

      addEventListenerSpy.mockRestore();
    });

    it('should remove listener when enabled changes from true to false', () => {
      mockUseDocumentViewerLoaded.mockReturnValue({ loaded: true });
      const removeEventListenerSpy = jest.spyOn(window, 'removeEventListener');

      const { rerender } = renderHook(
        ({ enabled }) => useFileHasChanged({ enabled }),
        {
          initialProps: { enabled: true },
        }
      );

      rerender({ enabled: false });

      expect(removeEventListenerSpy).toHaveBeenCalledWith(
        CUSTOM_EVENT.MANIPULATION_CHANGED,
        expect.any(Function)
      );

      removeEventListenerSpy.mockRestore();
    });

    it('should handle multiple event fires correctly', () => {
      mockUseDocumentViewerLoaded.mockReturnValue({ loaded: true });
      const { result } = renderHook(() => useFileHasChanged({ enabled: true }));

      act(() => {
        window.dispatchEvent(new CustomEvent(CUSTOM_EVENT.MANIPULATION_CHANGED));
      });

      expect(result.current.fileHasChanged).toBe(true);

      act(() => {
        document.dispatchEvent(
          new CustomEvent(CUSTOM_EVENT.START_SYNC_ON_CONTENT_CHANGE)
        );
      });

      expect(result.current.fileHasChanged).toBe(false);

      act(() => {
        window.dispatchEvent(new CustomEvent(CUSTOM_EVENT.MANIPULATION_CHANGED));
      });

      expect(result.current.fileHasChanged).toBe(true);
    });
  });
});

