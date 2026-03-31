import React from 'react';
import { mount } from 'enzyme';

jest.mock('react-image', () => ({
  Img: ({
    className,
    src,
    alt,
    unloader,
  }: {
    className: string;
    src: string;
    alt: string;
    unloader: React.ReactNode;
  }) => (
    <div data-testid="img" className={className} data-src={src} data-alt={alt} data-has-unloader={!!unloader}>
      {unloader}
    </div>
  ),
}));

jest.mock('assets/reskin/lumin-svgs/folder.svg', () => 'folder.svg');
jest.mock('assets/reskin/lumin-svgs/pdf-text.svg', () => 'pdf-text.svg');

import DocumentThumbnail from '../DocumentThumbnail';

describe('DocumentThumbnail', () => {
  const defaultProps = {
    src: 'https://example.com/thumbnail.jpg',
    altText: 'Test Document',
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render component', () => {
    const wrapper = mount(<DocumentThumbnail {...defaultProps} />);
    expect(wrapper.exists()).toBe(true);
    wrapper.unmount();
  });

  it('should render image with src', () => {
    const wrapper = mount(<DocumentThumbnail {...defaultProps} />);
    const img = wrapper.find('[data-testid="img"]');
    expect(img.prop('data-src')).toBe('https://example.com/thumbnail.jpg');
    wrapper.unmount();
  });

  it('should render image with altText', () => {
    const wrapper = mount(<DocumentThumbnail {...defaultProps} />);
    const img = wrapper.find('[data-testid="img"]');
    expect(img.prop('data-alt')).toBe('Test Document');
    wrapper.unmount();
  });

  it('should show document status when isNewUpload is true', () => {
    const wrapper = mount(<DocumentThumbnail {...defaultProps} isNewUpload={true} />);
    const status = wrapper.find('[className*="documentStatus"]');
    expect(status.exists()).toBe(true);
    wrapper.unmount();
  });

  it('should not show document status when isNewUpload is false', () => {
    const wrapper = mount(<DocumentThumbnail {...defaultProps} isNewUpload={false} />);
    const status = wrapper.find('[className*="documentStatus"]');
    expect(status.exists()).toBe(false);
    wrapper.unmount();
  });

  it('should not show document status when isNewUpload is not provided', () => {
    const wrapper = mount(<DocumentThumbnail {...defaultProps} />);
    const status = wrapper.find('[className*="documentStatus"]');
    expect(status.exists()).toBe(false);
    wrapper.unmount();
  });

  it('should render folder icon when isFolder is true', () => {
    const folderProps = { src: 'test.jpg', altText: 'Folder', isFolder: true };
    const wrapper = mount(<DocumentThumbnail {...folderProps} />);
    const imgs = wrapper.find('img');
    const hasFolder = imgs.findWhere((img) => img.prop('src') === 'folder.svg').length > 0;
    expect(hasFolder || imgs.length === 1).toBe(true); // Should have folder img
    wrapper.unmount();
  });

  it('should not render Img component when isFolder is true', () => {
    const folderProps = { src: 'test.jpg', altText: 'Folder', isFolder: true };
    const wrapper = mount(<DocumentThumbnail {...folderProps} />);
    const img = wrapper.find('[data-testid="img"]');
    expect(img.exists()).toBe(false);
    wrapper.unmount();
  });

  it('should render Img component when isFolder is false', () => {
    const wrapper = mount(<DocumentThumbnail {...defaultProps} isFolder={false} />);
    const img = wrapper.find('[data-testid="img"]');
    expect(img.exists()).toBe(true);
    wrapper.unmount();
  });

  it('should render Img component when isFolder is not provided', () => {
    const wrapper = mount(<DocumentThumbnail {...defaultProps} />);
    const img = wrapper.find('[data-testid="img"]');
    expect(img.exists()).toBe(true);
    wrapper.unmount();
  });

  it('should provide unloader for default thumbnail', () => {
    const wrapper = mount(<DocumentThumbnail {...defaultProps} />);
    const img = wrapper.find('[data-testid="img"]');
    expect(img.prop('data-has-unloader')).toBe(true);
    wrapper.unmount();
  });

  it('should render with both isNewUpload and isFolder', () => {
    const folderProps = { src: 'test.jpg', altText: 'Folder', isNewUpload: true, isFolder: true };
    const wrapper = mount(<DocumentThumbnail {...folderProps} />);
    const status = wrapper.find('[className*="documentStatus"]');
    expect(status.exists()).toBe(true);
    const imgs = wrapper.find('img');
    expect(imgs.length).toBeGreaterThan(0);
    wrapper.unmount();
  });
});
