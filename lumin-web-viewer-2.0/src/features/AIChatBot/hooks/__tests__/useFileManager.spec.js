import React from 'react';
import { renderHook, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import { useFileManager } from '../useFileManager';

describe('useFileManager', () => {
  const mockFile1 = new File(['content1'], 'test1.txt', { type: 'text/plain' });
  const mockFile2 = new File(['content2'], 'test2.txt', { type: 'text/plain' });
  const mockFile3 = new File(['content3'], 'test3.txt', { type: 'text/plain' });
  
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('when initializing', () => {
    it('should initialize with empty selectedFiles array', () => {
      const { result } = renderHook(() => useFileManager());
      
      expect(result.current.selectedFiles).toEqual([]);
    });

    it('should provide all required methods', () => {
      const { result } = renderHook(() => useFileManager());
      
      expect(result.current.handleAddFiles).toBeDefined();
      expect(result.current.handleRemoveFile).toBeDefined();
      expect(result.current.resetFiles).toBeDefined();
      expect(typeof result.current.handleAddFiles).toBe('function');
      expect(typeof result.current.handleRemoveFile).toBe('function');
      expect(typeof result.current.resetFiles).toBe('function');
    });
  });

  describe('when adding files', () => {
    it('should add single file to selectedFiles', () => {
      const { result } = renderHook(() => useFileManager());
      
      act(() => {
        result.current.handleAddFiles([mockFile1]);
      });
      
      expect(result.current.selectedFiles).toHaveLength(1);
      expect(result.current.selectedFiles[0]).toBe(mockFile1);
    });

    it('should add multiple files to selectedFiles', () => {
      const { result } = renderHook(() => useFileManager());
      
      act(() => {
        result.current.handleAddFiles([mockFile1, mockFile2]);
      });
      
      expect(result.current.selectedFiles).toHaveLength(2);
      expect(result.current.selectedFiles).toContain(mockFile1);
      expect(result.current.selectedFiles).toContain(mockFile2);
    });

    it('should append files to existing selectedFiles', () => {
      const { result } = renderHook(() => useFileManager());
      
      act(() => {
        result.current.handleAddFiles([mockFile1]);
      });
      
      act(() => {
        result.current.handleAddFiles([mockFile2]);
      });
      
      expect(result.current.selectedFiles).toHaveLength(2);
      expect(result.current.selectedFiles).toContain(mockFile1);
      expect(result.current.selectedFiles).toContain(mockFile2);
    });

    it('should call onAddFile callback when provided', () => {
      const mockOnAddFile = jest.fn();
      const { result } = renderHook(() => useFileManager(mockOnAddFile));
      
      act(() => {
        result.current.handleAddFiles([mockFile1]);
      });
      
      expect(mockOnAddFile).toHaveBeenCalledTimes(1);
      expect(mockOnAddFile).toHaveBeenCalledWith([mockFile1]);
    });

    it('should not throw error when onAddFile is not provided', () => {
      const { result } = renderHook(() => useFileManager());
      
      expect(() => {
        act(() => {
          result.current.handleAddFiles([mockFile1]);
        });
      }).not.toThrow();
    });

    it('should handle empty file array', () => {
      const mockOnAddFile = jest.fn();
      const { result } = renderHook(() => useFileManager(mockOnAddFile));
      
      act(() => {
        result.current.handleAddFiles([]);
      });
      
      expect(result.current.selectedFiles).toHaveLength(0);
      expect(mockOnAddFile).toHaveBeenCalledWith([]);
    });
  });

  describe('when removing files', () => {
    it('should remove file by name', () => {
      const { result } = renderHook(() => useFileManager());
      
      act(() => {
        result.current.handleAddFiles([mockFile1, mockFile2]);
      });
      
      act(() => {
        result.current.handleRemoveFile('test1.txt');
      });
      
      expect(result.current.selectedFiles).toHaveLength(1);
      expect(result.current.selectedFiles[0]).toBe(mockFile2);
    });

    it('should not remove files when name does not match', () => {
      const { result } = renderHook(() => useFileManager());
      
      act(() => {
        result.current.handleAddFiles([mockFile1, mockFile2]);
      });
      
      act(() => {
        result.current.handleRemoveFile('nonexistent.txt');
      });
      
      expect(result.current.selectedFiles).toHaveLength(2);
      expect(result.current.selectedFiles).toContain(mockFile1);
      expect(result.current.selectedFiles).toContain(mockFile2);
    });

    it('should handle removing from empty array', () => {
      const { result } = renderHook(() => useFileManager());
      
      act(() => {
        result.current.handleRemoveFile('test1.txt');
      });
      
      expect(result.current.selectedFiles).toHaveLength(0);
    });

    it('should remove all files with same name', () => {
      const duplicateFile = new File(['content'], 'test1.txt', { type: 'text/plain' });
      const { result } = renderHook(() => useFileManager());
      
      act(() => {
        result.current.handleAddFiles([mockFile1, duplicateFile, mockFile2]);
      });
      
      act(() => {
        result.current.handleRemoveFile('test1.txt');
      });
      
      expect(result.current.selectedFiles).toHaveLength(1);
      expect(result.current.selectedFiles[0]).toBe(mockFile2);
    });
  });

  describe('when resetting files', () => {
    it('should clear all selectedFiles', () => {
      const { result } = renderHook(() => useFileManager());
      
      act(() => {
        result.current.handleAddFiles([mockFile1, mockFile2, mockFile3]);
      });
      
      expect(result.current.selectedFiles).toHaveLength(3);
      
      act(() => {
        result.current.resetFiles();
      });
      
      expect(result.current.selectedFiles).toHaveLength(0);
      expect(result.current.selectedFiles).toEqual([]);
    });

    it('should handle resetting when already empty', () => {
      const { result } = renderHook(() => useFileManager());
      
      act(() => {
        result.current.resetFiles();
      });
      
      expect(result.current.selectedFiles).toHaveLength(0);
    });
  });

  describe('when using with callback', () => {
    it('should call onAddFile callback with correct arguments for multiple operations', () => {
      const mockOnAddFile = jest.fn();
      const { result } = renderHook(() => useFileManager(mockOnAddFile));
      
      act(() => {
        result.current.handleAddFiles([mockFile1]);
      });
      
      act(() => {
        result.current.handleAddFiles([mockFile2, mockFile3]);
      });
      
      expect(mockOnAddFile).toHaveBeenCalledTimes(2);
      expect(mockOnAddFile).toHaveBeenNthCalledWith(1, [mockFile1]);
      expect(mockOnAddFile).toHaveBeenNthCalledWith(2, [mockFile2, mockFile3]);
    });

    it('should maintain state consistency across operations', () => {
      const mockOnAddFile = jest.fn();
      const { result } = renderHook(() => useFileManager(mockOnAddFile));
      
      act(() => {
        result.current.handleAddFiles([mockFile1, mockFile2]);
      });
      
      act(() => {
        result.current.handleRemoveFile('test1.txt');
      });
      
      act(() => {
        result.current.handleAddFiles([mockFile3]);
      });
      
      expect(result.current.selectedFiles).toHaveLength(2);
      expect(result.current.selectedFiles).toContain(mockFile2);
      expect(result.current.selectedFiles).toContain(mockFile3);
      expect(mockOnAddFile).toHaveBeenCalledTimes(2);
    });
  });
});
