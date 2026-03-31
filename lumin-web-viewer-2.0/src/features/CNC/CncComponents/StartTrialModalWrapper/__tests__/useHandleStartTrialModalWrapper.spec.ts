import useHandleStartTrialModalWrapper from '../hooks/useHandleStartTrialModalWrapper';
import { useGetDismissFreeTrialSurveyFlag, useOpenDismissFreeTrialSurvey } from 'features/CNC/hooks';

// Mock the dependencies
jest.mock('features/CNC/hooks', () => ({
  useGetDismissFreeTrialSurveyFlag: jest.fn(),
  useOpenDismissFreeTrialSurvey: jest.fn(),
}));

const mockUseGetDismissFreeTrialSurveyFlag = useGetDismissFreeTrialSurveyFlag as jest.MockedFunction<typeof useGetDismissFreeTrialSurveyFlag>;
const mockUseOpenDismissFreeTrialSurvey = useOpenDismissFreeTrialSurvey as jest.MockedFunction<typeof useOpenDismissFreeTrialSurvey>;

describe('useHandleStartTrialModalWrapper', () => {
  const mockOnClose = jest.fn();
  const defaultProps = { onClose: mockOnClose };

  const defaultOpenDismissFreeTrialSurveyReturn = {
    canOpenSurvey: true,
    openPopover: false,
    openModal: false,
    onOpen: jest.fn(),
    onClose: jest.fn(),
  };

  const defaultDismissFreeTrialSurveyFlagReturn = {
    canShowSurvey: true,
    isVariantModal: false,
    isVariantPopover: false,
    isCloseByButton: false,
    isCloseByIcon: false,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseOpenDismissFreeTrialSurvey.mockReturnValue(defaultOpenDismissFreeTrialSurveyReturn);
    mockUseGetDismissFreeTrialSurveyFlag.mockReturnValue(defaultDismissFreeTrialSurveyFlagReturn);
  });

  describe('Hook initialization', () => {
    it('should call useOpenDismissFreeTrialSurvey', () => {
      useHandleStartTrialModalWrapper(defaultProps);

      expect(mockUseOpenDismissFreeTrialSurvey).toHaveBeenCalled();
    });

    it('should call useGetDismissFreeTrialSurveyFlag', () => {
      useHandleStartTrialModalWrapper(defaultProps);

      expect(mockUseGetDismissFreeTrialSurveyFlag).toHaveBeenCalled();
    });

    it('should return expected properties', () => {
      const result = useHandleStartTrialModalWrapper(defaultProps);

      expect(result).toHaveProperty('onCloseTrialModal');
      expect(result).toHaveProperty('openDismissFreeTrialSurveyModal');
      expect(result).toHaveProperty('openDismissFreeTrialSurveyPopover');
      expect(result).toHaveProperty('onCloseDismissFreeTrialSurvey');
      expect(result).toHaveProperty('onCloseDismissFreeTrialSurveyVariantModal');
    });
  });

  describe('onCloseTrialModal behavior', () => {
    it('should call onClose directly when canOpenSurvey is false and return early', () => {
      const mockOnOpen = jest.fn();
      mockUseOpenDismissFreeTrialSurvey.mockReturnValue({
        ...defaultOpenDismissFreeTrialSurveyReturn,
        canOpenSurvey: false,
        onOpen: mockOnOpen,
      });
      mockUseGetDismissFreeTrialSurveyFlag.mockReturnValue({
        ...defaultDismissFreeTrialSurveyFlagReturn,
        isVariantPopover: true,
        isVariantModal: true,
      });

      const { onCloseTrialModal } = useHandleStartTrialModalWrapper(defaultProps);

      onCloseTrialModal({ skip: true });

      expect(mockOnClose).toHaveBeenCalledWith({ skip: true });
      expect(mockOnOpen).not.toHaveBeenCalled();
    });

    it('should call onClose and onOpen when isVariantPopover is true', () => {
      const mockOnOpen = jest.fn();
      mockUseOpenDismissFreeTrialSurvey.mockReturnValue({
        ...defaultOpenDismissFreeTrialSurveyReturn,
        onOpen: mockOnOpen,
      });
      mockUseGetDismissFreeTrialSurveyFlag.mockReturnValue({
        ...defaultDismissFreeTrialSurveyFlagReturn,
        isVariantPopover: true,
      });

      const { onCloseTrialModal } = useHandleStartTrialModalWrapper(defaultProps);

      onCloseTrialModal({ skip: false });

      expect(mockOnClose).toHaveBeenCalledWith({ skip: false });
      expect(mockOnOpen).toHaveBeenCalled();
    });

    it('should call only onOpen when isVariantModal is true', () => {
      const mockOnOpen = jest.fn();
      mockUseOpenDismissFreeTrialSurvey.mockReturnValue({
        ...defaultOpenDismissFreeTrialSurveyReturn,
        onOpen: mockOnOpen,
      });
      mockUseGetDismissFreeTrialSurveyFlag.mockReturnValue({
        ...defaultDismissFreeTrialSurveyFlagReturn,
        isVariantModal: true,
      });

      const { onCloseTrialModal } = useHandleStartTrialModalWrapper(defaultProps);

      onCloseTrialModal({ skip: true });

      expect(mockOnClose).not.toHaveBeenCalled();
      expect(mockOnOpen).toHaveBeenCalled();
    });

    it('should not call onClose or onOpen when neither variant is true and canOpenSurvey is true', () => {
      const mockOnOpen = jest.fn();
      mockUseOpenDismissFreeTrialSurvey.mockReturnValue({
        ...defaultOpenDismissFreeTrialSurveyReturn,
        onOpen: mockOnOpen,
      });

      const { onCloseTrialModal } = useHandleStartTrialModalWrapper(defaultProps);

      onCloseTrialModal({ skip: false });

      expect(mockOnClose).not.toHaveBeenCalled();
      expect(mockOnOpen).not.toHaveBeenCalled();
    });
  });

  describe('onCloseDismissFreeTrialSurveyVariantModal behavior', () => {
    it('should call onClose and onCloseDismissFreeTrialSurvey', () => {
      const mockOnCloseDismissFreeTrialSurvey = jest.fn();
      mockUseOpenDismissFreeTrialSurvey.mockReturnValue({
        ...defaultOpenDismissFreeTrialSurveyReturn,
        onClose: mockOnCloseDismissFreeTrialSurvey,
      });

      const { onCloseDismissFreeTrialSurveyVariantModal } = useHandleStartTrialModalWrapper(defaultProps);

      onCloseDismissFreeTrialSurveyVariantModal({ skip: true });

      expect(mockOnClose).toHaveBeenCalledWith({ skip: true });
      expect(mockOnCloseDismissFreeTrialSurvey).toHaveBeenCalled();
    });
  });

  describe('Return values', () => {
    it('should return correct openDismissFreeTrialSurveyModal value', () => {
      mockUseOpenDismissFreeTrialSurvey.mockReturnValue({
        ...defaultOpenDismissFreeTrialSurveyReturn,
        openModal: true,
      });

      const { openDismissFreeTrialSurveyModal } = useHandleStartTrialModalWrapper(defaultProps);

      expect(openDismissFreeTrialSurveyModal).toBe(true);
    });

    it('should return correct openDismissFreeTrialSurveyPopover value', () => {
      mockUseOpenDismissFreeTrialSurvey.mockReturnValue({
        ...defaultOpenDismissFreeTrialSurveyReturn,
        openPopover: true,
      });

      const { openDismissFreeTrialSurveyPopover } = useHandleStartTrialModalWrapper(defaultProps);

      expect(openDismissFreeTrialSurveyPopover).toBe(true);
    });

    it('should return correct onCloseDismissFreeTrialSurvey function', () => {
      const mockOnCloseDismissFreeTrialSurvey = jest.fn();
      mockUseOpenDismissFreeTrialSurvey.mockReturnValue({
        ...defaultOpenDismissFreeTrialSurveyReturn,
        onClose: mockOnCloseDismissFreeTrialSurvey,
      });

      const { onCloseDismissFreeTrialSurvey } = useHandleStartTrialModalWrapper(defaultProps);

      expect(onCloseDismissFreeTrialSurvey).toBe(mockOnCloseDismissFreeTrialSurvey);
    });
  });

  describe('Edge cases', () => {
    it('should handle undefined canOpenSurvey', () => {
      mockUseOpenDismissFreeTrialSurvey.mockReturnValue({
        ...defaultOpenDismissFreeTrialSurveyReturn,
        canOpenSurvey: undefined as any,
      });

      const { onCloseTrialModal } = useHandleStartTrialModalWrapper(defaultProps);

      onCloseTrialModal({ skip: false });

      expect(mockOnClose).toHaveBeenCalledWith({ skip: false });
    });

    it('should handle both isVariantModal and isVariantPopover being true', () => {
      const mockOnOpen = jest.fn();
      mockUseOpenDismissFreeTrialSurvey.mockReturnValue({
        ...defaultOpenDismissFreeTrialSurveyReturn,
        onOpen: mockOnOpen,
      });
      mockUseGetDismissFreeTrialSurveyFlag.mockReturnValue({
        ...defaultDismissFreeTrialSurveyFlagReturn,
        isVariantModal: true,
        isVariantPopover: true,
      });

      const { onCloseTrialModal } = useHandleStartTrialModalWrapper(defaultProps);

      onCloseTrialModal({ skip: false });

      // Should prioritize popover behavior
      expect(mockOnClose).toHaveBeenCalledWith({ skip: false });
      expect(mockOnOpen).toHaveBeenCalled();
    });

    it('should handle null onClose prop', () => {
      const { onCloseTrialModal } = useHandleStartTrialModalWrapper({ onClose: null as any });

      expect(() => {
        onCloseTrialModal({ skip: false });
      }).not.toThrow();
    });
  });

  describe('Function references', () => {
    it('should return functions that can be called', () => {
      const result = useHandleStartTrialModalWrapper(defaultProps);

      expect(typeof result.onCloseTrialModal).toBe('function');
      expect(typeof result.onCloseDismissFreeTrialSurveyVariantModal).toBe('function');
      expect(typeof result.onCloseDismissFreeTrialSurvey).toBe('function');
    });
  });
});
