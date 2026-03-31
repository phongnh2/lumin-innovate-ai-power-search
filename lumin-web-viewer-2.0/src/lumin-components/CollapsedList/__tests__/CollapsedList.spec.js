import React from 'react';
import { shallow } from 'enzyme';

import CollapsedList from '../CollapsedList';

let wrapper;
const onMockRenderHeader = jest.fn();

beforeEach(() => {
  const props = {
    children: <></>,
    renderHeader: onMockRenderHeader,
  };
  wrapper = shallow(<CollapsedList {...props} />);
});

describe('<CollapsedList />', () => {
  it('test snapshot', () => {
    expect(wrapper).toMatchSnapshot();
  });
  it('has the on toggle modal', () => {
    wrapper.setState({ open: !open });
    wrapper
      .find('.CollapsedList__header')
      .props()
      .onClick();
    expect(wrapper).toMatchSnapshot();
  });

  it('has the on toggle modal and selfControl', () => {
    wrapper.setState({ open: !open });
    wrapper.setProps({ selfControl: true });
    wrapper
      .find('.CollapsedList__header')
      .props()
      .onClick();
    expect(wrapper).toMatchSnapshot();
  });
});
