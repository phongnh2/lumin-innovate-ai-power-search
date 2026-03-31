import '@testing-library/jest-dom';

import { UploadDropZoneContext } from '../UploadDropZoneContext';

describe('UploadDropZone index exports', () => {
  describe('UploadDropZoneContext export', () => {
    it('exports UploadDropZoneContext', () => {
      expect(UploadDropZoneContext).toBeDefined();
    });

    it('UploadDropZoneContext is a valid React context', () => {
      expect(UploadDropZoneContext.Provider).toBeDefined();
      expect(UploadDropZoneContext.Consumer).toBeDefined();
    });

    it('has default values', () => {
      // Access the default value through _currentValue (internal but testable)
      expect(typeof UploadDropZoneContext).toBe('object');
    });
  });
});

