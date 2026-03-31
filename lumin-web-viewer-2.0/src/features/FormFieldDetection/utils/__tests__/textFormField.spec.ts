import { getFitHeightFontSize } from '@new-ui/components/ToolProperties/components/FormBuilder/utils';

import core from 'core';

import { TOOLS_NAME } from 'constants/toolsName';

import { FormFieldDetection, TEXT_WIDGETS_FIELD_FLAGS } from '../../constants/detectionField.constant';
import { IFormFieldDetectionPrediction } from '../../types/detectionField.type';
import { getTextFormFieldProperties } from '../textFormField';

jest.mock('core', () => ({
  __esModule: true,
  default: {
    getTool: jest.fn(),
  },
}));

jest.mock('@new-ui/components/ToolProperties/components/FormBuilder/utils', () => ({
  getFitHeightFontSize: jest.fn(),
}));

describe('textFormField', () => {
  const mockGetTool = core.getTool as jest.Mock;
  const mockGetFitHeightFontSize = getFitHeightFontSize as jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getTextFormFieldProperties', () => {
    const createMockPrediction = (
      fieldType: string,
      fieldFlags?: number,
      boundingRectangle?: IFormFieldDetectionPrediction['boundingRectangle']
    ): IFormFieldDetectionPrediction => ({
      pageNumber: 1,
      fieldId: 'test-field-id',
      fieldType: fieldType as IFormFieldDetectionPrediction['fieldType'],
      fieldFlags,
      boundingRectangle: boundingRectangle || {
        x1: 10,
        y1: 20,
        x2: 50,
        y2: 60,
      },
    });

    describe('when fieldType is not TEXT_BOX', () => {
      it('should return default values for SIGNATURE field type', () => {
        const prediction = createMockPrediction(FormFieldDetection.SIGNATURE);

        const result = getTextFormFieldProperties(prediction);

        expect(result).toEqual({
          isMultiline: false,
          fontSize: 0,
        });
      });

      it('should return default values for CHECK_BOX field type', () => {
        const prediction = createMockPrediction(FormFieldDetection.CHECK_BOX);

        const result = getTextFormFieldProperties(prediction);

        expect(result).toEqual({
          isMultiline: false,
          fontSize: 0,
        });
      });

      it('should return default values for RADIO_BOX field type', () => {
        const prediction = createMockPrediction(FormFieldDetection.RADIO_BOX);

        const result = getTextFormFieldProperties(prediction);

        expect(result).toEqual({
          isMultiline: false,
          fontSize: 0,
        });
      });

      it('should return default values for unknown field type', () => {
        const prediction = createMockPrediction('unknown_type' as IFormFieldDetectionPrediction['fieldType']);

        const result = getTextFormFieldProperties(prediction);

        expect(result).toEqual({
          isMultiline: false,
          fontSize: 0,
        });
      });
    });

    describe('when fieldType is TEXT_BOX', () => {
      describe('isMultilineField logic', () => {
        it('should return isMultiline false when fieldFlags is undefined', () => {
          const prediction = createMockPrediction(FormFieldDetection.TEXT_BOX, undefined);
          mockGetTool.mockReturnValue({
            defaults: { FontSize: '12pt' },
          });
          mockGetFitHeightFontSize.mockReturnValue(30);

          const result = getTextFormFieldProperties(prediction);

          expect(result.isMultiline).toBe(false);
        });

        it('should return isMultiline false when fieldFlags is null', () => {
          const prediction = createMockPrediction(FormFieldDetection.TEXT_BOX, null as unknown as number);
          mockGetTool.mockReturnValue({
            defaults: { FontSize: '12pt' },
          });
          mockGetFitHeightFontSize.mockReturnValue(30);

          const result = getTextFormFieldProperties(prediction);

          expect(result.isMultiline).toBe(false);
        });

        it('should return isMultiline false when fieldFlags is 0', () => {
          const prediction = createMockPrediction(FormFieldDetection.TEXT_BOX, 0);
          mockGetTool.mockReturnValue({
            defaults: { FontSize: '12pt' },
          });
          mockGetFitHeightFontSize.mockReturnValue(30);

          const result = getTextFormFieldProperties(prediction);

          expect(result.isMultiline).toBe(false);
        });

        it('should return isMultiline false when fieldFlags does not have IS_MULTILINE flag', () => {
          const prediction = createMockPrediction(FormFieldDetection.TEXT_BOX, TEXT_WIDGETS_FIELD_FLAGS.IS_PASSWORD);
          mockGetTool.mockReturnValue({
            defaults: { FontSize: '12pt' },
          });
          mockGetFitHeightFontSize.mockReturnValue(30);

          const result = getTextFormFieldProperties(prediction);

          expect(result.isMultiline).toBe(false);
        });

        it('should return isMultiline true when fieldFlags has IS_MULTILINE flag', () => {
          const prediction = createMockPrediction(FormFieldDetection.TEXT_BOX, TEXT_WIDGETS_FIELD_FLAGS.IS_MULTILINE);
          mockGetTool.mockReturnValue({
            defaults: { FontSize: '12pt' },
          });
          mockGetFitHeightFontSize.mockReturnValue(30);

          const result = getTextFormFieldProperties(prediction);

          expect(result.isMultiline).toBe(true);
        });

        it('should return isMultiline true when fieldFlags has IS_MULTILINE flag combined with other flags', () => {
          // eslint-disable-next-line no-bitwise
          const combinedFlags = TEXT_WIDGETS_FIELD_FLAGS.IS_MULTILINE | TEXT_WIDGETS_FIELD_FLAGS.IS_PASSWORD;
          const prediction = createMockPrediction(FormFieldDetection.TEXT_BOX, combinedFlags);
          mockGetTool.mockReturnValue({
            defaults: { FontSize: '12pt' },
          });
          mockGetFitHeightFontSize.mockReturnValue(30);

          const result = getTextFormFieldProperties(prediction);

          expect(result.isMultiline).toBe(true);
        });
      });

      describe('getToolFontSize logic', () => {
        it('should return fontSize 0 when tool defaults FontSize is undefined', () => {
          const prediction = createMockPrediction(FormFieldDetection.TEXT_BOX);
          mockGetTool.mockReturnValue({
            defaults: {},
          });
          mockGetFitHeightFontSize.mockReturnValue(30);

          const result = getTextFormFieldProperties(prediction);

          expect(result.fontSize).toBe(30); // Uses fitHeightFontSize when toolFontSize is 0
          expect(mockGetFitHeightFontSize).toHaveBeenCalledWith(40); // y2 - y1 = 60 - 20
        });

        it('should return fontSize 0 when tool defaults FontSize is null', () => {
          const prediction = createMockPrediction(FormFieldDetection.TEXT_BOX);
          mockGetTool.mockReturnValue({
            defaults: { FontSize: null },
          });
          mockGetFitHeightFontSize.mockReturnValue(30);

          const result = getTextFormFieldProperties(prediction);

          expect(result.fontSize).toBe(30);
        });

        it('should parse fontSize correctly when FontSize includes "pt" suffix', () => {
          const prediction = createMockPrediction(FormFieldDetection.TEXT_BOX);
          mockGetTool.mockReturnValue({
            defaults: { FontSize: '14pt' },
          });
          mockGetFitHeightFontSize.mockReturnValue(30);

          const result = getTextFormFieldProperties(prediction);

          expect(result.fontSize).toBe(14); // Math.min(14, 30) = 14
          expect(mockGetTool).toHaveBeenCalledWith(TOOLS_NAME.TEXT_FIELD);
        });

        it('should parse fontSize correctly when FontSize does not include "pt" suffix', () => {
          const prediction = createMockPrediction(FormFieldDetection.TEXT_BOX);
          mockGetTool.mockReturnValue({
            defaults: { FontSize: '16' },
          });
          mockGetFitHeightFontSize.mockReturnValue(30);

          const result = getTextFormFieldProperties(prediction);

          expect(result.fontSize).toBe(16); // Math.min(16, 30) = 16
        });

        it('should handle FontSize as number', () => {
          const prediction = createMockPrediction(FormFieldDetection.TEXT_BOX);
          mockGetTool.mockReturnValue({
            defaults: { FontSize: 18 },
          });
          mockGetFitHeightFontSize.mockReturnValue(30);

          const result = getTextFormFieldProperties(prediction);

          expect(result.fontSize).toBe(18); // Math.min(18, 30) = 18
        });

        it('should return fontSize 0 when FontSize is not a finite number', () => {
          const prediction = createMockPrediction(FormFieldDetection.TEXT_BOX);
          mockGetTool.mockReturnValue({
            defaults: { FontSize: 'invalid' },
          });
          mockGetFitHeightFontSize.mockReturnValue(30);

          const result = getTextFormFieldProperties(prediction);

          expect(result.fontSize).toBe(30); // Uses fitHeightFontSize when toolFontSize is 0
        });

        it('should return fontSize 0 when FontSize is NaN', () => {
          const prediction = createMockPrediction(FormFieldDetection.TEXT_BOX);
          mockGetTool.mockReturnValue({
            defaults: { FontSize: NaN },
          });
          mockGetFitHeightFontSize.mockReturnValue(30);

          const result = getTextFormFieldProperties(prediction);

          expect(result.fontSize).toBe(30);
        });

        it('should return fontSize 0 when FontSize is Infinity', () => {
          const prediction = createMockPrediction(FormFieldDetection.TEXT_BOX);
          mockGetTool.mockReturnValue({
            defaults: { FontSize: Infinity },
          });
          mockGetFitHeightFontSize.mockReturnValue(30);

          const result = getTextFormFieldProperties(prediction);

          expect(result.fontSize).toBe(30);
        });

        it('should handle FontSize with "pt" in the middle', () => {
          const prediction = createMockPrediction(FormFieldDetection.TEXT_BOX);
          mockGetTool.mockReturnValue({
            defaults: { FontSize: '12pt14' },
          });
          mockGetFitHeightFontSize.mockReturnValue(30);

          const result = getTextFormFieldProperties(prediction);

          expect(result.fontSize).toBe(12); // Split at first "pt"
        });

        it('should handle FontSize with multiple "pt" occurrences', () => {
          const prediction = createMockPrediction(FormFieldDetection.TEXT_BOX);
          mockGetTool.mockReturnValue({
            defaults: { FontSize: '10ptpt' },
          });
          mockGetFitHeightFontSize.mockReturnValue(30);

          const result = getTextFormFieldProperties(prediction);

          expect(result.fontSize).toBe(10);
        });
      });

      describe('calculateFontSize logic', () => {
        it('should return fitHeightFontSize when toolFontSize is 0', () => {
          const prediction = createMockPrediction(FormFieldDetection.TEXT_BOX);
          mockGetTool.mockReturnValue({
            defaults: { FontSize: '0pt' },
          });
          mockGetFitHeightFontSize.mockReturnValue(25);

          const result = getTextFormFieldProperties(prediction);

          expect(result.fontSize).toBe(25);
          expect(mockGetFitHeightFontSize).toHaveBeenCalledWith(40); // y2 - y1 = 60 - 20
        });

        it('should return fitHeightFontSize when toolFontSize is negative', () => {
          const prediction = createMockPrediction(FormFieldDetection.TEXT_BOX);
          mockGetTool.mockReturnValue({
            defaults: { FontSize: '-5pt' },
          });
          mockGetFitHeightFontSize.mockReturnValue(25);

          const result = getTextFormFieldProperties(prediction);

          expect(result.fontSize).toBe(25);
        });

        it('should return toolFontSize when toolFontSize is less than fitHeightFontSize', () => {
          const prediction = createMockPrediction(FormFieldDetection.TEXT_BOX);
          mockGetTool.mockReturnValue({
            defaults: { FontSize: '10pt' },
          });
          mockGetFitHeightFontSize.mockReturnValue(30);

          const result = getTextFormFieldProperties(prediction);

          expect(result.fontSize).toBe(10); // Math.min(10, 30) = 10
        });

        it('should return fitHeightFontSize when toolFontSize is greater than fitHeightFontSize', () => {
          const prediction = createMockPrediction(FormFieldDetection.TEXT_BOX);
          mockGetTool.mockReturnValue({
            defaults: { FontSize: '50pt' },
          });
          mockGetFitHeightFontSize.mockReturnValue(30);

          const result = getTextFormFieldProperties(prediction);

          expect(result.fontSize).toBe(30); // Math.min(50, 30) = 30
        });

        it('should return fitHeightFontSize when toolFontSize equals fitHeightFontSize', () => {
          const prediction = createMockPrediction(FormFieldDetection.TEXT_BOX);
          mockGetTool.mockReturnValue({
            defaults: { FontSize: '30pt' },
          });
          mockGetFitHeightFontSize.mockReturnValue(30);

          const result = getTextFormFieldProperties(prediction);

          expect(result.fontSize).toBe(30); // Math.min(30, 30) = 30
        });

        it('should calculate height correctly from boundingRectangle', () => {
          const prediction = createMockPrediction(FormFieldDetection.TEXT_BOX, undefined, {
            x1: 0,
            y1: 10,
            x2: 100,
            y2: 50,
          });
          mockGetTool.mockReturnValue({
            defaults: { FontSize: '12pt' },
          });
          mockGetFitHeightFontSize.mockReturnValue(30);

          getTextFormFieldProperties(prediction);

          expect(mockGetFitHeightFontSize).toHaveBeenCalledWith(40); // y2 - y1 = 50 - 10
        });

        it('should handle zero height boundingRectangle', () => {
          const prediction = createMockPrediction(FormFieldDetection.TEXT_BOX, undefined, {
            x1: 0,
            y1: 10,
            x2: 100,
            y2: 10,
          });
          mockGetTool.mockReturnValue({
            defaults: { FontSize: '12pt' },
          });
          mockGetFitHeightFontSize.mockReturnValue(0);

          const result = getTextFormFieldProperties(prediction);

          expect(result.fontSize).toBe(0); // Math.min(12, 0) = 0
          expect(mockGetFitHeightFontSize).toHaveBeenCalledWith(0);
        });

        it('should handle negative height boundingRectangle', () => {
          const prediction = createMockPrediction(FormFieldDetection.TEXT_BOX, undefined, {
            x1: 0,
            y1: 50,
            x2: 100,
            y2: 10,
          });
          mockGetTool.mockReturnValue({
            defaults: { FontSize: '12pt' },
          });
          mockGetFitHeightFontSize.mockReturnValue(-30);

          const result = getTextFormFieldProperties(prediction);

          expect(result.fontSize).toBe(-30); // Math.min(12, -30) = -30
          expect(mockGetFitHeightFontSize).toHaveBeenCalledWith(-40);
        });
      });

      describe('integration scenarios', () => {
        it('should return correct values for TEXT_BOX with multiline flag and valid fontSize', () => {
          const prediction = createMockPrediction(FormFieldDetection.TEXT_BOX, TEXT_WIDGETS_FIELD_FLAGS.IS_MULTILINE);
          mockGetTool.mockReturnValue({
            defaults: { FontSize: '14pt' },
          });
          mockGetFitHeightFontSize.mockReturnValue(30);

          const result = getTextFormFieldProperties(prediction);

          expect(result).toEqual({
            isMultiline: true,
            fontSize: 14,
          });
          expect(mockGetTool).toHaveBeenCalledWith(TOOLS_NAME.TEXT_FIELD);
          expect(mockGetFitHeightFontSize).toHaveBeenCalledWith(40);
        });

        it('should return correct values for TEXT_BOX without multiline flag and valid fontSize', () => {
          const prediction = createMockPrediction(FormFieldDetection.TEXT_BOX, 0);
          mockGetTool.mockReturnValue({
            defaults: { FontSize: '16pt' },
          });
          mockGetFitHeightFontSize.mockReturnValue(25);

          const result = getTextFormFieldProperties(prediction);

          expect(result).toEqual({
            isMultiline: false,
            fontSize: 16,
          });
        });

        it('should handle tool defaults being undefined', () => {
          const prediction = createMockPrediction(FormFieldDetection.TEXT_BOX);
          mockGetTool.mockReturnValue({
            defaults: undefined,
          });
          mockGetFitHeightFontSize.mockReturnValue(30);

          const result = getTextFormFieldProperties(prediction);

          expect(result.fontSize).toBe(30);
        });

        it('should handle tool defaults being null', () => {
          const prediction = createMockPrediction(FormFieldDetection.TEXT_BOX);
          mockGetTool.mockReturnValue({
            defaults: null,
          });
          mockGetFitHeightFontSize.mockReturnValue(30);

          const result = getTextFormFieldProperties(prediction);

          expect(result.fontSize).toBe(30);
        });

        it('should handle decimal fontSize values', () => {
          const prediction = createMockPrediction(FormFieldDetection.TEXT_BOX);
          mockGetTool.mockReturnValue({
            defaults: { FontSize: '12.5pt' },
          });
          mockGetFitHeightFontSize.mockReturnValue(30);

          const result = getTextFormFieldProperties(prediction);

          expect(result.fontSize).toBe(12.5); // Math.min(12.5, 30) = 12.5
        });

        it('should handle very large fontSize values', () => {
          const prediction = createMockPrediction(FormFieldDetection.TEXT_BOX);
          mockGetTool.mockReturnValue({
            defaults: { FontSize: '999pt' },
          });
          mockGetFitHeightFontSize.mockReturnValue(30);

          const result = getTextFormFieldProperties(prediction);

          expect(result.fontSize).toBe(30); // Math.min(999, 30) = 30
        });

        it('should handle very small fontSize values', () => {
          const prediction = createMockPrediction(FormFieldDetection.TEXT_BOX);
          mockGetTool.mockReturnValue({
            defaults: { FontSize: '1pt' },
          });
          mockGetFitHeightFontSize.mockReturnValue(30);

          const result = getTextFormFieldProperties(prediction);

          expect(result.fontSize).toBe(1); // Math.min(1, 30) = 1
        });
      });
    });
  });
});
