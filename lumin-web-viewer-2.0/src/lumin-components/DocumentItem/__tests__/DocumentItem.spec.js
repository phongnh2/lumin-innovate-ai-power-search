/* eslint-disable react/prop-types */
import React from 'react';
import { shallow } from 'enzyme';
import dayjs from 'dayjs';

import { layoutType } from 'constants/documentConstants';
import { STORAGE_TYPE } from 'constants/lumin-common';

jest.mock('lumin-components/ButtonMore', () => {
  return function ButtonMore(props) {
    return <div data-testid="button-more" {...props} />;
  };
});

jest.mock('lumin-components/Document/hooks/usePrefetchMoreOptions', () => ({
  __esModule: true,
  default: () => ({
    prefetchOptions: jest.fn(),
  }),
}));

jest.mock('luminComponents/ReskinLayout/components/DocumentGridItem', () => ({
  DocumentGridItem: jest.fn((props) => <div data-testid="document-grid-item" {...props} />),
}));

jest.mock('luminComponents/ReskinLayout/components/DocumentListItem', () => ({
  DocumentListItem: jest.fn((props) => <div data-testid="document-list-item" {...props} />),
}));

jest.mock('HOC/withRightClickDocument', () => ({
  __esModule: true,
  default: (Component) => Component,
}));

jest.mock('utils', () => ({
  bytesToSize: jest.fn((size) => `${size} bytes`),
  dateUtil: {
    formatMDYTime: jest.fn((date) => `formatted-${date}`),
  },
}));

import DocumentItem from '../DocumentItem';

describe('DocumentItem', () => {
  const mockContentPopper = jest.fn();
  const mockOnCheckboxChange = jest.fn();
  const mockOnClickDocument = jest.fn();
  const mockDragRef = jest.fn();

  const baseDocument = {
    _id: 'doc-123',
    name: 'Test Document.pdf',
    service: STORAGE_TYPE.LUMIN,
    createdAt: '1640000000000',
    lastAccess: '1650000000000',
    size: 1024,
    thumbnail: 'thumb.jpg',
    isOverTimeLimit: false,
  };

  const baseProps = {
    document: baseDocument,
    contentPopper: mockContentPopper,
    isDisabled: {
      selection: false,
      open: false,
      actions: false,
      drag: false,
    },
    type: layoutType.list,
    isSelected: false,
    onCheckboxChange: mockOnCheckboxChange,
    onClickDocument: mockOnClickDocument,
    dragRef: mockDragRef,
    isStarred: false,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should not add overTimeLimit when isOverTimeLimit is false', () => {
    const wrapper = shallow(<DocumentItem {...baseProps} />);
    const { document } = wrapper.props();

    expect(document.overTimeLimit).toBeUndefined();
  });

  it('should add overTimeLimit with plural years when over 2 years', () => {
    const twoYearsAgo = dayjs().subtract(2, 'year').valueOf().toString();
    const documentWithOverTime = {
      ...baseDocument,
      createdAt: twoYearsAgo,
      isOverTimeLimit: true,
    };

    const wrapper = shallow(<DocumentItem {...baseProps} document={documentWithOverTime} />);
    const { document } = wrapper.props();

    expect(document.overTimeLimit).toEqual({
      hasOver: true,
      title: 'Over 2 years',
    });
  });

  it('should add overTimeLimit with singular year when exactly 1 year', () => {
    const oneYearAgo = dayjs().subtract(1, 'year').valueOf().toString();
    const documentWithOverTime = {
      ...baseDocument,
      createdAt: oneYearAgo,
      isOverTimeLimit: true,
    };

    const wrapper = shallow(<DocumentItem {...baseProps} document={documentWithOverTime} />);
    const { document } = wrapper.props();

    expect(document.overTimeLimit).toEqual({
      hasOver: true,
      title: 'Over 1 year',
    });
  });

  it('should call onClickDocument when isDisabled.open is false', () => {
    const wrapper = shallow(<DocumentItem {...baseProps} />);

    wrapper.prop('onOpenDocument')();

    expect(mockOnClickDocument).toHaveBeenCalledTimes(1);
  });

  it('should not call onClickDocument when isDisabled.open is true', () => {
    const propsWithDisabledOpen = {
      ...baseProps,
      isDisabled: { ...baseProps.isDisabled, open: true },
    };
    const wrapper = shallow(<DocumentItem {...propsWithDisabledOpen} />);

    wrapper.prop('onOpenDocument')();

    expect(mockOnClickDocument).not.toHaveBeenCalled();
  });

  it('should render DocumentGridItem when type is grid', () => {
    const wrapper = shallow(<DocumentItem {...baseProps} type={layoutType.grid} />);
    const { DocumentGridItem } = require('luminComponents/ReskinLayout/components/DocumentGridItem');

    expect(wrapper.type()).toBe(DocumentGridItem);
  });
});
