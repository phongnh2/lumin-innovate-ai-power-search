import importFieldData from '../importFieldData';
import core from 'core';
import importFieldValue from 'features/DocumentFormBuild/importFieldValue';
import { IFormField } from 'interfaces/document/document.interface';

jest.mock('core');
jest.mock('features/DocumentFormBuild/importFieldValue');

describe('importFieldData', () => {
  let mockAnnotationManager: any;
  let mockFieldManager: any;
  let mockField: any;
  let mockAnnotation: any;

  beforeEach(() => {
    mockField = {
      widgets: [],
      set: jest.fn(),
    };

    mockFieldManager = {
      getField: jest.fn().mockReturnValue(mockField),
    };

    mockAnnotationManager = {
      getFieldManager: jest.fn().mockReturnValue(mockFieldManager),
      getAnnotationsList: jest.fn().mockReturnValue([]), // Will be updated later
      trigger: jest.fn(),
    };

    (core.getAnnotationManager as jest.Mock).mockReturnValue(mockAnnotationManager);
    (importFieldValue as jest.Mock).mockResolvedValue(undefined);

    // Define the WidgetAnnotation class for instanceof checks
    const MockWidgetAnnotation = class {
      fieldName: string;
      constructor() {
        this.fieldName = 'testField';
      }
    };

    Object.defineProperty(window, 'Core', {
      value: {
        Annotations: {
          WidgetAnnotation: MockWidgetAnnotation,
        },
      },
      writable: true,
    });

    // Update mockAnnotation to be an instance of the MockWidgetAnnotation
    mockAnnotation = new MockWidgetAnnotation();
    mockAnnotationManager.getAnnotationsList.mockReturnValue([mockAnnotation]);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('when field is deleted', () => {
    it('should return early without processing', async () => {
      const newField: IFormField = {
        name: 'testField',
        value: 'testValue',
        xfdf: '',
        isDeleted: true,
        isInternal: false,
      };

      await importFieldData(newField);

      expect(core.getAnnotationManager).not.toHaveBeenCalled();
      expect(importFieldValue).not.toHaveBeenCalled();
    });
  });

  describe('when field is not deleted', () => {
    it('should process field data without xfdf', async () => {
      const newField: IFormField = {
        name: 'testField',
        value: 'testValue',
        xfdf: '',
        isDeleted: false,
        isInternal: false,
      };

      await importFieldData(newField);

      expect(core.getAnnotationManager).toHaveBeenCalled();
      expect(mockAnnotationManager.getFieldManager).toHaveBeenCalled();
      expect(importFieldValue).toHaveBeenCalledWith('testField', 'testValue');
      expect(mockFieldManager.getField).not.toHaveBeenCalled();
    });

    it('should process field data with xfdf and ensure widgets', async () => {
      const newField: IFormField = {
        name: 'testField',
        value: 'testValue',
        xfdf: '<xfdf>test</xfdf>',
        isDeleted: false,
        isInternal: false,
      };

      await importFieldData(newField);

      expect(core.getAnnotationManager).toHaveBeenCalled();
      expect(mockAnnotationManager.getFieldManager).toHaveBeenCalled();
      expect(mockFieldManager.getField).toHaveBeenCalledWith('testField');
      expect(mockField.set).toHaveBeenCalledWith({ widgets: [mockAnnotation] });
      expect(importFieldValue).toHaveBeenCalledWith('testField', 'testValue');
    });

    it('should trigger fieldChanged event when triggerFieldChanged is true', async () => {
      const newField: IFormField = {
        name: 'testField',
        value: 'testValue',
        xfdf: '',
        isDeleted: false,
        isInternal: false,
      };

      await importFieldData(newField, true);

      expect(mockFieldManager.getField).toHaveBeenCalledWith('testField');
      expect(mockAnnotationManager.trigger).toHaveBeenCalledWith('fieldChanged', [mockField, 'testValue']);
    });

    it('should not trigger fieldChanged event when triggerFieldChanged is false', async () => {
      const newField: IFormField = {
        name: 'testField',
        value: 'testValue',
        xfdf: '',
        isDeleted: false,
        isInternal: false,
      };

      await importFieldData(newField, false);

      expect(mockAnnotationManager.trigger).not.toHaveBeenCalled();
    });

    it('should not trigger fieldChanged event when field is not found', async () => {
      const newField: IFormField = {
        name: 'testField',
        value: 'testValue',
        xfdf: '',
        isDeleted: false,
        isInternal: false,
      };

      mockFieldManager.getField.mockReturnValue(null);

      await importFieldData(newField, true);

      expect(mockAnnotationManager.trigger).not.toHaveBeenCalled();
    });
  });

  describe('ensureFieldWidgets functionality', () => {
    it('should not modify field when widgets already exist', async () => {
      const newField: IFormField = {
        name: 'testField',
        value: 'testValue',
        xfdf: '<xfdf>test</xfdf>',
        isDeleted: false,
        isInternal: false,
      };

      mockField.widgets = [{ id: 'existing-widget' }];

      await importFieldData(newField);

      expect(mockField.set).not.toHaveBeenCalled();
    });

    it('should filter and add only matching widget annotations', async () => {
      const newField: IFormField = {
        name: 'testField',
        value: 'testValue',
        xfdf: '<xfdf>test</xfdf>',
        isDeleted: false,
        isInternal: false,
      };

      const matchingWidget = new window.Core.Annotations.WidgetAnnotation();
      matchingWidget.fieldName = 'testField';

      const nonMatchingWidget = new window.Core.Annotations.WidgetAnnotation();
      nonMatchingWidget.fieldName = 'otherField';

      const nonWidgetAnnotation = { fieldName: 'testField' };

      mockAnnotationManager.getAnnotationsList.mockReturnValue([
        matchingWidget,
        nonMatchingWidget,
        nonWidgetAnnotation,
      ]);

      await importFieldData(newField);

      expect(mockField.set).toHaveBeenCalledWith({ widgets: [matchingWidget] });
    });
  });

  describe('error handling', () => {
    it('should handle importFieldValue rejection', async () => {
      const newField: IFormField = {
        name: 'testField',
        value: 'testValue',
        xfdf: '',
        isDeleted: false,
        isInternal: false,
      };

      const error = new Error('Import failed');
      (importFieldValue as jest.Mock).mockRejectedValue(error);

      await expect(importFieldData(newField)).rejects.toThrow('Import failed');
    });
  });

  describe('with various field values', () => {
    it('should handle string values', async () => {
      const newField: IFormField = {
        name: 'textField',
        value: 'string value',
        xfdf: '',
        isDeleted: false,
        isInternal: false,
      };

      await importFieldData(newField);

      expect(importFieldValue).toHaveBeenCalledWith('textField', 'string value');
    });

    it('should handle boolean values', async () => {
      const newField: IFormField = {
        name: 'checkboxField',
        value: 'true',
        xfdf: '',
        isDeleted: false,
        isInternal: false,
      };

      await importFieldData(newField);

      expect(importFieldValue).toHaveBeenCalledWith('checkboxField', 'true');
    });

    it('should handle empty values', async () => {
      const newField: IFormField = {
        name: 'emptyField',
        value: '',
        xfdf: '',
        isDeleted: false,
        isInternal: false,
      };

      await importFieldData(newField);

      expect(importFieldValue).toHaveBeenCalledWith('emptyField', '');
    });
  });
});
