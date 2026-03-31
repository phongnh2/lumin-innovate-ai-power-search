import core from 'core';

import { isValidDocumentSize, hasFormFields, hasFormFieldIndicator } from '../detectionValidator';
import { TOTAL_PAGES_LIMIT, FORM_FIELD_INDICATORS } from '../../constants/detectionField.constant';

jest.mock('core', () => ({
  __esModule: true,
  default: {
    getAnnotationsList: jest.fn(),
  },
}));

// Mock window.Core.Annotations.WidgetAnnotation
class MockWidgetAnnotation {}
class MockOtherAnnotation {}

beforeAll(() => {
  global.window = Object.create(window);
  global.window.Core = {
    Annotations: {
      WidgetAnnotation: MockWidgetAnnotation,
    },
  } as any;
});

describe('detectionValidator', () => {
  const mockGetAnnotationsList = core.getAnnotationsList as jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('isValidDocumentSize', () => {
    it('should return true when totalPages is less than limit', () => {
      expect(isValidDocumentSize(0)).toBe(true);
      expect(isValidDocumentSize(1)).toBe(true);
      expect(isValidDocumentSize(20)).toBe(true);
      expect(isValidDocumentSize(39)).toBe(true);
    });

    it('should return true when totalPages equals limit', () => {
      expect(isValidDocumentSize(TOTAL_PAGES_LIMIT)).toBe(true);
      expect(isValidDocumentSize(40)).toBe(true);
    });

    it('should return false when totalPages exceeds limit', () => {
      expect(isValidDocumentSize(41)).toBe(false);
      expect(isValidDocumentSize(50)).toBe(false);
      expect(isValidDocumentSize(100)).toBe(false);
      expect(isValidDocumentSize(Number.MAX_SAFE_INTEGER)).toBe(false);
    });

    it('should handle edge cases', () => {
      expect(isValidDocumentSize(-1)).toBe(true); // Negative numbers are less than 40
      expect(isValidDocumentSize(0.5)).toBe(true); // Decimal numbers
    });
  });

  describe('hasFormFields', () => {
    it('should return false when annotations list is empty', () => {
      mockGetAnnotationsList.mockReturnValue([]);

      const result = hasFormFields();

      expect(result).toBe(false);
      expect(mockGetAnnotationsList).toHaveBeenCalledTimes(1);
    });

    it('should return false when no annotations are WidgetAnnotation instances', () => {
      const mockAnnotation1 = {};
      const mockAnnotation2 = {};
      mockGetAnnotationsList.mockReturnValue([mockAnnotation1, mockAnnotation2]);

      const result = hasFormFields();

      expect(result).toBe(false);
      expect(mockGetAnnotationsList).toHaveBeenCalledTimes(1);
    });

    it('should return true when at least one annotation is a WidgetAnnotation instance', () => {
      const mockWidgetAnnotation = new MockWidgetAnnotation();
      const mockOtherAnnotation = {};
      mockGetAnnotationsList.mockReturnValue([mockOtherAnnotation, mockWidgetAnnotation]);

      const result = hasFormFields();

      expect(result).toBe(true);
      expect(mockGetAnnotationsList).toHaveBeenCalledTimes(1);
    });

    it('should return true when first annotation is a WidgetAnnotation instance', () => {
      const mockWidgetAnnotation = new MockWidgetAnnotation();
      mockGetAnnotationsList.mockReturnValue([mockWidgetAnnotation]);

      const result = hasFormFields();

      expect(result).toBe(true);
      expect(mockGetAnnotationsList).toHaveBeenCalledTimes(1);
    });

    it('should return true when all annotations are WidgetAnnotation instances', () => {
      const mockWidgetAnnotation1 = new MockWidgetAnnotation();
      const mockWidgetAnnotation2 = new MockWidgetAnnotation();
      mockGetAnnotationsList.mockReturnValue([mockWidgetAnnotation1, mockWidgetAnnotation2]);

      const result = hasFormFields();

      expect(result).toBe(true);
      expect(mockGetAnnotationsList).toHaveBeenCalledTimes(1);
    });

    it('should return true when WidgetAnnotation appears after other annotations', () => {
      const mockOtherAnnotation1 = {};
      const mockOtherAnnotation2 = {};
      const mockWidgetAnnotation = new MockWidgetAnnotation();
      mockGetAnnotationsList.mockReturnValue([
        mockOtherAnnotation1,
        mockOtherAnnotation2,
        mockWidgetAnnotation,
      ]);

      const result = hasFormFields();

      expect(result).toBe(true);
      expect(mockGetAnnotationsList).toHaveBeenCalledTimes(1);
    });

    it('should handle null or undefined annotations in list', () => {
      const mockWidgetAnnotation = new MockWidgetAnnotation();
      mockGetAnnotationsList.mockReturnValue([null, undefined, mockWidgetAnnotation]);

      const result = hasFormFields();

      expect(result).toBe(true);
      expect(mockGetAnnotationsList).toHaveBeenCalledTimes(1);
    });
  });

  describe('hasFormFieldIndicator', () => {
    it('should return true when text contains "agreement"', () => {
      expect(hasFormFieldIndicator('This is an agreement document')).toBe(true);
      expect(hasFormFieldIndicator('AGREEMENT')).toBe(true);
      expect(hasFormFieldIndicator('Agreement')).toBe(true);
    });

    it('should return true when text contains "contract"', () => {
      expect(hasFormFieldIndicator('Please sign this contract')).toBe(true);
      expect(hasFormFieldIndicator('CONTRACT')).toBe(true);
      expect(hasFormFieldIndicator('Contract')).toBe(true);
    });

    it('should return true when text contains "application"', () => {
      expect(hasFormFieldIndicator('Fill out this application')).toBe(true);
      expect(hasFormFieldIndicator('APPLICATION')).toBe(true);
      expect(hasFormFieldIndicator('Application')).toBe(true);
    });

    it('should return true when text contains "form"', () => {
      expect(hasFormFieldIndicator('Complete this form')).toBe(true);
      expect(hasFormFieldIndicator('FORM')).toBe(true);
      expect(hasFormFieldIndicator('Form')).toBe(true);
    });

    it('should return true when text contains "signature"', () => {
      expect(hasFormFieldIndicator('Please provide your signature')).toBe(true);
      expect(hasFormFieldIndicator('SIGNATURE')).toBe(true);
      expect(hasFormFieldIndicator('Signature')).toBe(true);
    });

    it('should return true when text contains "sign"', () => {
      expect(hasFormFieldIndicator('Please sign here')).toBe(true);
      expect(hasFormFieldIndicator('SIGN')).toBe(true);
      expect(hasFormFieldIndicator('Sign')).toBe(true);
    });

    it('should return true when text contains "signed"', () => {
      expect(hasFormFieldIndicator('This document is signed')).toBe(true);
      expect(hasFormFieldIndicator('SIGNED')).toBe(true);
      expect(hasFormFieldIndicator('Signed')).toBe(true);
    });

    it('should return true when text contains "signed by"', () => {
      expect(hasFormFieldIndicator('Signed by John Doe')).toBe(true);
      expect(hasFormFieldIndicator('SIGNED BY')).toBe(true);
      expect(hasFormFieldIndicator('Signed By')).toBe(true);
    });

    it('should return true when text contains "guarantor"', () => {
      expect(hasFormFieldIndicator('Guarantor information')).toBe(true);
      expect(hasFormFieldIndicator('GUARANTOR')).toBe(true);
      expect(hasFormFieldIndicator('guarantor')).toBe(true);
    });

    it('should return true when text contains "signatory"', () => {
      expect(hasFormFieldIndicator('Signatory details')).toBe(true);
      expect(hasFormFieldIndicator('SIGNATORY')).toBe(true);
      expect(hasFormFieldIndicator('signatory')).toBe(true);
    });

    it('should return true when text contains "lease"', () => {
      expect(hasFormFieldIndicator('Lease agreement')).toBe(true);
      expect(hasFormFieldIndicator('LEASE')).toBe(true);
      expect(hasFormFieldIndicator('lease')).toBe(true);
    });

    it('should return true when text contains multiple indicators', () => {
      expect(hasFormFieldIndicator('This is a form contract agreement')).toBe(true);
      expect(hasFormFieldIndicator('Please sign this application form')).toBe(true);
    });

    it('should return false when text does not contain any indicator', () => {
      expect(hasFormFieldIndicator('This is a regular document')).toBe(false);
      expect(hasFormFieldIndicator('Just some text')).toBe(false);
      expect(hasFormFieldIndicator('Document content')).toBe(false);
    });

    it('should return false when text is empty', () => {
      expect(hasFormFieldIndicator('')).toBe(false);
    });

    it('should return false when text contains partial word matches', () => {
      expect(hasFormFieldIndicator('agreements')).toBe(false); // "agreement" is not a word boundary match
      expect(hasFormFieldIndicator('contracts')).toBe(false); // "contract" is not a word boundary match
      expect(hasFormFieldIndicator('forms')).toBe(false); // "form" is not a word boundary match
      expect(hasFormFieldIndicator('signing')).toBe(false); // "sign" is not a word boundary match
    });

    it('should match word boundaries correctly', () => {
      // Should match standalone words
      expect(hasFormFieldIndicator('form')).toBe(true);
      expect(hasFormFieldIndicator(' contract ')).toBe(true);
      expect(hasFormFieldIndicator(' agreement.')).toBe(true);

      // Should not match partial words
      expect(hasFormFieldIndicator('information')).toBe(false);
      expect(hasFormFieldIndicator('reform')).toBe(false);
      expect(hasFormFieldIndicator('assign')).toBe(false);
    });

    it('should be case insensitive', () => {
      expect(hasFormFieldIndicator('FORM')).toBe(true);
      expect(hasFormFieldIndicator('Form')).toBe(true);
      expect(hasFormFieldIndicator('form')).toBe(true);
      expect(hasFormFieldIndicator('FoRm')).toBe(true);
      expect(hasFormFieldIndicator('CONTRACT')).toBe(true);
      expect(hasFormFieldIndicator('Contract')).toBe(true);
      expect(hasFormFieldIndicator('contract')).toBe(true);
      expect(hasFormFieldIndicator('CoNtRaCt')).toBe(true);
    });

    it('should handle text with punctuation', () => {
      expect(hasFormFieldIndicator('Please sign this form.')).toBe(true);
      expect(hasFormFieldIndicator('Contract, agreement, and form')).toBe(true);
      expect(hasFormFieldIndicator('Form: Please complete')).toBe(true);
      expect(hasFormFieldIndicator('(Form)')).toBe(true);
    });

    it('should handle text with newlines and whitespace', () => {
      expect(hasFormFieldIndicator('Please\nsign\nthis\nform')).toBe(true);
      expect(hasFormFieldIndicator('  form  ')).toBe(true);
      expect(hasFormFieldIndicator('contract\tagreement')).toBe(true);
    });

    it('should match all indicator words from constants', () => {
      FORM_FIELD_INDICATORS.forEach((indicator) => {
        expect(hasFormFieldIndicator(`This is a ${indicator} document`)).toBe(true);
        expect(hasFormFieldIndicator(indicator.toUpperCase())).toBe(true);
        expect(hasFormFieldIndicator(indicator.toLowerCase())).toBe(true);
        expect(hasFormFieldIndicator(indicator.charAt(0).toUpperCase() + indicator.slice(1))).toBe(true);
      });
    });

    it('should return false for text that contains indicator words as part of other words', () => {
      expect(hasFormFieldIndicator('information')).toBe(false); // contains "form" but not as word boundary
      expect(hasFormFieldIndicator('reform')).toBe(false); // contains "form" but not as word boundary
      expect(hasFormFieldIndicator('assign')).toBe(false); // contains "sign" but not as word boundary
      expect(hasFormFieldIndicator('design')).toBe(false); // contains "sign" but not as word boundary
    });
  });
});
