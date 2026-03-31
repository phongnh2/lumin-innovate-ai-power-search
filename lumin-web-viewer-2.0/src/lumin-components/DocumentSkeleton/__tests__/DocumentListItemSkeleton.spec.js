import React from 'react';
import { shallow } from 'enzyme';
import DocumentListItemSkeleton from '../DocumentListItemSkeleton';

jest.mock('lumin-components/Shared/Skeleton', () => {
  return function Skeleton(props) {
    return <div data-testid="skeleton" {...props} />;
  };
});

jest.mock('hooks', () => ({
  useDesktopMatch: jest.fn(() => true),
}));

jest.mock('../DocumentSkeleton.styled', () => ({
  Container: ({ children }) => <div data-testid="container">{children}</div>,
  CommonInfoWrapper: ({ children }) => <div data-testid="common-info-wrapper">{children}</div>,
  SquareSkeleton: (props) => <div data-testid="square-skeleton" {...props} />,
}));

describe('DocumentListItemSkeleton', () => {
  it('should render component', () => {
    const wrapper = shallow(<DocumentListItemSkeleton />);
    expect(wrapper.exists()).toBe(true);
  });

  it('should render multiple skeleton elements', () => {
    const wrapper = shallow(<DocumentListItemSkeleton />);
    const skeletons = wrapper.find('Skeleton');
    expect(skeletons.length).toBeGreaterThan(0);
  });

  it('should render with desktop match', () => {
    const { useDesktopMatch } = require('hooks');
    useDesktopMatch.mockReturnValue(true);
    const wrapper = shallow(<DocumentListItemSkeleton />);
    expect(wrapper.exists()).toBe(true);
  });

  it('should render with mobile view', () => {
    const { useDesktopMatch } = require('hooks');
    useDesktopMatch.mockReturnValue(false);
    const wrapper = shallow(<DocumentListItemSkeleton />);
    expect(wrapper.exists()).toBe(true);
  });
});
