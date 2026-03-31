/* eslint-disable */
import React from 'react';
import { shallow } from 'enzyme';
import { PASSWORD_COLOR } from 'utils/password';
import PasswordStrength from '../PasswordStrength';

describe('<PasswordStrength />', () => {
  describe('default snapshot', () => {
    it('should match snapshot', () => {
      const wrapper = shallow(<PasswordStrength />);
      expect(wrapper).toMatchSnapshot();
    });
  });

  describe('password strength is weak', () => {
    it('password color is var(--color-secondary-50)', () => {
      const password = '12312312';
      const wrapper = shallow(<PasswordStrength password={password} />);
      expect(wrapper.find('.PasswordStrength__bar').at(0).props().style.background).toBe('var(--color-secondary-50)');
      expect(wrapper).toMatchSnapshot();
    });
  });
  describe('password strength is medium', () => {
    it('password color is var(--color-warning-50)', () => {
      const password = 'dsv123123';
      const wrapper = shallow(<PasswordStrength password={password} />);
      expect(wrapper.find('.PasswordStrength__bar').at(1).props().style.background).toBe('var(--color-warning-50)');
      expect(wrapper).toMatchSnapshot();
    });
  });
  describe('password strength is strong', () => {
    it('password color is var(--color-success-50)', () => {
      const password = 'dsv123123K';
      const wrapper = shallow(<PasswordStrength password={password} />);
      expect(wrapper.find('.PasswordStrength__bar').at(2).props().style.background).toBe('var(--color-success-50)');
      expect(wrapper).toMatchSnapshot();
    });
  });
});
