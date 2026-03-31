import React from 'react';
import { mount } from 'enzyme';
import OverlayItem from '../OverlayItem';

describe('<InputForm />', () => {
  const props = {
    onClick: jest.fn(),
    buttonName: '',
  };
  it('OverlayItem render', () => {
    const wrapper = mount(<OverlayItem {...props} />);
    expect(wrapper).toMatchSnapshot();
  });
});
