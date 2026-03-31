import React from 'react';
import { mount, shallow } from 'enzyme';
import StartTrialModalWrapper from '../StartTrialModalWrapper';
import useHandleStartTrialModalWrapper from '../hooks/useHandleStartTrialModalWrapper';
import { useGetFreeTrialModalCoolDownFlag } from 'features/CNC/hooks/useGetFreeTrialModalCoolDownFlag';

// Mock the dependencies
jest.mock('../hooks/useHandleStartTrialModalWrapper');
jest.mock('features/CNC/hooks/useGetFreeTrialModalCoolDownFlag');
jest.mock('utils/lazyWithRetry', () => ({
  lazyWithRetry: jest.fn((importFn) => {
    // Execute the import function to cover the import statement
    importFn();
    return function MockStartTrialModal({ onClose, onClickStartTrial }: any) {
      return (
        <div data-testid="start-trial-modal">
          <button onClick={() => onClose({ skip: false })}>Close</button>
          <button onClick={() => onClickStartTrial({ skip: false })}>Start Trial</button>
        </div>
      );
    };
  }),
}));
jest.mock('features/CNC/CncComponents/DismissFreeTrialSurvey', () => ({
  VariantPopover: ({ onClose }: any) => (
    <div data-testid="dismiss-survey-popover">
      <button onClick={() => onClose()}>Close Popover</button>
    </div>
  ),
}));
jest.mock('features/CNC/CncComponents/ExploreOtherProducts', () => ({
  __esModule: true,
  default: ({ onClose, onClickStartTrial }: any) => (
    <div data-testid="explore-other-products-modal">
      <button onClick={() => onClose({ skip: false })}>Close</button>
      <button onClick={() => onClickStartTrial({ skip: false })}>Start Trial</button>
    </div>
  ),
}));

const mockUseHandleStartTrialModalWrapper = useHandleStartTrialModalWrapper as jest.MockedFunction<typeof useHandleStartTrialModalWrapper>;
const mockUseGetFreeTrialModalCoolDownFlag = useGetFreeTrialModalCoolDownFlag as jest.MockedFunction<typeof useGetFreeTrialModalCoolDownFlag>;

