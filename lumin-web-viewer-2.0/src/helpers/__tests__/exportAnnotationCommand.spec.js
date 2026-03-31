import exportAnnotationCommand from '../exportAnnotationCommand';
import { CUSTOM_DATA_WIDGET_ANNOTATION } from 'constants/customDataConstant';
import { ANNOTATION_ACTION } from 'constants/documentConstants';

// Mock the core module
jest.mock('core', () => {
  const mockAnnotationManager = {
    getAnnotationById: jest.fn()
  };
  
  return {
    getDocument: jest.fn().mockReturnValue({
      getPageMatrix: jest.fn().mockReturnValue({
        inverse: jest.fn().mockReturnValue('mockInverseMatrix')
      })
    }),
    getAnnotationManager: jest.fn().mockReturnValue(mockAnnotationManager)
  };
}, { virtual: true });

// Import the mocked core module
import core from 'core';

describe('exportAnnotationCommand', () => {
  // Setup for XML serialization mocking
  let mockSerializeToString;
  
  beforeEach(() => {
    // Mock XMLSerializer
    mockSerializeToString = jest.fn().mockReturnValue('<mock-serialized-annotation />');
    window.XMLSerializer = jest.fn().mockImplementation(() => ({
      serializeToString: mockSerializeToString
    }));
    
    // Mock document.createElementNS
    document.createElementNS = jest.fn().mockReturnValue('mockElement');
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('ADD action', () => {
    it('should generate correct XFDF for ADD action', () => {
      // Arrange
      const mockAnnotation = {
        elementName: 'testElement',
        PageNumber: 3,
        Id: 'anno123',
        serialize: jest.fn().mockReturnValue('serializedElement')
      };

      // Act
      const result = exportAnnotationCommand(mockAnnotation, ANNOTATION_ACTION.ADD);

      // Assert
      expect(document.createElementNS).toHaveBeenCalledWith("", mockAnnotation.elementName);
      expect(core.getDocument().getPageMatrix).toHaveBeenCalledWith(mockAnnotation.PageNumber);
      expect(mockAnnotation.serialize).toHaveBeenCalledWith('mockElement', 'mockInverseMatrix');
      expect(mockSerializeToString).toHaveBeenCalledWith('serializedElement');
      
      // Check XFDF structure
      expect(result).toContain('<?xml version="1.0" encoding="UTF-8" ?>');
      expect(result).toContain('<xfdf xmlns="http://ns.adobe.com/xfdf/" xml:space="preserve">');
      expect(result).toContain('<add><mock-serialized-annotation /></add>');
      expect(result).toContain('<modify />');
      expect(result).toContain('<delete />');
    });
  });

  describe('MODIFY action', () => {
    it('should generate correct XFDF for MODIFY action', () => {
      // Arrange
      const mockAnnotation = {
        elementName: 'testElement',
        PageNumber: 3,
        Id: 'anno123',
        serialize: jest.fn().mockReturnValue('serializedElement')
      };

      // Act
      const result = exportAnnotationCommand(mockAnnotation, ANNOTATION_ACTION.MODIFY);

      // Assert
      expect(document.createElementNS).toHaveBeenCalledWith("", mockAnnotation.elementName);
      expect(core.getDocument().getPageMatrix).toHaveBeenCalledWith(mockAnnotation.PageNumber);
      expect(mockAnnotation.serialize).toHaveBeenCalledWith('mockElement', 'mockInverseMatrix');
      expect(mockSerializeToString).toHaveBeenCalledWith('serializedElement');
      
      // Check XFDF structure
      expect(result).toContain('<?xml version="1.0" encoding="UTF-8" ?>');
      expect(result).toContain('<xfdf xmlns="http://ns.adobe.com/xfdf/" xml:space="preserve">');
      expect(result).toContain('<add />');
      expect(result).toContain('<modify><mock-serialized-annotation /></modify>');
      expect(result).toContain('<delete />');
    });
  });

  describe('DELETE action', () => {
    it('should generate correct XFDF for DELETE action without widget', () => {
      // Arrange
      const mockAnnotation = {
        PageNumber: 3,
        Id: 'anno123',
        getCustomData: jest.fn().mockReturnValue(null)
      };

      // Act
      const result = exportAnnotationCommand(mockAnnotation, ANNOTATION_ACTION.DELETE);

      // Assert
      expect(mockAnnotation.getCustomData).toHaveBeenCalledWith(CUSTOM_DATA_WIDGET_ANNOTATION.WIDGET_ID.key);
      expect(core.getAnnotationManager().getAnnotationById).not.toHaveBeenCalled();
      
      // Check XFDF structure
      expect(result).toContain('<?xml version="1.0" encoding="UTF-8" ?>');
      expect(result).toContain('<xfdf xmlns="http://ns.adobe.com/xfdf/" xml:space="preserve">');
      expect(result).toContain('<add />');
      expect(result).toContain('<modify />');
      expect(result).toContain(`<delete><id page="2">anno123</id>`);
      expect(result).not.toContain('pdftronSignatureFieldName');
    });

    it('should generate correct XFDF for DELETE action with widget', () => {
      // Arrange
      const widgetId = 'widget123';
      const mockAnnotation = {
        PageNumber: 3,
        Id: 'anno123',
        getCustomData: jest.fn().mockReturnValue(widgetId)
      };
      const mockWidget = {
        fieldName: 'signature1'
      };
      core.getAnnotationManager().getAnnotationById.mockReturnValue(mockWidget);

      // Act
      const result = exportAnnotationCommand(mockAnnotation, ANNOTATION_ACTION.DELETE);

      // Assert
      expect(mockAnnotation.getCustomData).toHaveBeenCalledWith(CUSTOM_DATA_WIDGET_ANNOTATION.WIDGET_ID.key);
      expect(core.getAnnotationManager().getAnnotationById).toHaveBeenCalledWith(widgetId);
      
      // Check XFDF structure
      expect(result).toContain('<?xml version="1.0" encoding="UTF-8" ?>');
      expect(result).toContain('<xfdf xmlns="http://ns.adobe.com/xfdf/" xml:space="preserve">');
      expect(result).toContain('<add />');
      expect(result).toContain('<modify />');
      expect(result).toContain(`<delete><id page="2" pdftronSignatureFieldName="signature1">anno123</id>`);
    });
  });

  describe('Error handling', () => {
    it('should throw error for invalid action', () => {
      // Arrange
      const mockAnnotation = {
        elementName: 'testElement',
        PageNumber: 3,
        Id: 'anno123'
      };

      // Act & Assert
      expect(() => {
        exportAnnotationCommand(mockAnnotation, 'INVALID_ACTION');
      }).toThrow();
    });
    
    it('should handle null annotation for non-DELETE action', () => {
      // Act
      const result = exportAnnotationCommand(null, ANNOTATION_ACTION.ADD);
      
      // Assert
      expect(result).toContain('<add></add>');
      expect(document.createElementNS).not.toHaveBeenCalled();
    });
  });
});
