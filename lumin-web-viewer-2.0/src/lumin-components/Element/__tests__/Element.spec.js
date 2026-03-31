import React from 'react';
import { shallow } from 'enzyme';
import Element from '../Element';

describe('<Element />', () => {
  const props = {
    isDisabled: false,
    className: 'container',
    dataElement: 'dataElement',
    children: <div></div>
  };
  it('snapshot render', () => {
    const wrapper = shallow(
      <Element {...props} />
    );
    expect(wrapper).toMatchSnapshot();
  });
  it('snapshot if isDisabled true', () => {
    const newProps ={
      ...props,
      isDisabled: true
    };
    const wrapper = shallow(
      <Element {...newProps} />
    );
    expect(wrapper).toMatchSnapshot();
  });
});
