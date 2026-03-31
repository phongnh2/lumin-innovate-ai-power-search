import React from 'react';
import { shallow } from 'enzyme';
import LoadingModal from '../LoadingModal';

jest.mock('lottie-react', () => 'Lottie');

describe('<LoadingModal />', () => {
  const props = {
    isOpen: false,
    closeElements: () => jest.fn(),
    isDisabled: false,
    themeMode: 'light',
  };

  describe('componentDidUpdate', () => {
    it('isOpen true', () => {
      window.history.pushState( // add pathname simulate
        {},
        '',
        '/viewer/1231232',
      );
      const wrapper = shallow(<LoadingModal {...props} />);
      wrapper.setProps({ isOpen: true });
      expect(wrapper.instance().props.isOpen).toMatchSnapshot();
    });

    it('isOpen true with pathname not viewer', () => {
      window.history.pushState( // add pathname simulate
        {},
        '',
        '/',
      );
      const wrapper = shallow(<LoadingModal {...props} />);
      wrapper.setProps({ isOpen: true });
      expect(wrapper.instance().props.isOpen).toMatchSnapshot();
    });

    it('isOpen false', () => {
      const wrapper = shallow(<LoadingModal {...props} />);
      wrapper.setProps({ isOpen: false });
      expect(wrapper.instance().props.isOpen).toMatchSnapshot();
    });
  });

  it('snapshot render false', () => {
    const wrapper = shallow(<LoadingModal {...props} />);
    expect(wrapper).toMatchSnapshot();
  });

  it('snapshot render isDisabled', () => {
    const newProps = {
      ...props,
      isDisabled: true,
    };
    const wrapper = shallow(<LoadingModal {...newProps} />);
    expect(wrapper).toMatchSnapshot();
  });
});
