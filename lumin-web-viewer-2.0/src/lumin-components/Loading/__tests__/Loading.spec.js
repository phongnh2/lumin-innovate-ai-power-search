import React from 'react';
import { shallow } from 'enzyme';
import Loading from '../Loading';

jest.mock('lottie-react', () => 'Lottie');

describe('<Loading />', () => {
  const props = {
    fullscreen: false,
    normal: false,
    className: '',
  };

  it('Loading render', () => {
    const wrapper = shallow(<Loading {...props} />);
    expect(wrapper).toMatchSnapshot();
  });

  it('Loading fullscreen true', () => {
    const newProps = {
      ...props,
      fullscreen: true,
      normal: true,
    };
    const wrapper = shallow(<Loading {...newProps} />);
    expect(wrapper).toMatchSnapshot();
  });
});