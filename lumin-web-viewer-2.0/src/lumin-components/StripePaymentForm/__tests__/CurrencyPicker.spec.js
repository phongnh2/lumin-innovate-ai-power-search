import React from 'react';
import { shallow } from 'enzyme';
import { Text } from 'lumin-ui/kiwi-ui';

import CurrencyPicker from '../components/CurrencyPicker';
import MaterialSelect from 'lumin-components/MaterialSelect';
import DefaultSelect from 'luminComponents/DefaultSelect';

import { CURRENCY } from 'constants/paymentConstant';

jest.mock('hooks', () => ({
  useTranslation: jest.fn(),
  useEnableWebReskin: jest.fn(),
  usePaymentFreeTrialPageReskin: jest.fn(),
}));

jest.mock('constants/paymentConstant', () => ({
  CURRENCY: {
    USD: {
      value: 'USD',
      name: 'USD',
      note: 'US Dollar',
    },
    EUR: {
      value: 'EUR',
      name: 'EUR',
      note: 'Euro',
    },
    GBP: {
      value: 'GBP',
      name: 'GBP',
      note: 'British Pound',
    },
  },
}));

describe('<CurrencyPicker />', () => {
  let mockUseTranslation;
  let mockUseEnableWebReskin;
  let mockUsePaymentFreeTrialPageReskin;

  const defaultProps = {
    value: 'USD',
    onChange: jest.fn(),
    disabled: false,
    readOnly: false,
  };

  beforeEach(() => {
    jest.clearAllMocks();

    mockUseTranslation = require('hooks').useTranslation;
    mockUseTranslation.mockReturnValue({
      t: (key) => key,
    });

    mockUseEnableWebReskin = require('hooks').useEnableWebReskin;
    mockUseEnableWebReskin.mockReturnValue({
      isEnableReskin: false,
    });

    mockUsePaymentFreeTrialPageReskin = require('hooks').usePaymentFreeTrialPageReskin;
    mockUsePaymentFreeTrialPageReskin.mockReturnValue({
      isEnableReskinUI: false,
    });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('Rendering with isEnableReskin = true', () => {
    beforeEach(() => {
      mockUseEnableWebReskin.mockReturnValue({ isEnableReskin: true });
    });

    it('should render DefaultSelect when isEnableReskin is true', () => {
      const wrapper = shallow(<CurrencyPicker {...defaultProps} />);

      expect(wrapper.find(DefaultSelect)).toHaveLength(1);
      expect(wrapper.find(MaterialSelect)).toHaveLength(0);
    });

    it('should pass correct props to DefaultSelect', () => {
      const wrapper = shallow(<CurrencyPicker {...defaultProps} />);
      const defaultSelect = wrapper.find(DefaultSelect);

      expect(defaultSelect.prop('value')).toBe('USD');
      expect(defaultSelect.prop('size')).toBe('lg');
      expect(defaultSelect.prop('readOnly')).toBe(false);
      expect(defaultSelect.prop('data')).toBeDefined();
    });

    it('should disable DefaultSelect when disabled is true', () => {
      const wrapper = shallow(<CurrencyPicker {...defaultProps} disabled={true} />);
      const defaultSelect = wrapper.find(DefaultSelect);

      expect(defaultSelect.prop('readOnly')).toBe(true);
    });

    it('should disable DefaultSelect when readOnly is true', () => {
      const wrapper = shallow(<CurrencyPicker {...defaultProps} readOnly={true} />);
      const defaultSelect = wrapper.find(DefaultSelect);

      expect(defaultSelect.prop('readOnly')).toBe(true);
    });

    it('should call onChange with currency value when DefaultSelect changes', () => {
      const mockOnChange = jest.fn();
      const wrapper = shallow(<CurrencyPicker {...defaultProps} onChange={mockOnChange} />);
      const defaultSelect = wrapper.find(DefaultSelect);

      const onChange = defaultSelect.prop('onChange');
      onChange('EUR');

      expect(mockOnChange).toHaveBeenCalledWith('currency', 'EUR');
    });

    it('should render with isEnableReskinUI = true', () => {
      mockUsePaymentFreeTrialPageReskin.mockReturnValue({ isEnableReskinUI: true });
      const wrapper = shallow(<CurrencyPicker {...defaultProps} />);

      expect(wrapper.find(DefaultSelect)).toHaveLength(1);
    });
  });

  describe('Rendering with isEnableReskin = false', () => {
    beforeEach(() => {
      mockUseEnableWebReskin.mockReturnValue({ isEnableReskin: false });
    });

    it('should render MaterialSelect when isEnableReskin is false', () => {
      const wrapper = shallow(<CurrencyPicker {...defaultProps} />);

      expect(wrapper.find(MaterialSelect)).toHaveLength(1);
      expect(wrapper.find(DefaultSelect)).toHaveLength(0);
    });

    it('should pass correct props to MaterialSelect', () => {
      const wrapper = shallow(<CurrencyPicker {...defaultProps} />);
      const materialSelect = wrapper.find(MaterialSelect);

      expect(materialSelect.prop('value')).toBe('USD');
      expect(materialSelect.prop('readOnly')).toBe(false);
      expect(materialSelect.prop('disabled')).toBe(false);
      expect(materialSelect.prop('items')).toBeDefined();
    });

    it('should disable MaterialSelect when disabled is true', () => {
      const wrapper = shallow(<CurrencyPicker {...defaultProps} disabled={true} />);
      const materialSelect = wrapper.find(MaterialSelect);

      expect(materialSelect.prop('disabled')).toBe(true);
    });

    it('should set MaterialSelect as readOnly when readOnly is true', () => {
      const wrapper = shallow(<CurrencyPicker {...defaultProps} readOnly={true} />);
      const materialSelect = wrapper.find(MaterialSelect);

      expect(materialSelect.prop('readOnly')).toBe(true);
    });

    it('should call onChange with currency value when MaterialSelect changes', () => {
      const mockOnChange = jest.fn();
      const wrapper = shallow(<CurrencyPicker {...defaultProps} onChange={mockOnChange} />);
      const materialSelect = wrapper.find(MaterialSelect);

      const onSelected = materialSelect.prop('onSelected');
      onSelected({ value: 'GBP' });

      expect(mockOnChange).toHaveBeenCalledWith('currency', 'GBP');
    });

    it('should have correct arrow style when disabled is false', () => {
      const wrapper = shallow(<CurrencyPicker {...defaultProps} disabled={false} />);
      const materialSelect = wrapper.find(MaterialSelect);
      const arrowStyle = materialSelect.prop('arrowStyle');

      expect(arrowStyle.size).toBe(10);
      expect(arrowStyle.color).toBeDefined();
    });

    it('should have correct arrow style when disabled is true', () => {
      const wrapper = shallow(<CurrencyPicker {...defaultProps} disabled={true} />);
      const materialSelect = wrapper.find(MaterialSelect);
      const arrowStyle = materialSelect.prop('arrowStyle');

      expect(arrowStyle.size).toBe(10);
      expect(arrowStyle.color).toBeDefined();
    });
  });

  describe('isEnableReskinUI variations', () => {
    beforeEach(() => {
      mockUseEnableWebReskin.mockReturnValue({ isEnableReskin: false });
    });

    it('should apply extra props to MaterialSelect when isEnableReskinUI is true', () => {
      mockUsePaymentFreeTrialPageReskin.mockReturnValue({ isEnableReskinUI: true });
      const wrapper = shallow(<CurrencyPicker {...defaultProps} />);
      const materialSelect = wrapper.find(MaterialSelect);

      expect(materialSelect.prop('containerClasses')).toBe('CurrencyPicker__container');
      expect(materialSelect.prop('inputClasses')).toBe('CurrencyPicker__input');
      expect(materialSelect.prop('arrowIcon')).toBe('arrow-up');
    });

    it('should not apply extra props to MaterialSelect when isEnableReskinUI is false', () => {
      mockUsePaymentFreeTrialPageReskin.mockReturnValue({ isEnableReskinUI: false });
      const wrapper = shallow(<CurrencyPicker {...defaultProps} />);
      const materialSelect = wrapper.find(MaterialSelect);

      expect(materialSelect.prop('containerClasses')).toBeUndefined();
      expect(materialSelect.prop('inputClasses')).toBeUndefined();
      expect(materialSelect.prop('arrowIcon')).toBeUndefined();
    });

    it('should use correct arrow style with isEnableReskinUI and disabled', () => {
      mockUsePaymentFreeTrialPageReskin.mockReturnValue({ isEnableReskinUI: true });
      const wrapper = shallow(<CurrencyPicker {...defaultProps} disabled={true} />);
      const materialSelect = wrapper.find(MaterialSelect);
      const arrowStyle = materialSelect.prop('arrowStyle');

      expect(arrowStyle).toBeDefined();
      expect(arrowStyle.size).toBe(10);
    });

    it('should use correct arrow style with isEnableReskinUI and not disabled', () => {
      mockUsePaymentFreeTrialPageReskin.mockReturnValue({ isEnableReskinUI: true });
      const wrapper = shallow(<CurrencyPicker {...defaultProps} disabled={false} />);
      const materialSelect = wrapper.find(MaterialSelect);
      const arrowStyle = materialSelect.prop('arrowStyle');

      expect(arrowStyle).toBeDefined();
      expect(arrowStyle.size).toBe(10);
    });
  });

  describe('Currency data', () => {
    it('should format currencies correctly', () => {
      const wrapper = shallow(<CurrencyPicker {...defaultProps} />);
      const materialSelect = wrapper.find(MaterialSelect);
      const items = materialSelect.prop('items');

      expect(items).toBeDefined();
      expect(Array.isArray(items)).toBe(true);
      expect(items.length).toBeGreaterThan(0);
    });
  });

  describe('Translation', () => {
    it('should call translation function for currency label', () => {
      mockUseEnableWebReskin.mockReturnValue({ isEnableReskin: true });
      const mockT = jest.fn((key) => key);
      mockUseTranslation.mockReturnValue({ t: mockT });

      shallow(<CurrencyPicker {...defaultProps} />);

      expect(mockT).toHaveBeenCalledWith('freeTrialPage.currency');
    });

    it('should call translation function in non-reskin mode', () => {
      mockUseEnableWebReskin.mockReturnValue({ isEnableReskin: false });
      const mockT = jest.fn((key) => key);
      mockUseTranslation.mockReturnValue({ t: mockT });

      shallow(<CurrencyPicker {...defaultProps} />);

      expect(mockT).toHaveBeenCalledWith('freeTrialPage.currency');
    });
  });

  describe('Default props', () => {
    it('should use default onChange when not provided', () => {
      const { onChange, ...propsWithoutOnChange } = defaultProps;
      const wrapper = shallow(<CurrencyPicker {...propsWithoutOnChange} />);

      expect(wrapper).toBeDefined();
    });

    it('should use default disabled value when not provided', () => {
      const { disabled, ...propsWithoutDisabled } = defaultProps;
      const wrapper = shallow(<CurrencyPicker {...propsWithoutDisabled} />);

      expect(wrapper).toBeDefined();
    });

    it('should use default readOnly value when not provided', () => {
      const { readOnly, ...propsWithoutReadOnly } = defaultProps;
      const wrapper = shallow(<CurrencyPicker {...propsWithoutReadOnly} />);

      expect(wrapper).toBeDefined();
    });
  });

  describe('Snapshot tests', () => {
    it('should match snapshot with isEnableReskin = true', () => {
      mockUseEnableWebReskin.mockReturnValue({ isEnableReskin: true });
      const wrapper = shallow(<CurrencyPicker {...defaultProps} />);
      expect(wrapper).toMatchSnapshot();
    });

    it('should match snapshot with isEnableReskin = false', () => {
      mockUseEnableWebReskin.mockReturnValue({ isEnableReskin: false });
      const wrapper = shallow(<CurrencyPicker {...defaultProps} />);
      expect(wrapper).toMatchSnapshot();
    });

    it('should match snapshot with disabled = true', () => {
      mockUseEnableWebReskin.mockReturnValue({ isEnableReskin: false });
      const wrapper = shallow(<CurrencyPicker {...defaultProps} disabled={true} />);
      expect(wrapper).toMatchSnapshot();
    });

    it('should match snapshot with readOnly = true', () => {
      mockUseEnableWebReskin.mockReturnValue({ isEnableReskin: true });
      const wrapper = shallow(<CurrencyPicker {...defaultProps} readOnly={true} />);
      expect(wrapper).toMatchSnapshot();
    });

    it('should match snapshot with isEnableReskinUI = true', () => {
      mockUseEnableWebReskin.mockReturnValue({ isEnableReskin: false });
      mockUsePaymentFreeTrialPageReskin.mockReturnValue({ isEnableReskinUI: true });
      const wrapper = shallow(<CurrencyPicker {...defaultProps} />);
      expect(wrapper).toMatchSnapshot();
    });
  });
});
