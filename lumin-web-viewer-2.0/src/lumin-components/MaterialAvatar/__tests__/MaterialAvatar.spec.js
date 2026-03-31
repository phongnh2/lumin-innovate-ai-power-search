import React from 'react';
import { shallow } from 'enzyme';
import MaterialAvatar from '../MaterialAvatar';

describe('<MaterialAvatar />', () => {
  const props = {
    src: '',
    size: 1,
    containerClasses: '',
    children: <></>,
    team: true,
    secondary: true,
  };

  it('MaterialAvatar render', () => {
    const wrapper = shallow(<MaterialAvatar {...props} />);
    expect(wrapper).toMatchSnapshot();
  });

  test('MaterialAvatar no childen', () => {
    const newProps = {
      ...props,
      size: 0,
      secondary: false,
      team: false,
      children: null,
    };
    const wrapper = shallow(<MaterialAvatar {...newProps} />);
    expect(wrapper).toMatchSnapshot();
  });

  test('MaterialAvatar no childen with team', () => {
    const newProps = {
      ...props,
      team: true,
      children: null,
    };
    const wrapper = shallow(<MaterialAvatar {...newProps} />);
    expect(wrapper).toMatchSnapshot();
  });
});
