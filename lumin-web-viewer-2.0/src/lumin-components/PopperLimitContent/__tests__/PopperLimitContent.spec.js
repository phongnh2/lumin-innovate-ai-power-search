/* eslint-disable */
import React from 'react';
import { shallow } from 'enzyme';
import { FEATURE_VALIDATION } from 'constants/lumin-common';
import PopperLimitContent from '../PopperLimitContent';

function setup(props) {
  const defaultProps = {
    icon: 'manipulation',
    type: FEATURE_VALIDATION.LIMIT_FEATURE,
  }
  const mergedProps = { ...defaultProps, ...props };
  const wrapper = shallow(<PopperLimitContent {...mergedProps} />)
  return {
    wrapper,
  }
}

describe('<PopperLimitContent />', () => {
  describe('snapshot render', () => {
    describe('render feature limited popper', () => {
      it('should match snapshot', () => {
        const { wrapper } = setup();
        expect(wrapper).toMatchSnapshot();
      });
    });

    describe('render signin required popper', () => {
      it('should match snapshot', () => {
        const { wrapper } = setup({ type: FEATURE_VALIDATION.SIGNIN_REQUIRED });
        expect(wrapper).toMatchSnapshot();
      });
    });

    describe('render permission required popper', () => {
      it('should match snapshot', () => {
        const { wrapper } = setup({ type: FEATURE_VALIDATION.PERMISSION_REQUIRED });
        expect(wrapper).toMatchSnapshot();
      });
    });

    describe('render premium feature popper', () => {
      it('should match snapshot', () => {
        const { wrapper } = setup({ type: FEATURE_VALIDATION.PREMIUM_FEATURE });
        expect(wrapper).toMatchSnapshot();
      });
    });

    describe('render null', () => {
      it('should match snapshot', () => {
        const { wrapper } = setup({ type: '' });
        expect(wrapper.isEmptyRender()).toBe(true);
      });
    });
  });
});
