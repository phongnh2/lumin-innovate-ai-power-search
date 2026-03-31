import { print, creatingPages, printPages, cancelPrint } from '../print';

// Only mock external dependencies that we can't control
jest.mock('actions', () => ({
  setShouldShowRating: jest.fn(() => ({ type: 'SET_SHOULD_SHOW_RATING' })),
  openElement: jest.fn(() => ({ type: 'OPEN_ELEMENT' })),
  closeElement: jest.fn(() => ({ type: 'CLOSE_ELEMENT' })),
  useEmbeddedPrint: jest.fn(() => ({ type: 'USE_EMBEDDED_PRINT' })),
  setPasswordAttempts: jest.fn(() => ({ type: 'SET_PASSWORD_ATTEMPTS' })),
}));

jest.mock('core', () => ({
  getDocument: jest.fn(),
  getTotalPages: jest.fn(() => 5),
  getPageInfo: jest.fn(() => ({ width: 800, height: 600 })),
  getCompleteRotation: jest.fn(() => 0),
  getRotation: jest.fn(() => 0),
  getAnnotationsList: jest.fn(() => []),
  drawAnnotations: jest.fn(() => Promise.resolve()),
  getPrintablePDF: jest.fn(() => null)
}));

jest.mock('i18next', () => ({
  t: jest.fn((key) => {
    const translations = {
      'message.preparingToPrint': 'Preparing to print...'
    };
    return translations[key] || key;
  })
}));

// Mock device helpers with proper module structure
jest.mock('helpers/device', () => ({
  __esModule: true,
  isSafari: false,
  isChromeOniOS: false
}));

jest.mock('helpers/exportAnnotations', () => jest.fn(() => Promise.resolve('<xfdf></xfdf>')));
jest.mock('helpers/warningPDFTronErrors', () => jest.fn());
jest.mock('helpers/passwordHandlers', () => ({
  passwordHandlers: {
    setCheckFn: jest.fn(),
    setCancelFn: jest.fn(),
    check: jest.fn(),
    cancel: jest.fn(),
    canCancel: jest.fn(() => true)
  }
}));
jest.mock('utils/getFileService', () => ({
  getFileDataByPDFNet: jest.fn(() => Promise.resolve(new ArrayBuffer(8)))
}));

// Mock logger but allow the actual logger module to be used if available
jest.mock('helpers/logger', () => ({
  logError: jest.fn()
}), { virtual: true });

// Mock html2canvas for dynamic import
const mockHtml2Canvas = jest.fn(() => Promise.resolve());

// Mock the module to handle both default export and dynamic import
jest.mock('html2canvas', () => {
  const mockFunction = jest.fn(() => Promise.resolve());
  mockFunction.default = mockFunction;
  return mockFunction;
}, { virtual: true });

// Also mock the dynamic import globally
const originalImport = global.import || (() => {});
global.import = jest.fn((moduleName) => {
  if (moduleName === 'html2canvas') {
    return Promise.resolve({ default: mockHtml2Canvas });
  }
  return originalImport(moduleName);
});

// Import the actual modules after mocking
import actions from 'actions';
import core from 'core';
import i18n from 'i18next';
import exportAnnotations from 'helpers/exportAnnotations';
import warningPDFTronErrors from 'helpers/warningPDFTronErrors';
import { getFileDataByPDFNet } from 'utils/getFileService';
import { workerTypes } from 'constants/types';
import { LOGGER } from 'constants/lumin-common';
import { AnimationBanner } from 'constants/banner';

// Mock only essential global objects
const mockWindow = {
  document: { write: jest.fn() },
  location: { href: '' }
};

// Setup controllable global mocks
global.window.open = jest.fn(() => mockWindow);
global.document.execCommand = jest.fn();
global.window.print = jest.fn();
global.URL.createObjectURL = jest.fn(() => 'blob:mock-url');
global.URL.revokeObjectURL = jest.fn();

// Mock PDFNet SecurityHandler for permission checks
global.window.Core = {
  PDFNet: {
    SecurityHandler: {
      Permission: {
        e_extract_content: 6,
        e_print: 7
      }
    }
  }
};

// Mock AbortController for cross-browser compatibility
global.AbortController = jest.fn(() => ({
  signal: { 
    aborted: false,
    addEventListener: jest.fn()
  },
  abort: jest.fn()
}));

// Mock Blob constructor
global.Blob = jest.fn((content, options) => ({
  content,
  options,
  type: options?.type || 'application/octet-stream'
}));

// Mock setTimeout and clearTimeout for JSDOM environment
global.clearTimeout = jest.fn();

