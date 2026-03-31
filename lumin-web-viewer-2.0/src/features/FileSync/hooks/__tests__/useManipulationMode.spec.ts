import { renderHook } from '@testing-library/react';
import '@testing-library/jest-dom';
import { useManipulationMode } from '../useManipulationMode';
import { useFileHasChanged } from '../useFileHasChanged';

jest.mock('../useFileHasChanged');

describe('useManipulationMode', () => {
  const mockUseFileHasChanged = useFileHasChanged as jest.MockedFunction<
    typeof useFileHasChanged
  >;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('when shouldListenChangedFile is true', () => {
    it('should call useFileHasChanged with enabled: true', () => {
      mockUseFileHasChanged.mockReturnValue({
        fileHasChanged: false,
        setFileHasChanged: jest.fn(),
      });

      renderHook(() =>
        useManipulationMode({ shouldListenChangedFile: true })
      );

      expect(mockUseFileHasChanged).toHaveBeenCalledWith({
        enabled: true,
      });
      expect(mockUseFileHasChanged).toHaveBeenCalledTimes(1);
    });

    it('should return fileContentChanged as false when fileHasChanged is false', () => {
      mockUseFileHasChanged.mockReturnValue({
        fileHasChanged: false,
        setFileHasChanged: jest.fn(),
      });

      const { result } = renderHook(() =>
        useManipulationMode({ shouldListenChangedFile: true })
      );

      expect(result.current.fileContentChanged).toBe(false);
    });

    it('should return fileContentChanged as true when fileHasChanged is true', () => {
      mockUseFileHasChanged.mockReturnValue({
        fileHasChanged: true,
        setFileHasChanged: jest.fn(),
      });

      const { result } = renderHook(() =>
        useManipulationMode({ shouldListenChangedFile: true })
      );

      expect(result.current.fileContentChanged).toBe(true);
    });
  });

  describe('when shouldListenChangedFile is false', () => {
    it('should call useFileHasChanged with enabled: false', () => {
      mockUseFileHasChanged.mockReturnValue({
        fileHasChanged: false,
        setFileHasChanged: jest.fn(),
      });

      renderHook(() =>
        useManipulationMode({ shouldListenChangedFile: false })
      );

      expect(mockUseFileHasChanged).toHaveBeenCalledWith({
        enabled: false,
      });
      expect(mockUseFileHasChanged).toHaveBeenCalledTimes(1);
    });

    it('should return fileContentChanged as false when fileHasChanged is false', () => {
      mockUseFileHasChanged.mockReturnValue({
        fileHasChanged: false,
        setFileHasChanged: jest.fn(),
      });

      const { result } = renderHook(() =>
        useManipulationMode({ shouldListenChangedFile: false })
      );

      expect(result.current.fileContentChanged).toBe(false);
    });

    it('should return fileContentChanged as true when fileHasChanged is true', () => {
      mockUseFileHasChanged.mockReturnValue({
        fileHasChanged: true,
        setFileHasChanged: jest.fn(),
      });

      const { result } = renderHook(() =>
        useManipulationMode({ shouldListenChangedFile: false })
      );

      expect(result.current.fileContentChanged).toBe(true);
    });
  });

  describe('when shouldListenChangedFile changes', () => {
    it('should update the enabled prop when shouldListenChangedFile changes from false to true', () => {
      mockUseFileHasChanged.mockReturnValue({
        fileHasChanged: false,
        setFileHasChanged: jest.fn(),
      });

      const { rerender } = renderHook(
        ({ shouldListenChangedFile }) =>
          useManipulationMode({ shouldListenChangedFile }),
        {
          initialProps: { shouldListenChangedFile: false },
        }
      );

      expect(mockUseFileHasChanged).toHaveBeenCalledWith({
        enabled: false,
      });

      rerender({ shouldListenChangedFile: true });

      expect(mockUseFileHasChanged).toHaveBeenCalledWith({
        enabled: true,
      });
    });

    it('should update the enabled prop when shouldListenChangedFile changes from true to false', () => {
      mockUseFileHasChanged.mockReturnValue({
        fileHasChanged: false,
        setFileHasChanged: jest.fn(),
      });

      const { rerender } = renderHook(
        ({ shouldListenChangedFile }) =>
          useManipulationMode({ shouldListenChangedFile }),
        {
          initialProps: { shouldListenChangedFile: true },
        }
      );

      expect(mockUseFileHasChanged).toHaveBeenCalledWith({
        enabled: true,
      });

      rerender({ shouldListenChangedFile: false });

      expect(mockUseFileHasChanged).toHaveBeenCalledWith({
        enabled: false,
      });
    });
  });

  describe('return value mapping', () => {
    it('should correctly map fileHasChanged to fileContentChanged', () => {
      const mockSetFileHasChanged = jest.fn();
      mockUseFileHasChanged.mockReturnValue({
        fileHasChanged: true,
        setFileHasChanged: mockSetFileHasChanged,
      });

      const { result } = renderHook(() =>
        useManipulationMode({ shouldListenChangedFile: true })
      );

      expect(result.current).toEqual({
        fileContentChanged: true,
      });
      expect(result.current.fileContentChanged).toBe(true);
    });

    it('should return only fileContentChanged property', () => {
      const mockSetFileHasChanged = jest.fn();
      mockUseFileHasChanged.mockReturnValue({
        fileHasChanged: false,
        setFileHasChanged: mockSetFileHasChanged,
      });

      const { result } = renderHook(() =>
        useManipulationMode({ shouldListenChangedFile: true })
      );

      expect(Object.keys(result.current)).toEqual(['fileContentChanged']);
      expect(result.current).not.toHaveProperty('setFileHasChanged');
    });
  });
});

