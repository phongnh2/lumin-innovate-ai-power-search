import React from 'react';
import { shallow } from 'enzyme';
import core from 'core';
import Bookmark from '../Bookmark';

jest.mock('helpers/device', () => ({
  isMobile: jest.fn().mockReturnValueOnce(true)
    .mockReturnValueOnce(false),
  isWindow10: jest.fn().mockReturnValueOnce(true)
    .mockReturnValueOnce(false),
  getUserBrowserForAllDevices: jest.fn().mockReturnValueOnce('chrome'),
}));

core.gotoOutline = jest.fn();

core.getToolMode = jest.fn(() => ({
  name: ''
}));

describe('<Bookmark />', () => {
  const props = {
    bookmark: {
      children: [{}],
      name: 'test',
      getPageNumber: jest.fn().mockReturnValue(1),
      getHorizontalPosition: jest.fn(),
      getVerticalPosition: jest.fn(),
    },
    closeElement: jest.fn(),
    isVisible: true,
    activeBookmark: 1,
    setActiveBookmark: jest.fn(),
    isRootBookmark: true,
  };
  it('snapshot render', () => {
    const wrapper = shallow(<Bookmark {...props} />);
    expect(wrapper).toMatchSnapshot();
  });

  it('simulate click on title', () => {
    const wrapper = shallow(<Bookmark {...props} />);
    wrapper.find('.title').simulate('click');
    expect(props.setActiveBookmark).toBeCalled();
  });

  it('simulate click on title with', () => {
    const wrapper = shallow(<Bookmark {...props} />);
    wrapper.find('.title').simulate('click');
    expect(props.setActiveBookmark).toBeCalled();
  });

  it('simulate click on arrow', () => {
    const wrapper = shallow(<Bookmark {...props} />);
    wrapper.find('.arrow').simulate('click');
    expect(wrapper.state('isExpanded')).toBe(true);
  });

  it('simulate isVisible false', () => {
    const newProps = {
      ...props,
      isVisible: false,
    };
    const wrapper = shallow(<Bookmark {...newProps} />);
    expect(wrapper).toMatchSnapshot();
  });

  it('simulate isRootBookmark false', () => {
    const newProps = {
      ...props,
      isRootBookmark: false,
    };
    const wrapper = shallow(<Bookmark {...newProps} />);
    expect(wrapper).toMatchSnapshot();
  });

  it('simulate bookmark.getHorizontalPosition() && bookmark.getVerticalPosition() value', () => {
    const newProps = {
      ...props,
      bookmark: {
        ...props.bookmark,
        getHorizontalPosition: jest.fn().mockReturnValue(true),
        getVerticalPosition: jest.fn().mockReturnValue(true),
      },
    };
    const wrapper = shallow(<Bookmark {...newProps} />);
    wrapper.find('.title').simulate('click');
    expect(wrapper).toMatchSnapshot();
  });
});
