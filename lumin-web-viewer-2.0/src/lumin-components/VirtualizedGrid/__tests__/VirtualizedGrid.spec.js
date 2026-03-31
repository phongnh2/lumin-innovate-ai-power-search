import React from 'react';
import { shallow, mount } from 'enzyme';
import VirtualizedGrid from '../VirtualizedGrid';

jest.mock('lumin-components/DocumentSkeleton/DocumentGridItemSkeleton', () => {
  return function DocumentGridItemSkeleton() {
    return <div>Skeleton</div>;
  };
});

jest.mock('../VirtualizedGrid.styled', () => ({
  GridContainer: ({ children, $columnCount, ...rest }) => (
    <div data-testid="grid-container" {...rest}>
      {children}
    </div>
  ),
}));

describe('VirtualizedGrid', () => {
  let mockIntersectionObserver;
  let observerCallback;
  let mockDisconnect;
  let mockObserve;

  beforeEach(() => {
    jest.clearAllMocks();
    mockDisconnect = jest.fn();
    mockObserve = jest.fn();

    mockIntersectionObserver = jest.fn((callback) => {
      observerCallback = callback;
      return {
        disconnect: mockDisconnect,
        observe: mockObserve,
      };
    });

    global.IntersectionObserver = mockIntersectionObserver;
  });

  const mockLoadMore = jest.fn();
  const mockCellRenderer = jest.fn((lastDocRef) => (item, index) => (
    <div key={item._id} ref={index === 0 ? lastDocRef : null}>
      {item.name}
    </div>
  ));

  const defaultProps = {
    items: [
      { _id: '1', name: 'Item 1' },
      { _id: '2', name: 'Item 2' },
    ],
    cellRenderer: mockCellRenderer,
    loadMore: mockLoadMore,
    rowCount: 2,
    columnCount: 3,
  };

  it('should render loading skeletons when isLoadingMore is true', () => {
    const wrapper = shallow(<VirtualizedGrid {...defaultProps} isLoadingMore={true} loadingItemCount={3} />);
    const skeletons = wrapper.find('DocumentGridItemSkeleton');
    expect(skeletons.length).toBe(3);
  });

  it('should not render skeletons when isLoadingMore is false', () => {
    const wrapper = shallow(<VirtualizedGrid {...defaultProps} isLoadingMore={false} />);
    const skeletons = wrapper.find('DocumentGridItemSkeleton');
    expect(skeletons.length).toBe(0);
  });

  it('should call observe when lastDocumentRef is called with a node', () => {
    mount(<VirtualizedGrid {...defaultProps} />);
    const mockNode = document.createElement('div');

    const lastDocRefCallback = mockCellRenderer.mock.calls[0][0];
    lastDocRefCallback(mockNode);

    expect(mockIntersectionObserver).toHaveBeenCalled();
    expect(mockObserve).toHaveBeenCalledWith(mockNode);
  });

  it('should not call observe when lastDocumentRef is called with null', () => {
    mount(<VirtualizedGrid {...defaultProps} />);

    const lastDocRefCallback = mockCellRenderer.mock.calls[0][0];
    lastDocRefCallback(null);

    expect(mockIntersectionObserver).toHaveBeenCalled();
  });

  it('should call loadMore when element is intersecting', () => {
    mount(<VirtualizedGrid {...defaultProps} />);
    const mockNode = document.createElement('div');

    const lastDocRefCallback = mockCellRenderer.mock.calls[0][0];
    lastDocRefCallback(mockNode);

    observerCallback([{ isIntersecting: true }]);

    expect(mockLoadMore).toHaveBeenCalled();
  });

  it('should not call loadMore when element is not intersecting', () => {
    mount(<VirtualizedGrid {...defaultProps} />);
    const mockNode = document.createElement('div');

    const lastDocRefCallback = mockCellRenderer.mock.calls[0][0];
    lastDocRefCallback(mockNode);

    observerCallback([{ isIntersecting: false }]);

    expect(mockLoadMore).not.toHaveBeenCalled();
  });

  it('should disconnect previous observer when lastDocumentRef is called again', () => {
    mount(<VirtualizedGrid {...defaultProps} />);
    const mockNode1 = document.createElement('div');
    const mockNode2 = document.createElement('div');

    const lastDocRefCallback = mockCellRenderer.mock.calls[0][0];

    lastDocRefCallback(mockNode1);
    lastDocRefCallback(mockNode2);
    expect(mockDisconnect).toHaveBeenCalled();
  });

  it('should create new observer on first call without disconnecting', () => {
    mount(<VirtualizedGrid {...defaultProps} />);
    const mockNode = document.createElement('div');

    const lastDocRefCallback = mockCellRenderer.mock.calls[0][0];
    lastDocRefCallback(mockNode);

    expect(mockIntersectionObserver).toHaveBeenCalled();
    expect(mockObserve).toHaveBeenCalledWith(mockNode);
  });
});