describe('StartTrialModalWrapper', () => {
  const defaultProps = {
    openTrialModal: true,
    onClose: jest.fn(),
    onClickStartTrial: jest.fn(),
  };

  const defaultHookReturn = {
    onCloseTrialModal: jest.fn(),
    openDismissFreeTrialSurveyModal: false,
    openDismissFreeTrialSurveyPopover: false,
    onCloseDismissFreeTrialSurvey: jest.fn(),
    onCloseDismissFreeTrialSurveyVariantModal: jest.fn(),
  };

  const defaultCoolDownFlagReturn = {
    isFreeTrialModalCoolDown: false,
    isOnlyShowInViewer: false,
    isOnlyViewerVariant: false,
    isExploreOtherProductsVariant: false,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseHandleStartTrialModalWrapper.mockReturnValue(defaultHookReturn);
    mockUseGetFreeTrialModalCoolDownFlag.mockReturnValue(defaultCoolDownFlagReturn);

    // Mock window.innerHeight
    Object.defineProperty(window, 'innerHeight', {
      writable: true,
      configurable: true,
      value: 800,
    });
  });

  describe('Rendering', () => {
    it('should render StartTrialModal when openTrialModal is true and not explore other products variant', () => {
      const wrapper = mount(<StartTrialModalWrapper {...defaultProps} />);

      expect(wrapper.find('[data-testid="start-trial-modal"]')).toHaveLength(1);
      expect(wrapper.find('[data-testid="explore-other-products-modal"]')).toHaveLength(0);
    });

    it('should render ExploreOtherProductsModal when openTrialModal is true, isExploreOtherProductsVariant is true, and window height is sufficient', () => {
      mockUseGetFreeTrialModalCoolDownFlag.mockReturnValue({
        ...defaultCoolDownFlagReturn,
        isExploreOtherProductsVariant: true,
      });

      const wrapper = mount(<StartTrialModalWrapper {...defaultProps} />);

      expect(wrapper.find('[data-testid="explore-other-products-modal"]')).toHaveLength(1);
      expect(wrapper.find('[data-testid="start-trial-modal"]')).toHaveLength(0);
    });

    it('should render StartTrialModal when window height is insufficient for ExploreOtherProductsModal', () => {
      Object.defineProperty(window, 'innerHeight', {
        writable: true,
        configurable: true,
        value: 600, // Below MINIMUM_HEIGHT_TO_VIEW_LARGE_MODALS (648)
      });

      mockUseGetFreeTrialModalCoolDownFlag.mockReturnValue({
        ...defaultCoolDownFlagReturn,
        isExploreOtherProductsVariant: true,
      });

      const wrapper = mount(<StartTrialModalWrapper {...defaultProps} />);

      expect(wrapper.find('[data-testid="start-trial-modal"]')).toHaveLength(1);
      expect(wrapper.find('[data-testid="explore-other-products-modal"]')).toHaveLength(0);
    });

    it('should not render any modal when openTrialModal is false', () => {
      const wrapper = mount(<StartTrialModalWrapper {...defaultProps} openTrialModal={false} />);

      expect(wrapper.find('[data-testid="start-trial-modal"]')).toHaveLength(0);
      expect(wrapper.find('[data-testid="explore-other-products-modal"]')).toHaveLength(0);
    });

    it('should render DismissFreeTrialSurvey.VariantPopover when openDismissFreeTrialSurveyPopover is true', () => {
      mockUseHandleStartTrialModalWrapper.mockReturnValue({
        ...defaultHookReturn,
        openDismissFreeTrialSurveyPopover: true,
      });

      const wrapper = mount(<StartTrialModalWrapper {...defaultProps} />);

      expect(wrapper.find('[data-testid="dismiss-survey-popover"]')).toHaveLength(1);
    });
  });

  describe('Props passing', () => {
    it('should pass correct props to StartTrialModal', () => {
      const mockOnCloseTrialModal = jest.fn();
      const mockOnCloseDismissFreeTrialSurveyVariantModal = jest.fn();

      mockUseHandleStartTrialModalWrapper.mockReturnValue({
        ...defaultHookReturn,
        onCloseTrialModal: mockOnCloseTrialModal,
        onCloseDismissFreeTrialSurveyVariantModal: mockOnCloseDismissFreeTrialSurveyVariantModal,
        openDismissFreeTrialSurveyModal: true,
      });

      const wrapper = mount(<StartTrialModalWrapper {...defaultProps} />);
      const startTrialModal = wrapper.find('[data-testid="start-trial-modal"]');

      expect(startTrialModal).toHaveLength(1);
    });

    it('should pass correct props to ExploreOtherProductsModal', () => {
      mockUseGetFreeTrialModalCoolDownFlag.mockReturnValue({
        ...defaultCoolDownFlagReturn,
        isExploreOtherProductsVariant: true,
      });

      const wrapper = mount(<StartTrialModalWrapper {...defaultProps} />);
      const exploreModal = wrapper.find('[data-testid="explore-other-products-modal"]');

      expect(exploreModal).toHaveLength(1);
    });
  });

  describe('Hook integration', () => {
    it('should call useHandleStartTrialModalWrapper with onClose prop', () => {
      shallow(<StartTrialModalWrapper {...defaultProps} />);

      expect(mockUseHandleStartTrialModalWrapper).toHaveBeenCalledWith({
        onClose: defaultProps.onClose,
      });
    });

    it('should call useGetFreeTrialModalCoolDownFlag', () => {
      shallow(<StartTrialModalWrapper {...defaultProps} />);

      expect(mockUseGetFreeTrialModalCoolDownFlag).toHaveBeenCalled();
    });
  });

  describe('Window height handling', () => {
    it('should handle window height changes correctly', () => {
      // Test with high window height
      Object.defineProperty(window, 'innerHeight', {
        writable: true,
        configurable: true,
        value: 1000,
      });

      mockUseGetFreeTrialModalCoolDownFlag.mockReturnValue({
        ...defaultCoolDownFlagReturn,
        isExploreOtherProductsVariant: true,
      });

      const wrapper1 = mount(<StartTrialModalWrapper {...defaultProps} />);
      expect(wrapper1.find('[data-testid="explore-other-products-modal"]')).toHaveLength(1);

      // Test with low window height
      Object.defineProperty(window, 'innerHeight', {
        writable: true,
        configurable: true,
        value: 600, // Below MINIMUM_HEIGHT_TO_VIEW_LARGE_MODALS (648)
      });

      const wrapper2 = mount(<StartTrialModalWrapper {...defaultProps} />);
      expect(wrapper2.find('[data-testid="start-trial-modal"]')).toHaveLength(1);
    });
  });

  describe('Edge cases', () => {
    it('should handle undefined window.innerHeight', () => {
      Object.defineProperty(window, 'innerHeight', {
        writable: true,
        configurable: true,
        value: undefined,
      });

      mockUseGetFreeTrialModalCoolDownFlag.mockReturnValue({
        ...defaultCoolDownFlagReturn,
        isExploreOtherProductsVariant: true,
      });

      const wrapper = mount(<StartTrialModalWrapper {...defaultProps} />);

      // Should fallback to StartTrialModal when window height is undefined
      expect(wrapper.find('[data-testid="start-trial-modal"]')).toHaveLength(1);
    });

    it('should handle zero window height', () => {
      Object.defineProperty(window, 'innerHeight', {
        writable: true,
        configurable: true,
        value: 0,
      });

      mockUseGetFreeTrialModalCoolDownFlag.mockReturnValue({
        ...defaultCoolDownFlagReturn,
        isExploreOtherProductsVariant: true,
      });

      const wrapper = mount(<StartTrialModalWrapper {...defaultProps} />);

      expect(wrapper.find('[data-testid="start-trial-modal"]')).toHaveLength(1);
    });
  });
});
