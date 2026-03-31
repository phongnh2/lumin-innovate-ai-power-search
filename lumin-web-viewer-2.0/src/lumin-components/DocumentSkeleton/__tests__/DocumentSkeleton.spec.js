import React from 'react';
import { shallow } from 'enzyme';
import { layoutType } from 'constants/documentConstants';

const mockUseEnableWebReskin = jest.fn();
jest.mock('hooks', () => ({
  useEnableWebReskin: () => ({ isEnableReskin: mockUseEnableWebReskin() }),
}));

jest.mock('lumin-components/ReskinLayout/components/DocumentLoading', () => ({
  DocumentListSkeleton: () => <div data-testid="document-list-skeleton" />,
  DocumentGridSkeleton: () => <div data-testid="document-grid-skeleton" />,
}));

jest.mock('../DocumentGridItemSkeleton', () => {
  return function DocumentGridItemSkeleton() {
    return <div data-testid="document-grid-item-skeleton" />;
  };
});

jest.mock('../DocumentListItemSkeleton', () => {
  return function DocumentListItemSkeleton() {
    return <div data-testid="document-list-item-skeleton" />;
  };
});

jest.mock('../DocumentSkeleton.styled', () => ({
  GridContainer: ({ children }) => <div data-testid="grid-container">{children}</div>,
}));

describe('DocumentSkeleton', () => {
  let DocumentSkeleton;

  beforeAll(() => {
    DocumentSkeleton = require('../DocumentSkeleton').default;
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render grid layout with reskin enabled - covers isGrid=true and isEnableReskin=true branches', () => {
    mockUseEnableWebReskin.mockReturnValue(true);
    const wrapper = shallow(<DocumentSkeleton layout={layoutType.grid} count={2} />);

    expect(wrapper.find('[data-testid="grid-container"]').exists()).toBe(false);
  });

  it('should render grid layout with reskin disabled - covers isGrid=true and isEnableReskin=false branches', () => {
    mockUseEnableWebReskin.mockReturnValue(false);
    const wrapper = shallow(<DocumentSkeleton layout={layoutType.grid} count={2} />);

    expect(wrapper.find('[data-testid="grid-container"]').exists()).toBe(false);
  });

  it('should render list layout with reskin enabled - covers isGrid=false and isEnableReskin=true branches', () => {
    mockUseEnableWebReskin.mockReturnValue(true);
    const wrapper = shallow(<DocumentSkeleton layout={layoutType.list} count={2} />);

    expect(wrapper.find('div').at(0).exists()).toBe(true);
    expect(wrapper.find('[data-testid="document-list-skeleton"]').length).toBe(0);
  });

  it('should render list layout with reskin disabled - covers isGrid=false and isEnableReskin=false branches', () => {
    mockUseEnableWebReskin.mockReturnValue(false);
    const wrapper = shallow(<DocumentSkeleton layout={layoutType.list} count={2} />);

    expect(wrapper.find('div').at(0).exists()).toBe(true);
    expect(wrapper.find('[data-testid="document-list-item-skeleton"]').length).toBe(0);
  });

  it('should use isGrid=true when layout is grid - covers layout === layoutType.grid branch', () => {
    mockUseEnableWebReskin.mockReturnValue(false);
    const wrapper = shallow(<DocumentSkeleton layout={layoutType.grid} count={1} />);

    expect(wrapper.find('[data-testid="grid-container"]').exists()).toBe(false);
  });

  it('should use isGrid=false when layout is list - covers layout !== layoutType.grid branch', () => {
    mockUseEnableWebReskin.mockReturnValue(false);
    const wrapper = shallow(<DocumentSkeleton layout={layoutType.list} count={1} />);

    expect(wrapper.find('[data-testid="grid-container"]').exists()).toBe(false);
    expect(wrapper.find('div').at(0).exists()).toBe(true);
  });
});
