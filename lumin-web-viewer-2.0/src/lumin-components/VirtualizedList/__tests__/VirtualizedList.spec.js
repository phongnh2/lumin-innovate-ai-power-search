import React from 'react';
import { mount } from 'enzyme';
import VirtualizedList from '../VirtualizedList';

describe('VirtualizedList', () => {
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
  const mockRowRenderer = jest.fn((lastDocRef) => (item, index) => (
    <div key={item._id} ref={index === 0 ? lastDocRef : null}>
      {item.name}
    </div>
  ));

  const defaultProps = {
    items: [
      { _id: '1', name: 'Item 1' },
      { _id: '2', name: 'Item 2' },
    ],
    rowRenderer: mockRowRenderer,
    loadMore: mockLoadMore,
    rowCount: 2,
  };

  it('should call observe when lastDocumentRef is called with a node', () => {
    mount(<VirtualizedList {...defaultProps} />);
    const mockNode = document.createElement('div');

    const lastDocRefCallback = mockRowRenderer.mock.calls[0][0];
    lastDocRefCallback(mockNode);

    expect(mockIntersectionObserver).toHaveBeenCalled();
    expect(mockObserve).toHaveBeenCalledWith(mockNode);
  });

  it('should not call observe when lastDocumentRef is called with null', () => {
    mount(<VirtualizedList {...defaultProps} />);

    const lastDocRefCallback = mockRowRenderer.mock.calls[0][0];
    lastDocRefCallback(null);

    expect(mockIntersectionObserver).toHaveBeenCalled();
  });

  it('should call loadMore when element is intersecting', () => {
    mount(<VirtualizedList {...defaultProps} />);
    const mockNode = document.createElement('div');

    const lastDocRefCallback = mockRowRenderer.mock.calls[0][0];
    lastDocRefCallback(mockNode);

    observerCallback([{ isIntersecting: true }]);

    expect(mockLoadMore).toHaveBeenCalled();
  });

  it('should not call loadMore when element is not intersecting', () => {
    mount(<VirtualizedList {...defaultProps} />);
    const mockNode = document.createElement('div');

    const lastDocRefCallback = mockRowRenderer.mock.calls[0][0];
    lastDocRefCallback(mockNode);

    observerCallback([{ isIntersecting: false }]);

    expect(mockLoadMore).not.toHaveBeenCalled();
  });

  it('should disconnect previous observer when lastDocumentRef is called again', () => {
    mount(<VirtualizedList {...defaultProps} />);
    const mockNode1 = document.createElement('div');
    const mockNode2 = document.createElement('div');

    const lastDocRefCallback = mockRowRenderer.mock.calls[0][0];

    lastDocRefCallback(mockNode1);
    lastDocRefCallback(mockNode2);

    expect(mockDisconnect).toHaveBeenCalled();
  });

  it('should create new observer on first call without disconnecting', () => {
    mount(<VirtualizedList {...defaultProps} />);
    const mockNode = document.createElement('div');

    const lastDocRefCallback = mockRowRenderer.mock.calls[0][0];
    lastDocRefCallback(mockNode);

    expect(mockIntersectionObserver).toHaveBeenCalled();
    expect(mockObserve).toHaveBeenCalledWith(mockNode);
  });
});
