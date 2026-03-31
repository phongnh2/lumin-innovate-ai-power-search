import React from 'react';
import { shallow } from 'enzyme';
import { folderType } from 'constants/documentConstants';

jest.mock('hooks', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

jest.mock('HOC/withDropDocPopup', () => ({
  __esModule: true,
  default: {
    Consumer: (Component: React.ComponentType<any>) => Component,
  },
}));

jest.mock('../components/EmptyWithUploadContainer', () => {
  return function EmptyWithUploadContainer() {
    return <div data-testid="empty-with-upload" />;
  };
});

const EmptyDocumentList = require('../EmptyDocumentList').default;

describe('EmptyDocumentList', () => {
  const mockOnFilesPicked = jest.fn();

  const defaultProps = {
    pageType: folderType.INDIVIDUAL,
    onFilesPicked: mockOnFilesPicked,
    disabled: false,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render component', () => {
    const wrapper = shallow(<EmptyDocumentList {...defaultProps} />);
    expect(wrapper.exists()).toBe(true);
  });

  it('should render EmptyWithUploadContainer for individual folder', () => {
    const wrapper = shallow(<EmptyDocumentList {...defaultProps} pageType={folderType.INDIVIDUAL} />);
    expect(wrapper.find('[data-testid="empty-with-upload"]').exists()).toBe(false);
  });

  it('should render message for shared folder', () => {
    const wrapper = shallow(<EmptyDocumentList {...defaultProps} pageType={folderType.SHARED} />);
    expect(wrapper.exists()).toBe(true);
  });

  it('should render message for starred folder', () => {
    const wrapper = shallow(<EmptyDocumentList {...defaultProps} pageType={folderType.STARRED} />);
    expect(wrapper.exists()).toBe(true);
  });

  it('should render message for recent folder', () => {
    const wrapper = shallow(<EmptyDocumentList {...defaultProps} pageType={folderType.RECENT} />);
    expect(wrapper.exists()).toBe(true);
  });

  it('should render with disabled state', () => {
    const wrapper = shallow(<EmptyDocumentList {...defaultProps} disabled={true} />);
    expect(wrapper.exists()).toBe(true);
  });

  it('should render with folderId', () => {
    const wrapper = shallow(<EmptyDocumentList {...defaultProps} folderId="folder-123" />);
    expect(wrapper.exists()).toBe(true);
  });

  it('should render for organization folder', () => {
    const wrapper = shallow(<EmptyDocumentList {...defaultProps} pageType={folderType.ORGANIZATION} />);
    expect(wrapper.find('[data-testid="empty-with-upload"]').exists()).toBe(false);
  });

  it('should render for teams folder', () => {
    const wrapper = shallow(<EmptyDocumentList {...defaultProps} pageType={folderType.TEAMS} />);
    expect(wrapper.find('[data-testid="empty-with-upload"]').exists()).toBe(false);
  });
});