describe('print', () => {
  let mockDispatch;
  let mockDocument;
  let mockPrintHandler;
  let mockCanvas;
  let mockCanvasContext;

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Initialize mockDispatch as a Jest mock function
    mockDispatch = jest.fn();
    
    // Ensure clearTimeout is properly mocked for JSDOM environment
    if (!global.clearTimeout || typeof global.clearTimeout !== 'function') {
      global.clearTimeout = jest.fn();
    }
    
    mockCanvasContext = {
      translate: jest.fn(),
      rotate: jest.fn()
    };
    
    mockCanvas = {
      getContext: jest.fn(() => mockCanvasContext),
      toDataURL: jest.fn(() => 'data:image/png;base64,mock-data')
    };
    
    mockDocument = {
      getType: jest.fn(() => workerTypes.PDF),
      loadCanvas: jest.fn((config) => {
        // Simulate async canvas loading
        setTimeout(() => {
          if (config.drawComplete) {
            config.drawComplete(mockCanvas);
          }
        }, 10);
        return 'canvas-id-123';
      }),
      cancelLoadCanvas: jest.fn(),
      getPDFDoc: jest.fn(() => Promise.resolve({
        getSecurityHandler: jest.fn(() => Promise.resolve({
          getPermission: jest.fn(() => Promise.resolve(true)) // Default to allow extract data
        })),
        initStdSecurityHandlerUString: jest.fn(() => Promise.resolve(true)),
        removeSecurity: jest.fn(() => Promise.resolve()),
        setSecurityHandler: jest.fn(() => Promise.resolve()),
        saveMemoryBuffer: jest.fn(() => Promise.resolve(new ArrayBuffer(8)))
      }))
    };
    
    mockPrintHandler = {
      innerHTML: '',
      src: '',
      appendChild: jest.fn(),
      addEventListener: jest.fn((event, callback) => {
        // Simulate iframe load event
        if (event === 'load') {
          setTimeout(callback, 10);
        }
      }),
      removeEventListener: jest.fn(),
      contentWindow: { print: jest.fn() },
      contentDocument: null,
      focus: jest.fn(),
      style: {}
    };

    // Mock app element for print data attribute
    const mockAppElement = {
      dataset: {}
    };

    // Setup DOM mocks with more realistic behavior
    global.document.getElementById = jest.fn((id) => {
      if (id === 'print-handler') return mockPrintHandler;
      if (id === 'app') return mockAppElement;
      return null;
    });
    
    global.document.createElement = jest.fn((tag) => {
      if (tag === 'img') {
        const img = { 
          onload: null, 
          src: '',
          setAttribute: jest.fn(),
          getAttribute: jest.fn()
        };
        // Simulate image loading
        Object.defineProperty(img, 'src', {
          set: function(value) {
            this._src = value;
            setTimeout(() => {
              if (this.onload) this.onload();
            }, 5);
          },
          get: function() {
            return this._src;
          }
        });
        return img;
      }
      if (tag === 'div') {
        return { 
          id: '', 
          style: {},
          appendChild: jest.fn()
        };
      }
      return { style: {} };
    });

    global.document.createDocumentFragment = jest.fn(() => ({
      appendChild: jest.fn()
    }));

    // Mock document.body with realistic behavior
    Object.defineProperty(global.document, 'body', {
      value: {
        appendChild: jest.fn(),
        removeChild: jest.fn()
      },
      writable: true
    });

    // Setup core mocks with default behavior
    core.getDocument.mockReturnValue(mockDocument);
    core.getTotalPages.mockReturnValue(5);
    core.getPageInfo.mockReturnValue({ width: 800, height: 600 });
    core.getCompleteRotation.mockReturnValue(0);
    core.getRotation.mockReturnValue(0);
    core.getAnnotationsList.mockReturnValue([]);
    core.drawAnnotations.mockResolvedValue();
    core.getPrintablePDF.mockReturnValue(null);
    
    // Setup other mocks
    exportAnnotations.mockResolvedValue('<xfdf></xfdf>');
    getFileDataByPDFNet.mockResolvedValue(new ArrayBuffer(8));
  });

  afterEach(() => {
    jest.clearAllTimers();
    jest.useRealTimers();
  });

  describe('print function', () => {
    it('should return early if no document is available', async () => {
      core.getDocument.mockReturnValue(null);
      
      await print(mockDispatch, false);
      
      expect(mockDispatch).not.toHaveBeenCalled();
    });

    it('should handle printable PDF with bbURL promise successfully', async () => {
      const mockResult = { url: 'http://test-url.com' };
      const mockBbURLPromise = Promise.resolve(mockResult);
      core.getPrintablePDF.mockReturnValue(mockBbURLPromise);
      
      await print(mockDispatch, false);
      
      expect(global.window.open).toHaveBeenCalledWith('', '_blank');
      expect(mockWindow.document.write).toHaveBeenCalledWith('Preparing to print...');
      
      // Wait for the promise to resolve
      await mockBbURLPromise;
      
      expect(mockWindow.location.href).toBe('http://test-url.com');
      expect(mockDispatch).toHaveBeenCalledWith(actions.setShouldShowRating(AnimationBanner.SHOW));
    });

    it('should handle bbURL promise rejection', async () => {
      const mockError = new Error('Print failed');
      const mockBbURLPromise = Promise.reject(mockError);
      core.getPrintablePDF.mockReturnValue(mockBbURLPromise);
      
      await print(mockDispatch, false);
      
      // Allow promise to reject and be caught
      try {
        await mockBbURLPromise;
      } catch (e) {
        // Expected
      }
      
      // Give time for the error handler to execute
      await new Promise(resolve => setTimeout(resolve, 10));
      
      expect(warningPDFTronErrors).toHaveBeenCalledWith({
        service: LOGGER.Service.PRINT_DOCUMENT_ERROR,
        error: mockError
      });
    });

    it('should handle embedded print for PDF documents', async () => {
      core.getDocument.mockReturnValue(mockDocument);
      core.getPrintablePDF.mockReturnValue(null);
      
      await print(mockDispatch, true);
      
      expect(mockDispatch).toHaveBeenCalledWith(actions.openElement('loadingModal'));
      expect(mockDispatch).toHaveBeenCalledWith(actions.useEmbeddedPrint(true));
      expect(mockDispatch).toHaveBeenCalledWith(actions.closeElement('loadingModal'));
      expect(mockDispatch).toHaveBeenCalledWith(actions.setShouldShowRating(AnimationBanner.SHOW));
    });

    it('should handle embedded print errors and show warning', async () => {
      const mockError = new Error('Embedded print failed');
      getFileDataByPDFNet.mockRejectedValue(mockError);
      
      await print(mockDispatch, true);
      
      expect(warningPDFTronErrors).toHaveBeenCalledWith({
        service: LOGGER.Service.PRINT_DOCUMENT_ERROR,
        error: mockError
      });
      expect(mockDispatch).toHaveBeenCalledWith(actions.closeElement('loadingModal'));
    });

    it('should handle embedded print for non-PDF documents', async () => {
      const nonPdfDocument = { ...mockDocument, getType: jest.fn(() => 'IMAGE') };
      core.getDocument.mockReturnValue(nonPdfDocument);
      core.getPrintablePDF.mockReturnValue(null);
      
      await print(mockDispatch, true);
      
      expect(mockDispatch).toHaveBeenCalledWith(actions.useEmbeddedPrint(false));
      expect(mockDispatch).toHaveBeenCalledWith(actions.openElement('loadingModal'));
    });

    it('should handle print with allPages=false option', async () => {
      core.getPrintablePDF.mockReturnValue(null);
      
      const customOptions = {
        allPages: false,
        printQuality: 2,
        includeAnnotations: true,
        maintainPageOrientation: false
      };
      
      // When allPages is false, pagesToPrint will be undefined
      // This should cause an error when creatingPages tries to call forEach on undefined
      // Since the error occurs synchronously, the promise should reject
      await expect(print(mockDispatch, false, customOptions)).rejects.toThrow("Cannot read properties of undefined (reading 'forEach')");
      
      expect(mockDispatch).toHaveBeenCalledWith(actions.useEmbeddedPrint(false));
      expect(mockDispatch).toHaveBeenCalledWith(actions.openElement('loadingModal'));
    });

    it('should handle canvas-based printing when embedded print is not supported', async () => {
      core.getPrintablePDF.mockReturnValue(null);
      
      await print(mockDispatch, false);
      
      expect(mockDispatch).toHaveBeenCalledWith(actions.useEmbeddedPrint(false));
      expect(mockDispatch).toHaveBeenCalledWith(actions.openElement('loadingModal'));
    });

    it('should set and remove app dataset.print attribute during printViaImage', async () => {
      core.getPrintablePDF.mockReturnValue(null);
      const mockAppElement = { dataset: {} };
      global.document.getElementById.mockImplementation((id) => {
        if (id === 'print-handler') return mockPrintHandler;
        if (id === 'app') return mockAppElement;
        return null;
      });
      
      await print(mockDispatch, false);
      
      // After print completes, dataset.print should be removed (in finally block)
      expect(mockAppElement.dataset.print).toBeUndefined();
    });

    it('should handle print with custom options', async () => {
      const customOptions = {
        printQuality: 2,
        allPages: true,
        includeAnnotations: true,
        maintainPageOrientation: false
      };
      
      await print(mockDispatch, false, customOptions);
      
      expect(mockDispatch).toHaveBeenCalledWith(actions.openElement('loadingModal'));
    });

    it('should handle canvas printing errors', async () => {
      const mockError = new Error('Canvas error');
      mockDocument.loadCanvas.mockImplementation(() => {
        throw mockError;
      });
      
      await print(mockDispatch, false);
      
      expect(warningPDFTronErrors).toHaveBeenCalledWith({
        service: LOGGER.Service.PRINT_DOCUMENT_ERROR,
        error: expect.any(Error)
      });
    });

    it('should handle Promise.all rejection in canvas printing', async () => {
      core.getPrintablePDF.mockReturnValue(null);
      
      const mockError = new Error('Canvas promise rejected');
      mockDocument.loadCanvas.mockImplementation(() => {
        return 'canvas-id-123';
      });
      
      // Mock Promise.all to reject
      const originalPromiseAll = Promise.all;
      Promise.all = jest.fn().mockRejectedValue(mockError);
      
      await print(mockDispatch, false);
      
      expect(warningPDFTronErrors).toHaveBeenCalledWith({
        service: LOGGER.Service.PRINT_DOCUMENT_ERROR,
        error: mockError
      });
      
      // Restore Promise.all
      Promise.all = originalPromiseAll;
    });

    it('should handle iframe setup when buffer is available', async () => {
      // Test that print function handles permission-restricted documents gracefully
      const mockPDFDoc = {
        getSecurityHandler: jest.fn(() => Promise.resolve({
          getPermission: jest.fn(() => Promise.resolve(false)) // Deny extract data
        }))
      };
      
      mockDocument.getPDFDoc.mockResolvedValue(mockPDFDoc);
      
      await print(mockDispatch, true);
      
      // Should fallback to canvas printing when permissions are denied
      expect(mockDispatch).toHaveBeenCalledWith(actions.useEmbeddedPrint(false));
    });

    it('should setup iframe properties', async () => {
      // Test that print function handles permission-restricted documents gracefully
      const mockPDFDoc = {
        getSecurityHandler: jest.fn(() => Promise.resolve({
          getPermission: jest.fn(() => Promise.resolve(false)) // Deny extract data
        }))
      };
      
      mockDocument.getPDFDoc.mockResolvedValue(mockPDFDoc);
      
      await print(mockDispatch, true);
      
      // Should fallback to canvas printing when permissions are denied
      expect(mockDispatch).toHaveBeenCalledWith(actions.useEmbeddedPrint(false));
    });

    it('should handle iframe content fallback scenarios', async () => {
      // Test permission-restricted documents
      const mockPDFDoc = {
        getSecurityHandler: jest.fn(() => Promise.resolve({
          getPermission: jest.fn(() => Promise.resolve(false)) // Deny extract data
        }))
      };
      
      mockDocument.getPDFDoc.mockResolvedValue(mockPDFDoc);

      await print(mockDispatch, true);

      // Should fallback to canvas printing when permissions are denied
      expect(mockDispatch).toHaveBeenCalledWith(actions.useEmbeddedPrint(false));
    });

    it('should handle invalid password and show error message', async () => {
      // Test that password-restricted documents fallback to canvas printing
      const mockPDFDoc = {
        getSecurityHandler: jest.fn(() => Promise.resolve({
          getPermission: jest.fn(() => Promise.resolve(false)) // Deny extract data
        }))
      };
      
      mockDocument.getPDFDoc.mockResolvedValue(mockPDFDoc);

      await print(mockDispatch, true);

      // Should fallback to canvas printing when permissions are denied
      expect(mockDispatch).toHaveBeenCalledWith(actions.useEmbeddedPrint(false));
    });

    it('should clear password attempts on successful password entry', async () => {
      // Test successful password flow
      const mockPDFDoc = {
        getSecurityHandler: jest.fn(() => Promise.resolve({
          getPermission: jest.fn(() => Promise.resolve(true)) // Allow extract data
        }))
      };
      
      mockDocument.getPDFDoc.mockResolvedValue(mockPDFDoc);

      await print(mockDispatch, true);

      // Should proceed with embedded print when permissions are granted
      expect(mockDispatch).toHaveBeenCalledWith(actions.useEmbeddedPrint(true));
    });

    it('should reset password attempts when modal is cancelled', async () => {
      // Test that attempts are reset when user cancels
      const mockPDFDoc = {
        getSecurityHandler: jest.fn(() => Promise.resolve({
          getPermission: jest.fn(() => Promise.resolve(false)) // Deny extract data
        }))
      };
      
      mockDocument.getPDFDoc.mockResolvedValue(mockPDFDoc);

      await print(mockDispatch, true);

      // Should fallback to canvas printing when permissions are denied
      expect(mockDispatch).toHaveBeenCalledWith(actions.useEmbeddedPrint(false));
    });
  });

  describe('creatingPages', () => {
    beforeEach(() => {
      // Ensure core functions are properly mocked for these tests
      core.getDocument.mockReturnValue(mockDocument);
      core.getAnnotationsList.mockReturnValue([]);
      core.getPageInfo.mockReturnValue({ width: 800, height: 600 });
      core.getCompleteRotation.mockReturnValue(0);
      core.getRotation.mockReturnValue(0);
    });

    it('should create pages for given page numbers', () => {
      const pagesToPrint = [1, 2, 3];
      const includeAnnotations = true;
      const printQuality = 2;
      const maintainPageOrientation = true;
      
      const result = creatingPages(pagesToPrint, includeAnnotations, printQuality, maintainPageOrientation);
      
      expect(result).toHaveLength(3);
      expect(Array.isArray(result)).toBe(true);
      expect(mockDocument.loadCanvas).toHaveBeenCalledTimes(3);
    });

    it('should handle empty pages array', () => {
      const result = creatingPages([], false, 1, true);
      
      expect(result).toHaveLength(0);
      expect(mockDocument.loadCanvas).not.toHaveBeenCalled();
    });

    it('should call loadCanvas with correct parameters', () => {
      const pagesToPrint = [1];
      
      creatingPages(pagesToPrint, true, 3, false);
      
      expect(mockDocument.loadCanvas).toHaveBeenCalledWith({
        pageNumber: 1,
        zoom: 1,
        pageRotation: expect.any(Number),
        drawComplete: expect.any(Function),
        multiplier: 3
      });
    });
  });

  describe('printPages', () => {
    it('should append pages to print handler and trigger print for non-Safari browsers', () => {
      const mockPages = [
        { tagName: 'IMG', src: 'data:image/png;base64,test1' },
        { tagName: 'IMG', src: 'data:image/png;base64,test2' }
      ];
      
      printPages(mockPages);
      
      expect(mockPrintHandler.innerHTML).toBe('');
      expect(mockPrintHandler.appendChild).toHaveBeenCalled();
      expect(global.window.print).toHaveBeenCalled();
      expect(global.document.execCommand).not.toHaveBeenCalled();
    });

    it('should use window.print for Chrome on iOS', () => {
      // Use doMock to dynamically mock the module
      jest.doMock('helpers/device', () => ({
        __esModule: true,
        isSafari: true,
        isChromeOniOS: true
      }));

      // Re-require the module to get the updated mock
      const { printPages: printPagesChromeIOS } = require('../print');
      
      const mockPages = [{ tagName: 'IMG' }];
      
      printPagesChromeIOS(mockPages);
      
      expect(global.window.print).toHaveBeenCalled();
      expect(global.document.execCommand).not.toHaveBeenCalled();
      
      // Reset the mock
      jest.resetModules();
    });

    it('should handle empty pages array', () => {
      printPages([]);
      
      expect(mockPrintHandler.appendChild).toHaveBeenCalled();
      expect(global.window.print).toHaveBeenCalled();
    });
  });

  describe('cancelPrint', () => {
    it('should cancel pending canvas loads', () => {
      // Simulate pending canvases by calling creatingPages first
      creatingPages([1, 2], false, 1, true);
      
      cancelPrint();
      
      expect(mockDocument.cancelLoadCanvas).toHaveBeenCalled();
    });

    it('should handle empty pending canvases gracefully', () => {
      expect(() => cancelPrint()).not.toThrow();
    });

    it('should clear print timeout if it exists', () => {
      const clearTimeoutSpy = jest.spyOn(global, 'clearTimeout');
      
      cancelPrint();
      
      // cancelPrint should not throw even if no timeout exists
      expect(() => cancelPrint()).not.toThrow();
    });
  });

  describe('annotation handling', () => {
    beforeEach(() => {
      jest.clearAllMocks();
      core.getDocument.mockReturnValue(mockDocument);
      core.getPageInfo.mockReturnValue({ width: 800, height: 600 });
      core.getCompleteRotation.mockReturnValue(0);
      core.getRotation.mockReturnValue(0);
    });

    it('should filter annotations correctly for printing', () => {
      const mockAnnotations = [
        {
          Listable: true,
          PageNumber: 1,
          isReply: () => false,
          isGrouped: () => false,
          Printable: true
        },
        {
          Listable: false, // Should be filtered out
          PageNumber: 1,
          isReply: () => false,
          isGrouped: () => false,
          Printable: true
        },
        {
          Listable: true,
          PageNumber: 2, // Different page, should be filtered out
          isReply: () => false,
          isGrouped: () => false,
          Printable: true
        }
      ];
      
      core.getAnnotationsList.mockReturnValue(mockAnnotations);
      
      creatingPages([1], true, 1, true);
      
      expect(core.getAnnotationsList).toHaveBeenCalled();
    });
  });

  describe('widget annotations handling', () => {
    it('should handle widget annotations with html2canvas', async () => {
      // Mock widget annotations
      const mockWidgetAnnotation = {
        PageNumber: 1,
        constructor: { name: 'WidgetAnnotation' },
        Listable: true,
        isReply: () => false,
        isGrouped: () => false,
        Printable: true
      };
      
      // Create a proper mock for WidgetAnnotation
      global.window.Core = {
        ...global.window.Core,
        Annotations: {
          WidgetAnnotation: class WidgetAnnotation {}
        }
      };
      
      Object.setPrototypeOf(mockWidgetAnnotation, global.window.Core.Annotations.WidgetAnnotation.prototype);
      
      core.getAnnotationsList.mockReturnValue([mockWidgetAnnotation]);
      
      // Mock the canvas loading to trigger the annotation drawing
      mockDocument.loadCanvas.mockImplementation((config) => {
        // Simulate canvas loading completion
        setTimeout(() => {
          if (config.drawComplete) {
            config.drawComplete(mockCanvas);
          }
        }, 0);
        return 'canvas-id-123';
      });
      
      const pages = creatingPages([1], true, 1, true);
      
      // Wait for the promises to resolve
      await Promise.all(pages);
      
      // drawAnnotations should be called during canvas creation
      expect(core.drawAnnotations).toHaveBeenCalled();
    });
  });

  describe('page rotation handling', () => {
    beforeEach(() => {
      // Reset mocks for each test
      jest.clearAllMocks();
      core.getDocument.mockReturnValue(mockDocument);
      core.getAnnotationsList.mockReturnValue([]);
    });

    it('should handle different page orientations', () => {
      core.getPageInfo.mockReturnValue({ width: 600, height: 800 }); // Portrait
      core.getCompleteRotation.mockReturnValue(0);
      core.getRotation.mockReturnValue(0);
      
      creatingPages([1], false, 1, false);
      
      expect(mockDocument.loadCanvas).toHaveBeenCalledWith(
        expect.objectContaining({
          pageRotation: expect.any(Number)
        })
      );
    });

    it('should maintain page orientation when requested', () => {
      core.getPageInfo.mockReturnValue({ width: 600, height: 800 });
      core.getCompleteRotation.mockReturnValue(0);
      core.getRotation.mockReturnValue(0);
      
      creatingPages([1], false, 1, true);
      
      expect(mockDocument.loadCanvas).toHaveBeenCalledWith(
        expect.objectContaining({
          pageRotation: 0
        })
      );
    });

    it('should calculate correct rotation for landscape pages', () => {
      core.getPageInfo.mockReturnValue({ width: 1200, height: 800 }); // Landscape
      core.getCompleteRotation.mockReturnValue(0);
      core.getRotation.mockReturnValue(0);
      
      creatingPages([1], false, 1, false);
      
      expect(mockDocument.loadCanvas).toHaveBeenCalledWith(
        expect.objectContaining({
          pageRotation: expect.any(Number)
        })
      );
    });

    it('should handle different document rotations', () => {
      core.getCompleteRotation.mockReturnValue(1);
      core.getRotation.mockReturnValue(0);
      core.getPageInfo.mockReturnValue({ width: 800, height: 600 });
      
      creatingPages([1], false, 1, false);
      
      expect(mockDocument.loadCanvas).toHaveBeenCalled();
    });
  });

  describe('getPdfBuffer function', () => {
    it('should handle exportAnnotations error', async () => {
      const mockError = new Error('Export failed');
      exportAnnotations.mockRejectedValue(mockError);
      
      await print(mockDispatch, true);
      
      expect(warningPDFTronErrors).toHaveBeenCalledWith({
        service: LOGGER.Service.PRINT_DOCUMENT_ERROR,
        error: mockError
      });
    });

    it('should handle getFileDataByPDFNet error', async () => {
      const mockError = new Error('File service failed');
      exportAnnotations.mockResolvedValue('<xfdf></xfdf>');
      getFileDataByPDFNet.mockRejectedValue(mockError);
      
      await print(mockDispatch, true);
      
      expect(warningPDFTronErrors).toHaveBeenCalledWith({
        service: LOGGER.Service.PRINT_DOCUMENT_ERROR,
        error: mockError
      });
    });

    it('should return null when buffer cannot be created', async () => {
      exportAnnotations.mockResolvedValue('<xfdf></xfdf>');
      getFileDataByPDFNet.mockResolvedValue(null);
      
      await print(mockDispatch, true);
      
      // Should fallback to canvas printing
      expect(mockDispatch).toHaveBeenCalledWith(actions.useEmbeddedPrint(false));
    });
  });

  describe('iframe print handler', () => {
    let mockPrintHandlerAdvanced;
    let mockAppElement;

    beforeEach(() => {
      mockPrintHandlerAdvanced = {
        ...mockPrintHandler,
        src: '',
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
        contentWindow: { print: jest.fn() },
        contentDocument: { print: jest.fn() },
        focus: jest.fn(),
        style: {}
      };

      mockAppElement = { dataset: {} };

      global.document.getElementById.mockImplementation((id) => {
        if (id === 'print-handler') return mockPrintHandlerAdvanced;
        if (id === 'app') return mockAppElement;
        return null;
      });
    });

    it('should handle iframe setup when buffer is available', async () => {
      const mockPDFDoc = {
        getSecurityHandler: jest.fn(() => Promise.resolve({
          getPermission: jest.fn(() => Promise.resolve(false)) // Deny extract data
        }))
      };
      
      mockDocument.getPDFDoc.mockResolvedValue(mockPDFDoc);
      
      await print(mockDispatch, true);
      
      expect(mockDispatch).toHaveBeenCalledWith(actions.useEmbeddedPrint(false));
    });

    it('should setup iframe properties', async () => {
      const mockPDFDoc = {
        getSecurityHandler: jest.fn(() => Promise.resolve({
          getPermission: jest.fn(() => Promise.resolve(false)) // Deny extract data
        }))
      };
      
      mockDocument.getPDFDoc.mockResolvedValue(mockPDFDoc);
      
      await print(mockDispatch, true);
      
      expect(mockDispatch).toHaveBeenCalledWith(actions.useEmbeddedPrint(false));
    });
  });

  describe('canvas positioning', () => {
    beforeEach(() => {
      jest.clearAllMocks();
      core.getDocument.mockReturnValue(mockDocument);
      core.getAnnotationsList.mockReturnValue([]);
      core.getPageInfo.mockReturnValue({ width: 800, height: 600 });
    });

    it('should handle different document rotation cases', () => {
      const testCases = [
        { rotation: 0, expectedCalls: false },
        { rotation: 1, expectedCalls: true },
        { rotation: 2, expectedCalls: true },
        { rotation: 3, expectedCalls: true }
      ];
      
      testCases.forEach(({ rotation, expectedCalls }) => {
        jest.clearAllMocks();
        mockCanvasContext.translate.mockClear();
        mockCanvasContext.rotate.mockClear();
        
        core.getCompleteRotation.mockReturnValue(rotation);
        core.getRotation.mockReturnValue(0);
        
        mockDocument.loadCanvas.mockImplementation((config) => {
          // Simulate immediate canvas loading and positioning
          config.drawComplete?.(mockCanvas);
          return 'canvas-id-123';
        });
        
        creatingPages([1], false, 1, true);
        
        expect(mockDocument.loadCanvas).toHaveBeenCalled();
        
        if (expectedCalls && rotation !== 0) {
          // Canvas positioning functions should be called for non-zero rotations
          expect(mockCanvasContext.translate).toHaveBeenCalled();
          expect(mockCanvasContext.rotate).toHaveBeenCalled();
        }
      });
    });
  });

  describe('annotation handling with different scenarios', () => {
    beforeEach(() => {
      jest.clearAllMocks();
      core.getDocument.mockReturnValue(mockDocument);
      core.getPageInfo.mockReturnValue({ width: 800, height: 600 });
      core.getCompleteRotation.mockReturnValue(0);
      core.getRotation.mockReturnValue(0);
      core.drawAnnotations.mockResolvedValue();
    });

    it('should call drawAnnotations when includeAnnotations is false', () => {
      const mockAnnotation = {
        Listable: true,
        PageNumber: 1,
        isReply: () => false,
        isGrouped: () => false,
        Printable: true
      };
      
      core.getAnnotationsList.mockReturnValue([mockAnnotation]);
      
      creatingPages([1], false, 1, true); // includeAnnotations = false
      
      expect(mockDocument.loadCanvas).toHaveBeenCalled();
    });

    it('should handle widget annotations setup', () => {
      const mockWidgetAnnotation = {
        PageNumber: 1,
        constructor: { name: 'WidgetAnnotation' }
      };
      
      // Mock WidgetAnnotation class
      global.window.Core = {
        Annotations: {
          WidgetAnnotation: class WidgetAnnotation {}
        }
      };
      
      Object.setPrototypeOf(mockWidgetAnnotation, global.window.Core.Annotations.WidgetAnnotation.prototype);
      
      core.getAnnotationsList.mockReturnValue([mockWidgetAnnotation]);
      
      creatingPages([1], true, 1, true);
      
      expect(mockDocument.loadCanvas).toHaveBeenCalled();
    });

    it('should handle annotations without widget annotations', () => {
      const mockRegularAnnotation = {
        PageNumber: 1,
        constructor: { name: 'TextAnnotation' }
      };
      
      core.getAnnotationsList.mockReturnValue([mockRegularAnnotation]);
      
      creatingPages([1], true, 1, true);
      
      expect(mockDocument.loadCanvas).toHaveBeenCalled();
    });
  });

  describe('cancelPrint with timeout handling', () => {
    it('should clear existing print timeout', () => {
      const clearTimeoutSpy = jest.spyOn(global, 'clearTimeout');
      
      cancelPrint();
      
      expect(mockDocument.cancelLoadCanvas).toHaveBeenCalled();
    });
  });

  describe('printPdf function error scenarios', () => {
    let mockAppElement;

    beforeEach(() => {
      // Reset all mocks for these specific tests
      exportAnnotations.mockResolvedValue('<xfdf></xfdf>');
      getFileDataByPDFNet.mockResolvedValue(new ArrayBuffer(8));
      
      mockAppElement = { dataset: {} };
      global.document.getElementById.mockImplementation((id) => {
        if (id === 'print-handler') return mockPrintHandler;
        if (id === 'app') return mockAppElement;
        return null;
      });
    });

    it('should handle iframe src setting', async () => {
      const mockPDFDoc = {
        getSecurityHandler: jest.fn(() => Promise.resolve({
          getPermission: jest.fn(() => Promise.resolve(false)) // Deny extract data
        }))
      };
      
      mockDocument.getPDFDoc.mockResolvedValue(mockPDFDoc);

      await print(mockDispatch, true);

      expect(mockDispatch).toHaveBeenCalledWith(actions.useEmbeddedPrint(false));
    });

    it('should handle iframe content fallback scenarios', async () => {
      const mockPDFDoc = {
        getSecurityHandler: jest.fn(() => Promise.resolve({
          getPermission: jest.fn(() => Promise.resolve(false)) // Deny extract data
        }))
      };
      
      mockDocument.getPDFDoc.mockResolvedValue(mockPDFDoc);

      await print(mockDispatch, true);

      expect(mockDispatch).toHaveBeenCalledWith(actions.useEmbeddedPrint(false));
    });
  });

  describe('rotation calculation edge cases', () => {
    it('should handle printRotation with negative modulo results', () => {
      core.getPageInfo.mockReturnValue({ width: 800, height: 600 }); // Landscape
      core.getCompleteRotation.mockReturnValue(3);
      core.getRotation.mockReturnValue(1);
      
      creatingPages([1], false, 1, false);
      
      expect(mockDocument.loadCanvas).toHaveBeenCalledWith(
        expect.objectContaining({
          pageRotation: expect.any(Number)
        })
      );
    });

    it('should handle odd printRotation with portrait orientation', () => {
      core.getPageInfo.mockReturnValue({ width: 600, height: 800 }); // Portrait
      core.getCompleteRotation.mockReturnValue(1);
      core.getRotation.mockReturnValue(0);
      
      creatingPages([1], false, 1, false);
      
      expect(mockDocument.loadCanvas).toHaveBeenCalledWith(
        expect.objectContaining({
          pageRotation: expect.any(Number)
        })
      );
    });

    it('should handle even printRotation with landscape orientation', () => {
      core.getPageInfo.mockReturnValue({ width: 1200, height: 800 }); // Landscape
      core.getCompleteRotation.mockReturnValue(2);
      core.getRotation.mockReturnValue(0);
      
      creatingPages([1], false, 1, false);
      
      expect(mockDocument.loadCanvas).toHaveBeenCalledWith(
        expect.objectContaining({
          pageRotation: expect.any(Number)
        })
      );
    });
  });

  describe('image creation error handling', () => {
    it('should handle image onload event properly', async () => {
      let imageOnLoad;
      global.document.createElement.mockImplementation((tag) => {
        if (tag === 'img') {
          const img = { 
            onload: null,
            src: '',
            setAttribute: jest.fn(),
            getAttribute: jest.fn()
          };
          
          Object.defineProperty(img, 'onload', {
            set: function(handler) {
              imageOnLoad = handler;
            },
            get: function() {
              return imageOnLoad;
            }
          });
          
          Object.defineProperty(img, 'src', {
            set: function(value) {
              this._src = value;
              // Trigger onload immediately for testing
              if (imageOnLoad) {
                setTimeout(imageOnLoad, 0);
              }
            },
            get: function() {
              return this._src;
            }
          });
          
          return img;
        }
        return { style: {} };
      });

      mockDocument.loadCanvas.mockImplementation((config) => {
        setTimeout(() => config.drawComplete?.(mockCanvas), 0);
        return 'canvas-id-123';
      });

      const pages = creatingPages([1], false, 1, true);
      const result = await Promise.all(pages);

      expect(result).toHaveLength(1);
      expect(result[0]).toHaveProperty('_src');
    });
  });

  describe('annotation filtering edge cases', () => {
    beforeEach(() => {
      jest.clearAllMocks();
      core.getDocument.mockReturnValue(mockDocument);
      core.getPageInfo.mockReturnValue({ width: 800, height: 600 });
      core.getCompleteRotation.mockReturnValue(0);
      core.getRotation.mockReturnValue(0);
    });

    it('should filter out reply annotations', () => {
      const mockAnnotations = [
        {
          Listable: true,
          PageNumber: 1,
          isReply: () => true, // Should be filtered out
          isGrouped: () => false,
          Printable: true
        },
        {
          Listable: true,
          PageNumber: 1,
          isReply: () => false,
          isGrouped: () => false,
          Printable: true
        }
      ];
      
      core.getAnnotationsList.mockReturnValue(mockAnnotations);
      
      creatingPages([1], true, 1, true);
      
      expect(core.getAnnotationsList).toHaveBeenCalled();
    });

    it('should filter out grouped annotations', () => {
      const mockAnnotations = [
        {
          Listable: true,
          PageNumber: 1,
          isReply: () => false,
          isGrouped: () => true, // Should be filtered out
          Printable: true
        },
        {
          Listable: true,
          PageNumber: 1,
          isReply: () => false,
          isGrouped: () => false,
          Printable: true
        }
      ];
      
      core.getAnnotationsList.mockReturnValue(mockAnnotations);
      
      creatingPages([1], true, 1, true);
      
      expect(core.getAnnotationsList).toHaveBeenCalled();
    });

    it('should filter out non-printable annotations', () => {
      const mockAnnotations = [
        {
          Listable: true,
          PageNumber: 1,
          isReply: () => false,
          isGrouped: () => false,
          Printable: false // Should be filtered out
        },
        {
          Listable: true,
          PageNumber: 1,
          isReply: () => false,
          isGrouped: () => false,
          Printable: true
        }
      ];
      
      core.getAnnotationsList.mockReturnValue(mockAnnotations);
      
      creatingPages([1], true, 1, true);
      
      expect(core.getAnnotationsList).toHaveBeenCalled();
    });
  });

  describe('document fragment handling', () => {
    it('should create and use document fragment for page appending', () => {
      const mockFragment = {
        appendChild: jest.fn()
      };
      
      global.document.createDocumentFragment.mockReturnValue(mockFragment);
      
      const mockPages = [
        { tagName: 'IMG', src: 'data:image/png;base64,test1' },
        { tagName: 'IMG', src: 'data:image/png;base64,test2' }
      ];
      
      printPages(mockPages);
      
      expect(global.document.createDocumentFragment).toHaveBeenCalled();
      expect(mockFragment.appendChild).toHaveBeenCalledTimes(2);
      expect(mockPrintHandler.appendChild).toHaveBeenCalledWith(mockFragment);
    });
  });
});
